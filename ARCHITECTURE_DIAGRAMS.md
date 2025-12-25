# Architecture & Flow Diagrams

## OAuth 2.0 Authorization Code Flow (Sequence Diagram)

```
┌──────────┐          ┌─────────────┐       ┌──────────────┐      ┌────────────┐
│ Browser  │          │  Frontend   │       │ Backend API  │      │ LINE OAuth │
│(User)    │          │ (Next.js)   │       │   (Azure)    │      │   Server   │
└────┬─────┘          └──────┬──────┘       └───────┬──────┘      └─────┬──────┘
     │                       │                      │                    │
     │    Click "Login"      │                      │                    │
     ├──────────────────────>│                      │                    │
     │                       │  Generate State      │                    │
     │                       │  Save to localStorage                     │
     │                       │                      │                    │
     │   Redirect URL        │                      │                    │
     │<──────────────────────┤                      │                    │
     │                       │                      │                    │
     │   Redirect to OAuth   │                      │                    │
     │──────────────────────────────────────────────────────────────────>│
     │                       │                      │                    │
     │  ┌──────────────────────────────────────────────────────────────┐
     │  │ User Authenticates with LINE                                  │
     │  │ (enter password, 2FA, etc.)                                   │
     │  └──────────────────────────────────────────────────────────────┘
     │                       │                      │                    │
     │   Redirect + Code     │                      │                    │
     │<──────────────────────────────────────────────────────────────────┤
     │                       │                      │                    │
     │   Navigate to Callback URL                  │                    │
     ├──────────────────────>│                      │                    │
     │                       │ GET /api/lineCallback│code=...&state=...  │
     │                       ├──────────────────────>│                    │
     │                       │                      │                    │
     │                       │                      │ Verify State       │
     │                       │                      │ (CSRF Check)       │
     │                       │                      │                    │
     │                       │                      │ POST /oauth2/token │
     │                       │                      ├───────────────────>│
     │                       │                      │                    │
     │                       │                      │<── Access Token ───┤
     │                       │                      │                    │
     │                       │                      │ GET /v2/profile    │
     │                       │                      ├───────────────────>│
     │                       │                      │                    │
     │                       │                      │<── User Data ──────┤
     │                       │<── User Profile ─────┤                    │
     │                       │                      │                    │
     │                       │ setAuthContext()     │                    │
     │                       │ localStorage.setUser()                   │
     │                       │                      │                    │
     │   Display Profile     │                      │                    │
     │<──────────────────────┤                      │                    │
     │                       │                      │                    │
     │ Redirect to /games    │                      │                    │
     ├──────────────────────>│                      │                    │
     │                       │                      │                    │
     v                       v                      v                    v
```

## Network Request Flow

```
1. USER CLICKS LOGIN
   └─> Frontend: Generates state parameter (CSRF protection)
   └─> Frontend: Redirects to https://web-login.line.biz/web/login?...

2. USER AUTHENTICATES WITH LINE
   └─> LINE Server: Validates credentials
   └─> LINE Server: Redirects to callback URL with authorization code

3. FRONTEND RECEIVES CALLBACK
   └─> Frontend: Verifies state parameter matches
   └─> Frontend: GET /api/lineCallback?code=XXX
   └─> Backend: Receives authorization code

4. BACKEND EXCHANGES CODE FOR TOKEN
   └─> Backend: POST https://api.line.me/oauth2/v2.1/token
       └─> Request Body:
           - grant_type: authorization_code
           - code: XXX
           - client_id: 2008743203
           - client_secret: xxxxxx
   └─> LINE API: Validates code & secret
   └─> LINE API: Returns access_token

5. BACKEND FETCHES USER PROFILE
   └─> Backend: GET https://api.line.me/v2/profile
       └─> Header: Authorization: Bearer {access_token}
   └─> LINE API: Returns user data
       └─> userId, displayName, pictureUrl, statusMessage

6. FRONTEND RECEIVES USER DATA
   └─> Frontend: HTTP 200 with user profile JSON
   └─> Frontend: localStorage.setUser(profile)
   └─> Frontend: useAuthContext().setUser(profile)

7. UI UPDATES
   └─> Header: Shows user profile + logout button
   └─> LoginButton: Changes from "Login" to "Profile" mode
```

## Component Communication

