-- Migration: 0083_vertical_electrical_fittings.sql
-- Vertical: electrical-fittings (M12 Commerce P3)
-- FSM: seeded → claimed → cac_verified → active → suspended
-- Platform Invariants: P9 (kobo integers), T3 (tenant_id NOT NULL)

CREATE TABLE IF NOT EXISTS electrical_fittings_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  cac_rc TEXT,
  son_dealer_reg TEXT,
  market_location TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_electrical_fittings_profiles_tenant ON electrical_fittings_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_electrical_fittings_profiles_workspace ON electrical_fittings_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS electrical_catalogue (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('cable','switch','socket','breaker','conduit','other')),
  son_type_number TEXT,
  unit TEXT NOT NULL,
  unit_price_kobo INTEGER NOT NULL,
  quantity_in_stock INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_electrical_catalogue_tenant ON electrical_catalogue(tenant_id);
CREATE INDEX IF NOT EXISTS idx_electrical_catalogue_workspace ON electrical_catalogue(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS electrical_orders (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  items TEXT NOT NULL DEFAULT '[]',
  total_kobo INTEGER NOT NULL,
  credit_account_id TEXT,
  status TEXT NOT NULL DEFAULT 'placed' CHECK(status IN ('placed','confirmed','dispatched','delivered','settled')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_electrical_orders_tenant ON electrical_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_electrical_orders_workspace ON electrical_orders(workspace_id, tenant_id);
