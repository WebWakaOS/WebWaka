-- Migration 0158: Furniture Maker / Wood Workshop vertical (M10)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- P13: client_ref_id opaque

CREATE TABLE IF NOT EXISTS furniture_maker_profiles (
  id             TEXT    PRIMARY KEY,
  workspace_id   TEXT    NOT NULL,
  tenant_id      TEXT    NOT NULL,
  business_name  TEXT    NOT NULL,
  cac_rc         TEXT,
  son_cert       TEXT,
  workshop_type  TEXT    NOT NULL DEFAULT 'all', -- bespoke/production/all
  state          TEXT,
  lga            TEXT,
  status         TEXT    NOT NULL DEFAULT 'seeded',
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_furniture_maker_profiles_tenant ON furniture_maker_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_furniture_maker_profiles_workspace ON furniture_maker_profiles(workspace_id);

CREATE TABLE IF NOT EXISTS furniture_orders (
  id              TEXT    PRIMARY KEY,
  profile_id      TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  client_ref_id   TEXT    NOT NULL, -- opaque (P13)
  item_type       TEXT    NOT NULL,
  quantity        INTEGER NOT NULL DEFAULT 1,
  unit_price_kobo INTEGER NOT NULL DEFAULT 0,
  total_kobo      INTEGER NOT NULL DEFAULT 0,
  deposit_kobo    INTEGER NOT NULL DEFAULT 0,
  delivery_date   INTEGER,
  status          TEXT    NOT NULL DEFAULT 'intake', -- intake/design/production/finishing/ready/delivered
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_furniture_orders_tenant ON furniture_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_furniture_orders_profile ON furniture_orders(profile_id);

CREATE TABLE IF NOT EXISTS furniture_production_stages (
  id            TEXT    PRIMARY KEY,
  order_id      TEXT    NOT NULL,
  tenant_id     TEXT    NOT NULL,
  stage         TEXT    NOT NULL, -- cutting/assembly/sanding/finishing/upholstery/quality_check
  started_at    INTEGER,
  completed_at  INTEGER,
  notes         TEXT,
  created_at    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_furniture_production_stages_tenant ON furniture_production_stages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_furniture_production_stages_order ON furniture_production_stages(order_id);

CREATE TABLE IF NOT EXISTS furniture_material_inventory (
  id                TEXT    PRIMARY KEY,
  profile_id        TEXT    NOT NULL,
  tenant_id         TEXT    NOT NULL,
  material_name     TEXT    NOT NULL,
  unit              TEXT    NOT NULL DEFAULT 'piece',
  quantity_in_stock INTEGER NOT NULL DEFAULT 0,
  unit_cost_kobo    INTEGER NOT NULL DEFAULT 0,
  reorder_level     INTEGER NOT NULL DEFAULT 5,
  supplier          TEXT,
  created_at        INTEGER NOT NULL,
  updated_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_furniture_material_inventory_tenant ON furniture_material_inventory(tenant_id);
