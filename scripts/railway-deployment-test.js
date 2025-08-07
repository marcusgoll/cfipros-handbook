#!/usr/bin/env node

/**
 * Railway Deployment Testing Script
 * Comprehensive testing suite for Railway production deployment
 */

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const https = require('node:https');

class RailwayDeploymentTester {
  constructor() {
    this.config = {
      baseUrl: process.env.RAILWAY_STATIC_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      timeout: 30000,
      retries: 3,
      environment: process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    };

    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: [],
    };

    this.colors = {
      green: '\x1B[32m',
      red: '\x1B[31m',
      yellow: '\x1B[33m',
      blue: '\x1B[34m',
      magenta: '\x1B[35m',
      cyan: '\x1B[36m',
      reset: '\x1B[0m',
      bold: '\x1B[1m',
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

  async runTest(testName, testFunction, isWarning = false) {
    this.log(`\n🧪 Running test: ${testName}`, 'blue');

    const testResult = {
      name: testName,
      status: 'pending',
      duration: 0,
      error: null,
      details: {},
      isWarning,
    };

    const startTime = Date.now();

    try {
      const result = await testFunction();
      testResult.duration = Date.now() - startTime;
      testResult.status = 'passed';
      testResult.details = result || {};

      if (isWarning) {
        this.results.warnings++;
        this.log(`⚠️  WARNING: ${testName} (${testResult.duration}ms)`, 'yellow');
      } else {
        this.results.passed++;
        this.log(`✅ PASSED: ${testName} (${testResult.duration}ms)`, 'green');
      }
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

  async testRailwayEnvironment() {
    await this.runTest('Railway Environment Detection', async () => {
      const requiredVars = [
        'RAILWAY_STATIC_URL',
        'RAILWAY_ENVIRONMENT',
        'PORT',
      ];

      const missing = requiredVars.filter(v => !process.env[v]);

      if (missing.length > 0 && this.config.environment === 'production') {
        throw new Error(`Missing Railway variables: ${missing.join(', ')}`);
      }

      return {
        isRailway: !!process.env.RAILWAY_ENVIRONMENT,
        environment: process.env.RAILWAY_ENVIRONMENT,
        deploymentId: process.env.RAILWAY_DEPLOYMENT_ID,
        service: process.env.RAILWAY_SERVICE_NAME,
        gitCommit: process.env.RAILWAY_GIT_COMMIT_SHA?.substring(0, 8),
      };
    });
  }

  async testHealthEndpoints() {
    await this.runTest('Main Health Check Endpoint', async () => {
      const response = await this.makeRequest('/api/health');

      if (response.status !== 200) {
        throw new Error(`Health check returned status ${response.status}`);
      }

      if (response.data.status !== 'healthy') {
        throw new Error(`Application status is ${response.data.status}, expected healthy`);
      }

      // Verify all sub-checks are healthy
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
        checksCount: Object.keys(checks).length,
        uptime: response.data.uptime,
        version: response.data.version,
      };
    });

    await this.runTest('Readiness Probe Endpoint', async () => {
      const response = await this.makeRequest('/api/health/ready');

      if (response.status !== 200) {
        throw new Error(`Readiness check returned status ${response.status}`);
      }

      if (response.data.status !== 'ready') {
        throw new Error(`Application readiness is ${response.data.status}, expected ready`);
      }

      return {
        status: response.data.status,
        responseTime: response.responseTime,
        dbResponseTime: response.data.dbResponseTime,
        railwayInfo: response.data.railway,
      };
    });

    await this.runTest('Liveness Probe Endpoint', async () => {
      const response = await this.makeRequest('/api/health/live');

      if (response.status !== 200) {
        throw new Error(`Liveness check returned status ${response.status}`);
      }

      if (response.data.status !== 'alive') {
        throw new Error(`Application liveness is ${response.data.status}, expected alive`);
      }

      return {
        status: response.data.status,
        uptime: response.data.uptime,
        memoryUsage: response.data.memory,
        railwayInfo: response.data.railway,
      };
    });
  }

  async testDatabaseConnectivity() {
    await this.runTest('Database Connection Performance', async () => {
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

      // Check database performance
      const latency = dbCheck.latency;
      if (latency > 2000) {
        throw new Error(`Database latency too high: ${latency}ms (should be < 2000ms)`);
      }

      return {
        latency,
        poolUtilization: dbCheck.pool?.utilization || 0,
        activeConnections: dbCheck.pool?.activeConnections || 0,
        poolMaxConnections: dbCheck.pool?.maxConnections || 0,
      };
    });
  }

  async testApplicationPages() {
    const pages = [
      { path: '/', name: 'Home Page', expectedStatus: 200 },
      { path: '/handbook', name: 'Handbook Page', expectedStatus: 200 },
      { path: '/dashboard', name: 'Dashboard Page (Auth Required)', expectedStatus: [401, 302, 200] },
    ];

    for (const page of pages) {
      await this.runTest(`Page Access: ${page.name}`, async () => {
        const response = await this.makeRequest(page.path);

        const validStatuses = Array.isArray(page.expectedStatus)
          ? page.expectedStatus
          : [page.expectedStatus];

        if (!validStatuses.includes(response.status)) {
          throw new Error(
            `Page returned status ${response.status}, expected one of: ${validStatuses.join(', ')}`,
          );
        }

        return {
          status: response.status,
          responseTime: response.responseTime,
          contentLength: typeof response.data === 'string' ? response.data.length : 0,
        };
      });
    }
  }

  async testAPIEndpoints() {
    const endpoints = [
      { path: '/api/health', name: 'Health API', expectedStatus: 200 },
      { path: '/api/health/ready', name: 'Readiness API', expectedStatus: 200 },
      { path: '/api/health/live', name: 'Liveness API', expectedStatus: 200 },
    ];

    for (const endpoint of endpoints) {
      await this.runTest(`API Endpoint: ${endpoint.name}`, async () => {
        const response = await this.makeRequest(endpoint.path);

        if (response.status !== endpoint.expectedStatus) {
          throw new Error(`API returned status ${response.status}, expected ${endpoint.expectedStatus}`);
        }

        // Validate JSON response
        if (typeof response.data !== 'object') {
          throw new TypeError('API did not return valid JSON');
        }

        return {
          status: response.status,
          responseTime: response.responseTime,
          hasValidJson: typeof response.data === 'object',
        };
      });
    }
  }

  async testPerformance() {
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
      const slowEndpoints = results.filter(r => r.responseTime > 3000);

      if (slowEndpoints.length > 0) {
        this.log(`⚠️ Slow endpoints detected: ${slowEndpoints.map(e => `${e.endpoint} (${e.responseTime}ms)`).join(', ')}`, 'yellow');
      }

      return {
        averageResponseTime: Math.round(avgResponseTime),
        endpoints: results.length,
        slowEndpoints: slowEndpoints.length,
        results,
      };
    });
  }

