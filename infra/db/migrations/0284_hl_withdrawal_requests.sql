-- Migration: 0284_hl_withdrawal_requests
-- HandyLife Wallet — withdrawal requests from wallet to bank account.
-- PHASE 1: ALL inserts are rejected by route layer (feature flag wallet:flag:withdrawals_enabled = '0').
-- This table is CREATED NOW so the schema is ready; no data will be written in Phase 1.
-- Phase 2+: Paystack Transfers API or NIBSS direct debit.
--
-- P9: amount_kobo INTEGER. T3: tenant_id NOT NULL.
-- reference UNIQUE: idempotency key prevents duplicate withdrawal attempts.

CREATE TABLE IF NOT EXISTS hl_withdrawal_requests (
  id               TEXT NOT NULL PRIMARY KEY,            -- 'hlwr_' + uuid (no dashes)
  wallet_id        TEXT NOT NULL REFERENCES hl_wallets(id),
  user_id          TEXT NOT NULL,
  tenant_id        TEXT NOT NULL,                        -- T3: always scoped
  amount_kobo      INTEGER NOT NULL CHECK (amount_kobo > 0),
  bank_code        TEXT NOT NULL,
  account_number   TEXT NOT NULL,
  account_name     TEXT NOT NULL,
  paystack_recipient_code TEXT,                          -- Paystack Transfer recipient code
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'cancelled')),
  reference        TEXT NOT NULL UNIQUE,                 -- idempotency key
  provider_ref     TEXT,                                 -- Paystack transfer reference
  rejection_reason TEXT,
  completed_at     INTEGER,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_hl_wr_wallet
  ON hl_withdrawal_requests(wallet_id, status);

CREATE INDEX IF NOT EXISTS idx_hl_wr_tenant
  ON hl_withdrawal_requests(tenant_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hl_wr_pending
  ON hl_withdrawal_requests(status, created_at)
  WHERE status IN ('pending', 'processing');
