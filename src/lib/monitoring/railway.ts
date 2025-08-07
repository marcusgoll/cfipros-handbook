import * as Sentry from '@sentry/nextjs';

// Railway-specific monitoring utilities
export type RailwayEnvironmentInfo = {
  environment?: string;
  service?: string;
  deploymentId?: string;
  region?: string;
  gitCommitSha?: string;
  gitBranch?: string;
  buildId?: string;
  replicaId?: string;
};

// Extract Railway environment information
export function getRailwayEnvironmentInfo(): RailwayEnvironmentInfo {
  return {
    environment: process.env.RAILWAY_ENVIRONMENT,
    service: process.env.RAILWAY_SERVICE_NAME,
    deploymentId: process.env.RAILWAY_DEPLOYMENT_ID,
    region: process.env.RAILWAY_REGION,
    gitCommitSha: process.env.RAILWAY_GIT_COMMIT_SHA,
    gitBranch: process.env.RAILWAY_GIT_BRANCH,
    buildId: process.env.RAILWAY_BUILD_ID,
    replicaId: process.env.RAILWAY_REPLICA_ID,
  };
}

// Railway deployment monitoring
export class RailwayMonitor {
  private static environmentInfo = getRailwayEnvironmentInfo();

  // Report deployment start
  static reportDeploymentStart() {
    const info = this.environmentInfo;

    Sentry.addBreadcrumb({
      category: 'deployment',
      message: 'Railway deployment started',
      level: 'info',
      data: {
        deployment_id: info.deploymentId,
        commit_sha: info.gitCommitSha,
        branch: info.gitBranch,
        environment: info.environment,
      },
    });

    Sentry.withScope((scope) => {
      scope.setTag('environment', info.environment || 'unknown');
      scope.setTag('service', info.service || 'unknown');
      scope.setTag('branch', info.gitBranch || 'unknown');
      // Disabled: scope.setMeasurement('deployment_started', 1);
    });
  }

  // Report deployment success
  static reportDeploymentSuccess() {
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

    Sentry.withScope((scope) => {
      scope.setTag('environment', info.environment || 'unknown');
      scope.setTag('service', info.service || 'unknown');
      // Disabled: scope.setMeasurement('deployment_success', 1);
    });
  }

  // Report deployment failure
  static reportDeploymentFailure(error: Error, phase?: string) {
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
          failure_phase: phase,
        },
      },
    });

    Sentry.withScope((scope) => {
      scope.setTag('environment', info.environment || 'unknown');
      scope.setTag('service', info.service || 'unknown');
      scope.setTag('phase', phase || 'unknown');
      // Disabled: scope.setMeasurement('deployment_failed', 1);
    });
  }

  // Monitor Railway service metrics
  static reportServiceMetrics(metrics: {
    cpu_usage?: number;
    memory_usage?: number;
    network_rx?: number;
    network_tx?: number;
    disk_usage?: number;
  }) {
    const info = this.environmentInfo;
    const tags = {
      environment: info.environment || 'unknown',
      service: info.service || 'unknown',
      replica: info.replicaId || 'unknown',
    };

    Sentry.withScope((scope) => {
      scope.setTag('environment', info.environment || 'unknown');
      scope.setTag('service', info.service || 'unknown');
      scope.setTag('replica', info.replicaId || 'unknown');

      if (metrics.cpu_usage !== undefined) {
        // Disabled: scope.setMeasurement('cpu_usage_percent', metrics.cpu_usage);
      }
      if (metrics.memory_usage !== undefined) {
        // Disabled: scope.setMeasurement('memory_usage_bytes', metrics.memory_usage);
      }
      if (metrics.network_rx !== undefined) {
        // Disabled: scope.setMeasurement('network_rx_bytes', metrics.network_rx);
      }
      if (metrics.network_tx !== undefined) {
        // Disabled: scope.setMeasurement('network_tx_bytes', metrics.network_tx);
      }
      if (metrics.disk_usage !== undefined) {
        // Disabled: scope.setMeasurement('disk_usage_bytes', metrics.disk_usage);
      }
    });
  }

  // Report scaling events
  static reportScalingEvent(event: 'scale_up' | 'scale_down', replicas: { from: number; to: number }) {
    const info = this.environmentInfo;

    Sentry.captureMessage(`Railway service ${event}`, {
      level: 'info',
      tags: {
        feature: 'scaling',
        event_type: event,
        environment: info.environment,
      },
      contexts: {
        scaling: {
          service: info.service,
          deployment_id: info.deploymentId,
          replicas_from: replicas.from,
          replicas_to: replicas.to,
          timestamp: new Date().toISOString(),
        },
      },
    });

    Sentry.withScope((scope) => {
      scope.setTag('environment', info.environment || 'unknown');
      scope.setTag('service', info.service || 'unknown');
      scope.setTag('scaling_event', event);
      // Disabled: scope.setMeasurement('scaling_event_count', 1);
    });
  }

  // Check Railway-specific environment health
  static checkRailwayHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
    info: RailwayEnvironmentInfo;
  } {
    const info = this.environmentInfo;
    const checks = {
      has_environment: !!info.environment,
      has_service_name: !!info.service,
      has_deployment_id: !!info.deploymentId,
      has_git_info: !!(info.gitCommitSha && info.gitBranch),
    };

    const healthyChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;

    let status: 'healthy' | 'degraded' | 'unhealthy';

    if (healthyChecks === totalChecks) {
      status = 'healthy';
    } else if (healthyChecks >= totalChecks * 0.7) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return { status, checks, info };
  }
}

