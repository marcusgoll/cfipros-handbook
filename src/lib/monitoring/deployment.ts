/**
 * Deployment Monitoring - Simplified Version
 *
 * Basic deployment monitoring without deprecated Sentry APIs
 */

import * as Sentry from '@sentry/nextjs';

export type DeploymentEvent = {
  version: string;
  environment: string;
  timestamp: Date;
  type: 'deployment_start' | 'deployment_success' | 'deployment_failure' | 'rollback_start' | 'rollback_success';
  metadata?: Record<string, any>;
};

export type HealthCheckResult = {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, any>;
  responseTime: number;
  timestamp: Date;
};

export class DeploymentMonitoring {
  private version: string;
  private environment: string;

  constructor() {
    this.version = process.env.npm_package_version || '1.0.0';
    this.environment = process.env.NODE_ENV || 'development';
  }

  /**
   * Track deployment start
   */
  trackDeploymentStart(metadata?: Record<string, any>) {
    const event: DeploymentEvent = {
      version: this.version,
      environment: this.environment,
      timestamp: new Date(),
      type: 'deployment_start',
      metadata,
    };

    // Send to Sentry using modern APIs
    Sentry.addBreadcrumb({
      category: 'deployment',
      message: `Deployment started for version ${this.version}`,
      level: 'info',
      data: event,
    });

    // Use modern span API instead of deprecated startTransaction
    Sentry.startSpan({
      op: 'deployment.start',
      name: 'deployment',
    }, (span) => {
      span.setAttribute('version', this.version);
      span.setAttribute('environment', this.environment);

      Sentry.captureMessage('Deployment started', {
        level: 'info',
        tags: {
          feature: 'deployment',
          version: this.version,
          environment: this.environment,
        },
        contexts: {
          deployment: {
            version: this.version,
            environment: this.environment,
            timestamp: event.timestamp.toISOString(),
            metadata,
          },
        },
      });
    });

    return event;
  }

  /**
   * Track deployment success
   */
  trackDeploymentSuccess(metadata?: Record<string, any>) {
    const event: DeploymentEvent = {
      version: this.version,
      environment: this.environment,
      timestamp: new Date(),
      type: 'deployment_success',
      metadata,
    };

    Sentry.addBreadcrumb({
      category: 'deployment',
      message: `Deployment succeeded for version ${this.version}`,
      level: 'info',
      data: event,
    });

    Sentry.captureMessage('Deployment successful', {
      level: 'info',
      tags: {
        feature: 'deployment',
        status: 'success',
        version: this.version,
        environment: this.environment,
      },
      contexts: {
        deployment: {
          version: this.version,
          environment: this.environment,
          timestamp: event.timestamp.toISOString(),
          metadata,
        },
      },
    });

    return event;
  }

  /**
   * Track deployment failure
   */
  trackDeploymentFailure(error: Error, metadata?: Record<string, any>) {
    const event: DeploymentEvent = {
      version: this.version,
      environment: this.environment,
      timestamp: new Date(),
      type: 'deployment_failure',
      metadata: { ...metadata, error: error.message },
    };

    Sentry.addBreadcrumb({
      category: 'deployment',
      message: `Deployment failed for version ${this.version}`,
      level: 'error',
      data: event,
    });

    Sentry.captureException(error, {
      tags: {
        feature: 'deployment',
        status: 'failed',
        version: this.version,
        environment: this.environment,
      },
      contexts: {
        deployment: {
          version: this.version,
          environment: this.environment,
          timestamp: event.timestamp.toISOString(),
          metadata,
        },
      },
    });

    return event;
  }