```
┌─────────────────────────────────────────────────────────────────┐
│                        App Layout                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │            AuthProvider (React Context)                  │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │         useAuthContext() Hook                        │ │  │
│  │  │  ┌─────────────────────────────────────────────────┐ │ │  │
│  │  │  │  AuthContext = {                                 │ │ │  │
│  │  │  │    user: LineUser | null                        │ │ │  │
│  │  │  │    isLoading: boolean                           │ │ │  │
│  │  │  │    isLoggedIn: boolean                          │ │ │  │
│  │  │  │    login: () => void                            │ │ │  │
│  │  │  │    logout: () => void                           │ │ │  │
│  │  │  │  }                                              │ │ │  │
│  │  │  └─────────────────────────────────────────────────┘ │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │           ▲                                               │  │
│  │           │ provides context                             │  │
│  │           │                                               │  │
│  │  ┌────────┴────────┐                                      │  │
│  │  │                 │                                      │  │
│  │  v                 v                                      │  │
│  │┌──────────────┐ ┌──────────────────┐                      │  │
│  ││  Games Page  │ │  Header (Navbar) │                      │  │
│  ││              │ │                  │                      │  │
│  ││ <LoginBtn /> │ │ <LoginButton />  │                      │  │
│  │└──────────────┘ │                  │                      │  │
│  │                 │  - If logged in: │                      │  │
│  │                 │    - Show avatar │                      │  │
│  │                 │    - Show name   │                      │  │
│  │                 │    - Show logout │                      │  │
│  │                 │                  │                      │  │
│  │                 │  - If not logged:│                      │  │
│  │                 │    - Show login  │                      │  │
│  │                 │    - Show loading│                      │  │
│  │                 └──────────────────┘                      │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## State Management Flow

```
localStorage:
┌──────────────────────────────┐
│ Key: "line_user_data"        │
│ Value: {                     │
│   userId: "U1234...",        │
│   displayName: "John",       │
│   pictureUrl: "https://...", │
│   statusMessage: "Using CO2X"│
│ }                            │
└──────────────────────────────┘
         ▲
         │ setStoredUser()
         │
    ┌────┴────────────────┐
    │                     │
    v                     v
useAuth Hook        AuthProvider
┌────────────────┐  ┌──────────────────┐
│ const user =   │  │ const [user, user]│
│ useState(null) │  │                  │
│                │  │ useEffect() {    │
│ on mount:      │  │   // restore from│
│ read from      │  │   localStorage   │
│ localStorage   │  │ }                │
└────────────────┘  └──────────────────┘
    │                     │
    └─────────┬───────────┘
              │ used by components
              v
    ┌──────────────────────┐
    │ LoginButton          │
    │ Games Page           │
    │ Other Components     │
    └──────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────┐
│ OAuth Callback                                          │
└─────────────────┬───────────────────────────────────────┘
                  │
                  v
    ┌─────────────────────────────────┐
    │ Check authorization code exists │
    └────────────┬────────────────────┘
                 │
            No   │   Yes
      ┌──────────┴──────────┐
      v                     v
   ERROR              ┌──────────────────────┐
   └─> Error UI       │ Exchange code for    │
                      │ access token         │
                      └────┬───────────────┘
                           │
                      Fail │ Success
                  ┌────────┴──────────┐
                  v                   v
               ERROR             ┌──────────────┐
               └─> Error UI      │ Fetch user   │
                                 │ profile      │
                                 └────┬────────┘
                                      │
                                 Fail │ Success
                             ┌────────┴──────────┐
                             v                  v
                          ERROR          ┌──────────────┐
                          └─> Show       │ Store user   │
                              error      │ in context   │
                              message    └────┬────────┘
                                             │
                                             v
                                        ✅ SUCCESS
                                        └─> Redirect
                                            to /games
```

## API Security Headers

```
REQUEST:
GET /api/lineCallback?code=ABC123&state=xyz
Host: localhost:7071
Origin: http://localhost:3000

RESPONSE:
HTTP/1.1 200 OK
Content-Type: application/json
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true

{
  "success": true,
  "user": { ... }
}
```

## Deployment Architecture

```
LOCAL DEVELOPMENT
┌─────────────────────────────────────────────┐
│            Developer Machine                │
│  ┌──────────────────────────────────────┐  │
│  │ Frontend (Next.js)                   │  │
│  │ http://localhost:3000                │  │
│  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────┐  │
│  │ Backend (Azure Functions)            │  │
│  │ http://localhost:7071                │  │
│  └──────────────────────────────────────┘  │
│             │      │                        │
│             │      │ Line OAuth             │
│             └──────┼──────────────────────> │
│                    │ https://web-login....  │
└────────────────────┼──────────────────────┘
                     │

