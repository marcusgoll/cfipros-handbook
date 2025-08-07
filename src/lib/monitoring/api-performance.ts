/**
 * API Performance Monitoring
 *
 * Monitors API endpoint performance, tracks response times,
 * error rates, and provides detailed analytics for API health.
 */

import * as Sentry from '@sentry/nextjs';

// API performance metric types
export type APIMetric = {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  requestSize?: number;
  responseSize?: number;
  userId?: string;
  timestamp: number;
  error?: string;
  trace?: string;
};

export type APIHealthMetrics = {
  endpoint: string;
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  throughput: number; // requests per minute
  uptime: number; // percentage
};

// Performance thresholds for API endpoints
export const API_PERFORMANCE_THRESHOLDS = {
  // Response time thresholds (ms)
  responseTime: {
    excellent: 100,
    good: 200,
    acceptable: 500,
    poor: 1000,
    critical: 2000,
  },

  // Error rate thresholds (percentage)
  errorRate: {
    excellent: 0.1,
    good: 0.5,
    acceptable: 1.0,
    poor: 2.0,
    critical: 5.0,
  },

  // Throughput thresholds (requests per minute)
  throughput: {
    low: 10,
    medium: 50,
    high: 200,
    veryHigh: 500,
  },

  // Specific endpoint thresholds
  endpoints: {
    '/api/auth': { responseTime: 300, errorRate: 0.1 },
    '/api/handbook': { responseTime: 200, errorRate: 0.5 },
    '/api/progress': { responseTime: 150, errorRate: 0.2 },
    '/api/feedback': { responseTime: 500, errorRate: 1.0 },
    '/api/search': { responseTime: 800, errorRate: 1.0 },
    '/api/health': { responseTime: 50, errorRate: 0.1 },
  },
} as const;

class APIPerformanceMonitor {
  private metrics: APIMetric[] = [];
  private healthMetrics: Map<string, APIHealthMetrics> = new Map();
  private alertThresholds: Map<string, { responseTime: number; errorRate: number }> = new Map();
  private isEnabled: boolean = true;

  constructor() {
    this.initializeThresholds();
    this.startPeriodicReporting();
  }

  /**
   * Initialize alert thresholds for different endpoints
   */
  private initializeThresholds(): void {
    Object.entries(API_PERFORMANCE_THRESHOLDS.endpoints).forEach(([endpoint, thresholds]) => {
      this.alertThresholds.set(endpoint, thresholds);
    });
  }

  /**
   * Start periodic reporting of aggregated metrics
   */
  private startPeriodicReporting(): void {
    if (typeof window === 'undefined') {
      return;
    } // Server-side only

    setInterval(() => {
      this.reportAggregatedMetrics();
    }, 60000); // Report every minute
  }

  /**
   * Record API request performance
   */
  public recordAPICall(
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    options?: {
      requestSize?: number;
      responseSize?: number;
      userId?: string;
      error?: string;
      trace?: string;
    },
  ): void {
    if (!this.isEnabled) {
      return;
    }

    const metric: APIMetric = {
      endpoint,
      method,
      statusCode,
      responseTime,
      timestamp: Date.now(),
      ...options,
    };

    // Store metric
    this.metrics.push(metric);

    // Limit stored metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }

    // Report to Sentry
    this.reportToSentry(metric);

    // Check for performance issues
    this.checkPerformanceThresholds(metric);

    // Update health metrics
    this.updateHealthMetrics(metric);
  }

