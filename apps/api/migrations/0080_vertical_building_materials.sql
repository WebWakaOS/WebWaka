-- Migration: 0080_vertical_building_materials.sql
-- Vertical: building-materials (M12 Commerce P3)
-- FSM: seeded → claimed → cac_verified → active → suspended
-- Platform Invariants: P9 (kobo integers), T3 (tenant_id NOT NULL)

CREATE TABLE IF NOT EXISTS building_materials_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  cac_rc TEXT,
  son_dealer_number TEXT,
  market_cluster TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_building_materials_profiles_tenant ON building_materials_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_building_materials_profiles_workspace ON building_materials_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS building_materials_catalogue (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('cement','steel','roofing','tiles','glass','paint','sanitary')),
  unit TEXT NOT NULL,
  unit_price_kobo INTEGER NOT NULL,
  quantity_in_stock INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_building_materials_catalogue_tenant ON building_materials_catalogue(tenant_id);
CREATE INDEX IF NOT EXISTS idx_building_materials_catalogue_workspace ON building_materials_catalogue(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS building_materials_orders (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_name TEXT NOT NULL,
  order_items TEXT NOT NULL DEFAULT '[]',
  total_kobo INTEGER NOT NULL,
  credit_account_id TEXT,
  delivery_address TEXT,
  status TEXT NOT NULL DEFAULT 'placed' CHECK(status IN ('placed','confirmed','dispatched','delivered','invoiced','settled')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_building_materials_orders_tenant ON building_materials_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_building_materials_orders_workspace ON building_materials_orders(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS contractor_credit_accounts (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  contractor_phone TEXT NOT NULL,
  contractor_name TEXT NOT NULL,
  credit_limit_kobo INTEGER NOT NULL,
  balance_owing_kobo INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_contractor_credit_accounts_tenant ON contractor_credit_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contractor_credit_accounts_workspace ON contractor_credit_accounts(workspace_id, tenant_id);
