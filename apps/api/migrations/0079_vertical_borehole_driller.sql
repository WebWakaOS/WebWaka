-- Migration: 0079_vertical_borehole_driller.sql
-- Vertical: borehole-driller (M12 Commerce P3)
-- FSM: seeded → claimed → coren_verified → active → suspended
-- Platform Invariants: P9 (kobo integers), T3 (tenant_id NOT NULL)

CREATE TABLE IF NOT EXISTS borehole_driller_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  coren_number TEXT,
  state_water_board_reg TEXT,
  cac_rc TEXT,
  rig_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_borehole_driller_profiles_tenant ON borehole_driller_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_borehole_driller_profiles_workspace ON borehole_driller_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS borehole_projects (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  location_address TEXT NOT NULL,
  state TEXT,
  depth_metres INTEGER NOT NULL,
  casing_type TEXT,
  total_cost_kobo INTEGER NOT NULL,
  deposit_kobo INTEGER NOT NULL DEFAULT 0,
  balance_kobo INTEGER NOT NULL DEFAULT 0,
  water_board_approval_number TEXT,
  status TEXT NOT NULL DEFAULT 'survey' CHECK(status IN ('survey','drilling','casing','pump_test','handover','completed')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_borehole_projects_tenant ON borehole_projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_borehole_projects_workspace ON borehole_projects(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS borehole_rigs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  rig_name TEXT NOT NULL,
  rig_capacity_metres INTEGER NOT NULL,
  current_project_id TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available','deployed','maintenance')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_borehole_rigs_tenant ON borehole_rigs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_borehole_rigs_workspace ON borehole_rigs(workspace_id, tenant_id);
