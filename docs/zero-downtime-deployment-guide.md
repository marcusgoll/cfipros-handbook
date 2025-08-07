# Zero-Downtime Deployment Guide for Railway

This comprehensive guide covers deploying the CFI Handbook application to Railway with zero-downtime capabilities, including blue-green deployments, automatic rollbacks, and health monitoring.

## 📋 Prerequisites

### Required Tools

- Railway CLI: `npm install -g @railway/cli`
- Node.js 20+
- Git repository access
- Sentry account (for monitoring)
- Clerk account (for authentication)

### Required Credentials

- Railway account with billing enabled
- Sentry DSN and authentication token
- Clerk publishable and secret keys
- PostHog API key (optional)

## 🚀 Initial Setup

### 1. Railway Project Creation

```bash
# Login to Railway
railway login

# Create new project from existing repository
railway new --from-repo https://github.com/your-username/cfi-handbook

# Or link existing directory
cd cfi-handbook
railway link
```

### 2. Database Setup

```bash
# Add PostgreSQL service
railway add postgresql

# Verify database is created
railway run --service postgresql psql
```

### 3. Environment Configuration

#### Set Public Variables

These are configured automatically via `railway.json`, but can be overridden:

```bash
railway variables set NODE_ENV=production
railway variables set NEXT_TELEMETRY_DISABLED=1
railway variables set DATABASE_SSL=true
railway variables set DATABASE_CONNECTION_POOL_SIZE=10
railway variables set DATABASE_CONNECTION_TIMEOUT=30000
railway variables set DATABASE_IDLE_TIMEOUT=600000
railway variables set HEALTH_CHECK_TIMEOUT=30000
railway variables set READINESS_CHECK_TIMEOUT=30000
railway variables set DEPLOYMENT_ENVIRONMENT=production
railway variables set ZERO_DOWNTIME_ENABLED=true
railway variables set ESLINT_NO_DEV_ERRORS=true
```

#### Set Secret Variables

Configure sensitive environment variables through Railway dashboard or CLI:

```bash
# Authentication (Clerk)
railway variables set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
railway variables set CLERK_SECRET_KEY=sk_live_...

# Monitoring (Sentry)
railway variables set SENTRY_DSN=https://...@...ingest.sentry.io/...
railway variables set SENTRY_ORGANIZATION=your-org-name
railway variables set SENTRY_PROJECT=cfi-handbook
railway variables set SENTRY_AUTH_TOKEN=sntrys_...

# Analytics (PostHog)
railway variables set NEXT_PUBLIC_POSTHOG_KEY=phc_...
railway variables set NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Rollback Configuration (Optional)
railway variables set SLACK_WEBHOOK_URL=https://hooks.slack.com/...
railway variables set ROLLBACK_FAILURE_THRESHOLD=3
railway variables set ROLLBACK_CHECK_INTERVAL=30000
railway variables set MONITORING_DURATION=600000
```

## 🔄 Deployment Process

### Standard Deployment

For regular deployments with zero-downtime features:

```bash
# Deploy to production
railway deploy

# Monitor deployment
railway logs --follow
```

### Blue-Green Deployment

For critical updates requiring extra safety:

```bash
# Run blue-green deployment script
npm run deploy:blue-green

# Or manually with Railway CLI
railway deploy --detach  # Creates preview deployment
# Test preview deployment
# Promote to production when ready
```

## 📊 Health Check Verification

### Manual Health Checks

```bash
# Quick health check
npm run health:check

# Or direct API call
curl https://your-app.railway.app/api/health
curl https://your-app.railway.app/api/ready
```

### Expected Health Check Response

```json
{
  "status": "healthy",
  "timestamp": "2025-01-30T12:00:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "database": {
      "status": "healthy",
      "latency": 45,
      "pool": {
        "maxConnections": 10,
        "totalConnections": 3,
        "activeConnections": 1,
        "idleConnections": 2,
        "utilization": 30
      }
    },
    "memory": {
      "status": "healthy",
      "usage": 128,
      "total": 512,
      "percentage": 25
    },
    "sentry": {
      "status": "healthy",
      "dsn": "configured"
    },
    "filesystem": {
      "status": "healthy",
      "writable": true
    }
  },
  "uptime": 3600,
  "responseTime": 89
}
```

## 🔧 Rollback Procedures

### Automatic Rollback

