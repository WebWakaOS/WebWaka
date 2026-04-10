-- Migration 0174: Ministry / Apostolic Mission / Outreach vertical (M12)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- P13: donor_ref opaque — no PII to AI; tithe/offering aggregate only
-- Incorporated Trustee (IT) registration with CAC

CREATE TABLE IF NOT EXISTS ministry_mission_profiles (
  id                    TEXT    PRIMARY KEY,
  workspace_id          TEXT    NOT NULL,
  tenant_id             TEXT    NOT NULL,
  ministry_name         TEXT    NOT NULL,
  it_number             TEXT,   -- Incorporated Trustee CAC IT number
  cac_it_cert           TEXT,
  denomination          TEXT,
  founding_pastor_ref   TEXT,   -- opaque (P13)
  org_type              TEXT    NOT NULL DEFAULT 'church', -- church/mosque/mission/outreach
  status                TEXT    NOT NULL DEFAULT 'seeded',
  created_at            INTEGER NOT NULL,
  updated_at            INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ministry_mission_profiles_tenant ON ministry_mission_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ministry_mission_profiles_workspace ON ministry_mission_profiles(workspace_id);

CREATE TABLE IF NOT EXISTS ministry_services (
  id               TEXT    PRIMARY KEY,
  profile_id       TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  service_type     TEXT    NOT NULL, -- sunday/midweek/friday_juma/special/outreach
  scheduled_date   INTEGER NOT NULL,
  attendance_count INTEGER NOT NULL DEFAULT 0,
  offering_kobo    INTEGER NOT NULL DEFAULT 0,
  tithe_kobo       INTEGER NOT NULL DEFAULT 0,
  notes            TEXT,
  created_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ministry_services_tenant ON ministry_services(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ministry_services_profile ON ministry_services(profile_id);

CREATE TABLE IF NOT EXISTS ministry_donations (
  id               TEXT    PRIMARY KEY,
  profile_id       TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  donor_ref        TEXT    NOT NULL, -- opaque/anonymous (P13) — never to AI
  amount_kobo      INTEGER NOT NULL DEFAULT 0,
  donation_date    INTEGER NOT NULL,
  category         TEXT    NOT NULL DEFAULT 'offering', -- tithe/offering/special/building_fund/missions
  created_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ministry_donations_tenant ON ministry_donations(tenant_id);

CREATE TABLE IF NOT EXISTS ministry_outreach (
  id                TEXT    PRIMARY KEY,
  profile_id        TEXT    NOT NULL,
  tenant_id         TEXT    NOT NULL,
  outreach_type     TEXT    NOT NULL, -- feeding/health/education/skill/evangelism
  outreach_date     INTEGER NOT NULL,
  beneficiary_count INTEGER NOT NULL DEFAULT 0,
  cost_kobo         INTEGER NOT NULL DEFAULT 0,
  location          TEXT,
  created_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ministry_outreach_tenant ON ministry_outreach(tenant_id);
