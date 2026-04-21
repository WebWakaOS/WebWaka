-- Migration 0058: Bakery / Confectionery vertical
-- Platform Invariants: P9 (kobo integers), T3 (tenant_id NOT NULL on every table)
-- M9 — Commerce P2 Batch 1 (Set A, Task V-COMM-EXT-A2)

CREATE TABLE IF NOT EXISTS bakery_profiles (
  id                         TEXT    PRIMARY KEY,
  workspace_id               TEXT    REFERENCES workspaces(id),
  tenant_id                  TEXT    NOT NULL,
  bakery_name                TEXT    NOT NULL,
  nafdac_number              TEXT,
  production_license_expiry  INTEGER,             -- unix timestamp; null = not yet set
  cac_number                 TEXT,
  food_handler_count         INTEGER NOT NULL DEFAULT 0,
  status                     TEXT    NOT NULL DEFAULT 'seeded',
  created_at                 INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at                 INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_bakery_tenant ON bakery_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bakery_status ON bakery_profiles(status);

CREATE TABLE IF NOT EXISTS bakery_products (
  id                  TEXT    PRIMARY KEY,
  workspace_id        TEXT    REFERENCES workspaces(id),
  tenant_id           TEXT    NOT NULL,
  product_name        TEXT    NOT NULL,
  category            TEXT    NOT NULL DEFAULT 'bread',  -- bread/cake/pastry/snack
  unit_price_kobo     INTEGER NOT NULL,                  -- P9
  production_cost_kobo INTEGER NOT NULL DEFAULT 0,       -- P9
  daily_capacity      INTEGER NOT NULL DEFAULT 0,
  created_at          INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_bakprod_tenant ON bakery_products(tenant_id);

CREATE TABLE IF NOT EXISTS bakery_orders (
  id                  TEXT    PRIMARY KEY,
  workspace_id        TEXT    REFERENCES workspaces(id),
  tenant_id           TEXT    NOT NULL,
  customer_phone      TEXT    NOT NULL,
  product_id          TEXT    REFERENCES bakery_products(id),
  quantity            INTEGER NOT NULL DEFAULT 1,
  customization_notes TEXT,
  deposit_kobo        INTEGER NOT NULL DEFAULT 0,  -- P9
  balance_kobo        INTEGER NOT NULL DEFAULT 0,  -- P9
  delivery_date       INTEGER,                     -- unix timestamp
  status              TEXT    NOT NULL DEFAULT 'pending',
  created_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_bakord_tenant ON bakery_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bakord_status ON bakery_orders(status);

CREATE TABLE IF NOT EXISTS bakery_ingredients (
  id               TEXT    PRIMARY KEY,
  workspace_id     TEXT    REFERENCES workspaces(id),
  tenant_id        TEXT    NOT NULL,
  ingredient_name  TEXT    NOT NULL,
  unit             TEXT    NOT NULL DEFAULT 'kg',  -- kg/litre/piece
  quantity_in_stock REAL   NOT NULL DEFAULT 0,     -- fractional for weight/volume
  unit_cost_kobo   INTEGER NOT NULL,               -- P9: cost per unit in kobo
  reorder_level    REAL    NOT NULL DEFAULT 1,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_bakingr_tenant ON bakery_ingredients(tenant_id);
