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
    assert.ok(text.includes('2026-10-01'), name);
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
