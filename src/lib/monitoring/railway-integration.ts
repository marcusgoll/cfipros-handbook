/**
 * Railway Integration Monitoring - Simplified Version
 *
 * Basic Railway monitoring without deprecated Sentry metrics API
 */

import * as Sentry from '@sentry/nextjs';

export type RailwayEnvironmentInfo = {
  environment?: string;
  service?: string;
  deploymentId?: string;
  gitCommitSha?: string;
  gitBranch?: string;
  replicaId?: string;
};

export type RailwayHealthCheck = {
  status: 'healthy' | 'unhealthy' | 'unknown';
  statusCode?: number;
  responseTime?: number;
  checks: Record<string, boolean>;
  error?: string;
};

class RailwayIntegrationMonitor {
  public readonly environmentInfo: RailwayEnvironmentInfo;

  constructor() {
    this.environmentInfo = {
      environment: process.env.RAILWAY_ENVIRONMENT,
      service: process.env.RAILWAY_SERVICE_NAME,
      deploymentId: process.env.RAILWAY_DEPLOYMENT_ID,
      gitCommitSha: process.env.RAILWAY_GIT_COMMIT_SHA,
      gitBranch: process.env.RAILWAY_GIT_BRANCH,
      replicaId: process.env.RAILWAY_REPLICA_ID,
    };

    // Set Railway context in Sentry
    Sentry.setContext('railway', this.environmentInfo);
  }

  /**
   * Report deployment start
   */
  public reportDeploymentStart(): void {
    const info = this.environmentInfo;

    Sentry.captureMessage('Railway deployment started', {
      level: 'info',
      tags: {
        feature: 'deployment',
        status: 'started',
        environment: info.environment,
      },
      contexts: {
        deployment: {
          deployment_id: info.deploymentId,
          commit_sha: info.gitCommitSha,
          branch: info.gitBranch,
          service: info.service,
        },
      },
    });

    Sentry.addBreadcrumb({
      category: 'deployment',
      message: 'Railway deployment started',
      level: 'info',
      data: info,
    });
  }

  /**
   * Report deployment success
   */
  public reportDeploymentSuccess(): void {
    const info = this.environmentInfo;

    Sentry.captureMessage('Railway deployment successful', {
      level: 'info',
      tags: {
        feature: 'deployment',
        status: 'success',
        environment: info.environment,
      },
      contexts: {
        deployment: {
          deployment_id: info.deploymentId,
          commit_sha: info.gitCommitSha,
          branch: info.gitBranch,
          service: info.service,
        },
      },
    });
  }

  /**
   * Report deployment failure
   */
  public reportDeploymentFailure(error: Error, phase?: string): void {
    const info = this.environmentInfo;

    Sentry.captureException(error, {
      tags: {
        feature: 'deployment',
        status: 'failed',
        environment: info.environment,
        phase: phase || 'unknown',
      },
      contexts: {
        deployment: {
          deployment_id: info.deploymentId,
          commit_sha: info.gitCommitSha,
          branch: info.gitBranch,
          service: info.service,
          phase,
        },
      },
    });
  }

  /**
   * Perform health check
   */
  public async performHealthCheck(): Promise<RailwayHealthCheck> {
    const healthCheck: RailwayHealthCheck = {
      status: 'unknown',
      checks: {},
    };

    try {
      // Basic health checks
      healthCheck.checks.environment_vars = !!this.environmentInfo.environment;
      healthCheck.checks.service_running = true; // If we're executing, service is running
      healthCheck.checks.memory_available = process.memoryUsage().heapUsed < 500 * 1024 * 1024; // 500MB

      // Determine overall status
      const passedChecks = Object.values(healthCheck.checks).filter(Boolean).length;
      const totalChecks = Object.keys(healthCheck.checks).length;

      if (passedChecks === totalChecks) {
        healthCheck.status = 'healthy';
      } else if (passedChecks >= totalChecks * 0.7) {
        healthCheck.status = 'healthy'; // Mostly healthy
      } else {
        healthCheck.status = 'unhealthy';
      }

      // Report health status
      Sentry.addBreadcrumb({
        category: 'health_check',
        message: `Railway health check: ${healthCheck.status}`,
        level: healthCheck.status === 'healthy' ? 'info' : 'warning',
        data: {
          status: healthCheck.status,
          checks: healthCheck.checks,
        },
      });

      return healthCheck;
    } catch (error) {
      healthCheck.status = 'unhealthy';
      healthCheck.error = error instanceof Error ? error.message : 'Unknown error';

      Sentry.captureException(error, {
        tags: {
          feature: 'health_check',
          environment: this.environmentInfo.environment,
        },
      });

      return healthCheck;
    }
  }

  /**
   * Get Railway environment information
   */
  public getRailwayInfo(): RailwayEnvironmentInfo {
    return { ...this.environmentInfo };
  }

  /**
   * Check if running in Railway environment
   */
  public isRailwayEnvironment(): boolean {
    return !!this.environmentInfo.environment;
  }
}

// Global instance
export const railwayIntegrationMonitor = new RailwayIntegrationMonitor();

// Convenience exports
export const reportDeploymentStart = () => railwayIntegrationMonitor.reportDeploymentStart();
export const reportDeploymentSuccess = () => railwayIntegrationMonitor.reportDeploymentSuccess();
export const reportDeploymentFailure = (error: Error, phase?: string) =>
  railwayIntegrationMonitor.reportDeploymentFailure(error, phase);
export const performHealthCheck = () => railwayIntegrationMonitor.performHealthCheck();
export const getRailwayInfo = () => railwayIntegrationMonitor.getRailwayInfo();
export const isRailwayEnvironment = () => railwayIntegrationMonitor.isRailwayEnvironment();
