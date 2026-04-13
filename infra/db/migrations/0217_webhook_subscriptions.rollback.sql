-- Rollback 0217
DROP INDEX IF EXISTS idx_ws_active;
DROP INDEX IF EXISTS idx_ws_workspace;
DROP TABLE IF EXISTS webhook_subscriptions;
