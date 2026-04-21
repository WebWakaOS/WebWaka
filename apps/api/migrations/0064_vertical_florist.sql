-- Migration 0064: Florist / Garden Centre vertical
-- Platform Invariants: P9 (kobo integers), T3 (tenant_id NOT NULL on every table)
-- M9 — Commerce P2 Batch 1 (Set A, Task V-COMM-EXT-A8)

CREATE TABLE IF NOT EXISTS florist_profiles (
  id             TEXT    PRIMARY KEY,
  workspace_id   TEXT    REFERENCES workspaces(id),
  tenant_id      TEXT    NOT NULL,
  business_name  TEXT    NOT NULL,
  cac_number     TEXT,
  speciality     TEXT    NOT NULL DEFAULT 'retail',  -- wedding/funeral/corporate/retail
  status         TEXT    NOT NULL DEFAULT 'seeded',
  created_at     INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at     INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_florist_tenant ON florist_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_florist_status ON florist_profiles(status);

CREATE TABLE IF NOT EXISTS florist_arrangements (
  id           TEXT    PRIMARY KEY,
  workspace_id TEXT    REFERENCES workspaces(id),
  tenant_id    TEXT    NOT NULL,
  name         TEXT    NOT NULL,
  description  TEXT,
  occasion     TEXT    NOT NULL DEFAULT 'retail',  -- wedding/funeral/birthday/corporate/retail
  price_kobo   INTEGER NOT NULL,                   -- P9
  image_url    TEXT,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_floriarr_tenant   ON florist_arrangements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_floriarr_occasion ON florist_arrangements(occasion);

CREATE TABLE IF NOT EXISTS florist_orders (
  id             TEXT    PRIMARY KEY,
  workspace_id   TEXT    REFERENCES workspaces(id),
  tenant_id      TEXT    NOT NULL,
  client_phone   TEXT    NOT NULL,
  arrangement_id TEXT    REFERENCES florist_arrangements(id),
  event_date     INTEGER NOT NULL,   -- unix timestamp
  delivery_address TEXT,
  deposit_kobo   INTEGER NOT NULL DEFAULT 0,  -- P9
  balance_kobo   INTEGER NOT NULL DEFAULT 0,  -- P9
  status         TEXT    NOT NULL DEFAULT 'enquiry',
  created_at     INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at     INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_floriord_tenant ON florist_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_floriord_status ON florist_orders(status);
CREATE INDEX IF NOT EXISTS idx_floriord_date   ON florist_orders(event_date);

CREATE TABLE IF NOT EXISTS florist_stock (
  id               TEXT    PRIMARY KEY,
  workspace_id     TEXT    REFERENCES workspaces(id),
  tenant_id        TEXT    NOT NULL,
  flower_name      TEXT    NOT NULL,
  quantity_in_stock INTEGER NOT NULL DEFAULT 0,
  unit_cost_kobo   INTEGER NOT NULL,   -- P9
  expiry_date      INTEGER,            -- unix timestamp — null = non-perishable
  supplier_name    TEXT,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_floristock_tenant  ON florist_stock(tenant_id);
CREATE INDEX IF NOT EXISTS idx_floristock_expiry  ON florist_stock(expiry_date);
