targetScope = 'resourceGroup'

param location string
param targetComputeLocation string
param bookshelfName string
param identityName string
param virtualNetworkName string

@description('Required by the cross-region guide for Microsoft-owned subscriptions only.')
param skipAssociateKeyVaultToNsp bool = false

resource identity 'Microsoft.ManagedIdentity/userAssignedIdentities@2024-11-30' existing = {
  name: identityName
}

resource bookshelf 'Microsoft.Discovery/bookshelves@2026-06-01' = {
  name: bookshelfName
  location: location
  tags: union({
    environment: 'lab'
    project: 'microsoft-discovery-core-hol'
    NetworkIsolation: 'true'
    indexSize: 'small'
    'discovery.overridemrgregion': targetComputeLocation
  }, skipAssociateKeyVaultToNsp ? {
    SkipAssociateKeyVaultToNsp: 'true'
  } : {})
  properties: {
    workloadIdentities: {
      '${identity.id}': {}
    }
    customerManagedKeys: 'Disabled'
    publicNetworkAccess: 'Disabled'
    privateEndpointSubnetId: resourceId('Microsoft.Network/virtualNetworks/subnets', virtualNetworkName, 'bookshelfPeSubnet')
    searchSubnetId: resourceId('Microsoft.Network/virtualNetworks/subnets', virtualNetworkName, 'searchSubnet')
  }
}

output bookshelfId string = bookshelf.id
output bookshelfUri string = bookshelf.properties.bookshelfUri
output managedResourceGroup string = bookshelf.properties.managedResourceGroup
