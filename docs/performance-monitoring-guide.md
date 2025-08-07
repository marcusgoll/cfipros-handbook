# CFI Handbook - Performance Monitoring Setup Guide

## Overview

This document provides comprehensive instructions for setting up, configuring, and maintaining the performance monitoring system for the CFI Handbook application deployed on Railway.

## Architecture

The monitoring system consists of several interconnected components:

- **Sentry Integration**: Error tracking, performance monitoring, and alerting
- **Core Web Vitals Tracking**: Real user performance metrics
- **API Performance Monitoring**: Endpoint response times and error rates
- **Database Performance Monitoring**: Query performance and connection health
- **Real User Monitoring (RUM)**: User behavior and session analytics
- **Railway Integration**: Platform-specific metrics and health checks
- **Intelligent Alerting System**: Configurable alerts with escalation
- **Performance Dashboard**: Real-time monitoring interface

## Prerequisites

### Required Environment Variables

Add these to your Railway project environment:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# Performance Monitoring
NEXT_PUBLIC_SENTRY_DISABLED=false
SENTRY_ENVIRONMENT=production
SENTRY_DEBUG=false

# Railway Monitoring
RAILWAY_ENVIRONMENT=production
RAILWAY_SERVICE_NAME=cfi-handbook
HEALTH_CHECK_TIMEOUT=30000
HEALTH_CHECK_INTERVAL=30000
GRACEFUL_SHUTDOWN_TIMEOUT=30000

# Database Performance
DATABASE_SSL=true
DATABASE_CONNECTION_POOL_SIZE=15
DATABASE_CONNECTION_TIMEOUT=30000
DATABASE_IDLE_TIMEOUT=600000
DATABASE_MAX_LIFETIME=3600000

# Alerting Configuration
SLACK_WEBHOOK_URL=your_slack_webhook_url (optional)
WEBHOOK_ALERT_URL=your_webhook_url (optional)
```

### Required Dependencies

The monitoring system uses these packages (already included in package.json):

```json
{
  "@sentry/nextjs": "^9.38.0",
  "@sentry/profiling-node": "latest"
}
```

## Installation & Setup

### 1. Sentry Project Setup

1. Create a new Sentry project at https://sentry.io
2. Choose "Next.js" as your platform
3. Copy the DSN and add it to your environment variables
4. Configure performance monitoring in your Sentry project settings:
   - Enable Performance Monitoring
   - Set transaction sample rate to 0.1 (10%) for production
   - Enable Profiling
   - Configure alerts for performance issues

### 2. Initialize Monitoring System

The monitoring system auto-initializes when the application starts. No manual setup required.

```typescript
// The monitoring system is automatically initialized in
// src/lib/monitoring/index.ts
```

### 3. Configure Railway Health Checks

Update your `railway.json` to include health check configuration:

```json
{
  "deploy": {
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 60,
    "healthcheckInterval": 30,
    "readinessProbe": {
      "path": "/api/health/ready",
      "timeout": 30,
      "interval": 10,
      "failureThreshold": 3
    },
    "livenessProbe": {
      "path": "/api/health/live",
      "timeout": 30,
      "interval": 60,
      "failureThreshold": 5
    }
  }
}
```

### 4. Health Check Endpoints

Create the following API endpoints for health monitoring:

**`/api/health/route.ts`**:
```typescript
import { NextResponse } from 'next/server';
import { railwayMonitor } from '@/lib/monitoring';

export async function GET() {
  const health = railwayMonitor.getHealthStatus();
  const status = health?.status === 'healthy' ? 200 : 503;

  return NextResponse.json({
    status: health?.status || 'unknown',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: true, // Add actual DB health check
    external_apis: true, // Add external service checks
  }, { status });
}
```

## Configuration

### Performance Thresholds

The system includes predefined performance thresholds that can be customized:

```typescript
// Core Web Vitals Thresholds
const PERFORMANCE_THRESHOLDS = {
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FID: { good: 100, needsImprovement: 300 },
  LCP: { good: 2500, needsImprovement: 4000 },
  TTFB: { good: 800, needsImprovement: 1800 },
};

