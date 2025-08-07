// This file configures the initialization of Sentry for edge runtime.
// The config you add here will be used whenever middleware or an Edge API route is invoked.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV || 'development',

  // Edge runtime specific integrations
  integrations: [],

  // Performance monitoring (reduced for edge)
  tracesSampleRate: isProduction ? 0.05 : 0.5,

  // Edge-specific sampling
  tracesSampler: (samplingContext) => {
    const { name } = samplingContext.transactionContext;

    // Middleware operations
    if (name?.includes('middleware')) {
      return isProduction ? 0.1 : 0.5;
    }

    // Authentication operations (higher priority)
    if (name?.includes('auth') || name?.includes('clerk')) {
      return isProduction ? 0.3 : 1.0;
    }

    return isProduction ? 0.05 : 0.5;
  },

  // Edge runtime configuration
  beforeSend: (event) => {
    // Don't send events in development unless debugging
    if (isDevelopment && !process.env.SENTRY_DEBUG) {
      return null;
    }

    // Add edge context
    event.tags = {
      ...event.tags,
      runtime: 'edge',
      feature: 'cfi-handbook',
      domain: 'aviation-training',
    };

    // Add Railway context if available
    if (process.env.RAILWAY_ENVIRONMENT) {
      event.tags.deployment = 'railway';
      event.contexts = {
        ...event.contexts,
        railway: {
          environment: process.env.RAILWAY_ENVIRONMENT,
          service: process.env.RAILWAY_SERVICE_NAME,
        },
      };
    }

    return event;
  },

  // Release tracking
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || process.env.RAILWAY_GIT_COMMIT_SHA,

  // Debug configuration
  debug: isDevelopment && !!process.env.SENTRY_DEBUG,

  // Transport options optimized for edge
  transportOptions: {
    bufferSize: 10,
  },
});

// Edge-specific error reporting
export const reportMiddlewareError = (error: Error, path: string, userAgent?: string) => {
  Sentry.withScope((scope) => {
    scope.setTag('feature', 'middleware');
    scope.setContext('middlewareContext', {
      path,
      userAgent: userAgent?.substring(0, 100),
      timestamp: new Date().toISOString(),
    });
    scope.captureException(error);
  });
};

export const reportAuthError = (error: Error, operation: string, userId?: string) => {
  Sentry.withScope((scope) => {
    scope.setTag('feature', 'authentication');
    scope.setUser({ id: userId || 'anonymous' });
    scope.setContext('authContext', {
      operation,
      timestamp: new Date().toISOString(),
    });
    scope.captureException(error);
  });
};
