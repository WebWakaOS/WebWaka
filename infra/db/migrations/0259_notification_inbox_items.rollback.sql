-- Rollback: 0259_notification_inbox_items
DROP INDEX IF EXISTS idx_notif_inbox_expires;
DROP INDEX IF EXISTS idx_notif_inbox_tenant_created;
DROP INDEX IF EXISTS idx_notif_inbox_unread;
DROP INDEX IF EXISTS idx_notif_inbox_user;
DROP TABLE IF EXISTS notification_inbox_item;
