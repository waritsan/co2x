# LINE Login Feature - Quick Start

Welcome! LINE login has been successfully integrated into CO2X. Here's everything you need to know.

## 🎯 What Was Added?

- **Login Button** in the header (games page)
- **User Profile** display when logged in
- **OAuth 2.0** authentication flow with LINE
- **Demo Mode** for testing without backend
- **localStorage** persistence across sessions

## ⚡ 5-Minute Setup

### Step 1: Get LINE Channel ID

1. Go to https://developers.line.biz/en/
2. Create or select your channel
3. Create new "LINE Login" channel if needed
4. Copy your **Channel ID** (looks like: `123456789`)

### Step 2: Configure Environment

Create `.env.local` in `src/web/`:

```bash
NEXT_PUBLIC_LINE_CHANNEL_ID=your_channel_id_here
```

### Step 3: Set Redirect URI in LINE Console

In LINE Developers Console, set OAuth redirect URI:
- Local: `http://localhost:3000/callback`
- Production: `https://yourdomain.com/callback`

### Step 4: Test It!

```bash
cd src/web
pnpm dev
```

Open http://localhost:3000/games and click "Login with LINE"

## 🧪 Testing Without Backend

The app works in **demo mode** when no backend is configured:
- ✅ Full login flow works
- ✅ Mock user created
- ✅ Perfect for UI testing
- ⚠️ Doesn't fetch real LINE profile

## 🔌 Adding a Backend (Optional)

For **real user data**, implement a backend service:

```javascript
// Your backend endpoint: POST /api/line/callback
// Receives: { code: "authorization_code" }
// Returns: { userId, displayName, pictureUrl, accessToken, idToken }
```

See [LINE_BACKEND_IMPLEMENTATION.md](LINE_BACKEND_IMPLEMENTATION.md) for examples.

Then update `.env.local`:
```bash
NEXT_PUBLIC_LINE_BACKEND_URL=https://your-backend.com
```

## 📱 Where Is the Login Button?

- **Desktop:** Top navigation bar (next to "Demo App" badge)
- **Mobile:** In the hamburger menu
- **When Logged In:** Shows profile picture + username

## 🔐 Security

- ✅ CSRF protection (state parameter verification)
- ✅ Secure OAuth 2.0 flow
- ✅ No sensitive data exposed in frontend
- ✅ localStorage for user data (can upgrade to HttpOnly cookies)

## 🐛 Troubleshooting

### "Login with LINE" button not showing?
- Verify `AuthProvider` is in [layout.tsx](src/app/layout.tsx)
- Check browser console for errors

### Login fails with state mismatch error?
- Clear localStorage: open DevTools > Application > Clear Storage
- Try login again

### Backend not connecting?
- Verify `NEXT_PUBLIC_LINE_BACKEND_URL` is correct
- Check backend is running
- Ensure CORS is configured
- Check Channel Secret is set on backend

## 📚 Documentation

For more detailed information, see:

| Document | For |
|----------|-----|
| [LINE_LOGIN_SUMMARY.md](LINE_LOGIN_SUMMARY.md) | Overview & features |
| [LINE_LOGIN_SETUP.md](LINE_LOGIN_SETUP.md) | Detailed setup instructions |
| [LINE_LOGIN_TESTING.md](LINE_LOGIN_TESTING.md) | Testing procedures |
| [LINE_BACKEND_IMPLEMENTATION.md](LINE_BACKEND_IMPLEMENTATION.md) | Backend implementation |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Pre-deployment checklist |
| [FILE_REFERENCE.md](FILE_REFERENCE.md) | File mapping & architecture |

## 🚀 Deployment

### To Azure Static Web App:

1. Set environment variables in Azure portal:
   - `NEXT_PUBLIC_LINE_CHANNEL_ID` = your channel ID
   - `NEXT_PUBLIC_LINE_BACKEND_URL` = backend URL (if applicable)

2. Update redirect URI in LINE Console to your production domain

3. Deploy with: `azd deploy`

See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for complete steps.

## 📊 Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Auth:** LINE OAuth 2.0
- **Storage:** localStorage
- **State:** React hooks + Context API
- **Styling:** Tailwind CSS

## 🔄 Integration with Your App

### Use Auth in Any Component

```tsx
'use client';

import { useAuthContext } from '@/components/AuthProvider';

export function MyComponent() {
  const { user, isLoggedIn, login, logout } = useAuthContext();
  
  return isLoggedIn ? (
    <div>Hello, {user?.displayName}!</div>
  ) : (
    <button onClick={login}>Login</button>
  );
}
```

## 📞 Need Help?

1. **Check Documentation:** See links above
2. **LINE Support:** https://developers.line.biz/en/services/support/
3. **Team:** Ask your team lead

## ✅ Checklist for Going Live

- [ ] LINE Channel ID configured
- [ ] Tested locally with demo mode
- [ ] Tested with backend (if applicable)
- [ ] Tested on mobile device
- [ ] Redirect URI added to LINE Console
- [ ] Environment variables set in Azure
- [ ] Deployed to staging
- [ ] Tested on staging domain
- [ ] Ready for production!

---

**Happy coding! 🎉**

For detailed technical documentation, start with [FILE_REFERENCE.md](FILE_REFERENCE.md).
