-- Migration 0171: Motorcycle Accessories Shop vertical (M12)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- P13: customer_ref_id opaque

CREATE TABLE IF NOT EXISTS motorcycle_accessories_profiles (
  id             TEXT    PRIMARY KEY,
  workspace_id   TEXT    NOT NULL,
  tenant_id      TEXT    NOT NULL,
  business_name  TEXT    NOT NULL,
  son_cert       TEXT,
  cac_rc         TEXT,
  status         TEXT    NOT NULL DEFAULT 'seeded',
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_motorcycle_accessories_profiles_tenant ON motorcycle_accessories_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_motorcycle_accessories_profiles_workspace ON motorcycle_accessories_profiles(workspace_id);

CREATE TABLE IF NOT EXISTS motorcycle_accessories_inventory (
  id                 TEXT    PRIMARY KEY,
  profile_id         TEXT    NOT NULL,
  tenant_id          TEXT    NOT NULL,
  part_name          TEXT    NOT NULL,
  part_number        TEXT,
  brand              TEXT,
  category           TEXT    NOT NULL DEFAULT 'general', -- helmet/engine/electrical/chain/exhaust/body/general
  qty_in_stock       INTEGER NOT NULL DEFAULT 0,
  cost_price_kobo    INTEGER NOT NULL DEFAULT 0,
  retail_price_kobo  INTEGER NOT NULL DEFAULT 0,
  wholesale_price_kobo INTEGER NOT NULL DEFAULT 0,
  reorder_level      INTEGER NOT NULL DEFAULT 5,
  created_at         INTEGER NOT NULL,
  updated_at         INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_motorcycle_accessories_inventory_tenant ON motorcycle_accessories_inventory(tenant_id);
CREATE INDEX IF NOT EXISTS idx_motorcycle_accessories_inventory_profile ON motorcycle_accessories_inventory(profile_id);

CREATE TABLE IF NOT EXISTS motorcycle_accessories_sales (
  id               TEXT    PRIMARY KEY,
  profile_id       TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  customer_ref_id  TEXT,   -- opaque (P13)
  items            TEXT    NOT NULL, -- JSON: [{product_id, quantity, unit_price_kobo}]
  total_kobo       INTEGER NOT NULL DEFAULT 0,
  sale_date        INTEGER NOT NULL,
  is_wholesale     INTEGER NOT NULL DEFAULT 0,
  created_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_motorcycle_accessories_sales_tenant ON motorcycle_accessories_sales(tenant_id);