  /**
   * Perform health check
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const startTime = performance.now();

    const result: HealthCheckResult = {
      status: 'healthy',
      checks: {},
      responseTime: 0,
      timestamp: new Date(),
    };

    try {
      // Basic application health checks
      result.checks.memory = this.checkMemoryUsage();
      result.checks.environment = this.checkEnvironment();
      result.checks.dependencies = await this.checkDependencies();

      // Determine overall status
      const failedChecks = Object.values(result.checks).filter(check => !check).length;
      const totalChecks = Object.keys(result.checks).length;

      if (failedChecks === 0) {
        result.status = 'healthy';
      } else if (failedChecks / totalChecks <= 0.3) {
        result.status = 'degraded';
      } else {
        result.status = 'unhealthy';
      }

      result.responseTime = performance.now() - startTime;

      // Report health check results
      Sentry.addBreadcrumb({
        category: 'health_check',
        message: `Health check completed: ${result.status}`,
        level: result.status === 'healthy' ? 'info' : 'warning',
        data: {
          status: result.status,
          responseTime: result.responseTime,
          checks: result.checks,
        },
      });

      return result;
    } catch (error) {
      result.status = 'unhealthy';
      result.responseTime = performance.now() - startTime;

      Sentry.captureException(error, {
        tags: {
          feature: 'health_check',
          version: this.version,
          environment: this.environment,
        },
      });

      return result;
    }
  }

  /**
   * Check memory usage
   */
  private checkMemoryUsage(): boolean {
    try {
      const usage = process.memoryUsage();
      const heapUsedMB = usage.heapUsed / 1024 / 1024;
      const heapTotalMB = usage.heapTotal / 1024 / 1024;

      // Consider healthy if heap usage is less than 80% of total
      return (heapUsedMB / heapTotalMB) < 0.8;
    } catch {
      return false;
    }
  }

  /**
   * Check environment configuration
   */
  private checkEnvironment(): boolean {
    try {
      // Check for required environment variables
      const required = ['NODE_ENV'];
      return required.every(env => process.env[env]);
    } catch {
      return false;
    }
  }

  /**
   * Check critical dependencies
   */
  private async checkDependencies(): Promise<boolean> {
    try {
      // Basic dependency check - could be expanded
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get deployment information
   */
  getDeploymentInfo() {
    return {
      version: this.version,
      environment: this.environment,
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
  }

  /**
   * Track rollback
   */
  trackRollback(targetVersion: string, metadata?: Record<string, any>) {
    const event: DeploymentEvent = {
      version: targetVersion,
      environment: this.environment,
      timestamp: new Date(),
      type: 'rollback_start',
      metadata: { ...metadata, fromVersion: this.version },
    };

    Sentry.addBreadcrumb({
      category: 'deployment',
      message: `Rollback initiated from ${this.version} to ${targetVersion}`,
      level: 'warning',
      data: event,
    });

    Sentry.captureMessage('Deployment rollback initiated', {
      level: 'warning',
      tags: {
        feature: 'deployment',
        action: 'rollback',
        fromVersion: this.version,
        toVersion: targetVersion,
        environment: this.environment,
      },
      contexts: {
        deployment: {
          fromVersion: this.version,
          toVersion: targetVersion,
          environment: this.environment,
          timestamp: event.timestamp.toISOString(),
          metadata,
        },
      },
    });

    return event;
  }
}

// Global deployment monitoring instance
export const deploymentMonitoring = new DeploymentMonitoring();

// Convenience exports
export const trackDeploymentStart = (metadata?: Record<string, any>) =>
  deploymentMonitoring.trackDeploymentStart(metadata);

export const trackDeploymentSuccess = (metadata?: Record<string, any>) =>
  deploymentMonitoring.trackDeploymentSuccess(metadata);

export const trackDeploymentFailure = (error: Error, metadata?: Record<string, any>) =>
  deploymentMonitoring.trackDeploymentFailure(error, metadata);

export const performHealthCheck = () =>
  deploymentMonitoring.performHealthCheck();

export const getDeploymentInfo = () =>
  deploymentMonitoring.getDeploymentInfo();

export const trackRollback = (targetVersion: string, metadata?: Record<string, any>) =>
  deploymentMonitoring.trackRollback(targetVersion, metadata);
