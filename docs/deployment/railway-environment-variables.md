# Railway Environment Variables Configuration

This document provides a comprehensive guide for configuring environment variables for the CFI Handbook application deployment on Railway.

## 🔧 Required Environment Variables

### Authentication (Clerk)

```bash
# Required - Clerk public key for client-side authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_publishable_key_here

# Required - Clerk secret key for server-side operations
CLERK_SECRET_KEY=sk_live_your_secret_key_here
```

### Database Configuration

```bash
# Required - PostgreSQL connection string provided by Railway
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Required for production - Enable SSL connections
DATABASE_SSL=true

# Connection pool optimization
DATABASE_CONNECTION_POOL_SIZE=15
DATABASE_CONNECTION_TIMEOUT=30000
DATABASE_IDLE_TIMEOUT=600000
DATABASE_MAX_LIFETIME=3600000
```

### Sentry Monitoring (Production)

```bash
# Required for error tracking and performance monitoring
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@o4507.ingest.us.sentry.io/1234567

# Enable Sentry in production
NEXT_PUBLIC_SENTRY_DISABLED=false
SENTRY_ENVIRONMENT=production

# Optional - Sentry release tracking
NEXT_PUBLIC_SENTRY_RELEASE=${{RAILWAY_GIT_COMMIT_SHA}}

# Optional - Authentication token for Sentry releases
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

## 🔄 Automatic Railway Variables

These variables are automatically provided by Railway:

```bash
# Railway automatically sets these
PORT=${{PORT}}                           # Application port
RAILWAY_STATIC_URL=${{RAILWAY_STATIC_URL}}    # Application URL
RAILWAY_GIT_COMMIT_SHA=${{RAILWAY_GIT_COMMIT_SHA}}  # Git commit hash
RAILWAY_ENVIRONMENT=${{RAILWAY_ENVIRONMENT}}  # Environment name
```

## 🚀 Application Configuration

### Next.js and Node.js

```bash
# Environment mode
NODE_ENV=production

# Disable Next.js telemetry in production
NEXT_TELEMETRY_DISABLED=1

# Node.js optimization for Railway
NODE_OPTIONS=--max-old-space-size=2048 --optimize-for-size

# Build configuration
BUILD_TIMEOUT=1200
ESLINT_NO_DEV_ERRORS=true
```

### Application URLs

```bash
# Primary application URL (automatically set by Railway)
NEXT_PUBLIC_APP_URL=${{RAILWAY_STATIC_URL}}

# Additional allowed origins for CORS
ALLOWED_ORIGINS=https://cfipros.com,https://www.cfipros.com
```

## 📊 Optional Analytics & Monitoring

### PostHog Analytics

```bash
# Optional - PostHog project key
NEXT_PUBLIC_POSTHOG_KEY=phc_your_project_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### Better Stack Logging

```bash
# Optional - Better Stack source token for centralized logging
BETTER_STACK_SOURCE_TOKEN=your_better_stack_token
```

### Arcjet Security

```bash
# Optional - Arcjet API key for security monitoring
ARCJET_KEY=ajkey_your_secret_key_here
```

## 🔒 Security Configuration

### Application Security

```bash
# Deployment environment indicator
DEPLOYMENT_ENVIRONMENT=production
RAILWAY_ENVIRONMENT=production

# Health check configuration
HEALTH_CHECK_TIMEOUT=30000
READINESS_CHECK_TIMEOUT=30000

# Zero-downtime deployment
ZERO_DOWNTIME_ENABLED=true
GRACEFUL_SHUTDOWN_TIMEOUT=30000
```

### Logging and Monitoring

```bash
# Application logging level
LOG_LEVEL=info

# Railway service identification
RAILWAY_SERVICE_NAME=cfi-handbook
```

## 📋 Railway Dashboard Configuration Steps

### 1. Database Setup

1. Navigate to your Railway project dashboard
2. Add a PostgreSQL service
3. The `DATABASE_URL` will be automatically available as `${{Postgres.DATABASE_URL}}`

### 2. Environment Variables Setup

Navigate to your service → Variables tab and add:

**Required Variables:**

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`

**Database Variables (if not using Railway Postgres):**

- `DATABASE_URL`

**Optional Variables:**

- `NEXT_PUBLIC_POSTHOG_KEY`
- `ARCJET_KEY`
- `BETTER_STACK_SOURCE_TOKEN`

### 3. Domain Configuration

1. In Railway dashboard → Settings → Domains
2. Add your custom domain (e.g., `cfipros.com`)
3. Update `NEXT_PUBLIC_APP_URL` if using custom domain

## 🚀 Deployment Commands

### Railway CLI Configuration

```bash
# Login to Railway
railway login

# Link to project
railway link

# Set environment variables via CLI
railway variables set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
railway variables set CLERK_SECRET_KEY=sk_live_...
railway variables set NEXT_PUBLIC_SENTRY_DSN=https://...

# Deploy
railway up
```

### Environment-Specific Variables

```bash
# Production environment
railway environment use production
railway variables set NODE_ENV=production

# Staging environment (if applicable)
railway environment use staging
railway variables set NODE_ENV=staging
```

## 🔍 Validation Scripts

Use these commands to validate your environment setup:

```bash
# Check all required variables are set
npm run verify:deployment

# Test database connection
npm run health:check

# Validate Clerk authentication
npm run test:auth

# Test Sentry integration
npm run test:sentry
```

## 🚨 Security Best Practices

1. **Never commit sensitive variables** to git
2. **Use Railway's variable references** (`${{SERVICE.VARIABLE}}`) when possible
3. **Rotate secrets regularly**, especially in production
4. **Use different keys** for staging and production environments
5. **Enable Railway's** environment variable encryption
6. **Monitor variable access** through Railway audit logs

## 🛠 Troubleshooting

### Common Issues

**Database Connection Fails:**

- Verify `DATABASE_URL` is correctly set
- Check `DATABASE_SSL=true` for production
- Ensure PostgreSQL service is running

**Authentication Not Working:**

- Verify Clerk keys are correct
- Check domain configuration in Clerk dashboard
- Ensure `NEXT_PUBLIC_APP_URL` matches your domain

**Build Failures:**

- Check `NODE_OPTIONS` for memory limits
- Verify `BUILD_TIMEOUT` is sufficient
- Review build logs for specific errors

**Health Checks Failing:**

- Verify health check endpoints are accessible
- Check `HEALTH_CHECK_TIMEOUT` settings
- Review application startup logs

### Debug Commands

```bash
# Check environment variables
railway run env

# View logs
railway logs

# Check service status
railway status

# Test health endpoints locally
curl https://your-app.railway.app/api/health
curl https://your-app.railway.app/api/health/ready
```

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Clerk Authentication Setup](https://clerk.com/docs)
- [Sentry Next.js Integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