  async testEnvironmentConfiguration() {
    await this.runTest('Environment Configuration Validation', async () => {
      const response = await this.makeRequest('/api/health/ready');

      if (response.status !== 200) {
        throw new Error('Cannot access readiness endpoint to verify environment');
      }

      const railwayInfo = response.data.railway;

      // Validate Railway environment
      if (process.env.RAILWAY_ENVIRONMENT) {
        if (!railwayInfo?.environment) {
          throw new Error('Railway environment not properly detected');
        }

        if (railwayInfo.environment !== process.env.RAILWAY_ENVIRONMENT) {
          throw new Error(`Environment mismatch: ${railwayInfo.environment} vs ${process.env.RAILWAY_ENVIRONMENT}`);
        }
      }

      return {
        environment: response.data.environment,
        railwayEnvironment: railwayInfo?.environment,
        deploymentId: railwayInfo?.deploymentId,
        service: railwayInfo?.service,
        zeroDowntimeEnabled: response.data.deployment?.zeroDowntimeEnabled,
      };
    });
  }

  async testSSLAndSecurity() {
    await this.runTest('HTTPS and Security Headers', async () => {
      if (!this.config.baseUrl.startsWith('https://') && this.config.environment === 'production') {
        throw new Error('Production application should use HTTPS');
      }

      const response = await this.makeRequest('/');

      // Check basic security headers
      const securityHeaders = {
        'x-frame-options': response.headers['x-frame-options'],
        'x-content-type-options': response.headers['x-content-type-options'],
        'referrer-policy': response.headers['referrer-policy'],
      };

      const presentHeaders = Object.keys(securityHeaders).filter(h => securityHeaders[h]);

      return {
        httpsEnabled: this.config.baseUrl.startsWith('https://'),
        securityHeadersCount: presentHeaders.length,
        securityHeaders: presentHeaders,
      };
    });
  }

  async testConfigurationFiles() {
    await this.runTest('Railway Configuration Files', async () => {
      const files = [
        'railway.json',
        'railway.toml',
        '.env.example',
      ];

      const missingFiles = files.filter(file => !fs.existsSync(file));

      if (missingFiles.length > 0) {
        throw new Error(`Missing configuration files: ${missingFiles.join(', ')}`);
      }

      // Validate railway.json
      const railwayConfig = JSON.parse(fs.readFileSync('railway.json', 'utf8'));
      const requiredSections = ['build', 'deploy', 'variables'];
      const missingSections = requiredSections.filter(section => !railwayConfig[section]);

      if (missingSections.length > 0) {
        throw new Error(`Missing railway.json sections: ${missingSections.join(', ')}`);
      }

      return {
        filesPresent: files.length,
        railwayConfigValid: true,
        healthcheckPath: railwayConfig.deploy?.healthcheckPath,
        resourcesConfigured: !!railwayConfig.resources,
      };
    });
  }

