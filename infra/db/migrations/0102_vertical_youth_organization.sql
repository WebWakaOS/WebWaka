-- Migration 0102 — Youth Organization / Student Union vertical (M8d)
-- Platform Invariants: T3 (tenant_id NOT NULL), P9 (monetary in kobo)

CREATE TABLE IF NOT EXISTS youth_org_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  org_name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'community_youth',
  cac_reg_number TEXT,
  nysc_coordination TEXT,
  state TEXT,
  lga TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_youth_org_profiles_tenant ON youth_org_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_youth_org_profiles_workspace ON youth_org_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS youth_org_members (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  member_phone TEXT,
  member_name TEXT NOT NULL,
  membership_year INTEGER,
  annual_dues_kobo INTEGER NOT NULL CHECK(annual_dues_kobo >= 0),
  dues_paid INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_youth_org_members_tenant ON youth_org_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_youth_org_members_profile ON youth_org_members(profile_id, tenant_id);

CREATE TABLE IF NOT EXISTS youth_org_events (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_date INTEGER,
  venue TEXT,
  description TEXT,
  attendance_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_youth_org_events_tenant ON youth_org_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_youth_org_events_profile ON youth_org_events(profile_id, tenant_id);

CREATE TABLE IF NOT EXISTS youth_org_scholarships (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  donor_phone TEXT,
  donor_name TEXT,
  donated_amount_kobo INTEGER NOT NULL CHECK(donated_amount_kobo >= 0),
  recipient_name TEXT,
  award_amount_kobo INTEGER NOT NULL CHECK(award_amount_kobo >= 0),
  academic_year TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_youth_org_scholarships_tenant ON youth_org_scholarships(tenant_id);
CREATE INDEX IF NOT EXISTS idx_youth_org_scholarships_profile ON youth_org_scholarships(profile_id, tenant_id);
