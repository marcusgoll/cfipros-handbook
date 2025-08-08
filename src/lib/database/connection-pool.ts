import * as Sentry from '@sentry/nextjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

/**
 * Database Connection Pool Configuration for Production
 * Optimized for Railway PostgreSQL with zero-downtime deployments
 */

type ConnectionPoolConfig = {
  max: number;
  idle_timeout: number;
  connect_timeout: number;
  max_lifetime: number;
  ssl: boolean | object;
  debug: boolean;
  prepare: boolean;
  onnotice?: (notice: any) => void;
  onparameter?: (key: string, value: string) => void;
};

class DatabaseConnectionPool {
  private static instance: DatabaseConnectionPool;
  private pool: ReturnType<typeof postgres> | null = null;
  private db: ReturnType<typeof drizzle> | null = null;
  private config: ConnectionPoolConfig;
  private connectionCount = 0;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = this.getConnectionConfig();
    this.initializePool();
    this.startHealthCheck();
  }

  static getInstance(): DatabaseConnectionPool {
    if (!DatabaseConnectionPool.instance) {
      DatabaseConnectionPool.instance = new DatabaseConnectionPool();
    }
    return DatabaseConnectionPool.instance;
  }

  private getConnectionConfig(): ConnectionPoolConfig {
    const isProduction = process.env.NODE_ENV === 'production';
    const isRailway = !!process.env.RAILWAY_ENVIRONMENT;
    const poolSize = Number.parseInt(process.env.DATABASE_CONNECTION_POOL_SIZE || (isRailway ? '15' : '10'));

    // Railway-optimized configuration
    return {
      max: poolSize,
      idle_timeout: Number.parseInt(process.env.DATABASE_IDLE_TIMEOUT || '600'), // 10 minutes
      connect_timeout: Number.parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '30'), // 30 seconds
      max_lifetime: Number.parseInt(process.env.DATABASE_MAX_LIFETIME || '3600'), // 1 hour
      ssl: process.env.DATABASE_SSL === 'true' ? {
        rejectUnauthorized: false, // Railway PostgreSQL uses self-signed certificates
        ca: undefined,
        key: undefined,
        cert: undefined,
      } : false,
      debug: !isProduction && process.env.DATABASE_DEBUG === 'true',
      prepare: false, // Disable prepared statements for better Railway compatibility

      // Connection event handlers
      onnotice: (notice) => {
        if (process.env.DATABASE_DEBUG === 'true') {
          console.log('PostgreSQL Notice:', notice);
        }
      },

      onparameter: (key, value) => {
        if (process.env.DATABASE_DEBUG === 'true') {
          console.log(`PostgreSQL Parameter: ${key} = ${value}`);
        }
      },
    };
  }

  private initializePool() {
    try {
      const databaseUrl = process.env.DATABASE_URL;

      if (!databaseUrl) {
        console.warn('⚠️  DATABASE_URL environment variable is not set - database features will be disabled');
        return;
      }

      const isLocalhost = databaseUrl.includes('127.0.0.1') || databaseUrl.includes('localhost');
      if (isLocalhost && process.env.NODE_ENV === 'production') {
        console.warn('⚠️  DATABASE_URL points to localhost in production - database features will be disabled');
        console.warn('💡 Please update DATABASE_URL to point to your Supabase database');
        return;
      }

      console.log('Initializing database connection pool...', {
        maxConnections: this.config.max,
        idleTimeout: this.config.idle_timeout,
        connectTimeout: this.config.connect_timeout,
        ssl: this.config.ssl,
      });

      this.pool = postgres(databaseUrl, {
        ...this.config,
        // Add connection lifecycle handlers optimized for Railway
        connection: {
          application_name: process.env.RAILWAY_SERVICE_NAME || 'cfi-handbook',
          // Railway-optimized timeouts (in milliseconds)
          statement_timeout: 30000,
          idle_in_transaction_session_timeout: 60000,
          // Add Railway deployment context
          ...(process.env.RAILWAY_DEPLOYMENT_ID && {
            'railway.deployment_id': process.env.RAILWAY_DEPLOYMENT_ID,
          }),
          ...(process.env.RAILWAY_ENVIRONMENT && {
            'railway.environment': process.env.RAILWAY_ENVIRONMENT,
          }),
        },

        // Railway-specific connection optimization
        transform: {
          undefined: null, // Handle undefined values properly
        },

        // Custom connection handler with Railway context
        onnotice: (notice) => {
          this.config.onnotice?.(notice);

          // Track connection notices in Sentry with Railway context
          Sentry.addBreadcrumb({
            category: 'database',
            message: 'PostgreSQL Notice',
            level: 'info',
            data: {
              ...notice,
              railwayEnvironment: process.env.RAILWAY_ENVIRONMENT,
              deploymentId: process.env.RAILWAY_DEPLOYMENT_ID,
            },
          });
        },
      });

      this.db = drizzle(this.pool);

      // Track successful initialization
      Sentry.addBreadcrumb({
        category: 'database',
        message: 'Database connection pool initialized',
        level: 'info',
        data: {
          maxConnections: this.config.max,
          ssl: this.config.ssl,
        },
      });

      console.log('✅ Database connection pool initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database connection pool:', error);

      Sentry.captureException(error, {
        tags: {
          component: 'database-pool',
          operation: 'initialize',
        },
      });

      throw error;
    }
  }

  private startHealthCheck() {
    // Skip health checks if database URL suggests localhost (development/misconfiguration)
    const databaseUrl = process.env.DATABASE_URL || '';
    const isLocalhost = databaseUrl.includes('127.0.0.1') || databaseUrl.includes('localhost');

    if (isLocalhost && process.env.NODE_ENV === 'production') {
      console.warn('⚠️  Database health checks disabled: DATABASE_URL points to localhost in production');
      console.warn('💡 Please update DATABASE_URL to point to your Supabase database');
      return;
    }

    // Perform periodic health checks on the connection pool
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        // Only log error once per minute to avoid spam
        const now = Date.now();
        if (!this.lastHealthCheckError || now - this.lastHealthCheckError > 60000) {
          console.error('Database pool health check failed:', error);
          this.lastHealthCheckError = now;

          Sentry.captureException(error, {
            tags: {
              component: 'database-pool',
              operation: 'health-check',
            },
          });
        }
      }
    }, 30000); // Check every 30 seconds
  }

  private lastHealthCheckError = 0;

  private async performHealthCheck() {
    if (!this.pool || !this.db) {
      throw new Error('Database pool not initialized');
    }

    try {
      // Simple query to test connection
      const result = await this.pool`SELECT 1 as health_check`;

      if (result.length === 1 && result[0].health_check === 1) {
        // Track successful health check
        Sentry.addBreadcrumb({
          category: 'database',
          message: 'Database pool health check passed',
          level: 'debug',
        });
        return true;
      } else {
        throw new Error('Unexpected health check result');
      }
    } catch (error) {
      throw new Error(`Database pool health check failed: ${error.message}`);
    }
  }

  getDatabase() {
    if (!this.db) {
      throw new Error('Database not available. Check DATABASE_URL configuration.');
    }
    return this.db;
  }

  isDatabaseAvailable(): boolean {
    return this.db !== null;
  }

  getPool() {
    if (!this.pool) {
      throw new Error('Connection pool not initialized. Call getInstance() first.');
    }
    return this.pool;
  }

  async getConnectionInfo() {
    if (!this.pool) {
      throw new Error('Connection pool not initialized');
    }

    try {
      // Get connection statistics
      const stats = await this.pool`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `;

      return {
        totalConnections: Number.parseInt(stats[0].total_connections),
        activeConnections: Number.parseInt(stats[0].active_connections),
        idleConnections: Number.parseInt(stats[0].idle_connections),
        maxConnections: this.config.max,
        poolUtilization: (Number.parseInt(stats[0].total_connections) / this.config.max) * 100,
      };
    } catch (error) {
      console.error('Failed to get connection info:', error);
      return null;
    }
  }

  async executeWithRetry<T>(
    operation: (db: ReturnType<typeof drizzle>) => Promise<T>,
    maxRetries = 3,
    delay = 1000,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation(this.getDatabase());
      } catch (error) {
        lastError = error as Error;

        console.warn(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error);

        Sentry.addBreadcrumb({
          category: 'database',
          message: `Database operation retry ${attempt}/${maxRetries}`,
          level: 'warning',
          data: { error: error.message },
        });

        if (attempt < maxRetries) {
          // Exponential backoff
          const backoffDelay = delay * 2 ** (attempt - 1);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
      }
    }

    // All retries failed
    Sentry.captureException(lastError!, {
      tags: {
        component: 'database-pool',
        operation: 'executeWithRetry',
        maxRetries: maxRetries.toString(),
      },
    });

    throw lastError!;
  }

  async gracefulShutdown() {
    console.log('🔄 Shutting down database connection pool...');

    // Clear health check interval
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    // Close all connections
    if (this.pool) {
      try {
        await this.pool.end();
        console.log('✅ Database connection pool closed successfully');
      } catch (error) {
        console.error('❌ Error closing database connection pool:', error);

        Sentry.captureException(error, {
          tags: {
            component: 'database-pool',
            operation: 'shutdown',
          },
        });
      }
    }

    this.pool = null;
    this.db = null;
  }

  // Metrics for monitoring
  getMetrics() {
    return {
      connectionCount: this.connectionCount,
      maxConnections: this.config.max,
      idleTimeout: this.config.idle_timeout,
      connectTimeout: this.config.connect_timeout,
      sslEnabled: !!this.config.ssl,
      isInitialized: !!this.pool,
    };
  }
}

// Singleton instance
export const dbPool = DatabaseConnectionPool.getInstance();

// Export for use in API routes and server-side code
// For MVP launch, make these exports safe for build time
export const getDatabaseSafe = () => {
  try {
    return dbPool.isDatabaseAvailable() ? dbPool.getDatabase() : null;
  } catch (error) {
    console.warn('Database not available during build:', error.message);
    return null;
  }
};

export const getPoolSafe = () => {
  try {
    return dbPool.isDatabaseAvailable() ? dbPool.getPool() : null;
  } catch (error) {
    console.warn('Database pool not available during build:', error.message);
    return null;
  }
};

// Graceful shutdown handler
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    console.log('Received SIGINT, gracefully shutting down database pool...');
    await dbPool.gracefulShutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, gracefully shutting down database pool...');
    await dbPool.gracefulShutdown();
    process.exit(0);
  });
}

export default DatabaseConnectionPool;
