/**
 * Database Performance Monitoring - Simplified Version
 *
 * Basic database performance tracking without deprecated Sentry metrics API
 */

import * as Sentry from '@sentry/nextjs';

export type DatabaseMetric = {
  operation: string;
  duration: number;
  success: boolean;
  connectionId?: string;
  query?: string;
  timestamp: number;
  error?: string;
};

export type DatabaseHealthMetrics = {
  averageQueryTime: number;
  errorRate: number;
  activeConnections: number;
  p95QueryTime: number;
  slowQueries: number;
  queryDistribution: Record<string, number>;
  connectionPoolSize: number;
};

class DatabasePerformanceMonitor {
  private metrics: DatabaseMetric[] = [];
  private healthMetrics: DatabaseHealthMetrics = {
    averageQueryTime: 0,
    errorRate: 0,
    activeConnections: 0,
    p95QueryTime: 0,
    slowQueries: 0,
    queryDistribution: {},
    connectionPoolSize: 10,
  };

  /**
   * Record database operation performance
   */
  public recordQuery(
    operation: string,
    duration: number,
    success: boolean,
    options?: {
      connectionId?: string;
      query?: string;
      error?: string;
    },
  ): void {
    const metric: DatabaseMetric = {
      operation,
      duration,
      success,
      timestamp: Date.now(),
      ...options,
    };

    this.metrics.push(metric);

    // Limit stored metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }

    this.reportToSentry(metric);
    this.updateHealthMetrics(metric);
  }

  /**
   * Report metric to Sentry using breadcrumbs instead of deprecated metrics API
   */
  private reportToSentry(metric: DatabaseMetric): void {
    // Add breadcrumb for context
    Sentry.addBreadcrumb({
      category: 'database',
      message: `DB ${metric.operation}`,
      level: metric.success ? 'info' : 'error',
      data: {
        operation: metric.operation,
        duration: metric.duration,
        success: metric.success,
        connectionId: metric.connectionId,
      },
    });

    // Report slow queries
    if (metric.duration > 1000) {
      Sentry.captureMessage('Slow database query detected', {
        level: 'warning',
        tags: {
          feature: 'database',
          operation: metric.operation,
        },
        contexts: {
          database: {
            operation: metric.operation,
            duration: metric.duration,
            query: metric.query?.substring(0, 200),
          },
        },
      });
    }

    // Report errors
    if (!metric.success && metric.error) {
      Sentry.captureMessage('Database operation failed', {
        level: 'error',
        tags: {
          feature: 'database',
          operation: metric.operation,
        },
        contexts: {
          database: {
            operation: metric.operation,
            duration: metric.duration,
            error: metric.error,
            query: metric.query?.substring(0, 200),
          },
        },
      });
    }
  }

  /**
   * Update health metrics
   */
  private updateHealthMetrics(metric: DatabaseMetric): void {
    const recentMetrics = this.metrics.slice(-100);
    const totalQueries = recentMetrics.length;

    if (totalQueries === 0) {
      return;
    }

    // Calculate average query time
    this.healthMetrics.averageQueryTime = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / totalQueries;

    // Calculate error rate
    const errorCount = recentMetrics.filter(m => !m.success).length;
    this.healthMetrics.errorRate = (errorCount / totalQueries) * 100;

    // Count slow queries
    this.healthMetrics.slowQueries = recentMetrics.filter(m => m.duration > 1000).length;

    // Calculate P95
    const sortedDurations = recentMetrics.map(m => m.duration).sort((a, b) => a - b);
    const p95Index = Math.floor(sortedDurations.length * 0.95);
    this.healthMetrics.p95QueryTime = sortedDurations[p95Index] || 0;

    // Update query distribution
    this.healthMetrics.queryDistribution = {};
    recentMetrics.forEach((m) => {
      this.healthMetrics.queryDistribution[m.operation] = (this.healthMetrics.queryDistribution[m.operation] || 0) + 1;
    });
  }

  /**
   * Get current health metrics
   */
  public getHealthMetrics(): DatabaseHealthMetrics {
    return { ...this.healthMetrics };
  }

  /**
   * Get recent metrics
   */
  public getRecentMetrics(minutes: number = 10): DatabaseMetric[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.metrics.filter(m => m.timestamp > cutoff);
  }
}

// Global instance
export const databasePerformanceMonitor = new DatabasePerformanceMonitor();

// Convenience function for measuring query performance
export const measureDatabaseQuery = async <T>(
  operation: string,
  queryFn: () => Promise<T>,
  options?: { connectionId?: string; query?: string },
): Promise<T> => {
  const startTime = performance.now();

  try {
    const result = await queryFn();
    const duration = performance.now() - startTime;

    databasePerformanceMonitor.recordQuery(operation, duration, true, options);

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    databasePerformanceMonitor.recordQuery(operation, duration, false, {
      ...options,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
};
