#!/usr/bin/env node

/**
 * Blue-Green Deployment Script for Railway
 * Implements zero-downtime deployments using Railway's preview deployments
 */

const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');

class BlueGreenDeployment {
  constructor() {
    this.config = {
      healthCheckPath: '/api/health',
      readinessCheckPath: '/api/ready',
      healthCheckTimeout: 30000,
      healthCheckRetries: 10,
      healthCheckInterval: 3000,
      rollbackTimeout: 120000,
      productionService: process.env.RAILWAY_SERVICE_NAME || 'cfi-handbook',
      environment: process.env.RAILWAY_ENVIRONMENT || 'production'
    };
    
    this.colors = {
      green: '\x1b[32m',
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      reset: '\x1b[0m',
      bold: '\x1b[1m'
    };
  }

  log(message, color = 'reset') {
    console.log(`${this.colors[color]}${message}${this.colors.reset}`);
  }

  async execute(command) {
    this.log(`Executing: ${command}`, 'blue');
    try {
      const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
      return output.trim();
    } catch (error) {
      this.log(`Command failed: ${error.message}`, 'red');
      throw error;
    }
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
            resolve({ status: response.statusCode, data: data });
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

  async waitForHealthCheck(url, maxRetries = 10) {
    this.log(`\\nWaiting for health check at: ${url}`, 'yellow');
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        this.log(`Health check attempt ${i + 1}/${maxRetries}...`, 'blue');
        
        const response = await this.makeHttpRequest(url, this.config.healthCheckTimeout);
        
        if (response.status === 200) {
          const data = response.data;
          if (data.status === 'healthy') {
            this.log('✅ Health check passed - application is healthy', 'green');
            return true;
          } else {
            this.log(`⚠️  Health check returned: ${data.status}`, 'yellow');
            if (data.checks) {
              Object.entries(data.checks).forEach(([check, result]) => {
                const status = result.status;
                const emoji = status === 'healthy' ? '✅' : status === 'degraded' ? '⚠️' : '❌';
                this.log(`  ${emoji} ${check}: ${status}`, status === 'healthy' ? 'green' : 'yellow');
              });
            }
          }
        } else {
          this.log(`❌ Health check failed with status: ${response.status}`, 'red');
        }
      } catch (error) {
        this.log(`❌ Health check failed: ${error.message}`, 'red');
      }
      
      if (i < maxRetries - 1) {
        this.log(`Waiting ${this.config.healthCheckInterval}ms before retry...`, 'blue');
        await new Promise(resolve => setTimeout(resolve, this.config.healthCheckInterval));
      }
    }
    
