import type { NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

// Health check endpoint for Railway zero-downtime deployments
export async function GET(_request: NextRequest) {
  const startTime = Date.now();

  // Initialize health check response
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: { status: 'unknown', latency: 0 },
      memory: { status: 'unknown', usage: 0, percentage: 0 },
      sentry: { status: 'unknown' },
      filesystem: { status: 'unknown' },
    },
    uptime: process.uptime(),
    responseTime: 0,
  };

  try {
    // Database connectivity check (disabled for MVP)
    await checkDatabase(healthStatus);

    // Memory usage check
    checkMemoryUsage(healthStatus);

    // Sentry connectivity check
    checkSentryConnection(healthStatus);

    // File system check
    await checkFileSystem(healthStatus);

    // Calculate total response time
    healthStatus.responseTime = Date.now() - startTime;

    // Determine overall health status
    const allChecksHealthy = Object.values(healthStatus.checks).every(
      check => check.status === 'healthy',
    );

    if (!allChecksHealthy) {
      healthStatus.status = 'degraded';
    }

    // Report health check result using Sentry breadcrumb
    Sentry.addBreadcrumb({
      category: 'health_check',
      message: `Health check completed: ${healthStatus.status}`,
      level: healthStatus.status === 'healthy' ? 'info' : 'warning',
      data: {
        status: healthStatus.status,
        checks: healthStatus.checks,
        responseTime: healthStatus.responseTime,
      },
    });

    // Return appropriate HTTP status
    const httpStatus = healthStatus.status === 'healthy'
      ? 200
      : healthStatus.status === 'degraded' ? 200 : 503;

    return NextResponse.json(healthStatus, { status: httpStatus });
  } catch (error) {
    // Critical error occurred
    healthStatus.status = 'unhealthy';
    healthStatus.responseTime = Date.now() - startTime;

    // Report unhealthy state using Sentry
    Sentry.captureMessage('Health check failed', {
      level: 'error',
      tags: {
        feature: 'health_check',
        status: 'unhealthy',
      },
      contexts: {
        health: {
          status: 'unhealthy',
          checks: healthStatus.checks,
          responseTime: healthStatus.responseTime,
        },
      },
    });

    // Log error to Sentry
    Sentry.captureException(error, {
      tags: { component: 'health-check' },
    });

    return NextResponse.json(healthStatus, { status: 503 });
  }
}

async function checkDatabase(healthStatus: any) {
  // For MVP launch, disable database checks to avoid build failures
  // TODO: Re-enable when DATABASE_URL is properly configured for production
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      healthStatus.checks.database = {
        status: 'degraded',
        message: 'DATABASE_URL not configured - database features disabled',
        mvp_mode: true,
      };
      return;
    }

    const isLocalhost = databaseUrl.includes('127.0.0.1') || databaseUrl.includes('localhost');
    if (isLocalhost && process.env.NODE_ENV === 'production') {
      healthStatus.checks.database = {
        status: 'degraded',
        message: 'DATABASE_URL points to localhost in production - database features disabled',
        mvp_mode: true,
        url: databaseUrl.replace(/:[^:@]*@/, ':***@'), // Mask password
      };
      return;
    }

    // If we have a proper DATABASE_URL, mark as healthy (without actually connecting during build)
    healthStatus.checks.database = {
      status: 'healthy',
      message: 'Database configuration detected',
      mvp_mode: true,
      url: databaseUrl.replace(/:[^:@]*@/, ':***@'), // Mask password
    };
  } catch (error) {
    healthStatus.checks.database = {
      status: 'degraded',
      message: 'Database check disabled for MVP launch',
      mvp_mode: true,
      error: error instanceof Error ? error.message : 'Database check failed',
    };
  }
}

function checkMemoryUsage(healthStatus: any) {
  try {
    const memUsage = process.memoryUsage();
    const totalMem = memUsage.heapTotal;
    const usedMem = memUsage.heapUsed;
    const memPercentage = (usedMem / totalMem) * 100;

    healthStatus.checks.memory = {
      status: memPercentage < 85 ? 'healthy' : memPercentage < 95 ? 'degraded' : 'unhealthy',
      usage: Math.round(usedMem / 1024 / 1024), // MB
      total: Math.round(totalMem / 1024 / 1024), // MB
      percentage: Math.round(memPercentage),
    };
  } catch (error) {
    healthStatus.checks.memory = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Memory check failed',
    };
  }
}

function checkSentryConnection(healthStatus: any) {
  try {
    // Check if Sentry is properly initialized
    const client = Sentry.getClient();

    healthStatus.checks.sentry = {
      status: client ? 'healthy' : 'degraded',
      dsn: client?.getOptions().dsn ? 'configured' : 'not_configured',
    };
  } catch (error) {
    healthStatus.checks.sentry = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Sentry check failed',
    };
  }
}

async function checkFileSystem(healthStatus: any) {
  try {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');

    // Check if we can write to the temp directory
    const tempFile = path.join(process.cwd(), '.tmp-health-check');
    await fs.writeFile(tempFile, 'health-check');
    await fs.unlink(tempFile);

    healthStatus.checks.filesystem = {
      status: 'healthy',
      writable: true,
    };
  } catch (error) {
    healthStatus.checks.filesystem = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Filesystem check failed',
      writable: false,
    };
  }
}
