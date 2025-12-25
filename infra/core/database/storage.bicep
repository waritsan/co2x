metadata description = 'Creates an Azure Storage Account.'
param name string
param location string = resourceGroup().location
param tags object = {}

@allowed([
  'Standard_LRS'
  'Standard_GRS'
  'Standard_RAGRS'
  'Standard_ZRS'
  'Premium_LRS'
])
param sku string = 'Standard_LRS'

param kind string = 'StorageV2'
param accessTier string = 'Hot'

resource storage 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: replace(name, '-', '')
  location: location
  tags: tags
  kind: kind
  sku: {
    name: sku
  }
  properties: {
    accessTier: accessTier
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    defaultToOAuthAuthentication: false
    allowBlobPublicAccess: false
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Allow'
    }
  }
}

output id string = storage.id
output name string = storage.name
