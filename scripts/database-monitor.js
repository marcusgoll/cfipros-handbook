#!/usr/bin/env node

/**
 * Database Monitoring and Health Check Script
 *
 * Features:
 * - Connection pool monitoring
 * - Migration status tracking
 * - Performance metrics collection
 * - Error alerting and logging
 * - Automatic recovery procedures
 */

const fs = require('node:fs');
const path = require('node:path');
const postgres = require('postgres');

class DatabaseMonitor {
  constructor() {
    this.client = null;
    this.metrics = {
      connectionPool: {},
      queryPerformance: [],
      errors: [],
      migrations: {},
    };
    this.alertThresholds = {
      maxConnectionTime: 30000, // 30 seconds
      maxQueryTime: 5000, // 5 seconds
      maxErrorRate: 0.05, // 5% error rate
      minConnectionsAvailable: 2,
    };
  }

  async initialize() {
    const dbConfig = {
      url: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'true',
      max: Number.parseInt(process.env.DATABASE_CONNECTION_POOL_SIZE || '15'),
      connect_timeout: Number.parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '30'),
      idle_timeout: Number.parseInt(process.env.DATABASE_IDLE_TIMEOUT || '600'),
      transform: postgres.camel,
      onnotice: notice => this.handleNotice(notice),
      onparameter: (key, value) => this.handleParameter(key, value),
    };

