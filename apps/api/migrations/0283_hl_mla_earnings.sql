-- Migration: 0283_hl_mla_earnings
-- HandyLife Wallet — Multi-Level Affiliate (MLA) commission tracking.
-- Phase 1: status stays 'pending' — not credited to wallet.
-- Phase 2+: batch settlement CRON credits to hl_wallets via creditMlaEarning().
--
-- commission_bps: basis points of transacted amount (500 = 5%).
-- commission_kobo = FLOOR(base_amount_kobo * commission_bps / 10000).
-- P9: commission_kobo and base_amount_kobo are INTEGER. T3: tenant_id NOT NULL.
-- referral_level: 1 = direct referral, 2 = second tier, 3 = third tier.

CREATE TABLE IF NOT EXISTS hl_mla_earnings (
  id                    TEXT NOT NULL PRIMARY KEY,       -- 'hlmla_' + uuid (no dashes)
  wallet_id             TEXT NOT NULL REFERENCES hl_wallets(id),
  earner_user_id        TEXT NOT NULL,                   -- user earning the commission
  tenant_id             TEXT NOT NULL,                   -- T3: always scoped
  source_vertical       TEXT,                            -- vertical slug that generated commission
  source_order_id       TEXT,                            -- vertical order/contribution ID
  source_spend_event_id TEXT,                            -- hl_spend_events.id (qualifying spend)
  referral_level        INTEGER NOT NULL DEFAULT 1 CHECK (referral_level IN (1, 2, 3)),
  commission_bps        INTEGER NOT NULL CHECK (commission_bps >= 0 AND commission_bps <= 10000),
  commission_kobo       INTEGER NOT NULL CHECK (commission_kobo >= 0),
  base_amount_kobo      INTEGER NOT NULL CHECK (base_amount_kobo > 0),
  status                TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'payable', 'credited', 'voided')),
  period_start          TEXT,                            -- ISO date YYYY-MM-DD for batch settlement
  period_end            TEXT,
  ledger_entry_id       TEXT,                            -- hl_ledger.id once credited
  credited_at           INTEGER,
  voided_at             INTEGER,
  void_reason           TEXT,
  created_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at            INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_hl_mla_wallet
  ON hl_mla_earnings(wallet_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hl_mla_tenant
  ON hl_mla_earnings(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_hl_mla_earner
  ON hl_mla_earnings(earner_user_id, status);

CREATE INDEX IF NOT EXISTS idx_hl_mla_pending
  ON hl_mla_earnings(tenant_id, status, created_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_hl_mla_period
  ON hl_mla_earnings(tenant_id, period_start, status)
  WHERE period_start IS NOT NULL;
