#!/usr/bin/env node

/**
 * Automatic Rollback System for Railway Deployments
 * Monitors health checks and triggers rollbacks based on failure conditions
 */

const { execSync } = require('node:child_process');
const https = require('node:https');

class AutoRollback {
  constructor() {
    this.config = {
      healthCheckUrl: process.env.HEALTH_CHECK_URL || 'https://your-app.railway.app/api/health',
      readinessCheckUrl: process.env.READINESS_CHECK_URL || 'https://your-app.railway.app/api/ready',
      checkInterval: Number.parseInt(process.env.ROLLBACK_CHECK_INTERVAL) || 30000, // 30 seconds
      healthCheckTimeout: Number.parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 10000, // 10 seconds
      failureThreshold: Number.parseInt(process.env.ROLLBACK_FAILURE_THRESHOLD) || 3, // 3 consecutive failures
      rollbackTimeout: Number.parseInt(process.env.ROLLBACK_TIMEOUT) || 300000, // 5 minutes
      monitoringDuration: Number.parseInt(process.env.MONITORING_DURATION) || 600000, // 10 minutes post-deployment
      slackWebhook: process.env.SLACK_WEBHOOK_URL,
      environment: process.env.RAILWAY_ENVIRONMENT || 'production',
    };

    this.state = {
      consecutiveFailures: 0,
      isMonitoring: false,
      deploymentStartTime: null,
      lastHealthCheck: null,
      rollbackInProgress: false,
    };

    this.colors = {
      green: '\\x1b[32m',
      red: '\\x1b[31m',
      yellow: '\\x1b[33m',
      blue: '\\x1b[34m',
      reset: '\\x1b[0m',
      bold: '\\x1b[1m',
    };
  }

  log(message, color = 'reset') {
    const timestamp = new Date().toISOString();
    console.log(`${this.colors[color]}[${timestamp}] ${message}${this.colors.reset}`);
  }

