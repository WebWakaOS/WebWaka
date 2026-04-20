-- Rollback: 0254_notification_events
DROP INDEX IF EXISTS idx_notif_event_tenant_created;
DROP INDEX IF EXISTS idx_notif_event_source;
DROP INDEX IF EXISTS idx_notif_event_created_at;
DROP INDEX IF EXISTS idx_notif_event_aggregate;
DROP INDEX IF EXISTS idx_notif_event_tenant_key;
DROP TABLE IF EXISTS notification_event;
