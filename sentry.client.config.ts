// This file configures the initialization of Sentry on the browser side.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV || 'development',

  // Browser integrations
  integrations: [],

  // Performance monitoring
  tracesSampleRate: isProduction ? 0.1 : 1.0,

  // Custom sampling for different transaction types
  tracesSampler: (samplingContext) => {
    const { name, op } = samplingContext.transactionContext;

    // Always sample critical aviation operations
    if (name?.includes('/handbook/') || name?.includes('/dashboard/')) {
      return isProduction ? 0.3 : 1.0;
    }

    // Reduce sampling for assets and static files
    if (op === 'pageload' && name?.includes('/_next/')) {
      return 0.01;
    }

    // API routes get higher sampling
    if (name?.startsWith('/api/')) {
      return isProduction ? 0.5 : 1.0;
    }

    return isProduction ? 0.1 : 1.0;
  },

  // Enable profiling in production
  profilesSampleRate: isProduction ? 0.1 : 0,

  // Configure before send hook for data sanitization
  beforeSend: (event) => {
    // Don't send events in development
    if (isDevelopment && !process.env.SENTRY_DEBUG) {
      return null;
    }

    // Filter out known non-critical errors
    const ignoredErrors = [
      'Non-Error exception captured',
      'ResizeObserver loop limit exceeded',
      'Script error',
      'Network request failed',
    ];

    if (event.exception?.values?.[0]?.value
      && ignoredErrors.some(error => event.exception?.values?.[0]?.value?.includes(error))) {
      return null;
    }

    // Add aviation-specific context
    event.tags = {
      ...event.tags,
      feature: 'cfi-handbook',
      domain: 'aviation-training',
    };

    // Add user context if available
    if (typeof window !== 'undefined' && (window as any).Clerk?.user) {
      const clerkUser = (window as any).Clerk.user;
      event.user = {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
      };
    }

    return event;
  },

  // Release tracking
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,

  // Debug mode for development
  debug: isDevelopment && !!process.env.SENTRY_DEBUG,

  // Transport options for better reliability
  transportOptions: {
    // Buffer size for offline support
    bufferSize: 30,
  },
});

// Custom error reporting functions
export const reportHandbookError = (error: Error, context: Record<string, any> = {}) => {
  Sentry.withScope((scope) => {
    scope.setTag('feature', 'handbook');
    scope.setContext('handbookContext', context);
    scope.captureException(error);
  });
};

export const reportUserAction = (action: string, metadata: Record<string, any> = {}) => {
  Sentry.addBreadcrumb({
    category: 'user.action',
    message: action,
    level: 'info',
    data: metadata,
  });
};

export const reportPerformanceIssue = (metric: string, value: number, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    scope.setTag('performance', true);
    scope.setContext('performanceContext', { metric, value, ...context });
    scope.captureMessage(`Performance issue: ${metric} = ${value}`, 'warning');
  });
};
