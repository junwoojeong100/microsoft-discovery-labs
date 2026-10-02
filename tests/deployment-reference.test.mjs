import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const root = fileURLToPath(new URL('..', import.meta.url));
const directory = resolve(root, 'docs/deployment-reference');
const names = [
  'README.ko.md',
  '01-current-state.ko.md',
  '02-model-quota.ko.md',
  '03-compute-capacity.ko.md',
  '04-architecture-regions.ko.md',
  '05-network-identity-data.ko.md',
  '06-resume-runbook.ko.md',
];
const documents = Object.fromEntries(await Promise.all(names.map(async (name) => [
  name, await readFile(resolve(directory, name), 'utf8'),
])));
const config = JSON.parse(await readFile(resolve(root, 'config/lab.json'), 'utf8'));
const submissions = JSON.parse(await readFile(resolve(root, 'artifacts/discovery-model-quota-requests-20261001.json'), 'utf8'));

test('the topic index covers all dated Korean reference documents', async () => {
  assert.deepEqual((await readdir(directory)).filter((name) => name.endsWith('.md')).sort(), [...names].sort());
  for (const name of names.slice(1)) {
    assert.ok(documents['README.ko.md'].includes(`](${name})`), name);
  }
  for (const [name, text] of Object.entries(documents)) {
    assert.match(text, /\b20\d{2}-\d{2}-\d{2}\b/, `${name}: observation date`);
    assert.equal(/[\p{Script=Hiragana}\p{Script=Katakana}]/u.test(text), false, name);
    assert.equal(/\/Users\/|\/var\/folders\//.test(text), false, name);
    assert.equal(/[A-Z0-9._%+-]+@microsoft\.com/iu.test(text), false, `${name}: submitted contact email`);
    assert.equal(/-----BEGIN (?:OPENSSH |RSA |EC )?PRIVATE KEY-----/.test(text), false, name);
    assert.equal(/\beyJ[\w-]+\.[\w-]+\.[\w-]+/.test(text), false, name);
  }
  const state = documents['01-current-state.ko.md'];
  for (const field of ['subscriptionId', 'subscriptionName', 'tenantId', 'resourceGroup', 'location', 'labTag']) {
    assert.ok(state.includes(config[field]), field);
  }
});

test('reference links and images resolve without machine-specific paths', async () => {
  for (const [name, text] of Object.entries(documents)) {
    const links = [];
    marked.walkTokens(marked.lexer(text), (token) => {
      if (token.type === 'link' || token.type === 'image') links.push(token.href);
    });
    for (const href of links) {
      if (/^https?:/.test(href)) {
        new URL(href);
        continue;
      }
      assert.ok(!/^[a-z]+:/i.test(href), `${name}: unexpected URI ${href}`);
      const [path, hash] = href.split('#');
      const target = path ? resolve(dirname(resolve(directory, name)), decodeURIComponent(path)) : resolve(directory, name);
      await access(target);
      if (hash) {
        const source = await readFile(target, 'utf8');
        assert.ok(source.includes(`id="${decodeURIComponent(hash)}"`), `${name}: missing anchor ${href}`);
      }
    }
  }
});

test('quota arithmetic preserves existing allocations and the two submitted totals', () => {
  const text = documents['02-model-quota.ko.md'].replaceAll('`', '');
  const rows = [...text.matchAll(/^\| (gpt-5-mini|text-embedding-3-small) \| ([\d,]+) \| ([\d,]+) \| ([\d,]+) \| ([\d,]+) \| ([\d,]+) \|$/gm)];
  assert.equal(rows.length, 2);
  for (const [, model, ...values] of rows) {
    const [limit, allocated, remaining, increase, total] = values.map((value) => Number(value.replaceAll(',', '')));
    assert.equal(remaining, limit - allocated);
    assert.equal(total, allocated + 2000000);
    assert.equal(increase, total - limit);
    const request = submissions.requests.find((item) => item.model === model);
    assert.equal(request.observedLimitBeforeRequestTpm, limit);
    assert.equal(request.requestedTotalTpm, 3000000);
    assert.equal(request.formValue, 3000);
    const time = new Date(new Date(request.submitActionObservedAtUtc).getTime() + 9 * 3600000)
      .toISOString().slice(0, 19).replace('T', ' ');
    assert.ok(text.includes(time));
  }
  assert.ok(text.includes('생성 최소치와 운영 목표'));
  assert.ok(text.includes('Microsoft 승인·실제 한도 반영은 미확인'));
  assert.ok(text.includes('중복 제출 금지'));
});

test('the observed Bookshelf creation rejection is not mistaken for a 200k-ready deployment', async () => {
  const result = JSON.parse(await readFile(resolve(root, 'artifacts/discovery-bookshelf-create-result-20261002.json'), 'utf8'));
  assert.equal(result.armValidate, 'Succeeded');
  assert.equal(result.armWhatIf, 'Succeeded');
  assert.equal(result.deployment.state, 'Failed');
  assert.equal(result.documentedHowToMinimumTpm, 200000);
  assert.deepEqual(result.enforcedQuota.map(row => row.model).sort(), ['gpt-5-mini', 'text-embedding-3-small']);
  for (const row of result.enforcedQuota) {
    assert.equal(row.requiredCapacity, 2000);
    assert.equal(row.requiredAtCreationTpm, row.requiredCapacity * row.capacityUnitTpm);
    assert.equal(row.deficitTpm, row.requiredAtCreationTpm - row.availableTpm);
  }
  assert.deepEqual(result.postAttemptBookshelves, []);
  assert.deepEqual(result.postAttemptOwnedManagedResourceGroups, []);
  assert.equal(result.indexingStarted, false);
  assert.equal(result.searchStarted, false);
  assert.ok(documents['02-model-quota.ko.md'].includes('생성 단계부터'));
  assert.ok(documents['06-resume-runbook.ko.md'].includes('RequiredCapacity:2000'));
});

test('incident supplement distinguishes deployment causes from unrelated observations and labels', async () => {
  const supplement = JSON.parse(await readFile(resolve(root, 'artifacts/discovery-incident-supplement-20261002.json'), 'utf8'));
  assert.equal(supplement.validationModelRetry.errorCode, 'ParentResourceNotReady');
  assert.equal(supplement.validationModelRetry.filteredActivityFailures, 0);
  assert.equal(supplement.validationModelRetry.state, 'Failed');
  assert.equal(supplement.workspaceRetry.historicalSnapshot.state, 'Running');
  assert.equal(supplement.workspaceRetry.terminalLookup.state, 'Failed');
  assert.equal(supplement.workspaceRetry.terminalLookup.errorCode, 'Conflict');
  assert.equal(supplement.workspaceRetry.terminalLookup.errorTarget, 'containerAppsEnvironment');
  assert.equal(supplement.keyAccessObservation.count, 30);
  assert.equal(supplement.keyAccessObservation.matchedParentCorrelationCount, 0);
  assert.equal(supplement.keyAccessObservation.confirmedDeploymentRootCause, false);
  assert.ok(supplement.cognitionPreservation.requestMethods.every(method => method === 'GET'));
  assert.equal(supplement.cognitionPreservation.writeRequestSent, false);
  assert.equal(supplement.cognitionPreservation.beforeCapacity, supplement.cognitionPreservation.afterCapacity);
  assert.equal(supplement.cognitionPreservation.resetCauseEstablished, false);
  assert.deepEqual(supplement.partialRuntimeObservation.observedPoolNames, ['system']);
  assert.equal(supplement.partialRuntimeObservation.parentAndCpuPoolCompleteClaimed, false);
  for (const source of supplement.sourceEvidence) {
    assert.match(source.file, /^discovery-[a-z0-9-]+\.json$/);
    assert.match(source.sha256, /^[a-f0-9]{64}$/);
  }
  assert.ok(documents['05-network-identity-data.ko.md'].includes('배포 원인으로 미확정'));
});

test('current issue summary separates active blockers, verified recovery and dismissed alerts', async () => {
  const current = JSON.parse(await readFile(resolve(root, 'artifacts/discovery-current-issues-20261002.json'), 'utf8'));
  assert.deepEqual(current.bookshelves, []);
  assert.equal(current.koreaAks.state, 'Succeeded');
  assert.equal(current.koreaAks.policyAddonEnabled, true);
  assert.equal(current.addonPolicy[0].complianceState, 'Compliant');
  assert.equal(current.oldWorkspaceRetry.state, 'Failed');
  assert.equal(current.openDependencyAlertCount, 0);
  const alerts = current.dependencyAlerts.filter(alert => alert.package === 'lodash-es');
  assert.equal(alerts.length, 2);
  assert.ok(alerts.every(alert => alert.state === 'dismissed'
    && alert.dismissedReason === 'fix_started' && alert.fixedAt === null));
  assert.equal(current.lodashEs.lockedVersion, '4.17.23');
  assert.equal(current.lodashEs.patchVerified, false);
  for (const row of current.modelQuota) {
    assert.equal(row.availableTpm, row.limitTpm - row.allocatedTpm);
    assert.equal(row.creationDeficitTpm, Math.max(0, row.creationRequiredTpm - row.availableTpm));
  }
  for (const id of ['R01', 'R02', 'R03', 'R04', 'R05']) {
    assert.ok(documents['01-current-state.ko.md'].includes(`| ${id} `), id);
  }
  for (let number = 1; number <= 16; number++) {
    assert.ok(documents['README.ko.md'].includes(`| I${String(number).padStart(2, '0')} |`));
  }
  assert.ok(documents['README.ko.md'].includes('01-current-state.ko.md#open-issues'));
  assert.ok(!documents['README.ko.md'].includes('Workspace·Supercomputer·코어 배포 모두 `Failed`'));
});

test('new public incident projections exclude credentials, callers and machine-specific paths', async () => {
  for (const name of ['discovery-incident-supplement-20261002.json', 'discovery-current-issues-20261002.json']) {
    const text = await readFile(resolve(root, 'artifacts', name), 'utf8');
    assert.equal(/\/Users\/|\/var\/folders\/|@(?:microsoft\.com|[\w.-]*onmicrosoft\.com)/i.test(text), false, name);
    assert.equal(/"caller"\s*:|"accessToken"\s*:|"refreshToken"\s*:|"clientSecret"\s*:|"password"\s*:/i.test(text), false, name);
    assert.equal(/-----BEGIN (?:OPENSSH |RSA |EC )?PRIVATE KEY-----|\beyJ[\w-]+\.[\w-]+\.[\w-]+/.test(text), false, name);
  }
});

test('compute examples include system nodes and the retained client quota', () => {
  const text = documents['03-compute-capacity.ko.md'].replaceAll('`', '');
  const rows = [...text.matchAll(/^\| (Standard_([DE])(\d+)s_v6) \| (\d+) \| (\d+) \| (\d+) \| (\d+) \| (.+) \|$/gm)];
  assert.equal(rows.length, 6);
  for (const [, sku, family, size, cores, total, dFamily, eFamily] of rows) {
    const indexCores = Number(cores);
    assert.equal(indexCores, Number(size), sku);
    assert.equal(Number(total), 2 + 3 * 4 + 4 + indexCores, sku);
    assert.equal(Number(dFamily), 3 * 4 + 4 + (family === 'D' ? indexCores : 0), sku);
    assert.equal(Number(eFamily), family === 'E' ? indexCores : 0, sku);
  }
  assert.ok(text.includes('시스템 풀의 실제 노드 수는 미확인'));
  assert.ok(text.includes('S=3, C=1, I=1'));
  assert.ok(text.includes('102'));
  assert.ok(text.includes('아직 제출하지 않았다'));
});

test('all reference shell examples parse without performing Azure operations', () => {
  let count = 0;
  for (const [name, text] of Object.entries(documents)) {
    for (const [, source] of text.matchAll(/```bash\n([\s\S]*?)\n```/g)) {
      execFileSync('bash', ['-n'], { input: source, encoding: 'utf8' });
      assert.equal(/\baz\s+aks\s+list-usage\b|\baz\s+storage\s+account\s+list-skus\b/.test(source), false, name);
      assert.equal(/\baz\s+deployment\s+(?:group|sub)\s+create\b/.test(source), false, `${name}: expected preview-only deployment examples`);
      assert.equal(/\baz\s+group\s+delete\b/.test(source), false, name);
      count++;
    }
  }
  assert.ok(count >= 7);
});
