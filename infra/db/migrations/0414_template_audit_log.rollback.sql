-- Rollback for 0414_template_audit_log
DROP INDEX IF EXISTS idx_template_audit_changed_at;
DROP INDEX IF EXISTS idx_template_audit_template_id;
DROP TABLE IF EXISTS template_audit_log;
