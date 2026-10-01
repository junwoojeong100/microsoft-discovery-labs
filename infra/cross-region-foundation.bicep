targetScope = 'resourceGroup'

@description('Target runtime region; the existing resource group stays in the Discovery home region.')
param targetComputeLocation string
param virtualNetworkName string
param identityName string
param storageAccountName string
param registryName string
param privateEndpointName string
param virtualNetworkLinkName string
param administratorObjectId string

var tags = {
  environment: 'lab'
  project: 'microsoft-discovery-core-hol'
  deploymentScope: 'cross-region-foundation'
}

// Initial creation only: the network module must not overwrite subsequently added subnets.
module network './modules/network.bicep' = {
  name: 'discovery-korea-network'
  params: {
    location: targetComputeLocation
    virtualNetworkName: virtualNetworkName
    tags: tags
  }
}

module subnets './expand-network.bicep' = {
  name: 'discovery-korea-subnets'
  params: {
    virtualNetworkName: virtualNetworkName
  }
  dependsOn: [
    network
  ]
}

module identity './identity.bicep' = {
  name: 'discovery-korea-identity'
  params: {
    location: targetComputeLocation
    identityName: identityName
  }
}

module foundation './lab-foundation.bicep' = {
  name: 'discovery-korea-storage-registry'
  params: {
    location: targetComputeLocation
    virtualNetworkName: virtualNetworkName
    identityName: identityName
    storageAccountName: storageAccountName
    registryName: registryName
    administratorObjectId: administratorObjectId
  }
  dependsOn: [
    subnets
    identity
  ]
}

module privateAccess './storage-private-access.bicep' = {
  name: 'discovery-korea-private-storage'
  params: {
    location: targetComputeLocation
    virtualNetworkName: virtualNetworkName
    storageAccountName: storageAccountName
    privateEndpointName: privateEndpointName
    virtualNetworkLinkName: virtualNetworkLinkName
  }
  dependsOn: [
    foundation
  ]
}

output homeLocation string = resourceGroup().location
output targetLocation string = targetComputeLocation
output virtualNetworkId string = network.outputs.virtualNetworkId
output identityId string = identity.outputs.identityId
output storageAccountId string = foundation.outputs.storageAccountId
output registryId string = foundation.outputs.registryId
output privateEndpointId string = privateAccess.outputs.privateEndpointId