  /**
   * Record API request using a wrapper function
   */
  public async measureAPICall<T>(
    endpoint: string,
    method: string,
    operation: () => Promise<Response>,
    options?: { userId?: string },
  ): Promise<Response> {
    const startTime = performance.now();

    return await Sentry.startSpan(
      {
        op: 'http.client',
        name: `${method} ${endpoint}`,
      },
      async (span) => {
        try {
          const response = await operation();
          const responseTime = performance.now() - startTime;

          // Get response size if available
          let responseSize: number | undefined;
          const contentLength = response.headers.get('content-length');
          if (contentLength) {
            responseSize = Number.parseInt(contentLength, 10);
          }

          this.recordAPICall(
            endpoint,
            method,
            response.status,
            responseTime,
            {
              responseSize,
              userId: options?.userId,
            },
          );

          // Add response attributes to span
          span?.setAttribute('http.status_code', response.status);
          span?.setAttribute('http.response_time', responseTime);

          return response;
        } catch (error) {
          const responseTime = performance.now() - startTime;

          this.recordAPICall(
            endpoint,
            method,
            0, // Unknown status code
            responseTime,
            {
              error: error instanceof Error ? error.message : 'Unknown error',
              trace: error instanceof Error ? error.stack : undefined,
              userId: options?.userId,
            },
          );

          // Report error to span
          span?.recordException(error as Error);
          span?.setStatus({ code: 2, message: 'Error' });

          throw error;
        }
      },
    );
  }

  /**
   * Report metric to Sentry
   */
  private reportToSentry(metric: APIMetric): void {
    // Use Sentry transactions and spans instead of deprecated metrics API
    Sentry.withScope((scope) => {
      scope.setTag('endpoint', metric.endpoint);
      scope.setTag('method', metric.method);
      scope.setTag('status_code', metric.statusCode.toString());
      scope.setTag('success', metric.statusCode < 400 ? 'true' : 'false');

      // Use context instead of setMeasurement which doesn't exist
      scope.setContext('api_metrics', {
        response_time: metric.responseTime,
        status_code: metric.statusCode,
        endpoint: metric.endpoint,
        method: metric.method,
      });
    });

    // Add breadcrumb for context
    Sentry.addBreadcrumb({
      category: 'api',
      message: `${metric.method} ${metric.endpoint}`,
      level: metric.statusCode >= 400 ? 'error' : 'info',
      data: {
        statusCode: metric.statusCode,
        responseTime: metric.responseTime,
        error: metric.error,
      },
    });
  }

  /**
   * Check performance thresholds and alert if necessary
   */
  private checkPerformanceThresholds(metric: APIMetric): void {
    const thresholds = this.alertThresholds.get(metric.endpoint) || {
      responseTime: API_PERFORMANCE_THRESHOLDS.responseTime.poor,
      errorRate: API_PERFORMANCE_THRESHOLDS.errorRate.poor,
    };

    // Check response time
    if (metric.responseTime > thresholds.responseTime) {
      this.reportPerformanceAlert('slow_response', metric, {
        threshold: thresholds.responseTime,
        severity: metric.responseTime > API_PERFORMANCE_THRESHOLDS.responseTime.critical ? 'critical' : 'warning',
      });
    }

    // Check for errors
    if (metric.statusCode >= 400) {
      this.reportPerformanceAlert('api_error', metric, {
        severity: metric.statusCode >= 500 ? 'error' : 'warning',
      });
    }
  }

  /**
   * Update health metrics for aggregation
   */
  private updateHealthMetrics(metric: APIMetric): void {
    const key = `${metric.method}:${metric.endpoint}`;
    let health = this.healthMetrics.get(key);

    if (!health) {
      health = {
        endpoint: key,
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        throughput: 0,
        uptime: 100,
      };
      this.healthMetrics.set(key, health);
    }

    // Update request count
    health.totalRequests++;

    // Update average response time (moving average)
    health.averageResponseTime = (
      (health.averageResponseTime * (health.totalRequests - 1) + metric.responseTime)
      / health.totalRequests
    );

    // Update error rate
    const errorCount = this.metrics
      .filter(m => m.endpoint === metric.endpoint && m.method === metric.method && m.statusCode >= 400)
      .length;
    health.errorRate = (errorCount / health.totalRequests) * 100;

    // Calculate percentiles periodically (computationally expensive)
    if (health.totalRequests % 10 === 0) {
      this.updatePercentiles(health, metric.endpoint, metric.method);
    }
  }

