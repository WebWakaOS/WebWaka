-- Migration 0133: Funeral Home / Mortuary vertical (M12)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- P13: case_ref_id is opaque UUID — deceased identity NEVER stored; family_contact_phone for billing only
-- L3 HITL MANDATORY for ALL AI

CREATE TABLE IF NOT EXISTS funeral_home_profiles (
  id                   TEXT    PRIMARY KEY,
  workspace_id         TEXT    NOT NULL,
  tenant_id            TEXT    NOT NULL,
  business_name        TEXT    NOT NULL,
  state_mortuary_permit TEXT,
  lg_burial_permit     TEXT,
  cac_rc               TEXT,
  status               TEXT    NOT NULL DEFAULT 'seeded',
  created_at           INTEGER NOT NULL,
  updated_at           INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_funeral_home_profiles_tenant ON funeral_home_profiles(tenant_id);

CREATE TABLE IF NOT EXISTS funeral_cases (
  id                   TEXT    PRIMARY KEY,
  profile_id           TEXT    NOT NULL,
  tenant_id            TEXT    NOT NULL,
  case_ref_id          TEXT    NOT NULL UNIQUE,
  family_contact_phone TEXT    NOT NULL,
  burial_type          TEXT    NOT NULL, -- christian/muslim/traditional/other
  date_of_passing      INTEGER NOT NULL,
  burial_date          INTEGER,
  total_kobo           INTEGER NOT NULL,
  deposit_kobo         INTEGER NOT NULL DEFAULT 0,
  balance_kobo         INTEGER NOT NULL,
  burial_permit_ref    TEXT,
  status               TEXT    NOT NULL DEFAULT 'active', -- active/completed
  created_at           INTEGER NOT NULL,
  updated_at           INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_funeral_cases_tenant ON funeral_cases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_funeral_cases_profile ON funeral_cases(profile_id);

CREATE TABLE IF NOT EXISTS funeral_services (
  id           TEXT    PRIMARY KEY,
  profile_id   TEXT    NOT NULL,
  tenant_id    TEXT    NOT NULL,
  case_ref_id  TEXT    NOT NULL,
  service_type TEXT    NOT NULL, -- embalming/casket/hearse/flowers/venue/burial_permit
  cost_kobo    INTEGER NOT NULL,
  created_at   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_funeral_services_tenant ON funeral_services(tenant_id);
