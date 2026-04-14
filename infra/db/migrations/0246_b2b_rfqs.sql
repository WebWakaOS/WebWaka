-- Migration: 0246_b2b_rfqs
-- Description: B2B Request-for-Quotation (RFQ) table for P25 — B2B Marketplace.
-- Buyers create RFQs targeting one or more sellers (via vertical category).
-- Sellers submit bids; buyer accepts the best bid. Uses @webwaka/negotiation engine.
-- T3: tenant-scoped. P9: all amounts integer kobo.

CREATE TABLE IF NOT EXISTS b2b_rfqs (
  id                TEXT NOT NULL PRIMARY KEY,
  tenant_id         TEXT NOT NULL,
  workspace_id      TEXT NOT NULL,
  buyer_entity_id   TEXT NOT NULL,
  category          TEXT NOT NULL,             -- vertical slug or product category
  title             TEXT NOT NULL,
  description       TEXT NOT NULL,
  quantity          INTEGER,
  unit              TEXT,                       -- 'kg', 'litres', 'units', etc.
  target_price_kobo INTEGER,                   -- buyer's target price (optional)
  currency_code     TEXT NOT NULL DEFAULT 'NGN',
  -- FSM state
  status            TEXT NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'bidding', 'awarded', 'closed', 'expired')),
  awarded_bid_id    TEXT,                       -- FK → b2b_rfq_bids.id
  delivery_deadline INTEGER,                    -- unixepoch of required delivery
  expires_at        INTEGER NOT NULL,           -- RFQ expires if no bid accepted
  created_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS b2b_rfq_bids (
  id              TEXT NOT NULL PRIMARY KEY,
  rfq_id          TEXT NOT NULL REFERENCES b2b_rfqs(id) ON DELETE CASCADE,
  tenant_id       TEXT NOT NULL,
  seller_entity_id TEXT NOT NULL,
  bid_amount_kobo INTEGER NOT NULL CHECK (bid_amount_kobo > 0),
  currency_code   TEXT NOT NULL DEFAULT 'NGN',
  notes           TEXT,
  status          TEXT NOT NULL DEFAULT 'submitted'
                  CHECK (status IN ('submitted', 'accepted', 'rejected', 'countered', 'withdrawn')),
  counter_amount_kobo INTEGER,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_b2b_rfqs_tenant
  ON b2b_rfqs(tenant_id, status, created_at);

CREATE INDEX IF NOT EXISTS idx_b2b_rfqs_buyer
  ON b2b_rfqs(buyer_entity_id, status);

CREATE INDEX IF NOT EXISTS idx_b2b_rfq_bids_rfq
  ON b2b_rfq_bids(rfq_id, status);

CREATE INDEX IF NOT EXISTS idx_b2b_rfq_bids_seller
  ON b2b_rfq_bids(seller_entity_id, status);
