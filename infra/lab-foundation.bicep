targetScope = 'resourceGroup'

param location string = resourceGroup().location
param identityName string = 'id-discovery-hol'
param virtualNetworkName string = 'vnet-discovery-hol'
param storageAccountName string = 'stdiscoveryholjunwoosc'
param registryName string = 'acrdiscoveryholjunwoosc'

@description('Object ID of the signed-in lab administrator. Owner alone does not grant data-plane access.')
param administratorObjectId string

var tags = {
  environment: 'lab'
  project: 'microsoft-discovery-core-hol'
}
var blobContributorRoleId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'ba92f5b4-2d11-453d-a403-e96b0029c9fe')
var platformContributorRoleId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '01288891-85ee-45a7-b367-9db3b752fc65')
var platformAdministratorRoleId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7a2b6e6c-472e-4b39-8878-a26eb63d75c6')
var acrPullRoleId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d')
var networkContributorRoleId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4d97b98b-1d4f-4787-a291-c67834d212e7')
var identityOperatorRoleId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'f1a07417-d97a-45cb-824c-7a7467783830')
var storageSubnets = [
  'supercomputerNodepoolSubnet'
  'aksSubnet'
  'workspaceSubnet'
  'agentSubnet'
  'searchSubnet'
]

resource identity 'Microsoft.ManagedIdentity/userAssignedIdentities@2024-11-30' existing = {
  name: identityName
}

resource virtualNetwork 'Microsoft.Network/virtualNetworks@2024-05-01' existing = {
  name: virtualNetworkName
}

resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  tags: tags
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    allowSharedKeyAccess: false
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    publicNetworkAccess: 'Disabled'
    networkAcls: {
      defaultAction: 'Deny'
      bypass: 'AzureServices'
      ipRules: []
      virtualNetworkRules: [for subnet in storageSubnets: {
        id: resourceId('Microsoft.Network/virtualNetworks/subnets', virtualNetworkName, subnet)
        action: 'Allow'
      }]
    }
  }
}

resource blobs 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: storage
  name: 'default'
  properties: {
    cors: {
      corsRules: [
        {
          allowedOrigins: [
            'https://studio.discovery.microsoft.com'
            'https://vscode.dev'
            'https://*.vscode-cdn.net'
          ]
          allowedMethods: [
            'GET'
            'HEAD'
            'PUT'
            'DELETE'
            'OPTIONS'
          ]
          allowedHeaders: [
            '*'
          ]
          exposedHeaders: [
            '*'
          ]
          maxAgeInSeconds: 200
        }
      ]
    }
  }
}

resource containers 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = [for name in [
  'discoveryinputs'
  'discoveryoutputs'
]: {
  parent: blobs
  name: name
  properties: {
    publicAccess: 'None'
  }
}]

resource registry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: registryName
  location: location
  tags: tags
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: false
    publicNetworkAccess: 'Enabled'
  }
}

resource identityPlatformRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, identity.id, platformContributorRoleId)
  properties: {
    principalId: identity.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: platformContributorRoleId
  }
}

resource administratorPlatformRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, administratorObjectId, platformAdministratorRoleId)
  properties: {
    principalId: administratorObjectId
    principalType: 'User'
    roleDefinitionId: platformAdministratorRoleId
  }
}

resource identityStorageRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storage.id, identity.id, blobContributorRoleId)
  scope: storage
  properties: {
    principalId: identity.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: blobContributorRoleId
  }
}

resource administratorStorageRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storage.id, administratorObjectId, blobContributorRoleId)
  scope: storage
  properties: {
    principalId: administratorObjectId
    principalType: 'User'
    roleDefinitionId: blobContributorRoleId
  }
}

resource identityRegistryRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(registry.id, identity.id, acrPullRoleId)
  scope: registry
  properties: {
    principalId: identity.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: acrPullRoleId
  }
}

resource identityNetworkRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(virtualNetwork.id, identity.id, networkContributorRoleId)
  scope: virtualNetwork
  properties: {
    principalId: identity.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: networkContributorRoleId
  }
}

resource identityOperatorRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(identity.id, identityOperatorRoleId)
  scope: identity
  properties: {
    principalId: identity.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: identityOperatorRoleId
  }
}

output storageAccountId string = storage.id
output registryId string = registry.id
output registryLoginServer string = registry.properties.loginServer
