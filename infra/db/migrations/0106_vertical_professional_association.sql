-- Migration 0106 — Professional Association (NBA/NMA/ICAN) vertical (M12)
-- Platform Invariants: T3 (tenant_id NOT NULL), P9 (monetary in kobo)
-- CPD credits stored as INTEGER hours

CREATE TABLE IF NOT EXISTS professional_assoc_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  assoc_name TEXT NOT NULL,
  assoc_type TEXT NOT NULL DEFAULT 'other',
  regulatory_body TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_professional_assoc_profiles_tenant ON professional_assoc_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_professional_assoc_profiles_workspace ON professional_assoc_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS professional_assoc_members (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  member_number TEXT,
  member_name TEXT NOT NULL,
  specialisation TEXT,
  annual_dues_kobo INTEGER NOT NULL CHECK(annual_dues_kobo >= 0),
  cert_valid_until INTEGER,
  cpd_credits_required INTEGER NOT NULL DEFAULT 0,
  cpd_credits_earned INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_professional_assoc_members_tenant ON professional_assoc_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_professional_assoc_members_profile ON professional_assoc_members(profile_id, tenant_id);

CREATE TABLE IF NOT EXISTS professional_assoc_cpd (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  training_name TEXT NOT NULL,
  provider TEXT,
  credits_earned INTEGER NOT NULL CHECK(credits_earned >= 0),
  completion_date INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_professional_assoc_cpd_tenant ON professional_assoc_cpd(tenant_id);
CREATE INDEX IF NOT EXISTS idx_professional_assoc_cpd_member ON professional_assoc_cpd(member_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_professional_assoc_cpd_profile ON professional_assoc_cpd(profile_id, tenant_id);
