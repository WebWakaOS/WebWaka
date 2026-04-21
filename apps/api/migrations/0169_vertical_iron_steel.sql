-- Migration 0169: Iron & Steel / Roofing Merchant vertical (M12)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- Measurements in integer mm; thickness in mm×10

CREATE TABLE IF NOT EXISTS iron_steel_profiles (
  id             TEXT    PRIMARY KEY,
  workspace_id   TEXT    NOT NULL,
  tenant_id      TEXT    NOT NULL,
  business_name  TEXT    NOT NULL,
  son_cert       TEXT,
  cac_rc         TEXT,
  product_type   TEXT    NOT NULL DEFAULT 'both', -- roofing/structural/both
  status         TEXT    NOT NULL DEFAULT 'seeded',
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_iron_steel_profiles_tenant ON iron_steel_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_iron_steel_profiles_workspace ON iron_steel_profiles(workspace_id);

CREATE TABLE IF NOT EXISTS iron_steel_inventory (
  id               TEXT    PRIMARY KEY,
  profile_id       TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  product_name     TEXT    NOT NULL,
  grade            TEXT,
  length_mm        INTEGER NOT NULL DEFAULT 0,
  thickness_mm10   INTEGER NOT NULL DEFAULT 0, -- thickness ×10 to avoid floats
  qty_in_stock     INTEGER NOT NULL DEFAULT 0,
  unit_price_kobo  INTEGER NOT NULL DEFAULT 0,
  reorder_level    INTEGER NOT NULL DEFAULT 10,
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_iron_steel_inventory_tenant ON iron_steel_inventory(tenant_id);
CREATE INDEX IF NOT EXISTS idx_iron_steel_inventory_profile ON iron_steel_inventory(profile_id);

CREATE TABLE IF NOT EXISTS iron_steel_orders (
  id               TEXT    PRIMARY KEY,
  profile_id       TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  client_ref_id    TEXT    NOT NULL, -- opaque (P13)
  items            TEXT    NOT NULL, -- JSON: [{product_id, quantity, unit_price_kobo}]
  total_kobo       INTEGER NOT NULL DEFAULT 0,
  order_date       INTEGER NOT NULL,
  delivery_date    INTEGER,
  is_bulk          INTEGER NOT NULL DEFAULT 0,
  status           TEXT    NOT NULL DEFAULT 'pending', -- pending/confirmed/dispatched/delivered
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_iron_steel_orders_tenant ON iron_steel_orders(tenant_id);
