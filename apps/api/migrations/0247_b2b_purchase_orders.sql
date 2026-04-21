-- Migration: 0247_b2b_purchase_orders
-- Description: B2B Purchase Order (PO) table for P25.
-- Created when a buyer accepts a bid on an RFQ. Tracks fulfillment lifecycle.
-- T3: tenant-scoped. P9: all monetary values integer kobo.

CREATE TABLE IF NOT EXISTS b2b_purchase_orders (
  id              TEXT NOT NULL PRIMARY KEY,
  rfq_id          TEXT NOT NULL,
  bid_id          TEXT NOT NULL,
  tenant_id       TEXT NOT NULL,
  buyer_entity_id TEXT NOT NULL,
  seller_entity_id TEXT NOT NULL,
  amount_kobo     INTEGER NOT NULL CHECK (amount_kobo > 0),
  currency_code   TEXT NOT NULL DEFAULT 'NGN',
  payment_method  TEXT NOT NULL DEFAULT 'bank_transfer'
                  CHECK (payment_method IN ('bank_transfer', 'card', 'cash')),
  bank_transfer_order_id TEXT,                 -- FK → bank_transfer_orders.id if paid via bank transfer
  -- FSM
  status          TEXT NOT NULL DEFAULT 'created'
                  CHECK (status IN (
                    'rfq_accepted', 'po_created', 'in_fulfillment',
                    'delivered', 'invoiced', 'paid', 'disputed', 'cancelled'
                  )),
  delivery_confirmed_at INTEGER,
  delivery_confirmed_by TEXT,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_b2b_po_tenant
  ON b2b_purchase_orders(tenant_id, status, created_at);

CREATE INDEX IF NOT EXISTS idx_b2b_po_buyer
  ON b2b_purchase_orders(buyer_entity_id, status);

CREATE INDEX IF NOT EXISTS idx_b2b_po_seller
  ON b2b_purchase_orders(seller_entity_id, status);
