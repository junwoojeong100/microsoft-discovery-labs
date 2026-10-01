using './bookshelf.bicep'

param location = 'swedencentral'
param targetComputeLocation = 'koreacentral'
param bookshelfName = 'bks-discovery-hol-kc'
param identityName = 'id-discovery-hol-kc'
param virtualNetworkName = 'vnet-discovery-hol-kc'
param skipAssociateKeyVaultToNsp = true
