import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { handleOAuthCallback } from '../src/lineAuth';
import {
  addCorsHeaders,
  createJsonResponse,
  createErrorResponse,
  handleCorsPreFlight,
} from '../src/corsUtils';

const REDIRECT_URI =
  process.env.LINE_REDIRECT_URI || 'http://localhost:7071/api/lineCallback';

app.http('lineCallback', {
  methods: ['GET', 'POST', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: async (
    request: HttpRequest,
    context: InvocationContext
  ): Promise<HttpResponseInit> => {
    context.log('Line OAuth callback triggered');

    // Handle CORS preflight
    const corsPreFlight = handleCorsPreFlight(request);
    if (corsPreFlight) {
      return corsPreFlight;
    }

    try {
      // Get authorization code from query parameter
      const code = request.query.get('code');
      const state = request.query.get('state');

      if (!code) {
        context.log('Missing authorization code');
        return createErrorResponse(
          'Missing authorization code',
          400,
          request
        );
      }

      context.log(`Processing OAuth callback with code: ${code.substring(0, 10)}...`);

      // Exchange code for token and fetch user profile
      const { user, accessToken } = await handleOAuthCallback(
        code,
        REDIRECT_URI
      );

      context.log(`Successfully authenticated user: ${user.userId}`);

      // Return user data to frontend
      const response = createJsonResponse(
        {
          success: true,
          user,
          // Note: In production, you would NOT return the access token to the client
          // Instead, you'd create a session/JWT and return that
          // For demo purposes, we're showing the full flow
        },
        200,
        request
      );

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      context.log(`OAuth callback error: ${message}`);

      return createErrorResponse(message, 400, request);
    }
  },
});
