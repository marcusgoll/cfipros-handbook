/**
 * Database Monitoring - Simplified Version
 *
 * Basic database monitoring without deprecated Sentry metrics API
 */

import * as Sentry from '@sentry/nextjs';

export type DatabaseConnectionMetric = {
  connectionId: string;
  status: 'connected' | 'disconnected' | 'error';
  timestamp: number;
  error?: string;
};

class DatabaseMonitor {
  private connections: Map<string, DatabaseConnectionMetric> = new Map();

  /**
   * Record database connection event
   */
  public recordConnection(connectionId: string, status: 'connected' | 'disconnected' | 'error', error?: string): void {
    const metric: DatabaseConnectionMetric = {
      connectionId,
      status,
      timestamp: Date.now(),
      error,
    };

    this.connections.set(connectionId, metric);

    // Report to Sentry via breadcrumbs
    Sentry.addBreadcrumb({
      category: 'database.connection',
      message: `Database ${status}`,
      level: status === 'error' ? 'error' : 'info',
      data: {
        connectionId,
        status,
        error,
      },
    });

    // Report connection errors
    if (status === 'error' && error) {
      Sentry.captureMessage('Database connection error', {
        level: 'error',
        tags: {
          feature: 'database',
          connection_id: connectionId,
        },
        contexts: {
          database: {
            connectionId,
            error,
            timestamp: new Date(metric.timestamp).toISOString(),
          },
        },
      });
    }
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(connectionId: string): DatabaseConnectionMetric | null {
    return this.connections.get(connectionId) || null;
  }

  /**
   * Get all active connections
   */
  public getActiveConnections(): DatabaseConnectionMetric[] {
    return Array.from(this.connections.values()).filter(c => c.status === 'connected');
  }
}

// Global instance
export const databaseMonitor = new DatabaseMonitor();
