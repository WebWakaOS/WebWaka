-- Rollback: 0260_notification_digest_batches
DROP INDEX IF EXISTS idx_notif_digest_batch_tenant_created;
DROP INDEX IF EXISTS idx_notif_digest_batch_user;
DROP INDEX IF EXISTS idx_notif_digest_batch_pending;
DROP TABLE IF EXISTS notification_digest_batch;