  /**
   * Update percentile calculations
   */
  private updatePercentiles(health: APIHealthMetrics, endpoint: string, method: string): void {
    const endpointMetrics = this.metrics
      .filter(m => m.endpoint === endpoint && m.method === method)
      .map(m => m.responseTime)
      .sort((a, b) => a - b);

    if (endpointMetrics.length > 0) {
      const p95Index = Math.floor(endpointMetrics.length * 0.95);
      const p99Index = Math.floor(endpointMetrics.length * 0.99);

      health.p95ResponseTime = endpointMetrics[p95Index] || 0;
      health.p99ResponseTime = endpointMetrics[p99Index] || 0;
    }
  }

  /**
   * Report performance alerts
   */
  private reportPerformanceAlert(
    type: string,
    metric: APIMetric,
    context: Record<string, any>,
  ): void {
    Sentry.withScope((scope) => {
      scope.setTag('alert_type', type);
      scope.setTag('api_endpoint', metric.endpoint);
      scope.setLevel(context.severity || 'warning');

      scope.setContext('api_performance', {
        endpoint: metric.endpoint,
        method: metric.method,
        responseTime: metric.responseTime,
        statusCode: metric.statusCode,
        timestamp: new Date(metric.timestamp).toISOString(),
        ...context,
      });

      const message = `API Performance Alert: ${type} for ${metric.method} ${metric.endpoint}`;
      scope.captureMessage(message, context.severity || 'warning');
    });
  }

  /**
   * Report aggregated metrics periodically
   */
  private reportAggregatedMetrics(): void {
    for (const [endpoint, health] of this.healthMetrics.entries()) {
      // Calculate throughput (requests per minute)
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      const recentRequests = this.metrics.filter(
        m => m.timestamp > oneMinuteAgo && `${m.method}:${m.endpoint}` === endpoint,
      ).length;

      health.throughput = recentRequests;

      // Report aggregated metrics to Sentry using measurements
      Sentry.withScope((scope) => {
        scope.setTag('endpoint', endpoint);
        // Disabled: scope.setMeasurement('average_response_time', health.averageResponseTime);
        // Disabled: scope.setMeasurement('error_rate', health.errorRate);
        // Disabled: scope.setMeasurement('p95_response_time', health.p95ResponseTime);
        // Disabled: scope.setMeasurement('throughput', health.throughput);
      });

      // Check aggregated thresholds
      this.checkAggregatedThresholds(endpoint, health);
    }
  }

  /**
   * Check aggregated performance thresholds
   */
  private checkAggregatedThresholds(endpoint: string, health: APIHealthMetrics): void {
    const [method, path] = endpoint.split(':');
    const thresholds = this.alertThresholds.get(path);

    if (!thresholds) {
      return;
    }

    // Check average response time over the period
    if (health.averageResponseTime > thresholds.responseTime) {
      Sentry.withScope((scope) => {
        scope.setTag('alert_type', 'sustained_slow_response');
        scope.setTag('api_endpoint', path);
        scope.setLevel('warning');

        scope.setContext('api_health', {
          endpoint: path,
          method,
          averageResponseTime: health.averageResponseTime,
          threshold: thresholds.responseTime,
          totalRequests: health.totalRequests,
          throughput: health.throughput,
        });

        scope.captureMessage(
          `Sustained slow API performance: ${method} ${path}`,
          'warning',
        );
      });
    }

    // Check error rate over the period
    if (health.errorRate > thresholds.errorRate) {
      Sentry.withScope((scope) => {
        scope.setTag('alert_type', 'high_error_rate');
        scope.setTag('api_endpoint', path);
        scope.setLevel('error');

        scope.setContext('api_health', {
          endpoint: path,
          method,
          errorRate: health.errorRate,
          threshold: thresholds.errorRate,
          totalRequests: health.totalRequests,
          throughput: health.throughput,
        });

        scope.captureMessage(
          `High API error rate: ${method} ${path}`,
          'error',
        );
      });
    }
  }

  /**
   * Get performance summary for an endpoint
   */
  public getEndpointSummary(endpoint: string, method?: string): APIHealthMetrics | null {
    const key = method ? `${method}:${endpoint}` : endpoint;
    return this.healthMetrics.get(key) || null;
  }

