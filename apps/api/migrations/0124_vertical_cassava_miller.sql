-- Migration 0124: Cassava / Maize / Rice Miller vertical (M12)
-- FSM: seeded → claimed → nafdac_verified → active → suspended
-- P9: price_per_kg_kobo, milling_cost_kobo, total_kobo as INTEGER
-- T3: tenant_id NOT NULL
-- All weights as integer kg

CREATE TABLE IF NOT EXISTS cassava_miller_profiles (
  id                           TEXT PRIMARY KEY,
  workspace_id                 TEXT NOT NULL,
  tenant_id                    TEXT NOT NULL,
  mill_name                    TEXT NOT NULL,
  nafdac_manufacturing_permit  TEXT,
  son_product_cert             TEXT,
  cac_rc                       TEXT,
  processing_capacity_kg_per_day INTEGER NOT NULL DEFAULT 0,
  status                       TEXT NOT NULL DEFAULT 'seeded',
  created_at                   INTEGER NOT NULL,
  updated_at                   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cassava_miller_profiles_tenant ON cassava_miller_profiles(tenant_id);

CREATE TABLE IF NOT EXISTS miller_intake_log (
  id               TEXT PRIMARY KEY,
  profile_id       TEXT NOT NULL,
  tenant_id        TEXT NOT NULL,
  crop_type        TEXT NOT NULL,
  quantity_kg      INTEGER NOT NULL,
  supplier_phone   TEXT,
  intake_date      INTEGER NOT NULL,
  cost_per_kg_kobo INTEGER NOT NULL,
  created_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_miller_intake_tenant ON miller_intake_log(tenant_id);

CREATE TABLE IF NOT EXISTS miller_production_batches (
  id               TEXT PRIMARY KEY,
  profile_id       TEXT NOT NULL,
  tenant_id        TEXT NOT NULL,
  batch_date       INTEGER NOT NULL,
  crop_type        TEXT NOT NULL,
  raw_input_kg     INTEGER NOT NULL,
  product_output_kg INTEGER NOT NULL,
  product_type     TEXT NOT NULL,
  milling_cost_kobo INTEGER NOT NULL,
  created_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_miller_batches_tenant ON miller_production_batches(tenant_id);

CREATE TABLE IF NOT EXISTS miller_sales (
  id               TEXT PRIMARY KEY,
  profile_id       TEXT NOT NULL,
  tenant_id        TEXT NOT NULL,
  buyer_phone      TEXT NOT NULL,
  product_type     TEXT NOT NULL,
  quantity_kg      INTEGER NOT NULL,
  price_per_kg_kobo INTEGER NOT NULL,
  total_kobo       INTEGER NOT NULL,
  sale_date        INTEGER NOT NULL,
  created_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_miller_sales_tenant ON miller_sales(tenant_id);
