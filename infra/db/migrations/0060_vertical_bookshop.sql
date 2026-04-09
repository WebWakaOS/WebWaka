-- Migration 0060: Bookshop / Stationery Store vertical
-- Platform Invariants: P9 (kobo integers), T3 (tenant_id NOT NULL on every table)
-- M9 — Commerce P2 Batch 1 (Set A, Task V-COMM-EXT-A4)

CREATE TABLE IF NOT EXISTS bookshop_profiles (
  id           TEXT    PRIMARY KEY,
  workspace_id TEXT    REFERENCES workspaces(id),
  tenant_id    TEXT    NOT NULL,
  shop_name    TEXT    NOT NULL,
  cac_number   TEXT,
  state        TEXT    NOT NULL,
  lga          TEXT    NOT NULL,
  status       TEXT    NOT NULL DEFAULT 'seeded',
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_bkshop_tenant ON bookshop_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bkshop_status ON bookshop_profiles(status);

CREATE TABLE IF NOT EXISTS bookshop_catalogue (
  id               TEXT    PRIMARY KEY,
  workspace_id     TEXT    REFERENCES workspaces(id),
  tenant_id        TEXT    NOT NULL,
  isbn             TEXT,
  title            TEXT    NOT NULL,
  author           TEXT,
  publisher        TEXT,
  category         TEXT    NOT NULL DEFAULT 'novel',  -- textbook/novel/religious/stationery
  unit_price_kobo  INTEGER NOT NULL,                  -- P9
  quantity_in_stock INTEGER NOT NULL DEFAULT 0,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_bkcat_tenant ON bookshop_catalogue(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bkcat_isbn   ON bookshop_catalogue(isbn);

CREATE TABLE IF NOT EXISTS bookshop_orders (
  id              TEXT    PRIMARY KEY,
  workspace_id    TEXT    REFERENCES workspaces(id),
  tenant_id       TEXT    NOT NULL,
  customer_phone  TEXT    NOT NULL,
  order_items     TEXT    NOT NULL DEFAULT '[]',  -- JSON array
  total_kobo      INTEGER NOT NULL DEFAULT 0,     -- P9
  payment_status  TEXT    NOT NULL DEFAULT 'pending',
  delivery_method TEXT    NOT NULL DEFAULT 'pickup',  -- pickup/delivery
  status          TEXT    NOT NULL DEFAULT 'pending',
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_bkord_tenant  ON bookshop_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bkord_status  ON bookshop_orders(status);
