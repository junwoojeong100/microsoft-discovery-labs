targetScope = 'resourceGroup'

param virtualNetworkName string = 'vnet-discovery-hol'

resource virtualNetwork 'Microsoft.Network/virtualNetworks@2024-05-01' existing = {
  name: virtualNetworkName
}

// Child-resource PUTs leave the three existing Workspace subnets untouched.
@batchSize(1)
resource computeSubnets 'Microsoft.Network/virtualNetworks/subnets@2024-05-01' = [for subnet in [
  {
    name: 'supercomputerNodepoolSubnet'
    prefix: '10.80.1.0/24'
  }
  {
    name: 'aksSubnet'
    prefix: '10.80.2.0/24'
  }
]: {
  parent: virtualNetwork
  name: subnet.name
  properties: {
    addressPrefix: subnet.prefix
    defaultOutboundAccess: false
    serviceEndpoints: [
      {
        service: 'Microsoft.Storage'
      }
    ]
  }
}]

resource searchSubnet 'Microsoft.Network/virtualNetworks/subnets@2024-05-01' = {
  parent: virtualNetwork
  name: 'searchSubnet'
  properties: {
    addressPrefix: '10.80.6.0/24'
    defaultOutboundAccess: false
    delegations: [
      {
        name: 'containerApps'
        properties: {
          serviceName: 'Microsoft.App/environments'
        }
      }
    ]
    serviceEndpoints: [
      {
        service: 'Microsoft.Storage'
      }
    ]
  }
  dependsOn: [
    computeSubnets
  ]
}

resource bookshelfPeSubnet 'Microsoft.Network/virtualNetworks/subnets@2024-05-01' = {
  parent: virtualNetwork
  name: 'bookshelfPeSubnet'
  properties: {
    addressPrefix: '10.80.7.0/24'
    defaultOutboundAccess: false
    privateEndpointNetworkPolicies: 'Enabled'
  }
  dependsOn: [
    searchSubnet
  ]
}
