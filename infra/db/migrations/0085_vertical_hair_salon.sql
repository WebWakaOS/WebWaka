-- Migration: 0085_vertical_hair_salon.sql
-- Vertical: hair-salon (M10 Commerce P3) — barbing/braiding informal
-- FSM: seeded → claimed → active (3-state informal)
-- Platform Invariants: P9 (kobo integers), T3 (tenant_id NOT NULL)

CREATE TABLE IF NOT EXISTS hair_salon_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  salon_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('barbing','braiding','mixed')),
  lg_permit_number TEXT,
  state TEXT,
  lga TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_hair_salon_profiles_tenant ON hair_salon_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hair_salon_profiles_workspace ON hair_salon_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS hair_salon_services (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  price_kobo INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_hair_salon_services_tenant ON hair_salon_services(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hair_salon_services_workspace ON hair_salon_services(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS hair_salon_daily_log (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  log_date INTEGER NOT NULL,
  customers_served INTEGER NOT NULL DEFAULT 0,
  revenue_kobo INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_hair_salon_daily_log_tenant ON hair_salon_daily_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hair_salon_daily_log_workspace ON hair_salon_daily_log(workspace_id, tenant_id);
