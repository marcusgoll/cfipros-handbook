/**
 * Monitoring API Routes
 *
 * API endpoints for accessing monitoring data, managing alerts,
 * and providing monitoring dashboard data.
 */

import type { NextRequest } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { alertingSystem, apiPerformanceMonitor, databasePerformanceMonitor, monitoringSystem, railwayIntegrationMonitor } from '@/lib/monitoring';

// Rate limiting for monitoring API
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

/**
 * Apply rate limiting
 */
function applyRateLimit(identifier: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  // Clean up old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < windowStart) {
      rateLimitMap.delete(key);
    }
  }

  const current = rateLimitMap.get(identifier) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };

  if (current.count >= RATE_LIMIT) {
    return false;
  }

  current.count++;
  rateLimitMap.set(identifier, current);
  return true;
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown';
  return ip;
}

/**
 * GET /api/monitoring - Get monitoring system status and metrics
 */
export async function GET(request: NextRequest) {
  const startTime = performance.now();

  try {
    // Apply rate limiting
    const clientId = getClientIdentifier(request);
    if (!applyRateLimit(clientId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 },
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';
    const timeRange = searchParams.get('timeRange') || '1h';
    const detailed = searchParams.get('detailed') === 'true';

    let responseData: any = {};

    switch (type) {
      case 'overview':
        responseData = {
          system: monitoringSystem.getStatus(),
          alerts: {
            active: alertingSystem.getActiveAlerts().slice(0, 10), // Limit to 10 recent alerts
            count: alertingSystem.getActiveAlerts().length,
          },
          timestamp: new Date().toISOString(),
        };
        break;

      case 'performance':
        responseData = {
          api: {
            summary: {
              totalRequests: apiPerformanceMonitor.getAllHealthMetrics().reduce((sum, metric) => sum + metric.totalRequests, 0),
              averageResponseTime: apiPerformanceMonitor.getAllHealthMetrics().reduce((sum, metric) => sum + metric.averageResponseTime, 0) / apiPerformanceMonitor.getAllHealthMetrics().length || 0,
              errorRate: apiPerformanceMonitor.getAllHealthMetrics().reduce((sum, metric) => sum + metric.errorRate, 0) / apiPerformanceMonitor.getAllHealthMetrics().length || 0,
            },
            endpoints: detailed ? apiPerformanceMonitor.getAllHealthMetrics() : [],
            recentMetrics: apiPerformanceMonitor.getRecentMetrics(Number.parseInt(timeRange.replace('h', '')) * 60) || [],
          },
          database: {
            health: databasePerformanceMonitor.getHealthMetrics(),
            connections: [], // getConnectionMetrics not available in simplified version
            recentMetrics: databasePerformanceMonitor.getRecentMetrics(Number.parseInt(timeRange.replace('h', '')) * 60) || [],
          },
          timestamp: new Date().toISOString(),
        };
        break;

      case 'alerts': {
        const alerts = alertingSystem.getAllAlerts();
        responseData = {
          active: alerts.filter(alert => !alert.resolved),
          resolved: alerts.filter(alert => alert.resolved).slice(0, 20), // Last 20 resolved
          rules: alertingSystem.getAlertRules(),
          status: alertingSystem.getStatus(),
          timestamp: new Date().toISOString(),
        };
        break;
      }

      case 'railway':
        responseData = {
          deployment: railwayIntegrationMonitor.getRailwayInfo(),
          metrics: null, // getCurrentMetrics not available in simplified version
          health: await railwayIntegrationMonitor.performHealthCheck(),
          timestamp: new Date().toISOString(),
        };
        break;

      case 'report':
        responseData = monitoringSystem.generateReport();
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid monitoring type requested' },
          { status: 400 },
        );
    }

    // Add response metadata
    const responseTime = performance.now() - startTime;
    responseData.meta = {
      responseTime: Math.round(responseTime),
      cached: false,
      version: process.env.npm_package_version || '1.0.0',
    };

    // Record API performance
    apiPerformanceMonitor.recordAPICall(
      '/api/monitoring',
      'GET',
      200,
      responseTime,
      { userId: 'system' },
    );

    return NextResponse.json(responseData);
  } catch (error) {
    const responseTime = performance.now() - startTime;

    // Record error
    apiPerformanceMonitor.recordAPICall(
      '/api/monitoring',
      'GET',
      500,
      responseTime,
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: 'system',
      },
    );

    // Report to Sentry
    Sentry.withScope((scope) => {
      scope.setTag('api_endpoint', '/api/monitoring');
      scope.setTag('method', 'GET');
      scope.setContext('request_details', {
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
        responseTime,
      });
      scope.captureException(error);
    });

    console.error('Monitoring API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        meta: {
          responseTime: Math.round(responseTime),
          cached: false,
        },
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/monitoring - Update monitoring configuration or manage alerts
 */
export async function POST(request: NextRequest) {
  const startTime = performance.now();

  try {
    // Apply rate limiting
    const clientId = getClientIdentifier(request);
    if (!applyRateLimit(clientId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 },
      );
    }

    // Parse request body
    const body = await request.json();
    const { action, data } = body;

    let responseData: any = {};

    switch (action) {
      case 'acknowledge_alert':
        if (!data.alertId || !data.userId) {
          return NextResponse.json(
            { error: 'Missing required fields: alertId, userId' },
            { status: 400 },
          );
        }
        alertingSystem.acknowledgeAlert(data.alertId, data.userId, data.comment);
        responseData = { success: true, message: 'Alert acknowledged' };
        break;

      case 'resolve_alert':
        if (!data.alertId || !data.userId) {
          return NextResponse.json(
            { error: 'Missing required fields: alertId, userId' },
            { status: 400 },
          );
        }
        alertingSystem.resolveAlert(data.alertId, data.userId, data.comment);
        responseData = { success: true, message: 'Alert resolved' };
        break;

      case 'update_config':
        if (!data.config) {
          return NextResponse.json(
            { error: 'Missing configuration data' },
            { status: 400 },
          );
        }
        monitoringSystem.updateConfig(data.config);
        responseData = {
          success: true,
          message: 'Configuration updated',
          config: monitoringSystem.getStatus().config,
        };
        break;

      case 'enable_monitoring':
        monitoringSystem.setEnabled(data.enabled !== false);
        responseData = {
          success: true,
          message: `Monitoring ${data.enabled !== false ? 'enabled' : 'disabled'}`,
          status: monitoringSystem.getStatus(),
        };
        break;

      case 'test_alert':
        // Create a test alert for verification
        alertingSystem.recordMetric('test_metric', 999999);
        responseData = { success: true, message: 'Test alert triggered' };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action requested' },
          { status: 400 },
        );
    }

    // Add response metadata
    const responseTime = performance.now() - startTime;
    responseData.meta = {
      responseTime: Math.round(responseTime),
      timestamp: new Date().toISOString(),
    };

    // Record API performance
    apiPerformanceMonitor.recordAPICall(
      '/api/monitoring',
      'POST',
      200,
      responseTime,
      { userId: data.userId || 'system' },
    );

    return NextResponse.json(responseData);
  } catch (error) {
    const responseTime = performance.now() - startTime;

    // Record error
    apiPerformanceMonitor.recordAPICall(
      '/api/monitoring',
      'POST',
      500,
      responseTime,
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: 'system',
      },
    );

    // Report to Sentry
    Sentry.withScope((scope) => {
      scope.setTag('api_endpoint', '/api/monitoring');
      scope.setTag('method', 'POST');
      scope.setContext('request_details', {
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
        responseTime,
      });
      scope.captureException(error);
    });

    console.error('Monitoring API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        meta: {
          responseTime: Math.round(responseTime),
        },
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/monitoring - Bulk operations on monitoring system
 */
