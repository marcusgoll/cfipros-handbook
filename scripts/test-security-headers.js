#!/usr/bin/env node

/**
 * Security Headers Test Script
 * Tests the security headers configuration in the CFI Handbook application
 */

const { execSync } = require('node:child_process');
const http = require('node:http');
const https = require('node:https');

// Configuration
const TEST_CONFIG = {
  development: {
    protocol: 'http',
    host: 'localhost',
    port: 3000,
  },
  production: {
    protocol: 'https',
    host: process.env.RAILWAY_STATIC_URL || 'cfipros.com',
    port: 443,
  },
};

// Required security headers
const REQUIRED_HEADERS = {
  'x-frame-options': 'DENY',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-dns-prefetch-control': 'off',
  'x-download-options': 'noopen',
  'x-permitted-cross-domain-policies': 'none',
};

// Conditional headers (based on environment)
const CONDITIONAL_HEADERS = {
  production: {
    'strict-transport-security': {
      required: true,
      contains: ['max-age=', 'includeSubDomains', 'preload'],
    },
  },
  development: {
    'strict-transport-security': {
      required: false,
      reason: 'HSTS disabled in development',
    },
  },
};

// CSP requirements
const CSP_REQUIREMENTS = {
  directives: [
    'default-src',
    'script-src',
    'style-src',
    'img-src',
    'connect-src',
    'font-src',
    'object-src',
    'base-uri',
    'form-action',
  ],
};

class SecurityHeadersTester {
  constructor(environment = 'development') {
    this.environment = environment;
    this.config = TEST_CONFIG[environment];
    this.results = [];
    this.warnings = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      warning: '⚠️',
      error: '❌',
    }[type];

    console.log(`${prefix} [${timestamp}] ${message}`);

