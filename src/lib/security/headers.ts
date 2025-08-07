import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Security Headers Configuration
 * Comprehensive security headers for production deployment
 */

// Content Security Policy directives
const CSP_DIRECTIVES = {
  'default-src': ['\'self\''],
  'script-src': [
    '\'self\'',
    '\'unsafe-eval\'', // Required for Next.js
    '\'unsafe-inline\'', // Required for Next.js and some libraries
    'https://clerk.cfipros.com',
    'https://*.clerk.accounts.dev',
    'https://js.sentry-io',
    'https://browser.sentry-io',
    'https://us.i.posthog.com',
    'https://app.posthog.com',
    'https://cdn.jsdelivr.net',
    'https://unpkg.com',
  ],
  'style-src': [
    '\'self\'',
    '\'unsafe-inline\'', // Required for CSS-in-JS and Tailwind
    'https://fonts.googleapis.com',
    'https://cdn.jsdelivr.net',
  ],
  'font-src': [
    '\'self\'',
    'https://fonts.gstatic.com',
    'https://cdn.jsdelivr.net',
    'data:',
  ],
  'img-src': [
    '\'self\'',
    'data:',
    'blob:',
    'https:',
    'https://img.clerk.com',
    'https://images.clerk.dev',
    'https://cdn.jsdelivr.net',
  ],
  'connect-src': [
    '\'self\'',
    'https://clerk.cfipros.com',
    'https://*.clerk.accounts.dev',
    'https://api.clerk.com',
    'https://clerk-telemetry.com',
    'https://o4506965584756736.ingest.us.sentry.io',
    'https://us.i.posthog.com',
    'https://app.posthog.com',
    'wss://ws.pusher.com',
    'https://vitals.vercel-insights.com',
    process.env.NODE_ENV === 'development' ? 'ws://localhost:*' : null,
    process.env.NODE_ENV === 'development' ? 'http://localhost:*' : null,
  ].filter(Boolean),
  'frame-src': [
    '\'self\'',
    'https://clerk.cfipros.com',
    'https://*.clerk.accounts.dev',
    'https://js.sentry-io',
  ],
  'worker-src': [
    '\'self\'',
    'blob:',
  ],
  'child-src': [
    '\'self\'',
    'blob:',
  ],
  'object-src': ['\'none\''],
  'base-uri': ['\'self\''],
  'form-action': [
    '\'self\'',
    'https://clerk.cfipros.com',
    'https://*.clerk.accounts.dev',
  ],
  'frame-ancestors': ['\'none\''],
  'upgrade-insecure-requests': [],
};

// Environment-specific CSP modifications
const getCSPDirectives = (isDevelopment: boolean) => {
  const directives = { ...CSP_DIRECTIVES };

  if (isDevelopment) {
    // Allow localhost for development
    directives['script-src'].push('http://localhost:*', 'ws://localhost:*');
    directives['connect-src'].push('http://localhost:*', 'ws://localhost:*');
    directives['style-src'].push('http://localhost:*');
  }

  return directives;
};

// Convert CSP directives to string
const buildCSPString = (directives: Record<string, string[]>): string => {
  return Object.entries(directives)
    .map(([directive, values]) => {
      if (values.length === 0) {
        return directive;
      }
      return `${directive} ${values.join(' ')}`;
    })
    .join('; ');
};

// Security headers configuration
export type SecurityHeadersConfig = {
  enableHSTS?: boolean;
  enableCSP?: boolean;
  enableFrameOptions?: boolean;
  enableContentTypeOptions?: boolean;
  enableReferrerPolicy?: boolean;
  enablePermissionsPolicy?: boolean;
  reportOnly?: boolean;
  customCSP?: Partial<typeof CSP_DIRECTIVES>;
};

export class SecurityHeaders {
  private config: Required<SecurityHeadersConfig>;
  private isDevelopment: boolean;