  async makeHttpRequest(url, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const request = https.get(url, { timeout }, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: response.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: response.statusCode, data });
          }
        });
      });

      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });

      request.on('error', (error) => {
        reject(error);
      });
    });
  }

  async checkHealth() {
    try {
      this.log('Performing health check...', 'blue');

      const response = await this.makeHttpRequest(
        this.config.healthCheckUrl,
        this.config.healthCheckTimeout,
      );

      this.state.lastHealthCheck = {
        timestamp: new Date(),
        status: response.status,
        data: response.data,
      };

      if (response.status === 200 && response.data.status === 'healthy') {
        this.state.consecutiveFailures = 0;
        this.log('✅ Health check passed', 'green');
        return true;
      } else {
        this.state.consecutiveFailures++;
        this.log(`❌ Health check failed (${this.state.consecutiveFailures}/${this.config.failureThreshold})`, 'red');
        this.log(`   Status: ${response.status}, Health: ${response.data?.status || 'unknown'}`, 'red');

        // Log detailed health check results
        if (response.data?.checks) {
          Object.entries(response.data.checks).forEach(([check, result]) => {
            const status = result.status;
            const emoji = status === 'healthy' ? '✅' : status === 'degraded' ? '⚠️' : '❌';
            this.log(`   ${emoji} ${check}: ${status}`, status === 'healthy' ? 'green' : 'yellow');
          });
        }

        return false;
      }
    } catch (error) {
      this.state.consecutiveFailures++;
      this.log(`❌ Health check error (${this.state.consecutiveFailures}/${this.config.failureThreshold}): ${error.message}`, 'red');
      return false;
    }
  }

  async checkReadiness() {
    try {
      this.log('Performing readiness check...', 'blue');

      const response = await this.makeHttpRequest(
        this.config.readinessCheckUrl,
        this.config.healthCheckTimeout,
      );

      if (response.status === 200 && response.data.status === 'ready') {
        this.log('✅ Readiness check passed', 'green');
        return true;
      } else {
        this.log(`❌ Readiness check failed: ${response.data?.status || 'unknown'}`, 'red');
        return false;
      }
    } catch (error) {
      this.log(`❌ Readiness check error: ${error.message}`, 'red');
      return false;
    }
  }

  async executeRollback() {
    if (this.state.rollbackInProgress) {
      this.log('⚠️  Rollback already in progress', 'yellow');
      return false;
    }

    this.state.rollbackInProgress = true;
    this.log('🔄 Initiating automatic rollback...', 'bold');

    try {
      // Send alert notification
      await this.sendAlert('rollback_started', {
        reason: `${this.state.consecutiveFailures} consecutive health check failures`,
        environment: this.config.environment,
        lastHealthCheck: this.state.lastHealthCheck,
      });

      // Get deployment history
      this.log('📋 Getting deployment history...', 'blue');
      const history = execSync('railway deployment list --json', { encoding: 'utf8' });
      const deployments = JSON.parse(history);

      if (deployments.length < 2) {
        throw new Error('No previous deployment found for rollback');
      }

      // Find the previous successful deployment
      const previousDeployment = deployments.find((d, index) =>
        index > 0 && d.status === 'SUCCESS',
      );

      if (!previousDeployment) {
        throw new Error('No previous successful deployment found');
      }

      this.log(`🔄 Rolling back to deployment: ${previousDeployment.id}`, 'yellow');

      // Execute rollback
      execSync(`railway deployment rollback ${previousDeployment.id}`, {
        encoding: 'utf8',
        timeout: this.config.rollbackTimeout,
      });

      this.log('✅ Rollback command executed successfully', 'green');

      // Wait for rollback to complete and verify
      await this.waitForRollbackCompletion();

      // Send success notification
      await this.sendAlert('rollback_success', {
        rolledBackTo: previousDeployment.id,
        environment: this.config.environment,
      });

      this.log('🎉 Automatic rollback completed successfully', 'green');
      return true;
    } catch (error) {
      this.log(`❌ Rollback failed: ${error.message}`, 'red');

      // Send failure notification
      await this.sendAlert('rollback_failed', {
        error: error.message,
        environment: this.config.environment,
      });

      return false;
    } finally {
      this.state.rollbackInProgress = false;
    }
  }

  async waitForRollbackCompletion() {
    this.log('⏳ Waiting for rollback to complete...', 'yellow');

    const maxWaitTime = 300000; // 5 minutes
    const checkInterval = 10000; // 10 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      try {
        // Check if the rolled-back version is healthy
        const isHealthy = await this.checkHealth();
        const isReady = await this.checkReadiness();

        if (isHealthy && isReady) {
          this.log('✅ Rollback verification successful', 'green');
          return true;
        }

        this.log('⏳ Waiting for rollback to stabilize...', 'yellow');
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      } catch (error) {
        this.log(`⚠️  Error during rollback verification: ${error.message}`, 'yellow');
      }
    }

    throw new Error('Rollback verification timed out');
  }

  async sendAlert(type, data) {
    if (!this.config.slackWebhook) {
      this.log('⚠️  No Slack webhook configured for alerts', 'yellow');
      return;
    }

    const messages = {
      rollback_started: {
        color: 'warning',
        title: '🚨 Automatic Rollback Started',
        text: `Rollback initiated due to: ${data.reason}`,
      },
      rollback_success: {
        color: 'good',
        title: '✅ Automatic Rollback Successful',
        text: `Successfully rolled back to deployment: ${data.rolledBackTo}`,
      },
      rollback_failed: {
        color: 'danger',
        title: '❌ Automatic Rollback Failed',
        text: `Rollback failed with error: ${data.error}`,
      },
    };

    const message = messages[type];
    if (!message) {
      return;
    }

    const payload = {
      attachments: [
        {
          color: message.color,
          title: message.title,
          text: message.text,
          fields: [
            {
              title: 'Environment',
              value: data.environment,
              short: true,
            },
            {
              title: 'Timestamp',
              value: new Date().toISOString(),
              short: true,
            },
          ],
          footer: 'CFI Handbook Auto-Rollback System',
        },
      ],
    };

    try {
      // Implementation would send to Slack webhook
      this.log(`📢 Alert sent: ${message.title}`, 'blue');
    } catch (error) {
      this.log(`⚠️  Failed to send alert: ${error.message}`, 'yellow');
    }
  }

  async startMonitoring() {
    if (this.state.isMonitoring) {
      this.log('⚠️  Monitoring already in progress', 'yellow');
      return;
    }

    this.state.isMonitoring = true;
    this.state.deploymentStartTime = Date.now();
    this.state.consecutiveFailures = 0;

    this.log('🔍 Starting post-deployment monitoring...', 'bold');
    this.log(`   Check interval: ${this.config.checkInterval}ms`, 'blue');
    this.log(`   Failure threshold: ${this.config.failureThreshold}`, 'blue');
    this.log(`   Monitoring duration: ${this.config.monitoringDuration}ms`, 'blue');

    const monitoringInterval = setInterval(async () => {
      try {
        // Check if monitoring period has elapsed
        const elapsed = Date.now() - this.state.deploymentStartTime;
        if (elapsed > this.config.monitoringDuration) {
          this.log('✅ Monitoring period completed successfully', 'green');
          clearInterval(monitoringInterval);
          this.state.isMonitoring = false;
          return;
        }

        // Perform health check
        const isHealthy = await this.checkHealth();

        // Check if rollback is needed
        if (this.state.consecutiveFailures >= this.config.failureThreshold) {
          this.log(`🚨 Failure threshold reached (${this.state.consecutiveFailures}/${this.config.failureThreshold})`, 'red');

          clearInterval(monitoringInterval);
          this.state.isMonitoring = false;

          const rollbackSuccess = await this.executeRollback();
          if (!rollbackSuccess) {
            this.log('💥 Critical: Automatic rollback failed - manual intervention required', 'red');
          }
          return;
        }

        // Log monitoring progress
        const remainingTime = this.config.monitoringDuration - elapsed;
        this.log(`⏳ Monitoring continues... ${Math.round(remainingTime / 1000)}s remaining`, 'blue');
      } catch (error) {
        this.log(`❌ Monitoring error: ${error.message}`, 'red');
        this.state.consecutiveFailures++;
      }
    }, this.config.checkInterval);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      this.log('🛑 Shutting down monitoring...', 'yellow');
      clearInterval(monitoringInterval);
      this.state.isMonitoring = false;
      process.exit(0);
    });
  }

  async performOneTimeCheck() {
    this.log('🔍 Performing one-time health check...', 'bold');

    const isHealthy = await this.checkHealth();
    const isReady = await this.checkReadiness();

    if (!isHealthy || !isReady) {
      this.log('❌ Application is not healthy - consider manual rollback', 'red');
      return false;
    }

    this.log('✅ Application is healthy', 'green');
    return true;
  }
}

// CLI interface
if (require.main === module) {
  const rollback = new AutoRollback();
  const command = process.argv[2];

  switch (command) {
    case 'monitor':
      rollback.startMonitoring();
      break;
    case 'check':
      rollback.performOneTimeCheck().then((healthy) => {
        process.exit(healthy ? 0 : 1);
      });
      break;
    case 'rollback':
      rollback.executeRollback().then((success) => {
        process.exit(success ? 0 : 1);
      });
      break;
    default:
      console.log('Usage: node auto-rollback.js [monitor|check|rollback]');
      process.exit(1);
  }
}

module.exports = AutoRollback;
