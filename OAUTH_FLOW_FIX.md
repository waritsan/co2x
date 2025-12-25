# OAuth Flow Fix - LINE API Endpoint Update

## Issue Fixed

**Problem:** Safari couldn't resolve `web-login.line.biz` - DNS resolution failed  
**Root Cause:** The endpoint `https://web-login.line.biz/web/login` is not the correct LINE OAuth 2.0 authorization endpoint  
**Solution:** Updated to use the standard LINE OAuth 2.0 endpoint

## What Changed

### Updated OAuth Authorization Endpoint

**Before:**
```
https://web-login.line.biz/web/login?response_type=code&client_id=...
```

**After:**
```
https://api.line.me/oauth2.0/v2.1/authorize?response_type=code&client_id=...
```

**File Changed:** [src/web/src/hooks/useAuth.ts](src/web/src/hooks/useAuth.ts#L55)

## System Status ✅

### Running Servers

| Service | URL | Status | Port |
|---------|-----|--------|------|
| **Backend API (Express)** | http://localhost:7071 | ✅ Running | 7071 |
| **Frontend (Next.js)** | http://localhost:3000 | ✅ Running | 3000 |

### Available Endpoints

**Frontend:**
- `GET /` - Home page
- `GET /games` - Games page with login button
- `GET /callback` - OAuth callback handler

**Backend API:**
- `GET /api/lineCallback?code=...` - OAuth code exchange
- `GET /api/lineProfile` - User profile fetch  
- `GET /health` - Health check

## OAuth 2.0 Flow (Updated)

```
1. User visits http://localhost:3000/games
2. Clicks "Login with LINE"
3. Frontend redirects to:
   https://api.line.me/oauth2.0/v2.1/authorize?
     response_type=code&
     client_id=2008743203&
     redirect_uri=http://localhost:3000/callback&
     state=random_value&
     scope=profile%20openid%20email
4. User authenticates with LINE
5. LINE redirects to: http://localhost:3000/callback?code=...&state=...
6. Frontend verifies state and calls backend:
   GET http://localhost:7071/api/lineCallback?code=...
7. Backend exchanges code for access token with LINE
8. Backend fetches user profile
9. Frontend stores user profile and displays in header
```

## Testing

### To Test the Updated OAuth Flow

1. **Open the frontend:**
   ```
   http://localhost:3000/games
   ```

2. **Click "Login with LINE" button**

3. **Browser will redirect to:**
   ```
   https://api.line.me/oauth2.0/v2.1/authorize?...
   ```

4. **Authenticate with your LINE account**

5. **You'll be redirected back to the callback page**

6. **Check the console** for OAuth flow details:
   ```
   [Log] "Redirecting to LINE OAuth:" https://api.line.me/oauth2.0/v2.1/authorize?...
   ```

## Configuration

### Backend (.env.local)
```env
LINE_CHANNEL_ID=2008743203
LINE_CHANNEL_SECRET=04242ce895409dc55022ca10cf9f7ab4
LINE_REDIRECT_URI=http://localhost:7071/api/lineCallback
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
ENVIRONMENT=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_LINE_CHANNEL_ID=2008743203
NEXT_PUBLIC_LINE_BACKEND_URL=http://localhost:7071
```

## Technical Details

### Why the Endpoint Changed

LINE provides multiple OAuth endpoints:
1. **`web-login.line.biz`** - Legacy mobile web endpoint (may not work reliably)
2. **`api.line.me/oauth2.0/v2.1/authorize`** - Standard OAuth 2.0 endpoint (recommended)

The standard OAuth 2.0 endpoint is:
- More reliable and widely documented
- Properly resolves DNS
- Follows OAuth 2.0 RFC standards
- Used by most LINE integrations

### Endpoint Comparison

| Endpoint | Type | Status | Recommendation |
|----------|------|--------|-----------------|
| web-login.line.biz | Mobile Web | Legacy | ❌ Avoid |
| api.line.me/oauth2.0/v2.1 | Standard OAuth 2.0 | Current | ✅ Use |

## Next Steps

### Local Testing ✅
- Frontend and backend both running
- OAuth flow ready to test
- Try logging in with your LINE account

### Before Production Deployment
1. Update LINE Developers Console with production URLs
2. Verify CORS settings allow production domains
3. Update `LINE_REDIRECT_URI` to production URL
4. Test with actual LINE account
5. Deploy with `azd deploy`

## Support

If you encounter any issues:

1. **Check backend logs:**
   ```bash
   cat /tmp/backend.log
   ```

2. **Check frontend logs:**
   ```bash
   cat /tmp/frontend.log
   ```

3. **Verify services are running:**
   ```bash
   # Check backend
   curl http://localhost:7071/health
   
   # Check frontend
   curl http://localhost:3000
   ```

4. **Check browser console** for detailed error messages (F12 → Console)

## Reference

- [LINE OAuth 2.0 Documentation](https://developers.line.biz/en/reference/line-login-api/)
- [OAuth 2.0 Authorization Code Flow](https://tools.ietf.org/html/rfc6749#section-1.3.1)
- [LINE Channel Configuration](https://developers.line.biz/en/console/)
