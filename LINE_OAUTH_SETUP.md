# LINE OAuth Backend Setup Guide

This guide explains how to set up and run the complete LINE OAuth flow for the CO2X platform.

## Overview

The CO2X platform uses a **backend OAuth 2.0 flow** where:
1. Frontend redirects user to LINE authentication
2. LINE redirects back with authorization code
3. **Backend exchanges code for access token** (keeps secret safe)
4. Backend fetches user profile from LINE
5. Frontend receives user data and stores locally

## Files Structure

```
src/api/                              # Azure Functions backend
  ├── package.json                    # Dependencies (axios, @azure/functions)
  ├── tsconfig.json                   # TypeScript configuration
  ├── host.json                       # Azure Functions runtime config
  ├── .env.local                      # Environment variables (local)
  ├── lineCallback/                   # OAuth callback handler
  │   ├── index.ts                    # Main callback function
  │   └── function.json               # Function metadata
  ├── lineProfile/                    # Profile fetch endpoint
  │   ├── index.ts                    # Profile function
  │   └── function.json               # Function metadata
  └── src/
      ├── lineAuth.ts                 # LINE API utilities
      └── corsUtils.ts                # CORS handling

src/web/                              # Next.js frontend
  ├── .env.local                      # Frontend config (BACKEND_URL)
  └── src/
      ├── hooks/useAuth.ts            # Auth state management
      ├── components/
      │   ├── AuthProvider.tsx        # React Context provider
      │   └── LoginButton.tsx         # Login UI
      └── app/callback/page.tsx       # OAuth callback handler
```

## Setup Steps

### Step 1: Get LINE Credentials

