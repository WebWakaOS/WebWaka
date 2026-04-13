-- Rollback 0218
DROP INDEX IF EXISTS idx_wd_tenant;
DROP INDEX IF EXISTS idx_wd_status;
DROP INDEX IF EXISTS idx_wd_subscription;
DROP TABLE IF EXISTS webhook_deliveries;
