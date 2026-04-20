-- Rollback: 0263_notification_subscriptions
DROP INDEX IF EXISTS idx_notif_sub_unsubscribed;
DROP INDEX IF EXISTS idx_notif_sub_user;
DROP INDEX IF EXISTS idx_notif_sub_unique;
DROP TABLE IF EXISTS notification_subscription;
