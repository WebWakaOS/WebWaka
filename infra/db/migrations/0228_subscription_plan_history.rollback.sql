-- Rollback: 0228_subscription_plan_history
DROP INDEX IF EXISTS idx_sph_workspace;
DROP INDEX IF EXISTS idx_sph_subscription;
DROP INDEX IF EXISTS idx_sph_tenant;
DROP TABLE IF EXISTS subscription_plan_history;
