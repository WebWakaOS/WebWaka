-- Migration 0110 — Ward Representative / Polling Unit vertical (M12)
-- Platform Invariants: T3 (tenant_id NOT NULL), P9 (monetary in kobo)
-- AI: L3 HITL MANDATORY — political content; registered_voters as INTEGER
-- FSM: 3-state simplified (seeded → claimed → active)

CREATE TABLE IF NOT EXISTS ward_rep_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  councillor_name TEXT NOT NULL,
  ward_name TEXT NOT NULL,
  lga TEXT,
  state TEXT,
  inec_ward_code TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_ward_rep_profiles_tenant ON ward_rep_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ward_rep_profiles_workspace ON ward_rep_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS ward_polling_units (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  unit_number TEXT NOT NULL,
  address TEXT,
  registered_voters INTEGER NOT NULL DEFAULT 0 CHECK(registered_voters >= 0),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_ward_polling_units_tenant ON ward_polling_units(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ward_polling_units_profile ON ward_polling_units(profile_id, tenant_id);

CREATE TABLE IF NOT EXISTS ward_projects (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  category TEXT,
  amount_kobo INTEGER NOT NULL CHECK(amount_kobo >= 0),
  status TEXT NOT NULL DEFAULT 'planned',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_ward_projects_tenant ON ward_projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ward_projects_profile ON ward_projects(profile_id, tenant_id);

CREATE TABLE IF NOT EXISTS ward_service_requests (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  request_type TEXT NOT NULL,
  description TEXT,
  ward TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_ward_service_requests_tenant ON ward_service_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ward_service_requests_profile ON ward_service_requests(profile_id, tenant_id);
