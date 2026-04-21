-- Migration: 0279_hl_wallets
-- HandyLife Wallet — per-user wallet balance (denormalized read-model)
-- Balances are updated atomically alongside hl_ledger inserts.
--
-- P9: balance_kobo INTEGER — no floats, no REAL.
-- T3: tenant_id NOT NULL — all queries must include tenant_id.
-- T4: balance updated via conditional UPDATE WHERE balance_kobo >= debit_amount.
-- T7: status FSM — pending_kyc → active → frozen → closed (terminal).
-- KYC: kyc_tier drives daily transaction limits and balance cap (CBN compliance).
-- currency_code: always 'NGN' in Phase 1; column exists for Africa-First expansion.

CREATE TABLE IF NOT EXISTS hl_wallets (
  id                    TEXT NOT NULL PRIMARY KEY,       -- 'hlw_' + uuid (no dashes)
  user_id               TEXT NOT NULL,                   -- references users.id
  tenant_id             TEXT NOT NULL,                   -- T3: always scoped
  workspace_id          TEXT NOT NULL,                   -- eligibility context workspace
  balance_kobo          INTEGER NOT NULL DEFAULT 0 CHECK (balance_kobo >= 0),
  lifetime_funded_kobo  INTEGER NOT NULL DEFAULT 0 CHECK (lifetime_funded_kobo >= 0),
  lifetime_spent_kobo   INTEGER NOT NULL DEFAULT 0 CHECK (lifetime_spent_kobo >= 0),
  kyc_tier              INTEGER NOT NULL DEFAULT 1 CHECK (kyc_tier IN (1, 2, 3)),
  status                TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('pending_kyc', 'active', 'frozen', 'closed')),
  currency_code         TEXT NOT NULL DEFAULT 'NGN',
  frozen_reason         TEXT,                            -- set when status = 'frozen'
  closed_at             INTEGER,
  closed_reason         TEXT,
  created_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at            INTEGER NOT NULL DEFAULT (unixepoch())
);

-- One wallet per user per tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_hl_wallets_user_tenant
  ON hl_wallets(user_id, tenant_id);

CREATE INDEX IF NOT EXISTS idx_hl_wallets_tenant
  ON hl_wallets(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_hl_wallets_workspace
  ON hl_wallets(workspace_id, tenant_id);

CREATE INDEX IF NOT EXISTS idx_hl_wallets_status
  ON hl_wallets(status, tenant_id);
