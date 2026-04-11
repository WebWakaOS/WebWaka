-- Migration 0010 — Claim workflow tables
-- Milestone 5: Claim-First Onboarding
-- claim_requests tracks formal claim submissions from discovery → verified tenant.

CREATE TABLE IF NOT EXISTS claim_requests (
  id                  TEXT PRIMARY KEY,
  profile_id          TEXT NOT NULL REFERENCES profiles(id),
  requester_email     TEXT NOT NULL,
  requester_name      TEXT,
  status              TEXT NOT NULL DEFAULT 'pending',  -- pending|approved|rejected|expired
  verification_method TEXT,                              -- email|phone|document
  verification_data   TEXT,                              -- JSON (token + evidence)
  approved_by         TEXT REFERENCES individuals(id),
  rejection_reason    TEXT,
  expires_at          INTEGER,                           -- UNIX epoch — auto-expire after 30 days
  created_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_claim_requests_profile
  ON claim_requests(profile_id);

CREATE INDEX IF NOT EXISTS idx_claim_requests_status
  ON claim_requests(status);

CREATE INDEX IF NOT EXISTS idx_claim_requests_email
  ON claim_requests(requester_email);

CREATE INDEX IF NOT EXISTS idx_claim_requests_expires
  ON claim_requests(expires_at)
  WHERE status = 'pending';
