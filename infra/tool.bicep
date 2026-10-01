targetScope = 'resourceGroup'

param location string = resourceGroup().location

@description('Verified ACR image digest, not a mutable tag.')
param imageDigest string

param registryName string = 'acrdiscoveryholjunwoosc'
param toolName string = 'thermal-ranking'

var template = loadJsonContent('../tools/thermal-ranking/tool-definition.template.json')
var definition = union(template, {
  name: toolName
  infra: [
    union(template.infra[0], {
      image: {
        acr: '${registryName}.azurecr.io/thermal-ranking@${imageDigest}'
      }
    })
  ]
})

resource tool 'Microsoft.Discovery/tools@2026-06-01' = {
  name: toolName
  location: location
  tags: {
    environment: 'lab'
    project: 'microsoft-discovery-core-hol'
  }
  properties: {
    definitionContent: definition
    version: '1.0.0'
  }
}

output toolId string = tool.id
