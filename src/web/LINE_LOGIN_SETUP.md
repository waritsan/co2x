# LINE Login Configuration

To enable LINE login functionality, you'll need to configure the following environment variables:

## Environment Variables

### .env.local (for local development)
```
NEXT_PUBLIC_LINE_CHANNEL_ID=your_line_channel_id_here
NEXT_PUBLIC_LINE_BACKEND_URL=your_backend_url_here  # Optional - for full OAuth flow
```

### Azure Static Web Apps - Configuration

Add these environment variables in your Azure Static Web Apps settings:

1. `NEXT_PUBLIC_LINE_CHANNEL_ID` - Your LINE Login Channel ID
2. `NEXT_PUBLIC_LINE_BACKEND_URL` - Backend URL for OAuth token exchange (optional)

## Setup Instructions

### 1. Create LINE Login Channel

1. Go to [LINE Developers Console](https://developers.line.biz/en/)
2. Create a new provider or select existing one
3. Create a new "LINE Login" channel
4. Copy your **Channel ID** to the environment variables

### 2. Configure Redirect URI

In LINE Developers Console, set the OAuth 2.0 redirect URI to:
```
https://yourdomain.com/callback
https://localhost:3000/callback  # For local development
```

### 3. Backend Implementation (Optional)

For a complete OAuth 2.0 flow, you'll need a backend to:
- Exchange authorization code for access token
- Fetch user profile information from LINE
- Store tokens securely

Without a backend, users will need to provide their profile data manually.

## Current Implementation

The current implementation:
- ✅ Initiates LINE Login flow
- ✅ Handles OAuth 2.0 authorization code flow
- ✅ Verifies state parameter (CSRF protection)
- ❌ Requires backend for token exchange (not yet implemented)
- ❌ Limited to manual user profile entry

## Implementation Notes

- User data is stored in `localStorage` with key `line_user_data`
- The app uses LINE's web login at `https://web-login.line.biz/web/login`
- LIFF (LINE Front-end Framework) can be used for LINE Mini App integration
- All authentication happens client-side for now - security limitations apply
