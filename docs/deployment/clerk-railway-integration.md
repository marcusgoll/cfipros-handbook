# Clerk Authentication - Railway Integration Guide

This guide ensures Clerk authentication works seamlessly in Railway production environment.

## 🔐 Authentication Configuration

### 1. Clerk Dashboard Configuration

#### Domain Setup

1. **Navigate to Clerk Dashboard** → Your Application → Domains
2. **Add production domain**:
   - Primary: Your Railway static URL (e.g., `https://your-app.railway.app`)
   - Custom domain (if configured): `https://cfipros.com`

3. **Configure allowed origins**:

   ```
   https://your-app.railway.app
   https://cfipros.com
   https://www.cfipros.com
   ```

#### JWT Template Configuration

1. Go to **JWT Templates** in Clerk dashboard
2. Create/edit template for Railway production:

   ```json
   {
     "aud": "{{ app.id }}",
     "exp": "{{ user.session_claims.exp }}",
     "iat": "{{ user.session_claims.iat }}",
     "iss": "{{ app.issuer }}",
     "nbf": "{{ user.session_claims.nbf }}",
     "sub": "{{ user.id }}",
     "railway_deployment_id": "{{ env.RAILWAY_DEPLOYMENT_ID }}",
     "railway_environment": "{{ env.RAILWAY_ENVIRONMENT }}"
   }
   ```

### 2. Railway Environment Variables

#### Required Clerk Variables

```bash
# Clerk Public Key (can be seen in Railway dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_key_here

# Clerk Secret Key (SENSITIVE - hide in Railway dashboard)
CLERK_SECRET_KEY=sk_live_your_secret_key_here
```

#### Clerk Configuration Variables

```bash
# Primary application URL
NEXT_PUBLIC_APP_URL=${{RAILWAY_STATIC_URL}}

# Clerk webhook endpoint for user events
CLERK_WEBHOOK_ENDPOINT=${{RAILWAY_STATIC_URL}}/api/webhooks/clerk

# Additional domains for multi-domain setup
CLERK_ALLOWED_ORIGINS=https://*.railway.app,https://cfipros.com,https://www.cfipros.com
```

### 3. Middleware Configuration

Create or update middleware for Railway:

```typescript
// src/middleware.ts
import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    '/',
    '/handbook',
    '/resources',
    '/api/health',
    '/api/health/ready',
    '/api/health/live',
    '/api/webhooks/clerk'
  ],

  // Routes that require authentication
  protectedRoutes: [
    '/dashboard',
    '/dashboard/(.*)',
    '/api/user/(.*)',
    '/api/feedback/(.*)'
  ],

  // Railway-specific configuration
  beforeAuth: (req) => {
    // Add Railway context to headers for debugging
    if (process.env.RAILWAY_ENVIRONMENT) {
      const response = NextResponse.next();
      response.headers.set('x-railway-environment', process.env.RAILWAY_ENVIRONMENT);
      response.headers.set('x-railway-deployment-id', process.env.RAILWAY_DEPLOYMENT_ID || '');
      return response;
    }
  },

  // Handle auth errors in production
  afterAuth: (auth, req) => {
    // Log auth failures to Sentry in production
    if (!auth.userId && !auth.isPublicRoute) {
      if (process.env.NODE_ENV === 'production') {
        console.log('Authentication failed for protected route:', req.url);
      }
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
```

## 🚀 Railway Deployment Steps

### 1. Environment Variables Setup

In Railway dashboard → Variables:

```bash
# Required for authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Application configuration
NEXT_PUBLIC_APP_URL=${{RAILWAY_STATIC_URL}}
NODE_ENV=production

# Database
DATABASE_URL=${{Postgres.DATABASE_URL}}
DATABASE_SSL=true
```

### 2. Domain Configuration (Optional)

If using custom domain:

1. **Railway Dashboard** → Settings → Domains
2. Add custom domain: `cfipros.com`
3. Configure DNS records as instructed by Railway
4. Update environment variables:

   ```bash
   NEXT_PUBLIC_APP_URL=https://cfipros.com
   ```

### 3. Clerk Webhook Configuration

Set up webhooks for user management:

1. **Clerk Dashboard** → Webhooks → Add Endpoint
2. **Endpoint URL**: `https://your-app.railway.app/api/webhooks/clerk`
3. **Events to listen for**:
   - `user.created`
   - `user.updated`
   - `user.deleted`
   - `session.created`
   - `session.ended`

