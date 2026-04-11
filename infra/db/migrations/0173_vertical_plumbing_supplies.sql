-- Migration 0173: Plumbing Supplies Dealer vertical (M12)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- Pipe sizes in integer mm

CREATE TABLE IF NOT EXISTS plumbing_supplies_profiles (
  id             TEXT    PRIMARY KEY,
  workspace_id   TEXT    NOT NULL,
  tenant_id      TEXT    NOT NULL,
  company_name   TEXT    NOT NULL,
  son_cert       TEXT,
  cac_rc         TEXT,
  status         TEXT    NOT NULL DEFAULT 'seeded',
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_plumbing_supplies_profiles_tenant ON plumbing_supplies_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_plumbing_supplies_profiles_workspace ON plumbing_supplies_profiles(workspace_id);

CREATE TABLE IF NOT EXISTS plumbing_inventory (
  id               TEXT    PRIMARY KEY,
  profile_id       TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  product_name     TEXT    NOT NULL,
  product_code     TEXT,
  material_type    TEXT    NOT NULL DEFAULT 'PVC', -- PVC/copper/steel/brass/PPR
  size_mm          INTEGER NOT NULL DEFAULT 0,
  qty_in_stock     INTEGER NOT NULL DEFAULT 0,
  cost_price_kobo  INTEGER NOT NULL DEFAULT 0,
  retail_price_kobo INTEGER NOT NULL DEFAULT 0,
  reorder_level    INTEGER NOT NULL DEFAULT 10,
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_plumbing_inventory_tenant ON plumbing_inventory(tenant_id);
CREATE INDEX IF NOT EXISTS idx_plumbing_inventory_profile ON plumbing_inventory(profile_id);

CREATE TABLE IF NOT EXISTS plumbing_orders (
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
CREATE INDEX IF NOT EXISTS idx_plumbing_orders_tenant ON plumbing_orders(tenant_id);
