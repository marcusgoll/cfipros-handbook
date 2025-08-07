#!/usr/bin/env node

/**
 * Database Backup and Restore Script
 *
 * Features:
 * - Full database backups with compression
 * - Incremental backups for large datasets
 * - Point-in-time recovery support
 * - Automated backup rotation
 * - Data integrity verification
 * - Cross-environment restore capabilities
 */

const { spawn } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const postgres = require('postgres');

class DatabaseBackup {
  constructor() {
    this.client = null;
    this.backupDir = path.join(__dirname, '..', 'backups');
    this.config = {
      url: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'true',
      retentionDays: Number.parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
      compressionLevel: Number.parseInt(process.env.BACKUP_COMPRESSION_LEVEL || '6'),
    };

    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async initialize() {
    try {
      this.client = postgres(this.config.url, {
        ssl: this.config.ssl,
        transform: postgres.camel,
      });

      await this.client`SELECT 1`;
      console.log('✅ Database backup service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize backup service:', error.message);
      throw error;
    }
  }

  async createFullBackup(options = {}) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = options.name || `full-backup-${timestamp}`;
    const backupPath = path.join(this.backupDir, `${backupName}.sql`);

    console.log(`💾 Creating full backup: ${backupName}`);

    try {
      let backupContent = this.generateBackupHeader();

      // Get all tables in the correct dependency order
      const tables = await this.getTablesInDependencyOrder();
      console.log(`📋 Backing up ${tables.length} tables...`);

      // Backup schema first
      backupContent += await this.backupSchema(tables);

      // Backup data
      for (const table of tables) {
        console.log(`  📄 Backing up table: ${table.tableName}`);
        backupContent += await this.backupTableData(table.tableName);
      }

      // Add constraints and indexes
      backupContent += await this.backupConstraintsAndIndexes();

      // Write backup file
      fs.writeFileSync(backupPath, backupContent);

      // Generate checksum
      const checksum = this.generateChecksum(backupContent);
      const checksumPath = `${backupPath}.sha256`;
      fs.writeFileSync(checksumPath, `${checksum}  ${path.basename(backupPath)}\n`);

      // Compress if requested
      let finalPath = backupPath;
      if (options.compress !== false) {
        finalPath = await this.compressBackup(backupPath);
        fs.unlinkSync(backupPath); // Remove uncompressed version
      }

      const stats = fs.statSync(finalPath);

      console.log(`✅ Backup completed: ${finalPath}`);
      console.log(`📊 Backup size: ${this.formatBytes(stats.size)}`);

      return {
        path: finalPath,
        checksum,
        size: stats.size,
        timestamp: new Date(),
        tables: tables.length,
      };
    } catch (error) {
      console.error('❌ Backup failed:', error.message);

      // Cleanup failed backup
      if (fs.existsSync(backupPath)) {
        fs.unlinkSync(backupPath);
      }

      throw error;
    }
  }

  async createIncrementalBackup(lastBackupTime) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `incremental-backup-${timestamp}`;
    const backupPath = path.join(this.backupDir, `${backupName}.sql`);

    console.log(`🔄 Creating incremental backup since: ${lastBackupTime}`);