PRODUCTION (AZURE)
┌─────────────────────────────────────────────┐
│           Azure Subscription                 │
│  ┌──────────────────────────────────────┐  │
│  │ Static Web App (Frontend)            │  │
│  │ https://your-app.azurestaticapps.net │  │
│  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────┐  │
│  │ Azure Functions (Backend)            │  │
│  │ https://your-api.azurewebsites.net   │  │
│  └──────────────────────────────────────┘  │
│             │      │                        │
│             │      │ Line OAuth             │
│             └──────┼──────────────────────> │
│                    │ https://web-login....  │
└────────────────────┼──────────────────────┘
                     │
```

## Token Lifecycle

```
AUTHORIZATION CODE (short-lived, ~10 min)
├─ Generated by LINE after user authenticates
├─ Received in callback URL
├─ Exchanged ONCE for access token
└─ Expires/becomes invalid after use

ACCESS TOKEN (expires in ~1-2 hours)
├─ Obtained from LINE token endpoint
├─ Used to fetch user profile
├─ Never sent to frontend
├─ Used server-side for API calls
└─ Can be refreshed if refresh_token provided

REFRESH TOKEN (long-lived, optional)
├─ Optionally returned by LINE
├─ Used to get new access token without re-auth
├─ Should be stored securely on backend
└─ Not implemented in this MVP

FRONTEND SESSION (user data only)
├─ Stores: userId, displayName, pictureUrl, statusMessage
├─ Stored in: localStorage
├─ Duration: Persists until logout
└─ No sensitive tokens stored in browser
```

## Security Layers

```
┌──────────────────────────────────────────────────────┐
│ Layer 1: CSRF Protection                             │
│  ├─ State parameter: Random value per login          │
│  ├─ Storage: localStorage                            │
│  └─ Validation: Must match callback state            │
├──────────────────────────────────────────────────────┤
│ Layer 2: Secret Protection                           │
│  ├─ Channel Secret: Only on backend                  │
│  ├─ Storage: .env.local (local) / Key Vault (prod)   │
│  └─ Usage: Token exchange only                       │
├──────────────────────────────────────────────────────┤
│ Layer 3: CORS Validation                             │
│  ├─ Allowed Origins: Configured list                 │
│  ├─ Header Check: Origin must be in allowlist        │
│  └─ Response: CORS headers only for allowed origins  │
├──────────────────────────────────────────────────────┤
│ Layer 4: Token Validation                            │
│  ├─ Bearer Token: Checked in Authorization header    │
│  ├─ Scope: Verified against requested scopes         │
│  └─ Expiration: Checked by LINE API                  │
├──────────────────────────────────────────────────────┤
│ Layer 5: HTTPS (Production Only)                     │
│  ├─ Transport: All traffic encrypted                 │
│  ├─ Certificate: Azure-managed SSL                   │
│  └─ Redirects: HTTP → HTTPS automatic                │
└──────────────────────────────────────────────────────┘
```

---

## Data Flow Summary

```
User Action          Frontend Action          Backend Action
    │                     │                          │
    v                     v                          v

Click Login      Generate State       Generate CSRF token
   │            Save to localStorage  (on request)
   v                │
Authenticate   Redirect to            
with LINE      OAuth Server
   │              │
   │<─────────────┘ (Browser redirect)
   │              
   v              
Get Code        
(in URL)           │
   │               v
   │          Verify State
   │          Verify Code exists
   │          POST request
   │              │
   │              v
   │          Exchange Code
   │          for Access Token
   │          (Line API call)
   │              │
   │              v
   │          Fetch User Profile
   │          (Line API call)
   │              │
   │              v
   │          Return User Data
   │<─────────────┘ (HTTP response)
   │
   v
Store in
localStorage
   │
   v
Update Context
   │
   v
Redirect to
/games
   │
   v
Display
User Profile
```

---

This documentation provides visual representations of:
- Authentication flow sequence
- Network request lifecycle  
- Component communication
- State management
- Error handling
- Deployment architecture
- Security layers
- Token lifecycle
- Data flow
