-- Rollback: 0461_wave3_ai_tables
DROP INDEX IF EXISTS idx_support_tickets_tenant;
DROP TABLE IF EXISTS support_tickets;
DROP INDEX IF EXISTS idx_payment_logs_workspace;
DROP TABLE IF EXISTS payment_logs;
DROP INDEX IF EXISTS idx_ai_anomaly_flags_tenant;
DROP TABLE IF EXISTS ai_anomaly_flags;
