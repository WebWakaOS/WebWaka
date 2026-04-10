-- Migration 0166: Land Surveyor / Registry Agent vertical (M11)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- P13: client_ref_id, title_ref, surcon_ref opaque — NEVER to AI
-- L2 max AI; L3 HITL for any land-identity adjacent output

CREATE TABLE IF NOT EXISTS land_surveyor_profiles (
  id              TEXT    PRIMARY KEY,
  workspace_id    TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  company_name    TEXT    NOT NULL,
  surcon_licence  TEXT,   -- Survey Registration Council of Nigeria
  cac_rc          TEXT,
  specialisation  TEXT    NOT NULL DEFAULT 'general', -- boundary/topographic/cadastral/general
  status          TEXT    NOT NULL DEFAULT 'seeded',
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_land_surveyor_profiles_tenant ON land_surveyor_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_land_surveyor_profiles_workspace ON land_surveyor_profiles(workspace_id);

CREATE TABLE IF NOT EXISTS survey_jobs (
  id                      TEXT    PRIMARY KEY,
  profile_id              TEXT    NOT NULL,
  tenant_id               TEXT    NOT NULL,
  client_ref_id           TEXT    NOT NULL, -- opaque (P13)
  title_ref               TEXT,             -- opaque (P13) — land parcel identity, never to AI
  survey_type             TEXT    NOT NULL, -- boundary/topographic/cadastral/subdivision/beacon_renewal
  location                TEXT,
  professional_fee_kobo   INTEGER NOT NULL DEFAULT 0,
  disbursement_kobo       INTEGER NOT NULL DEFAULT 0,
  total_kobo              INTEGER NOT NULL DEFAULT 0,
  job_date                INTEGER NOT NULL,
  completed_date          INTEGER,
  status                  TEXT    NOT NULL DEFAULT 'enquiry', -- enquiry/site_visit/surveying/computation/report/delivered
  created_at              INTEGER NOT NULL,
  updated_at              INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_survey_jobs_tenant ON survey_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_survey_jobs_profile ON survey_jobs(profile_id);

CREATE TABLE IF NOT EXISTS survey_equipment (
  id                    TEXT    PRIMARY KEY,
  profile_id            TEXT    NOT NULL,
  tenant_id             TEXT    NOT NULL,
  equipment_name        TEXT    NOT NULL,
  model                 TEXT,
  purchase_cost_kobo    INTEGER NOT NULL DEFAULT 0,
  purchase_date         INTEGER,
  calibration_due       INTEGER,
  status                TEXT    NOT NULL DEFAULT 'active',
  created_at            INTEGER NOT NULL,
  updated_at            INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_survey_equipment_tenant ON survey_equipment(tenant_id);