The system monitors health checks and automatically rolls back on failures:

```bash
# Start post-deployment monitoring (runs automatically)
npm run rollback:monitor

# Manual rollback trigger
npm run rollback:auto
```

### Manual Rollback

```bash
# List recent deployments
railway deployment list

# Rollback to specific deployment
railway deployment rollback <deployment-id>

# Verify rollback success
npm run health:check
```

## 📈 Monitoring and Alerting

### Sentry Integration

- **Error Tracking**: Automatic error capture and reporting
- **Performance Monitoring**: Transaction tracking for key operations
- **Deployment Tracking**: Release tracking with deployment events
- **Health Check Monitoring**: Continuous application health tracking

### Railway Monitoring

```bash
# View deployment logs
railway logs

# Monitor resource usage
railway status

# Check service health
railway ps
```

### Health Check Monitoring

```bash
# Start continuous monitoring
npm run rollback:monitor

# Check current health status
npm run health:check
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Failures

**Symptoms**: Health checks failing with database errors

**Solutions**:

```bash
# Check database service status
railway status --service postgresql

# Verify DATABASE_URL is set
railway variables

# Test direct database connection
railway run --service postgresql psql

# Check connection pool metrics
curl https://your-app.railway.app/api/health | jq '.checks.database.pool'
```

#### 2. Build Failures

**Symptoms**: Deployment fails during build phase

**Solutions**:

```bash
# Check build logs
railway logs --deployment <deployment-id>

# Verify environment variables
railway variables

# Test local build
npm run build:railway

# Check TypeScript errors
npm run check:types
```

#### 3. Health Check Timeouts

**Symptoms**: Deployment hangs on health checks

**Solutions**:

```bash
# Increase health check timeout
railway variables set HEALTH_CHECK_TIMEOUT=60000

# Check application startup logs
railway logs --tail 100

# Verify health check endpoint
curl -v https://your-app.railway.app/api/health
```

#### 4. Memory Issues

**Symptoms**: Application crashes or health checks fail with memory errors

**Solutions**:

```bash
# Check memory usage
curl https://your-app.railway.app/api/health | jq '.checks.memory'

# Increase memory allocation (Railway Pro plan)
# Or optimize application memory usage
```

### Emergency Procedures

#### Immediate Rollback

```bash
# Emergency rollback to last known good deployment
railway deployment list
railway deployment rollback <last-good-deployment-id>

# Verify rollback
npm run health:check
```

#### Service Recovery

```bash
# Restart service
railway restart

# Force redeploy
railway deploy --force

# Check service status
railway status
```

## 📝 Deployment Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Health check endpoints working locally
- [ ] Sentry integration configured
- [ ] Build process successful locally
- [ ] Tests passing

### During Deployment

- [ ] Monitor deployment logs
- [ ] Verify health checks pass
- [ ] Check database connectivity
- [ ] Confirm zero-downtime transition
- [ ] Monitor error rates in Sentry

### Post-Deployment

- [ ] Run comprehensive health checks
- [ ] Verify all features working
- [ ] Check performance metrics
- [ ] Monitor for 10+ minutes
- [ ] Update documentation if needed
- [ ] Notify team of successful deployment

## 🔍 Monitoring Dashboard

### Key Metrics to Monitor

1. **Health Check Status**: Should remain "healthy"
2. **Response Time**: Should be < 200ms for health checks
3. **Database Pool Utilization**: Should be < 80%
4. **Memory Usage**: Should be < 85%
5. **Error Rate**: Should be < 1%
6. **Deployment Frequency**: Track deployment success rate

### Alerts Configuration

Set up alerts for:

- Health check failures (3+ consecutive)
- High response times (> 5 seconds)
- High memory usage (> 90%)
- Database connection errors
- Deployment failures

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [PostgreSQL Connection Pooling](https://node-postgres.com/features/pooling)
- [Sentry Next.js Integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Clerk Authentication Setup](https://clerk.com/docs/nextjs/get-started-with-nextjs)

## 🆘 Support

If you encounter issues not covered in this guide:

1. Check Railway logs: `railway logs`
2. Review Sentry error reports
3. Run health checks: `npm run health:check`
4. Consult the troubleshooting section above
5. Contact the development team with logs and error details

---

**Remember**: Zero-downtime deployments require careful monitoring and testing. Always verify health checks before considering a deployment successful.