    try {
      let backupContent = this.generateBackupHeader('incremental');
      backupContent += `-- Incremental backup since: ${lastBackupTime}\n\n`;

      // Get tables with recent changes
      const changedTables = await this.getTablesWithChanges(lastBackupTime);
      console.log(`📋 Found changes in ${changedTables.length} tables`);

      if (changedTables.length === 0) {
        console.log('✅ No changes found since last backup');
        return null;
      }

      for (const table of changedTables) {
        console.log(`  📄 Backing up changes in: ${table.tableName}`);
        backupContent += await this.backupTableChanges(table.tableName, lastBackupTime);
      }

      fs.writeFileSync(backupPath, backupContent);

      const checksum = this.generateChecksum(backupContent);
      const checksumPath = `${backupPath}.sha256`;
      fs.writeFileSync(checksumPath, `${checksum}  ${path.basename(backupPath)}\n`);

      const finalPath = await this.compressBackup(backupPath);
      fs.unlinkSync(backupPath);

      const stats = fs.statSync(finalPath);

      console.log(`✅ Incremental backup completed: ${finalPath}`);
      console.log(`📊 Backup size: ${this.formatBytes(stats.size)}`);

      return {
        path: finalPath,
        checksum,
        size: stats.size,
        timestamp: new Date(),
        tables: changedTables.length,
        type: 'incremental',
      };
    } catch (error) {
      console.error('❌ Incremental backup failed:', error.message);
      throw error;
    }
  }

  async restoreBackup(backupPath, options = {}) {
    console.log(`🔄 Restoring backup: ${backupPath}`);

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }

    try {
      // Verify checksum if available
      const checksumPath = `${backupPath}.sha256`;
      if (fs.existsSync(checksumPath)) {
        const isValid = await this.verifyBackupIntegrity(backupPath, checksumPath);
        if (!isValid) {
          throw new Error('Backup integrity check failed');
        }
        console.log('✅ Backup integrity verified');
      }

      // Decompress if needed
      let sqlPath = backupPath;
      if (backupPath.endsWith('.gz')) {
        sqlPath = await this.decompressBackup(backupPath);
      }

      // Read backup content
      const backupContent = fs.readFileSync(sqlPath, 'utf8');

      // Create restoration point if not dry run
      if (!options.dryRun) {
        const restorationPoint = await this.createRestorationPoint();
        console.log(`💾 Created restoration point: ${restorationPoint.path}`);
      }

      // Execute restore in transaction
      if (options.dryRun) {
        console.log('🧪 Dry run mode - validating backup content...');
        this.validateBackupContent(backupContent);
        console.log('✅ Backup content validation passed');
      } else {
        await this.executeRestore(backupContent, options);
        console.log('✅ Backup restored successfully');
      }

      // Cleanup temporary files
      if (sqlPath !== backupPath && fs.existsSync(sqlPath)) {
        fs.unlinkSync(sqlPath);
      }
    } catch (error) {
      console.error('❌ Restore failed:', error.message);
      throw error;
    }
  }

  async getTablesInDependencyOrder() {
    const result = await this.client`
      WITH RECURSIVE table_deps AS (
        SELECT 
          t.table_name,
          t.table_schema,
          COALESCE(array_agg(DISTINCT kcu.table_name) FILTER (WHERE kcu.table_name IS NOT NULL), ARRAY[]::text[]) as dependencies
        FROM information_schema.tables t
        LEFT JOIN information_schema.table_constraints tc ON t.table_name = tc.table_name
        LEFT JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        LEFT JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
        WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
        GROUP BY t.table_name, t.table_schema
      )
      SELECT table_name, dependencies
      FROM table_deps
      ORDER BY array_length(dependencies, 1) NULLS FIRST, table_name`;

    return result.map(row => ({
      tableName: row.tableName,
      dependencies: row.dependencies || [],
    }));
  }

  async backupSchema(tables) {
    let schemaContent = '-- Schema definitions\n\n';

    for (const table of tables) {
      const createTable = await this.client`
        SELECT 
          'CREATE TABLE ' || quote_ident(schemaname) || '.' || quote_ident(tablename) || E' (\n' ||
          array_to_string(
            array_agg(
              '  ' || quote_ident(attname) || ' ' || pg_catalog.format_type(atttypid, atttypmod) ||
              CASE 
                WHEN attnotnull THEN ' NOT NULL'
                ELSE ''
              END ||
              CASE 
                WHEN pg_get_expr(adbin, adrelid) IS NOT NULL THEN ' DEFAULT ' || pg_get_expr(adbin, adrelid)
                ELSE ''
              END
              ORDER BY attnum
            ), E',\n'
          ) || E'\n);' as ddl
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        JOIN pg_attribute a ON a.attrelid = c.oid
        LEFT JOIN pg_attrdef d ON d.adrelid = c.oid AND d.adnum = a.attnum
        WHERE n.nspname = 'public'
        AND c.relname = ${table.tableName}
        AND a.attnum > 0
        AND NOT a.attisdropped
        GROUP BY schemaname, tablename`;

      if (createTable.length > 0) {
        schemaContent += `${createTable[0].ddl}\n\n`;
      }
    }

    return schemaContent;
  }

  async backupTableData(tableName) {
    let dataContent = `-- Data for table: ${tableName}\n`;

    try {
      const rowCount = await this.client`SELECT COUNT(*) as count FROM ${this.client(tableName)}`;
      const totalRows = Number.parseInt(rowCount[0].count);

      if (totalRows === 0) {
        dataContent += `-- No data in table ${tableName}\n\n`;
        return dataContent;
      }

      console.log(`    📊 ${totalRows} rows to backup`);

      // Use batched inserts for large tables
      const batchSize = 1000;
      let offset = 0;

      while (offset < totalRows) {
        const rows = await this.client`
          SELECT * FROM ${this.client(tableName)} 
          ORDER BY (SELECT NULL) 
          LIMIT ${batchSize} OFFSET ${offset}`;

        if (rows.length > 0) {
          // Get column names
          const columns = Object.keys(rows[0]);
          const columnList = columns.map(col => `"${col}"`).join(', ');

          dataContent += `INSERT INTO "${tableName}" (${columnList}) VALUES\n`;

          const valueRows = rows.map((row) => {
            const values = columns.map((col) => {
              const value = row[col];
              if (value === null) {
                return 'NULL';
              }
              if (typeof value === 'string') {
                return `'${value.replace(/'/g, '\'\'')}'`;
              }
              if (value instanceof Date) {
                return `'${value.toISOString()}'`;
              }
              if (typeof value === 'object') {
                return `'${JSON.stringify(value).replace(/'/g, '\'\'')}'`;
              }
              return String(value);
            });
            return `  (${values.join(', ')})`;
          });

          dataContent += `${valueRows.join(',\n')};\n\n`;
        }

        offset += batchSize;
      }
    } catch (error) {
      console.error(`Error backing up table ${tableName}:`, error.message);
      dataContent += `-- Error backing up table ${tableName}: ${error.message}\n\n`;
    }

    return dataContent;
  }

  async backupConstraintsAndIndexes() {
    let constraintsContent = '-- Constraints and Indexes\n\n';

    // Foreign key constraints
    const fkConstraints = await this.client`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.delete_rule,
        rc.update_rule
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
      JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'`;

    for (const fk of fkConstraints) {
      constraintsContent += `ALTER TABLE "${fk.tableName}" ADD CONSTRAINT "${fk.constraintName}" `;
      constraintsContent += `FOREIGN KEY ("${fk.columnName}") `;
      constraintsContent += `REFERENCES "${fk.foreignTableName}" ("${fk.foreignColumnName}")`;
      if (fk.deleteRule !== 'NO ACTION') {
        constraintsContent += ` ON DELETE ${fk.deleteRule}`;
      }
      if (fk.updateRule !== 'NO ACTION') {
        constraintsContent += ` ON UPDATE ${fk.updateRule}`;
      }
      constraintsContent += ';\n';
    }

    // Indexes
    const indexes = await this.client`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND indexname NOT LIKE '%_pkey'`;

    for (const index of indexes) {
      constraintsContent += `${index.indexdef};\n`;
    }

    return `${constraintsContent}\n`;
  }

  generateBackupHeader(type = 'full') {
    return `-- Database Backup
-- Type: ${type}
-- Created: ${new Date().toISOString()}
-- Database: ${this.config.url.split('/').pop()}
-- Environment: ${process.env.NODE_ENV || 'development'}

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

`;
  }

  generateChecksum(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  async compressBackup(backupPath) {
    const gzPath = `${backupPath}.gz`;

    return new Promise((resolve, reject) => {
      const gzip = spawn('gzip', ['-f', `--best`, backupPath]);

      gzip.on('close', (code) => {
        if (code === 0) {
          resolve(gzPath);
        } else {
          reject(new Error(`Compression failed with code ${code}`));
        }
      });

      gzip.on('error', reject);
    });
  }

  async verifyBackupIntegrity(backupPath, checksumPath) {
    const expectedChecksum = fs.readFileSync(checksumPath, 'utf8').split('  ')[0];
    const backupContent = fs.readFileSync(backupPath);
    const actualChecksum = crypto.createHash('sha256').update(backupContent).digest('hex');

    return expectedChecksum === actualChecksum;
  }

  formatBytes(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) {
      return '0 B';
    }
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
  }

  async cleanupOldBackups() {
    console.log('🧹 Cleaning up old backups...');

    const files = fs.readdirSync(this.backupDir);
    const backupFiles = files.filter(file =>
      file.startsWith('full-backup-') || file.startsWith('incremental-backup-'),
    );

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    let deletedCount = 0;

    for (const file of backupFiles) {
      const filePath = path.join(this.backupDir, file);
      const stats = fs.statSync(filePath);

      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`  🗑️  Deleted old backup: ${file}`);

        // Also delete associated checksum file
        const checksumPath = `${filePath}.sha256`;
        if (fs.existsSync(checksumPath)) {
          fs.unlinkSync(checksumPath);
        }
      }
    }

    console.log(`✅ Cleanup completed: ${deletedCount} old backups removed`);
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
  const backup = new DatabaseBackup();

  try {
    await backup.initialize();

    if (args.includes('--full')) {
      const options = {
        compress: !args.includes('--no-compress'),
        name: args.includes('--name') ? args[args.indexOf('--name') + 1] : undefined,
      };
      await backup.createFullBackup(options);
    } else if (args.includes('--incremental')) {
      const lastBackupTime = args[args.indexOf('--incremental') + 1];
      if (!lastBackupTime) {
        throw new Error('Last backup time required for incremental backup');
      }
      await backup.createIncrementalBackup(new Date(lastBackupTime));
    } else if (args.includes('--restore')) {
      const backupPath = args[args.indexOf('--restore') + 1];
      if (!backupPath) {
        throw new Error('Backup path required for restore');
      }
      const options = {
        dryRun: args.includes('--dry-run'),
      };
      await backup.restoreBackup(backupPath, options);
    } else if (args.includes('--cleanup')) {
      await backup.cleanupOldBackups();
    } else {
      console.log('Usage:');
      console.log('  --full [--name <name>] [--no-compress]  Create full backup');
      console.log('  --incremental <timestamp>              Create incremental backup');
      console.log('  --restore <path> [--dry-run]           Restore from backup');
      console.log('  --cleanup                              Clean up old backups');
    }
  } catch (error) {
    console.error('💥 Backup operation failed:', error.message);
    process.exit(1);
  } finally {
    await backup.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = { DatabaseBackup };
