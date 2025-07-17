# Railway Deployment Architecture - Interactive Pilot Handbook

## Railway Platform Overview

Railway provides a modern deployment platform that simplifies infrastructure management while offering the scalability needed for the Interactive Pilot Handbook. Unlike Vercel's function-based approach, Railway supports long-running services, better database integration, and more flexible resource allocation.

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Railway Platform                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Web Service                               │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │   │
│  │  │   Next.js   │  │    API      │  │   Static    │         │   │
│  │  │   Server    │  │   Routes    │  │   Assets    │         │   │
│  │  │             │  │             │  │             │         │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                  Database Service                            │   │
│  │  ┌─────────────┐                    ┌─────────────┐         │   │
│  │  │ PostgreSQL  │                    │    Redis    │         │   │
│  │  │  Primary    │                    │   Cache     │         │   │
│  │  │             │                    │             │         │   │
│  │  └─────────────┘                    └─────────────┘         │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                  Worker Service                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │   │
│  │  │   Content   │  │   Email     │  │  Analytics  │         │   │
│  │  │ Processing  │  │   Queue     │  │  Processor  │         │   │
│  │  │             │  │             │  │             │         │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Service Configuration

### Main Web Service

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Railway Service Configuration

```toml
# railway.toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3

[[services]]
name = "web"
source = "."

[services.web.variables]
NODE_ENV = "production"
PORT = "3000"

# Database configuration
DATABASE_URL = "${{Postgres.DATABASE_URL}}"
REDIS_URL = "${{Redis.REDIS_URL}}"

# Authentication
NEXTAUTH_URL = "${{RAILWAY_PUBLIC_DOMAIN}}"
NEXTAUTH_SECRET = "${{NEXTAUTH_SECRET}}"

# Payment processing
STRIPE_PUBLISHABLE_KEY = "${{STRIPE_PUBLISHABLE_KEY}}"
STRIPE_SECRET_KEY = "${{STRIPE_SECRET_KEY}}"
STRIPE_WEBHOOK_SECRET = "${{STRIPE_WEBHOOK_SECRET}}"

# Media storage
CLOUDINARY_CLOUD_NAME = "${{CLOUDINARY_CLOUD_NAME}}"
CLOUDINARY_API_KEY = "${{CLOUDINARY_API_KEY}}"
CLOUDINARY_API_SECRET = "${{CLOUDINARY_API_SECRET}}"

# Content encryption
CONTENT_ENCRYPTION_KEY = "${{CONTENT_ENCRYPTION_KEY}}"

[[services]]
name = "postgres"
plugin = "postgresql"

[services.postgres.variables]
POSTGRES_DB = "pilot_handbook"
POSTGRES_USER = "handbook_user"

[[services]]
name = "redis"
plugin = "redis"

[[services]]
name = "worker"
source = "./workers"

[services.worker.variables]
DATABASE_URL = "${{Postgres.DATABASE_URL}}"
REDIS_URL = "${{Redis.REDIS_URL}}"
```

## Database Setup with Railway PostgreSQL

### Database Migration Strategy

```javascript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Railway-optimized indexes
  @@index([email])
  @@index([createdAt])
  
  purchases Purchase[]
  progress  Progress[]
  sessions  Session[]
}

model Purchase {
  id                String   @id @default(cuid())
  userId            String
  stripePaymentId   String   @unique
  moduleType        String   // "private_commercial" | "instrument" | "bundle"
  amount            Int      // Amount in cents
  currency          String   @default("usd")
  status            String   // "completed" | "pending" | "refunded"
  purchasedAt       DateTime @default(now())
  
  // Railway-optimized for frequent queries
  @@index([userId, status])
  @@index([stripePaymentId])
  @@index([purchasedAt])
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Progress {
  id         String   @id @default(cuid())
  userId     String
  lessonId   String
  completed  Boolean  @default(false)
  lastAccess DateTime @default(now())
  timeSpent  Int      @default(0) // in minutes
  
  // Composite index for user progress queries
  @@index([userId, completed])
  @@index([userId, lastAccess])
  @@unique([userId, lessonId])
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model ContentVersion {
  id          String   @id @default(cuid())
  moduleId    String
  version     String
  checksum    String
  releaseDate DateTime @default(now())
  changelog   String?
  isActive    Boolean  @default(false)
  
  @@index([moduleId, isActive])
  @@index([version])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  
  @@index([userId])
  @@index([sessionToken])
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Database Connection Optimization

```javascript
// lib/db.js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || 
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Railway-optimized connection pooling
export const config = {
  // Railway provides 20 connections by default
  connectionLimit: 15, // Reserve 5 for Railway operations
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  maxUses: 7500,
  allowExitOnIdle: true
};
```

## Redis Integration for Caching

```javascript
// lib/redis.js
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL, {
  // Railway-optimized Redis configuration
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  
  // Connection pool for Railway
  family: 4, // IPv4
  connectTimeout: 10000,
  commandTimeout: 5000
});

// Cache strategies
export const cacheStrategies = {
  // User session data - 1 hour
  session: { ttl: 3600, prefix: 'session:' },
  
  // User progress - 15 minutes (frequent updates)
  progress: { ttl: 900, prefix: 'progress:' },
  
  // Module content - 24 hours (updated daily)
  content: { ttl: 86400, prefix: 'content:' },
  
  // Purchase verification - 1 hour
  purchase: { ttl: 3600, prefix: 'purchase:' },
  
  // Search results - 6 hours
  search: { ttl: 21600, prefix: 'search:' }
};

