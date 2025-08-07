#!/usr/bin/env node

/**
 * Post-Deployment Verification Script
 * Comprehensive testing suite to verify deployment success
 */

const { execSync } = require('node:child_process');
const https = require('node:https');

class DeploymentVerification {
  constructor() {
    this.config = {
      baseUrl: process.env.RAILWAY_STATIC_URL || process.env.RAILWAY_PUBLIC_DOMAIN || 'https://your-app.railway.app',
      timeout: 30000,
      retries: 3,
      environment: process.env.RAILWAY_ENVIRONMENT || 'production',
    };

    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      tests: [],
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

  async makeRequest(path, options = {}) {
    const url = `${this.config.baseUrl}${path}`;

    return new Promise((resolve, reject) => {
      const request = https.get(url, {
        timeout: options.timeout || this.config.timeout,
        ...options,
      }, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          try {
            const parsed = data.startsWith('{') || data.startsWith('[') ? JSON.parse(data) : data;
            resolve({
              status: response.statusCode,
              headers: response.headers,
              data: parsed,
              responseTime: Date.now() - startTime,
            });
          } catch (e) {
            resolve({
              status: response.statusCode,
              headers: response.headers,
              data,
              responseTime: Date.now() - startTime,
            });
          }
        });
      });

      const startTime = Date.now();

      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });

      request.on('error', (error) => {
        reject(error);
      });
    });
  }

  async runTest(testName, testFunction) {
    this.log(`\\n🧪 Running test: ${testName}`, 'blue');

    const testResult = {
      name: testName,
      status: 'pending',
      duration: 0,
      error: null,
      details: {},
    };

    const startTime = Date.now();

    try {
      const result = await testFunction();
      testResult.duration = Date.now() - startTime;
      testResult.status = 'passed';
      testResult.details = result || {};

      this.results.passed++;
      this.log(`✅ PASSED: ${testName} (${testResult.duration}ms)`, 'green');
    } catch (error) {
      testResult.duration = Date.now() - startTime;
      testResult.status = 'failed';
      testResult.error = error.message;

      this.results.failed++;
      this.log(`❌ FAILED: ${testName} - ${error.message}`, 'red');
    }

    this.results.tests.push(testResult);
    return testResult;
  }

  async verifyHealthChecks() {
    await this.runTest('Health Check Endpoint', async () => {
      const response = await this.makeRequest('/api/health');

      if (response.status !== 200) {
        throw new Error(`Health check returned status ${response.status}`);
      }

      if (response.data.status !== 'healthy') {
        throw new Error(`Application status is ${response.data.status}, expected healthy`);
      }

      // Verify all checks are healthy
      const checks = response.data.checks || {};
      const failedChecks = Object.entries(checks).filter(([_, check]) =>
        check.status !== 'healthy',
      );

      if (failedChecks.length > 0) {
        throw new Error(`Failed health checks: ${failedChecks.map(([name]) => name).join(', ')}`);
      }

      return {
        status: response.data.status,
        responseTime: response.responseTime,
        checks: Object.keys(checks).length,
      };
    });

    await this.runTest('Readiness Check Endpoint', async () => {
      const response = await this.makeRequest('/api/ready');

      if (response.status !== 200) {
        throw new Error(`Readiness check returned status ${response.status}`);
      }

      if (response.data.status !== 'ready') {
        throw new Error(`Application readiness is ${response.data.status}, expected ready`);
      }

      return {
        status: response.data.status,
        responseTime: response.responseTime,
      };
    });
  }

  async verifyDatabaseConnectivity() {
    await this.runTest('Database Connection', async () => {
      const response = await this.makeRequest('/api/health');

      if (response.status !== 200) {
        throw new Error('Health endpoint not accessible');
      }

      const dbCheck = response.data.checks?.database;
      if (!dbCheck) {
        throw new Error('Database check not found in health response');
      }

      if (dbCheck.status !== 'healthy') {
        throw new Error(`Database status is ${dbCheck.status}: ${dbCheck.error || 'Unknown error'}`);
      }

      if (dbCheck.latency > 5000) {
        throw new Error(`Database latency too high: ${dbCheck.latency}ms`);
      }

      return {
        latency: dbCheck.latency,
        poolUtilization: dbCheck.pool?.utilization || 0,
        activeConnections: dbCheck.pool?.activeConnections || 0,
      };
    });
  }

  async verifyApplicationPages() {
    const pages = [
      { path: '/', name: 'Home Page' },
      { path: '/handbook', name: 'Handbook Page' },
      { path: '/dashboard', name: 'Dashboard Page', requiresAuth: true },
      { path: '/api/handbook/toc', name: 'API - Table of Contents' },
    ];

    for (const page of pages) {
      await this.runTest(page.name, async () => {
        const response = await this.makeRequest(page.path);

        // For pages requiring auth, 401 or redirect is acceptable
        if (page.requiresAuth && (response.status === 401 || response.status === 302)) {
          return { status: response.status, message: 'Auth required (expected)' };
        }

        if (response.status !== 200) {
          throw new Error(`Page returned status ${response.status}`);
        }

        // Basic content checks
        if (typeof response.data === 'string') {
          if (!response.data.includes('<!DOCTYPE html') && !response.data.includes('<html')) {
            throw new Error('Response does not appear to be valid HTML');
          }
        }

        return {
          status: response.status,
          responseTime: response.responseTime,
          contentLength: typeof response.data === 'string' ? response.data.length : 0,
        };
      });
    }
  }

  async verifyAuthentication() {
    await this.runTest('Clerk Authentication Integration', async () => {
      // Check if Clerk is properly configured by testing sign-in page
      const response = await this.makeRequest('/sign-in');

      // Should redirect to Clerk or return sign-in page
      if (response.status !== 200 && response.status !== 302) {
        throw new Error(`Sign-in page returned unexpected status ${response.status}`);
      }

      return {
        status: response.status,
        hasClerkIntegration: response.headers.location?.includes('clerk')
          || (typeof response.data === 'string' && response.data.includes('clerk')),
      };
    });
  }

  async verifyPerformance() {
    await this.runTest('Response Time Performance', async () => {
      const endpoints = [
        '/api/health',
        '/',
        '/handbook',
      ];

      const results = [];

      for (const endpoint of endpoints) {
        const response = await this.makeRequest(endpoint);
        results.push({
          endpoint,
          responseTime: response.responseTime,
          status: response.status,
        });
      }

      const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
      const slowEndpoints = results.filter(r => r.responseTime > 5000);

      if (slowEndpoints.length > 0) {
        throw new Error(`Slow endpoints detected: ${slowEndpoints.map(e => `${e.endpoint} (${e.responseTime}ms)`).join(', ')}`);
      }

      return {
        averageResponseTime: Math.round(avgResponseTime),
        endpoints: results.length,
        slowEndpoints: slowEndpoints.length,
      };
    });
  }

  async verifyEnvironmentVariables() {
    await this.runTest('Environment Configuration', async () => {
      const response = await this.makeRequest('/api/health');

      if (response.status !== 200) {
        throw new Error('Cannot access health endpoint to verify environment');
      }

      const health = response.data;

      // Check environment is production
      if (health.environment !== 'production') {
        throw new Error(`Environment is ${health.environment}, expected production`);
      }

      // Check version is set
      if (!health.version || health.version === 'unknown') {
        throw new Error('Application version not properly set');
      }

      // Check Sentry is configured
      const sentryCheck = health.checks?.sentry;
      if (!sentryCheck || sentryCheck.status !== 'healthy') {
        throw new Error('Sentry monitoring not properly configured');
      }

      return {
        environment: health.environment,
        version: health.version,
        sentryConfigured: sentryCheck.dsn === 'configured',
      };
    });
  }

  async verifySSLAndSecurity() {
    await this.runTest('SSL and Security Headers', async () => {
      const response = await this.makeRequest('/');

      // Check if using HTTPS
      if (!this.config.baseUrl.startsWith('https://')) {
        throw new Error('Application not using HTTPS in production');
      }

      // Check security headers
      const securityHeaders = {
        'x-frame-options': response.headers['x-frame-options'],
        'x-content-type-options': response.headers['x-content-type-options'],
        'referrer-policy': response.headers['referrer-policy'],
      };

      return {
        httpsEnabled: true,
        securityHeaders: Object.keys(securityHeaders).filter(h => securityHeaders[h]).length,
      };
    });
  }

  async generateReport() {
    const totalTests = this.results.passed + this.results.failed + this.results.skipped;
    const successRate = totalTests > 0 ? (this.results.passed / totalTests * 100).toFixed(1) : 0;

    this.log(`\\n${'='.repeat(60)}`, 'blue');
    this.log('🔍 DEPLOYMENT VERIFICATION REPORT', 'bold');
    this.log('='.repeat(60), 'blue');

    this.log(`\\n📊 Summary:`, 'bold');
    this.log(`   Total Tests: ${totalTests}`);
    this.log(`   Passed: ${this.results.passed}`, 'green');
    this.log(`   Failed: ${this.results.failed}`, this.results.failed > 0 ? 'red' : 'reset');
    this.log(`   Skipped: ${this.results.skipped}`, 'yellow');
    this.log(`   Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : 'red');

    if (this.results.failed > 0) {
      this.log(`\\n❌ Failed Tests:`, 'red');
      this.results.tests
        .filter(t => t.status === 'failed')
        .forEach((test) => {
          this.log(`   • ${test.name}: ${test.error}`, 'red');
        });
    }

    this.log(`\\n📈 Performance Summary:`, 'bold');
    const performanceTests = this.results.tests.filter(t => t.duration > 0);
    if (performanceTests.length > 0) {
      const avgDuration = performanceTests.reduce((sum, t) => sum + t.duration, 0) / performanceTests.length;
      this.log(`   Average Test Duration: ${Math.round(avgDuration)}ms`);

      const slowTests = performanceTests.filter(t => t.duration > 5000);
      if (slowTests.length > 0) {
        this.log(`   Slow Tests (>5s): ${slowTests.length}`, 'yellow');
      }
    }

    this.log(`\\n🎯 Deployment Status: ${this.results.failed === 0 ? 'SUCCESS' : 'ISSUES DETECTED'}`, this.results.failed === 0 ? 'green' : 'red');

    return {
      success: this.results.failed === 0,
      totalTests,
      passed: this.results.passed,
      failed: this.results.failed,
      successRate: Number.parseFloat(successRate),
    };
  }

  async runFullVerification() {
    this.log('🚀 Starting Post-Deployment Verification', 'bold');
    this.log(`   Target: ${this.config.baseUrl}`, 'blue');
    this.log(`   Environment: ${this.config.environment}`, 'blue');

    try {
      // Core health and readiness checks
      await this.verifyHealthChecks();

      // Database connectivity
      await this.verifyDatabaseConnectivity();

      // Application pages
      await this.verifyApplicationPages();

      // Authentication system
      await this.verifyAuthentication();

      // Performance verification
      await this.verifyPerformance();

      // Environment configuration
      await this.verifyEnvironmentVariables();

      // Security checks
      await this.verifySSLAndSecurity();
    } catch (error) {
      this.log(`\\n💥 Verification suite failed: ${error.message}`, 'red');
    }

    return await this.generateReport();
  }
}

// CLI interface
if (require.main === module) {
  const verification = new DeploymentVerification();

  verification.runFullVerification().then((report) => {
    process.exit(report.success ? 0 : 1);
  }).catch((error) => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
}

module.exports = DeploymentVerification;
