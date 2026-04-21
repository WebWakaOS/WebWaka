-- Migration: 0248_b2b_invoices
-- Description: B2B invoice table for P25.
-- Invoices are generated from accepted POs. Stores invoice metadata for PDF generation.
-- T3: tenant-scoped. P9: all monetary values integer kobo.

CREATE TABLE IF NOT EXISTS b2b_invoices (
  id                TEXT NOT NULL PRIMARY KEY,
  purchase_order_id TEXT NOT NULL,
  tenant_id         TEXT NOT NULL,
  buyer_entity_id   TEXT NOT NULL,
  seller_entity_id  TEXT NOT NULL,
  invoice_number    TEXT NOT NULL UNIQUE,      -- e.g. INV-20260414-00001
  line_items        TEXT NOT NULL DEFAULT '[]', -- JSON array of {description, quantity, unit_price_kobo, total_kobo}
  subtotal_kobo     INTEGER NOT NULL CHECK (subtotal_kobo >= 0),
  tax_kobo          INTEGER NOT NULL DEFAULT 0 CHECK (tax_kobo >= 0),
  total_kobo        INTEGER NOT NULL CHECK (total_kobo >= 0),
  currency_code     TEXT NOT NULL DEFAULT 'NGN',
  payment_terms     TEXT NOT NULL DEFAULT 'bank_transfer',
  bank_name         TEXT,
  account_number    TEXT,
  account_name      TEXT,
  status            TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date          INTEGER,
  paid_at           INTEGER,
  pdf_url           TEXT,                       -- R2 URL of generated invoice PDF
  created_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_b2b_invoices_tenant
  ON b2b_invoices(tenant_id, status, created_at);

CREATE INDEX IF NOT EXISTS idx_b2b_invoices_po
  ON b2b_invoices(purchase_order_id);

CREATE INDEX IF NOT EXISTS idx_b2b_invoices_number
  ON b2b_invoices(invoice_number);
