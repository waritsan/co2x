# Production Deployment - Environment Variables

## Required Secrets for GitHub Actions

Add these secrets to your GitHub repository settings (Settings → Secrets and variables → Actions):

### Secrets (sensitive values)
- `LINE_CHANNEL_ID`: Your LINE Login Channel ID (from LINE Developers Console)
- `LINE_CHANNEL_SECRET`: Your LINE Channel Secret (store securely, used only in backend)

### Variables (non-sensitive configuration)
- `LINE_BACKEND_URL`: Production backend URL (e.g., `https://api-backend-app.azurewebsites.net`)
- `AZURE_ENV_NAME`: Azure environment name for azd
- `AZURE_LOCATION`: Azure region (e.g., `eastus`)
- `AZURE_CLIENT_ID`: Azure client ID for federated credentials
- `AZURE_TENANT_ID`: Azure tenant ID
- `AZURE_SUBSCRIPTION_ID`: Azure subscription ID

## Setup Instructions

1. **Get LINE Credentials**:
   - Go to [LINE Developers Console](https://developers.line.biz/console/)
   - Create a LINE Login channel
   - Copy the Channel ID and Channel Secret

2. **Add GitHub Secrets**:
   ```bash
   gh secret set LINE_CHANNEL_ID --body "2008743203"
   gh secret set LINE_CHANNEL_SECRET --body "your_secret_here"
   ```

3. **Add GitHub Variables**:
   ```bash
   gh variable set LINE_BACKEND_URL --body "https://your-backend.azurewebsites.net"
   gh variable set AZURE_ENV_NAME --body "co2x-prod"
   gh variable set AZURE_LOCATION --body "eastus"
   ```

4. **Configure LINE Callback URL**:
   - In LINE Developers Console, set the callback URL to your production domain:
   - `https://your-frontend-domain/callback`

## How It Works

1. GitHub Actions workflow reads secrets/variables during build
2. `NEXT_PUBLIC_LINE_CHANNEL_ID` is embedded in static build for frontend
3. Backend uses `LINE_CHANNEL_SECRET` from environment for token exchange
4. Static Web App serves the built frontend with embedded credentials

## Security Notes

- The `NEXT_PUBLIC_*` prefix means these values are visible in client-side JavaScript
- The Channel ID is safe to expose (it's needed by the browser)
- Never expose `LINE_CHANNEL_SECRET` in frontend code
- Backend keeps the Channel Secret secure in environment variables only
