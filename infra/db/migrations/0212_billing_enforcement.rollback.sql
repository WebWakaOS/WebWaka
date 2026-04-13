-- Rollback: 0212_billing_enforcement
-- Removes billing enforcement columns and usage_snapshots table.
-- NOTE: SQLite does not support DROP COLUMN before 3.35.0.
-- For D1 (SQLite 3.39+), ALTER TABLE ... DROP COLUMN works.

DROP INDEX IF EXISTS idx_subscriptions_grace_period;
DROP INDEX IF EXISTS idx_subscriptions_enforcement;
DROP INDEX IF EXISTS idx_usage_snapshots_tenant;
DROP INDEX IF EXISTS idx_usage_snapshots_workspace;
DROP TABLE IF EXISTS usage_snapshots;

ALTER TABLE subscriptions DROP COLUMN last_enforcement_at;
ALTER TABLE subscriptions DROP COLUMN enforcement_status;
ALTER TABLE subscriptions DROP COLUMN grace_period_end;
