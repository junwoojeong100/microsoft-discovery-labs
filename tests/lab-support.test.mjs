import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { discoveryGate, publicView, redact, safeArmUrl, selectAccount, validateConfig } from '../scripts/lab-support.mjs';

const config = JSON.parse(await readFile(new URL('../config/lab.json', import.meta.url), 'utf8'));

test('configuration is scoped to a dedicated lab', () => {
  validateConfig(config);
  assert.throws(() => validateConfig({ ...config, location: 'eastus2' }));
  assert.throws(() => validateConfig({ ...config, resourceGroup: 'production' }));
  assert.throws(() => validateConfig({ ...config, tenantId: '' }));
});

test('account selection never falls back to the default subscription', () => {
  const account = {
    id: config.subscriptionId, tenantId: config.tenantId, state: 'Enabled',
    environmentName: 'AzureCloud', user: { name: config.account.toLowerCase() },
  };
  assert.equal(selectAccount([account], config), account);
  assert.equal(selectAccount([{ ...account, environmentName: undefined, cloudName: 'AzureCloud' }], config).cloudName, 'AzureCloud');
  assert.throws(() => selectAccount([{ ...account, user: { name: 'other@example.com' } }], config));
  assert.throws(() => selectAccount([{ ...account, tenantId: 'other' }], config));
  assert.throws(() => selectAccount([{ ...account, state: 'Disabled' }], config));
  assert.throws(() => selectAccount([{ ...account, environmentName: undefined }], config));
  assert.throws(() => selectAccount([{ ...account, cloudName: 'AzureUSGovernment' }], config));
});

test('ARM URLs cannot escape the selected subscription or host', () => {
  const path = `/subscriptions/${config.subscriptionId}/providers/Microsoft.Discovery?api-version=2021-04-01`;
  assert.ok(safeArmUrl(path, config).startsWith('https://management.azure.com/'));
  for (const invalid of [
    'https://example.com/', '//example.com/', '/subscriptions/other/resources',
    `/subscriptions/${config.subscriptionId}/../../tenants`,
  ]) {
    assert.throws(() => safeArmUrl(invalid, config));
  }
});

test('redaction removes credentials in nested evidence', () => {
  const value = {
    accessToken: 'secret-value', nested: [{ Authorization: 'Bearer token-value' }],
    message: 'Bearer abc.def.ghi',
    link: 'https://example.com/blob?sig=signature-value&sv=version',
  };
  const result = JSON.stringify(redact(value));
  for (const secret of ['secret-value', 'token-value', 'abc.def.ghi', 'signature-value']) {
    assert.ok(!result.includes(secret));
  }
});

test('recorded display hides account and subscription identifiers', () => {
  const result = publicView(config, config);
  assert.ok(!result.includes(config.account));
  assert.ok(!result.includes(config.subscriptionId));
  assert.ok(!result.includes(config.tenantId));
});

test('Registered alone is insufficient for a successful Discovery gate', () => {
  const provider = { registrationState: 'Registered', resourceTypes: [{ resourceType: 'operations' }] };
  assert.equal(discoveryGate(provider, { status: 200 }).allowed, false);
  const ready = {
    registrationState: 'Registered',
    resourceTypes: ['workspaces', 'supercomputers', 'bookshelves'].map((resourceType) => ({ resourceType })),
  };
  assert.equal(discoveryGate(ready, { status: 403 }).allowed, false);
  assert.equal(discoveryGate(ready, { status: 200 }).allowed, true);
});

test('tool definition exposes only bounded CPU actions', async () => {
  const definition = JSON.parse(await readFile(new URL('../tools/thermal-ranking/tool-definition.template.json', import.meta.url)));
  assert.equal(definition.infra[0].compute.max_resources.gpu, 0);
  assert.equal(definition.infra[0].compute.pool_size, 1);
  assert.deepEqual(definition.actions.map((action) => action.name), ['rank_baseline', 'rank_cost_revision']);
  for (const action of definition.actions) {
    assert.equal(action.infra_node, definition.infra[0].name);
    assert.ok(!action.command.includes('{{'));
    assert.equal(action.output_mount_configurations[0].auto_promote, true);
  }
});

test('container context excludes authentication, evidence, and dependencies by default', async () => {
  const patterns = (await readFile(new URL('../.dockerignore', import.meta.url), 'utf8')).trim().split('\n');
  assert.equal(patterns[0], '**');
  assert.deepEqual(patterns.filter((line) => line.startsWith('!') && !line.endsWith('/')), [
    '!.dockerignore',
    '!scripts/score_materials.py',
    '!data/materials.csv',
    '!tools/thermal-ranking/Dockerfile',
  ]);
});
