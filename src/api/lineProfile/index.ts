import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { getUserProfile } from '../src/lineAuth';
import {
  addCorsHeaders,
  createJsonResponse,
  createErrorResponse,
  handleCorsPreFlight,
} from '../src/corsUtils';

app.http('lineProfile', {
  methods: ['GET', 'POST', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: async (
    request: HttpRequest,
    context: InvocationContext
  ): Promise<HttpResponseInit> => {
    context.log('Line profile endpoint triggered');

    // Handle CORS preflight
    const corsPreFlight = handleCorsPreFlight(request);
    if (corsPreFlight) {
      return corsPreFlight;
    }

    try {
      // Get access token from Authorization header
      const authHeader = request.headers.get('authorization');

      if (!authHeader) {
        context.log('Missing authorization header');
        return createErrorResponse('Missing authorization header', 401, request);
      }

      const token = authHeader.replace('Bearer ', '');

      if (!token) {
        context.log('Invalid authorization header format');
        return createErrorResponse('Invalid authorization header', 401, request);
      }

      context.log('Fetching user profile');

      // Fetch user profile from LINE API
      const user = await getUserProfile(token);

      context.log(`Successfully fetched profile for user: ${user.userId}`);

      // Return user data
      const response = createJsonResponse(
        {
          success: true,
          user,
        },
        200,
        request
      );

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      context.log(`Profile fetch error: ${message}`);

      return createErrorResponse(message, 400, request);
    }
  },
});
