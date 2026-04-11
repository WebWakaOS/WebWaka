-- Migration 0044: Partner credit pools
-- (SA-1.6 — TDR-0009, Platform Invariant P9)
--
-- Partners (whiteLabelDepth ≥ 1) may allocate WakaCU from their own wallet
-- to sub-tenants as subsidised AI credits.
--
-- When a beneficiary tenant runs AI features, the burn engine checks this
-- table first (pool balance) before charging the tenant's own wallet.
--
-- P9: ALL amounts are INTEGER (WakaCU). Never use REAL.
-- T3: partner_tenant_id + beneficiary_tenant_id are both scoped.

CREATE TABLE IF NOT EXISTS partner_credit_pools (
  id                    TEXT PRIMARY KEY,
  partner_tenant_id     TEXT NOT NULL,        -- the partner granting credits
  beneficiary_tenant_id TEXT NOT NULL,        -- the sub-tenant receiving credits
  allocated_wc          INTEGER NOT NULL CHECK (allocated_wc > 0),  -- total granted
  used_wc               INTEGER NOT NULL DEFAULT 0 CHECK (used_wc >= 0),
  expires_at            TEXT,                 -- NULL = no expiry
  created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Find active pools for a beneficiary (used by burn engine)
CREATE INDEX IF NOT EXISTS idx_partner_pools_beneficiary
  ON partner_credit_pools (beneficiary_tenant_id, expires_at);

-- List pools granted by a partner
CREATE INDEX IF NOT EXISTS idx_partner_pools_partner
  ON partner_credit_pools (partner_tenant_id, created_at DESC);

-- Constraint: remaining balance must never go negative (enforced in app code)
-- Partial check: used_wc <= allocated_wc is enforced by the consume() method
