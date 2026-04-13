-- Migration: 0222_partner_revenue_share
-- Description: Partner settlements table for M11 Partner & White-Label Phase 3.
-- Governance: partner-and-subpartner-model.md Phase 3
-- Invariant: P9 (all amounts INTEGER kobo — never REAL), T3, SEC

-- partner_settlements tracks periodic revenue-share settlements between
-- WebWaka platform and its partners. One row per settlement period per partner.

CREATE TABLE IF NOT EXISTS partner_settlements (
  id                  TEXT NOT NULL PRIMARY KEY,
  partner_id          TEXT NOT NULL REFERENCES partners(id),
  period_start        TEXT NOT NULL,        -- ISO date YYYY-MM-DD
  period_end          TEXT NOT NULL,        -- ISO date YYYY-MM-DD
  gross_gmv_kobo      INTEGER NOT NULL DEFAULT 0 CHECK (gross_gmv_kobo >= 0),
  platform_fee_kobo   INTEGER NOT NULL DEFAULT 0 CHECK (platform_fee_kobo >= 0),
  partner_share_kobo  INTEGER NOT NULL DEFAULT 0 CHECK (partner_share_kobo >= 0),
  share_basis_points  INTEGER NOT NULL DEFAULT 0 CHECK (share_basis_points >= 0 AND share_basis_points <= 10000),
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'approved', 'paid', 'disputed', 'cancelled')),
  calculated_by       TEXT NOT NULL,        -- user_id of actor who ran calculation
  calculated_at       TEXT NOT NULL DEFAULT (datetime('now')),
  approved_by         TEXT,
  approved_at         TEXT,
  paid_at             TEXT,
  notes               TEXT,
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_partner_settlements_partner_id
  ON partner_settlements (partner_id, period_start DESC);

CREATE INDEX IF NOT EXISTS idx_partner_settlements_status
  ON partner_settlements (status);
