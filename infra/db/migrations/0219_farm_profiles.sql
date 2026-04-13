-- Migration 0219: verticals-farm
-- Creates tables for farm management vertical (M10)
-- Invariants: T3 tenant isolation, P9 integer units (kobo/kg/hectares x100)

CREATE TABLE IF NOT EXISTS farm_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  farm_name TEXT NOT NULL,
  cac_number TEXT,
  state TEXT,
  lga TEXT,
  farm_size_hectares INTEGER NOT NULL DEFAULT 0,
  primary_crop TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_farm_profiles_tenant ON farm_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_farm_profiles_workspace ON farm_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS farm_produce_records (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES farm_profiles(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  crop_type TEXT NOT NULL,
  quantity_kg INTEGER NOT NULL,
  harvest_date INTEGER NOT NULL,
  price_per_kg_kobo INTEGER NOT NULL,
  total_kobo INTEGER NOT NULL,
  buyer_ref_id TEXT,
  status TEXT NOT NULL DEFAULT 'harvested',
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_farm_produce_tenant ON farm_produce_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_farm_produce_profile ON farm_produce_records(profile_id, tenant_id);

CREATE TABLE IF NOT EXISTS farm_input_records (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES farm_profiles(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  input_type TEXT NOT NULL,
  supplier_ref_id TEXT,
  quantity_kg INTEGER,
  cost_kobo INTEGER NOT NULL,
  purchase_date INTEGER NOT NULL,
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_farm_input_tenant ON farm_input_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_farm_input_profile ON farm_input_records(profile_id, tenant_id);
