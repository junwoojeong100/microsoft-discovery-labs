targetScope = 'subscription'

@description('Name of the dedicated resource group for the network foundation.')
@minLength(1)
@maxLength(90)
param resourceGroupName string

@description('Discovery-supported region used by this lab.')
@allowed([
  'swedencentral'
])
param location string = 'swedencentral'

@description('Name of the VNet dedicated to one future Discovery workspace.')
@minLength(2)
@maxLength(64)
param virtualNetworkName string = 'vnet-discovery-hol'

var tags = {
  environment: 'lab'
  project: 'microsoft-discovery-core-hol'
  deploymentScope: 'network-foundation'
}

resource resourceGroup 'Microsoft.Resources/resourceGroups@2025-04-01' = {
  name: resourceGroupName
  location: location
  tags: tags
}

module network './modules/network.bicep' = {
  name: 'discovery-network'
  scope: resourceGroup
  params: {
    location: location
    virtualNetworkName: virtualNetworkName
    tags: tags
  }
}

output resourceGroupId string = resourceGroup.id
output virtualNetworkId string = network.outputs.virtualNetworkId
output subnetIds object = network.outputs.subnetIds
