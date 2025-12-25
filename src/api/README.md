# CO2X Line OAuth Backend API

Azure Functions-based OAuth 2.0 backend for LINE authentication in the CO2X carbon credit exchange platform.

## Architecture

```
Frontend (Next.js)          Backend (Azure Functions)        LINE OAuth
    |                              |                            |
    +-- Login Click --------> /api/lineCallback -----> LINE Authorization
    |                              |                            |
    +-- Redirect to LINE ------> User Authenticates <--------+
    |                              |
    +<-- Callback with Code <-- Exchange Code for Token
    |                              |
    +<-- User Profile ------<-- Fetch User Profile
```

## Setup

### Prerequisites
- Node.js 18+ with npm/pnpm
- Azure Functions Core Tools (optional, for local testing)
- LINE Channel credentials from [LINE Developers Console](https://developers.line.biz/)

### Installation

1. Install dependencies:
```bash
cd src/api
npm install
# or with pnpm
pnpm install
```

2. Configure environment variables in `.env.local`:
```env
LINE_CHANNEL_ID=your_channel_id
LINE_CHANNEL_SECRET=your_channel_secret
LINE_REDIRECT_URI=http://localhost:7071/api/lineCallback
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Build

```bash
npm run build
# or with pnpm
pnpm build
```

## Functions

### POST /api/lineCallback

Handles OAuth 2.0 callback from LINE. Exchanges authorization code for access token and fetches user profile.

**Query Parameters:**
- `code` (required): Authorization code from LINE OAuth flow
- `state` (optional): CSRF protection state parameter

**Response:**
```json
{
  "success": true,
  "user": {
    "userId": "U1234567890abcdef...",
    "displayName": "John Doe",
    "pictureUrl": "https://...",
    "statusMessage": "Using CO2X Platform"
  }
}
```

**Error Response:**
```json
{
  "error": "Failed to exchange code for token",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/lineProfile

Fetches user profile from LINE using access token. Requires Authorization header with Bearer token.

**Headers:**
- `Authorization: Bearer {access_token}`

**Response:**
```json
{
  "success": true,
  "user": {
    "userId": "U1234567890abcdef...",
    "displayName": "John Doe",
    "pictureUrl": "https://...",
    "statusMessage": "Using CO2X Platform"
  }
}
```

**Error Response:**
```json
{
  "error": "Failed to fetch user profile",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Local Development

### Using Azure Functions Core Tools

```bash
# Start the local runtime
func start

# The API will be available at http://localhost:7071
```

### Testing with Frontend

1. Update frontend environment variables in `src/web/.env.local`:
```env
NEXT_PUBLIC_LINE_CHANNEL_ID=your_channel_id
NEXT_PUBLIC_LINE_BACKEND_URL=http://localhost:7071
```

2. Start the frontend:
```bash
cd src/web
pnpm dev
```

3. Click "Login with LINE" button and follow the OAuth flow

## Security Considerations

### CSRF Protection
- Frontend generates random `state` parameter before redirecting to LINE
- Backend verifies `state` matches stored value
- Mismatch indicates possible CSRF attack

### Token Handling
- Backend never exposes access tokens to frontend (production)
- Frontend stores only user profile in localStorage
- Consider implementing JWT sessions for better security

### CORS
- Configured to allow only specified origins (`ALLOWED_ORIGINS`)
- Prevents unauthorized cross-origin requests
- Update `ALLOWED_ORIGINS` for production deployments

## Deployment

### To Azure

1. Update environment variables in Azure:
```bash
azd env set LINE_CHANNEL_ID "your_channel_id"
azd env set LINE_CHANNEL_SECRET "your_channel_secret"
azd env set LINE_REDIRECT_URI "https://your-functions.azurewebsites.net/api/lineCallback"
azd env set ALLOWED_ORIGINS "https://your-app.azurestaticapps.net"
```

2. Deploy via Azure Developer CLI:
```bash
azd deploy
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `LINE_CHANNEL_ID` | LINE Channel ID from Developers Console | `1234567890` |
| `LINE_CHANNEL_SECRET` | LINE Channel Secret (keep secure!) | `secret123...` |
| `LINE_REDIRECT_URI` | OAuth callback redirect URI | `http://localhost:7071/api/lineCallback` |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed origins | `http://localhost:3000,https://example.com` |

## Troubleshooting

### "Failed to exchange code for token"
- Verify `LINE_CHANNEL_ID` and `LINE_CHANNEL_SECRET` are correct
- Check that redirect URI matches configuration in LINE Developers Console
- Ensure authorization code hasn't expired (valid for ~10 minutes)

### CORS errors
- Verify frontend origin is in `ALLOWED_ORIGINS`
- Check browser console for specific CORS error details
- Ensure frontend includes proper headers

### "Missing authorization header"
- Ensure frontend includes `Authorization: Bearer {token}` header for profile endpoint
- Token must be the access token returned from callback

## References

- [LINE OAuth 2.0 Documentation](https://developers.line.biz/en/reference/line-login-api/)
- [LINE Profile API](https://developers.line.biz/en/reference/social-api/)
- [Azure Functions Documentation](https://docs.microsoft.com/en-us/azure/azure-functions/)
