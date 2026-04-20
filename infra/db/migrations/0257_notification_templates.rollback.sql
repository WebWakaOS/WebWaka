-- Rollback: 0257_notification_templates
DROP INDEX IF EXISTS idx_notif_template_tenant;
DROP INDEX IF EXISTS idx_notif_template_wa_approval;
DROP INDEX IF EXISTS idx_notif_template_family;
DROP INDEX IF EXISTS idx_notif_template_active;
DROP TABLE IF EXISTS notification_template;
