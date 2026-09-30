targetScope = 'resourceGroup'

@description('Azure region for the VNet.')
param location string

@description('Name of the VNet dedicated to one future Discovery workspace.')
param virtualNetworkName string

@description('Lab identification tags; subnets do not support tags.')
param tags object

// The full guide needs four additional subnets; this foundation intentionally creates only three.
resource virtualNetwork 'Microsoft.Network/virtualNetworks@2025-09-01' = {
  name: virtualNetworkName
  location: location
  tags: tags
  properties: {
    privateEndpointVNetPolicies: 'Disabled'
    addressSpace: {
      addressPrefixes: [
        '10.80.0.0/16'
      ]
    }
    subnets: [
      {
        name: 'workspaceSubnet'
        properties: {
          addressPrefix: '10.80.3.0/24'
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
      }
      {
        name: 'privateEndpointSubnet'
        properties: {
          addressPrefix: '10.80.4.0/24'
          defaultOutboundAccess: false
          privateEndpointNetworkPolicies: 'Enabled'
        }
      }
      {
        name: 'agentSubnet'
        properties: {
          addressPrefix: '10.80.5.0/24'
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
      }
    ]
  }
}

output virtualNetworkId string = virtualNetwork.id
output subnetIds object = {
  workspaceSubnet: resourceId('Microsoft.Network/virtualNetworks/subnets', virtualNetwork.name, 'workspaceSubnet')
  privateEndpointSubnet: resourceId('Microsoft.Network/virtualNetworks/subnets', virtualNetwork.name, 'privateEndpointSubnet')
  agentSubnet: resourceId('Microsoft.Network/virtualNetworks/subnets', virtualNetwork.name, 'agentSubnet')
}
