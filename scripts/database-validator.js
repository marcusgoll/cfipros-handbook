#!/usr/bin/env node

/**
 * Database Schema Validation and Integrity Checker
 *
 * Features:
 * - Schema drift detection between environments
 * - Data integrity validation
 * - Foreign key constraint verification
 * - Index optimization analysis
 * - Performance baseline validation
 * - Migration rollback safety checks
 */

const fs = require('node:fs');
const path = require('node:path');
const postgres = require('postgres');

class DatabaseValidator {
  constructor() {
    this.client = null;
    this.expectedSchema = this.loadExpectedSchema();
    this.validationResults = {
      passed: [],
      warnings: [],
      errors: [],
      performance: [],
    };
  }

  async initialize() {
    const dbConfig = {
      url: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'true',
      transform: postgres.camel,
    };

    try {
      this.client = postgres(dbConfig.url, dbConfig);
      await this.client`SELECT 1`;
      console.log('✅ Database validator initialized');
    } catch (error) {
      console.error('❌ Failed to initialize validator:', error.message);
      throw error;
    }
  }

  loadExpectedSchema() {
    // Load schema from Drizzle schema file
    const schemaPath = path.join(__dirname, '..', 'src', 'models', 'Schema.ts');

    if (!fs.existsSync(schemaPath)) {
      console.warn('⚠️  Schema file not found, using basic validation');
      return null;
    }

    // Parse expected tables from schema file
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const tableMatches = schemaContent.match(/export const (\w+)Schema = pgTable\('(\w+)'/g);

    const expectedTables = {};
    if (tableMatches) {
      for (const match of tableMatches) {
        const [, schemaName, tableName] = match.match(/export const (\w+)Schema = pgTable\('(\w+)'/);
        expectedTables[tableName] = {
          schemaName,
          tableName,
        };
      }
    }

    return { tables: expectedTables };
  }

  async validateSchemaStructure() {
    console.log('🔍 Validating schema structure...');

    // Get actual database schema
    const actualTables = await this.getDatabaseSchema();
    const actualTableNames = actualTables.map(t => t.tableName);

    // Check for missing tables
    if (this.expectedSchema && this.expectedSchema.tables) {
      const expectedTableNames = Object.keys(this.expectedSchema.tables);

      for (const expectedTable of expectedTableNames) {
        if (!actualTableNames.includes(expectedTable)) {
          this.validationResults.errors.push({
            type: 'missing_table',
            message: `Missing table: ${expectedTable}`,
            severity: 'error',
          });
        } else {
          this.validationResults.passed.push({
            type: 'table_exists',
            message: `Table exists: ${expectedTable}`,
          });
        }
      }

      // Check for unexpected tables
      for (const actualTable of actualTableNames) {
        if (!expectedTableNames.includes(actualTable) && !actualTable.startsWith('__')) {
          this.validationResults.warnings.push({
            type: 'unexpected_table',
            message: `Unexpected table found: ${actualTable}`,
            severity: 'warning',
          });
        }
      }
    }

    // Validate table structures
    for (const table of actualTables) {
      await this.validateTableStructure(table);
    }

    console.log(`✅ Schema validation completed: ${this.validationResults.passed.length} passed, ${this.validationResults.warnings.length} warnings, ${this.validationResults.errors.length} errors`);
  }

  async getDatabaseSchema() {
    const tables = await this.client`
      SELECT 
        t.table_name,
        t.table_schema,
        obj_description(c.oid) as table_comment
      FROM information_schema.tables t
      LEFT JOIN pg_class c ON c.relname = t.table_name
      WHERE t.table_schema = 'public' 
      AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_name`;

    const result = [];

    for (const table of tables) {
      const columns = await this.getTableColumns(table.tableName);
      const constraints = await this.getTableConstraints(table.tableName);
      const indexes = await this.getTableIndexes(table.tableName);

      result.push({
        ...table,
        columns,
        constraints,
        indexes,
      });
    }

    return result;
  }

  async getTableColumns(tableName) {
    return await this.client`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale,
        ordinal_position
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = ${tableName}
      ORDER BY ordinal_position`;
  }

  async getTableConstraints(tableName) {
    return await this.client`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name as referenced_table,
        ccu.column_name as referenced_column
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      LEFT JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.table_schema = 'public' 
      AND tc.table_name = ${tableName}`;
  }

  async getTableIndexes(tableName) {
    return await this.client`
      SELECT 
        indexname,
        indexdef,
        schemaname
      FROM pg_indexes
      WHERE schemaname = 'public' 
      AND tablename = ${tableName}`;
  }

  async validateTableStructure(table) {
    const tableName = table.tableName;

    // Check for required columns
    const requiredColumns = this.getRequiredColumns(tableName);
    for (const requiredCol of requiredColumns) {
      const column = table.columns.find(c => c.columnName === requiredCol.name);
      if (!column) {
        this.validationResults.errors.push({
          type: 'missing_column',
          table: tableName,
          message: `Missing required column: ${tableName}.${requiredCol.name}`,
          severity: 'error',
        });
      } else if (column.dataType !== requiredCol.type) {
        this.validationResults.warnings.push({
          type: 'column_type_mismatch',
          table: tableName,
          message: `Column type mismatch: ${tableName}.${requiredCol.name} expected ${requiredCol.type}, got ${column.dataType}`,
          severity: 'warning',
        });
      }
    }

    // Check for primary key
    const hasPrimaryKey = table.constraints.some(c => c.constraintType === 'PRIMARY KEY');
    if (!hasPrimaryKey) {
      this.validationResults.warnings.push({
        type: 'missing_primary_key',
        table: tableName,
        message: `Table ${tableName} has no primary key`,
        severity: 'warning',
      });
    }

    // Check for created_at/updated_at patterns
    const hasCreatedAt = table.columns.some(c => c.columnName === 'created_at');
    const hasUpdatedAt = table.columns.some(c => c.columnName === 'updated_at');

    if (!hasCreatedAt && !tableName.startsWith('__')) {
      this.validationResults.warnings.push({
        type: 'missing_timestamp',
        table: tableName,
        message: `Table ${tableName} missing created_at timestamp`,
        severity: 'info',
      });
    }
  }

  getRequiredColumns(tableName) {
    // Define required columns for each table type
    const requirements = {
      counter: [
        { name: 'id', type: 'integer' },
      ],
      acs_codes: [
        { name: 'id', type: 'integer' },
        { name: 'code', type: 'character varying' },
        { name: 'title', type: 'text' },
      ],
      analysis_sessions: [
        { name: 'id', type: 'uuid' },
        { name: 'user_id', type: 'character varying' },
      ],
      processed_files: [
        { name: 'id', type: 'uuid' },
        { name: 'user_id', type: 'character varying' },
        { name: 'filename', type: 'character varying' },
      ],
      question_analysis: [
        { name: 'id', type: 'uuid' },
        { name: 'session_id', type: 'uuid' },
        { name: 'file_id', type: 'uuid' },
      ],
      user_progress: [
        { name: 'id', type: 'uuid' },
        { name: 'user_id', type: 'character varying' },
        { name: 'acs_code_id', type: 'integer' },
      ],
      resources: [
        { name: 'id', type: 'uuid' },
        { name: 'title', type: 'character varying' },
        { name: 'file_url', type: 'text' },
      ],
      page_feedback: [
        { name: 'id', type: 'uuid' },
        { name: 'page_id', type: 'character varying' },
        { name: 'feedback_type', type: 'character varying' },
      ],
    };

    return requirements[tableName] || [];
  }

  async validateDataIntegrity() {
    console.log('🔍 Validating data integrity...');

    // Check foreign key constraints
    await this.validateForeignKeys();

    // Check for orphaned records
    await this.checkOrphanedRecords();

    // Validate data consistency
    await this.validateDataConsistency();

    console.log('✅ Data integrity validation completed');
  }

  async validateForeignKeys() {
    const foreignKeys = await this.client`
      SELECT 
        tc.table_name,
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'`;

    for (const fk of foreignKeys) {
      try {
        // Check for broken foreign key references
        const brokenRefs = await this.client`
          SELECT COUNT(*) as count
          FROM ${this.client(fk.tableName)} t1
          LEFT JOIN ${this.client(fk.foreignTableName)} t2 
            ON t1.${this.client(fk.columnName)} = t2.${this.client(fk.foreignColumnName)}
          WHERE t1.${this.client(fk.columnName)} IS NOT NULL 
          AND t2.${this.client(fk.foreignColumnName)} IS NULL`;

        const brokenCount = Number.parseInt(brokenRefs[0].count);

        if (brokenCount > 0) {
          this.validationResults.errors.push({
            type: 'broken_foreign_key',
            message: `${brokenCount} broken foreign key references in ${fk.tableName}.${fk.columnName}`,
            constraint: fk.constraintName,
            severity: 'error',
          });
        } else {
          this.validationResults.passed.push({
            type: 'foreign_key_valid',
            message: `Foreign key constraint valid: ${fk.tableName}.${fk.columnName}`,
          });
        }
      } catch (error) {
        this.validationResults.errors.push({
          type: 'foreign_key_check_failed',
          message: `Failed to validate foreign key ${fk.constraintName}: ${error.message}`,
          severity: 'error',
        });
      }
    }
  }

  async checkOrphanedRecords() {
    // Check for orphaned analysis sessions
    try {
      const orphanedSessions = await this.client`
        SELECT COUNT(*) as count
        FROM analysis_sessions a
        LEFT JOIN processed_files p ON a.user_id = p.user_id
        WHERE p.user_id IS NULL`;

      const orphanedCount = Number.parseInt(orphanedSessions[0].count);
      if (orphanedCount > 0) {
        this.validationResults.warnings.push({
          type: 'orphaned_records',
          message: `${orphanedCount} analysis sessions without associated processed files`,
          severity: 'warning',
        });
      }
    } catch (error) {
      // Table might not exist
      console.log('Skipping orphaned records check for analysis_sessions');
    }
  }

  async validateDataConsistency() {
    // Check for duplicate unique values
    const uniqueConstraints = await this.client`
      SELECT 
        tc.table_name,
        tc.constraint_name,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.constraint_type = 'UNIQUE'
      AND tc.table_schema = 'public'`;

    for (const constraint of uniqueConstraints) {
      try {
        const duplicates = await this.client`
          SELECT ${this.client(constraint.columnName)}, COUNT(*) as count
          FROM ${this.client(constraint.tableName)}
          GROUP BY ${this.client(constraint.columnName)}
          HAVING COUNT(*) > 1`;

        if (duplicates.length > 0) {
          this.validationResults.errors.push({
            type: 'duplicate_unique_values',
            message: `Duplicate values found in unique constraint: ${constraint.tableName}.${constraint.columnName}`,
            count: duplicates.length,
            severity: 'error',
          });
        }
      } catch (error) {
        console.log(`Skipping unique constraint check for ${constraint.tableName}.${constraint.columnName}`);
      }
    }
  }

  async validatePerformance() {
    console.log('🚀 Validating performance characteristics...');

    // Check for missing indexes on foreign keys
    await this.checkMissingIndexes();

    // Check table sizes and growth patterns
    await this.checkTableSizes();

    // Validate query performance
    await this.checkQueryPerformance();

    console.log('✅ Performance validation completed');
  }

  async checkMissingIndexes() {
    const foreignKeys = await this.client`
      SELECT DISTINCT
        kcu.table_name,
        kcu.column_name
      FROM information_schema.key_column_usage kcu
      JOIN information_schema.table_constraints tc 
        ON kcu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND kcu.table_schema = 'public'`;

    for (const fk of foreignKeys) {
      const hasIndex = await this.client`
        SELECT COUNT(*) as count
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = ${fk.tableName}
        AND indexdef LIKE '%' || ${fk.columnName} || '%'`;

      if (Number.parseInt(hasIndex[0].count) === 0) {
        this.validationResults.performance.push({
          type: 'missing_foreign_key_index',
          message: `Consider adding index on foreign key: ${fk.tableName}.${fk.columnName}`,
          table: fk.tableName,
          column: fk.columnName,
          severity: 'suggestion',
        });
      }
    }
  }

  async checkTableSizes() {
    const tableSizes = await this.client`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes,
        n_tup_ins + n_tup_upd + n_tup_del as total_changes
      FROM pg_stat_user_tables 
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC`;

    for (const table of tableSizes) {
      const sizeBytes = Number.parseInt(table.sizeBytes);
      const changes = Number.parseInt(table.totalChanges || 0);

      // Flag large tables for potential optimization
      if (sizeBytes > 100 * 1024 * 1024) { // 100MB
        this.validationResults.performance.push({
          type: 'large_table',
          message: `Large table detected: ${table.tablename} (${table.size})`,
          table: table.tablename,
          size: table.size,
          severity: 'info',
        });
      }

      // Flag tables with high activity
      if (changes > 10000) {
        this.validationResults.performance.push({
          type: 'high_activity_table',
          message: `High activity table: ${table.tablename} (${changes} changes)`,
          table: table.tablename,
          changes,
          severity: 'info',
        });
      }
    }
  }

  async checkQueryPerformance() {
    // Check for sequential scans on large tables
    const seqScans = await this.client`
      SELECT 
        schemaname,
        tablename,
        seq_scan,
        seq_tup_read,
        idx_scan,
        n_tup_ins + n_tup_upd + n_tup_del as total_changes
      FROM pg_stat_user_tables 
      WHERE seq_scan > 100 
      AND (idx_scan = 0 OR seq_scan > idx_scan * 2)
      ORDER BY seq_scan DESC`;

    for (const table of seqScans) {
      this.validationResults.performance.push({
        type: 'excessive_sequential_scans',
        message: `Table ${table.tablename} has ${table.seqScan} sequential scans vs ${table.idxScan || 0} index scans`,
        table: table.tablename,
        seqScans: table.seqScan,
        idxScans: table.idxScan || 0,
        severity: 'warning',
      });
    }
  }

  async validateMigrationSafety() {
    console.log('🔒 Validating migration safety...');

    // Check for locks that could block migrations
    const locks = await this.client`
      SELECT 
        pg_class.relname,
        pg_locks.locktype,
        pg_locks.mode,
        pg_locks.granted
      FROM pg_locks
      JOIN pg_class ON pg_locks.relation = pg_class.oid
      WHERE NOT pg_locks.granted`;

    if (locks.length > 0) {
      this.validationResults.warnings.push({
        type: 'active_locks',
        message: `${locks.length} ungranted locks detected - migrations may be blocked`,
        locks: locks.length,
        severity: 'warning',
      });
    }

    // Check for long-running transactions
    const longTransactions = await this.client`
      SELECT 
        pid,
        query_start,
        state,
        EXTRACT(EPOCH FROM (NOW() - query_start)) as duration_seconds
      FROM pg_stat_activity 
      WHERE state = 'active'
      AND query_start < NOW() - INTERVAL '30 seconds'
      AND query NOT LIKE '%pg_stat_activity%'`;

    for (const tx of longTransactions) {
      this.validationResults.warnings.push({
        type: 'long_running_transaction',
        message: `Long-running transaction detected: PID ${tx.pid} (${Math.round(tx.durationSeconds)}s)`,
        pid: tx.pid,
        duration: tx.durationSeconds,
        severity: 'warning',
      });
    }

    console.log('✅ Migration safety validation completed');
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: process.env.DATABASE_URL ? process.env.DATABASE_URL.split('/').pop() : 'unknown',
      summary: {
        passed: this.validationResults.passed.length,
        warnings: this.validationResults.warnings.length,
        errors: this.validationResults.errors.length,
        performance: this.validationResults.performance.length,
      },
      results: this.validationResults,
    };

    // Save report
    const reportsDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportFilename = `validation-${new Date().toISOString().split('T')[0]}.json`;
    const reportPath = path.join(reportsDir, reportFilename);

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`📋 Validation report saved: ${reportPath}`);
    this.printSummary(report);

    return report;
  }

