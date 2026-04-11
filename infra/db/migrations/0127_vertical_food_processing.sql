-- Migration 0127: Food Processing Factory vertical (M12)
-- FSM: seeded → claimed → nafdac_verified → active → suspended
-- P9: total_cost_kobo, cost_per_kg_kobo, unit_sale_price_kobo as INTEGER
-- T3: tenant_id NOT NULL
-- Weights as integer grams/kg; quantities as integers

CREATE TABLE IF NOT EXISTS food_processing_profiles (
  id                        TEXT PRIMARY KEY,
  workspace_id              TEXT NOT NULL,
  tenant_id                 TEXT NOT NULL,
  factory_name              TEXT NOT NULL,
  nafdac_manufacturing_permit TEXT,
  son_product_cert          TEXT,
  cac_rc                    TEXT,
  status                    TEXT NOT NULL DEFAULT 'seeded',
  created_at                INTEGER NOT NULL,
  updated_at                INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_fp_profiles_tenant ON food_processing_profiles(tenant_id);

CREATE TABLE IF NOT EXISTS fp_production_batches (
  id                   TEXT PRIMARY KEY,
  profile_id           TEXT NOT NULL,
  tenant_id            TEXT NOT NULL,
  product_name         TEXT NOT NULL,
  nafdac_product_number TEXT,
  batch_number         TEXT NOT NULL,
  production_date      INTEGER NOT NULL,
  quantity_units       INTEGER NOT NULL,
  unit_size_grams      INTEGER NOT NULL,
  total_cost_kobo      INTEGER NOT NULL,
  expiry_date          INTEGER,
  created_at           INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_fp_batches_tenant ON fp_production_batches(tenant_id);

CREATE TABLE IF NOT EXISTS fp_raw_materials (
  id               TEXT PRIMARY KEY,
  profile_id       TEXT NOT NULL,
  tenant_id        TEXT NOT NULL,
  material_name    TEXT NOT NULL,
  quantity_kg      INTEGER NOT NULL,
  cost_per_kg_kobo INTEGER NOT NULL,
  supplier         TEXT,
  intake_date      INTEGER NOT NULL,
  created_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_fp_raw_materials_tenant ON fp_raw_materials(tenant_id);

CREATE TABLE IF NOT EXISTS fp_finished_goods (
  id                    TEXT PRIMARY KEY,
  profile_id            TEXT NOT NULL,
  tenant_id             TEXT NOT NULL,
  product_name          TEXT NOT NULL,
  nafdac_product_number TEXT,
  units_in_stock        INTEGER NOT NULL DEFAULT 0,
  unit_sale_price_kobo  INTEGER NOT NULL,
  created_at            INTEGER NOT NULL,
  updated_at            INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_fp_finished_goods_tenant ON fp_finished_goods(tenant_id);