// Railway-specific alerting
export class RailwayAlerting {
  // Send alert to Railway webhooks
  static async sendWebhookAlert(
    webhook_url: string,
    alert: {
      title: string;
      message: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      metadata?: Record<string, any>;
    },
  ) {
    try {
      const payload = {
        text: `🚨 ${alert.title}`,
        attachments: [
          {
            color: this.getSeverityColor(alert.severity),
            fields: [
              {
                title: 'Message',
                value: alert.message,
                short: false,
              },
              {
                title: 'Severity',
                value: alert.severity.toUpperCase(),
                short: true,
              },
              {
                title: 'Environment',
                value: process.env.RAILWAY_ENVIRONMENT || 'unknown',
                short: true,
              },
              {
                title: 'Service',
                value: process.env.RAILWAY_SERVICE_NAME || 'unknown',
                short: true,
              },
              {
                title: 'Deployment',
                value: process.env.RAILWAY_DEPLOYMENT_ID || 'unknown',
                short: true,
              },
            ],
            footer: 'CFI Handbook Monitoring',
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      };

      if (alert.metadata) {
        payload.attachments[0].fields.push({
          title: 'Metadata',
          value: JSON.stringify(alert.metadata, null, 2),
          short: false,
        });
      }

      const response = await fetch(webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.status}`);
      }

      Sentry.addBreadcrumb({
        category: 'alert',
        message: 'Railway webhook alert sent',
        level: 'info',
        data: {
          webhook_url: webhook_url.replace(/\/[^/]+$/, '/***'),
          alert_title: alert.title,
          severity: alert.severity,
        },
      });
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          feature: 'alerting',
          alert_type: 'webhook',
        },
        contexts: {
          alert: {
            title: alert.title,
            severity: alert.severity,
            webhook_url: webhook_url.replace(/\/[^/]+$/, '/***'),
          },
        },
      });
    }
  }

  private static getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#ff0000';
      case 'high': return '#ff6600';
      case 'medium': return '#ffcc00';
      case 'low': return '#00cc00';
      default: return '#cccccc';
    }
  }
}

// Initialize Railway monitoring
export function initializeRailwayMonitoring() {
  // Only run in Railway environment
  if (!process.env.RAILWAY_ENVIRONMENT) {
    return;
  }

  // Set Railway context in Sentry
  const railwayInfo = getRailwayEnvironmentInfo();
  Sentry.setContext('railway', railwayInfo);

  // Add Railway tags
  Sentry.setTags({
    'railway.environment': railwayInfo.environment,
    'railway.service': railwayInfo.service,
    'railway.deployment_id': railwayInfo.deploymentId,
  });

  // Report successful startup
  RailwayMonitor.reportDeploymentSuccess();

  // Check Railway health periodically
  if (typeof setInterval !== 'undefined') {
    setInterval(() => {
      const health = RailwayMonitor.checkRailwayHealth();

      if (health.status !== 'healthy') {
        Sentry.captureMessage('Railway environment health degraded', {
          level: health.status === 'unhealthy' ? 'error' : 'warning',
          tags: {
            feature: 'railway-health',
            status: health.status,
          },
          contexts: {
            railway_health: {
              status: health.status,
              checks: health.checks,
              info: health.info,
            },
          },
        });
      }
    }, 300000); // Check every 5 minutes
  }
}

// Handle Railway deployment lifecycle
if (typeof process !== 'undefined' && process.env.RAILWAY_ENVIRONMENT) {
  // Handle process shutdown gracefully
  process.on('SIGTERM', () => {
    Sentry.captureMessage('Railway service shutting down (SIGTERM)', {
      level: 'info',
      tags: { feature: 'deployment', phase: 'shutdown' },
    });

    Sentry.close(2000).then(() => {
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    Sentry.captureMessage('Railway service shutting down (SIGINT)', {
      level: 'info',
      tags: { feature: 'deployment', phase: 'shutdown' },
    });

    Sentry.close(2000).then(() => {
      process.exit(0);
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    RailwayMonitor.reportDeploymentFailure(error, 'runtime');
    Sentry.close(2000).then(() => {
      process.exit(1);
    });
  });

  process.on('unhandledRejection', (reason, promise) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    RailwayMonitor.reportDeploymentFailure(error, 'promise_rejection');
  });
}
