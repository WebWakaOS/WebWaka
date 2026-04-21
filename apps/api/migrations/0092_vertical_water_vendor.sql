-- Migration: 0092_vertical_water_vendor.sql
-- Vertical: water-vendor (M11 Commerce P3) — tanker + sachet water
-- FSM: seeded → claimed → nafdac_verified → active → suspended
-- Platform Invariants: P9 (kobo/litre integers), T3 (tenant_id NOT NULL)

CREATE TABLE IF NOT EXISTS water_vendor_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  business_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('tanker','sachet','both')),
  nafdac_permit TEXT,
  state_water_board_reg TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_water_vendor_profiles_tenant ON water_vendor_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_water_vendor_profiles_workspace ON water_vendor_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS water_deliveries (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  volume_litres INTEGER NOT NULL,
  price_kobo INTEGER NOT NULL,
  delivery_date INTEGER,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','delivered','paid')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_water_deliveries_tenant ON water_deliveries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_water_deliveries_workspace ON water_deliveries(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS sachet_water_batches (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  batch_date INTEGER NOT NULL,
  bags_produced INTEGER NOT NULL,
  production_cost_kobo INTEGER NOT NULL,
  price_per_bag_kobo INTEGER NOT NULL,
  bags_sold INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_sachet_water_batches_tenant ON sachet_water_batches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sachet_water_batches_workspace ON sachet_water_batches(workspace_id, tenant_id);
