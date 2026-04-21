-- Migration: 0237_bank_transfer_orders
-- Description: Bank transfer order table for P21 — Offline Bank Transfer as Default Payment.
-- Supports the full FSM lifecycle: pending → proof_submitted → confirmed | rejected | expired.
-- T3: All queries tenant-scoped via workspace_id + tenant_id.
-- P9: All monetary values stored as integer kobo/smallest unit.

CREATE TABLE IF NOT EXISTS bank_transfer_orders (
  id                TEXT NOT NULL PRIMARY KEY,
  workspace_id      TEXT NOT NULL,
  tenant_id         TEXT NOT NULL,
  buyer_id          TEXT,                      -- NULL for walk-in / anonymous buyers
  seller_entity_id  TEXT NOT NULL,
  amount_kobo       INTEGER NOT NULL CHECK (amount_kobo > 0),
  currency_code     TEXT NOT NULL DEFAULT 'NGN',
  reference         TEXT NOT NULL UNIQUE,      -- human-readable, e.g. WKA-20260414-ABCDE
  -- Bank details (seller's account or Paystack Virtual Account)
  bank_name         TEXT,
  account_number    TEXT,
  account_name      TEXT,
  -- FSM state
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'proof_submitted', 'confirmed', 'rejected', 'expired')),
  -- Proof of payment (R2 URL)
  proof_url         TEXT,
  proof_submitted_at INTEGER,
  -- Confirmation
  confirmed_at      INTEGER,
  confirmed_by      TEXT,                      -- userId of seller/admin who confirmed
  rejection_reason  TEXT,
  -- Expiry (default 48h from creation)
  expires_at        INTEGER NOT NULL,
  created_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_bank_transfer_workspace
  ON bank_transfer_orders(workspace_id, tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_bank_transfer_reference
  ON bank_transfer_orders(reference);

CREATE INDEX IF NOT EXISTS idx_bank_transfer_expires
  ON bank_transfer_orders(expires_at) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_bank_transfer_buyer
  ON bank_transfer_orders(buyer_id, workspace_id) WHERE buyer_id IS NOT NULL;
