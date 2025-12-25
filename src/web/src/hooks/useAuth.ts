import { useCallback, useEffect, useState } from 'react';

export interface LineUser {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface AuthContext {
  user: LineUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const STORAGE_KEY = 'line_user_data';
const CHANNEL_ID = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID || '';
const BACKEND_API_URL = process.env.NEXT_PUBLIC_LINE_BACKEND_URL || 'http://localhost:7071';
const REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/callback` : '';

export function useAuth(): AuthContext {
  const [user, setUser] = useState<LineUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('Failed to parse stored user data', e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(() => {
    if (!CHANNEL_ID) {
      console.error('LINE_CHANNEL_ID is not configured');
      alert('LINE authentication is not configured. Please set NEXT_PUBLIC_LINE_CHANNEL_ID environment variable.');
      return;
    }

    // Generate state parameter for CSRF protection
    const state = Math.random().toString(36).substring(7);
    localStorage.setItem('line_state', state);

    // Construct LINE OAuth authorization URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CHANNEL_ID,
      redirect_uri: REDIRECT_URI,
      state,
      scope: 'profile openid email',
    });

    // Use correct LINE OAuth 2.0 endpoint from official documentation
    const authUrl = `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
    console.log('Redirecting to LINE OAuth:', authUrl);
    window.location.href = authUrl;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('line_state');
    localStorage.removeItem('line_nonce');
    // Optionally clear LINE tokens if stored
    localStorage.removeItem('line_access_token');
    localStorage.removeItem('line_id_token');
  }, []);

  return {
    user,
    isLoading,
    isLoggedIn: !!user,
    login,
    logout,
  };
}

export function setStoredUser(user: LineUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function getStoredUser(): LineUser | null {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}
