-- Rollback: 0258_notification_deliveries
DROP INDEX IF EXISTS idx_notif_delivery_tenant_created;
DROP INDEX IF EXISTS idx_notif_delivery_dead_lettered;
DROP INDEX IF EXISTS idx_notif_delivery_created_at;
DROP INDEX IF EXISTS idx_notif_delivery_recipient;
DROP INDEX IF EXISTS idx_notif_delivery_tenant_status;
DROP INDEX IF EXISTS idx_notif_delivery_event;
DROP TABLE IF EXISTS notification_delivery;
