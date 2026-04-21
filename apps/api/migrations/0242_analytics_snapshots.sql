-- Migration: 0242_analytics_snapshots
-- Description: Pre-computed daily analytics snapshots for P23 — Analytics Dashboard.
-- The projections CRON computes daily snapshots; the analytics API reads from here
-- for fast historical queries rather than aggregating live transaction data.
-- T3: scoped by tenant_id + workspace_id.
-- P9: all monetary values in integer kobo.

CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id                      TEXT NOT NULL PRIMARY KEY,
  tenant_id               TEXT NOT NULL,
  workspace_id            TEXT NOT NULL,
  snapshot_date           TEXT NOT NULL,     -- YYYY-MM-DD
  period_type             TEXT NOT NULL DEFAULT 'day'
                          CHECK (period_type IN ('day', 'week', 'month')),
  total_orders            INTEGER NOT NULL DEFAULT 0,
  total_revenue_kobo      INTEGER NOT NULL DEFAULT 0,
  unique_customers        INTEGER NOT NULL DEFAULT 0,
  new_customers           INTEGER NOT NULL DEFAULT 0,
  top_vertical            TEXT,
  payment_cash_kobo       INTEGER NOT NULL DEFAULT 0,
  payment_card_kobo       INTEGER NOT NULL DEFAULT 0,
  payment_transfer_kobo   INTEGER NOT NULL DEFAULT 0,
  payment_ussd_kobo       INTEGER NOT NULL DEFAULT 0,
  computed_at             TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_snapshot_unique
  ON analytics_snapshots(tenant_id, workspace_id, snapshot_date, period_type);

CREATE INDEX IF NOT EXISTS idx_analytics_snapshot_lookup
  ON analytics_snapshots(tenant_id, workspace_id, period_type, snapshot_date);
