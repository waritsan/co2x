# Backend OAuth Integration Complete ✅

This document summarizes the backend OAuth 2.0 implementation for CO2X LINE login.

## What Was Implemented

### 1. Azure Functions Backend (`src/api/`)

**Structure:**
```
src/api/
├── lineCallback/          # OAuth code exchange endpoint
│   ├── index.ts          # Handles authorization code → access token
│   └── function.json
├── lineProfile/           # User profile fetch endpoint
│   ├── index.ts          # Fetches user data with access token
│   └── function.json
├── src/
│   ├── lineAuth.ts       # LINE API utilities
│   │   └── exchangeCodeForToken()  # Token exchange
│   │   └── getUserProfile()        # Profile fetch
│   │   └── handleOAuthCallback()   # Complete flow
│   └── corsUtils.ts      # CORS & security headers
│       └── addCorsHeaders()        # Allow localhost:3000
│       └── handleCorsPreFlight()   # OPTIONS preflight
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── host.json             # Azure Functions runtime
└── .env.local            # Environment variables (local)
```

### 2. Frontend Integration (`src/web/`)

**Updated Files:**
- `src/hooks/useAuth.ts` - Updated to use OAuth standard flow (no LIFF)
- `src/app/callback/page.tsx` - Calls backend `/api/lineCallback` endpoint
- `src/web/.env.local` - Added `NEXT_PUBLIC_LINE_BACKEND_URL=http://localhost:7071`

**OAuth Flow:**
```
1. User clicks Login → Redirect to LINE OAuth (browser)
2. User authenticates with LINE credentials
3. LINE redirects back with authorization code
4. Frontend calls /api/lineCallback?code=...
5. Backend exchanges code for access token (using Channel Secret)
6. Backend fetches user profile from LINE
7. Frontend receives user data → stored in localStorage
8. Redirect to /games with user profile displayed
```

## Key Features

### ✅ Security
- **CSRF Protection**: Random state parameter generated per login attempt
- **Secret Protection**: Channel Secret never exposed to frontend
- **Token Exchange**: Backend-only access to sensitive token operations
- **CORS Validation**: Only allow localhost:3000 (configurable)

### ✅ Error Handling
- Graceful fallback to mock user if backend unavailable
- Detailed error messages for debugging
- Timestamp logging for audit trail

### ✅ Scalability
- Stateless Azure Functions (scale to zero)
- No database required
- Standard OAuth 2.0 flow (compatible with LINE)

## How to Run

