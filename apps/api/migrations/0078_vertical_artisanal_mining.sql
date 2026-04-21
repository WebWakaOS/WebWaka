-- Migration: 0078_vertical_artisanal_mining.sql
-- Vertical: artisanal-mining (M12 Commerce P3)
-- FSM: seeded → claimed → mmsd_verified → active → suspended
-- Platform Invariants: P9 (kobo/gram integers), T3 (tenant_id NOT NULL)

CREATE TABLE IF NOT EXISTS artisanal_mining_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  mmsd_permit TEXT,
  mineral_type TEXT,
  state TEXT,
  lga TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_artisanal_mining_profiles_tenant ON artisanal_mining_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_artisanal_mining_profiles_workspace ON artisanal_mining_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS mining_production_log (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  mineral_type TEXT NOT NULL,
  weight_grams INTEGER NOT NULL,
  quality_grade TEXT,
  sale_price_kobo INTEGER NOT NULL,
  offtaker_name TEXT,
  sale_date INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_mining_production_log_tenant ON mining_production_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mining_production_log_workspace ON mining_production_log(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS mining_permits (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  permit_number TEXT NOT NULL,
  permit_type TEXT,
  valid_from INTEGER,
  valid_until INTEGER,
  state TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_mining_permits_tenant ON mining_permits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mining_permits_workspace ON mining_permits(workspace_id, tenant_id);
