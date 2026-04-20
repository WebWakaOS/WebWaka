-- Rollback: 0261_notification_digest_batch_items
DROP INDEX IF EXISTS idx_notif_ditem_tenant;
DROP INDEX IF EXISTS idx_notif_ditem_batch;
DROP TABLE IF EXISTS notification_digest_batch_item;
