-- Migration: 0087_vertical_phone_repair_shop.sql
-- Vertical: phone-repair-shop (M10 Commerce P3)
-- FSM: seeded → claimed → active (3-state)
-- Platform Invariants: P9 (kobo integers), P13 (IMEI never to AI), T3 (tenant_id NOT NULL)

CREATE TABLE IF NOT EXISTS phone_repair_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  shop_name TEXT NOT NULL,
  cac_or_trade_number TEXT,
  location_cluster TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_phone_repair_profiles_tenant ON phone_repair_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_phone_repair_profiles_workspace ON phone_repair_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS phone_repair_jobs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  device_brand TEXT NOT NULL,
  device_model TEXT NOT NULL,
  imei TEXT,
  fault TEXT NOT NULL,
  labour_kobo INTEGER NOT NULL,
  parts_kobo INTEGER NOT NULL DEFAULT 0,
  total_kobo INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'intake' CHECK(status IN ('intake','repairing','completed','collected')),
  warranty_days INTEGER NOT NULL DEFAULT 30,
  customer_phone TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_phone_repair_jobs_tenant ON phone_repair_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_phone_repair_jobs_workspace ON phone_repair_jobs(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS phone_accessories_stock (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  brand TEXT,
  category TEXT NOT NULL CHECK(category IN ('case','screen_guard','charger','cable','earpiece','other')),
  unit_price_kobo INTEGER NOT NULL,
  quantity_in_stock INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_phone_accessories_stock_tenant ON phone_accessories_stock(tenant_id);
CREATE INDEX IF NOT EXISTS idx_phone_accessories_stock_workspace ON phone_accessories_stock(workspace_id, tenant_id);