  /**
   * Get all health metrics
   */
  public getAllHealthMetrics(): APIHealthMetrics[] {
    return Array.from(this.healthMetrics.values());
  }

  /**
   * Get recent metrics for analysis
   */
  public getRecentMetrics(minutes: number = 10): APIMetric[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.metrics.filter(m => m.timestamp > cutoff);
  }

  /**
   * Generate performance report
   */
  public generatePerformanceReport(): {
    summary: {
      totalRequests: number;
      averageResponseTime: number;
      errorRate: number;
      slowestEndpoints: string[];
      mostErrors: string[];
    };
    healthMetrics: APIHealthMetrics[];
    recentAlerts: number;
  } {
    const allMetrics = this.metrics;
    const totalRequests = allMetrics.length;
    const averageResponseTime = allMetrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests || 0;
    const errorCount = allMetrics.filter(m => m.statusCode >= 400).length;
    const errorRate = (errorCount / totalRequests) * 100 || 0;

    // Find slowest endpoints
    const endpointTimes = new Map<string, number[]>();
    allMetrics.forEach((m) => {
      const key = `${m.method} ${m.endpoint}`;
      if (!endpointTimes.has(key)) {
        endpointTimes.set(key, []);
      }
      endpointTimes.get(key)!.push(m.responseTime);
    });

    const slowestEndpoints = Array.from(endpointTimes.entries())
      .map(([endpoint, times]) => ({
        endpoint,
        avgTime: times.reduce((sum, t) => sum + t, 0) / times.length,
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5)
      .map(e => e.endpoint);

    // Find endpoints with most errors
    const endpointErrors = new Map<string, number>();
    allMetrics.filter(m => m.statusCode >= 400).forEach((m) => {
      const key = `${m.method} ${m.endpoint}`;
      endpointErrors.set(key, (endpointErrors.get(key) || 0) + 1);
    });

    const mostErrors = Array.from(endpointErrors.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(e => e[0]);

    // Count recent alerts (last hour)
    const oneHourAgo = Date.now() - 3600000;
    const recentAlerts = allMetrics.filter(m =>
      m.timestamp > oneHourAgo
      && (m.statusCode >= 400 || m.responseTime > API_PERFORMANCE_THRESHOLDS.responseTime.poor),
    ).length;

    return {
      summary: {
        totalRequests,
        averageResponseTime,
        errorRate,
        slowestEndpoints,
        mostErrors,
      },
      healthMetrics: this.getAllHealthMetrics(),
      recentAlerts,
    };
  }

  /**
   * Clear old metrics to prevent memory leaks
   */
  public clearOldMetrics(hours: number = 24): void {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
  }

  /**
   * Enable or disable monitoring
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Get monitoring status
   */
  public isMonitoringEnabled(): boolean {
    return this.isEnabled;
  }
}

// Global API performance monitor instance
export const apiPerformanceMonitor = new APIPerformanceMonitor();

// Convenience function for Next.js API routes
export const withAPIPerformanceMonitoring = (handler: Function, endpoint: string) => {
  return async (req: any, res: any) => {
    const startTime = performance.now();
    const method = req.method || 'GET';

    try {
      const result = await handler(req, res);
      const responseTime = performance.now() - startTime;

      apiPerformanceMonitor.recordAPICall(
        endpoint,
        method,
        res.statusCode || 200,
        responseTime,
        {
          userId: req.auth?.userId,
        },
      );

      return result;
    } catch (error) {
      const responseTime = performance.now() - startTime;

      apiPerformanceMonitor.recordAPICall(
        endpoint,
        method,
        500,
        responseTime,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          userId: req.auth?.userId,
        },
      );

      throw error;
    }
  };
};

// Export for cleanup
export const cleanupAPIPerformanceMonitoring = () => {
  apiPerformanceMonitor.setEnabled(false);
  apiPerformanceMonitor.clearOldMetrics(0);
};
