-- Migration 0175: Market Leaders / Traders Association vertical (M12)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- P13: member_ref_id opaque — aggregate only to AI

CREATE TABLE IF NOT EXISTS market_association_profiles (
  id               TEXT    PRIMARY KEY,
  workspace_id     TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  association_name TEXT    NOT NULL,
  cac_it_cert      TEXT,
  market_name      TEXT,
  state            TEXT,
  lga              TEXT,
  status           TEXT    NOT NULL DEFAULT 'seeded',
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_market_association_profiles_tenant ON market_association_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_market_association_profiles_workspace ON market_association_profiles(workspace_id);

CREATE TABLE IF NOT EXISTS market_members (
  id                   TEXT    PRIMARY KEY,
  profile_id           TEXT    NOT NULL,
  tenant_id            TEXT    NOT NULL,
  member_ref_id        TEXT    NOT NULL, -- opaque (P13)
  stall_number         TEXT,
  trade_type           TEXT,
  dues_monthly_kobo    INTEGER NOT NULL DEFAULT 0,
  registration_date    INTEGER NOT NULL,
  status               TEXT    NOT NULL DEFAULT 'active', -- active/inactive/suspended
  created_at           INTEGER NOT NULL,
  updated_at           INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_market_members_tenant ON market_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_market_members_profile ON market_members(profile_id);

CREATE TABLE IF NOT EXISTS market_levies (
  id              TEXT    PRIMARY KEY,
  profile_id      TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  member_ref_id   TEXT    NOT NULL, -- opaque (P13)
  levy_type       TEXT    NOT NULL DEFAULT 'monthly', -- daily/weekly/monthly/special
  amount_kobo     INTEGER NOT NULL DEFAULT 0,
  payment_date    INTEGER NOT NULL,
  created_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_market_levies_tenant ON market_levies(tenant_id);

CREATE TABLE IF NOT EXISTS market_meetings (
  id               TEXT    PRIMARY KEY,
  profile_id       TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  meeting_date     INTEGER NOT NULL,
  attendance_count INTEGER NOT NULL DEFAULT 0,
  resolutions      TEXT,
  created_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_market_meetings_tenant ON market_meetings(tenant_id);
