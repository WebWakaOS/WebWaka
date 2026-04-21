-- Migration: 0285_hl_transfer_requests
-- HandyLife Wallet — wallet-to-wallet transfer within WebWaka ecosystem.
-- PHASE 1: ALL inserts are rejected by route layer (feature flag wallet:flag:transfers_enabled = '0').
-- This table is CREATED NOW so the schema is ready; no data will be written in Phase 1.
-- Phase 2+: Atomic double-ledger-entry (debit sender, credit receiver) in a single DB batch.
--
-- T3: transfers within same tenant_id only (cross-tenant requires CBN sign-off).
-- P9: amount_kobo INTEGER. reference UNIQUE: idempotency key.

CREATE TABLE IF NOT EXISTS hl_transfer_requests (
  id              TEXT NOT NULL PRIMARY KEY,             -- 'hltx_' + uuid (no dashes)
  from_wallet_id  TEXT NOT NULL REFERENCES hl_wallets(id),
  to_wallet_id    TEXT NOT NULL REFERENCES hl_wallets(id),
  from_user_id    TEXT NOT NULL,
  to_user_id      TEXT NOT NULL,
  tenant_id       TEXT NOT NULL,                         -- T3: same-tenant transfers only
  amount_kobo     INTEGER NOT NULL CHECK (amount_kobo > 0),
  reference       TEXT NOT NULL UNIQUE,                  -- idempotency key
  description     TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'completed', 'reversed', 'rejected')),
  from_ledger_id  TEXT,                                  -- hl_ledger.id for debit
  to_ledger_id    TEXT,                                  -- hl_ledger.id for credit
  completed_at    INTEGER,
  reversal_reason TEXT,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_hl_tr_from
  ON hl_transfer_requests(from_wallet_id, status);

CREATE INDEX IF NOT EXISTS idx_hl_tr_to
  ON hl_transfer_requests(to_wallet_id, status);

CREATE INDEX IF NOT EXISTS idx_hl_tr_tenant
  ON hl_transfer_requests(tenant_id, created_at DESC);