export async function PUT(request: NextRequest) {
  const startTime = performance.now();

  try {
    // Apply rate limiting
    const clientId = getClientIdentifier(request);
    if (!applyRateLimit(clientId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 },
      );
    }

    // Parse request body
    const body = await request.json();
    const { operation, data } = body;

    let responseData: any = {};

    switch (operation) {
      case 'bulk_resolve_alerts': {
        if (!data.alertIds || !Array.isArray(data.alertIds)) {
          return NextResponse.json(
            { error: 'Missing or invalid alertIds array' },
            { status: 400 },
          );
        }
        let resolvedCount = 0;
        data.alertIds.forEach((alertId: string) => {
          try {
            alertingSystem.resolveAlert(alertId, data.userId || 'system', 'Bulk resolution');
            resolvedCount++;
          } catch (error) {
            console.warn(`Failed to resolve alert ${alertId}:`, error);
          }
        });
        responseData = {
          success: true,
          message: `Resolved ${resolvedCount} of ${data.alertIds.length} alerts`,
          resolvedCount,
        };
        break;
      }

      case 'reset_monitoring':
        // Clear metrics and restart monitoring
        monitoringSystem.cleanup();
        await monitoringSystem.initialize();
        responseData = { success: true, message: 'Monitoring system reset' };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid operation requested' },
          { status: 400 },
        );
    }

    // Add response metadata
    const responseTime = performance.now() - startTime;
    responseData.meta = {
      responseTime: Math.round(responseTime),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    const responseTime = performance.now() - startTime;

    // Report to Sentry
    Sentry.withScope((scope) => {
      scope.setTag('api_endpoint', '/api/monitoring');
      scope.setTag('method', 'PUT');
      scope.captureException(error);
    });

    console.error('Monitoring API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        meta: {
          responseTime: Math.round(responseTime),
        },
      },
      { status: 500 },
    );
  }
}
