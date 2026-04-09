-- Migration: 0084_vertical_generator_dealer.sql
-- Vertical: generator-dealer (M11 Commerce P3)
-- FSM: seeded → claimed → son_verified → active → suspended
-- Platform Invariants: P9 (kobo integers), T3 (tenant_id NOT NULL)

CREATE TABLE IF NOT EXISTS generator_dealer_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  cac_rc TEXT,
  son_dealership TEXT,
  dpr_fuel_licence TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_generator_dealer_profiles_tenant ON generator_dealer_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_generator_dealer_profiles_workspace ON generator_dealer_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS generator_units (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  brand TEXT NOT NULL,
  kva INTEGER NOT NULL,
  serial_number TEXT NOT NULL,
  sale_price_kobo INTEGER NOT NULL,
  warranty_months INTEGER NOT NULL DEFAULT 12,
  status TEXT NOT NULL DEFAULT 'in_stock' CHECK(status IN ('in_stock','sold','on_loan')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_generator_units_tenant ON generator_units(tenant_id);
CREATE INDEX IF NOT EXISTS idx_generator_units_workspace ON generator_units(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS generator_service_jobs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  unit_serial TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  fault_description TEXT NOT NULL,
  labour_kobo INTEGER NOT NULL,
  parts_kobo INTEGER NOT NULL DEFAULT 0,
  total_kobo INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked' CHECK(status IN ('booked','in_service','completed')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_generator_service_jobs_tenant ON generator_service_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_generator_service_jobs_workspace ON generator_service_jobs(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS generator_spare_parts (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  part_name TEXT NOT NULL,
  compatible_brands TEXT NOT NULL DEFAULT '[]',
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_cost_kobo INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_generator_spare_parts_tenant ON generator_spare_parts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_generator_spare_parts_workspace ON generator_spare_parts(workspace_id, tenant_id);
