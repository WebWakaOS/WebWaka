-- Migration 0220: verticals-poultry-farm
-- Creates tables for poultry farm management vertical (M10)
-- Invariants: T3 tenant isolation, P9 integer units (kobo/count)

CREATE TABLE IF NOT EXISTS poultry_farm_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  farm_name TEXT NOT NULL,
  cac_number TEXT,
  state TEXT,
  lga TEXT,
  bird_type TEXT NOT NULL DEFAULT 'broiler',
  capacity_birds INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_poultry_profiles_tenant ON poultry_farm_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_poultry_profiles_workspace ON poultry_farm_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS poultry_batches (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES poultry_farm_profiles(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  bird_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  cost_per_bird_kobo INTEGER NOT NULL,
  total_cost_kobo INTEGER NOT NULL,
  placement_date INTEGER NOT NULL,
  expected_harvest_date INTEGER,
  status TEXT NOT NULL DEFAULT 'active',
  mortality_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_poultry_batches_tenant ON poultry_batches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_poultry_batches_profile ON poultry_batches(profile_id, tenant_id);

CREATE TABLE IF NOT EXISTS poultry_sales_records (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES poultry_farm_profiles(id) ON DELETE CASCADE,
  batch_id TEXT REFERENCES poultry_batches(id),
  tenant_id TEXT NOT NULL,
  product_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price_per_unit_kobo INTEGER NOT NULL,
  total_kobo INTEGER NOT NULL,
  buyer_ref_id TEXT,
  sale_date INTEGER NOT NULL,
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_poultry_sales_tenant ON poultry_sales_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_poultry_sales_profile ON poultry_sales_records(profile_id, tenant_id);
