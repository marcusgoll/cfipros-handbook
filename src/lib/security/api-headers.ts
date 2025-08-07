import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { SecurityHeaders } from './headers';

/**
 * API-specific security headers configuration
 * Optimized for JSON API responses and different security requirements
 */

export class APISecurityHeaders extends SecurityHeaders {
  constructor() {
    super({
      enableHSTS: true,
      enableCSP: false, // CSP is typically not needed for JSON APIs
      enableFrameOptions: true,
      enableContentTypeOptions: true,
      enableReferrerPolicy: true,
      enablePermissionsPolicy: false, // Not typically needed for APIs
    });
  }

  /**
   * Apply API-specific security headers
   */
  applyAPIHeaders(response: NextResponse): NextResponse {
    // Apply base security headers
    this.applyHeaders(response);

    // API-specific headers
    response.headers.set('X-API-Version', '1.0');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    // Remove CSP header for API routes (not needed for JSON responses)
    response.headers.delete('Content-Security-Policy');
    response.headers.delete('Content-Security-Policy-Report-Only');

    // CORS headers for API routes
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    } else {
      // Set appropriate production origins
      const allowedOrigins = [
        'https://cfipros.com',
        'https://www.cfipros.com',
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      ].filter(Boolean);

      // For production, implement proper CORS validation
      response.headers.set('Access-Control-Allow-Origin', allowedOrigins[0] || 'https://cfipros.com');
    }

    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Max-Age', '86400');

    return response;
  }

  /**
   * Create a higher-order function to wrap API route handlers with security headers
   */
  withAPIHeaders<T extends any[]>(
    handler: (request: NextRequest, ...args: T) => Promise<NextResponse> | NextResponse,
  ) {
    return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
      try {
        // Handle preflight requests
        if (request.method === 'OPTIONS') {
          const response = new NextResponse(null, { status: 200 });
          return this.applyAPIHeaders(response);
        }

        // Execute the handler
        const response = await handler(request, ...args);

        // Apply security headers to the response
        return this.applyAPIHeaders(response);
      } catch (error) {
        console.error('API handler error:', error);

        // Create error response with security headers
        const errorResponse = NextResponse.json(
          { error: 'Internal Server Error' },
          { status: 500 },
        );

        return this.applyAPIHeaders(errorResponse);
      }
    };
  }
}

// Export singleton instance
export const apiSecurityHeaders = new APISecurityHeaders();

/**
 * Utility function to wrap API route handlers
 */
export function withSecurityHeaders<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse> | NextResponse,
) {
  return apiSecurityHeaders.withAPIHeaders(handler);
}

/**
 * Middleware function specifically for API routes
 */
export function apiSecurityMiddleware(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  return apiSecurityHeaders.applyAPIHeaders(response);
}