  printSummary(report) {
    console.log('\n📊 Validation Summary:');
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`⚠️  Warnings: ${report.summary.warnings}`);
    console.log(`❌ Errors: ${report.summary.errors}`);
    console.log(`🚀 Performance Issues: ${report.summary.performance}`);

    // Print critical errors
    const criticalErrors = this.validationResults.errors.filter(e => e.severity === 'error');
    if (criticalErrors.length > 0) {
      console.log('\n🚨 Critical Errors:');
      criticalErrors.forEach(error => console.log(`  - ${error.message}`));
    }

    // Print important warnings
    const importantWarnings = this.validationResults.warnings.filter(w => w.severity === 'warning');
    if (importantWarnings.length > 0) {
      console.log('\n⚠️  Important Warnings:');
      importantWarnings.slice(0, 5).forEach(warning => console.log(`  - ${warning.message}`));
    }
  }

  async run() {
    try {
      await this.initialize();

      await this.validateSchemaStructure();
      await this.validateDataIntegrity();
      await this.validatePerformance();
      await this.validateMigrationSafety();

      const report = this.generateReport();

      // Exit with error code if critical issues found
      if (report.summary.errors > 0) {
        console.log('\n❌ Validation failed with critical errors');
        process.exit(1);
      } else if (report.summary.warnings > 0) {
        console.log('\n⚠️  Validation completed with warnings');
      } else {
        console.log('\n✅ All validations passed');
      }

      return report;
    } catch (error) {
      console.error('💥 Validation failed:', error.message);
      throw error;
    } finally {
      if (this.client) {
        await this.client.end();
      }
    }
  }

  async close() {
    if (this.client) {
      await this.client.end();
    }
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  const validator = new DatabaseValidator();

  try {
    if (args.includes('--schema-only')) {
      await validator.initialize();
      await validator.validateSchemaStructure();
      console.log('Schema validation completed');
    } else if (args.includes('--data-only')) {
      await validator.initialize();
      await validator.validateDataIntegrity();
      console.log('Data validation completed');
    } else if (args.includes('--performance-only')) {
      await validator.initialize();
      await validator.validatePerformance();
      console.log('Performance validation completed');
    } else {
      await validator.run();
    }
  } catch (error) {
    console.error('💥 Database validation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { DatabaseValidator };
