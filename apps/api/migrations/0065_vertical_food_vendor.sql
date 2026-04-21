-- Migration 0065: Food Vendor / Street Food vertical
-- Platform Invariants: P9 (kobo integers), T3 (tenant_id NOT NULL on every table)
-- M9 — Commerce P2 Batch 1 (Set A, Task V-COMM-EXT-A9)
-- 3-state informal sector FSM: seeded → claimed → active (no mandatory regulatory gate)

CREATE TABLE IF NOT EXISTS food_vendor_profiles (
  id                   TEXT    PRIMARY KEY,
  workspace_id         TEXT    REFERENCES workspaces(id),
  tenant_id            TEXT    NOT NULL,
  vendor_name          TEXT    NOT NULL,
  food_type            TEXT    NOT NULL DEFAULT 'other',  -- mama_put/buka/suya/shawarma/bole/other
  location_description TEXT,
  lga                  TEXT    NOT NULL,
  state                TEXT    NOT NULL,
  lg_permit_number     TEXT,  -- optional — not a blocking FSM gate
  status               TEXT    NOT NULL DEFAULT 'seeded',
  created_at           INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at           INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_fvend_tenant ON food_vendor_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fvend_status ON food_vendor_profiles(status);

CREATE TABLE IF NOT EXISTS food_vendor_menu (
  id           TEXT    PRIMARY KEY,
  workspace_id TEXT    REFERENCES workspaces(id),
  tenant_id    TEXT    NOT NULL,
  item_name    TEXT    NOT NULL,
  price_kobo   INTEGER NOT NULL,   -- P9
  available    INTEGER NOT NULL DEFAULT 1,  -- boolean (0/1)
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_fvmenu_tenant ON food_vendor_menu(tenant_id);

CREATE TABLE IF NOT EXISTS food_vendor_sales (
  id              TEXT    PRIMARY KEY,
  workspace_id    TEXT    REFERENCES workspaces(id),
  tenant_id       TEXT    NOT NULL,
  sale_date       INTEGER NOT NULL,   -- unix date (start of day)
  total_kobo      INTEGER NOT NULL,   -- P9: total revenue for that day
  items_sold_count INTEGER NOT NULL DEFAULT 0,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_fvsales_tenant ON food_vendor_sales(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fvsales_date   ON food_vendor_sales(sale_date);
