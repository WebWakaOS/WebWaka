-- Rollback: 0255_notification_rules
DROP INDEX IF EXISTS idx_notif_rule_platform_event;
DROP INDEX IF EXISTS idx_notif_rule_tenant_event;
DROP INDEX IF EXISTS idx_notif_rule_event_key;
DROP TABLE IF EXISTS notification_rule;
