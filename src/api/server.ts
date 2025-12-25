import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local BEFORE importing other modules that use env vars
dotenv.config({ path: '.env.local' });

import { handleOAuthCallback, getUserProfile } from './src/lineAuth';

const app = express();
const PORT = 7071;

// Middleware
app.use(express.json());

// CORS middleware
app.use((req: Request, res: Response, next) => {
  const origin = req.headers.origin || req.headers.referer;
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim());
  
  if (origin && allowedOrigins.some(allowed => origin.startsWith(allowed))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }
  
  next();
});

// Line Callback endpoint
app.get('/api/lineCallback', async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const state = req.query.state as string;

    if (!code) {
      return res.status(400).json({
        error: 'Missing authorization code',
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`Processing OAuth callback with code: ${code.substring(0, 10)}...`);

    // Use the frontend's callback URL as redirect_uri (must match the authorization request)
    const redirectUri = 'http://localhost:3000/callback';
    const { user } = await handleOAuthCallback(code, redirectUri);

    console.log(`Successfully authenticated user: ${user.userId}`);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`OAuth callback error: ${message}`);

    res.status(400).json({
      error: message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Line Profile endpoint
app.get('/api/lineProfile', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Missing authorization header',
        timestamp: new Date().toISOString(),
      });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: 'Invalid authorization header',
        timestamp: new Date().toISOString(),
      });
    }

    console.log('Fetching user profile');

    const user = await getUserProfile(token);

    console.log(`Successfully fetched profile for user: ${user.userId}`);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Profile fetch error: ${message}`);

    res.status(400).json({
      error: message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ LINE OAuth Backend API running on http://localhost:${PORT}`);
  console.log(`\n📍 Available endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/lineCallback?code=...&state=...`);
  console.log(`   GET  http://localhost:${PORT}/api/lineProfile`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`\n🔑 Configuration loaded from .env.local`);
  console.log(`\n🚀 Ready to handle OAuth callbacks from LINE\n`);
});