  async generateReport() {
    const totalTests = this.results.passed + this.results.failed + this.results.warnings;
    const successRate = totalTests > 0 ? (this.results.passed / totalTests * 100).toFixed(1) : 0;

    this.log(`\n${'='.repeat(70)}`, 'cyan');
    this.log('🚀 RAILWAY DEPLOYMENT TEST REPORT', 'bold');
    this.log('='.repeat(70), 'cyan');

    this.log(`\n📊 Summary:`, 'bold');
    this.log(`   Target URL: ${this.config.baseUrl}`, 'cyan');
    this.log(`   Environment: ${this.config.environment}`, 'cyan');
    this.log(`   Total Tests: ${totalTests}`);
    this.log(`   Passed: ${this.results.passed}`, 'green');
    this.log(`   Failed: ${this.results.failed}`, this.results.failed > 0 ? 'red' : 'reset');
    this.log(`   Warnings: ${this.results.warnings}`, this.results.warnings > 0 ? 'yellow' : 'reset');
    this.log(`   Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : 'red');

    if (this.results.failed > 0) {
      this.log(`\n❌ Failed Tests:`, 'red');
      this.results.tests
        .filter(t => t.status === 'failed')
        .forEach((test) => {
          this.log(`   • ${test.name}: ${test.error}`, 'red');
        });
    }

    if (this.results.warnings > 0) {
      this.log(`\n⚠️  Warnings:`, 'yellow');
      this.results.tests
        .filter(t => t.isWarning)
        .forEach((test) => {
          this.log(`   • ${test.name}`, 'yellow');
        });
    }

    this.log(`\n📈 Performance Summary:`, 'bold');
    const performanceTests = this.results.tests.filter(t => t.duration > 0);
    if (performanceTests.length > 0) {
      const avgDuration = performanceTests.reduce((sum, t) => sum + t.duration, 0) / performanceTests.length;
      this.log(`   Average Test Duration: ${Math.round(avgDuration)}ms`);

      const slowTests = performanceTests.filter(t => t.duration > 5000);
      if (slowTests.length > 0) {
        this.log(`   Slow Tests (>5s): ${slowTests.length}`, 'yellow');
      }
    }

    const deploymentStatus = this.results.failed === 0 ? 'READY FOR PRODUCTION' : 'ISSUES DETECTED';
    this.log(`\n🎯 Deployment Status: ${deploymentStatus}`, this.results.failed === 0 ? 'green' : 'red');

    if (this.results.failed === 0) {
      this.log(`\n🚀 Deployment Recommendations:`, 'green');
      this.log(`   • All tests passed - deployment looks good!`);
      this.log(`   • Monitor application after deployment`);
      this.log(`   • Set up alerts for health check failures`);
      this.log(`   • Review performance metrics regularly`);
    } else {
      this.log(`\n🔧 Required Actions:`, 'red');
      this.log(`   • Fix all failed tests before deploying to production`);
      this.log(`   • Review configuration and environment variables`);
      this.log(`   • Test locally to ensure all components work`);
      this.log(`   • Re-run this script after fixes`);
    }

    return {
      success: this.results.failed === 0,
      totalTests,
      passed: this.results.passed,
      failed: this.results.failed,
      warnings: this.results.warnings,
      successRate: Number.parseFloat(successRate),
    };
  }

  async runFullTest() {
    this.log('🚀 Starting Railway Deployment Test Suite', 'bold');
    this.log(`   Target: ${this.config.baseUrl}`, 'cyan');
    this.log(`   Environment: ${this.config.environment}`, 'cyan');

    try {
      // Core Railway tests
      await this.testRailwayEnvironment();
      await this.testConfigurationFiles();

      // Health and readiness tests
      await this.testHealthEndpoints();

      // Database connectivity
      await this.testDatabaseConnectivity();

      // Application functionality
      await this.testApplicationPages();
      await this.testAPIEndpoints();

      // Performance and security
      await this.testPerformance();
      await this.testEnvironmentConfiguration();
      await this.testSSLAndSecurity();
    } catch (error) {
      this.log(`\n💥 Test suite failed: ${error.message}`, 'red');
    }

    return await this.generateReport();
  }
}

// CLI interface
if (require.main === module) {
  const tester = new RailwayDeploymentTester();

  tester.runFullTest().then((report) => {
    process.exit(report.success ? 0 : 1);
  }).catch((error) => {
    console.error('Railway deployment test failed:', error);
    process.exit(1);
  });
}

module.exports = RailwayDeploymentTester;
