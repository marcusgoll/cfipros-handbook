import type { NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { databasePerformanceMonitor } from '@/lib/monitoring/database-performance';
import { railwayIntegrationMonitor } from '@/lib/monitoring/railway-integration';

// Aviation-specific monitoring dashboard data
type MonitoringDashboard = {
  timestamp: string;
  overview: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    activeUsers: number;
    totalRequests: number;
    errorRate: number;
  };
  performance: {
    avgResponseTime: number;
    p95ResponseTime: number;
    webVitals: {
      lcp: number;
      cls: number;
      inp: number;
    };
    database: {
      queryCount: number;
      avgResponseTime: number;
      slowQueries: number;
      connectionHealth: string;
    };
  };
  handbook: {
    totalLessons: number;
    activeSessions: number;
    dailyCompletions: number;
    searchQueries: number;
    avgUserProgress: number;
    feedbackScore: number;
  };
  infrastructure: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
    };
    railway: {
      environment: string;
      service: string;
      deploymentId: string;
      region?: string;
    };
  };
  alerts: {
    active: number;
    resolved: number;
    critical: number;
  };
};

// Get overview metrics
function getOverviewMetrics() {
  // In production, these would come from your metrics store
  // For now, we'll return simulated data
  return {
    status: 'healthy' as const,
    uptime: Math.floor(process.uptime()),
    activeUsers: 0, // Would come from session tracking
    totalRequests: 0, // Would come from request counter
    errorRate: 0.001, // Would be calculated from error logs
  };
}

// Get performance metrics
function getPerformanceMetrics() {
  const dbMetrics = databasePerformanceMonitor.getHealthMetrics();

  return {
    avgResponseTime: 150, // Would come from request timing
    p95ResponseTime: 500, // Would come from percentile calculations
    webVitals: {
      lcp: 1200, // Would come from real user monitoring
      cls: 0.05,
      inp: 80,
    },
    database: {
      queryCount: dbMetrics.queryDistribution ? Object.values(dbMetrics.queryDistribution).reduce((a, b) => a + b, 0) : 0,
      avgResponseTime: dbMetrics.averageQueryTime,
      slowQueries: dbMetrics.slowQueries,
      connectionHealth: dbMetrics.errorRate < 5 ? 'healthy' : 'degraded',
    },
  };
}

// Get handbook-specific metrics
async function getHandbookMetrics() {
  // In production, these would come from database queries
  return {
    totalLessons: 25,
    activeSessions: 0,
    dailyCompletions: 0,
    searchQueries: 0,
    avgUserProgress: 0.35,
    feedbackScore: 4.2,
  };
}

// Get infrastructure metrics
function getInfrastructureMetrics() {
  const memoryUsage = process.memoryUsage();
  const railwayInfo = railwayIntegrationMonitor.getRailwayInfo();

  const totalMemory = memoryUsage.heapTotal + memoryUsage.external + memoryUsage.arrayBuffers;
  const usedMemory = memoryUsage.heapUsed + memoryUsage.external + memoryUsage.arrayBuffers;

  return {
    memory: {
      used: Math.round(usedMemory / 1024 / 1024), // MB
      total: Math.round(totalMemory / 1024 / 1024), // MB
      percentage: Math.round((usedMemory / totalMemory) * 100),
    },
    cpu: {
      usage: 0, // Would need OS-level monitoring for accurate CPU usage
    },
    railway: {
      environment: railwayInfo.environment || 'unknown',
      service: railwayInfo.service || 'unknown',
      deploymentId: railwayInfo.deploymentId || 'unknown',
      region: 'unknown', // Not available in simplified version
    },
  };
}

// Get alert metrics
function getAlertMetrics() {
  // In production, these would come from your alerting system
  return {
    active: 0,
    resolved: 0,
    critical: 0,
  };
}

export async function GET(_request: NextRequest) {
  try {
    return Sentry.startSpan({ op: 'dashboard.monitoring', name: 'Get Monitoring Dashboard' }, async () => {
      // Collect all metrics in parallel
      const [handbookMetrics] = await Promise.all([
        getHandbookMetrics(),
      ]);

      const dashboard: MonitoringDashboard = {
        timestamp: new Date().toISOString(),
        overview: getOverviewMetrics(),
        performance: getPerformanceMetrics(),
        handbook: handbookMetrics,
        infrastructure: getInfrastructureMetrics(),
        alerts: getAlertMetrics(),
      };

      return NextResponse.json(dashboard);
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'monitoring', endpoint: '/api/dashboard/monitoring' },
    });

    return NextResponse.json(
      {
        error: 'Failed to load monitoring dashboard',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
