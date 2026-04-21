-- Migration: 0089_vertical_spare_parts.sql
-- Vertical: spare-parts (M12 Commerce P3) — Ladipo/Nnewi auto spare parts
-- FSM: seeded → claimed → cac_verified → active → suspended
-- Platform Invariants: P9 (kobo integers), T3 (tenant_id NOT NULL)

CREATE TABLE IF NOT EXISTS spare_parts_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  shop_name TEXT NOT NULL,
  market_cluster TEXT NOT NULL CHECK(market_cluster IN ('ladipo','nnewi','kano','other')),
  cac_or_trade_number TEXT,
  son_registered INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_spare_parts_profiles_tenant ON spare_parts_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_spare_parts_profiles_workspace ON spare_parts_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS spare_parts_catalogue (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  part_number TEXT NOT NULL,
  part_name TEXT NOT NULL,
  compatible_makes TEXT NOT NULL DEFAULT '[]',
  category TEXT NOT NULL CHECK(category IN ('engine','brake','electrical','body','suspension')),
  unit_price_kobo INTEGER NOT NULL,
  quantity_in_stock INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_spare_parts_catalogue_tenant ON spare_parts_catalogue(tenant_id);
CREATE INDEX IF NOT EXISTS idx_spare_parts_catalogue_workspace ON spare_parts_catalogue(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS spare_parts_orders (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_type TEXT NOT NULL CHECK(client_type IN ('mechanic','individual')),
  order_items TEXT NOT NULL DEFAULT '[]',
  total_kobo INTEGER NOT NULL,
  credit_account_id TEXT,
  status TEXT NOT NULL DEFAULT 'placed' CHECK(status IN ('placed','confirmed','dispatched','delivered','settled')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_spare_parts_orders_tenant ON spare_parts_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_spare_parts_orders_workspace ON spare_parts_orders(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS spare_parts_credit (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  mechanic_phone TEXT NOT NULL,
  mechanic_name TEXT NOT NULL,
  credit_limit_kobo INTEGER NOT NULL,
  balance_owing_kobo INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_spare_parts_credit_tenant ON spare_parts_credit(tenant_id);
CREATE INDEX IF NOT EXISTS idx_spare_parts_credit_workspace ON spare_parts_credit(workspace_id, tenant_id);
