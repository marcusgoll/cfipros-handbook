// This file configures Sentry for different runtimes
// The actual configurations are in separate config files
import * as Sentry from '@sentry/nextjs';

export async function register() {
  // Skip instrumentation if disabled
  if (process.env.NEXT_PUBLIC_SENTRY_DISABLED === 'true') {
    return;
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import server-side Sentry configuration
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Import edge runtime Sentry configuration
    await import('../sentry.edge.config');
  }
}

// Export required hooks for Sentry
export const onRequestError = Sentry.captureRequestError;

export * from '../sentry.edge.config';
// Re-export utility functions
export * from '../sentry.server.config';
