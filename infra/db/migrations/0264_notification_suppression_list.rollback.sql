-- Rollback: 0264_notification_suppression_list
DROP INDEX IF EXISTS idx_notif_suppress_expires;
DROP INDEX IF EXISTS idx_notif_suppress_tenant;
DROP INDEX IF EXISTS idx_notif_suppress_lookup;
DROP INDEX IF EXISTS idx_notif_suppress_unique;
DROP TABLE IF EXISTS notification_suppression_list;
