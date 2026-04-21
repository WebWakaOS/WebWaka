-- Migration: 0228_subscription_plan_history
-- Description: Track plan change history for auditing and dispute resolution (MON-05)
-- Phase 17 / Sprint 14 — Subscription Management

CREATE TABLE IF NOT EXISTS subscription_plan_history (
  id              TEXT NOT NULL PRIMARY KEY,
  subscription_id TEXT NOT NULL,
  workspace_id    TEXT NOT NULL,
  tenant_id       TEXT NOT NULL,
  changed_by      TEXT NOT NULL,           -- userId of actor
  previous_plan   TEXT NOT NULL,
  new_plan        TEXT NOT NULL,
  change_type     TEXT NOT NULL            -- 'upgrade' | 'downgrade' | 'cancel' | 'reactivate'
                  CHECK (change_type IN ('upgrade', 'downgrade', 'cancel', 'reactivate')),
  effective_at    INTEGER NOT NULL,        -- unixepoch() when change takes effect
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  notes           TEXT                     -- optional human-readable context
);

CREATE INDEX IF NOT EXISTS idx_sph_tenant
  ON subscription_plan_history (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sph_subscription
  ON subscription_plan_history (subscription_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sph_workspace
  ON subscription_plan_history (workspace_id, tenant_id);
