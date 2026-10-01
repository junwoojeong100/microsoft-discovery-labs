targetScope = 'resourceGroup'

param location string = resourceGroup().location
param virtualNetworkName string = 'vnet-discovery-hol'
param storageAccountName string = 'stdiscoveryholjunwoosc'
param privateEndpointName string = 'pe-discovery-blob'
param virtualNetworkLinkName string = 'discovery-lab'

@description('Reuse a Blob private DNS zone only after verifying it is already linked to this VNet. Empty creates a lab-owned zone and link.')
param existingBlobPrivateDnsZoneId string = ''

resource virtualNetwork 'Microsoft.Network/virtualNetworks@2024-05-01' existing = {
  name: virtualNetworkName
}

resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' existing = {
  name: storageAccountName
}

resource subnet 'Microsoft.Network/virtualNetworks/subnets@2024-05-01' = {
  parent: virtualNetwork
  name: 'storagePeSubnet'
  properties: {
    addressPrefix: '10.80.8.0/24'
    defaultOutboundAccess: false
    privateEndpointNetworkPolicies: 'Enabled'
  }
}

resource endpoint 'Microsoft.Network/privateEndpoints@2024-05-01' = {
  name: privateEndpointName
  location: location
  tags: {
    environment: 'lab'
    project: 'microsoft-discovery-core-hol'
  }
  properties: {
    subnet: {
      id: subnet.id
    }
    privateLinkServiceConnections: [
      {
        name: 'discovery-blob'
        properties: {
          privateLinkServiceId: storage.id
          groupIds: [
            'blob'
          ]
        }
      }
    ]
  }
}

resource blobZone 'Microsoft.Network/privateDnsZones@2020-06-01' = if (empty(existingBlobPrivateDnsZoneId)) {
  name: 'privatelink.blob.${environment().suffixes.storage}'
  location: 'global'
  tags: {
    environment: 'lab'
    project: 'microsoft-discovery-core-hol'
  }
}

resource link 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = if (empty(existingBlobPrivateDnsZoneId)) {
  parent: blobZone
  name: virtualNetworkLinkName
  location: 'global'
  properties: {
    registrationEnabled: false
    virtualNetwork: {
      id: virtualNetwork.id
    }
  }
}

resource zoneGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2024-05-01' = {
  parent: endpoint
  name: 'blob'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'blob'
        properties: {
          privateDnsZoneId: empty(existingBlobPrivateDnsZoneId) ? blobZone!.id : existingBlobPrivateDnsZoneId
        }
      }
    ]
  }
}

output privateEndpointId string = endpoint.id
output blobHostname string = '${storageAccountName}.blob.${environment().suffixes.storage}'
