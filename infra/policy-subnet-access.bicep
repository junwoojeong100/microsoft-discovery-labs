targetScope = 'resourceGroup'

@description('Existing virtual network containing the two Discovery compute subnets.')
param virtualNetworkName string

@description('Verified object ID of the existing Defender policy assignment managed identity.')
param policyPrincipalId string

var subnetNames = [
  'aksSubnet'
  'supercomputerNodepoolSubnet'
]

resource virtualNetwork 'Microsoft.Network/virtualNetworks@2024-05-01' existing = {
  name: virtualNetworkName
}

resource subnets 'Microsoft.Network/virtualNetworks/subnets@2024-05-01' existing = [for subnetName in subnetNames: {
  parent: virtualNetwork
  name: subnetName
}]

resource subnetJoiner 'Microsoft.Authorization/roleDefinitions@2022-04-01' = {
  name: guid(resourceGroup().id, 'Discovery Policy Subnet Read Join')
  properties: {
    roleName: 'Discovery Policy Subnet Read Join - ${resourceGroup().name}'
    description: 'Allows the existing Defender policy identity to read and join dedicated Discovery compute subnets.'
    type: 'CustomRole'
    permissions: [
      {
        actions: [
          'Microsoft.Network/virtualNetworks/subnets/read'
          'Microsoft.Network/virtualNetworks/subnets/join/action'
        ]
        notActions: []
        dataActions: []
        notDataActions: []
      }
    ]
    assignableScopes: [
      resourceGroup().id
    ]
  }
}

resource subnetAssignments 'Microsoft.Authorization/roleAssignments@2022-04-01' = [for (subnetName, index) in subnetNames: {
  name: guid(subnets[index].id, policyPrincipalId, subnetJoiner.id)
  scope: subnets[index]
  properties: {
    principalId: policyPrincipalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subnetJoiner.id
  }
}]

output roleDefinitionId string = subnetJoiner.id
output roleAssignmentIds array = [for (subnetName, index) in subnetNames: subnetAssignments[index].id]
