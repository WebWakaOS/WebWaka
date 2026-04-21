-- Migration: 0280_hl_ledger
-- HandyLife Wallet Ledger — canonical append-only double-entry audit trail.
--
-- NEVER UPDATE OR DELETE rows in this table.
-- Reversals are new rows with entry_type='debit' or 'credit' and tx_type='reversal'.
-- The balance_after column is a snapshot at insert time — use hl_wallets.balance_kobo
-- for live balance; this is for audit only.
--
-- P9: amount_kobo INTEGER — positive for credit, negative for debit.
-- T3: tenant_id NOT NULL — every query scoped.
-- Idempotency: reference UNIQUE — safe to retry with same reference.
-- No updated_at column — this table is append-only.
-- Retention: 7 years (financial records — CAMA 2020 / CBN directive).

CREATE TABLE IF NOT EXISTS hl_ledger (
  id            TEXT NOT NULL PRIMARY KEY,               -- 'hll_' + uuid (no dashes)
  wallet_id     TEXT NOT NULL,                           -- references hl_wallets(id)
  user_id       TEXT NOT NULL DEFAULT '',
  tenant_id     TEXT NOT NULL,                           -- T3: always scoped
  entry_type    TEXT NOT NULL CHECK (entry_type IN ('credit', 'debit')),
  amount_kobo   INTEGER NOT NULL,                        -- positive = credit, negative = debit (P9)
  balance_after INTEGER NOT NULL,                        -- wallet.balance_kobo snapshot after this entry
  tx_type       TEXT NOT NULL CHECK (tx_type IN (
    'bank_fund',           -- offline bank transfer confirmed
    'spend',               -- payment for goods/services
    'reversal',            -- reversal of any prior entry
    'mla_credit',          -- MLA affiliate commission payout
    'admin_adjust',        -- super admin correction (requires reason)
    'refund',              -- refund of a prior spend
    'withdrawal_reserved', -- withdrawal reserve (Phase 2+)
    'transfer_out',        -- wallet-to-wallet transfer debit (Phase 2+)
    'transfer_in'          -- wallet-to-wallet transfer credit (Phase 2+)
  )),
  reference     TEXT NOT NULL UNIQUE,                    -- idempotency key
  description   TEXT NOT NULL,
  currency_code TEXT NOT NULL DEFAULT 'NGN',
  related_id    TEXT,                                    -- bank_transfer_order.id | hl_spend_event.id | etc.
  related_type  TEXT,                                    -- 'bank_transfer_order' | 'hl_spend_event' | etc.
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
  -- NO updated_at — this table is append-only, never updated
);

CREATE INDEX IF NOT EXISTS idx_hl_ledger_wallet
  ON hl_ledger(wallet_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hl_ledger_tenant
  ON hl_ledger(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hl_ledger_user
  ON hl_ledger(user_id, created_at DESC);

-- Idempotency lookup — must be fast
CREATE INDEX IF NOT EXISTS idx_hl_ledger_reference
  ON hl_ledger(reference);

CREATE INDEX IF NOT EXISTS idx_hl_ledger_related
  ON hl_ledger(related_type, related_id);
