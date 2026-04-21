-- Migration 0129: Vegetable Garden / Horticulture vertical (M12)
-- FSM: seeded → claimed → active (3-state informal; FMARD code optional)
-- P9: cost_kobo, price_per_kg_kobo, total_kobo as INTEGER
-- T3: tenant_id NOT NULL
-- Weights as integer grams; area as integer sqm

CREATE TABLE IF NOT EXISTS vegetable_garden_profiles (
  id                    TEXT PRIMARY KEY,
  workspace_id          TEXT NOT NULL,
  tenant_id             TEXT NOT NULL,
  farm_name             TEXT NOT NULL,
  state_agric_reg       TEXT,
  fmard_extension_code  TEXT,
  plot_count            INTEGER NOT NULL DEFAULT 0,
  status                TEXT NOT NULL DEFAULT 'seeded',
  created_at            INTEGER NOT NULL,
  updated_at            INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_vg_profiles_tenant ON vegetable_garden_profiles(tenant_id);

CREATE TABLE IF NOT EXISTS farm_plots (
  id                     TEXT PRIMARY KEY,
  profile_id             TEXT NOT NULL,
  tenant_id              TEXT NOT NULL,
  plot_name              TEXT NOT NULL,
  area_sqm               INTEGER NOT NULL,
  crop_type              TEXT NOT NULL,
  planting_date          INTEGER,
  expected_harvest_date  INTEGER,
  status                 TEXT NOT NULL DEFAULT 'growing',
  created_at             INTEGER NOT NULL,
  updated_at             INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_farm_plots_tenant ON farm_plots(tenant_id);

CREATE TABLE IF NOT EXISTS farm_inputs (
  id            TEXT PRIMARY KEY,
  profile_id    TEXT NOT NULL,
  tenant_id     TEXT NOT NULL,
  plot_id       TEXT NOT NULL,
  input_type    TEXT NOT NULL,
  quantity_grams INTEGER NOT NULL,
  cost_kobo     INTEGER NOT NULL,
  input_date    INTEGER NOT NULL,
  created_at    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_farm_inputs_tenant ON farm_inputs(tenant_id);

CREATE TABLE IF NOT EXISTS farm_harvests (
  id           TEXT PRIMARY KEY,
  profile_id   TEXT NOT NULL,
  tenant_id    TEXT NOT NULL,
  plot_id      TEXT NOT NULL,
  harvest_date INTEGER NOT NULL,
  weight_grams INTEGER NOT NULL,
  crop_type    TEXT NOT NULL,
  created_at   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_farm_harvests_tenant ON farm_harvests(tenant_id);

CREATE TABLE IF NOT EXISTS farm_sales (
  id               TEXT PRIMARY KEY,
  profile_id       TEXT NOT NULL,
  tenant_id        TEXT NOT NULL,
  buyer_phone      TEXT NOT NULL,
  crop_type        TEXT NOT NULL,
  weight_grams     INTEGER NOT NULL,
  price_per_kg_kobo INTEGER NOT NULL,
  total_kobo       INTEGER NOT NULL,
  sale_date        INTEGER NOT NULL,
  created_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_farm_sales_tenant ON farm_sales(tenant_id);