    if (type === 'warning') {
      this.warnings.push(message);
    }
    if (type === 'error') {
      this.errors.push(message);
    }
  }

  async makeRequest(path = '/', method = 'GET') {
    return new Promise((resolve, reject) => {
      const protocol = this.config.protocol === 'https' ? https : http;
      const options = {
        hostname: this.config.host,
        port: this.config.port,
        path,
        method,
        timeout: 10000,
        rejectUnauthorized: false, // For self-signed certificates in development
      };

      const req = protocol.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data,
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  async testConnection() {
    this.log(`Testing connection to ${this.config.protocol}://${this.config.host}:${this.config.port}`);

    try {
      const response = await this.makeRequest('/');
      this.log(`Connection successful (Status: ${response.statusCode})`, 'success');
      return response;
    } catch (error) {
      this.log(`Connection failed: ${error.message}`, 'error');
      throw error;
    }
  }

  testRequiredHeaders(headers) {
    this.log('Testing required security headers...');
    let passed = 0;
    let total = 0;

    for (const [headerName, expectedValue] of Object.entries(REQUIRED_HEADERS)) {
      total++;
      const actualValue = headers[headerName.toLowerCase()];

      if (actualValue === expectedValue) {
        this.log(`${headerName}: ✓ (${actualValue})`, 'success');
        passed++;
      } else {
        this.log(`${headerName}: ✗ Expected "${expectedValue}", got "${actualValue || 'undefined'}"`, 'error');
      }
    }

    return { passed, total };
  }

  testConditionalHeaders(headers) {
    this.log('Testing conditional security headers...');
    let passed = 0;
    let total = 0;

    const conditionalConfig = CONDITIONAL_HEADERS[this.environment] || {};

    for (const [headerName, config] of Object.entries(conditionalConfig)) {
      total++;
      const actualValue = headers[headerName.toLowerCase()];

      if (config.required) {
        if (actualValue) {
          if (config.contains) {
            const missingParts = config.contains.filter(part => !actualValue.includes(part));
            if (missingParts.length === 0) {
              this.log(`${headerName}: ✓ (${actualValue})`, 'success');
              passed++;
            } else {
              this.log(`${headerName}: ✗ Missing parts: ${missingParts.join(', ')}`, 'error');
            }
          } else {
            this.log(`${headerName}: ✓ (${actualValue})`, 'success');
            passed++;
          }
        } else {
          this.log(`${headerName}: ✗ Required but missing`, 'error');
        }
      } else {
        if (actualValue) {
          this.log(`${headerName}: ! Present but not required (${config.reason || 'unknown reason'})`, 'warning');
        } else {
          this.log(`${headerName}: ✓ Correctly absent (${config.reason || 'not required'})`, 'success');
        }
        passed++; // Count as passed since it's not required
      }
    }

    return { passed, total };
  }

  testCSP(headers) {
    this.log('Testing Content Security Policy...');
    let passed = 0;
    let total = 0;

    const cspHeader = headers['content-security-policy'] || headers['content-security-policy-report-only'];

    if (!cspHeader) {
      this.log('CSP: ✗ No CSP header found', 'error');
      return { passed: 0, total: 1 };
    }

    total++;
    const isReportOnly = !!headers['content-security-policy-report-only'] && !headers['content-security-policy'];

    if (isReportOnly) {
      this.log('CSP: ⚠️ Running in report-only mode', 'warning');
    } else {
      this.log('CSP: ✓ Enforcing mode active', 'success');
    }
    passed++;

    // Test for required directives
    const directives = cspHeader.split(';').map(d => d.trim().split(' ')[0]);

    for (const requiredDirective of CSP_REQUIREMENTS.directives) {
      total++;
      if (directives.includes(requiredDirective)) {
        this.log(`CSP ${requiredDirective}: ✓`, 'success');
        passed++;
      } else {
        this.log(`CSP ${requiredDirective}: ✗ Missing`, 'error');
      }
    }

    // Check for potentially unsafe directives
    if (cspHeader.includes('\'unsafe-inline\'')) {
      this.log('CSP unsafe-inline: ⚠️ Present (required for Next.js)', 'warning');
    }

    if (cspHeader.includes('\'unsafe-eval\'')) {
      this.log('CSP unsafe-eval: ⚠️ Present (required for Next.js)', 'warning');
    }

    return { passed, total };
  }

  async testAPIEndpoints() {
    this.log('Testing API endpoint security headers...');

    const apiEndpoints = [
      '/api/health/security',
      '/api/health',
    ];

    let passed = 0;
    let total = 0;

    for (const endpoint of apiEndpoints) {
      try {
        total++;
        const response = await this.makeRequest(endpoint);

        if (response.statusCode < 500) {
          // Check for API-specific headers
          const hasApiVersion = response.headers['x-api-version'];
          const hasCacheControl = response.headers['cache-control'];
          const hasCORS = response.headers['access-control-allow-origin'];

          if (hasApiVersion && hasCacheControl && hasCORS) {
            this.log(`API ${endpoint}: ✓ Security headers present`, 'success');
            passed++;
          } else {
            const missing = [];
            if (!hasApiVersion) {
              missing.push('x-api-version');
            }
            if (!hasCacheControl) {
              missing.push('cache-control');
            }
            if (!hasCORS) {
              missing.push('access-control-allow-origin');
            }
            this.log(`API ${endpoint}: ✗ Missing headers: ${missing.join(', ')}`, 'error');
          }
        } else {
          this.log(`API ${endpoint}: ✗ Server error (${response.statusCode})`, 'error');
        }
      } catch (error) {
        this.log(`API ${endpoint}: ✗ Request failed: ${error.message}`, 'error');
      }
    }

    return { passed, total };
  }

  async testHealthEndpoint() {
    this.log('Testing security health endpoint...');

    try {
      const response = await this.makeRequest('/api/health/security');

      if (response.statusCode === 200 || response.statusCode === 206) {
        const data = JSON.parse(response.data);

        this.log(`Health check: ✓ Status: ${data.status}`, 'success');

        if (data.data && data.data.recommendations) {
          for (const recommendation of data.data.recommendations) {
            this.log(`Recommendation: ${recommendation}`, 'info');
          }
        }

        return { passed: 1, total: 1 };
      } else {
        this.log(`Health check: ✗ Status: ${response.statusCode}`, 'error');
        return { passed: 0, total: 1 };
      }
    } catch (error) {
      this.log(`Health check: ✗ Failed: ${error.message}`, 'error');
      return { passed: 0, total: 1 };
    }
  }

  async runAllTests() {
    this.log(`Starting security headers test suite for ${this.environment} environment`);

    try {
      // Test connection
      const response = await this.testConnection();

      // Test headers
      const requiredResults = this.testRequiredHeaders(response.headers);
      const conditionalResults = this.testConditionalHeaders(response.headers);
      const cspResults = this.testCSP(response.headers);
      const apiResults = await this.testAPIEndpoints();
      const healthResults = await this.testHealthEndpoint();

      // Calculate totals
      const totalPassed = requiredResults.passed + conditionalResults.passed
        + cspResults.passed + apiResults.passed + healthResults.passed;
      const totalTests = requiredResults.total + conditionalResults.total
        + cspResults.total + apiResults.total + healthResults.total;

      // Summary
      this.log('\n=== Test Summary ===');
      this.log(`Environment: ${this.environment}`);
      this.log(`Tests Passed: ${totalPassed}/${totalTests}`);
      this.log(`Warnings: ${this.warnings.length}`);
      this.log(`Errors: ${this.errors.length}`);

      const success = this.errors.length === 0;
      this.log(`Overall Result: ${success ? 'PASS' : 'FAIL'}`, success ? 'success' : 'error');

      return {
        success,
        passed: totalPassed,
        total: totalTests,
        warnings: this.warnings.length,
        errors: this.errors.length,
      };
    } catch (error) {
      this.log(`Test suite failed: ${error.message}`, 'error');
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Main execution
async function main() {
  const environment = process.env.NODE_ENV || 'development';
  const tester = new SecurityHeadersTester(environment);

  console.log('🛡️  CFI Handbook Security Headers Test');
  console.log('=====================================\n');

  const results = await tester.runAllTests();

  // Exit with appropriate code
  process.exit(results.success ? 0 : 1);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Test script failed:', error.message);
    process.exit(1);
  });
}

module.exports = { SecurityHeadersTester };
