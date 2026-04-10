-- Migration 0123: Abattoir / Meat Processing vertical (M12)
-- FSM: seeded → claimed → nafdac_verified → active → suspended
-- P9: price_per_kg_kobo, total_kobo as INTEGER
-- T3: tenant_id NOT NULL
-- All weights as integer kg; head counts as integers

CREATE TABLE IF NOT EXISTS abattoir_profiles (
  id                       TEXT PRIMARY KEY,
  workspace_id             TEXT NOT NULL,
  tenant_id                TEXT NOT NULL,
  abattoir_name            TEXT NOT NULL,
  nafdac_registration      TEXT,
  nvri_approval            TEXT,
  state_animal_health_cert TEXT,
  cac_rc                   TEXT,
  capacity_head_per_day    INTEGER NOT NULL DEFAULT 0,
  status                   TEXT NOT NULL DEFAULT 'seeded',
  created_at               INTEGER NOT NULL,
  updated_at               INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_abattoir_profiles_tenant ON abattoir_profiles(tenant_id);

CREATE TABLE IF NOT EXISTS abattoir_slaughter_log (
  id              TEXT PRIMARY KEY,
  profile_id      TEXT NOT NULL,
  tenant_id       TEXT NOT NULL,
  slaughter_date  INTEGER NOT NULL,
  animal_type     TEXT NOT NULL,
  head_count      INTEGER NOT NULL,
  vet_inspected   INTEGER NOT NULL DEFAULT 0,
  meat_yield_kg   INTEGER NOT NULL DEFAULT 0,
  created_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_abattoir_slaughter_tenant ON abattoir_slaughter_log(tenant_id);

CREATE TABLE IF NOT EXISTS abattoir_sales (
  id               TEXT PRIMARY KEY,
  profile_id       TEXT NOT NULL,
  tenant_id        TEXT NOT NULL,
  buyer_phone      TEXT NOT NULL,
  animal_type      TEXT NOT NULL,
  quantity_kg      INTEGER NOT NULL,
  price_per_kg_kobo INTEGER NOT NULL,
  total_kobo       INTEGER NOT NULL,
  sale_date        INTEGER NOT NULL,
  created_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_abattoir_sales_tenant ON abattoir_sales(tenant_id);
