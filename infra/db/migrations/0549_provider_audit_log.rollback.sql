-- Rollback: 0549_provider_audit_log
DROP INDEX IF EXISTS idx_provider_audit_log_time;
DROP INDEX IF EXISTS idx_provider_audit_log_actor;
DROP INDEX IF EXISTS idx_provider_audit_log_provider;
DROP TABLE IF EXISTS provider_audit_log;
