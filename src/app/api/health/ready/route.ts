import type { NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/libs/DB';

// Readiness probe - checks if the application is ready to serve traffic
// This is used by Railway and other container orchestrators
export async function GET(_request: NextRequest) {
  try {
    return Sentry.startSpan({ op: 'health.ready', name: 'Readiness Check' }, async () => {
      // Quick database connectivity check
      const dbStartTime = Date.now();
      await db.execute(sql`SELECT 1`);
      const dbResponseTime = Date.now() - dbStartTime;

      // Check critical environment variables for Railway deployment
      const requiredEnvVars = [
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
        'DATABASE_URL',
        'CLERK_SECRET_KEY',
      ];

      // Railway-specific checks
      const railwayChecks = [];
      if (process.env.RAILWAY_ENVIRONMENT) {
        if (!process.env.RAILWAY_STATIC_URL) {
          railwayChecks.push('RAILWAY_STATIC_URL not available');
        }
        if (!process.env.PORT) {
          railwayChecks.push('PORT not assigned by Railway');
        }
      }

      const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

      if (missingVars.length > 0 || railwayChecks.length > 0) {
        return NextResponse.json(
          {
            status: 'not ready',
            reason: [
              ...(missingVars.length > 0 ? [`Missing environment variables: ${missingVars.join(', ')}`] : []),
              ...railwayChecks,
            ].join('; '),
            environment: process.env.NODE_ENV,
            railway: {
              environment: process.env.RAILWAY_ENVIRONMENT,
              deploymentId: process.env.RAILWAY_DEPLOYMENT_ID,
              service: process.env.RAILWAY_SERVICE_NAME,
            },
          },
          { status: 503 },
        );
      }

      if (dbResponseTime > 5000) {
        return NextResponse.json(
          {
            status: 'not ready',
            reason: 'Database response time too slow',
            dbResponseTime,
          },
          { status: 503 },
        );
      }

      return NextResponse.json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        dbResponseTime,
        environment: process.env.NODE_ENV,
        railway: {
          environment: process.env.RAILWAY_ENVIRONMENT,
          deploymentId: process.env.RAILWAY_DEPLOYMENT_ID,
          service: process.env.RAILWAY_SERVICE_NAME,
          staticUrl: process.env.RAILWAY_STATIC_URL,
          gitCommit: process.env.RAILWAY_GIT_COMMIT_SHA?.substring(0, 8),
        },
        deployment: {
          zeroDowntimeEnabled: process.env.ZERO_DOWNTIME_ENABLED === 'true',
          gracefulShutdownTimeout: process.env.GRACEFUL_SHUTDOWN_TIMEOUT,
        },
      });
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'health-check', endpoint: '/api/health/ready' },
    });

    return NextResponse.json(
      {
        status: 'not ready',
        reason: 'Readiness check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 },
    );
  }
}
