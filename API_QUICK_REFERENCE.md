# LINE OAuth Backend API - Quick Reference

## 🚀 Quick Start (2 minutes)

### 1️⃣ Configure Backend
```bash
cd src/api

# Create .env.local with your LINE credentials
echo 'LINE_CHANNEL_ID=2008743203
LINE_CHANNEL_SECRET=your_secret_here
LINE_REDIRECT_URI=http://localhost:7071/api/lineCallback
ALLOWED_ORIGINS=http://localhost:3000' > .env.local
```

### 2️⃣ Install & Run
```bash
npm install
npm start

# Output should show:
# Http Functions:
#   lineCallback: [GET,POST,OPTIONS] http://localhost:7071/api/lineCallback
#   lineProfile: [GET,POST,OPTIONS] http://localhost:7071/api/lineProfile
```

### 3️⃣ Start Frontend (new terminal)
```bash
cd src/web
pnpm dev

# Open: http://localhost:3000/games
```

### 4️⃣ Test Login
Click "Login with LINE" button and authenticate with your LINE account.

---

## 📊 OAuth 2.0 Flow Diagram

```
┌─────────┐         ┌──────────┐         ┌──────────┐        ┌─────────┐
│ Browser │         │ Frontend │         │  Backend │        │  LINE   │
│         │         │ (Next.js)│         │(Functions)        │ OAuth   │
└────┬────┘         └────┬─────┘         └────┬─────┘        └────┬────┘
     │                   │                     │                   │
     │   Click Login     │                     │                   │
     ├──────────────────>│                     │                   │
     │                   │  Generate State     │                   │
     │                   │  Save to localStorage                  │
     │                   │                     │                   │
     │   Redirect to LINE OAuth                │                   │
     ├─────────────────────────────────────────────────────────────>│
     │                                         │                   │
     │  User Authenticates                     │                   │
     │<─────────────────────────────────────────────────────────────┤
     │                                         │                   │
     │   Redirect + Code                       │                   │
     ├──────────────────>│                     │                   │
     │                   │  GET /api/lineCallback?code=...         │
     │                   ├────────────────────>│                   │
     │                   │                     │  POST /oauth2/token
     │                   │                     ├──────────────────>│
     │                   │                     │<── Access Token ──┤
     │                   │                     │                   │
     │                   │                     │  GET /v2/profile  │
     │                   │                     ├──────────────────>│
     │                   │                     │<── User Data ────┤
     │                   │<─ User Profile ─────┤                   │
     │  setUser()        │                     │                   │
     │  Redirect /games  │                     │                   │
     └────────────────────────────────────────────────────────────────
```

---

## 🔌 API Endpoints

### GET /api/lineCallback
**Purpose:** OAuth callback handler  
**URL:** `http://localhost:7071/api/lineCallback?code=ABC123&state=xyz789`

**Success Response (200):**
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

**Error Response (400):**
```json
{
  "error": "Failed to exchange code for token",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### GET /api/lineProfile
**Purpose:** Fetch user profile with access token  
**URL:** `http://localhost:7071/api/lineProfile`  
**Header:** `Authorization: Bearer {access_token}`

**Success Response (200):**
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

---

## ⚙️ Environment Variables

| Variable | Example | Purpose |
|----------|---------|---------|
| `LINE_CHANNEL_ID` | `2008743203` | Your LINE app ID |
| `LINE_CHANNEL_SECRET` | `abc123...` | Your LINE app secret (keep safe!) |
| `LINE_REDIRECT_URI` | `http://localhost:7071/api/lineCallback` | OAuth callback URL |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | CORS allowed origins |

