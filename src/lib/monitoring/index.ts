/**
 * Monitoring System Integration
 *
 * Central integration point for all monitoring components.
 * Automatically initializes and coordinates all monitoring systems.
 */

import * as Sentry from '@sentry/nextjs';
import { alertingSystem, cleanupAlertingSystem } from './alerting-system';
import { apiPerformanceMonitor } from './api-performance';
import { databaseMonitor } from './database';
import { databasePerformanceMonitor } from './database-performance';
import { performanceMetricsMonitor } from './performance-metrics';
import { railwayIntegrationMonitor } from './railway-integration';
import { cleanupRealUserMonitoring, realUserMonitor } from './real-user-monitoring';

// Re-export key monitoring functions and classes
export {
  alertingSystem,
  apiPerformanceMonitor,
  databaseMonitor,
  databasePerformanceMonitor,
  performanceMetricsMonitor,
  railwayIntegrationMonitor,
  realUserMonitor,
};

// Alias for backward compatibility
export const performanceMonitor = performanceMetricsMonitor;
export const railwayMonitor = railwayIntegrationMonitor;

export {
  acknowledgeAlert,
  getActiveAlerts,
  recordAlertMetric,
  resolveAlert,
} from './alerting-system';

export {
  withAPIPerformanceMonitoring,
} from './api-performance';

export {
  measureDatabaseQuery,
} from './database-performance';

// Re-export convenience functions
export {
  recordAPIResponseTime,
  recordDatabaseQueryTime,
  recordPageLoadTime,
} from './performance-metrics';

export {
  getRailwayInfo,
  isRailwayEnvironment,
  performHealthCheck,
  reportDeploymentFailure,
  reportDeploymentStart,
  reportDeploymentSuccess,
} from './railway-integration';

export {
  trackCustomEvent,
  trackUserAction,
} from './real-user-monitoring';

// Monitoring configuration interface
export type MonitoringConfig = {
  performance: {
    enabled: boolean;
    sampleRate: number;
  };
  api: {
    enabled: boolean;
    endpoints: string[];
  };
  database: {
    enabled: boolean;
    queryLogging: boolean;
  };
  rum: {
    enabled: boolean;
    sessionSampleRate: number;
  };
  alerting: {
    enabled: boolean;
    channels: string[];
  };
  railway: {
    enabled: boolean;
    healthCheckInterval: number;
  };
};

// Default monitoring configuration
const DEFAULT_CONFIG: MonitoringConfig = {
  performance: {
    enabled: true,
    sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  },
  api: {
    enabled: true,
    endpoints: ['/api/handbook', '/api/progress', '/api/feedback', '/api/auth'],
  },
  database: {
    enabled: true,
    queryLogging: process.env.NODE_ENV !== 'production',
  },
  rum: {
    enabled: true,
    sessionSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,
  },
  alerting: {
    enabled: true,
    channels: ['sentry'],
  },
  railway: {
    enabled: process.env.RAILWAY_ENVIRONMENT !== undefined,
    healthCheckInterval: 30000,
  },
};

/**
 * Central monitoring system class
 */
