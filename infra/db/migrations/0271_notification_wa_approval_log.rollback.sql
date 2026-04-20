-- Rollback: 0271_notification_wa_approval_log
DROP INDEX IF EXISTS idx_notif_wa_approval_tenant;
DROP INDEX IF EXISTS idx_notif_wa_approval_status;
DROP INDEX IF EXISTS idx_notif_wa_approval_template;
DROP TABLE IF EXISTS notification_wa_approval_log;
