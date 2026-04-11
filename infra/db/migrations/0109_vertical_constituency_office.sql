-- Migration 0109 — Constituency Development Office vertical (M12)
-- Platform Invariants: T3 (tenant_id NOT NULL), P9 (monetary in kobo)
-- AI: L3 HITL MANDATORY — public fund management; NASS transparency

CREATE TABLE IF NOT EXISTS constituency_office_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  legislator_name TEXT NOT NULL,
  office_type TEXT NOT NULL DEFAULT 'rep',
  constituency_name TEXT,
  inec_seat_number TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_constituency_office_profiles_tenant ON constituency_office_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_constituency_office_profiles_workspace ON constituency_office_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS constituency_projects (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'infrastructure',
  lga TEXT,
  allocated_kobo INTEGER NOT NULL CHECK(allocated_kobo >= 0),
  disbursed_kobo INTEGER NOT NULL DEFAULT 0 CHECK(disbursed_kobo >= 0),
  contractor TEXT,
  status TEXT NOT NULL DEFAULT 'planned',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_constituency_projects_tenant ON constituency_projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_constituency_projects_profile ON constituency_projects(profile_id, tenant_id);

CREATE TABLE IF NOT EXISTS constituency_complaints (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  complaint_ref TEXT NOT NULL,
  lga TEXT,
  ward TEXT,
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  assigned_to TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_constituency_complaints_tenant ON constituency_complaints(tenant_id);
CREATE INDEX IF NOT EXISTS idx_constituency_complaints_profile ON constituency_complaints(profile_id, tenant_id);

CREATE TABLE IF NOT EXISTS constituency_outreach (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  event_date INTEGER,
  lga TEXT,
  event_type TEXT,
  attendees_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_constituency_outreach_tenant ON constituency_outreach(tenant_id);
CREATE INDEX IF NOT EXISTS idx_constituency_outreach_profile ON constituency_outreach(profile_id, tenant_id);
