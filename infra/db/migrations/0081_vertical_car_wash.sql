-- Migration: 0081_vertical_car_wash.sql
-- Vertical: car-wash (M12 Commerce P3)
-- FSM: seeded → claimed → active (3-state informal)
-- Platform Invariants: P9 (kobo integers), T3 (tenant_id NOT NULL)

CREATE TABLE IF NOT EXISTS car_wash_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  business_name TEXT NOT NULL,
  lg_permit_number TEXT,
  state TEXT,
  lga TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_car_wash_profiles_tenant ON car_wash_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_car_wash_profiles_workspace ON car_wash_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS car_wash_visits (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  vehicle_plate TEXT NOT NULL,
  wash_type TEXT NOT NULL CHECK(wash_type IN ('basic','full','detailing')),
  price_kobo INTEGER NOT NULL,
  visit_date INTEGER NOT NULL DEFAULT (unixepoch()),
  loyalty_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_car_wash_visits_tenant ON car_wash_visits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_car_wash_visits_workspace ON car_wash_visits(workspace_id, tenant_id);
