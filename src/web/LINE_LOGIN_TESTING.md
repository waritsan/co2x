# LINE Login Testing Guide

## Manual Testing (Without Backend)

The application includes a **demo mode** that allows testing the complete login flow without setting up a backend service.

### Demo Mode Features

When `NEXT_PUBLIC_LINE_BACKEND_URL` is not configured:
- ✅ LINE OAuth flow still initiates
- ✅ Mock user created with random ID and name
- ✅ User profile shown in header
- ✅ Logout functionality works
- ✅ Perfect for UI/UX testing

### Steps to Test

#### 1. Start Development Server

```bash
cd src/web
pnpm dev
```

App will run at `http://localhost:3000`

#### 2. Navigate to Games Page

- Open http://localhost:3000/games
- You'll see "Login with LINE" button in the header (desktop) or menu (mobile)

#### 3. Click "Login with LINE"

The app will:
1. Generate a state and nonce
2. Redirect to LINE's login page at `https://web-login.line.biz/web/login`
3. After LINE authorization, redirect back to http://localhost:3000/callback

#### 4. Demo Mode Activation

Since no backend is configured:
- A mock LINE user is created
- User profile stored in localStorage
- You're redirected to `/games` page
- Header now shows your profile picture and name
- "Login with LINE" button is replaced with profile + logout option

#### 5. Test Logout

Click the red "Logout" button in the header to:
- Clear user data from localStorage
- Return to login state
- See "Login with LINE" button again

## Testing With Backend

If you want to test with real LINE user data:

### 1. Create a TEST Channel in LINE Developers Console

1. Go to [LINE Developers Console](https://developers.line.biz/en/)
2. Create a new channel with:
   - Display name: "CO2X Test"
   - Platform: "Web"
   - Channel type: "LINE Login"

3. In channel settings, get:
   - **Channel ID** → `NEXT_PUBLIC_LINE_CHANNEL_ID`
   - **Channel Secret** → Backend only (`LINE_CHANNEL_SECRET`)

### 2. Set Local Redirect URI

In LINE Developers Console > OAuth 2.0 settings, add redirect URI:
```
http://localhost:3000/callback
```

### 3. Setup Backend Locally

Choose one of these options:

#### Option A: Node.js/Express Backend

Create a simple Node.js server (see [LINE_BACKEND_IMPLEMENTATION.md](LINE_BACKEND_IMPLEMENTATION.md)):

```bash
mkdir backend-line && cd backend-line
npm init -y
npm install express axios jsonwebtoken dotenv cors
```

Copy the Express example from documentation and run:
```bash
node server.js
```

#### Option B: Use ngrok for Quick Testing

If you don't want to write backend code, use ngrok to expose a mock endpoint:

1. Install [ngrok](https://ngrok.com)
2. Start a simple mock server on port 3001
3. Run `ngrok http 3001`
4. Use ngrok URL as `NEXT_PUBLIC_LINE_BACKEND_URL`

### 4. Configure Frontend

Update `.env.local`:
```bash
NEXT_PUBLIC_LINE_CHANNEL_ID=your_test_channel_id
NEXT_PUBLIC_LINE_BACKEND_URL=http://localhost:3001
```

### 5. Test Real Login

1. Start frontend: `pnpm dev`
2. Start backend: `node server.js` (or your backend)
3. Click "Login with LINE"
4. Use your test LINE account
5. Verify real user profile is displayed

## Testing Scenarios

### Scenario 1: CSRF Attack Prevention

The app verifies the `state` parameter to prevent CSRF attacks.

**To test:**
1. Open browser DevTools
2. Clear localStorage
3. Manually edit the URL callback with wrong state:
   - Expected: `http://localhost:3000/callback?code=xxx&state=abc`
   - Tamperer tries: `http://localhost:3000/callback?code=xxx&state=wrong`
4. Error message should appear: "State mismatch - possible CSRF attack"

### Scenario 2: Missing Authorization Code

**To test:**
1. Visit `http://localhost:3000/callback?state=test`
2. Should see error: "No authorization code received from LINE"

### Scenario 3: Mobile Responsiveness

1. Open DevTools (F12)
2. Toggle device toolbar (mobile view)
3. Verify:
   - "Login with LINE" button text changes to "LINE" on mobile
   - Profile picture still visible
   - Logout button shrinks appropriately
   - No layout overflow

### Scenario 4: localStorage Persistence

1. Login successfully
2. Refresh the page (Cmd+R / Ctrl+R)
3. User should still be logged in
4. Check DevTools > Application > localStorage to see `line_user_data`

### Scenario 5: Error Recovery

1. During login flow, simulate network error (DevTools > Network > Offline)
2. Verify error page appears
3. Buttons to return to Games or Home should work

## Browser Developer Tools Inspection

### Check localStorage

```javascript
// In browser console
localStorage.getItem('line_user_data')
// Output: {"userId":"U...","displayName":"LINE User ABC",...}

localStorage.getItem('line_state')  // Should be cleared after login
localStorage.getItem('line_nonce')  // Should be cleared after login
```

### Check Console Logs

Look for these console messages during login flow:
```
Callback error: (if error occurred)
Line state: abc123 (state parameter stored)
```

## Network Inspection

Open DevTools > Network tab and watch:

1. **Initial Login Click:**
   - Redirect to `https://web-login.line.biz/web/login?...`

2. **After LINE Authorization:**
   - GET request to `http://localhost:3000/callback?code=xxx&state=yyy`

3. **Backend Integration (if configured):**
   - POST request to your backend at `/api/line/callback`

## Performance Testing

Check page load times:

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Test with lighthouse
# Open DevTools > Lighthouse > Generate report
```

Expected metrics:
- First Contentful Paint: < 1s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

## Automated Testing (Optional)

For integration tests with Cypress or Playwright:

```javascript
// Example with Playwright
import { test, expect } from '@playwright/test';

test('LINE login flow', async ({ page }) => {
  await page.goto('http://localhost:3000/games');
  
  // Check login button exists
  const loginBtn = page.getByRole('button', { name: /login with line/i });
  await expect(loginBtn).toBeVisible();
  
  // After login (demo mode)
  // ...navigate through OAuth flow...
  
  // Check user is logged in
  const logoutBtn = page.getByRole('button', { name: /logout/i });
  await expect(logoutBtn).toBeVisible();
});
```

## Troubleshooting Tests

| Issue | Solution |
|-------|----------|
| Button not appearing | Check AuthProvider is in layout.tsx |
| State mismatch error | Clear localStorage: `localStorage.clear()` |
| Backend not responding | Check backend is running and URL is correct |
| CORS errors | Configure CORS headers in backend |
| localStorage empty | Check private/incognito mode (different storage) |

## Useful LINE Test Accounts

LINE provides test accounts in Developers Console:
1. Go to Channels > Your Channel > Settings
2. Look for "Test Users" section
3. Create test users with different roles/profiles

## Report Issues

If you find issues during testing:
1. Check browser console for errors
2. Clear cache: `pnpm build && pnpm start`
3. Check environment variables are set correctly
4. Verify LINE Channel ID matches
5. Confirm redirect URI in LINE Developers Console

## Success Indicators

✅ Login flow works when:
- [ ] "Login with LINE" button appears in header
- [ ] Clicking opens LINE login page
- [ ] After authorization, user profile shows
- [ ] User name and picture display in header
- [ ] Logout button appears
- [ ] Logout clears user data
- [ ] Page refresh keeps user logged in
- [ ] No console errors
