-- Migration 0128: Palm Oil / Vegetable Oil Producer vertical (M12)
-- FSM: seeded → claimed → nafdac_verified → active → suspended
-- P9: cost_per_kg_kobo, production_cost_kobo, price_per_litre_kobo, total_kobo as INTEGER
-- T3: tenant_id NOT NULL
-- FFB weight as integer kg; oil output as integer ml (avoids float litres)

CREATE TABLE IF NOT EXISTS palm_oil_profiles (
  id                         TEXT PRIMARY KEY,
  workspace_id               TEXT NOT NULL,
  tenant_id                  TEXT NOT NULL,
  mill_name                  TEXT NOT NULL,
  nafdac_product_number      TEXT,
  nifor_affiliation          TEXT,
  state_agric_extension_reg  TEXT,
  status                     TEXT NOT NULL DEFAULT 'seeded',
  created_at                 INTEGER NOT NULL,
  updated_at                 INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_palm_oil_profiles_tenant ON palm_oil_profiles(tenant_id);

CREATE TABLE IF NOT EXISTS palm_ffb_intake (
  id               TEXT PRIMARY KEY,
  profile_id       TEXT NOT NULL,
  tenant_id        TEXT NOT NULL,
  ffb_source       TEXT NOT NULL DEFAULT 'own_farm',
  quantity_kg      INTEGER NOT NULL,
  cost_per_kg_kobo INTEGER NOT NULL,
  intake_date      INTEGER NOT NULL,
  supplier_phone   TEXT,
  created_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_palm_ffb_intake_tenant ON palm_ffb_intake(tenant_id);

CREATE TABLE IF NOT EXISTS palm_production_batches (
  id                   TEXT PRIMARY KEY,
  profile_id           TEXT NOT NULL,
  tenant_id            TEXT NOT NULL,
  processing_date      INTEGER NOT NULL,
  ffb_input_kg         INTEGER NOT NULL,
  oil_output_ml        INTEGER NOT NULL,
  kernel_output_kg     INTEGER NOT NULL DEFAULT 0,
  production_cost_kobo INTEGER NOT NULL,
  created_at           INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_palm_batches_tenant ON palm_production_batches(tenant_id);

CREATE TABLE IF NOT EXISTS palm_oil_sales (
  id                   TEXT PRIMARY KEY,
  profile_id           TEXT NOT NULL,
  tenant_id            TEXT NOT NULL,
  buyer_phone          TEXT NOT NULL,
  quantity_ml          INTEGER NOT NULL,
  price_per_litre_kobo INTEGER NOT NULL,
  total_kobo           INTEGER NOT NULL,
  sale_date            INTEGER NOT NULL,
  created_at           INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_palm_sales_tenant ON palm_oil_sales(tenant_id);
