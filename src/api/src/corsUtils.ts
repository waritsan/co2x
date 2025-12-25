import { HttpRequest, HttpResponse } from '@azure/functions';

export interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  allowCredentials: boolean;
}

const DEFAULT_CORS_CONFIG: CorsConfig = {
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  allowedMethods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  allowCredentials: true,
};

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(
  response: HttpResponse,
  request: HttpRequest,
  config: CorsConfig = DEFAULT_CORS_CONFIG
): HttpResponse {
  const origin = request.headers.get('origin') || request.headers.get('referer');
  
  // Check if origin is allowed
  const isOriginAllowed = origin && config.allowedOrigins.some(allowed => {
    return origin.startsWith(allowed);
  });

  if (isOriginAllowed) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', config.allowedMethods.join(', '));
    response.headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

/**
 * Handle preflight CORS requests
 */
export function handleCorsPreFlight(request: HttpRequest): HttpResponse | null {
  if (request.method === 'OPTIONS') {
    const response = new HttpResponse({
      status: 204,
      body: '',
    });
    return addCorsHeaders(response, request);
  }
  return null;
}

/**
 * Create JSON response with CORS headers
 */
export function createJsonResponse(
  data: any,
  statusCode: number = 200,
  request?: HttpRequest
): HttpResponse {
  const response = new HttpResponse({
    status: statusCode,
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (request) {
    return addCorsHeaders(response, request);
  }

  return response;
}

/**
 * Create error response with CORS headers
 */
export function createErrorResponse(
  error: string | Error,
  statusCode: number = 400,
  request?: HttpRequest
): HttpResponse {
  const message = error instanceof Error ? error.message : error;
  return createJsonResponse(
    {
      error: message,
      timestamp: new Date().toISOString(),
    },
    statusCode,
    request
  );
}
