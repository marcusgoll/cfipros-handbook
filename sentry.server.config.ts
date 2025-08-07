// This file configures the initialization of Sentry for edge runtime.
// The config you add here will be used whenever a page or API route is invoked.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV || 'development',

  // Server-side integrations
  integrations: [],

  // Performance monitoring
  tracesSampleRate: isProduction ? 0.1 : 1.0,

  // Custom sampling for server operations
  tracesSampler: (samplingContext) => {
    const { name, op } = samplingContext.transactionContext;

    // High sampling for critical aviation operations
    if (name?.includes('/api/handbook/') || name?.includes('/api/feedback/')) {
      return isProduction ? 0.5 : 1.0;
    }

    // Database operations
    if (op === 'db.sql.query') {
      return isProduction ? 0.3 : 1.0;
    }

    // File operations (lower priority)
    if (op === 'fs' || name?.includes('/_next/static/')) {
      return 0.01;
    }

    return isProduction ? 0.1 : 1.0;
  },

  // Enable profiling
  profilesSampleRate: isProduction ? 0.1 : 0,

  // Server-specific configuration
  beforeSend: (event) => {
    // Don't send events in development unless debugging
    if (isDevelopment && !process.env.SENTRY_DEBUG) {
      return null;
    }

    // Add server context
    event.tags = {
      ...event.tags,
      runtime: 'server',
      feature: 'cfi-handbook',
      domain: 'aviation-training',
    };

    // Add Railway-specific context with comprehensive deployment info
    if (process.env.RAILWAY_ENVIRONMENT) {
      event.tags = {
        ...event.tags,
        deployment: 'railway',
        railway_environment: process.env.RAILWAY_ENVIRONMENT,
        railway_service: process.env.RAILWAY_SERVICE_NAME || 'cfi-handbook',
      };

      event.contexts = {
        ...event.contexts,
        railway: {
          environment: process.env.RAILWAY_ENVIRONMENT,
          service: process.env.RAILWAY_SERVICE_NAME || 'cfi-handbook',
          deployment_id: process.env.RAILWAY_DEPLOYMENT_ID,
          static_url: process.env.RAILWAY_STATIC_URL,
          git_commit: process.env.RAILWAY_GIT_COMMIT_SHA,
          port: process.env.PORT,
        },
        deployment: {
          zero_downtime_enabled: process.env.ZERO_DOWNTIME_ENABLED === 'true',
          graceful_shutdown_timeout: process.env.GRACEFUL_SHUTDOWN_TIMEOUT,
          database_ssl: process.env.DATABASE_SSL === 'true',
          connection_pool_size: Number.parseInt(process.env.DATABASE_CONNECTION_POOL_SIZE || '15'),
        },
      };

      // Add Railway deployment fingerprint for grouping errors by deployment
      event.fingerprint = [
        '{{ default }}',
        process.env.RAILWAY_DEPLOYMENT_ID || 'unknown-deployment',
      ];
    }

    // Sanitize sensitive data
    if (event.request?.data) {
      // Remove potential sensitive data from requests
      const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
      sensitiveFields.forEach((field) => {
        if (event.request?.data && typeof event.request.data === 'object') {
          delete (event.request.data as Record<string, any>)[field];
        }
      });
    }

    return event;
  },

  // Release tracking
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || process.env.RAILWAY_GIT_COMMIT_SHA,

  // Debug configuration
  debug: isDevelopment && !!process.env.SENTRY_DEBUG,

  // Server transport options
  transportOptions: {
    bufferSize: 100,
  },

  // Spotlight integration for development
  spotlight: isDevelopment,
});

// Custom server-side error reporting
export const reportDatabaseError = (error: Error, query: string, params?: any[]) => {
  Sentry.withScope((scope) => {
    scope.setTag('feature', 'database');
    scope.setContext('databaseContext', {
      query: query.substring(0, 500), // Limit query length
      paramCount: params?.length || 0,
    });
    scope.captureException(error);
  });
};

export const reportAPIError = (error: Error, endpoint: string, method: string, userId?: string) => {
  Sentry.withScope((scope) => {
    scope.setTag('feature', 'api');
    scope.setUser({ id: userId || 'anonymous' });
    scope.setContext('apiContext', {
      endpoint,
      method,
      timestamp: new Date().toISOString(),
    });
    scope.captureException(error);
  });
};

export const reportHandbookOperationError = (error: Error, operation: string, lessonId?: string) => {
  Sentry.withScope((scope) => {
    scope.setTag('feature', 'handbook');
    scope.setContext('handbookContext', {
      operation,
      lessonId,
      timestamp: new Date().toISOString(),
    });
    scope.captureException(error);
  });
};

// Performance monitoring helpers
export const startDatabaseTransaction = (query: string, callback: () => void) => {
  return Sentry.startSpan({
    op: 'db.sql.query',
    name: query.split(' ')[0]?.toUpperCase() || 'UNKNOWN', // e.g., "SELECT", "INSERT"
  }, callback);
};

export const startHandbookOperation = (operation: string, callback: () => void) => {
  return Sentry.startSpan({
    op: 'handbook.operation',
    name: operation,
  }, callback);
};
