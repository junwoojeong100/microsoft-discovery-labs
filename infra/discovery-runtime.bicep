targetScope = 'resourceGroup'

param location string = resourceGroup().location
param storageContainerName string
param registryName string
param toolName string
param imageDigest string

resource storageContainer 'Microsoft.Discovery/storageContainers@2026-06-01' existing = {
  name: storageContainerName
}

resource inputRoot 'Microsoft.Discovery/storageContainers/storageAssets@2026-06-01' = {
  parent: storageContainer
  name: 'labinputs'
  location: location
  properties: {
    path: 'discoveryinputs/'
    description: 'Original synthetic lab inputs, synchronized through the private Discovery runtime.'
  }
}

resource outputRoot 'Microsoft.Discovery/storageContainers/storageAssets@2026-06-01' = {
  parent: storageContainer
  name: 'runoutputs'
  location: location
  properties: {
    path: 'discoveryoutputs/compute/'
    description: 'Bounded synthetic ranking outputs from actual Discovery tool runs.'
  }
}

module tool './tool.bicep' = {
  name: 'discovery-korea-runtime-tool'
  params: {
    location: location
    registryName: registryName
    toolName: toolName
    imageDigest: imageDigest
  }
}

output toolId string = tool.outputs.toolId
output inputAssetId string = inputRoot.id
output outputAssetId string = outputRoot.id
