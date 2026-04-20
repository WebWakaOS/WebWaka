-- Rollback: 0256_notification_preferences
DROP INDEX IF EXISTS idx_notif_pref_user;
DROP INDEX IF EXISTS idx_notif_pref_tenant_channel;
DROP INDEX IF EXISTS idx_notif_pref_scope;
DROP TABLE IF EXISTS notification_preference;
