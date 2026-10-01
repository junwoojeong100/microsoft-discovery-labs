targetScope = 'subscription'

@description('Verified tenant object ID of the Discovery control-plane service App, not its application ID.')
param discoveryControlPlaneObjectId string

var readerRoleId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'acdd72a7-3385-48ef-bd42-f606fba81ae7')

resource perimeterJoiner 'Microsoft.Authorization/roleDefinitions@2022-04-01' = {
  name: guid(subscription().id, 'Discovery NSP Perimeter Joiner')
  properties: {
    roleName: 'Discovery NSP Perimeter Joiner'
    description: 'Allows the Microsoft Discovery control plane to join NSP inbound access rules.'
    type: 'CustomRole'
    permissions: [
      {
        actions: [
          'Microsoft.Network/networkSecurityPerimeters/joinPerimeterRule/action'
          'Microsoft.Network/locations/networkSecurityPerimeterOperationStatuses/read'
        ]
        notActions: []
        dataActions: []
        notDataActions: []
      }
    ]
    assignableScopes: [
      subscription().id
    ]
  }
}

resource joinerAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(subscription().id, discoveryControlPlaneObjectId, perimeterJoiner.id)
  properties: {
    principalId: discoveryControlPlaneObjectId
    principalType: 'ServicePrincipal'
    roleDefinitionId: perimeterJoiner.id
  }
}

resource readerAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(subscription().id, discoveryControlPlaneObjectId, readerRoleId)
  properties: {
    principalId: discoveryControlPlaneObjectId
    principalType: 'ServicePrincipal'
    roleDefinitionId: readerRoleId
  }
}

output perimeterJoinerRoleId string = perimeterJoiner.id
