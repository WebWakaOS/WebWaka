-- Migration 0105 — Book Club / Reading Circle vertical (M12)
-- Platform Invariants: T3 (tenant_id NOT NULL), P9 (monetary in kobo)
-- FSM: 3-state simplified (seeded → claimed → active)

CREATE TABLE IF NOT EXISTS book_club_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  club_name TEXT NOT NULL,
  cac_or_informal TEXT,
  nln_affiliation TEXT,
  state TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_book_club_profiles_tenant ON book_club_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_book_club_profiles_workspace ON book_club_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS book_club_members (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  member_phone TEXT,
  member_name TEXT NOT NULL,
  monthly_dues_kobo INTEGER NOT NULL CHECK(monthly_dues_kobo >= 0),
  dues_status TEXT NOT NULL DEFAULT 'current',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_book_club_members_tenant ON book_club_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_book_club_members_profile ON book_club_members(profile_id, tenant_id);

CREATE TABLE IF NOT EXISTS book_club_readings (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  book_title TEXT NOT NULL,
  author TEXT,
  month INTEGER,
  purchase_cost_kobo INTEGER NOT NULL CHECK(purchase_cost_kobo >= 0),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_book_club_readings_tenant ON book_club_readings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_book_club_readings_profile ON book_club_readings(profile_id, tenant_id);

CREATE TABLE IF NOT EXISTS book_club_meetings (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  meeting_date INTEGER,
  book_discussed TEXT,
  attendance_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_book_club_meetings_tenant ON book_club_meetings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_book_club_meetings_profile ON book_club_meetings(profile_id, tenant_id);