    return false;
  }

  async waitForReadinessCheck(url, maxRetries = 5) {
    this.log(`\\nWaiting for readiness check at: ${url}`, 'yellow');
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        this.log(`Readiness check attempt ${i + 1}/${maxRetries}...`, 'blue');
        
        const response = await this.makeHttpRequest(url, this.config.healthCheckTimeout);
        
        if (response.status === 200 && response.data.status === 'ready') {
          this.log('✅ Readiness check passed - application is ready for traffic', 'green');
          return true;
        } else {
          this.log(`⚠️  Readiness check failed: ${response.data?.status || response.status}`, 'yellow');
          if (response.data?.checks) {
            Object.entries(response.data.checks).forEach(([check, result]) => {
              const status = result.status;
              const emoji = status === 'ready' ? '✅' : '❌';
              this.log(`  ${emoji} ${check}: ${status}`, status === 'ready' ? 'green' : 'red');
            });
          }
        }
      } catch (error) {
        this.log(`❌ Readiness check failed: ${error.message}`, 'red');
      }
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, this.config.healthCheckInterval));
      }
    }
    
    return false;
  }

  async getCurrentDeployment() {
    try {
      const output = await this.execute('railway status --json');
      const status = JSON.parse(output);
      return {
        serviceId: status.service?.id,
        projectId: status.project?.id,
        environment: status.environment?.name
      };
    } catch (error) {
      this.log('Failed to get current deployment info', 'red');
      throw error;
    }
  }

  async createPreviewDeployment() {
    this.log('\\n🚀 Creating preview deployment (Blue environment)...', 'bold');
    
    try {
      // Create a new preview deployment
      const output = await this.execute('railway deploy --detach');
      
      // Extract deployment URL from output
      const urlMatch = output.match(/https:\\/\\/[^\\s]+/);
      if (!urlMatch) {
        throw new Error('Could not extract deployment URL from railway output');
      }
      
      const previewUrl = urlMatch[0];
      this.log(`✅ Preview deployment created: ${previewUrl}`, 'green');
      
      return previewUrl;
    } catch (error) {
      this.log('❌ Failed to create preview deployment', 'red');
      throw error;
    }
  }

  async promotePreviewToProduction(previewUrl) {
    this.log('\\n🔄 Promoting preview to production (Green → Blue switch)...', 'bold');
    
    try {
      // In Railway, we need to update the production service
      // This is typically done by redeploying to the production environment
      await this.execute('railway deploy');
      
      this.log('✅ Successfully promoted preview to production', 'green');
      return true;
    } catch (error) {
      this.log('❌ Failed to promote preview to production', 'red');
      throw error;
    }
  }

  async rollback() {
    this.log('\\n🔄 Initiating rollback to previous version...', 'yellow');
    
    try {
      // Get deployment history
      const history = await this.execute('railway deployment list --json');
      const deployments = JSON.parse(history);
      
      if (deployments.length < 2) {
        throw new Error('No previous deployment found for rollback');
      }
      
      // Get the previous successful deployment
      const previousDeployment = deployments.find((d, index) => 
        index > 0 && d.status === 'SUCCESS'
      );
      
      if (!previousDeployment) {
        throw new Error('No previous successful deployment found');
      }
      
      this.log(`Rolling back to deployment: ${previousDeployment.id}`, 'yellow');
      
      // Rollback to previous deployment
      await this.execute(`railway deployment rollback ${previousDeployment.id}`);
      
      this.log('✅ Rollback completed successfully', 'green');
      return true;
    } catch (error) {
      this.log(`❌ Rollback failed: ${error.message}`, 'red');
      return false;
    }
  }

  async deploy() {
    this.log('\\n🌟 Starting Blue-Green Deployment Process', 'bold');
    this.log('=' .repeat(50), 'blue');
    
    try {
      // Step 1: Get current deployment info
      this.log('\\n📊 Getting current deployment information...', 'bold');
      const currentDeployment = await this.getCurrentDeployment();
      this.log(`Current service: ${currentDeployment.serviceId}`, 'blue');
      this.log(`Environment: ${currentDeployment.environment}`, 'blue');
      
      // Step 2: Create preview deployment (Blue environment)
      const previewUrl = await this.createPreviewDeployment();
      
      // Step 3: Wait for preview deployment to be healthy
      const healthUrl = `${previewUrl}${this.config.healthCheckPath}`;
      const isHealthy = await this.waitForHealthCheck(healthUrl, this.config.healthCheckRetries);
      
      if (!isHealthy) {
        this.log('❌ Preview deployment failed health checks', 'red');
        throw new Error('Health checks failed for preview deployment');
      }
      
      // Step 4: Wait for readiness check
      const readinessUrl = `${previewUrl}${this.config.readinessCheckPath}`;
      const isReady = await this.waitForReadinessCheck(readinessUrl, 5);
      
      if (!isReady) {
        this.log('❌ Preview deployment failed readiness checks', 'red');
        throw new Error('Readiness checks failed for preview deployment');
      }
      
      // Step 5: Promote preview to production
      const promoted = await this.promotePreviewToProduction(previewUrl);
      
      if (!promoted) {
        throw new Error('Failed to promote preview to production');
      }
      
      // Step 6: Final health check on production
      this.log('\\n🏁 Running final health checks on production...', 'bold');
      
      // Wait a moment for DNS/routing to propagate
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      const productionUrl = process.env.RAILWAY_STATIC_URL || process.env.RAILWAY_PUBLIC_DOMAIN;
      if (productionUrl) {
        const finalHealthUrl = `https://${productionUrl}${this.config.healthCheckPath}`;
        const finalHealthy = await this.waitForHealthCheck(finalHealthUrl, 5);
        
        if (!finalHealthy) {
          this.log('⚠️  Production health check failed - considering rollback', 'yellow');
          
          const rollbackSuccess = await this.rollback();
          if (rollbackSuccess) {
            throw new Error('Deployment failed final health check - rolled back successfully');
          } else {
            throw new Error('Deployment failed final health check - rollback also failed');
          }
        }
      }
      
      this.log('\\n🎉 Blue-Green Deployment Completed Successfully!', 'green');
      this.log('=' .repeat(50), 'green');
      
    } catch (error) {
      this.log(`\\n💥 Deployment Failed: ${error.message}`, 'red');
      this.log('=' .repeat(50), 'red');
      process.exit(1);
    }
  }
}

// Main execution
if (require.main === module) {
  const deployment = new BlueGreenDeployment();
  deployment.deploy().catch(error => {
    console.error('Deployment script failed:', error);
    process.exit(1);
  });
}

module.exports = BlueGreenDeployment;