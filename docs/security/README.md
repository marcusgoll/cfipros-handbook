# Security Headers Configuration

This document outlines the comprehensive security headers implementation for the CFI Handbook application, including Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), and other security measures.

## Overview

The CFI Handbook application implements a multi-layered security approach with:

- **Content Security Policy (CSP)** - Prevents XSS attacks and unauthorized resource loading
- **HTTP Strict Transport Security (HSTS)** - Enforces HTTPS connections
- **Frame Protection** - Prevents clickjacking attacks
- **Content Type Protection** - Prevents MIME type confusion attacks
- **Railway-Optimized Configuration** - Environment-specific security settings

## Architecture

### Security Headers Middleware

The security headers are implemented through a middleware system that applies headers to all requests:

```
src/lib/security/
├── headers.ts              # Core security headers implementation
├── api-headers.ts         # API-specific security headers
├── railway-config.ts      # Railway deployment configuration
└── test-headers.ts        # Testing utilities
```

### Key Components

1. **SecurityHeaders Class** (`headers.ts`)
   - Configurable security headers application
   - Environment-aware configuration
   - Header validation utilities

2. **Railway Configuration** (`railway-config.ts`)
   - Production/staging/development-specific settings
   - Railway platform optimizations
   - Environment detection utilities

3. **API Security** (`api-headers.ts`)
   - API-specific security headers
   - CORS configuration
   - Cache control for JSON responses

## Configuration

### Content Security Policy (CSP)

The CSP is configured with the following directives:

```typescript
const CSP_DIRECTIVES = {
  'default-src': ['\'self\''],
  'script-src': [
    '\'self\'',
    '\'unsafe-eval\'', // Required for Next.js
    '\'unsafe-inline\'', // Required for Next.js
    'https://clerk.cfipros.com',
    'https://*.clerk.accounts.dev',
    'https://js.sentry-io',
    'https://us.i.posthog.com',
    // ... other trusted sources
  ],
  'style-src': [
    '\'self\'',
    '\'unsafe-inline\'', // Required for CSS-in-JS
    'https://fonts.googleapis.com',
  ],
  // ... other directives
};
```

### Environment-Specific Settings

#### Production

- **HSTS**: Enabled with 1-year max-age, includeSubDomains, and preload
- **CSP**: Enforcing mode
- **Frame Options**: DENY
- **Content Type Options**: nosniff

#### Staging

- **HSTS**: Disabled
- **CSP**: Report-only mode
- **Other headers**: Enabled for testing

#### Development

- **HSTS**: Disabled
- **CSP**: Report-only mode with localhost exceptions
- **All headers**: Enabled but permissive

## Implementation

### Middleware Integration

The security headers are integrated into the existing Next.js middleware:

```typescript
// src/middleware.ts
import { railwaySecurityHeaders } from '@/lib/security/railway-config';

export default async function middleware(request: NextRequest) {
  // ... existing middleware logic

  // Apply security headers to all responses
  return railwaySecurityHeaders.applyHeaders(response);
}
```

### API Route Protection

API routes use specialized security headers:

```typescript
// Example API route
import { withSecurityHeaders } from '@/lib/security/api-headers';

export const GET = withSecurityHeaders(async (request) => {
  // API logic here
  return NextResponse.json({ data: 'response' });
});
```

## Third-Party Integrations

### Clerk Authentication

CSP configuration includes Clerk domains:

- `clerk.cfipros.com`
- `*.clerk.accounts.dev`
- `api.clerk.com`

### Sentry Monitoring

CSP allows Sentry for error tracking:

- `js.sentry-io`
- `browser.sentry-io`
- `o4506965584756736.ingest.us.sentry.io`

### PostHog Analytics

CSP includes PostHog domains:

- `us.i.posthog.com`
- `app.posthog.com`

## Testing

### Automated Testing

Run security header tests:

```bash
# Test development environment
npm run test:security

# Test production configuration
npm run test:security:prod
```

### Health Check Endpoint

Monitor security headers via health check:

```bash
curl https://your-domain.com/api/health/security
```

Response includes:

- Security headers validation
- CSP configuration status
- HSTS status
- Railway-specific validation
- Recommendations for improvements

### Manual Testing

Use browser developer tools or online tools:

1. **securityheaders.com** - Comprehensive security headers analysis
2. **CSP Evaluator** - Content Security Policy validation
3. **Browser DevTools** - Check headers in Network tab

## Deployment

### Railway Platform

The configuration automatically detects Railway environment:

```typescript
// Automatic Railway detection
const isRailway = !!process.env.RAILWAY_ENVIRONMENT;
const environment = process.env.RAILWAY_ENVIRONMENT_NAME;
```

#### Environment Variables

Required for Railway deployment:

```bash
# Railway automatically provides these
RAILWAY_ENVIRONMENT=true
RAILWAY_ENVIRONMENT_NAME=production|staging
RAILWAY_STATIC_URL=your-domain.railway.app
RAILWAY_PUBLIC_DOMAIN=your-custom-domain.com

# Application-specific
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
SENTRY_DSN=https://...
```

### Vercel Deployment

For Vercel deployments, ensure these headers in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

## Monitoring and Maintenance

### Health Monitoring

The security health endpoint provides continuous monitoring:

- **Endpoint**: `/api/health/security`
- **Frequency**: Monitor every 5 minutes
- **Alerting**: Set up alerts for status !== 'healthy'

### Regular Maintenance

1. **Monthly**: Review CSP violation reports
2. **Quarterly**: Update CSP directives for new integrations
3. **Bi-annually**: Review and update security headers
4. **Annually**: Security audit and penetration testing

### CSP Reporting

Configure CSP reporting for violation monitoring:

```typescript
// Add to CSP directives
'report-uri': ['/api/csp-report'],
'report-to': ['csp-endpoint'],
```

## Troubleshooting

### Common Issues

#### CSP Violations

- Check browser console for CSP violations
- Use report-only mode to test new directives
- Gradually tighten CSP based on violations

#### HSTS Issues

- HSTS is only applied in production
- Preload list inclusion requires manual submission
- Clear HSTS cache during development: `chrome://net-internals/#hsts`

#### Railway Deployment Issues

- Verify environment variables are set
- Check Railway logs for security header application
- Test with Railway preview URLs before production

### Debug Mode

Enable debug logging:

```bash
DEBUG=security:* npm run dev
```

## Security Considerations

### Content Security Policy

- **Avoid 'unsafe-inline'** where possible (required for Next.js CSS-in-JS)
- **Avoid 'unsafe-eval'** where possible (required for Next.js development)
- **Use nonces** for inline scripts when possible
- **Regularly audit** allowed domains

### HTTP Strict Transport Security

- **Include subdomains** in production
- **Submit to preload list** for maximum security
- **Test thoroughly** before enabling preload

### API Security

- **No CSP needed** for JSON APIs
- **Implement CORS** properly
- **Cache control** prevents sensitive data caching
- **Rate limiting** via Arcjet integration

## References

- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [Mozilla Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)
- [CSP Quick Reference](https://content-security-policy.com/)
- [HSTS Preload List](https://hstspreload.org/)
- [Railway Deployment Guide](https://docs.railway.app/)