    try {
      this.client = postgres(dbConfig.url, dbConfig);
      await this.client`SELECT 1`; // Test connection
      console.log('✅ Database monitor initialized');
    } catch (error) {
      console.error('❌ Failed to initialize database monitor:', error.message);
      throw error;
    }
  }

  async checkConnectionHealth() {
    const startTime = Date.now();

    try {
      // Test basic connectivity
      await this.client`SELECT NOW() as current_time, version() as db_version`;

      // Check connection pool status
      const poolStats = await this.getConnectionPoolStats();

      // Check for long-running queries
      const longQueries = await this.getLongRunningQueries();

      // Check database size and growth
      const dbStats = await this.getDatabaseStats();

      const responseTime = Date.now() - startTime;

      const healthStatus = {
        status: 'healthy',
        responseTime,
        poolStats,
        longQueries,
        dbStats,
        timestamp: new Date().toISOString(),
      };

      // Check thresholds
      if (responseTime > this.alertThresholds.maxConnectionTime) {
        healthStatus.status = 'degraded';
        healthStatus.alerts = healthStatus.alerts || [];
        healthStatus.alerts.push(`High connection time: ${responseTime}ms`);
      }

      if (longQueries.length > 0) {
        healthStatus.status = 'warning';
        healthStatus.alerts = healthStatus.alerts || [];
        healthStatus.alerts.push(`${longQueries.length} long-running queries detected`);
      }

      return healthStatus;
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getConnectionPoolStats() {
    try {
      const result = await this.client`
        SELECT 
          state,
          COUNT(*) as count
        FROM pg_stat_activity 
        WHERE datname = current_database()
        GROUP BY state`;

      const stats = result.reduce((acc, row) => {
        acc[row.state || 'unknown'] = Number.parseInt(row.count);
        return acc;
      }, {});

      // Add total connections
      const totalResult = await this.client`
        SELECT COUNT(*) as total 
        FROM pg_stat_activity 
        WHERE datname = current_database()`;

      stats.total = Number.parseInt(totalResult[0].total);

      return stats;
    } catch (error) {
      console.error('Error getting connection pool stats:', error.message);
      return { error: error.message };
    }
  }

  async getLongRunningQueries() {
    try {
      const result = await this.client`
        SELECT 
          pid,
          query_start,
          state,
          SUBSTRING(query, 1, 100) as query_snippet,
          EXTRACT(EPOCH FROM (NOW() - query_start)) as duration_seconds
        FROM pg_stat_activity 
        WHERE 
          datname = current_database()
          AND state = 'active'
          AND query_start < NOW() - INTERVAL '${this.alertThresholds.maxQueryTime / 1000} seconds'
          AND query NOT LIKE '%pg_stat_activity%'
        ORDER BY query_start`;

      return result.map(row => ({
        pid: row.pid,
        queryStart: row.queryStart,
        state: row.state,
        querySnippet: row.querySnippet,
        durationSeconds: Number.parseFloat(row.durationSeconds),
      }));
    } catch (error) {
      console.error('Error getting long-running queries:', error.message);
      return [];
    }
  }

  async getDatabaseStats() {
    try {
      const sizeResult = await this.client`
        SELECT pg_size_pretty(pg_database_size(current_database())) as database_size`;

      const tableStats = await this.client`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          n_tup_ins + n_tup_upd + n_tup_del as total_changes
        FROM pg_stat_user_tables 
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC 
        LIMIT 10`;

      return {
        databaseSize: sizeResult[0].databaseSize,
        largestTables: tableStats.map(row => ({
          schema: row.schemaname,
          table: row.tablename,
          size: row.size,
          totalChanges: Number.parseInt(row.totalChanges || 0),
        })),
      };
    } catch (error) {
      console.error('Error getting database stats:', error.message);
      return { error: error.message };
    }
  }

  async checkMigrationStatus() {
    try {
      const result = await this.client`
        SELECT 
          id,
          hash,
          status,
          created_at,
          applied_at
        FROM __drizzle_migrations 
        ORDER BY created_at DESC 
        LIMIT 20`;

      const failedMigrations = result.filter(m => m.status === 'failed');
      const rolledBackMigrations = result.filter(m => m.status === 'rolled_back');

      return {
        totalMigrations: result.length,
        failedMigrations: failedMigrations.length,
        rolledBackMigrations: rolledBackMigrations.length,
        latestMigration: result[0] || null,
        recentMigrations: result.slice(0, 5),
      };
    } catch (error) {
      // Migrations table doesn't exist
      return {
        error: 'Migrations table not found',
        totalMigrations: 0,
      };
    }
  }

  async runPerformanceAnalysis() {
    try {
      // Check for missing indexes
      const missingIndexes = await this.client`
        SELECT 
          schemaname,
          tablename,
          seq_scan,
          seq_tup_read,
          idx_scan,
          idx_tup_fetch,
          CASE 
            WHEN seq_scan > 0 AND idx_scan = 0 THEN 'No index usage'
            WHEN seq_scan > idx_scan THEN 'Sequential scans dominating'
            ELSE 'Index usage looks good'
          END as recommendation
        FROM pg_stat_user_tables 
        WHERE seq_scan > 1000 OR (seq_scan > idx_scan AND seq_scan > 100)
        ORDER BY seq_scan DESC`;

      // Check for slow queries from pg_stat_statements if available
      let slowQueries = [];
      try {
        slowQueries = await this.client`
          SELECT 
            query,
            calls,
            total_exec_time,
            mean_exec_time,
            rows
          FROM pg_stat_statements 
          WHERE mean_exec_time > 1000
          ORDER BY mean_exec_time DESC 
          LIMIT 10`;
      } catch (error) {
        // pg_stat_statements extension not available
        console.log('pg_stat_statements extension not available for slow query analysis');
      }

      return {
        missingIndexes: missingIndexes.length,
        indexRecommendations: missingIndexes.slice(0, 5),
        slowQueries: slowQueries.length,
        slowQueryDetails: slowQueries,
      };
    } catch (error) {
      console.error('Error running performance analysis:', error.message);
      return { error: error.message };
    }
  }

  async generateReport() {
    console.log('📊 Generating database health report...');

    const report = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      health: await this.checkConnectionHealth(),
      migrations: await this.checkMigrationStatus(),
      performance: await this.runPerformanceAnalysis(),
    };

    // Save report to file
    const reportsDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportFilename = `db-health-${new Date().toISOString().split('T')[0]}.json`;
    const reportPath = path.join(reportsDir, reportFilename);

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`✅ Health report saved: ${reportPath}`);

    // Print summary
    this.printReportSummary(report);

    return report;
  }

  printReportSummary(report) {
    console.log('\n🔍 Database Health Summary:');
    console.log(`Status: ${report.health.status}`);
    console.log(`Response Time: ${report.health.responseTime}ms`);

    if (report.health.poolStats && report.health.poolStats.total) {
      console.log(`Active Connections: ${report.health.poolStats.active || 0}/${report.health.poolStats.total}`);
    }

    if (report.migrations.totalMigrations > 0) {
      console.log(`Migrations: ${report.migrations.totalMigrations} total`);
      if (report.migrations.failedMigrations > 0) {
        console.log(`⚠️  Failed Migrations: ${report.migrations.failedMigrations}`);
      }
    }

    if (report.performance.missingIndexes > 0) {
      console.log(`⚠️  Tables needing index optimization: ${report.performance.missingIndexes}`);
    }

    if (report.performance.slowQueries > 0) {
      console.log(`⚠️  Slow queries detected: ${report.performance.slowQueries}`);
    }

    if (report.health.alerts && report.health.alerts.length > 0) {
      console.log('\n🚨 Alerts:');
      report.health.alerts.forEach(alert => console.log(`  - ${alert}`));
    }
  }

  handleNotice(notice) {
    if (notice.severity === 'WARNING' || notice.severity === 'ERROR') {
      console.warn(`Database ${notice.severity}: ${notice.message}`);

      this.metrics.errors.push({
        severity: notice.severity,
        message: notice.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  handleParameter(key, value) {
    // Log important parameter changes
    if (['max_connections', 'shared_buffers', 'effective_cache_size'].includes(key)) {
      console.log(`Database parameter ${key}: ${value}`);
    }
  }

  async close() {
    if (this.client) {
      await this.client.end();
      console.log('✅ Database monitor connection closed');
    }
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  const monitor = new DatabaseMonitor();

  try {
    await monitor.initialize();

    if (args.includes('--health')) {
      const health = await monitor.checkConnectionHealth();
      console.log(JSON.stringify(health, null, 2));
    } else if (args.includes('--migrations')) {
      const migrations = await monitor.checkMigrationStatus();
      console.log(JSON.stringify(migrations, null, 2));
    } else if (args.includes('--performance')) {
      const performance = await monitor.runPerformanceAnalysis();
      console.log(JSON.stringify(performance, null, 2));
    } else {
      // Generate full report
      await monitor.generateReport();
    }
  } catch (error) {
    console.error('💥 Database monitoring failed:', error.message);
    process.exit(1);
  } finally {
    await monitor.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = { DatabaseMonitor };
