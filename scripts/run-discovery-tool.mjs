import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { parseArgs } from 'node:util';
import { setTimeout } from 'node:timers/promises';
import {
  azJson, redact, safeArmUrl, selectAccount, validateConfig,
} from './lab-support.mjs';

const root = new URL('../', import.meta.url);
const { values } = parseArgs({
  options: {
    phase: { type: 'string' },
    'run-id': { type: 'string' },
  },
});
if (!['sync-and-rank', 'verify-files'].includes(values.phase)
    || !/^lab-[a-z0-9-]{6,45}$/.test(values['run-id'] ?? '')) {
  throw new Error('Pass --phase sync-and-rank|verify-files and a unique --run-id lab-...');
}
const config = JSON.parse(await readFile(new URL('config/lab.json', root), 'utf8'));
validateConfig(config);
const runtime = config.runtime;
for (const key of ['workspaceName', 'projectName', 'supercomputerName', 'nodePoolName', 'toolName', 'storageContainerName']) {
  if (!/^[a-z][a-z0-9-]{2,63}$/.test(runtime?.[key] ?? '')) throw new Error(`Invalid runtime.${key}`);
}
selectAccount([await azJson(['account', 'show', '--subscription', config.subscriptionId])], config);
const groupId = `/subscriptions/${config.subscriptionId}/resourceGroups/${config.resourceGroup}`;
const workspaceId = `${groupId}/providers/Microsoft.Discovery/workspaces/${runtime.workspaceName}`;
const projectId = `${workspaceId}/projects/${runtime.projectName}`;
const project = await azJson(['rest', '--method', 'get', '--url', safeArmUrl(`${projectId}?api-version=2026-06-01`, config)]);
if (project.properties.provisioningState !== 'Succeeded') throw new Error('Project must be Succeeded before running a tool');
const workspace = await azJson(['rest', '--method', 'get', '--url', safeArmUrl(`${workspaceId}?api-version=2026-06-01`, config)]);
const endpoint = new URL(workspace.properties.workspaceApiUri);
assert.equal(endpoint.href, `https://${runtime.workspaceName}.workspace.discovery.azure.com/`);
const nodePoolId = `${groupId}/providers/Microsoft.Discovery/supercomputers/${runtime.supercomputerName}/nodePools/${runtime.nodePoolName}`;
const storageId = `${groupId}/providers/Microsoft.Discovery/storageContainers/${runtime.storageContainerName}`;
const files = [];
for (const [source, path] of [
  ['data/bookshelf/01_requirements.txt', 'bookshelf/01_requirements.txt'],
  ['data/bookshelf/02_candidate_catalog.txt', 'bookshelf/02_candidate_catalog.txt'],
  ['data/bookshelf/03_screening_results.txt', 'bookshelf/03_screening_results.txt'],
  ['data/bookshelf/04_revision_notes.txt', 'bookshelf/04_revision_notes.txt'],
  ['data/materials.csv', 'compute/materials.csv'],
]) {
  const content = await readFile(new URL(source, root));
  files.push({ path, contentBase64: content.toString('base64'), sha256: createHash('sha256').update(content).digest('hex') });
}
const inline = (mountPath, content) => ({ mountPath, encodedFile: gzipSync(content).toString('base64') });
const mounts = [
  { mountPath: '/labinputs', storageUri: `discovery://storageassets${storageId}/storageAssets/labinputs`, mountProtocol: 'BlobfuseCaching' },
  { mountPath: '/laboutputs', storageUri: `discovery://storageassets${storageId}/storageAssets/runoutputs/paths/${values['run-id']}`, mountProtocol: 'BlobfuseCaching' },
];
const payload = {
  toolId: `${groupId}/providers/Microsoft.Discovery/tools/${runtime.toolName}`,
  command: `sh -c 'gzip -dc /tmp/discovery-mounted-run.py.gz > /tmp/discovery-mounted-run.py && gzip -dc /tmp/discovery-manifest.json.gz > /tmp/discovery-manifest.json && python /tmp/discovery-mounted-run.py --manifest /tmp/discovery-manifest.json${values.phase === 'verify-files' ? ' --verify-only' : ''}'`,
  nodePoolIds: [nodePoolId],
  infraOverrides: { cpu: '1', ram: '2Gi', gpu: '0', maxCpu: '2', maxRam: '4Gi', maxGpu: '0', replicaCount: 1 },
  inlineFiles: [
    inline('/tmp/discovery-mounted-run.py.gz', await readFile(new URL('scripts/discovery_mounted_run.py', root))),
    inline('/tmp/discovery-manifest.json.gz', Buffer.from(JSON.stringify({ files }))),
  ],
  inputData: values.phase === 'verify-files' ? mounts : [],
  outputData: values.phase === 'sync-and-rank' ? mounts : [],
};
const report = {
  startedAt: new Date().toISOString(), phase: values.phase, runId: values['run-id'],
  endpoint: endpoint.origin, projectId, nodePoolId, apiVersion: '2026-06-01',
  payload, outcome: 'in_progress', observations: [],
};
const evidence = new URL(`artifacts/discovery-tool-${values['run-id']}-${values.phase}.json`, root);
await writeFile(evidence, JSON.stringify(redact(report), null, 2) + '\n', { flag: 'wx' });
let credential;
let obtainedAt = 0;
async function request(path, method = 'GET', body) {
  if (Date.now() - obtainedAt > 40 * 60 * 1000) {
    credential = await azJson(['account', 'get-access-token', '--subscription', config.subscriptionId, '--scope', 'https://discovery.azure.com/access_as_user']);
    if (credential.tenant !== config.tenantId || credential.subscription !== config.subscriptionId) {
      throw new Error('Discovery credential context mismatch');
    }
    obtainedAt = Date.now();
  }
  const url = new URL(path, endpoint);
  assert.equal(url.origin, endpoint.origin);
  url.searchParams.set('api-version', '2026-06-01');
  const response = await fetch(url, {
    method, body: body === undefined ? undefined : JSON.stringify(body),
    headers: { Authorization: `Bearer ${credential.accessToken}`, 'Content-Type': 'application/json' },
    redirect: 'error', signal: AbortSignal.timeout(60000),
  });
  const text = await response.text();
  const result = text ? JSON.parse(text) : {};
  report.observations.push({ at: new Date().toISOString(), method, path: url.pathname, httpStatus: response.status, state: result.status, requestId: response.headers.get('x-ms-request-id') });
  if (!response.ok) throw new Error(`Discovery ${method} ${url.pathname}: HTTP ${response.status}: ${JSON.stringify(redact(result))}`);
  return result;
}
try {
  const base = `/tools/projects/${runtime.projectName}`;
  const submitted = await request(`${base}:run`, 'POST', payload);
  if (!/^[a-zA-Z0-9-]{1,64}$/.test(submitted.id ?? '')) throw new Error('Unexpected tool operation ID');
  report.operationId = submitted.id;
  report.submission = submitted;
  await writeFile(evidence, JSON.stringify(redact(report), null, 2) + '\n');
  console.log(`Submitted ${values.phase}: ${submitted.id}`);
  const deadline = Date.now() + 30 * 60 * 1000;
  let result = submitted;
  while (['NotStarted', 'Running'].includes(result.status)) {
    if (Date.now() > deadline) {
      report.cancellation = await request(`${base}/operations/${submitted.id}:cancel`, 'POST', {});
      throw new Error('Tool exceeded the 30-minute lab limit; cancellation was requested for this operation only');
    }
    await setTimeout(30000);
    result = await request(`${base}/operations/${submitted.id}?logCount=2500`);
    report.lastResult = result;
    await writeFile(evidence, JSON.stringify(redact(report), null, 2) + '\n');
    console.log(`${new Date().toISOString()} ${result.status}: ${result.result?.runtimeDetails ?? ''}`);
  }
  assert.equal(result.status, 'Succeeded', JSON.stringify(redact(result)));
  const logs = result.result?.toolReport?.logs ?? '';
  const marker = /DISCOVERY_TOOL_RESULT=(\{[^\r\n]+\})/.exec(logs);
  if (!marker) throw new Error('Succeeded operation lacks the required input/output verification marker');
  report.verifiedData = JSON.parse(marker[1]);
  assert.equal(report.verifiedData.status, 'verified');
  assert.equal(report.verifiedData.verifyOnly, values.phase === 'verify-files');
  for (const file of files) {
    assert.equal(report.verifiedData.inputs.filter(item => item.path === file.path && item.sha256 === file.sha256).length, 1);
  }
  assert.equal(report.verifiedData.outputs.length, 2);
  report.outcome = 'verified';
} catch (error) {
  report.outcome = 'error';
  report.error = redact(error.message);
  console.error(report.error);
  process.exitCode = 1;
}
report.completedAt = new Date().toISOString();
await writeFile(evidence, JSON.stringify(redact(report), null, 2) + '\n');
console.log(JSON.stringify({ outcome: report.outcome, operationId: report.operationId, evidence: evidence.pathname }, null, 2));
