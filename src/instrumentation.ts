import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side Sentry configuration
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

      // Add optional integrations for additional features
      integrations: [
        // send console.log, console.error, and console.warn calls as logs to Sentry
        Sentry.consoleLoggingIntegration({ levels: ['log', 'error', 'warn'] }),
      ],

      // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
      tracesSampleRate: 1,

      // Enable logging
      _experiments: {
        enableLogs: true,
      },

      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false,
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime Sentry configuration
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

      // Add optional integrations for additional features
      integrations: [
        // send console.log, console.error, and console.warn calls as logs to Sentry
        Sentry.consoleLoggingIntegration({ levels: ['log', 'error', 'warn'] }),
      ],

      // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
      tracesSampleRate: 1,

      // Enable logging
      _experiments: {
        enableLogs: true,
      },

      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
