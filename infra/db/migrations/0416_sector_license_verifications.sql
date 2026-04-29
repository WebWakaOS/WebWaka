-- Migration 0416: Sector License Verifications
--
-- Stores regulatory license/registration submissions from compliance-gated
-- workspaces (hospital, university, diagnostic-lab, microfinance-bank,
-- insurance-company, pension-fund, stockbroker). Platform super_admins
-- review and approve/reject each submission.
--
-- Status FSM:
--   pending_review → verified | rejected | expired
--   rejected       → pending_review (re-submission via INSERT OR REPLACE)
--
-- T3 invariant: all queries must be scoped to workspace_id from JWT (never user input).
-- UNIQUE(workspace_id, vertical_slug, regulatory_body) ensures one active row
-- per regulatory body per workspace — idempotent resubmission via INSERT OR REPLACE.

CREATE TABLE IF NOT EXISTS sector_license_verifications (
  id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id      TEXT NOT NULL,
  vertical_slug     TEXT NOT NULL
                    CHECK (vertical_slug IN (
                      'hospital', 'university', 'diagnostic-lab',
                      'microfinance-bank', 'insurance-company',
                      'pension-fund', 'stockbroker'
                    )),
  regulatory_body   TEXT NOT NULL,
  license_number    TEXT NOT NULL,
  license_class     TEXT,
  status            TEXT NOT NULL DEFAULT 'pending_review'
                    CHECK (status IN ('pending_review', 'verified', 'rejected', 'expired')),
  rejection_reason  TEXT,
  submitted_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  reviewed_at       INTEGER,
  reviewed_by       TEXT,
  expires_at        INTEGER,
  created_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(workspace_id, vertical_slug, regulatory_body)
);

CREATE INDEX IF NOT EXISTS idx_slv_workspace
  ON sector_license_verifications(workspace_id);

CREATE INDEX IF NOT EXISTS idx_slv_status
  ON sector_license_verifications(status);

CREATE INDEX IF NOT EXISTS idx_slv_vertical
  ON sector_license_verifications(vertical_slug);

CREATE INDEX IF NOT EXISTS idx_slv_reviewed_at
  ON sector_license_verifications(reviewed_at);
