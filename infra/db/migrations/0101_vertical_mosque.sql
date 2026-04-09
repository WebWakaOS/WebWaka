-- Migration 0101 — Mosque / Islamic Centre vertical (M8d)
-- Platform Invariants: T3 (tenant_id NOT NULL), P9 (monetary in kobo)

CREATE TABLE IF NOT EXISTS mosque_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  mosque_name TEXT NOT NULL,
  nscia_affiliation_number TEXT,
  it_registration_number TEXT,
  state TEXT,
  lga TEXT,
  congregation_size INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_mosque_profiles_tenant ON mosque_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mosque_profiles_workspace ON mosque_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS mosque_donations (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  donor_anonymous INTEGER NOT NULL DEFAULT 0,
  donor_phone TEXT,
  donation_type TEXT NOT NULL DEFAULT 'general',
  amount_kobo INTEGER NOT NULL CHECK(amount_kobo >= 0),
  donation_date INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_mosque_donations_tenant ON mosque_donations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mosque_donations_profile ON mosque_donations(profile_id, tenant_id);

CREATE TABLE IF NOT EXISTS mosque_programmes (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  programme_name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'lecture',
  scheduled_date INTEGER,
  attendance_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_mosque_programmes_tenant ON mosque_programmes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mosque_programmes_profile ON mosque_programmes(profile_id, tenant_id);

CREATE TABLE IF NOT EXISTS mosque_members (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  member_phone TEXT,
  member_name TEXT NOT NULL,
  zakat_eligible INTEGER NOT NULL DEFAULT 0,
  joined_date INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_mosque_members_tenant ON mosque_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mosque_members_profile ON mosque_members(profile_id, tenant_id);