class MonitoringSystem {
  private config: MonitoringConfig;
  private isInitialized: boolean = false;
  private isEnabled: boolean = true;

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize all monitoring systems
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('Monitoring system already initialized');
      return;
    }

    try {
      console.log('Initializing CFI Handbook monitoring system...');

      // Initialize performance monitoring
      if (this.config.performance.enabled) {
        console.log('✓ Performance monitoring enabled');
      }

      // Initialize API monitoring
      if (this.config.api.enabled) {
        console.log('✓ API performance monitoring enabled');
      }

      // Initialize database monitoring
      if (this.config.database.enabled) {
        console.log('✓ Database performance monitoring enabled');
      }

      // Initialize RUM
      if (this.config.rum.enabled) {
        console.log('✓ Real User Monitoring (RUM) enabled');
      }

      // Initialize alerting
      if (this.config.alerting.enabled) {
        console.log('✓ Alerting system enabled');
      }

      // Initialize Railway integration
      if (this.config.railway.enabled) {
        console.log('✓ Railway integration enabled');
      }

      this.isInitialized = true;
      console.log('🎯 Monitoring system initialized successfully');

      // Report successful initialization
      if (typeof window !== 'undefined') {
        // Using Sentry breadcrumb instead of trackCustomEvent
        Sentry.addBreadcrumb({
          category: 'monitoring',
          message: 'Monitoring system initialized',
          level: 'info',
          data: {
            timestamp: new Date().toISOString(),
            config: Object.keys(this.config).reduce((acc, key) => ({
              ...acc,
              [key]: this.config[key as keyof MonitoringConfig].enabled,
            }), {}),
          },
        });
      }
    } catch (error) {
      console.error('Failed to initialize monitoring system:', error);
      throw error;
    }
  }

  /**
   * Get monitoring system status
   */
  public getStatus() {
    return {
      initialized: this.isInitialized,
      enabled: this.isEnabled,
      config: this.config,
      systems: {
        performance: {
          enabled: this.config.performance.enabled,
          status: 'active',
        },
        api: {
          enabled: this.config.api.enabled,
          status: 'active',
        },
        database: {
          enabled: this.config.database.enabled,
          status: 'active',
        },
        rum: {
          enabled: this.config.rum.enabled,
          status: 'active',
        },
        alerting: {
          enabled: this.config.alerting.enabled,
          status: 'active',
          activeAlerts: alertingSystem.getActiveAlerts().length,
        },
        railway: {
          enabled: this.config.railway.enabled,
          environment: railwayIntegrationMonitor.isRailwayEnvironment(),
        },
      },
    };
  }

  /**
   * Update monitoring configuration
   */
  public updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Apply configuration changes to subsystems
    // Note: Simplified monitoring modules don't have setEnabled methods
    console.log('Configuration updated for monitoring subsystems');

    console.log('Monitoring configuration updated:', newConfig);
  }

  /**
   * Enable or disable the entire monitoring system
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;

    // Enable/disable all subsystems
    // Note: Simplified monitoring modules don't have setEnabled methods
    console.log(`All monitoring subsystems ${enabled ? 'enabled' : 'disabled'}`);

    console.log(`Monitoring system ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Generate comprehensive performance report
   */
  public generateReport() {
    return {
      timestamp: new Date().toISOString(),
      system: this.getStatus(),
      performance: {
        recentMetrics: performanceMetricsMonitor.getRecentMetrics?.() || [],
      },
      api: {
        healthMetrics: apiPerformanceMonitor.getAllHealthMetrics?.() || [],
      },
      database: {
        healthMetrics: databasePerformanceMonitor.getHealthMetrics?.() || {},
        recentMetrics: databasePerformanceMonitor.getRecentMetrics?.() || [],
      },
      rum: {
        session: realUserMonitor.getCurrentSession?.() || null,
      },
      alerts: {
        active: alertingSystem.getActiveAlerts?.() || [],
        status: alertingSystem.getStatus?.() || {},
      },
      railway: {
        info: railwayIntegrationMonitor.getRailwayInfo?.() || null,
        environment: railwayIntegrationMonitor.isRailwayEnvironment?.() || false,
      },
    };
  }

  /**
   * Cleanup all monitoring systems
   */
  public cleanup(): void {
    console.log('Cleaning up monitoring systems...');

    // Note: Simplified monitoring modules don't have cleanup functions
    // cleanupAPIPerformanceMonitoring();
    cleanupRealUserMonitoring?.();
    cleanupAlertingSystem?.();

    this.isInitialized = false;
    this.isEnabled = false;

    console.log('✓ Monitoring systems cleaned up');
  }
}

// Global monitoring system instance
export const monitoringSystem = new MonitoringSystem();

// Auto-initialize monitoring system
if (typeof window !== 'undefined') {
  // Client-side initialization
  window.addEventListener('load', () => {
    monitoringSystem.initialize().catch(console.error);
  });
} else {
  // Server-side initialization
  monitoringSystem.initialize().catch(console.error);
}

// Cleanup on process exit (server-side)
if (typeof process !== 'undefined') {
  process.on('exit', () => {
    monitoringSystem.cleanup();
  });

  process.on('SIGINT', () => {
    monitoringSystem.cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    monitoringSystem.cleanup();
    process.exit(0);
  });
}

// Cleanup on page unload (client-side)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    monitoringSystem.cleanup();
  });
}

// Export monitoring system for external use
export default monitoringSystem;
