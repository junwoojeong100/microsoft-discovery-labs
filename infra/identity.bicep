targetScope = 'resourceGroup'

@description('User-assigned managed identity required by a Discovery workspace.')
param identityName string = 'id-discovery-hol'

@description('Region of the existing Discovery resource group.')
param location string = resourceGroup().location

resource identity 'Microsoft.ManagedIdentity/userAssignedIdentities@2024-11-30' = {
  name: identityName
  location: location
  tags: {
    environment: 'lab'
    project: 'microsoft-discovery-core-hol'
    deploymentScope: 'workspace-prerequisite'
  }
}

output identityId string = identity.id
output principalId string = identity.properties.principalId
