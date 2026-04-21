-- Migration: 0090_vertical_tyre_shop.sql
-- Vertical: tyre-shop (M12 Commerce P3) — formal dealers + roadside vulcanizers
-- FSM: seeded → claimed → active (3-state informal / formal add cac_verified)
-- Platform Invariants: P9 (kobo integers), T3 (tenant_id NOT NULL)

CREATE TABLE IF NOT EXISTS tyre_shop_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  business_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('formal_dealer','vulcanizer','both')),
  cac_or_permit TEXT,
  state TEXT,
  lga TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_tyre_shop_profiles_tenant ON tyre_shop_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tyre_shop_profiles_workspace ON tyre_shop_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS tyre_stock (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  brand TEXT NOT NULL,
  size TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('car','truck','motorcycle','bicycle')),
  unit_price_kobo INTEGER NOT NULL,
  quantity_in_stock INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_tyre_stock_tenant ON tyre_stock(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tyre_stock_workspace ON tyre_stock(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS tyre_services (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  service_name TEXT NOT NULL CHECK(service_name IN ('puncture','balancing','alignment','fitting')),
  price_kobo INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_tyre_services_tenant ON tyre_services(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tyre_services_workspace ON tyre_services(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS tyre_daily_log (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  log_date INTEGER NOT NULL,
  revenue_kobo INTEGER NOT NULL,
  tyres_sold INTEGER NOT NULL DEFAULT 0,
  services_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_tyre_daily_log_tenant ON tyre_daily_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tyre_daily_log_workspace ON tyre_daily_log(workspace_id, tenant_id);
