-- Migration: 0229_subscription_plan_history_revert_cancel
-- Description: Add 'revert_cancel' to change_type CHECK constraint
--              so cancellation reversals are recorded in the audit trail.
-- Phase 18 — Sprint 14 QA Audit Fixes
--
-- SQLite does not support ALTER TABLE to modify CHECK constraints, so we
-- recreate the table using the standard SQLite rename-copy-drop pattern.
-- Existing data is preserved.

PRAGMA foreign_keys = OFF;

-- Step 1: rename existing table
ALTER TABLE subscription_plan_history
  RENAME TO subscription_plan_history_old;

-- Step 2: create table with updated constraint
CREATE TABLE IF NOT EXISTS subscription_plan_history (
  id              TEXT NOT NULL PRIMARY KEY,
  subscription_id TEXT NOT NULL,
  workspace_id    TEXT NOT NULL,
  tenant_id       TEXT NOT NULL,
  changed_by      TEXT NOT NULL,
  previous_plan   TEXT NOT NULL,
  new_plan        TEXT NOT NULL,
  change_type     TEXT NOT NULL
                  CHECK (change_type IN ('upgrade', 'downgrade', 'cancel', 'reactivate', 'revert_cancel')),
  effective_at    INTEGER NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  notes           TEXT
);

-- Step 3: copy all existing rows
INSERT INTO subscription_plan_history
  SELECT * FROM subscription_plan_history_old;

-- Step 4: drop old table
DROP TABLE subscription_plan_history_old;

-- Step 5: recreate indexes
CREATE INDEX IF NOT EXISTS idx_sph_tenant
  ON subscription_plan_history (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sph_subscription
  ON subscription_plan_history (subscription_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sph_workspace
  ON subscription_plan_history (workspace_id, tenant_id);

PRAGMA foreign_keys = ON;
