-- Migration: 0082_vertical_cleaning_company.sql
-- Vertical: cleaning-company (M11 Commerce P3) — corporate FM segment
-- FSM: seeded → claimed → cac_verified → active → suspended
-- Platform Invariants: P9 (kobo integers), T3 (tenant_id NOT NULL)

CREATE TABLE IF NOT EXISTS cleaning_company_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  cac_rc TEXT,
  bpp_registration TEXT,
  fmenv_cert TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_cleaning_company_profiles_tenant ON cleaning_company_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_company_profiles_workspace ON cleaning_company_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS fm_contracts (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  sites_count INTEGER NOT NULL DEFAULT 1,
  monthly_fee_kobo INTEGER NOT NULL,
  contract_start INTEGER,
  contract_end INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','paused','expired')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_fm_contracts_tenant ON fm_contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fm_contracts_workspace ON fm_contracts(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS fm_staff_deployments (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  contract_id TEXT NOT NULL,
  staff_name TEXT NOT NULL,
  site_name TEXT NOT NULL,
  shift_type TEXT,
  monthly_salary_kobo INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_fm_staff_deployments_tenant ON fm_staff_deployments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fm_staff_deployments_contract ON fm_staff_deployments(contract_id, tenant_id);

CREATE TABLE IF NOT EXISTS fm_supplies (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  supply_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_cost_kobo INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_fm_supplies_tenant ON fm_supplies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fm_supplies_workspace ON fm_supplies(workspace_id, tenant_id);
