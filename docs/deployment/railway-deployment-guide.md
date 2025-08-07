# Railway Deployment Guide - CFI Handbook

Complete guide for deploying the CFI Handbook application to Railway with zero-downtime deployment configuration.

## 🚀 Pre-Deployment Checklist

### 1. Prerequisites

- [ ] Railway account created and CLI installed
- [ ] GitHub repository connected to Railway
- [ ] Domain configured (optional but recommended)
- [ ] All environment variables documented
- [ ] Database backup created (if migrating existing data)

### 2. Required Services

- [ ] **Main Application**: Next.js application service
- [ ] **PostgreSQL Database**: Railway PostgreSQL service
- [ ] **Custom Domain** (optional): CNAME record configured

## 📋 Step-by-Step Deployment Process

### Step 1: Project Setup in Railway

1. **Create New Project**

   ```bash
   # Login to Railway CLI
   railway login

   # Create new project
   railway init

   # Connect to existing project (if already created)
   railway link
   ```

2. **Add PostgreSQL Service**
   - In Railway dashboard → Add Service → Database → PostgreSQL
   - Wait for deployment to complete
   - Note the `DATABASE_URL` will be automatically available as `${{Postgres.DATABASE_URL}}`

### Step 2: Environment Variables Configuration

Set up all required environment variables in Railway dashboard:

#### Required Variables

```bash
# Authentication (Clerk) - SENSITIVE
CLERK_SECRET_KEY=sk_live_your_secret_key_here
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_publishable_key_here

# Database (automatically provided by Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Monitoring (Sentry)
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Application URL (automatically set by Railway)
NEXT_PUBLIC_APP_URL=${{RAILWAY_STATIC_URL}}
```

#### Optional but Recommended

```bash
# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Security
ARCJET_KEY=ajkey_your_key_here

# Logging
BETTER_STACK_SOURCE_TOKEN=your_token_here
```

### Step 3: Configuration Files Verification

Ensure these files are properly configured:

1. **railway.json** - Production deployment configuration
2. **railway.toml** - Alternative TOML configuration
3. **.env.example** - Environment variables template
4. **package.json** - Build and start scripts configured

### Step 4: Database Migration Setup

1. **Database Migration Script**

   ```bash
   # The migration will run automatically during build
   npm run db:migrate:prod
   ```

2. **Verify Migration Scripts**
   - Check `migrations/` directory for SQL files
   - Ensure migration scripts are idempotent
   - Test migrations locally first

### Step 5: Deploy to Railway

1. **Initial Deployment**

   ```bash
   # Deploy from local directory
   railway up

   # Or deploy from GitHub (recommended)
   # Connect GitHub repository in Railway dashboard
   # Push to main branch to trigger deployment
   ```

2. **Monitor Deployment**

   ```bash
   # Watch deployment logs
   railway logs -f

   # Check service status
   railway status
   ```

### Step 6: Post-Deployment Verification

Run comprehensive deployment tests:

```bash
# Local testing script
npm run test:railway

# Or test directly with curl
curl https://your-app.railway.app/api/health
curl https://your-app.railway.app/api/health/ready
curl https://your-app.railway.app/api/health/live
```

### Step 7: Domain Configuration (Optional)

1. **Add Custom Domain in Railway**
   - Dashboard → Settings → Domains
   - Add domain: `cfipros.com`
   - Configure DNS records as instructed

2. **Update Environment Variables**

   ```bash
   NEXT_PUBLIC_APP_URL=https://cfipros.com
   ```

3. **Update Clerk Configuration**
   - Add new domain to Clerk dashboard
   - Update allowed origins

## 🔧 Configuration Details

### Railway Configuration Files

#### railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "nixpacks",
    "buildCommand": "npm run build:railway",
    "buildTimeout": 1200
  },
  "deploy": {
    "startCommand": "npm run start:railway",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 60,
    "readinessProbe": {
      "path": "/api/health/ready",
      "timeout": 30,
      "interval": 10
    },
    "livenessProbe": {
      "path": "/api/health/live",
      "timeout": 30,
      "interval": 60
    }
  },
  "resources": {
    "memory": "2Gi",
    "cpu": "1000m",
    "disk": "10Gi"
  }
}
```

### Health Check Endpoints

The application includes comprehensive health checks:

- **`/api/health`** - Main health check with database, memory, and system checks
- **`/api/health/ready`** - Readiness probe for Railway deployment
- **`/api/health/live`** - Liveness probe for container health

### Zero-Downtime Deployment

Railway configuration enables zero-downtime deployments through:

1. **Rolling Updates**: New version starts before old version stops
2. **Health Checks**: Traffic only routes to healthy instances
3. **Graceful Shutdown**: 30-second grace period for completing requests
4. **Database Connection Pooling**: Maintains connections during deployments

## 🛡️ Security Configuration

### SSL/TLS Configuration

- Railway automatically provides SSL certificates
- HTTPS is enforced for production domains
- Security headers configured in application

### Environment Variable Security

- Sensitive variables marked as hidden in Railway dashboard
- No secrets committed to git repository
- Environment-specific configurations separated

### Database Security

- PostgreSQL SSL connections enforced
- Connection pooling with proper timeouts
- Database credentials managed by Railway

## 📊 Monitoring and Observability

### Health Monitoring

- **Health checks**: Automated monitoring of application health
- **Uptime monitoring**: Railway provides uptime statistics
- **Resource monitoring**: CPU and memory usage tracking

### Error Tracking

- **Sentry integration**: Real-time error tracking and performance monitoring
- **Railway logs**: Structured logging with log aggregation
- **Custom metrics**: Application-specific metrics and alerts

### Performance Monitoring

- **Response time tracking**: API and page load time monitoring
- **Database performance**: Query performance and connection pool metrics
- **Resource utilization**: Memory and CPU usage tracking

## 🔄 Deployment Workflow

### Development to Production Flow

1. **Local Development**

   ```bash
   npm run dev          # Local development server
   npm run test        # Run unit tests
   npm run test:e2e    # Run E2E tests
   ```

2. **Staging Deployment** (optional)
   - Create staging environment in Railway
   - Deploy feature branches for testing
   - Run full test suite against staging

3. **Production Deployment**

   ```bash
   git push origin main    # Triggers automatic deployment
   npm run test:railway   # Verify deployment
   npm run verify:deployment  # Comprehensive verification
   ```

### Rollback Procedures

1. **Automatic Rollback**

   ```bash
   npm run rollback:auto    # Automated rollback on health check failures
   ```

2. **Manual Rollback**
   - Railway dashboard → Deployments → Rollback to previous version
   - Or redeploy previous git commit

3. **Database Rollback**
   - Restore from database backup
   - Run reverse migration scripts if available

## 🧪 Testing Strategy

### Pre-Deployment Testing

```bash
# Comprehensive test suite
npm run test           # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:coverage # Test coverage report
npm run test:validate # Configuration validation
```

### Post-Deployment Testing

```bash
# Deployment verification
npm run test:railway        # Railway-specific tests
npm run verify:deployment   # Full deployment verification
npm run health:check       # Health check validation
```

### Monitoring Tests

```bash
# Continuous monitoring
npm run rollback:monitor   # Monitor deployment health
railway logs -f           # Monitor application logs
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Failures

**Symptoms**: Deployment fails during build phase
**Solutions**:

- Check build logs: `railway logs --deployment <deployment-id>`
- Verify Node.js version compatibility
- Ensure all dependencies installed correctly

#### 2. Health Check Failures

**Symptoms**: Application deploys but health checks fail
**Solutions**:

- Check health endpoint: `curl https://your-app.railway.app/api/health`
- Verify database connectivity
- Check environment variables configuration

#### 3. Database Connection Issues

**Symptoms**: Application can't connect to PostgreSQL
**Solutions**:

- Verify `DATABASE_URL` environment variable
- Check database service is running
- Verify SSL configuration for production

#### 4. Authentication Problems

**Symptoms**: Clerk authentication not working
**Solutions**:

- Verify Clerk keys are for correct environment
- Check domain configuration in Clerk dashboard
- Ensure CORS settings are correct

### Debug Commands

```bash
# Check environment variables
railway run env

# View recent logs
railway logs

# Check service status
railway status

# Test specific endpoints
curl -I https://your-app.railway.app/api/health
curl -I https://your-app.railway.app/api/health/ready
curl -I https://your-app.railway.app/api/health/live

# Test authentication flow
curl -I https://your-app.railway.app/dashboard
```

### Performance Issues

#### Slow Response Times

1. Check database query performance
2. Review resource allocation (CPU/Memory)
3. Analyze application logs for bottlenecks
4. Consider CDN for static assets

#### High Memory Usage

1. Monitor memory usage in Railway dashboard
2. Check for memory leaks in application code
3. Optimize database connection pooling
4. Consider increasing memory allocation

## 📝 Maintenance

### Regular Maintenance Tasks

1. **Weekly**
   - Review application logs for errors
   - Check resource utilization
   - Monitor response times

2. **Monthly**
   - Update dependencies
   - Review and rotate secrets
   - Database maintenance and optimization
   - Performance review and optimization

3. **Quarterly**
   - Security audit
   - Disaster recovery testing
   - Documentation updates
   - Performance benchmarking

### Backup Strategy

1. **Database Backups**
   - Railway provides automatic backups
   - Additional manual backups before major deployments
   - Test restore procedures quarterly

2. **Configuration Backups**
   - Environment variables documented and backed up
   - Railway configuration files in version control
   - Deployment scripts maintained in repository

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Railway Environment Variables](./railway-environment-variables.md)
- [Clerk Railway Integration](./clerk-railway-integration.md)
- [Zero-Downtime Deployment Best Practices](https://docs.railway.app/guides/deployments)

## 📞 Support and Escalation

### Internal Support

- Check application logs first
- Review this documentation
- Test locally to isolate issues

### External Support

- **Railway Support**: Railway dashboard → Help
- **Clerk Support**: Clerk dashboard → Support
- **Sentry Support**: Sentry dashboard → Support

### Emergency Procedures

1. **Application Down**: Immediate rollback to previous version
2. **Database Issues**: Switch to read-only mode, restore from backup
3. **Security Incident**: Rotate all secrets, investigate logs, patch vulnerabilities