export class CacheManager {
  async get(key, strategy = 'content') {
    const config = cacheStrategies[strategy];
    const fullKey = `${config.prefix}${key}`;
    
    try {
      const cached = await redis.get(fullKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  async set(key, value, strategy = 'content') {
    const config = cacheStrategies[strategy];
    const fullKey = `${config.prefix}${key}`;
    
    try {
      await redis.setex(fullKey, config.ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
}
```

## Background Worker Service

```javascript
// workers/content-processor.js
import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);
const prisma = new PrismaClient();

// Content processing worker
const contentWorker = new Worker('content-processing', async (job) => {
  const { type, data } = job.data;
  
  switch (type) {
    case 'process-module':
      return await processModule(data);
    case 'generate-offline-package':
      return await generateOfflinePackage(data);
    case 'update-search-index':
      return await updateSearchIndex(data);
    case 'sync-progress':
      return await syncUserProgress(data);
    default:
      throw new Error(`Unknown job type: ${type}`);
  }
}, {
  connection: redis,
  concurrency: 5, // Railway resource limits
  removeOnComplete: 100,
  removeOnFail: 50
});

async function processModule(moduleData) {
  // Process MDX content
  const processedContent = await processMarkdown(moduleData.content);
  
  // Generate component bundles
  const componentBundles = await generateComponentBundles(moduleData.components);
  
  // Optimize media assets
  const optimizedMedia = await optimizeMediaAssets(moduleData.media);
  
  // Update database
  await prisma.contentVersion.create({
    data: {
      moduleId: moduleData.id,
      version: moduleData.version,
      checksum: generateChecksum(processedContent),
      changelog: moduleData.changelog
    }
  });
  
  return {
    moduleId: moduleData.id,
    processed: true,
    size: calculateSize(processedContent),
    componentCount: componentBundles.length
  };
}

// Email worker
const emailWorker = new Worker('email-queue', async (job) => {
  const { type, data } = job.data;
  
  switch (type) {
    case 'welcome-email':
      return await sendWelcomeEmail(data);
    case 'purchase-confirmation':
      return await sendPurchaseConfirmation(data);
    case 'content-update-notification':
      return await sendContentUpdateNotification(data);
    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}, {
  connection: redis,
  concurrency: 3
});
```

## Monitoring & Health Checks

### Railway Health Check Endpoint

```javascript
// pages/api/health.js
import { prisma } from '../../lib/db';
import { redis } from '../../lib/redis';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {},
    version: process.env.npm_package_version || 'unknown'
  };
  
  try {
    // Database health check
    await prisma.$queryRaw`SELECT 1`;
    healthCheck.services.database = 'healthy';
  } catch (error) {
    healthCheck.services.database = 'unhealthy';
    healthCheck.status = 'degraded';
  }
  
  try {
    // Redis health check
    await redis.ping();
    healthCheck.services.redis = 'healthy';
  } catch (error) {
    healthCheck.services.redis = 'unhealthy';
    healthCheck.status = 'degraded';
  }
  
  // Memory usage check
  const memUsage = process.memoryUsage();
  healthCheck.services.memory = {
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    rss: Math.round(memUsage.rss / 1024 / 1024)
  };
  
  const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
}
```

### Application Monitoring

```javascript
// lib/monitoring.js
import { PrismaClient } from '@prisma/client';

class ApplicationMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      databaseQueries: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    
    // Report metrics every 5 minutes
    setInterval(() => this.reportMetrics(), 300000);
  }
  
  recordRequest(duration) {
    this.metrics.requests++;
    this.metrics.responseTime.push(duration);
    
    // Keep only last 100 response times
    if (this.metrics.responseTime.length > 100) {
      this.metrics.responseTime.shift();
    }
  }
  
  recordError(error) {
    this.metrics.errors++;
    console.error('Application error:', error);
  }
  
  recordDatabaseQuery() {
    this.metrics.databaseQueries++;
  }
  
  recordCacheHit() {
    this.metrics.cacheHits++;
  }
  
  recordCacheMiss() {
    this.metrics.cacheMisses++;
  }
  
  async reportMetrics() {
    const avgResponseTime = this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length;
    const cacheHitRate = this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses);
    
    console.log('Application Metrics:', {
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      avgResponseTime: Math.round(avgResponseTime),
      databaseQueries: this.metrics.databaseQueries,
      cacheHitRate: Math.round(cacheHitRate * 100) + '%',
      timestamp: new Date().toISOString()
    });
    
    // Reset counters
    this.metrics.requests = 0;
    this.metrics.errors = 0;
    this.metrics.responseTime = [];
    this.metrics.databaseQueries = 0;
    this.metrics.cacheHits = 0;
    this.metrics.cacheMisses = 0;
  }
}

export const monitor = new ApplicationMonitor();
```

## Deployment Pipeline

### GitHub Actions for Railway

```yaml
# .github/workflows/deploy.yml
name: Deploy to Railway

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Railway CLI
        run: npm install -g @railway/cli
      
      - name: Deploy to Railway
        run: railway up --service web
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
      
      - name: Run database migrations
        run: railway run --service web npm run db:migrate
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
      
      - name: Deploy worker service
        run: railway up --service worker
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  notify:
    needs: deploy
    runs-on: ubuntu-latest
    if: always()
    steps:
      - name: Deployment notification
        run: |
          if [ "${{ needs.deploy.result }}" == "success" ]; then
            echo "✅ Deployment successful"
          else
            echo "❌ Deployment failed"
          fi
```

## Environment Configuration

### Production Environment Variables

```bash
# Railway environment variables
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://user:password@host:port

# Authentication
NEXTAUTH_URL=https://your-app.railway.app
NEXTAUTH_SECRET=your-secret-key

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Content
CONTENT_ENCRYPTION_KEY=your-encryption-key

# Media
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=info
```

---

This Railway deployment architecture provides a robust, scalable foundation for the Interactive Pilot Handbook with proper database integration, background processing, and monitoring capabilities that will grow with your user base.