import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = (name) => readFile(new URL(`../infra/${name}`, import.meta.url), 'utf8');

test('the current configuration reuses the deployed lab resource group', async () => {
  const config = JSON.parse(await readFile(new URL('../config/lab.json', import.meta.url), 'utf8'));
  assert.ok((await source('main.bicepparam')).includes(`param resourceGroupName = '${config.resourceGroup}'`));
});

test('network expansion creates only the four missing child subnets', async () => {
  const text = await source('expand-network.bicep');
  assert.match(text, /resource virtualNetwork .+ existing =/);
  for (const name of ['supercomputerNodepoolSubnet', 'aksSubnet', 'searchSubnet', 'bookshelfPeSubnet']) {
    assert.ok(text.includes(`name: '${name}'`));
  }
  for (const name of ['workspaceSubnet', 'agentSubnet', 'privateEndpointSubnet']) {
    assert.ok(!text.includes(`name: '${name}'`), `Must not rewrite ${name}`);
  }
  assert.ok(text.includes('@batchSize(1)'));
});

test('storage explicitly complies with private-only policy and keeps Entra data access', async () => {
  const text = await source('lab-foundation.bicep');
  const storage = text.slice(text.indexOf('resource storage '), text.indexOf('resource blobs '));
  for (const setting of [
    "publicNetworkAccess: 'Disabled'", "defaultAction: 'Deny'",
    'allowSharedKeyAccess: false', 'allowBlobPublicAccess: false', 'ipRules: []',
  ]) assert.ok(storage.includes(setting));
  assert.ok(text.includes("scope: storage"));
  assert.ok(text.includes("scope: registry"));
  assert.ok(text.includes("scope: virtualNetwork"));
  assert.ok(text.includes("scope: identity"));
  assert.ok(!text.includes('clientIpv4Address'));
});

test('NSP custom role contains only the two documented actions', async () => {
  const text = await source('access.bicep');
  const actions = text.match(/actions: \[([\s\S]*?)\]/)[1].match(/'([^']+)'/g);
  assert.deepEqual(actions, [
    "'Microsoft.Network/networkSecurityPerimeters/joinPerimeterRule/action'",
    "'Microsoft.Network/locations/networkSecurityPerimeterOperationStatuses/read'",
  ]);
  assert.ok(text.includes('param discoveryControlPlaneObjectId string'));
});

test('policy addon access grants only subnet read and join on the two existing compute subnets', async () => {
  const text = await source('policy-subnet-access.bicep');
  const actions = text.match(/actions: \[([\s\S]*?)\]/)[1].match(/'([^']+)'/g);
  assert.deepEqual(actions, [
    "'Microsoft.Network/virtualNetworks/subnets/read'",
    "'Microsoft.Network/virtualNetworks/subnets/join/action'",
  ]);
  const subnets = text.match(/var subnetNames = \[([\s\S]*?)\]/)[1].match(/'([^']+)'/g);
  assert.deepEqual(subnets, ["'aksSubnet'", "'supercomputerNodepoolSubnet'"]);
  assert.match(text, /assignableScopes: \[\s+resourceGroup\(\)\.id\s+\]/);
  assert.match(text, /resource virtualNetwork .+ existing =/);
  assert.match(text, /resource subnets .+ existing =/);
  assert.ok(text.includes('scope: subnets[index]'));
  assert.ok(text.includes('principalId: policyPrincipalId'));
  assert.ok(text.includes("principalType: 'ServicePrincipal'"));
  assert.ok(!text.includes('subscription().id'));
  assert.ok(!text.includes('Microsoft.ContainerService/managedClusters'));
  const params = await source('policy-subnet-access.koreacentral.bicepparam');
  assert.ok(params.includes("param virtualNetworkName = 'vnet-discovery-hol-kc'"));
  assert.ok(params.includes("param policyPrincipalId = '02e03d89-915c-4be6-a882-ebde1beda2e4'"));
});

test('core preserves network isolation, a one-node CPU cap, and independent model naming', async () => {
  const text = await source('discovery-core.bicep');
  for (const setting of [
    "NetworkIsolation: 'true'", "outboundType: 'LoadBalancer'",
    'minNodeCount: 0', 'maxNodeCount: 1', "name: 'gpt-5-4'", "modelName: 'gpt-5.4'",
  ]) assert.ok(text.includes(setting));
  assert.ok(!text.includes('enableGhcpAiFeatures'));
  assert.ok(!text.includes('Microsoft.Discovery/bookshelves'));
  assert.ok(text.includes('param deployCompute bool = true'));
  assert.ok(text.includes('output computeIncluded bool = deployCompute'));
  assert.ok(text.includes('output supercomputerId string? = deployCompute ? supercomputer.id : null'));
});

test('Bookshelf creation is small, private and separate from indexing or existing model writes', async () => {
  const text = await source('bookshelf.bicep');
  const params = await source('bookshelf.koreacentral.bicepparam');
  const writableResources = [...text.matchAll(/^resource \w+ '([^']+)'(?! existing) =/gm)]
    .map(match => match[1]);
  assert.deepEqual(writableResources, ['Microsoft.Discovery/bookshelves@2026-06-01']);
  assert.match(text, /resource identity .+ existing =/);
  for (const setting of [
    "indexSize: 'small'", "NetworkIsolation: 'true'", "publicNetworkAccess: 'Disabled'",
    "'discovery.overridemrgregion': targetComputeLocation",
    "'bookshelfPeSubnet'", "'searchSubnet'", 'workloadIdentities:',
    'location: location',
  ]) assert.ok(text.includes(setting), setting);
  assert.ok(!/modelName:|modelVersion:|capacity:|startIndex|indexing|roleAssignments/.test(text));
  assert.ok(params.includes("param location = 'swedencentral'"));
  assert.ok(params.includes("param targetComputeLocation = 'koreacentral'"));
  assert.ok(params.includes("param bookshelfName = 'bks-discovery-hol-kc'"));
  assert.ok(params.includes("param virtualNetworkName = 'vnet-discovery-hol-kc'"));
  assert.ok(params.includes('param skipAssociateKeyVaultToNsp = true'));
});

