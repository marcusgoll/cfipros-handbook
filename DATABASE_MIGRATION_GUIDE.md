# Database Migration Guide for Railway Production Deployment

This guide covers the complete database migration system for the CFI Handbook application, designed for safe and reliable Railway PostgreSQL deployment.

## Overview

The migration system provides:

- ✅ Idempotent migrations with proper hash validation
- 🔄 Transaction-based migrations with rollback support
- 🔍 Schema validation and integrity checks
- 📊 Comprehensive monitoring and error handling
- 💾 Automated backup procedures for production safety
- 📈 Performance impact assessment
- 🧪 Comprehensive testing suite

## Migration Scripts

### Core Migration Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `migrate-to-production.js` | Main migration engine | `npm run db:migrate:prod` |
| `database-validator.js` | Schema and data validation | `npm run db:validate` |
| `database-monitor.js` | Health monitoring and metrics | `npm run db:monitor` |
| `database-backup.js` | Backup and restore operations | `npm run db:backup:full` |
| `test-migration.js` | Comprehensive testing suite | `npm run test:migration` |

### Available Commands

```bash
# Migration Operations
npm run db:migrate:prod              # Run production migrations
npm run db:migrate:validate          # Validate migrations without applying
npm run db:migrate:rollback <id>     # Rollback specific migration

# Validation Operations
npm run db:validate                  # Full database validation
npm run db:validate:schema           # Schema structure validation only
npm run db:validate:data             # Data integrity validation only
npm run db:validate:performance      # Performance analysis only

# Monitoring Operations
npm run db:monitor                   # Generate comprehensive health report
npm run db:monitor:health            # Check connection health only
npm run db:monitor:migrations        # Check migration status only
npm run db:monitor:performance       # Performance metrics only

# Backup Operations
npm run db:backup:full               # Create full database backup
npm run db:backup:incremental <date> # Create incremental backup since date
npm run db:backup:restore <path>     # Restore from backup file
npm run db:backup:cleanup            # Clean up old backup files

# Testing Operations
npm run test:migration               # Run complete migration test suite
```

## Railway Deployment Pipeline

### Build Process

The Railway deployment follows this sequence:

1. **Pre-build Validation** (`build:prepare`)
   - Database connectivity check
   - Schema validation
   - Migration validation

2. **Migration Execution**
   - Automatic backup creation (production only)
   - Transaction-based migration application
   - Post-migration validation

3. **Build Process** (`build:main`)
   - Next.js application build
   - Asset optimization

4. **Post-build Verification** (`build:post`)
   - Build artifact validation
   - Health check endpoint verification

### Environment Variables

Required environment variables for Railway:

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database
DATABASE_SSL=true
DATABASE_CONNECTION_POOL_SIZE=15
DATABASE_CONNECTION_TIMEOUT=30000
DATABASE_IDLE_TIMEOUT=600000
DATABASE_MAX_LIFETIME=3600000

# Migration Configuration
BACKUP_RETENTION_DAYS=30
BACKUP_COMPRESSION_LEVEL=6

# Monitoring Configuration
HEALTH_CHECK_TIMEOUT=30000
READINESS_CHECK_TIMEOUT=30000
```

## Migration System Architecture

### DatabaseMigrator Class

The core migration engine with these key features:

- **Idempotent Execution**: SHA-256 hash validation prevents duplicate migrations
- **Transaction Safety**: All migrations run within database transactions
- **Rollback Support**: Automated rollback SQL generation for common operations
- **Error Recovery**: Comprehensive error handling with detailed logging
- **Performance Monitoring**: Timing and resource usage tracking

### Migration Table Structure

```sql
CREATE TABLE __drizzle_migrations (
  id TEXT PRIMARY KEY,
  hash TEXT NOT NULL,
  sql_content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  applied_at TIMESTAMP DEFAULT NOW(),
  rollback_sql TEXT,
  status VARCHAR(20) DEFAULT 'applied'
);
```

### Validation Framework

The validation system checks:

1. **Schema Structure**
   - Expected vs actual table structure
   - Column types and constraints
   - Primary key presence
   - Foreign key relationships

2. **Data Integrity**
   - Foreign key constraint violations
   - Orphaned records detection
   - Unique constraint validation
   - Data consistency checks

3. **Performance Characteristics**
   - Missing indexes on foreign keys
   - Sequential scan patterns
   - Table size analysis
   - Query performance metrics

## Safety Procedures

### Pre-deployment Checklist

- [ ] Run migration validation: `npm run db:migrate:validate`
- [ ] Execute full database validation: `npm run db:validate`
- [ ] Run migration test suite: `npm run test:migration`
- [ ] Verify backup procedures work: `npm run db:backup:full`
- [ ] Check performance baselines: `npm run db:monitor:performance`

### Production Deployment Flow

1. **Backup Creation**: Automatic backup before migrations
2. **Migration Validation**: Integrity and safety checks
3. **Transaction Execution**: Atomic migration application
4. **Post-migration Validation**: Schema and data verification
5. **Performance Assessment**: Impact analysis
6. **Health Monitoring**: Continuous monitoring setup

### Rollback Procedures

#### Automatic Rollback

```bash
# Rollback specific migration
npm run db:migrate:rollback 0003_slim_warhawk

