-- Rollback: 0262_notification_audit_log
DROP INDEX IF EXISTS idx_notif_audit_delivery;
DROP INDEX IF EXISTS idx_notif_audit_event_type;
DROP INDEX IF EXISTS idx_notif_audit_recipient;
DROP INDEX IF EXISTS idx_notif_audit_tenant_created;
DROP TABLE IF EXISTS notification_audit_log;
