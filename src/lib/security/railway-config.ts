/**
 * Railway-specific security configuration
 * Handles Railway deployment environment and security headers
 */

import type { SecurityHeadersConfig } from './headers';
import { SecurityHeaders } from './headers';

/**
 * Get security configuration optimized for Railway deployment
 */
export function getRailwaySecurityConfig(): SecurityHeadersConfig {
  const isProduction = process.env.NODE_ENV === 'production';
  const isRailway = !!process.env.RAILWAY_ENVIRONMENT;
  const railwayEnv = process.env.RAILWAY_ENVIRONMENT_NAME || 'development';

  // Railway production configuration
  if (isProduction && isRailway) {
    return {
      enableHSTS: true,
      enableCSP: true,
      enableFrameOptions: true,
      enableContentTypeOptions: true,
      enableReferrerPolicy: true,
      enablePermissionsPolicy: true,
      reportOnly: false,
      customCSP: {
        // Railway-specific CSP adjustments
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
          // Railway-specific domains
          'https://*.railway.app',
          'wss://*.railway.app',
        ],
        'script-src': [
          '\'self\'',
          '\'unsafe-eval\'',
          '\'unsafe-inline\'',
          'https://clerk.cfipros.com',
          'https://*.clerk.accounts.dev',
          'https://js.sentry-io',
          'https://browser.sentry-io',
          'https://us.i.posthog.com',
          'https://app.posthog.com',
          'https://cdn.jsdelivr.net',
          'https://unpkg.com',
        ],
      },
    };
  }

  // Railway staging/preview configuration
  if (isRailway && railwayEnv !== 'production') {
    return {
      enableHSTS: false, // Disable HSTS for staging
      enableCSP: true,
      enableFrameOptions: true,
      enableContentTypeOptions: true,
      enableReferrerPolicy: true,
      enablePermissionsPolicy: true,
      reportOnly: true, // Use report-only mode for staging
      customCSP: {
        'connect-src': [
          '\'self\'',
          'https://clerk.cfipros.com',
          'https://*.clerk.accounts.dev',
          'https://api.clerk.com',
          'https://o4506965584756736.ingest.us.sentry.io',
          'https://us.i.posthog.com',
          'https://*.railway.app',
          'wss://*.railway.app',
          // Allow staging/preview domains
          'https://*.up.railway.app',
        ],
      },
    };
  }

  // Local development configuration
  return {
    enableHSTS: false,
    enableCSP: true,
    enableFrameOptions: true,
    enableContentTypeOptions: true,
    enableReferrerPolicy: true,
    enablePermissionsPolicy: false,
    reportOnly: true,
    customCSP: {
      'connect-src': [
        '\'self\'',
        'http://localhost:*',
        'ws://localhost:*',
        'https://clerk.cfipros.com',
        'https://*.clerk.accounts.dev',
        'https://api.clerk.com',
        'https://o4506965584756736.ingest.us.sentry.io',
        'https://us.i.posthog.com',
      ],
      'script-src': [
        '\'self\'',
        '\'unsafe-eval\'',
        '\'unsafe-inline\'',
        'http://localhost:*',
        'https://clerk.cfipros.com',
        'https://*.clerk.accounts.dev',
        'https://js.sentry-io',
        'https://us.i.posthog.com',
      ],
    },
  };
}

/**
 * Create Railway-optimized security headers instance
 */
export function createRailwaySecurityHeaders(): SecurityHeaders {
  const config = getRailwaySecurityConfig();
  return new SecurityHeaders(config);
}

/**
 * Railway environment detection utilities
 */
export const RailwayUtils = {
  isRailway: (): boolean => !!process.env.RAILWAY_ENVIRONMENT,

  getEnvironment: (): string => process.env.RAILWAY_ENVIRONMENT_NAME || 'development',

  isProduction: (): boolean =>
    process.env.NODE_ENV === 'production'
    && process.env.RAILWAY_ENVIRONMENT_NAME === 'production',

  isStaging: (): boolean =>
    !!process.env.RAILWAY_ENVIRONMENT
    && process.env.RAILWAY_ENVIRONMENT_NAME !== 'production',

  getServiceDomain: (): string | null => {
    if (process.env.RAILWAY_STATIC_URL) {
      return process.env.RAILWAY_STATIC_URL;
    }
    if (process.env.RAILWAY_PUBLIC_DOMAIN) {
      return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
    }
    return null;
  },

  getInternalURL: (): string | null => {
    if (process.env.RAILWAY_PRIVATE_DOMAIN) {
      return `https://${process.env.RAILWAY_PRIVATE_DOMAIN}`;
    }
    return null;
  },
};

/**
 * Railway-specific security validation
 */
export function validateRailwaySecuritySetup(): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check environment configuration
  if (RailwayUtils.isRailway()) {
    if (!process.env.RAILWAY_ENVIRONMENT_NAME) {
      warnings.push('RAILWAY_ENVIRONMENT_NAME not set');
    }

    if (RailwayUtils.isProduction()) {
      // Production-specific checks
      if (!process.env.RAILWAY_PUBLIC_DOMAIN && !process.env.RAILWAY_STATIC_URL) {
        errors.push('No public domain configured for production');
      }
    }
  }

  // Check Clerk configuration for Railway
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    errors.push('Clerk publishable key not configured');
  }

  // Check Sentry configuration
  if (!process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DISABLED) {
    warnings.push('Sentry not configured - error tracking disabled');
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
}

// Export the default Railway-optimized security headers
export const railwaySecurityHeaders = createRailwaySecurityHeaders();
