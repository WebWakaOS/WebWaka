-- Migration 0043: WakaCU wallets + transactions
-- (SA-1.5 — TDR-0009, Platform Invariant P9)
--
-- Double-entry credit ledger for the WakaCU AI credit system.
-- P9: ALL amounts are INTEGER (WakaCU units). Never use REAL for balances.
--
-- wc_wallets    — one row per tenant; current balance + spend tracking
-- wc_transactions — append-only ledger; one row per balance change

-- ─── Wallets ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wc_wallets (
  tenant_id                TEXT PRIMARY KEY,
  balance_wc               INTEGER NOT NULL DEFAULT 0 CHECK (balance_wc >= 0),
  lifetime_purchased_wc    INTEGER NOT NULL DEFAULT 0,
  lifetime_spent_wc        INTEGER NOT NULL DEFAULT 0,
  spend_cap_monthly_wc     INTEGER NOT NULL DEFAULT 1000, -- 0 = unlimited
  current_month_spent_wc   INTEGER NOT NULL DEFAULT 0,
  spend_cap_reset_at       TEXT NOT NULL,                 -- ISO date YYYY-MM-DD
  updated_at               TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Transactions ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wc_transactions (
  id               TEXT PRIMARY KEY,
  tenant_id        TEXT NOT NULL,
  type             TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'refund', 'adjustment')),
  amount_wc        INTEGER NOT NULL,        -- positive for credit, negative for debit
  balance_after_wc INTEGER NOT NULL,        -- running balance snapshot (P9 integrity)
  description      TEXT NOT NULL,
  reference_id     TEXT,                    -- ai_usage_events.id for debits, paystack ref for credits
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (tenant_id) REFERENCES wc_wallets (tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_wc_transactions_tenant
  ON wc_transactions (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wc_transactions_reference
  ON wc_transactions (reference_id)
  WHERE reference_id IS NOT NULL;
