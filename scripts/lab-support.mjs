import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);

export async function azJson(args, { timeout = 90000 } = {}) {
  try {
    const { stdout } = await exec('az', [...args, '--output', 'json', '--only-show-errors'], {
      encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout,
      env: { ...process.env, AZURE_CORE_CONNECTION_TIMEOUT: '15' },
    });
    return JSON.parse(stdout);
  } catch (error) {
    throw new Error(`Azure CLI ${args.slice(0, 2).join(' ')} failed: ${redact(String(error.stderr || error.message)).slice(0, 1400)}`);
  }
}

export function validateConfig(config) {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuid.test(config.subscriptionId) || !uuid.test(config.tenantId)) {
    throw new Error('An explicit subscription and tenant UUID are required');
  }
  if (typeof config.account !== 'string' || !config.account.includes('@')) {
    throw new Error('An explicit account UPN is required');
  }
  if (!['eastus', 'swedencentral', 'uksouth'].includes(config.location)) {
    throw new Error('Use a documented production Discovery region');
  }
  if (config.targetComputeLocation !== undefined
      && (typeof config.targetComputeLocation !== 'string'
        || !/^[a-z][a-z0-9]{1,62}$/.test(config.targetComputeLocation))) {
    throw new Error('Target compute location must be an Azure programmatic region identifier');
  }
  if (!/^rg-discovery-hol-[a-z0-9-]+$/.test(config.resourceGroup) || !config.labTag) {
    throw new Error('A dedicated, tagged Discovery lab resource group is required');
  }
}

export function targetComputeLocation(config) {
  return config.targetComputeLocation ?? config.location;
}

export function selectAccount(accounts, config) {
  const account = accounts.find((item) =>
    item.id === config.subscriptionId
    && item.tenantId === config.tenantId
    && item.user?.name?.toLowerCase() === config.account.toLowerCase()
    && item.state === 'Enabled',
  );
  if (!account) {
    throw new Error('Requested account, tenant, and enabled subscription do not match the Azure CLI session');
  }
  if ((account.cloudName ?? account.environmentName) !== 'AzureCloud') {
    throw new Error('This lab only supports the Azure public cloud');
  }
  return account;
}

export function validateLabResourceGroup(group, config) {
  const expectedId = `/subscriptions/${config.subscriptionId}/resourceGroups/${config.resourceGroup}`;
  const tagged = group.tags?.lab === config.labTag
    || group.tags?.project === config.labTag && group.tags?.environment === 'lab';
  if (group.id?.toLowerCase() !== expectedId.toLowerCase()
      || group.location !== config.location || !tagged) {
    throw new Error('Existing resource group does not match this lab scope, region, and ownership tags');
  }
}

export function safeArmUrl(path, config) {
  const prefix = `/subscriptions/${config.subscriptionId}`;
  if (!path.startsWith(`${prefix}/`) && !path.startsWith(`${prefix}?`)) {
    throw new Error('Request is outside the configured subscription');
  }
  const url = new URL(path, 'https://management.azure.com');
  if (url.origin !== 'https://management.azure.com'
      || !url.pathname.startsWith(`${prefix}/`) && url.pathname !== prefix) {
    throw new Error('Request does not target the expected ARM subscription');
  }
  return url.href;
}

export function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      key,
      /^(authorization|cookie|set-cookie|access.?token|refresh.?token|id.?token|password|client.?secret|account.?key|sas.?token)$/i.test(key)
        ? '[REDACTED]' : redact(item),
    ]));
  }
  if (typeof value === 'string') {
    return value
      .replace(/\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi, 'Bearer [REDACTED]')
      .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[REDACTED JWT]')
      .replace(/([?&](?:sig|client_secret|access_token)=)[^&\s]+/gi, '$1[REDACTED]');
  }
  return value;
}

export function publicView(value, config) {
  let text = JSON.stringify(redact(value), null, 2);
  for (const field of ['account', 'subscriptionId', 'subscriptionName', 'tenantId']) {
    if (config[field]) text = text.replaceAll(config[field], `[${field}]`);
  }
  return text;
}

export function discoveryGate(provider, workspaceListing) {
  const types = new Set((provider.resourceTypes ?? []).map((item) => item.resourceType.toLowerCase()));
  const required = ['workspaces', 'supercomputers', 'bookshelves'];
  const missing = required.filter((type) => !types.has(type));
  if (!Number.isInteger(workspaceListing.status)
      || workspaceListing.status < 200 || workspaceListing.status >= 300) {
    return { allowed: false, reason: 'Discovery workspace API did not authorize a successful listing', missing };
  }
  if (provider.registrationState !== 'Registered' || missing.length) {
    return { allowed: false, reason: 'Discovery registration or required resource-type visibility is incomplete', missing };
  }
  return { allowed: true, reason: 'Provider gate passed; quota, IAM, networking, and Studio login still require validation', missing };
}

export function providerSummary(body) {
  return {
    namespace: body.namespace,
    registrationState: body.registrationState,
    resourceTypes: (body.resourceTypes ?? []).map((item) => item.resourceType),
    error: body.error,
  };
}

export const modelRequirements = [
  { model: 'gpt-5.4', phase: 'core', requiredTpm: 500000 },
  { model: 'gpt-5.2', phase: 'bookshelf', requiredTpm: 200000 },
  { model: 'gpt-5-mini', phase: 'bookshelf', requiredTpm: 2000000 },
  { model: 'text-embedding-3-small', phase: 'bookshelf', requiredTpm: 2000000 },
];

export function assessModelQuotas(usages) {
  return modelRequirements.map((requirement) => {
    const metric = `OpenAI.GlobalStandard.${requirement.model}`;
    const usage = usages.find((item) => item.name?.value === metric);
    const known = usage && /thousand/i.test(usage.name.localizedValue ?? '')
      && Number.isFinite(usage.limit) && usage.limit >= 0
      && Number.isFinite(usage.currentValue) && usage.currentValue >= 0;
    if (!known) {
      return {
        ...requirement, metric, ready: false, availableTpm: null,
        reason: 'Quota is missing or its TPM unit could not be verified',
      };
    }
    const availableTpm = (usage.limit - usage.currentValue) * 1000;
    return {
      ...requirement, metric, limitTpm: usage.limit * 1000,
      allocatedTpm: usage.currentValue * 1000, availableTpm,
      ready: availableTpm >= requirement.requiredTpm,
      reason: availableTpm >= requirement.requiredTpm
        ? 'Sufficient unallocated Global Standard TPM'
        : 'Insufficient unallocated Global Standard TPM',
    };
  });
}
