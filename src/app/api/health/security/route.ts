import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withSecurityHeaders } from '@/lib/security/api-headers';
import { railwaySecurityHeaders, RailwayUtils, validateRailwaySecuritySetup } from '@/lib/security/railway-config';

type SecurityCheckResult = {
  timestamp: string;
  environment: string;
  railwayEnvironment: {
    isRailway: boolean;
    environmentName: string;
    serviceDomain: string | null;
  };
  securityHeaders: {
    present: string[];
    missing: string[];
    isValid: boolean;
  };
  cspValidation: {
    isEnabled: boolean;
    reportOnlyMode: boolean;
    directiveCount: number;
  };
  hstsStatus: {
    isEnabled: boolean;
    maxAge: string | null;
    includeSubDomains: boolean;
    preload: boolean;
  };
  railwayValidation: {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  };
  recommendations: string[];
};

async function validateSecurityHeaders(): Promise<SecurityCheckResult> {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const timestamp = new Date().toISOString();

  // Railway environment information
  const railwayInfo = {
    isRailway: RailwayUtils.isRailway(),
    environmentName: RailwayUtils.getEnvironment(),
    serviceDomain: RailwayUtils.getServiceDomain(),
  };

  // Validate Railway-specific security setup
  const railwayValidation = validateRailwaySecuritySetup();

  // Create a test response to check headers
  const testResponse = NextResponse.next();
  const responseWithHeaders = railwaySecurityHeaders.applyHeaders(testResponse);

  // Validate headers
  const headerValidation = railwaySecurityHeaders.validateHeaders(responseWithHeaders.headers);

  // Extract present headers
  const presentHeaders: string[] = [];
  const headerMap = new Map<string, string>();

  responseWithHeaders.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    presentHeaders.push(lowerKey);
    headerMap.set(lowerKey, value);
  });

  // CSP validation
  const cspHeader = headerMap.get('content-security-policy');
  const cspReportOnlyHeader = headerMap.get('content-security-policy-report-only');
  const hasCsp = !!(cspHeader || cspReportOnlyHeader);
  const isReportOnly = !!cspReportOnlyHeader && !cspHeader;
  const directiveCount = hasCsp
    ? (cspHeader || cspReportOnlyHeader || '').split(';').length
    : 0;

  // HSTS validation
  const hstsHeader = headerMap.get('strict-transport-security');
  const hstsEnabled = !!hstsHeader;
  const includeSubDomains = hstsHeader?.includes('includeSubDomains') ?? false;
  const preload = hstsHeader?.includes('preload') ?? false;
  const maxAgeMatch = hstsHeader?.match(/max-age=(\d+)/);
  const maxAge = maxAgeMatch ? maxAgeMatch[1] : null;

  // Generate recommendations
  const recommendations: string[] = [];

  if (isDevelopment) {
    recommendations.push('Running in development mode - HSTS is disabled');
    recommendations.push('Consider testing with report-only CSP in development');
  }

  if (!hstsEnabled && !isDevelopment) {
    recommendations.push('Enable HSTS for production deployment');
  }

  if (headerValidation.missing.length > 0) {
    recommendations.push(`Missing security headers: ${headerValidation.missing.join(', ')}`);
  }

  if (hasCsp && isReportOnly) {
    recommendations.push('CSP is in report-only mode - consider enforcing in production');
  }

  if (!hasCsp) {
    recommendations.push('Content Security Policy is not configured');
  }

  // Railway-specific recommendations
  if (railwayInfo.isRailway) {
    recommendations.push(`Running on Railway in ${railwayInfo.environmentName} environment`);
    if (railwayValidation.warnings.length > 0) {
      recommendations.push(...railwayValidation.warnings.map(w => `Railway warning: ${w}`));
    }
    if (railwayValidation.errors.length > 0) {
      recommendations.push(...railwayValidation.errors.map(e => `Railway error: ${e}`));
    }
  }

  return {
    timestamp,
    environment: isDevelopment ? 'development' : 'production',
    railwayEnvironment: railwayInfo,
    securityHeaders: {
      present: presentHeaders.filter(h => h.startsWith('x-')
        || h.includes('security')
        || h.includes('content-security-policy')
        || h.includes('strict-transport-security')
        || h.includes('referrer-policy')
        || h.includes('permissions-policy'),
      ),
      missing: headerValidation.missing,
      isValid: headerValidation.isValid,
    },
    cspValidation: {
      isEnabled: hasCsp,
      reportOnlyMode: isReportOnly,
      directiveCount,
    },
    hstsStatus: {
      isEnabled: hstsEnabled,
      maxAge,
      includeSubDomains,
      preload,
    },
    railwayValidation,
    recommendations,
  };
}

async function handleSecurityCheck(request: NextRequest): Promise<NextResponse> {
  try {
    const checkResult = await validateSecurityHeaders();

    // Determine overall health status
    const isHealthy = checkResult.securityHeaders.isValid
      && (checkResult.environment === 'development' || checkResult.hstsStatus.isEnabled);

    const statusCode = isHealthy ? 200 : 206; // 206 for partial content/warnings

    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'warning',
      message: isHealthy
        ? 'All security headers are properly configured'
        : 'Security headers configured with warnings',
      data: checkResult,
    }, { status: statusCode });
  } catch (error) {
    console.error('Security health check failed:', error);

    return NextResponse.json({
      status: 'error',
      message: 'Failed to validate security headers',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// Export the handlers with security headers applied
export const GET = withSecurityHeaders(handleSecurityCheck);
export const HEAD = withSecurityHeaders(handleSecurityCheck);
