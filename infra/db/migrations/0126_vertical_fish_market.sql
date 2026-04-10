-- Migration 0126: Fish Market / Fishmonger vertical (M12)
-- FSM: seeded → claimed → nafdac_verified → active → suspended
-- P9: cost_per_kg_kobo, price_per_kg_kobo, total_kobo as INTEGER
-- T3: tenant_id NOT NULL
-- Weights as integer grams; expiry as integer unix timestamp

CREATE TABLE IF NOT EXISTS fish_market_profiles (
  id                     TEXT PRIMARY KEY,
  workspace_id           TEXT NOT NULL,
  tenant_id              TEXT NOT NULL,
  business_name          TEXT NOT NULL,
  nafdac_food_safety_cert TEXT,
  nifda_registration     TEXT,
  market_location        TEXT,
  status                 TEXT NOT NULL DEFAULT 'seeded',
  created_at             INTEGER NOT NULL,
  updated_at             INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_fish_market_profiles_tenant ON fish_market_profiles(tenant_id);

CREATE TABLE IF NOT EXISTS fish_stock (
  id               TEXT PRIMARY KEY,
  profile_id       TEXT NOT NULL,
  tenant_id        TEXT NOT NULL,
  fish_type        TEXT NOT NULL,
  category         TEXT NOT NULL DEFAULT 'fresh',
  weight_grams     INTEGER NOT NULL,
  cost_per_kg_kobo INTEGER NOT NULL,
  expiry_date      INTEGER NOT NULL,
  source           TEXT,
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_fish_stock_tenant ON fish_stock(tenant_id);

CREATE TABLE IF NOT EXISTS fish_sales (
  id               TEXT PRIMARY KEY,
  profile_id       TEXT NOT NULL,
  tenant_id        TEXT NOT NULL,
  buyer_phone      TEXT NOT NULL,
  fish_type        TEXT NOT NULL,
  weight_grams     INTEGER NOT NULL,
  price_per_kg_kobo INTEGER NOT NULL,
  total_kobo       INTEGER NOT NULL,
  sale_date        INTEGER NOT NULL,
  created_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_fish_sales_tenant ON fish_sales(tenant_id);

CREATE TABLE IF NOT EXISTS fish_wastage (
  id          TEXT PRIMARY KEY,
  profile_id  TEXT NOT NULL,
  tenant_id   TEXT NOT NULL,
  waste_date  INTEGER NOT NULL,
  fish_type   TEXT NOT NULL,
  weight_grams INTEGER NOT NULL,
  reason      TEXT,
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_fish_wastage_tenant ON fish_wastage(tenant_id);
