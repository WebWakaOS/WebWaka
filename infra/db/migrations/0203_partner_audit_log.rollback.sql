-- Rollback: 0203_partner_audit_log
-- Drops the partner_audit_log table and its indexes.

DROP INDEX IF EXISTS idx_partner_audit_log_created_at;
DROP INDEX IF EXISTS idx_partner_audit_log_action;
DROP INDEX IF EXISTS idx_partner_audit_log_actor_id;
DROP INDEX IF EXISTS idx_partner_audit_log_partner_id;
DROP TABLE IF EXISTS partner_audit_log;
