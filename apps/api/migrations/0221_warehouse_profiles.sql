-- Migration 0221: verticals-warehouse
-- Creates tables for warehouse management vertical (M10)
-- Invariants: T3 tenant isolation, P9 integer units (kobo/kg x100)

CREATE TABLE IF NOT EXISTS warehouse_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  warehouse_name TEXT NOT NULL,
  cac_number TEXT,
  state TEXT,
  lga TEXT,
  capacity_sqm INTEGER NOT NULL DEFAULT 0,
  warehouse_type TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_warehouse_profiles_tenant ON warehouse_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_profiles_workspace ON warehouse_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS warehouse_storage_contracts (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES warehouse_profiles(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  client_ref_id TEXT NOT NULL,
  goods_type TEXT NOT NULL,
  quantity_kg INTEGER,
  quantity_units INTEGER,
  rate_per_day_kobo INTEGER NOT NULL,
  start_date INTEGER NOT NULL,
  end_date INTEGER,
  total_kobo INTEGER,
  deposit_kobo INTEGER,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_wh_contracts_tenant ON warehouse_storage_contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wh_contracts_profile ON warehouse_storage_contracts(profile_id, tenant_id);

CREATE TABLE IF NOT EXISTS warehouse_inventory_items (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES warehouse_profiles(id) ON DELETE CASCADE,
  contract_id TEXT REFERENCES warehouse_storage_contracts(id),
  tenant_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  sku TEXT,
  quantity_on_hand INTEGER NOT NULL DEFAULT 0,
  unit_value_kobo INTEGER NOT NULL DEFAULT 0,
  last_movement_date INTEGER,
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_wh_inventory_tenant ON warehouse_inventory_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wh_inventory_profile ON warehouse_inventory_items(profile_id, tenant_id);
