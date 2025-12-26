targetScope = 'subscription'

// The main bicep module to provision Azure resources.
// For a more complete walkthrough to understand how this file works with azd,
// see https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/make-azd-compatible?pivots=azd-create

@minLength(1)
@maxLength(64)
@description('Name of the the environment which is used to generate a short unique hash used in all resources.')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

// Optional parameters to override the default azd resource naming conventions.
// Add the following to main.parameters.json to provide values:
// "resourceGroupName": {
//      "value": "myGroupName"
// }
param resourceGroupName string = ''

var abbrs = loadJsonContent('./abbreviations.json')

// tags that should be applied to all resources.
var tags = {
  // Tag all resources with the environment name.
  'azd-env-name': environmentName
}

// Generate a unique token to be used in naming resources.
// Remove linter suppression after using.
#disable-next-line no-unused-vars
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))

// Name of the service defined in azure.yaml
// A tag named azd-service-name with this value should be applied to the service host resource, such as:
//   Microsoft.Web/sites for appservice, function
// Example usage:
//   tags: union(tags, { 'azd-service-name': apiServiceName })
var apiServiceName = 'api'
var webServiceName = 'web'

// Organize resources in a resource group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: !empty(resourceGroupName) ? resourceGroupName : '${abbrs.resourcesResourceGroups}${environmentName}'
  location: location
  tags: tags
}

// Add resources to be provisioned below.
// A full example that leverages azd bicep modules can be seen in the todo-python-mongo template:
// https://github.com/Azure-Samples/todo-python-mongo/tree/main/infra

module staticwebapp './core/host/staticwebapp.bicep' = {
  name: 'staticwebapp'
  scope: rg
  params: {
    name: '${abbrs.webStaticSites}${environmentName}'
    location: 'eastasia'
    tags: union(tags, { 'azd-service-name': webServiceName })
  }
}

// App Service Plan for Functions (Consumption tier - serverless)
module appServicePlan './core/host/appserviceplan.bicep' = {
  name: 'appserviceplan'
  scope: rg
  params: {
    name: '${abbrs.webServerFarms}${environmentName}'
    location: location
    sku: {
      name: 'Y1'
      tier: 'Dynamic'
    }
    kind: 'functionapp'
    reserved: true
    tags: tags
  }
}

// Storage Account for Function App
module storage './core/database/storage.bicep' = {
  name: 'storage'
  scope: rg
  params: {
    name: '${abbrs.storageStorageAccounts}${resourceToken}'
    location: location
    tags: tags
  }
}

// Azure Function App for API (serverless)
module functionApp './core/host/functions.bicep' = {
  name: 'functionapp'
  scope: rg
  params: {
    name: '${abbrs.webSitesFunctions}${environmentName}'
    location: location
    tags: union(tags, { 'azd-service-name': apiServiceName })
    appServicePlanId: appServicePlan.outputs.id
    storageAccountName: storage.outputs.name
    runtimeName: 'node'
    runtimeVersion: '20'
    extensionVersion: '~4'
    kind: 'functionapp,linux'
    alwaysOn: false
    allowedOrigins: [
      staticwebapp.outputs.uri
    ]
    appSettings: {
      WEBSITE_RUN_FROM_PACKAGE: '1'
      WEBSITE_CONTENTAZUREFILECONNECTIONSTRING: storage.outputs.connectionString
      AzureWebJobsStorage: storage.outputs.connectionString
      LINE_CHANNEL_ID: ''
      LINE_CHANNEL_SECRET: ''
      ALLOWED_ORIGINS: staticwebapp.outputs.uri
    }
  }
}

// Add outputs from the deployment here, if needed.
//
// This allows the outputs to be referenced by other bicep deployments in the deployment pipeline,
// or by the local machine as a way to reference created resources in Azure for local development.
// Secrets should not be added here.
//
// Outputs are automatically saved in the local azd environment .env file.
// To see these outputs, run `azd env get-values`,  or `azd env get-values --output json` for json output.
output WEB_URI string = staticwebapp.outputs.uri
output WEB_NAME string = staticwebapp.outputs.name
output API_URI string = 'https://${functionApp.outputs.name}.azurewebsites.net'
output API_NAME string = functionApp.outputs.name
output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
