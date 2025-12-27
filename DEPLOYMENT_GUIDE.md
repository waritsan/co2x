# Deployment Guide - CO2X Platform

## Current Status ✅

### Infrastructure
- **Resource Group**: `rg-co2x-v2` (Southeast Asia)
- **Static Web App**: `stapp-co2x-v2` at https://jolly-tree-0c7793200.2.azurestaticapps.net
- **Azure Functions**: `func-co2x-v2` at https://func-co2x-v2.azurewebsites.net
- **Storage Account**: For Azure Functions file share
- **App Service Plan**: Y1 Consumption tier (serverless)

### Provisioning Status
✅ Azure infrastructure provisioned and resources created
✅ Backend API deployed to Azure Functions
⏳ Frontend deployment pending (needs GitHub Actions setup)

## Next Steps

### 1. Configure GitHub Secrets for Static Web App Deployment

The GitHub Actions workflow requires a deployment token for Azure Static Web Apps. To get this:

```bash
# Get the deployment token from Azure
az account set --subscription "9c25c727-8163-43a6-991e-e900b34066f1"
az staticwebapp secrets list --resource-group rg-co2x-v2 --name stapp-co2x-v2 --query "properties.apiKey" -o tsv
```

Then add this as a GitHub secret:
- Go to: https://github.com/waritsan/co2x/settings/secrets/actions
- Click "New repository secret"
- Name: `AZURE_STATIC_WEB_APPS_TOKEN`
- Value: (paste the token from above)

### 2. Update GitHub Variables

The workflow also needs the backend URL variable:

- Go to: https://github.com/waritsan/co2x/settings/variables/actions
- Update: `LINE_BACKEND_URL` = `https://func-co2x-v2.azurewebsites.net`

### 3. Manual Frontend Deployment (Alternative)

If GitHub Actions is not available, manually deploy the frontend:

```bash
cd /Users/waritsan/Developer/co2x/src/web

# Build the frontend
pnpm install
pnpm build

# Deploy using Azure Static Web Apps CLI
az staticwebapp upload-files \
  --resource-group rg-co2x-v2 \
  --name stapp-co2x-v2 \
  --source-path out
```

## Testing

Once deployed, verify:

1. **Frontend URL**: https://jolly-tree-0c7793200.2.azurestaticapps.net
2. **Backend API**: https://func-co2x-v2.azurewebsites.net/api/lineCallback
3. **OAuth Flow**:
   - Click "Login with LINE" button
   - Should redirect to LINE OAuth page
   - After login, should display user profile

## Production Configuration

### LINE Developers Console Setup

Update the callback URL in LINE Developers Console (https://developers.line.biz/):

1. Go to your Channel settings
2. Update "Callback URL":
   - Development: `http://localhost:3000/callback`
   - Production: `https://jolly-tree-0c7793200.2.azurestaticapps.net/callback`

### Environment Variables

Azure Functions automatically gets these from GitHub secrets during deployment:
- `LINE_CHANNEL_ID`: Added in GitHub Secrets
- `LINE_CHANNEL_SECRET`: Added in GitHub Secrets

These are injected during the CI/CD pipeline.

## Troubleshooting

### Backend not responding

If the Azure Functions API is not responding:

1. Check the function app status in Azure Portal
2. Review deployment logs: `az functionapp log tail --resource-group rg-co2x-v2 --name func-co2x-v2`
3. Verify environment variables are set correctly
4. Check Express.js server is properly deployed

### Frontend not loading content

1. Verify the `out/` directory was deployed (check Static Web App's "Advanced" → "Linked backends")
2. Check if index.html exists in the deployment

### OAuth not working

1. Verify `NEXT_PUBLIC_LINE_CHANNEL_ID` and `NEXT_PUBLIC_LINE_BACKEND_URL` are correctly set in the frontend build
2. Check CORS settings in the backend API
3. Verify redirect URI matches in both frontend and backend code

## Infrastructure as Code

The deployment is defined in Bicep templates:
- **Main**: `infra/main.bicep` - Orchestrates all resources
- **Modules**:
  - `infra/core/host/staticwebapp.bicep` - Static Web App
  - `infra/core/host/functions.bicep` - Azure Functions
  - `infra/core/host/appserviceplan.bicep` - App Service Plan
  - `infra/core/database/storage.bicep` - Storage Account

To redeploy infrastructure:
```bash
azd provision --no-prompt
```

To redeploy application code:
```bash
azd deploy --no-prompt
```

## Redeployment Commands

```bash
# Full deployment (infrastructure + code)
azd up --no-prompt

# Just infrastructure
azd provision --no-prompt

# Just application code
azd deploy --no-prompt

# Get deployment details
azd env get-values
```
