'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { setStoredUser, LineUser } from '@/hooks/useAuth';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_LINE_BACKEND_URL || '';

export default function CallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const storedState = localStorage.getItem('line_state');

        // Verify state parameter (CSRF protection)
        if (state !== storedState) {
          throw new Error('State mismatch - possible CSRF attack');
        }

        if (!code) {
          throw new Error('No authorization code received from LINE');
        }

        if (BACKEND_API_URL) {
          // Exchange code with backend API
          await exchangeCodeWithBackend(code);
        } else {
          // Fallback: Create a mock user for demo purposes
          await createMockUser();
        }

        // Clear temporary storage
        localStorage.removeItem('line_state');
        localStorage.removeItem('line_nonce');

        // Redirect to games page
        router.push('/games');
      } catch (err) {
        console.error('Callback error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [router]);

  const exchangeCodeWithBackend = async (code: string) => {
    try {
      const callbackUrl = `${BACKEND_API_URL}/api/lineCallback?code=${encodeURIComponent(code)}`;
      
      const response = await fetch(callbackUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `Backend error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.user) {
        throw new Error('No user data returned from backend');
      }

      const userProfile: LineUser = {
        userId: data.user.userId,
        displayName: data.user.displayName,
        pictureUrl: data.user.pictureUrl,
        statusMessage: data.user.statusMessage,
      };

      // Store user profile
      setStoredUser(userProfile);
    } catch (err) {
      console.error('Backend exchange failed:', err);
      throw err instanceof Error ? err : new Error('Failed to exchange authorization code with backend');
    }
  };

  const createMockUser = async () => {
    // Create a mock user for demo when no backend is configured
    const randomId = Math.random().toString(36).substring(7).toUpperCase();
    const mockUser: LineUser = {
      userId: 'U' + Math.random().toString(36).substring(7),
      displayName: 'LINE User ' + randomId,
      pictureUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Ccircle cx="100" cy="100" r="100" fill="%2300B900"/%3E%3Ctext x="100" y="120" font-size="40" fill="white" text-anchor="middle" font-family="Arial"%3ELINE%3C/text%3E%3C/svg%3E',
      statusMessage: 'Using CO2X Platform',
    };

    setStoredUser(mockUser);
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Completing LINE login...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Login Error</h1>
          <p className="text-gray-700 mb-6 text-sm">{error}</p>
          <div className="space-y-2">
            <Link
              href="/games"
              className="block px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Back to Games
            </Link>
            <Link
              href="/"
              className="block px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
