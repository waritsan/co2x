import axios from 'axios';

interface LineTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string;
}

interface LineUserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface LineUserData {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  email?: string;
}

const LINE_CHANNEL_ID = process.env.LINE_CHANNEL_ID || '';
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || '';

if (!LINE_CHANNEL_ID || !LINE_CHANNEL_SECRET) {
  console.warn('LINE_CHANNEL_ID or LINE_CHANNEL_SECRET not configured');
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<LineTokenResponse> {
  try {
    const response = await axios.post<LineTokenResponse>(
      'https://api.line.me/oauth2/v2.1/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: LINE_CHANNEL_ID,
        client_secret: LINE_CHANNEL_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const details = error.response?.data || error.message;
      throw new Error(`Failed to exchange code for token: ${JSON.stringify(details)}`);
    }
    throw error;
  }
}

/**
 * Fetch user profile from LINE API
 */
export async function getUserProfile(accessToken: string): Promise<LineUserData> {
  try {
    const response = await axios.get<LineUserProfile>(
      'https://api.line.me/v2/profile',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 10000,
      }
    );

    return {
      userId: response.data.userId,
      displayName: response.data.displayName,
      pictureUrl: response.data.pictureUrl,
      statusMessage: response.data.statusMessage,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const details = error.response?.data || error.message;
      throw new Error(`Failed to fetch user profile: ${JSON.stringify(details)}`);
    }
    throw error;
  }
}

/**
 * Handle complete OAuth flow: exchange code and get user profile
 */
export async function handleOAuthCallback(
  code: string,
  redirectUri: string
): Promise<{ user: LineUserData; accessToken: string }> {
  // Exchange code for token
  const tokenData = await exchangeCodeForToken(code, redirectUri);

  // Fetch user profile
  const user = await getUserProfile(tokenData.access_token);

  return {
    user,
    accessToken: tokenData.access_token,
  };
}
