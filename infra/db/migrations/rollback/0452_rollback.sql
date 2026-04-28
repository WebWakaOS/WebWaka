-- Rollback 0452: Data Retention Scheduler (Phase 5 E30)

DELETE FROM scheduled_jobs WHERE name = 'pii-data-retention';
DROP INDEX IF EXISTS idx_data_retention_log_run_at;
DROP TABLE IF EXISTS data_retention_log;
