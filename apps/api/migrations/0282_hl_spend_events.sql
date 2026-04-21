-- Migration: 0282_hl_spend_events
-- HandyLife Wallet — records each wallet spend event linked to a vertical/order.
-- status = 'reserved': debit held pending order confirmation.
-- status = 'completed': order fulfilled.
-- status = 'reversed': order cancelled/refunded — debit reversed via hl_ledger credit.
--
-- P9: amount_kobo INTEGER. T3: tenant_id NOT NULL.
-- vertical_slug and order_type are freeform identifiers for vertical routing.

CREATE TABLE IF NOT EXISTS hl_spend_events (
  id               TEXT NOT NULL PRIMARY KEY,            -- 'hlse_' + uuid (no dashes)
  wallet_id        TEXT NOT NULL REFERENCES hl_wallets(id),
  user_id          TEXT NOT NULL,
  tenant_id        TEXT NOT NULL,                        -- T3: always scoped
  vertical_slug    TEXT,                                 -- e.g. 'cooperative', 'airtime-reseller'
  order_id         TEXT,                                 -- vertical-specific order ID
  order_type       TEXT,                                 -- e.g. 'contribution', 'airtime', 'pos_sale'
  amount_kobo      INTEGER NOT NULL CHECK (amount_kobo > 0),
  status           TEXT NOT NULL DEFAULT 'reserved'
                   CHECK (status IN ('reserved', 'completed', 'reversed', 'failed')),
  ledger_debit_id  TEXT,                                 -- hl_ledger.id for the debit entry
  ledger_refund_id TEXT,                                 -- hl_ledger.id for the reversal
  transactions_id  TEXT,                                 -- transactions.id for platform ledger
  completed_at     INTEGER,
  reversed_at      INTEGER,
  reversal_reason  TEXT,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_hl_se_wallet
  ON hl_spend_events(wallet_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hl_se_tenant
  ON hl_spend_events(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hl_se_order
  ON hl_spend_events(order_type, order_id)
  WHERE order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_hl_se_vertical
  ON hl_spend_events(vertical_slug, tenant_id)
  WHERE vertical_slug IS NOT NULL;
