// This file imports the client-side Sentry configuration
// The actual configuration is in sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';
import '../sentry.client.config';

export { reportHandbookError, reportPerformanceIssue, reportUserAction } from '../sentry.client.config';

// Export required hooks for Sentry
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