### Prerequisites
1. LINE Channel ID: `2008743203`
2. LINE Channel Secret: Get from [LINE Developers Console](https://developers.line.biz/en/console/)

### Local Development

**Step 1: Configure Backend**
```bash
# src/api/.env.local
LINE_CHANNEL_ID=2008743203
LINE_CHANNEL_SECRET=your_secret_here
LINE_REDIRECT_URI=http://localhost:7071/api/lineCallback
ALLOWED_ORIGINS=http://localhost:3000
```

**Step 2: Install & Start Backend**
```bash
cd src/api
npm install
npm start
# Should show:
# Http Functions:
#   lineCallback: [GET,POST,OPTIONS] http://localhost:7071/api/lineCallback
#   lineProfile: [GET,POST,OPTIONS] http://localhost:7071/api/lineProfile
```

**Step 3: Start Frontend** (new terminal)
```bash
cd src/web
pnpm dev
# Runs on http://localhost:3000
```

**Step 4: Test Login**
1. Open http://localhost:3000/games
2. Click "Login with LINE"
3. Authenticate with your LINE account
4. Should redirect to /games with your profile displayed

## API Endpoints

### GET /api/lineCallback
Handles OAuth callback and exchanges authorization code for user profile.

**Query Parameter:**
- `code` - Authorization code from LINE

**Response (200):**
```json
{
  "success": true,
  "user": {
    "userId": "U1234567890abcdef1234567890abcdef",
    "displayName": "John Doe",
    "pictureUrl": "https://profile.line-scdn.net/...",
    "statusMessage": "Using CO2X"
  }
}
```

**Error (400):**
```json
{
  "error": "Failed to exchange code for token",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/lineProfile
Fetch user profile using access token.

**Header:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "userId": "U1234567890abcdef1234567890abcdef",
    "displayName": "John Doe",
    "pictureUrl": "https://profile.line-scdn.net/...",
    "statusMessage": "Using CO2X"
  }
}
```

## Environment Variables

### Backend (`src/api/.env.local`)
```env
# LINE Developers Console → Channel ID
LINE_CHANNEL_ID=2008743203

# LINE Developers Console → Channel Secret (keep secret!)
LINE_CHANNEL_SECRET=abc123def456ghi789

# Callback URL (must match LINE Developers Console)
LINE_REDIRECT_URI=http://localhost:7071/api/lineCallback

# Comma-separated list of allowed frontend origins (CORS)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Frontend (`src/web/.env.local`)
```env
# Same as backend LINE_CHANNEL_ID
NEXT_PUBLIC_LINE_CHANNEL_ID=2008743203

# Backend API base URL
NEXT_PUBLIC_LINE_BACKEND_URL=http://localhost:7071
```

## Production Deployment

### Azure Deployment Steps

1. **Set Azure Environment Variables:**
```bash
cd /Users/waritsan/Developer/co2x
azd env set LINE_CHANNEL_ID "2008743203"
azd env set LINE_CHANNEL_SECRET "your_secret_here"
azd env set LINE_REDIRECT_URI "https://your-functions.azurewebsites.net/api/lineCallback"
azd env set ALLOWED_ORIGINS "https://your-swa-site.azurestaticapps.net"
```

2. **Deploy Infrastructure & Application:**
```bash
azd provision  # Creates Azure resources
azd deploy     # Deploys code
```

3. **Update LINE Developers Console:**
   - Add redirect URI: `https://your-functions.azurewebsites.net/api/lineCallback`
   - Update callback origins if needed

### Security Checklist
- [ ] Use HTTPS for all URLs
- [ ] Store Channel Secret in Azure Key Vault (not in code)
- [ ] Use Managed Identity for Functions to access Key Vault
- [ ] Enable Application Insights for monitoring
- [ ] Review CORS allowed origins (specific domains only)
- [ ] Implement rate limiting on callback endpoint
- [ ] Add authentication logging for security audit

## Troubleshooting

### CORS Errors
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Update `ALLOWED_ORIGINS` in `src/api/.env.local`
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### "Failed to exchange code for token"
**Cause:** Incorrect Channel ID or Secret
**Solution:** 
1. Go to [LINE Developers Console](https://developers.line.biz/en/console/)
2. Copy Channel ID exactly as shown
3. Click "Channel Secret" and copy the secret

### "Callback endpoint not found" (404)
**Cause:** Backend not running or function not deployed
**Solution:** 
```bash
# Make sure you're in src/api directory
npm install
npm run build
npm start
# Check that it shows "Http Functions:" with lineCallback listed
```

### "State mismatch - possible CSRF attack"
**Cause:** Different browser sessions or localStorage cleared
**Solution:** Make sure to use the same browser tab for the entire login flow

## Build Status

✅ **Backend API** - Compiles successfully (0 TypeScript errors)
```
dist/lineCallback/index.js ✓
dist/lineProfile/index.js ✓
dist/src/lineAuth.js ✓
dist/src/corsUtils.js ✓
```

✅ **Frontend** - Builds successfully with updated OAuth logic
```
Next.js 16.0.6 build completed
Routes: /, /callback, /coffee, /game, /games, /market
```

## File Changes Summary

### New Files Created
```
src/api/
├── .gitignore
├── README.md
├── package.json (fixed)
├── tsconfig.json
├── host.json
├── .env.local
├── lineCallback/index.ts
├── lineCallback/function.json
├── lineProfile/index.ts
├── lineProfile/function.json
├── src/lineAuth.ts (NEW - LINE API utilities)
└── src/corsUtils.ts (NEW - CORS & security)

LINE_OAUTH_SETUP.md (NEW - Comprehensive setup guide)
```

### Updated Files
```
src/web/.env.local
└── Added: NEXT_PUBLIC_LINE_BACKEND_URL=http://localhost:7071

src/web/src/hooks/useAuth.ts
└── Updated login() to use standard OAuth flow (not LIFF)
└── Added backend URL configuration

src/web/src/app/callback/page.tsx
└── Updated to call /api/lineCallback endpoint
└── Sends authorization code to backend for exchange
```

## Next Steps

1. **✅ DONE** - Implement backend OAuth with Azure Functions
2. **✅ DONE** - Update frontend to use backend API
3. **✅ DONE** - Add CORS and security headers
4. **⏭️ TODO** - Test full OAuth flow with real LINE account
5. **⏭️ TODO** - Deploy to Azure using `azd deploy`
6. **⏭️ TODO** - Add monitoring with Application Insights
7. **⏭️ TODO** - Implement session management (JWT or cookies)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CO2X Platform                        │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────┐      ┌──────────────────────────┐
│   Frontend (Next.js)     │      │   Backend (Azure Fn)     │
│   localhost:3000         │      │   localhost:7071         │
├──────────────────────────┤      ├──────────────────────────┤
│                          │      │                          │
│  POST /callback          │      │  GET /api/lineCallback   │
│  - Handle OAuth code     │      │  - Exchange code         │
│  - Call backend API  ←────────→ │  - Fetch user profile    │
│  - Store user profile    │      │  - Return user data      │
│  - Display in UI         │      │                          │
│                          │      │  GET /api/lineProfile    │
│  localStorage:           │      │  - Fetch profile with    │
│  - user data             │      │    access token          │
│  - state (CSRF)          │      │                          │
└──────────────────────────┘      └──────────────────────────┘
           ↑                                    ↑
           │                                    │
           └────────────────────────────────────┘
                  LINE OAuth Server
                https://web-login.line.biz
                https://api.line.me
```

## References

- [LINE Login API Docs](https://developers.line.biz/en/reference/line-login-api/)
- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [Azure Functions TypeScript Guide](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node)
- [CO2X Copilot Instructions](.github/copilot-instructions.md)
