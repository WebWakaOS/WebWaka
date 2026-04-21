-- Migration 0215: Template purchases + revenue splits (MON-01, MON-02)
-- Implements Paystack-gated purchase flow for paid templates.
-- Revenue split: 70% author / 30% platform on every template sale.
--
-- P9: all monetary amounts stored as integer kobo (NGN × 100)
-- T3: tenant_id on all rows and queries

CREATE TABLE IF NOT EXISTS template_purchases (
  id              TEXT    NOT NULL PRIMARY KEY,
  tenant_id       TEXT    NOT NULL,
  template_id     TEXT    NOT NULL REFERENCES template_registry(id),
  paystack_ref    TEXT    NOT NULL UNIQUE,
  amount_kobo     INTEGER NOT NULL CHECK (amount_kobo > 0),
  status          TEXT    NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','paid','failed','refunded')),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  paid_at         INTEGER
);

CREATE INDEX IF NOT EXISTS idx_template_purchases_tenant
  ON template_purchases(tenant_id, template_id, status);

CREATE INDEX IF NOT EXISTS idx_template_purchases_ref
  ON template_purchases(paystack_ref);

-- Revenue split ledger — immutable record of each sale split
CREATE TABLE IF NOT EXISTS revenue_splits (
  id                TEXT    NOT NULL PRIMARY KEY,
  purchase_id       TEXT    NOT NULL REFERENCES template_purchases(id),
  template_id       TEXT    NOT NULL REFERENCES template_registry(id),
  author_tenant_id  TEXT    NOT NULL,
  gross_kobo        INTEGER NOT NULL CHECK (gross_kobo > 0),
  platform_fee_kobo INTEGER NOT NULL CHECK (platform_fee_kobo >= 0),
  author_share_kobo INTEGER NOT NULL CHECK (author_share_kobo >= 0),
  -- Invariant: platform_fee + author_share = gross
  recorded_at       INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_revenue_splits_author
  ON revenue_splits(author_tenant_id);

CREATE INDEX IF NOT EXISTS idx_revenue_splits_purchase
  ON revenue_splits(purchase_id);

CREATE INDEX IF NOT EXISTS idx_revenue_splits_template
  ON revenue_splits(template_id);
