import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import {
  assessModelQuotas, azJson, discoveryGate, modelRequirements, providerSummary,
  redact, safeArmUrl, selectAccount, targetComputeLocation, validateConfig,
} from './lab-support.mjs';

const root = new URL('../', import.meta.url);
const { values } = parseArgs({
  options: { require: { type: 'string', default: 'full' } },
});
if (!['core', 'full'].includes(values.require)) {
  throw new Error('--require must be core or full');
}
const config = JSON.parse(await readFile(new URL('config/lab.json', root), 'utf8'));
validateConfig(config);
const report = {
  checkedAt: new Date().toISOString(),
  scope: config,
  requiredPhase: values.require,
  operations: 'Read-only ARM GET; no resource or permission changes',
  outcome: 'in_progress',
  requests: [],
};

try {
  const account = await azJson(['account', 'show', '--subscription', config.subscriptionId]);
  selectAccount([account], config);
  const credential = await azJson([
    'account', 'get-access-token', '--subscription', config.subscriptionId,
    '--resource', 'https://management.azure.com/',
  ]);
  if (credential.tenant !== config.tenantId
      || credential.subscription !== config.subscriptionId || !credential.accessToken) {
    throw new Error('The ARM token does not match the configured subscription and tenant');
  }
  async function get(path, summarize = (body) => body) {
    const response = await fetch(safeArmUrl(path, config), {
      headers: { Authorization: `Bearer ${credential.accessToken}` },
      redirect: 'error',
      signal: AbortSignal.timeout(45000),
    });
    const body = await response.json();
    report.requests.push({
      method: 'GET', path, status: response.status,
      requestId: response.headers.get('x-ms-request-id'),
      response: redact(summarize(body)),
    });
    return { status: response.status, body };
  }
  function success(result, label) {
    if (result.status < 200 || result.status >= 300) {
      throw new Error(`${label}: HTTP ${result.status}; ${JSON.stringify(redact(result.body.error))}`);
    }
    return result.body;
  }

  const scope = `/subscriptions/${config.subscriptionId}`;
  const [providerResult, featuresResult, workspaces, usagesResult] = await Promise.all([
    get(`${scope}/providers/Microsoft.Discovery?api-version=2021-04-01`, providerSummary),
    get(`${scope}/providers/Microsoft.Features/providers/Microsoft.Discovery/features?api-version=2021-07-01`,
      (body) => body.error ? body : body.value.map((item) => ({ name: item.name, state: item.properties.state }))),
    get(`${scope}/providers/Microsoft.Discovery/workspaces?api-version=2026-06-01`,
      (body) => body.error ? body : { value: body.value.map((item) => ({ id: item.id, state: item.properties.provisioningState })) }),
    get(`${scope}/providers/Microsoft.CognitiveServices/locations/${targetComputeLocation(config)}/usages?api-version=2025-06-01`,
      (body) => body.error ? body : body.value.filter((item) =>
        modelRequirements.some(({ model }) => item.name.value === `OpenAI.GlobalStandard.${model}`))),
  ]);
  const provider = success(providerResult, 'Provider lookup');
  const features = success(featuresResult, 'Feature lookup');
  const usages = success(usagesResult, 'Model quota lookup');
  report.provider = providerSummary(provider);
  report.features = features.value.map((item) => ({ name: item.name, state: item.properties.state }));
  report.serviceAccess = discoveryGate(provider, workspaces);
  report.modelQuotas = assessModelQuotas(usages.value);
  report.gates = {
    coreAccessAndModelQuota: report.serviceAccess.allowed
      && report.modelQuotas.filter((item) => item.phase === 'core').every((item) => item.ready),
    bookshelfAccessAndModelQuota: report.serviceAccess.allowed
      && report.modelQuotas.every((item) => item.ready),
  };
  const passed = values.require === 'core'
    ? report.gates.coreAccessAndModelQuota : report.gates.bookshelfAccessAndModelQuota;
  report.outcome = passed ? 'access_and_model_quota_passed' : 'blocked';
  report.notVerified = [
    'Deployer and service RBAC propagation', 'Compute SKU capacity and quotas',
    'Network and Blob connectivity', 'Deployment success', 'Studio and end-to-end lab execution',
  ];
  process.exitCode = passed ? 0 : 2;
} catch (error) {
  report.outcome = 'error';
  report.error = redact(error.message);
  console.error(report.error);
  process.exitCode = 1;
}

report.completedAt = new Date().toISOString();
await mkdir(new URL('artifacts/', root), { recursive: true });
await writeFile(new URL('artifacts/discovery-readiness.json', root), JSON.stringify(redact(report), null, 2) + '\n');
console.log(JSON.stringify({
  outcome: report.outcome, gates: report.gates,
  modelQuotas: report.modelQuotas,
  evidence: 'artifacts/discovery-readiness.json',
}, null, 2));
