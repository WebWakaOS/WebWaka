-- Migration: 0223_partner_credit_allocations
-- Description: Partner-to-sub-tenant WakaCU credit allocations for M11 Phase 3.
-- Governance: partner-and-subpartner-model.md Phase 3
-- Invariant: P9 (amounts INTEGER WakaCU units — never REAL), T3, SEC

-- partner_credit_allocations records every credit transfer from a partner's
-- WC pool to one of its sub-tenant workspaces.  The actual balance changes
-- happen via wc_wallets + wc_transactions (migration 0043).

CREATE TABLE IF NOT EXISTS partner_credit_allocations (
  id                TEXT NOT NULL PRIMARY KEY,
  partner_id        TEXT NOT NULL REFERENCES partners(id),
  recipient_tenant  TEXT NOT NULL,    -- sub-tenant receiving the credits
  amount_wc         INTEGER NOT NULL CHECK (amount_wc > 0),
  note              TEXT,
  allocated_by      TEXT NOT NULL,    -- user_id of the partner admin
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_pca_partner_id
  ON partner_credit_allocations (partner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pca_recipient
  ON partner_credit_allocations (recipient_tenant, created_at DESC);
