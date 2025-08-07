/**
 * Security Headers Testing Utilities
 * Test and validate security headers configuration
 */

import { apiSecurityHeaders } from './api-headers';
import { railwaySecurityHeaders, RailwayUtils } from './railway-config';

export type SecurityTestResult = {
  testName: string;
  passed: boolean;
  details: string;
  expected?: string;
  actual?: string;
};

export type SecurityTestSuite = {
  suiteName: string;
  environment: string;
  results: SecurityTestResult[];
  overallPass: boolean;
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
};

/**
 * Test CSP header configuration
 */
export function testCSPConfiguration(): SecurityTestResult[] {
  const results: SecurityTestResult[] = [];

  try {
    // Create a mock response to test headers
    const mockResponse = new Response();
    const headers = new Headers();

    // Apply security headers
    const testResponse = railwaySecurityHeaders.applyHeaders({
      headers,
    } as any);

    // Test CSP header presence
    const cspHeader = testResponse.headers.get('content-security-policy')
      || testResponse.headers.get('content-security-policy-report-only');

    results.push({
      testName: 'CSP Header Presence',
      passed: !!cspHeader,
      details: cspHeader ? 'CSP header is configured' : 'CSP header is missing',
      actual: cspHeader || 'null',
    });

    if (cspHeader) {
      // Test specific directives
      const directives = cspHeader.split(';').map(d => d.trim());

      const requiredDirectives = [
        'default-src',
        'script-src',
        'style-src',
        'img-src',
        'connect-src',
        'font-src',
        'object-src',
        'base-uri',
        'form-action',
      ];

      for (const directive of requiredDirectives) {
        const hasDirective = directives.some(d => d.startsWith(directive));
        results.push({
          testName: `CSP ${directive} directive`,
          passed: hasDirective,
          details: hasDirective
            ? `${directive} directive is configured`
            : `${directive} directive is missing`,
        });
      }

      // Test for unsafe directives
      const hasUnsafeInline = cspHeader.includes('\'unsafe-inline\'');
      const hasUnsafeEval = cspHeader.includes('\'unsafe-eval\'');

      results.push({
        testName: 'CSP unsafe-inline usage',
        passed: hasUnsafeInline,
        details: hasUnsafeInline
          ? 'unsafe-inline is present (required for Next.js)'
          : 'unsafe-inline is not present',
      });

      results.push({
        testName: 'CSP unsafe-eval usage',
        passed: hasUnsafeEval,
        details: hasUnsafeEval
          ? 'unsafe-eval is present (required for Next.js)'
          : 'unsafe-eval is not present',
      });
    }
  } catch (error) {
    results.push({
      testName: 'CSP Configuration Test',
      passed: false,
      details: `Error testing CSP: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }

  return results;
}

/**
 * Test HSTS configuration
 */
export function testHSTSConfiguration(): SecurityTestResult[] {
  const results: SecurityTestResult[] = [];
  const isDevelopment = process.env.NODE_ENV === 'development';

  try {
    const mockResponse = new Response();
    const headers = new Headers();
    const testResponse = railwaySecurityHeaders.applyHeaders({ headers } as any);

    const hstsHeader = testResponse.headers.get('strict-transport-security');

    if (isDevelopment) {
      results.push({
        testName: 'HSTS in Development',
        passed: !hstsHeader,
        details: hstsHeader
          ? 'HSTS should be disabled in development'
          : 'HSTS correctly disabled in development',
      });
    } else {
      results.push({
        testName: 'HSTS in Production',
        passed: !!hstsHeader,
        details: hstsHeader
          ? 'HSTS header is configured for production'
          : 'HSTS header is missing in production',
        actual: hstsHeader || 'null',
      });

      if (hstsHeader) {
        const hasMaxAge = hstsHeader.includes('max-age=');
        const hasIncludeSubDomains = hstsHeader.includes('includeSubDomains');
        const hasPreload = hstsHeader.includes('preload');

        results.push({
          testName: 'HSTS max-age directive',
          passed: hasMaxAge,
          details: hasMaxAge ? 'max-age is configured' : 'max-age is missing',
        });

        results.push({
          testName: 'HSTS includeSubDomains directive',
          passed: hasIncludeSubDomains,
          details: hasIncludeSubDomains
            ? 'includeSubDomains is configured'
            : 'includeSubDomains is missing',
        });

        results.push({
          testName: 'HSTS preload directive',
          passed: hasPreload,
          details: hasPreload ? 'preload is configured' : 'preload is missing',
        });
      }
    }
  } catch (error) {
    results.push({
      testName: 'HSTS Configuration Test',
      passed: false,
      details: `Error testing HSTS: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }

  return results;
}

/**
 * Test other security headers
 */
export function testOtherSecurityHeaders(): SecurityTestResult[] {
  const results: SecurityTestResult[] = [];

  try {
    const mockResponse = new Response();
    const headers = new Headers();
    const testResponse = railwaySecurityHeaders.applyHeaders({ headers } as any);

    const expectedHeaders = [
      { name: 'x-frame-options', expected: 'DENY' },
      { name: 'x-content-type-options', expected: 'nosniff' },
      { name: 'referrer-policy', expected: 'strict-origin-when-cross-origin' },
      { name: 'x-dns-prefetch-control', expected: 'off' },
      { name: 'x-download-options', expected: 'noopen' },
      { name: 'x-permitted-cross-domain-policies', expected: 'none' },
    ];

    for (const { name, expected } of expectedHeaders) {
      const actual = testResponse.headers.get(name);
      results.push({
        testName: `${name} header`,
        passed: actual === expected,
        details: actual === expected
          ? `${name} is correctly set to ${expected}`
          : `${name} is incorrect`,
        expected,
        actual: actual || 'null',
      });
    }

    // Test Permissions Policy
    const permissionsPolicy = testResponse.headers.get('permissions-policy');
    results.push({
      testName: 'Permissions Policy header',
      passed: !!permissionsPolicy,
      details: permissionsPolicy
        ? 'Permissions Policy is configured'
        : 'Permissions Policy is missing',
      actual: permissionsPolicy ? 'configured' : 'null',
    });
  } catch (error) {
    results.push({
      testName: 'Other Security Headers Test',
      passed: false,
      details: `Error testing headers: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }

  return results;
}

/**
 * Test API-specific security headers
 */
export function testAPISecurityHeaders(): SecurityTestResult[] {
  const results: SecurityTestResult[] = [];

  try {
    const mockResponse = new Response();
    const headers = new Headers();
    const testResponse = apiSecurityHeaders.applyAPIHeaders({ headers } as any);

    // Test API-specific headers
    const apiVersion = testResponse.headers.get('x-api-version');
    results.push({
      testName: 'API Version header',
      passed: !!apiVersion,
      details: apiVersion ? 'API version header is set' : 'API version header is missing',
      actual: apiVersion || 'null',
    });

    const cacheControl = testResponse.headers.get('cache-control');
    results.push({
      testName: 'API Cache Control',
      passed: !!cacheControl && cacheControl.includes('no-store'),
      details: cacheControl?.includes('no-store')
        ? 'Cache Control correctly prevents caching'
        : 'Cache Control may allow caching',
      actual: cacheControl || 'null',
    });

    // Test CORS headers
    const corsOrigin = testResponse.headers.get('access-control-allow-origin');
    results.push({
      testName: 'CORS Origin header',
      passed: !!corsOrigin,
      details: corsOrigin ? 'CORS origin is configured' : 'CORS origin is missing',
      actual: corsOrigin || 'null',
    });
  } catch (error) {
    results.push({
      testName: 'API Security Headers Test',
      passed: false,
      details: `Error testing API headers: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }

  return results;
}

/**
 * Test Railway-specific configuration
 */
export function testRailwayConfiguration(): SecurityTestResult[] {
  const results: SecurityTestResult[] = [];

  // Test Railway environment detection
  const isRailway = RailwayUtils.isRailway();
  const environment = RailwayUtils.getEnvironment();
  const serviceDomain = RailwayUtils.getServiceDomain();

  results.push({
    testName: 'Railway Environment Detection',
    passed: true, // This is informational
    details: isRailway
      ? `Running on Railway in ${environment} environment`
      : 'Not running on Railway',
  });

  if (isRailway) {
    results.push({
      testName: 'Railway Service Domain',
      passed: !!serviceDomain,
      details: serviceDomain
        ? `Service domain: ${serviceDomain}`
        : 'Service domain not configured',
      actual: serviceDomain || 'null',
    });

    // Test environment-specific security settings
    const isProduction = RailwayUtils.isProduction();
    const isStaging = RailwayUtils.isStaging();

    results.push({
      testName: 'Railway Environment Classification',
      passed: true,
      details: isProduction
        ? 'Production environment detected'
        : isStaging
          ? 'Staging environment detected'
          : 'Development environment detected',
    });
  }

  return results;
}

/**
 * Run comprehensive security headers test suite
 */
export function runSecurityTestSuite(): SecurityTestSuite {
  const environment = process.env.NODE_ENV || 'development';
  const allResults: SecurityTestResult[] = [];

  // Run all test categories
  allResults.push(...testCSPConfiguration());
  allResults.push(...testHSTSConfiguration());
  allResults.push(...testOtherSecurityHeaders());
  allResults.push(...testAPISecurityHeaders());
  allResults.push(...testRailwayConfiguration());

  const total = allResults.length;
  const passed = allResults.filter(r => r.passed).length;
  const failed = total - passed;

  return {
    suiteName: 'CFI Handbook Security Headers Test Suite',
    environment,
    results: allResults,
    overallPass: failed === 0,
    summary: {
      total,
      passed,
      failed,
    },
  };
}

/**
 * Format test results for console output
 */
export function formatTestResults(suite: SecurityTestSuite): string {
  const lines: string[] = [];

  lines.push(`\n=== ${suite.suiteName} ===`);
  lines.push(`Environment: ${suite.environment}`);
  lines.push(`Overall Result: ${suite.overallPass ? '✅ PASS' : '❌ FAIL'}`);
  lines.push(`Summary: ${suite.summary.passed}/${suite.summary.total} tests passed\n`);

  for (const result of suite.results) {
    const status = result.passed ? '✅' : '❌';
    lines.push(`${status} ${result.testName}`);
    lines.push(`   ${result.details}`);

    if (result.expected && result.actual) {
      lines.push(`   Expected: ${result.expected}`);
      lines.push(`   Actual: ${result.actual}`);
    }

    lines.push('');
  }

  return lines.join('\n');
}
