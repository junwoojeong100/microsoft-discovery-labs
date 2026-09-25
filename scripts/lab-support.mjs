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
  if (!/^rg-discovery-hol-[a-z0-9-]+$/.test(config.resourceGroup) || !config.labTag) {
    throw new Error('A dedicated, tagged Discovery lab resource group is required');
  }
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
  if (workspaceListing.status < 200 || workspaceListing.status >= 300) {
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
