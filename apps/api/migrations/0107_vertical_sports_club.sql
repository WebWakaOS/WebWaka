-- Migration 0107 — Sports Club / Amateur League vertical (M12)
-- Platform Invariants: T3 (tenant_id NOT NULL), P9 (monetary in kobo)
-- Age, jersey_number, match scores stored as INTEGER

CREATE TABLE IF NOT EXISTS sports_club_profiles (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  club_name TEXT NOT NULL,
  sport_type TEXT NOT NULL DEFAULT 'football',
  nsf_affiliation TEXT,
  state_sports_council_reg TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_sports_club_profiles_tenant ON sports_club_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sports_club_profiles_workspace ON sports_club_profiles(workspace_id, tenant_id);

CREATE TABLE IF NOT EXISTS sports_club_players (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  position TEXT,
  age_years INTEGER,
  jersey_number INTEGER,
  monthly_dues_kobo INTEGER NOT NULL CHECK(monthly_dues_kobo >= 0),
  dues_status TEXT NOT NULL DEFAULT 'current',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_sports_club_players_tenant ON sports_club_players(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sports_club_players_profile ON sports_club_players(profile_id, tenant_id);

CREATE TABLE IF NOT EXISTS sports_club_matches (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  opponent TEXT NOT NULL,
  venue TEXT,
  match_date INTEGER,
  result_home INTEGER,
  result_away INTEGER,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_sports_club_matches_tenant ON sports_club_matches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sports_club_matches_profile ON sports_club_matches(profile_id, tenant_id);

CREATE TABLE IF NOT EXISTS sports_club_expenses (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  expense_type TEXT NOT NULL DEFAULT 'equipment',
  description TEXT,
  amount_kobo INTEGER NOT NULL CHECK(amount_kobo >= 0),
  expense_date INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_sports_club_expenses_tenant ON sports_club_expenses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sports_club_expenses_profile ON sports_club_expenses(profile_id, tenant_id);