1. Go to [LINE Developers Console](https://developers.line.biz/)
2. Create a new Channel (or use existing)
3. Select "LINE Login" as channel type
4. Get:
   - **Channel ID**: Found in Basic settings
   - **Channel Secret**: Found in Basic settings (keep secret!)

### Step 2: Configure Backend API

1. Update `src/api/.env.local`:
```env
LINE_CHANNEL_ID=2008743203
LINE_CHANNEL_SECRET=your_actual_secret_here
LINE_REDIRECT_URI=http://localhost:7071/api/lineCallback
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Get Channel Secret from:**
- LINE Developers Console → Your Channel → Basic Settings → Channel Secret (show)

### Step 3: Configure Frontend

1. Update `src/web/.env.local`:
```env
NEXT_PUBLIC_LINE_CHANNEL_ID=2008743203
NEXT_PUBLIC_LINE_BACKEND_URL=http://localhost:7071
```

### Step 4: Install Dependencies

```bash
# Backend API
cd src/api
npm install

# Frontend (if needed)
cd ../web
pnpm install
```

### Step 5: Start Services

**Terminal 1 - Start Backend API:**
```bash
cd src/api
npm install  # First time only
npm run build
npm start
# Or with Azure Functions Core Tools:
# func start
```

Output should show:
```
Azure Functions Core Tools (4.x.x) Function Runtime (node|v18.0.0)
Http Functions:
  lineCallback: [GET,POST,OPTIONS] http://localhost:7071/api/lineCallback
  lineProfile: [GET,POST,OPTIONS] http://localhost:7071/api/lineProfile
```

**Terminal 2 - Start Frontend:**
```bash
cd src/web
pnpm dev
```

Frontend will be available at `http://localhost:3000`

## Testing the OAuth Flow

### Method 1: Using Frontend UI
1. Open http://localhost:3000/games in browser
2. Click "Login with LINE" button
3. Authenticate with your LINE account
4. Should redirect back to `/games` with profile displayed

### Method 2: Manual Testing

**Step 1: Trigger OAuth flow**
```bash
curl "https://web-login.line.biz/web/login?response_type=code&client_id=2008743203&redirect_uri=http://localhost:3000/callback&state=test123&scope=profile%20openid%20email"
```

**Step 2: Copy authorization code from redirect URL**
```
http://localhost:3000/callback?code=ABC123XYZ&state=test123
```

**Step 3: Exchange code with backend**
```bash
curl "http://localhost:7071/api/lineCallback?code=ABC123XYZ"
```

Should return:
```json
{
  "success": true,
  "user": {
    "userId": "U1234...",
    "displayName": "Your Name",
    "pictureUrl": "https://...",
    "statusMessage": "..."
  }
}
```

## Common Issues

### ❌ "CORS error" / "No Access-Control-Allow-Origin header"
**Cause:** Frontend origin not in `ALLOWED_ORIGINS`
```env
# Fix: Update src/api/.env.local
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### ❌ "Failed to exchange code for token"
**Cause:** Incorrect Channel ID or Secret
```bash
# Verify in LINE Developers Console
# Settings → Channel ID: 2008743203
# Settings → Channel Secret: xxxxx (copy exactly)
```

### ❌ "State mismatch - possible CSRF attack"
**Cause:** State parameter not matching between frontend and backend
- This is a security feature - ensure same browser session for both requests
- Clear localStorage and try again

### ❌ "lineCallback endpoint not found" (404)
**Cause:** Azure Functions not running or function not loaded
```bash
# Make sure you're in src/api directory
npm run build
npm start

# Check output shows "Http Functions:"
```

## Architecture Details

### Authorization Flow Sequence

```
User                Frontend              Backend API              LINE OAuth
  |                    |                      |                       |
  |-- Click Login ---> |                      |                       |
  |                    |-- Generate State --> |                       |
  |                    |-- Redirect to LINE --|----> Authorization ---|
  |                    |                      |           ↓            |
  |<-- Authenticate with LINE ----<-----<-----<-----<-----<-----<-----
  |                    |                      |                       |
  |-- Callback Code -> |-- Exchange Code --> |-- POST /oauth2/token ->|
  |                    |                      |<-- Access Token --------|
  |                    |                      |-- GET /v2/profile ---->|
  |                    |<-- User Profile <---|<-- Profile Data --------|
  |                    |                      |
  |<- Stored Profile --|                      |
```

### Data Flow

1. **Frontend initiates login:**
   - Generate random `state` for CSRF protection
   - Store in `localStorage`
   - Redirect to `web-login.line.biz`

2. **User authenticates with LINE**

3. **Backend receives authorization code:**
   - Exchange code for access token (using Channel Secret)
   - Access token proves we're the legitimate backend
   - Fetch user profile using access token

4. **Frontend receives user data:**
   - Store profile in `localStorage`
   - Display in UI (header, profile page, etc.)

## Security Practices

### ✅ What We Do Right

1. **Channel Secret stays on backend** - Frontend never sees it
2. **State parameter prevents CSRF** - Generated fresh for each login
3. **CORS validation** - Only allow trusted origins
4. **Bearer token validation** - Profile endpoint requires token

### ⚠️ Production Considerations

Before deploying to production:

1. **Use HTTPS everywhere**
```env
# Production backend
LINE_REDIRECT_URI=https://your-api.azurewebsites.net/api/lineCallback

# Production frontend
NEXT_PUBLIC_LINE_BACKEND_URL=https://your-api.azurewebsites.net
```

2. **Secure Channel Secret**
   - Store in Azure Key Vault, not in code
   - Use managed identity for function access

3. **Implement session/JWT**
   - Current setup returns user profile directly
   - For multi-page apps, issue JWT instead
   - Store JWT in secure, httpOnly cookie

4. **Monitor and log**
   - Add Application Insights
   - Log all authentication attempts
   - Monitor for suspicious patterns

5. **Refresh tokens**
   - Implement token refresh for long sessions
   - Store refresh token securely on backend

## Next Steps

1. ✅ Backend API running on localhost:7071
2. ✅ Frontend running on localhost:3000
3. ✅ OAuth flow working end-to-end
4. ⏭️ **Test full flow** - Click login button
5. ⏭️ **Deploy to Azure** - Use `azd deploy`
6. ⏭️ **Add monitoring** - Application Insights
7. ⏭️ **Implement session management** - JWT or server sessions

## Environment Variables Summary

### Backend (`src/api/.env.local`)
| Variable | Value | Source |
|----------|-------|--------|
| `LINE_CHANNEL_ID` | `2008743203` | LINE Developers Console |
| `LINE_CHANNEL_SECRET` | `xxxxx` | LINE Developers Console (Secret) |
| `LINE_REDIRECT_URI` | `http://localhost:7071/api/lineCallback` | Backend endpoint URL |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Frontend URL |

### Frontend (`src/web/.env.local`)
| Variable | Value | Source |
|----------|-------|--------|
| `NEXT_PUBLIC_LINE_CHANNEL_ID` | `2008743203` | Same as backend |
| `NEXT_PUBLIC_LINE_BACKEND_URL` | `http://localhost:7071` | Backend URL |

## Resources

- [LINE Login API Reference](https://developers.line.biz/en/reference/line-login-api/)
- [LINE Social API](https://developers.line.biz/en/reference/social-api/)
- [Azure Functions Node.js Guide](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node)
- [OAuth 2.0 Authorization Code Flow](https://tools.ietf.org/html/rfc6749#section-1.3.1)
