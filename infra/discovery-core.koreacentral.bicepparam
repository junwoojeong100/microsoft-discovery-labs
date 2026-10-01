using './discovery-core.bicep'

param location = 'swedencentral'
param targetComputeLocation = 'koreacentral'
param skipAssociateKeyVaultToNsp = true
param identityName = 'id-discovery-hol-kc'
param virtualNetworkName = 'vnet-discovery-hol-kc'
param storageAccountName = 'stdiscoveryholjunwookc'
param supercomputerName = 'sc-discovery-hol-kc'
param workspaceName = 'discoveryholjunwookc'
param storageContainerName = 'thermaldata-kc'
param projectName = 'thermalhol'
param deployCompute = true
