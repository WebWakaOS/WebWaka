-- Migration: 0281_hl_funding_requests
-- HandyLife Wallet — links a wallet to a bank_transfer_order for funding.
-- bank_transfer_orders (migration 0237) handles the full FSM + proof + disputes.
-- This table is the join: hl_wallets ↔ bank_transfer_orders.
-- When bank_transfer_order.status = 'confirmed', confirmFunding() credits hl_wallets.
--
-- HITL: If amount >= hitl_threshold_kobo (KV), hitl_required = 1.
-- Credit only happens after HITL approval when hitl_required = 1.
-- P9: amount_kobo INTEGER. T3: tenant_id NOT NULL.

CREATE TABLE IF NOT EXISTS hl_funding_requests (
  id                    TEXT NOT NULL PRIMARY KEY,       -- 'hlfr_' + uuid (no dashes)
  wallet_id             TEXT NOT NULL REFERENCES hl_wallets(id),
  user_id               TEXT NOT NULL,
  tenant_id             TEXT NOT NULL,                   -- T3: always scoped
  bank_transfer_order_id TEXT NOT NULL UNIQUE REFERENCES bank_transfer_orders(id),
  amount_kobo           INTEGER NOT NULL CHECK (amount_kobo > 0),
  status                TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'confirmed', 'rejected', 'expired', 'reversed')),
  ledger_entry_id       TEXT,                            -- hl_ledger.id once credited
  confirmed_at          INTEGER,
  confirmed_by          TEXT,                            -- user_id of admin who confirmed
  rejection_reason      TEXT,
  hitl_required         INTEGER NOT NULL DEFAULT 0       -- 1 if above hitl_threshold_kobo
                        CHECK (hitl_required IN (0, 1)),
  hitl_queue_item_id    TEXT,                            -- hitl queue item if hitl_required = 1
  created_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at            INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_hl_fr_wallet
  ON hl_funding_requests(wallet_id, status);

CREATE INDEX IF NOT EXISTS idx_hl_fr_tenant
  ON hl_funding_requests(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hl_fr_pending
  ON hl_funding_requests(status, created_at)
  WHERE status = 'pending';
