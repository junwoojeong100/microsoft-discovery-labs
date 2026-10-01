import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import {
  azJson, redact, selectAccount, validateConfig, validateLabResourceGroup,
} from './lab-support.mjs';

const root = new URL('../', import.meta.url);
const config = JSON.parse(await readFile(new URL('config/lab.json', root), 'utf8'));
validateConfig(config);
const vmName = 'vm-discovery-blob-client';
const storageAccount = 'stdiscoveryholjunwoosc';
const sources = [
  ['data/bookshelf/01_requirements.txt', 'discoveryinputs/bookshelf/01_requirements.txt'],
  ['data/bookshelf/02_candidate_catalog.txt', 'discoveryinputs/bookshelf/02_candidate_catalog.txt'],
  ['data/bookshelf/03_screening_results.txt', 'discoveryinputs/bookshelf/03_screening_results.txt'],
  ['data/bookshelf/04_revision_notes.txt', 'discoveryinputs/bookshelf/04_revision_notes.txt'],
  ['data/materials.csv', 'discoveryinputs/compute/materials.csv'],
];
const report = {
  startedAt: new Date().toISOString(), scope: config, vmName, storageAccount,
  outcome: 'in_progress', discoveryResearchExecuted: false,
};

try {
  selectAccount([await azJson(['account', 'show', '--subscription', config.subscriptionId])], config);
  validateLabResourceGroup(await azJson([
    'group', 'show', '--name', config.resourceGroup, '--subscription', config.subscriptionId,
  ]), config);
  const vm = await azJson([
    'vm', 'get-instance-view', '--name', vmName, '--resource-group', config.resourceGroup,
    '--subscription', config.subscriptionId,
  ]);
  if (!vm.instanceView?.statuses.some((item) => item.code === 'PowerState/running')) {
    throw new Error(`Start ${vmName} before running the private Blob client`);
  }
  const files = await Promise.all(sources.map(async ([source, path]) => {
    const content = await readFile(new URL(source, root));
    return {
      path, contentBase64: content.toString('base64'),
      sha256: createHash('sha256').update(content).digest('hex'),
      contentType: source.endsWith('.csv') ? 'text/csv' : 'text/plain; charset=utf-8',
    };
  }));
  const manifest = Buffer.from(JSON.stringify({
    storageAccount, privateSubnet: '10.80.8.0/24', files,
  })).toString('base64');
  const program = await readFile(new URL('scripts/private_blob_client.py', root), 'utf8');
  const script = `set -eu\nDISCOVERY_BLOB_MANIFEST='${manifest}' python3 - <<'DISCOVERY_PRIVATE_BLOB_PY'\n${program}\nDISCOVERY_PRIVATE_BLOB_PY\n`;
  const response = await azJson([
    'vm', 'run-command', 'invoke', '--name', vmName, '--resource-group', config.resourceGroup,
    '--subscription', config.subscriptionId, '--command-id', 'RunShellScript', '--scripts', script,
  ], { timeout: 600000 });
  const output = (response.value ?? []).map((item) => item.message ?? '').join('\n');
  const match = /^DISCOVERY_BLOB_RESULT=(.+)$/m.exec(output);
  if (!match) throw new Error(`Run Command returned no verified result: ${redact(output).slice(-3500)}`);
  const result = JSON.parse(match[1]);
  if (result.status !== 'verified' || result.files?.length !== files.length
      || files.some((file) => result.files.filter((item) =>
        item.path === file.path && item.sha256 === file.sha256 && item.readRequestId).length !== 1)) {
    throw new Error('VM result does not prove the complete source manifest was read back');
  }
  report.outcome = 'verified';
  report.result = result;
  report.authentication = 'VM system-assigned managed identity; no keys or SAS';
} catch (error) {
  report.outcome = 'error';
  report.error = redact(error.message);
  console.error(report.error);
  process.exitCode = 1;
}
report.completedAt = new Date().toISOString();
await writeFile(new URL('artifacts/discovery-private-blob-sync.json', root), JSON.stringify(redact(report), null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
