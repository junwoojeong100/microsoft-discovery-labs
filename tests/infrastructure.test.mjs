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