# Monitor rollback process
npm run rollback:monitor
```

#### Manual Rollback

1. Identify problematic migration:

   ```bash
   npm run db:monitor:migrations
   ```

2. Create restoration point:

   ```bash
   npm run db:backup:full --name pre-rollback
   ```

3. Execute rollback:

   ```bash
   npm run db:migrate:rollback <migration-id>
   ```

4. Validate rollback:

   ```bash
   npm run db:validate
   ```

## Monitoring and Alerting

### Health Monitoring

The monitoring system tracks:

- Connection pool status
- Query performance metrics
- Migration execution history
- Error rates and patterns
- Database size and growth

### Alert Conditions

- **Critical**: Migration failures, connection timeouts
- **Warning**: Long-running queries, high error rates
- **Info**: Performance degradation, large table growth

### Reports and Logs

All operations generate detailed reports saved to `/reports/`:

- `validation-YYYY-MM-DD.json`: Daily validation reports
- `db-health-YYYY-MM-DD.json`: Health monitoring reports
- `migration-test-YYYY-MM-DD.json`: Migration test results

## Best Practices

### Migration Development

1. **Use Descriptive Names**: Migration files should clearly indicate their purpose
2. **Test Locally First**: Always test migrations in development environment
3. **Write Rollback SQL**: Include rollback procedures for complex migrations
4. **Keep Migrations Atomic**: Each migration should be self-contained
5. **Document Schema Changes**: Include comments explaining complex changes

### Performance Considerations

1. **Index Strategy**: Add indexes after bulk data changes
2. **Batch Operations**: Use batching for large data modifications
3. **Lock Management**: Minimize lock duration and scope
4. **Resource Monitoring**: Monitor CPU, memory, and I/O during migrations

### Error Handling

1. **Graceful Degradation**: System should remain functional during minor issues
2. **Detailed Logging**: All operations should be thoroughly logged
3. **Recovery Procedures**: Clear recovery steps for common failure scenarios
4. **Alert Escalation**: Critical issues should trigger immediate alerts

## Troubleshooting

### Common Issues

#### Migration Hash Mismatch

```bash
# Re-validate migration files
npm run db:migrate:validate

# Check for manual schema changes
npm run db:validate:schema
```

#### Connection Pool Exhaustion

```bash
# Monitor connection usage
npm run db:monitor:health

# Check for long-running transactions
npm run db:validate:performance
```

#### Data Integrity Violations

```bash
# Full data validation
npm run db:validate:data

# Check foreign key constraints
npm run db:monitor --performance
```

### Emergency Procedures

#### Database Corruption

1. Stop application traffic
2. Create emergency backup: `npm run db:backup:full --name emergency`
3. Assess damage: `npm run db:validate`
4. Restore from last known good backup if necessary

#### Migration Failure

1. Check migration logs in Railway console
2. Validate current database state: `npm run db:validate`
3. If safe, retry migration: `npm run db:migrate:prod`
4. If unsafe, rollback: `npm run db:migrate:rollback <id>`

## Performance Optimization

### Query Optimization

The system monitors and reports on:

- Sequential scans vs index usage
- Missing indexes on foreign keys
- Long-running queries
- Table bloat and fragmentation

### Recommended Indexes

Based on the current schema, consider these performance indexes:

```sql
-- User activity tracking
CREATE INDEX idx_analysis_sessions_user_id ON analysis_sessions(user_id);
CREATE INDEX idx_processed_files_user_id ON processed_files(user_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);

-- Time-based queries
CREATE INDEX idx_analysis_sessions_created_at ON analysis_sessions(created_at);
CREATE INDEX idx_page_feedback_created_at ON page_feedback(created_at);

-- Foreign key performance
CREATE INDEX idx_question_analysis_session_id ON question_analysis(session_id);
CREATE INDEX idx_question_analysis_file_id ON question_analysis(file_id);
```

## Security Considerations

### Access Control

- Database credentials stored securely in Railway environment variables
- Connection pooling with appropriate limits
- SSL/TLS encryption enforced in production

### Data Protection

- Automatic backups with retention policies
- Migration logs exclude sensitive data
- Schema changes audited and logged

### Compliance

- GDPR compliance through data retention policies
- Audit trails for all schema modifications
- Secure backup storage with encryption

## Maintenance Schedule

### Daily

- Health monitoring reports
- Error log review
- Performance metrics collection

### Weekly

- Backup verification tests
- Migration test suite execution
- Performance baseline updates

### Monthly

- Backup cleanup and rotation
- Performance optimization review
- Security audit of database access

## Support and Documentation

### Getting Help

1. Check this documentation first
2. Review recent reports in `/reports/` directory
3. Run diagnostic commands to gather information
4. Check Railway console for deployment logs

### Reporting Issues

When reporting database issues, include:

- Output from `npm run db:validate`
- Recent health report from `npm run db:monitor`
- Railway deployment logs
- Steps to reproduce the issue

### Contributing

When adding new migrations:

1. Follow naming conventions: `NNNN_descriptive_name.sql`
2. Test with `npm run test:migration`
3. Validate with `npm run db:validate`
4. Document any breaking changes

---

This migration system is designed for production reliability and safety. Always test changes in development before deploying to production, and maintain regular backups of critical data.
