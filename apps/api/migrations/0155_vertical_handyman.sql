-- Migration 0155: Handyman / Plumber / Electrician vertical (M9)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- P13: client_ref_id opaque

CREATE TABLE IF NOT EXISTS handyman_profiles (
  id                 TEXT    PRIMARY KEY,
  workspace_id       TEXT    NOT NULL,
  tenant_id          TEXT    NOT NULL,
  business_name      TEXT    NOT NULL,
  trade_type         TEXT    NOT NULL DEFAULT 'all', -- plumbing/electrical/general/all
  coren_awareness    TEXT,
  nabteb_cert        TEXT,
  cac_rc             TEXT,
  state              TEXT,
  lga                TEXT,
  status             TEXT    NOT NULL DEFAULT 'seeded',
  created_at         INTEGER NOT NULL,
  updated_at         INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_handyman_profiles_tenant ON handyman_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_handyman_profiles_workspace ON handyman_profiles(workspace_id);

CREATE TABLE IF NOT EXISTS handyman_jobs (
  id                  TEXT    PRIMARY KEY,
  profile_id          TEXT    NOT NULL,
  tenant_id           TEXT    NOT NULL,
  client_ref_id       TEXT    NOT NULL, -- opaque (P13)
  job_type            TEXT    NOT NULL, -- plumbing/electrical/carpentry/painting/general
  description         TEXT,
  material_cost_kobo  INTEGER NOT NULL DEFAULT 0,
  labour_cost_kobo    INTEGER NOT NULL DEFAULT 0,
  total_kobo          INTEGER NOT NULL DEFAULT 0,
  job_date            INTEGER NOT NULL,
  completed_date      INTEGER,
  warranty_days       INTEGER NOT NULL DEFAULT 0,
  status              TEXT    NOT NULL DEFAULT 'logged', -- logged/in_progress/completed/warranty_claim
  created_at          INTEGER NOT NULL,
  updated_at          INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_handyman_jobs_tenant ON handyman_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_handyman_jobs_profile ON handyman_jobs(profile_id);

CREATE TABLE IF NOT EXISTS handyman_materials (
  id               TEXT    PRIMARY KEY,
  profile_id       TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  material_name    TEXT    NOT NULL,
  unit             TEXT    NOT NULL DEFAULT 'piece',
  quantity         INTEGER NOT NULL DEFAULT 0,
  unit_cost_kobo   INTEGER NOT NULL DEFAULT 0,
  reorder_level    INTEGER NOT NULL DEFAULT 5,
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_handyman_materials_tenant ON handyman_materials(tenant_id);
