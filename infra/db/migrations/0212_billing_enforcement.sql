-- Migration: 0212_billing_enforcement
-- Sprint 7 / PROD-09: Billing enforcement engine
-- Adds grace period and enforcement tracking to subscriptions.
-- Adds usage snapshots for plan limit enforcement.

ALTER TABLE subscriptions ADD COLUMN grace_period_end INTEGER;
ALTER TABLE subscriptions ADD COLUMN enforcement_status TEXT NOT NULL DEFAULT 'none'
  CHECK (enforcement_status IN ('none', 'warning_sent', 'grace_period', 'suspended', 'terminated'));
ALTER TABLE subscriptions ADD COLUMN last_enforcement_at INTEGER;

CREATE TABLE IF NOT EXISTS usage_snapshots (
  id            TEXT NOT NULL PRIMARY KEY,
  tenant_id     TEXT NOT NULL,
  workspace_id  TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  snapshot_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  member_count  INTEGER NOT NULL DEFAULT 0,
  place_count   INTEGER NOT NULL DEFAULT 0,
  offering_count INTEGER NOT NULL DEFAULT 0,
  plan          TEXT NOT NULL,
  within_limits INTEGER NOT NULL DEFAULT 1,  -- SQLite boolean
  overage_details TEXT NOT NULL DEFAULT '{}' -- JSON: which limits exceeded
);

CREATE INDEX IF NOT EXISTS idx_usage_snapshots_workspace
  ON usage_snapshots(workspace_id, snapshot_at DESC);

CREATE INDEX IF NOT EXISTS idx_usage_snapshots_tenant
  ON usage_snapshots(tenant_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_enforcement
  ON subscriptions(enforcement_status)
  WHERE enforcement_status != 'none';

CREATE INDEX IF NOT EXISTS idx_subscriptions_grace_period
  ON subscriptions(grace_period_end)
  WHERE grace_period_end IS NOT NULL;
