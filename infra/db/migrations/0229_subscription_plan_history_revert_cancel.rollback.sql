-- Rollback: 0229_subscription_plan_history_revert_cancel
-- Removes 'revert_cancel' from change_type CHECK constraint.
-- Rows with change_type = 'revert_cancel' are deleted before the constraint
-- is re-applied to avoid violating the original schema.

PRAGMA foreign_keys = OFF;

ALTER TABLE subscription_plan_history
  RENAME TO subscription_plan_history_v229;

CREATE TABLE IF NOT EXISTS subscription_plan_history (
  id              TEXT NOT NULL PRIMARY KEY,
  subscription_id TEXT NOT NULL,
  workspace_id    TEXT NOT NULL,
  tenant_id       TEXT NOT NULL,
  changed_by      TEXT NOT NULL,
  previous_plan   TEXT NOT NULL,
  new_plan        TEXT NOT NULL,
  change_type     TEXT NOT NULL
                  CHECK (change_type IN ('upgrade', 'downgrade', 'cancel', 'reactivate')),
  effective_at    INTEGER NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  notes           TEXT
);

INSERT INTO subscription_plan_history
  SELECT * FROM subscription_plan_history_v229
  WHERE change_type != 'revert_cancel';

DROP TABLE subscription_plan_history_v229;

CREATE INDEX IF NOT EXISTS idx_sph_tenant
  ON subscription_plan_history (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sph_subscription
  ON subscription_plan_history (subscription_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sph_workspace
  ON subscription_plan_history (workspace_id, tenant_id);

PRAGMA foreign_keys = ON;