test('the validation model pins the published version and a bounded non-provisioned allocation', async () => {
  const text = await source('discovery-core.bicep');
  const model = text.slice(text.indexOf('resource chatModel '), text.indexOf('resource data '));
  for (const setting of [
    "name: 'gpt-5-4'", "modelName: 'gpt-5.4'", "modelVersion: '2026-03-05'",
    "skuName: 'GlobalStandard'", 'capacity: 250',
  ]) assert.ok(model.includes(setting), setting);
  assert.ok(!model.includes('ProvisionedManaged'));
});

test('cross-region configuration keeps the home in Sweden and applies the runtime override at creation', async () => {
  const text = await source('discovery-core.bicep');
  const params = await source('discovery-core.koreacentral.bicepparam');
  const config = JSON.parse(await readFile(new URL('../config/lab.json', import.meta.url), 'utf8'));
  assert.equal(config.location, 'swedencentral');
  assert.equal(config.targetComputeLocation, 'koreacentral');
  assert.ok(params.includes("param location = 'swedencentral'"));
  assert.ok(params.includes("param targetComputeLocation = 'koreacentral'"));
  assert.ok(text.includes("'discovery.overridemrgregion': targetComputeLocation"));
  assert.ok(text.includes('param targetComputeLocation string = location'));
  for (const name of ['supercomputer', 'workspace']) {
    const match = text.match(new RegExp(`resource ${name} '[\\s\\S]*?\\n}\\n`));
    assert.ok(match, `Missing ${name} resource`);
    const resource = match[0];
    assert.ok(resource.includes('location: location'));
    assert.ok(resource.includes('tags: managedResourceTags'));
    assert.ok(!resource.includes('location: targetComputeLocation'));
  }
  assert.ok(params.includes("param supercomputerName = 'sc-discovery-hol-kc'"));
  assert.ok(params.includes("param workspaceName = 'discoveryholjunwookc'"));
  assert.ok(params.includes("param storageContainerName = 'thermaldata-kc'"));
  assert.ok(params.includes('param skipAssociateKeyVaultToNsp = true'));
});

test('cross-region support resources use the target and separate private endpoint names', async () => {
  const text = await source('cross-region-foundation.bicep');
  assert.equal((text.match(/location: targetComputeLocation/g) ?? []).length, 4);
  assert.ok(!text.includes('Microsoft.Resources/resourceGroups'));
  const params = await source('cross-region-foundation.bicepparam');
  assert.ok(params.includes("param privateEndpointName = 'pe-discovery-blob-kc'"));
  assert.ok(params.includes("param virtualNetworkLinkName = 'discovery-lab-kc'"));
  const privateAccess = await source('storage-private-access.bicep');
  assert.ok(privateAccess.includes('name: privateEndpointName'));
  assert.ok(privateAccess.includes('name: virtualNetworkLinkName'));
});

test('GA Tool uses properties.version and reuses the bounded definition with a digest', async () => {
  const text = await source('tool.bicep');
  assert.ok(text.includes("Microsoft.Discovery/tools@2026-06-01"));
  assert.ok(text.includes("loadJsonContent('../tools/thermal-ranking/tool-definition.template.json')"));
  assert.ok(text.includes("version: '1.0.0'"));
  assert.ok(text.includes('thermal-ranking@${imageDigest}'));
  assert.ok(!text.includes('definitionContentVersion'));
});

test('private Blob access uses a dedicated subnet and can reuse an existing DNS zone', async () => {
  const text = await source('storage-private-access.bicep');
  assert.ok(text.includes("name: 'storagePeSubnet'"));
  assert.ok(text.includes("addressPrefix: '10.80.8.0/24'"));
  assert.ok(text.includes("existingBlobPrivateDnsZoneId"));
  assert.ok(text.includes('registrationEnabled: false'));
  assert.ok(text.includes("'privatelink.blob.${environment().suffixes.storage}'"));
});

test('the private data client has no public ingress or shared Discovery identity', async () => {
  const text = await source('blob-client.bicep');
  assert.ok(text.includes("name: 'blobClientSubnet'"));
  assert.ok(text.includes("addressPrefix: '10.80.9.0/24'"));
  assert.ok(text.includes("direction: 'Inbound'"));
  assert.ok(text.includes("access: 'Deny'"));
  assert.ok(text.includes('defaultOutboundAccess: false'));
  assert.ok(text.includes("type: 'SystemAssigned'"));
  assert.ok(text.includes("scope: storage"));
  assert.ok(text.includes('disablePasswordAuthentication: true'));
  assert.ok(!text.includes('Microsoft.Network/publicIPAddresses'));
  assert.ok(!text.includes('publicIPAddress:'));
  assert.ok(!text.includes('adminPassword:'));
  assert.ok(!text.includes('id-discovery-hol'));
});