// API Performance Thresholds
const API_THRESHOLDS = {
  responseTime: { good: 200, poor: 1000, critical: 2000 },
  errorRate: { good: 0.5, poor: 2.0, critical: 5.0 },
};

// Database Thresholds
const DB_THRESHOLDS = {
  queryTime: { good: 50, slow: 300, critical: 1000 },
  connectionPool: { warning: 80, critical: 95 },
};
```

### Alert Rules

Default alert rules are configured for common performance issues:

1. **Slow API Response Times**: > 1000ms average for 5 minutes
2. **High Error Rate**: > 5% error rate for 3 minutes
3. **Slow Database Queries**: > 500ms P95 for 5 minutes
4. **Poor Core Web Vitals**: LCP > 4000ms for 10 minutes
5. **Failed Health Checks**: Any health check failure

### Custom Metrics

Add custom metrics for handbook-specific features:

```typescript
// Track lesson loading performance
measureLessonLoad('lesson-123', async () => {
  return await loadLessonContent('lesson-123');
});

// Track search performance
measureSearch('flight instruments', async () => {
  return await searchHandbook('flight instruments');
});

// Track user progress saving
measureProgressSave('user-456', async () => {
  return await saveUserProgress('user-456', progressData);
});
```

## Monitoring Dashboard

### Access the Dashboard

The performance dashboard is available at `/monitoring` (requires authentication):

```typescript
// Add route in src/app/(auth)/monitoring/page.tsx
import PerformanceDashboard from '@/components/monitoring/PerformanceDashboard';

export default function MonitoringPage() {
  return <PerformanceDashboard />;
}
```

### Dashboard Features

- **System Health Overview**: Real-time status of all components
- **Core Web Vitals**: LCP, FID, CLS, TTFB metrics
- **API Performance**: Response times, error rates, throughput
- **Database Health**: Query performance, connection pool status
- **Railway Metrics**: CPU, memory, deployment health
- **Active Alerts**: Current performance issues
- **Historical Trends**: Performance over time

## API Endpoints

### Monitoring API

Access monitoring data programmatically:

```bash
# Get system overview
GET /api/monitoring?type=overview

# Get performance metrics
GET /api/monitoring?type=performance&timeRange=1h&detailed=true

# Get alerts
GET /api/monitoring?type=alerts

# Get Railway metrics
GET /api/monitoring?type=railway

# Generate full report
GET /api/monitoring?type=report
```

### Alert Management

```bash
# Acknowledge alert
POST /api/monitoring
{
  "action": "acknowledge_alert",
  "data": {
    "alertId": "alert-123",
    "userId": "user-456",
    "comment": "Investigating issue"
  }
}

