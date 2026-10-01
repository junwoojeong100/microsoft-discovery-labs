targetScope = 'resourceGroup'

param location string = resourceGroup().location
@description('Managed runtime region. Discovery resources themselves remain in the home location. Set the override when creating new resources, not to migrate existing ones.')
param targetComputeLocation string = location

@description('Required by the cross-region guide for Microsoft-owned subscriptions only.')
param skipAssociateKeyVaultToNsp bool = false

param identityName string = 'id-discovery-hol'
param virtualNetworkName string = 'vnet-discovery-hol'
param storageAccountName string = 'stdiscoveryholjunwoosc'
param supercomputerName string = 'sc-discovery-hol'
param workspaceName string = 'discoveryholjunwoosc'
param projectName string = 'thermalhol'
param storageContainerName string = 'thermaldata'

@description('False separates Workspace preparation from compute. It does not bypass regional capacity limits or complete the compute labs.')
param deployCompute bool = true

var tags = {
  environment: 'lab'
  project: 'microsoft-discovery-core-hol'
  NetworkIsolation: 'true'
}
var managedResourceTags = union(tags, targetComputeLocation == location ? {} : {
  'discovery.overridemrgregion': targetComputeLocation
}, skipAssociateKeyVaultToNsp ? {
  SkipAssociateKeyVaultToNsp: 'true'
} : {})

resource identity 'Microsoft.ManagedIdentity/userAssignedIdentities@2024-11-30' existing = {
  name: identityName
}

resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' existing = {
  name: storageAccountName
}

resource supercomputer 'Microsoft.Discovery/supercomputers@2026-06-01' = if (deployCompute) {
  name: supercomputerName
  location: location
  tags: managedResourceTags
  properties: {
    subnetId: resourceId('Microsoft.Network/virtualNetworks/subnets', virtualNetworkName, 'aksSubnet')
    systemSku: 'Standard_D4s_v6'
    outboundType: 'LoadBalancer'
    customerManagedKeys: 'Disabled'
    identities: {
      clusterIdentity: {
        id: identity.id
      }
      kubeletIdentity: {
        id: identity.id
      }
      workloadIdentities: {
        '${identity.id}': {}
      }
    }
  }
}

resource cpuPool 'Microsoft.Discovery/supercomputers/nodePools@2026-06-01' = if (deployCompute) {
  parent: supercomputer
  name: 'cpulab'
  location: location
  tags: tags
  properties: {
    subnetId: resourceId('Microsoft.Network/virtualNetworks/subnets', virtualNetworkName, 'supercomputerNodepoolSubnet')
    vmSize: 'Standard_D4s_v6'
    minNodeCount: 0
    maxNodeCount: 1
    scaleSetPriority: 'Regular'
  }
}

resource workspace 'Microsoft.Discovery/workspaces@2026-06-01' = {
  name: workspaceName
  location: location
  tags: managedResourceTags
  properties: {
    workspaceIdentity: {
      id: identity.id
    }
    supercomputerIds: deployCompute ? [
      supercomputer.id
    ] : []
    workspaceSubnetId: resourceId('Microsoft.Network/virtualNetworks/subnets', virtualNetworkName, 'workspaceSubnet')
    privateEndpointSubnetId: resourceId('Microsoft.Network/virtualNetworks/subnets', virtualNetworkName, 'privateEndpointSubnet')
    agentSubnetId: resourceId('Microsoft.Network/virtualNetworks/subnets', virtualNetworkName, 'agentSubnet')
    customerManagedKeys: 'Disabled'
    // Studio's authenticated endpoint is separate from managed-resource network isolation.
    publicNetworkAccess: 'Enabled'
  }
}

resource chatModel 'Microsoft.Discovery/workspaces/chatModelDeployments@2026-06-01' = {
  parent: workspace
  name: 'gpt-5-4'
  location: location
  properties: {
    modelFormat: 'OpenAI'
    modelName: 'gpt-5.4'
    modelVersion: '2026-03-05'
    skuName: 'GlobalStandard'
    capacity: 250
  }
}

resource data 'Microsoft.Discovery/storageContainers@2026-06-01' = {
  name: storageContainerName
  location: location
  properties: {
    storageStore: {
      kind: 'AzureStorageBlob'
      storageAccountId: storage.id
      mountProtocol: 'BlobfuseCaching'
    }
  }
}

resource assets 'Microsoft.Discovery/storageContainers/storageAssets@2026-06-01' = [for asset in [
  {
    name: 'evidencepack'
    path: 'discoveryinputs/bookshelf/'
    description: 'Four original synthetic evidence documents for the thermal materials lab.'
  }
  {
    name: 'candidatecsv'
    path: 'discoveryinputs/compute/materials.csv'
    description: 'Eight synthetic candidates with the authoritative GAMMA correction applied.'
  }
]: {
  parent: data
  name: asset.name
  location: location
  properties: {
    path: asset.path
    description: asset.description
  }
}]

resource project 'Microsoft.Discovery/workspaces/projects@2026-06-01' = {
  parent: workspace
  name: projectName
  location: location
  properties: {
    storageContainerIds: [
      data.id
    ]
  }
  dependsOn: [
    chatModel
  ]
}

output computeIncluded bool = deployCompute
output supercomputerId string? = deployCompute ? supercomputer.id : null
output nodepoolId string? = deployCompute ? cpuPool.id : null
output workspaceId string = workspace.id
output projectId string = project.id
output storageContainerId string = data.id
output workspaceApiUri string = workspace.properties.workspaceApiUri
output workspaceUiUri string = workspace.properties.workspaceUiUri
