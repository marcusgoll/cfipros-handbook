import type { NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import { NextResponse } from 'next/server';
import postgres from 'postgres';
import { acsCodesSchema, counterSchema } from '@/models/Schema';

// Readiness check endpoint for Railway deployments
// This endpoint performs deeper checks to ensure the application is ready to serve traffic
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  const readinessStatus = {
    status: 'ready',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database_connection: { status: 'unknown' },
      database_migrations: { status: 'unknown' },
      essential_data: { status: 'unknown' },
      environment_variables: { status: 'unknown' },
      sentry_integration: { status: 'unknown' },
    },
    responseTime: 0,
  };

  try {
    // Check database connection
    await checkDatabaseConnection(readinessStatus);

    // Check database migrations
    await checkDatabaseMigrations(readinessStatus);

    // Check essential data exists
    await checkEssentialData(readinessStatus);

    // Check required environment variables
    checkEnvironmentVariables(readinessStatus);

    // Check Sentry integration
    checkSentryIntegration(readinessStatus);

    readinessStatus.responseTime = Date.now() - startTime;

    // Application is ready only if all checks pass
    const allChecksReady = Object.values(readinessStatus.checks).every(
      check => check.status === 'ready',
    );

    if (!allChecksReady) {
      readinessStatus.status = 'not_ready';
    }

    const httpStatus = readinessStatus.status === 'ready' ? 200 : 503;

    return NextResponse.json(readinessStatus, { status: httpStatus });
  } catch (error) {
    readinessStatus.status = 'not_ready';
    readinessStatus.responseTime = Date.now() - startTime;

    Sentry.captureException(error, {
      tags: { component: 'readiness-check' },
    });

    return NextResponse.json(readinessStatus, { status: 503 });
  }
}

async function checkDatabaseConnection(readinessStatus: any) {
  try {
    if (!process.env.DATABASE_URL) {
      readinessStatus.checks.database_connection = {
        status: 'not_ready',
        error: 'DATABASE_URL not configured',
      };
      return;
    }

    const client = postgres(process.env.DATABASE_URL, {
      max: 1,
      connect_timeout: 10,
      idle_timeout: 5,
    });

    const db = drizzle(client);

    // Test database connection with a simple query
    await db.select().from(counterSchema).limit(1);

    readinessStatus.checks.database_connection = {
      status: 'ready',
      message: 'Database connection successful',
    };

    await client.end();
  } catch (error) {
    readinessStatus.checks.database_connection = {
      status: 'not_ready',
      error: error instanceof Error ? error.message : 'Database connection failed',
    };
  }
}

async function checkDatabaseMigrations(readinessStatus: any) {
  try {
    if (!process.env.DATABASE_URL) {
      readinessStatus.checks.database_migrations = {
        status: 'not_ready',
        error: 'DATABASE_URL not configured',
      };
      return;
    }

    const client = postgres(process.env.DATABASE_URL, {
      max: 1,
      connect_timeout: 10,
      idle_timeout: 5,
    });

    const db = drizzle(client);

    // Check if essential tables exist
    const result = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('counter', 'acs_codes', 'user_progress', 'page_feedback')
    `;

    const expectedTables = ['counter', 'acs_codes', 'user_progress', 'page_feedback'];
    const existingTables = result.map((row: any) => row.table_name);
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));

    if (missingTables.length > 0) {
      readinessStatus.checks.database_migrations = {
        status: 'not_ready',
        error: `Missing tables: ${missingTables.join(', ')}`,
        existing_tables: existingTables,
      };
    } else {
      readinessStatus.checks.database_migrations = {
        status: 'ready',
        message: 'All required tables exist',
        existing_tables: existingTables,
      };
    }

    await client.end();
  } catch (error) {
    readinessStatus.checks.database_migrations = {
      status: 'not_ready',
      error: error instanceof Error ? error.message : 'Migration check failed',
    };
  }
}

async function checkEssentialData(readinessStatus: any) {
  try {
    if (!process.env.DATABASE_URL) {
      readinessStatus.checks.essential_data = {
        status: 'not_ready',
        error: 'DATABASE_URL not configured',
      };
      return;
    }

    const client = postgres(process.env.DATABASE_URL, {
      max: 1,
      connect_timeout: 10,
      idle_timeout: 5,
    });

    const db = drizzle(client);

    // Check if ACS codes are populated (essential reference data)
    const acsCount = await db.select().from(acsCodesSchema).limit(1);

    readinessStatus.checks.essential_data = {
      status: acsCount.length > 0 ? 'ready' : 'not_ready',
      message: acsCount.length > 0 ? 'Essential data exists' : 'ACS codes not populated',
      acs_codes_available: acsCount.length > 0,
    };

    await client.end();
  } catch (error) {
    readinessStatus.checks.essential_data = {
      status: 'not_ready',
      error: error instanceof Error ? error.message : 'Essential data check failed',
    };
  }
}

function checkEnvironmentVariables(readinessStatus: any) {
  const requiredVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  readinessStatus.checks.environment_variables = {
    status: missingVars.length === 0 ? 'ready' : 'not_ready',
    message: missingVars.length === 0 ? 'All required environment variables present' : 'Missing environment variables',
    missing_variables: missingVars,
    total_required: requiredVars.length,
    configured: requiredVars.length - missingVars.length,
  };
}

function checkSentryIntegration(readinessStatus: any) {
  try {
    const client = Sentry.getClient();
    const options = client?.getOptions();

    readinessStatus.checks.sentry_integration = {
      status: client && options?.dsn ? 'ready' : 'not_ready',
      message: client && options?.dsn ? 'Sentry properly configured' : 'Sentry not configured',
      configured: !!client,
      dsn_present: !!(options?.dsn),
    };
  } catch (error) {
    readinessStatus.checks.sentry_integration = {
      status: 'not_ready',
      error: error instanceof Error ? error.message : 'Sentry check failed',
    };
  }
}
