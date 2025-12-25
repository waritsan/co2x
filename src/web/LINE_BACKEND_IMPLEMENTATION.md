# LINE Login Backend Implementation Guide

This guide shows how to implement a backend service to handle LINE OAuth 2.0 token exchange.

## Backend Architecture

Your backend service should handle the `/api/line/callback` endpoint to exchange the authorization code for user data.

## Node.js/Express Example

```typescript
import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

const LINE_CHANNEL_ID = process.env.LINE_CHANNEL_ID;
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
const LINE_REDIRECT_URI = process.env.LINE_REDIRECT_URI; // e.g., https://yourdomain.com/callback

app.post('/api/line/callback', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'No authorization code provided' });
    }

    // Exchange code for tokens
    const tokenResponse = await axios.post('https://api.line.me/v2/oauth/token', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: LINE_REDIRECT_URI,
        client_id: LINE_CHANNEL_ID,
        client_secret: LINE_CHANNEL_SECRET,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, id_token } = tokenResponse.data;

    // Decode ID token to get user info
    const decodedToken = jwt.decode(id_token) as any;
    const userProfile = {
      userId: decodedToken.sub,
      displayName: decodedToken.name,
      pictureUrl: decodedToken.picture,
      statusMessage: decodedToken.status_message || '',
    };

    // Optional: Get additional user profile from LINE API
    const userApiResponse = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    const finalUserProfile = {
      userId: userApiResponse.data.userId,
      displayName: userApiResponse.data.displayName,
      pictureUrl: userApiResponse.data.pictureUrl,
      statusMessage: userApiResponse.data.statusMessage || '',
    };

    // Return user data and tokens to frontend
    res.json({
      ...finalUserProfile,
      accessToken: access_token,
      idToken: id_token,
    });
  } catch (error) {
    console.error('LINE callback error:', error);
    res.status(500).json({ error: 'Failed to process LINE login' });
  }
});

export default app;
```

## Environment Variables

```bash
# LINE Developer Console
LINE_CHANNEL_ID=your_channel_id
LINE_CHANNEL_SECRET=your_channel_secret
LINE_REDIRECT_URI=https://yourdomain.com/callback

# For local testing
LINE_REDIRECT_URI=http://localhost:3000/callback
```

## API Response Format

The `/api/line/callback` endpoint should return:

```json
{
  "userId": "U1234567890abcdef...",
  "displayName": "User Name",
  "pictureUrl": "https://profile.line-scdn.net/...",
  "statusMessage": "Hello!",
  "accessToken": "jwtAccessToken...",
  "idToken": "jwtIdToken..."
}
```

## Python/Flask Example

```python
from flask import Flask, request, jsonify
import requests
import json
from functools import wraps
import os

app = Flask(__name__)

LINE_CHANNEL_ID = os.environ.get('LINE_CHANNEL_ID')
LINE_CHANNEL_SECRET = os.environ.get('LINE_CHANNEL_SECRET')
LINE_REDIRECT_URI = os.environ.get('LINE_REDIRECT_URI')

@app.route('/api/line/callback', methods=['POST'])
def line_callback():
    try:
        data = request.get_json()
        code = data.get('code')
        
        if not code:
            return jsonify({'error': 'No authorization code provided'}), 400
        
        # Exchange code for tokens
        token_response = requests.post(
            'https://api.line.me/v2/oauth/token',
            data={
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': LINE_REDIRECT_URI,
                'client_id': LINE_CHANNEL_ID,
                'client_secret': LINE_CHANNEL_SECRET,
            }
        )
        
        if token_response.status_code != 200:
            return jsonify({'error': 'Failed to exchange code'}), 500
        
        tokens = token_response.json()
        access_token = tokens.get('access_token')
        
        # Get user profile
        profile_response = requests.get(
            'https://api.line.me/v2/profile',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        
        if profile_response.status_code != 200:
            return jsonify({'error': 'Failed to get profile'}), 500
        
        profile = profile_response.json()
        
        return jsonify({
            'userId': profile['userId'],
            'displayName': profile['displayName'],
            'pictureUrl': profile.get('pictureUrl'),
            'statusMessage': profile.get('statusMessage', ''),
            'accessToken': access_token,
            'idToken': tokens.get('id_token'),
        })
    
    except Exception as e:
        print(f'Error in LINE callback: {e}')
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=3001)
```

## Security Considerations

1. **State Parameter**: Always verify the state parameter to prevent CSRF attacks (already implemented in frontend)
2. **HTTPS Only**: Only use HTTPS for redirect URIs in production
3. **Secret Management**: Never expose `LINE_CHANNEL_SECRET` in frontend code
4. **Token Storage**: Store tokens securely (HttpOnly cookies recommended over localStorage)
5. **CORS**: Configure proper CORS headers to only allow requests from your frontend domain
6. **Rate Limiting**: Implement rate limiting on the callback endpoint

## Testing Locally

1. Set `NEXT_PUBLIC_LINE_BACKEND_URL=http://localhost:3001` in your frontend `.env.local`
2. Run your backend server on port 3001
3. Use LINE's test channel or create a new one for development
4. Update the OAuth redirect URI in LINE Developers Console to include `http://localhost:3000/callback`

## Production Deployment

1. Deploy your backend to a secure hosting service (Azure App Service, AWS Lambda, Vercel, etc.)
2. Update `NEXT_PUBLIC_LINE_BACKEND_URL` in your Static Web App configuration
3. Configure the redirect URI in LINE Developers Console to match your production domain
4. Set environment variables securely in your hosting platform
5. Enable HTTPS everywhere

## Troubleshooting

- **State mismatch error**: Clear localStorage and try again
- **Code exchange fails**: Verify LINE_CHANNEL_SECRET and redirect URI in LINE Developers Console
- **No profile returned**: Ensure your access token has the correct scopes (profile, openid)
- **CORS errors**: Check that your backend allows requests from your frontend domain