**Get Credentials from:** [LINE Developers Console](https://developers.line.biz/en/console/)

---

## 📁 File Structure

```
src/api/
├── lineCallback/
│   ├── index.ts              ← OAuth code exchange logic
│   └── function.json         ← Azure Functions metadata
│
├── lineProfile/
│   ├── index.ts              ← Profile fetch with token
│   └── function.json         ← Azure Functions metadata
│
├── src/
│   ├── lineAuth.ts           ← LINE API utilities
│   └── corsUtils.ts          ← CORS & security headers
│
├── package.json              ← Dependencies
├── tsconfig.json             ← TypeScript config
├── host.json                 ← Azure Functions runtime config
├── .env.local                ← Local environment (git ignored)
└── .gitignore                ← Ignore .env.local, node_modules, dist
```

---

## 🧪 Manual Testing

### Option 1: Using Frontend
```bash
# Terminal 1
cd src/api && npm start

# Terminal 2
cd src/web && pnpm dev

# Open http://localhost:3000/games and click Login
```

### Option 2: Using cURL

**Step 1: Get authorization code**
```bash
# Opens in browser - you'll authenticate and get redirected
# with code in URL
open "https://web-login.line.biz/web/login?response_type=code&client_id=2008743203&redirect_uri=http://localhost:7071/api/lineCallback&state=test123&scope=profile%20openid%20email"
```

**Step 2: Copy the code from redirect URL**
```
http://localhost:7071/api/lineCallback?code=ABC123XYZ&state=test123
                                              ↑↑↑↑↑↑↑↑
                                              Copy this
```

**Step 3: Call backend with code**
```bash
curl "http://localhost:7071/api/lineCallback?code=ABC123XYZ"
```

**Step 4: Check response**
```json
{
  "success": true,
  "user": { ... }
}
```

---

## ⚠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| **CORS Error** | Update `ALLOWED_ORIGINS` in `.env.local` |
| **"code invalid"** | Code expired (valid ~10 min). Get new code. |
| **404 /api/lineCallback** | Backend not running. Run `npm start` in `src/api` |
| **State mismatch** | Use same browser for entire OAuth flow |
| **"Channel Secret invalid"** | Copy secret exactly from LINE Console (show button) |

---

## 🔐 Security Checklist

- ✅ Channel Secret stored in `.env.local` (never in code/git)
- ✅ CSRF protection via state parameter
- ✅ CORS validation for allowed origins
- ✅ Token exchange on backend (not frontend)
- ⚠️ TODO: Use HTTPS in production
- ⚠️ TODO: Store secret in Azure Key Vault
- ⚠️ TODO: Implement rate limiting
- ⚠️ TODO: Add security headers (CSP, X-Frame-Options)

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `LINE_OAUTH_SETUP.md` | **Complete setup guide** - step by step |
| `BACKEND_OAUTH_COMPLETE.md` | **Implementation summary** - what was built |
| `src/api/README.md` | **API documentation** - technical reference |
| `setup.sh` | **Automated setup script** - one command setup |

---

## 🚢 Deployment to Azure

```bash
# Set environment variables
azd env set LINE_CHANNEL_ID "2008743203"
azd env set LINE_CHANNEL_SECRET "your_secret"
azd env set LINE_REDIRECT_URI "https://your-api.azurewebsites.net/api/lineCallback"
azd env set ALLOWED_ORIGINS "https://your-frontend.azurestaticapps.net"

# Deploy
azd deploy
```

---

## 💡 Tips & Tricks

### Debugging
```bash
# Check function logs
npm start -- --debug

# The logs show:
# - Authorization code received
# - Token exchange attempt
# - User profile fetch
# - Any errors with full details
```

### Testing Different Users
- Each LINE account shows their own profile data
- Test with different LINE accounts to verify multi-user support

### LIFF vs Web Login
```
Current: Web Login (OAuth 2.0)
├── Works on any browser
├── Requires backend
└── Production recommended

Alternative: LIFF (LINE Mini App)
├── Only in LINE app
├── Simpler setup
└── Limited distribution
```

---

## 🎯 Next Steps

1. ✅ Run `npm start` to verify backend works
2. ✅ Click login button to test full flow
3. ⏭️ Deploy to Azure with `azd deploy`
4. ⏭️ Add monitoring (Application Insights)
5. ⏭️ Implement session/JWT for persistence

---

## ❓ FAQ

**Q: Do I need to store the access token?**  
A: Not in this MVP. Frontend only stores user profile. Add token storage if you need to call LINE API later.

**Q: Can I use LIFF instead?**  
A: Yes! LIFF is simpler but only works in LINE app. Web Login (current) is more flexible.

**Q: Is the secret safe in .env.local?**  
A: For local dev, yes. For production, use Azure Key Vault.

**Q: How long does login take?**  
A: ~2-3 seconds total (includes LINE API calls).

---

## 📞 Support

- LINE Developers: [developers.line.biz](https://developers.line.biz/en/)
- Azure Functions: [docs.microsoft.com](https://docs.microsoft.com/en-us/azure/azure-functions/)
- CO2X Docs: [README.md](../README.md)
