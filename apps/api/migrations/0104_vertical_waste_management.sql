-- Migration 0104 — Waste Management / Recycler vertical (M11)
-- Platform Invariants: T3 (tenant_id NOT NULL), P9 (monetary in kobo, weight in integer kg)

CREATE TABLE IF NOT EXISTS waste_mgmt_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  lawma_or_state_permit TEXT,
  fmenv_cert TEXT,
  cac_rc TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_waste_mgmt_profiles_tenant ON waste_mgmt_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_waste_mgmt_profiles_workspace ON waste_mgmt_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS waste_collection_routes (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  route_name TEXT NOT NULL,
  zone TEXT,
  client_count INTEGER DEFAULT 0,
  truck_id TEXT,
  collection_day TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_waste_collection_routes_tenant ON waste_collection_routes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_waste_collection_routes_profile ON waste_collection_routes(profile_id, tenant_id);

CREATE TABLE IF NOT EXISTS waste_subscriptions (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  route_id TEXT,
  tenant_id TEXT NOT NULL,
  client_phone TEXT,
  client_address TEXT,
  monthly_fee_kobo INTEGER NOT NULL CHECK(monthly_fee_kobo >= 0),
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_waste_subscriptions_tenant ON waste_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_waste_subscriptions_profile ON waste_subscriptions(profile_id, tenant_id);

CREATE TABLE IF NOT EXISTS waste_tonnage_log (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  route_id TEXT,
  tenant_id TEXT NOT NULL,
  collection_date INTEGER,
  weight_kg INTEGER NOT NULL CHECK(weight_kg >= 0),
  waste_type TEXT NOT NULL DEFAULT 'general',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_waste_tonnage_log_tenant ON waste_tonnage_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_waste_tonnage_log_profile ON waste_tonnage_log(profile_id, tenant_id);

CREATE TABLE IF NOT EXISTS recycling_purchases (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  material_type TEXT NOT NULL DEFAULT 'plastic',
  weight_kg INTEGER NOT NULL CHECK(weight_kg > 0),
  price_per_kg_kobo INTEGER NOT NULL CHECK(price_per_kg_kobo >= 0),
  supplier_phone TEXT,
  total_kobo INTEGER NOT NULL CHECK(total_kobo >= 0),
  collection_date INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_recycling_purchases_tenant ON recycling_purchases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_recycling_purchases_profile ON recycling_purchases(profile_id, tenant_id);