# Resolve alert
POST /api/monitoring
{
  "action": "resolve_alert",
  "data": {
    "alertId": "alert-123",
    "userId": "user-456",
    "comment": "Fixed database connection issue"
  }
}
```

## Performance Budgets

### Lighthouse Budgets

Performance budgets are enforced in CI/CD:

```json
{
  "lighthouse": {
    "performance": 90,
    "accessibility": 95,
    "bestPractices": 90,
    "seo": 90
  },
  "webVitals": {
    "lcp": 2500,
    "fid": 100,
    "cls": 0.1,
    "ttfb": 800
  },
  "api": {
    "responseTime": 500,
    "errorRate": 1.0
  }
}
```

### Resource Budgets

```json
{
  "budgets": [
    {
      "resourceSizes": [
        { "resourceType": "script", "budget": 500 },
        { "resourceType": "image", "budget": 800 },
        { "resourceType": "stylesheet", "budget": 150 }
      ]
    }
  ]
}
```

## Automated Testing

### CI/CD Performance Tests

The GitHub Actions workflow runs performance tests on:
- Every push to main/master
- Every pull request
- Daily scheduled runs
- Manual triggers

### Test Types

1. **Lighthouse Audits**: Core Web Vitals and best practices
2. **Load Testing**: API performance under various loads
3. **API Performance**: Individual endpoint testing
4. **Production Monitoring**: Post-deployment verification

## Alerting

### Alert Channels

Configure multiple alert channels:

1. **Sentry**: Built-in error and performance alerts
2. **Slack**: Real-time notifications (optional)
3. **Webhooks**: Custom integrations (optional)
4. **Email**: Alert summaries (via Sentry)

### Alert Severity Levels

- **Critical**: Immediate attention required (SLA breach)
- **High**: Action needed within 1 hour
- **Medium**: Action needed within 4 hours
- **Low**: Action needed within 24 hours
- **Info**: Informational only

### Escalation Rules

Alerts automatically escalate if not acknowledged:

1. **Level 1**: Immediate notification via Sentry
2. **Level 2**: After 10 minutes, notify via Slack/webhook
3. **Level 3**: After 30 minutes, create GitHub issue

## Troubleshooting

### Common Issues

1. **High Memory Usage**
   - Check for memory leaks in monitoring components
   - Increase Railway memory allocation if needed
   - Review database connection pooling

2. **Slow Performance Monitoring**
   - Reduce sampling rates in production
   - Check Sentry quota usage
   - Optimize metric collection intervals

3. **Missing Metrics**
   - Verify environment variables are set
   - Check Sentry DSN configuration
   - Ensure monitoring system is initialized

### Debug Mode

Enable debug mode for troubleshooting:

```bash
SENTRY_DEBUG=true
LOG_LEVEL=debug
```

### Health Check Failures

Check these common causes:
- Database connection issues
- External API dependencies
- Memory/CPU resource limits
- Network connectivity problems

## Maintenance

### Regular Tasks

1. **Weekly**: Review performance trends and alerts
2. **Monthly**: Update performance budgets based on data
3. **Quarterly**: Review and optimize alert rules
4. **Annually**: Audit monitoring system configuration

### Performance Optimization

1. Monitor Sentry quota usage
2. Adjust sampling rates based on traffic
3. Clean up old metrics and alerts
4. Review and optimize database queries
5. Update performance thresholds as the app evolves

### Backup and Recovery

- Monitoring configuration is stored in code
- Sentry data is automatically backed up
- Alert history is retained for 90 days
- Performance reports are archived as GitHub artifacts

## Best Practices

### Development

1. Always test monitoring in development
2. Use meaningful custom event names
3. Include context in error reports
4. Monitor resource usage in dev environment

### Production

1. Set appropriate sampling rates
2. Monitor monitoring system performance
3. Regular alert rule reviews
4. Keep performance budgets updated

### Security

1. Never log sensitive user data
2. Sanitize database queries in logs
3. Use environment variables for secrets
4. Regular security audits of monitoring code

## Support

### Getting Help

1. Check Sentry documentation: https://docs.sentry.io/
2. Review GitHub Actions logs for CI/CD issues
3. Check Railway logs for deployment issues
4. Contact the development team for custom monitoring features

### Contributing

To contribute to the monitoring system:

1. Follow the established patterns in `/src/lib/monitoring/`
2. Add tests for new monitoring features
3. Update this documentation for new features
4. Test thoroughly in development before production deployment

## Appendix: Metric Definitions

### Core Web Vitals

- **LCP (Largest Contentful Paint)**: Time to render the largest content element
- **FID (First Input Delay)**: Time from first user interaction to browser response
- **CLS (Cumulative Layout Shift)**: Visual stability metric
- **TTFB (Time to First Byte)**: Server response time

### Custom Metrics

- **Lesson Load Time**: Time to fully load handbook lesson content
- **Search Response Time**: Time to return search results
- **Navigation Time**: Time to navigate between handbook sections
- **Progress Save Time**: Time to save user learning progress

### System Metrics

- **CPU Usage**: Railway container CPU utilization
- **Memory Usage**: Railway container memory utilization
- **Database Connections**: Active database connection count
- **Health Check Status**: Application health check results

---

*Last updated: January 2025*
*Version: 1.0.0*