4. Add webhook secret to Railway:

   ```bash
   CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

## 🔧 Development vs Production Configuration

### Development (.env.local)

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production (Railway Variables)

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...  # HIDDEN
NEXT_PUBLIC_APP_URL=${{RAILWAY_STATIC_URL}}
```

## 🧪 Testing Authentication Flow

### 1. Local Testing

```bash
# Test sign-in flow
curl -X GET http://localhost:3000/api/auth/me

# Test protected route
curl -X GET http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer your_session_token"
```

### 2. Production Testing

```bash
# Test Railway deployment
curl -X GET https://your-app.railway.app/api/health/ready

# Test authentication endpoints
curl -X GET https://your-app.railway.app/dashboard
# Should redirect to Clerk sign-in
```

### 3. Automated Testing Script

Create test script:

```javascript
// scripts/test-auth-flow.js
const https = require('node:https');

async function testAuthFlow() {
  const baseUrl = process.env.RAILWAY_STATIC_URL || 'https://your-app.railway.app';

  console.log('Testing authentication flow...');

  // Test 1: Public route should work
  const publicResponse = await fetch(`${baseUrl}/handbook`);
  console.log('Public route status:', publicResponse.status);

  // Test 2: Protected route should redirect
  const protectedResponse = await fetch(`${baseUrl}/dashboard`, {
    redirect: 'manual'
  });
  console.log('Protected route status:', protectedResponse.status);
  console.log('Should redirect to Clerk:', protectedResponse.headers.get('location'));

  // Test 3: Health check should include auth status
  const healthResponse = await fetch(`${baseUrl}/api/health`);
  const health = await healthResponse.json();
  console.log('Health check status:', health.status);

  console.log('✅ Authentication flow test completed');
}

testAuthFlow().catch(console.error);
```

## 🛠 Troubleshooting

### Common Issues

#### 1. "Invalid JWT" Errors

**Cause**: Mismatch between development and production keys
**Solution**:

- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` matches environment
- Ensure `CLERK_SECRET_KEY` is for correct environment (test vs live)

#### 2. CORS Errors

**Cause**: Domain not configured in Clerk dashboard
**Solution**:

- Add Railway URL to Clerk allowed origins
- Update middleware configuration

#### 3. Infinite Redirect Loops

**Cause**: Middleware configuration issues
**Solution**:

- Check `publicRoutes` and `protectedRoutes` arrays
- Verify API routes are excluded from auth middleware

#### 4. Webhook Delivery Failures

**Cause**: Incorrect webhook URL or network issues
**Solution**:

- Verify webhook URL in Clerk dashboard
- Check Railway logs for webhook processing errors
- Test webhook endpoint manually

### Debug Commands

```bash
# Check Railway environment variables
railway run env | grep CLERK

# Test health endpoint
curl https://your-app.railway.app/api/health/ready

# Check Railway logs
railway logs

# Test authentication API
curl -X GET https://your-app.railway.app/api/auth/session-check
```

### Logging and Monitoring

Add to your authentication pages:

```typescript
// Log authentication events
import * as Sentry from '@sentry/nextjs';

// Track sign-in attempts
Sentry.addBreadcrumb({
  category: 'auth',
  message: 'User sign-in attempt',
  level: 'info',
  data: {
    railway_environment: process.env.RAILWAY_ENVIRONMENT,
    deployment_id: process.env.RAILWAY_DEPLOYMENT_ID
  }
});

// Track authentication errors
Sentry.captureException(authError, {
  tags: {
    feature: 'authentication',
    environment: process.env.RAILWAY_ENVIRONMENT
  }
});
```

## 📋 Production Checklist

Before deploying to Railway:

- [ ] Clerk production keys configured in Railway variables
- [ ] Railway domain added to Clerk dashboard
- [ ] Public and protected routes configured in middleware
- [ ] Webhook endpoints configured and tested
- [ ] CORS settings verified
- [ ] JWT templates configured for Railway context
- [ ] Authentication flow tested in production
- [ ] Error monitoring configured with Sentry
- [ ] Health checks include authentication status
- [ ] Backup authentication method documented

## 🔗 Additional Resources

- [Clerk Next.js Documentation](https://clerk.com/docs/quickstarts/nextjs)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [Next.js Middleware Documentation](https://nextjs.org/docs/advanced-features/middleware)
- [Clerk Production Checklist](https://clerk.com/docs/deployments/overview)
