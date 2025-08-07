/**
 * Performance Metrics - Simplified Version
 *
 * Basic performance monitoring without deprecated Sentry metrics API
 */

import * as Sentry from '@sentry/nextjs';

export type PerformanceMetric = {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string>;
};

class PerformanceMetricsMonitor {
  private metrics: PerformanceMetric[] = [];

  /**
   * Record a performance metric
   */
  public recordMetric(name: string, value: number, unit: string = 'ms', tags?: Record<string, string>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags,
    };

    this.metrics.push(metric);

    // Limit stored metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }

    // Report to Sentry via breadcrumbs
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `${name}: ${value}${unit}`,
      level: 'info',
      data: {
        metric: name,
        value,
        unit,
        tags,
      },
    });

    // Report performance issues
    if (this.isPerformanceIssue(name, value)) {
      Sentry.captureMessage('Performance issue detected', {
        level: 'warning',
        tags: {
          feature: 'performance',
          metric_name: name,
          ...tags,
        },
        contexts: {
          performance: {
            metric: name,
            value,
            unit,
            timestamp: new Date(metric.timestamp).toISOString(),
          },
        },
      });
    }
  }

  /**
   * Check if a metric indicates a performance issue
   */
  private isPerformanceIssue(name: string, value: number): boolean {
    const thresholds: Record<string, number> = {
      page_load_time: 3000,
      api_response_time: 1000,
      database_query_time: 500,
      render_time: 100,
    };

    return thresholds[name] ? value > thresholds[name] : false;
  }

  /**
   * Get recent metrics
   */
  public getRecentMetrics(minutes: number = 10): PerformanceMetric[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.metrics.filter(m => m.timestamp > cutoff);
  }

  /**
   * Get metrics by name
   */
  public getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name);
  }
}

// Global instance
export const performanceMetricsMonitor = new PerformanceMetricsMonitor();

// Convenience functions
export const recordPageLoadTime = (time: number) => {
  performanceMetricsMonitor.recordMetric('page_load_time', time, 'ms');
};

export const recordAPIResponseTime = (endpoint: string, time: number) => {
  performanceMetricsMonitor.recordMetric('api_response_time', time, 'ms', { endpoint });
};

export const recordDatabaseQueryTime = (operation: string, time: number) => {
  performanceMetricsMonitor.recordMetric('database_query_time', time, 'ms', { operation });
};
