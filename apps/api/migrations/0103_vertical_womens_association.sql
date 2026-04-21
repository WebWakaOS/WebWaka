-- Migration 0103 — Women's Association / Forum vertical (M8d)
-- Platform Invariants: T3 (tenant_id NOT NULL), P9 (monetary in kobo)

CREATE TABLE IF NOT EXISTS womens_assoc_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  assoc_name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'community',
  cac_reg TEXT,
  nwec_affiliation TEXT,
  state TEXT,
  lga TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_womens_assoc_profiles_tenant ON womens_assoc_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_womens_assoc_profiles_workspace ON womens_assoc_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS womens_assoc_members (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  member_phone TEXT,
  member_name TEXT NOT NULL,
  monthly_contribution_kobo INTEGER NOT NULL CHECK(monthly_contribution_kobo >= 0),
  contribution_status TEXT NOT NULL DEFAULT 'current',
  joined_date INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_womens_assoc_members_tenant ON womens_assoc_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_womens_assoc_members_profile ON womens_assoc_members(profile_id, tenant_id);

CREATE TABLE IF NOT EXISTS womens_assoc_welfare (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  welfare_type TEXT NOT NULL DEFAULT 'loan',
  amount_kobo INTEGER NOT NULL CHECK(amount_kobo > 0),
  repayment_schedule TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_womens_assoc_welfare_tenant ON womens_assoc_welfare(tenant_id);
CREATE INDEX IF NOT EXISTS idx_womens_assoc_welfare_profile ON womens_assoc_welfare(profile_id, tenant_id);

CREATE TABLE IF NOT EXISTS womens_assoc_meetings (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  meeting_date INTEGER,
  agenda TEXT,
  minutes_text TEXT,
  attendance_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_womens_assoc_meetings_tenant ON womens_assoc_meetings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_womens_assoc_meetings_profile ON womens_assoc_meetings(profile_id, tenant_id);
