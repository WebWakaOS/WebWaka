-- Migration: 0381_workspace_upgrade_requests
-- Description: Tracks bank-transfer workspace plan upgrade requests for platform admin confirmation.
--
-- When a workspace owner calls POST /workspaces/:id/activate or /upgrade in
-- bank_transfer mode, a row is inserted here with a reference (WKUP-...).
-- The platform admin then confirms or rejects via:
--   POST /platform-admin/billing/upgrade-requests/:id/confirm
--   POST /platform-admin/billing/upgrade-requests/:id/reject
--
-- Status FSM: pending → confirmed | rejected | expired
--
-- On confirmation:
--   1. subscriptions.plan is upgraded
--   2. billing_history row is inserted
--   3. workspaces.active_layers gets 'operations' added
--   4. workspace.activated event fires
--
-- expires_at is set to 7 days from creation by default.
-- A CRON or cleanup job can sweep expired pending rows.

CREATE TABLE IF NOT EXISTS workspace_upgrade_requests (
  id               TEXT    NOT NULL PRIMARY KEY,
  workspace_id     TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  plan             TEXT    NOT NULL CHECK (plan IN ('starter','growth','enterprise')),
  amount_kobo      INTEGER NOT NULL,
  reference        TEXT    NOT NULL UNIQUE,
  requester_email  TEXT,
  status           TEXT    NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending','confirmed','rejected','expired')),
  confirmed_by     TEXT,
  rejected_by      TEXT,
  rejection_reason TEXT,
  confirmed_at     INTEGER,
  rejected_at      INTEGER,
  notes            TEXT,
  expires_at       INTEGER NOT NULL,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_wur_workspace_id
  ON workspace_upgrade_requests(workspace_id, tenant_id);

CREATE INDEX IF NOT EXISTS idx_wur_status
  ON workspace_upgrade_requests(status, expires_at)
  WHERE status = 'pending';

CREATE UNIQUE INDEX IF NOT EXISTS idx_wur_reference
  ON workspace_upgrade_requests(reference);