  constructor(config: SecurityHeadersConfig = {}) {
    this.config = {
      enableHSTS: config.enableHSTS ?? true,
      enableCSP: config.enableCSP ?? true,
      enableFrameOptions: config.enableFrameOptions ?? true,
      enableContentTypeOptions: config.enableContentTypeOptions ?? true,
      enableReferrerPolicy: config.enableReferrerPolicy ?? true,
      enablePermissionsPolicy: config.enablePermissionsPolicy ?? true,
      reportOnly: config.reportOnly ?? false,
      customCSP: config.customCSP ?? {},
    };

    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * Apply security headers to a NextResponse
   */
  applyHeaders(response: NextResponse): NextResponse {
    // HTTP Strict Transport Security (HSTS)
    if (this.config.enableHSTS && !this.isDevelopment) {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload',
      );
    }

    // Content Security Policy
    if (this.config.enableCSP) {
      const directives = {
        ...getCSPDirectives(this.isDevelopment),
        ...this.config.customCSP,
      };

      const cspString = buildCSPString(directives);
      const headerName = this.config.reportOnly
        ? 'Content-Security-Policy-Report-Only'
        : 'Content-Security-Policy';

      response.headers.set(headerName, cspString);
    }

    // X-Frame-Options
    if (this.config.enableFrameOptions) {
      response.headers.set('X-Frame-Options', 'DENY');
    }

    // X-Content-Type-Options
    if (this.config.enableContentTypeOptions) {
      response.headers.set('X-Content-Type-Options', 'nosniff');
    }

    // Referrer Policy
    if (this.config.enableReferrerPolicy) {
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    // Permissions Policy
    if (this.config.enablePermissionsPolicy) {
      const permissionsPolicy = [
        'accelerometer=()',
        'autoplay=()',
        'camera=()',
        'cross-origin-isolated=()',
        'display-capture=()',
        'encrypted-media=()',
        'fullscreen=(self)',
        'geolocation=()',
        'gyroscope=()',
        'keyboard-map=()',
        'magnetometer=()',
        'microphone=()',
        'midi=()',
        'payment=()',
        'picture-in-picture=()',
        'publickey-credentials-get=()',
        'screen-wake-lock=()',
        'sync-xhr=()',
        'usb=()',
        'web-share=()',
        'xr-spatial-tracking=()',
      ].join(', ');

      response.headers.set('Permissions-Policy', permissionsPolicy);
    }

    // Additional security headers
    response.headers.set('X-DNS-Prefetch-Control', 'off');
    response.headers.set('X-Download-Options', 'noopen');
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

    return response;
  }

  /**
   * Create a middleware function that applies security headers
   */
  middleware() {
    return (request: NextRequest): NextResponse => {
      const response = NextResponse.next();
      return this.applyHeaders(response);
    };
  }

  /**
   * Validate that required security headers are present
   */
  validateHeaders(headers: Headers): { isValid: boolean; missing: string[] } {
    const requiredHeaders = [];
    const missing = [];

    if (this.config.enableHSTS && !this.isDevelopment) {
      requiredHeaders.push('strict-transport-security');
    }

    if (this.config.enableCSP) {
      requiredHeaders.push('content-security-policy');
    }

    if (this.config.enableFrameOptions) {
      requiredHeaders.push('x-frame-options');
    }

    if (this.config.enableContentTypeOptions) {
      requiredHeaders.push('x-content-type-options');
    }

    if (this.config.enableReferrerPolicy) {
      requiredHeaders.push('referrer-policy');
    }

    for (const header of requiredHeaders) {
      if (!headers.has(header)) {
        missing.push(header);
      }
    }

    return {
      isValid: missing.length === 0,
      missing,
    };
  }
}

// Export default security headers instance
export const defaultSecurityHeaders = new SecurityHeaders();

// Export specialized configurations
export const reportOnlySecurityHeaders = new SecurityHeaders({
  reportOnly: true,
});

export const developmentSecurityHeaders = new SecurityHeaders({
  enableHSTS: false,
  reportOnly: true,
});
