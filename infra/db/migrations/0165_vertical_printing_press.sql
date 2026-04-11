-- Migration 0165: Printing Press / Design Studio vertical (M11)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- P13: client_ref_id opaque

CREATE TABLE IF NOT EXISTS printing_press_profiles (
  id           TEXT    PRIMARY KEY,
  workspace_id TEXT    NOT NULL,
  tenant_id    TEXT    NOT NULL,
  company_name TEXT    NOT NULL,
  apcon_ref    TEXT,
  nan_ref      TEXT,
  cac_rc       TEXT,
  press_type   TEXT    NOT NULL DEFAULT 'mixed', -- offset/digital/large_format/mixed
  status       TEXT    NOT NULL DEFAULT 'seeded',
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_printing_press_profiles_tenant ON printing_press_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_printing_press_profiles_workspace ON printing_press_profiles(workspace_id);

CREATE TABLE IF NOT EXISTS print_press_jobs (
  id              TEXT    PRIMARY KEY,
  profile_id      TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  client_ref_id   TEXT    NOT NULL, -- opaque (P13)
  job_type        TEXT    NOT NULL, -- offset/digital/large_format/book/newspaper/advertising
  quantity        INTEGER NOT NULL DEFAULT 1,
  paper_type      TEXT,
  finishing       TEXT,   -- lamination/binding/cutting/none
  unit_cost_kobo  INTEGER NOT NULL DEFAULT 0,
  total_kobo      INTEGER NOT NULL DEFAULT 0,
  deposit_kobo    INTEGER NOT NULL DEFAULT 0,
  proof_approved  INTEGER NOT NULL DEFAULT 0,
  delivery_date   INTEGER,
  status          TEXT    NOT NULL DEFAULT 'quoted', -- quoted/proof_sent/approved/printing/finishing/ready/delivered
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_print_press_jobs_tenant ON print_press_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_print_press_jobs_profile ON print_press_jobs(profile_id);

CREATE TABLE IF NOT EXISTS press_schedule (
  id              TEXT    PRIMARY KEY,
  profile_id      TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  machine_name    TEXT    NOT NULL,
  job_id          TEXT    NOT NULL,
  scheduled_date  INTEGER NOT NULL,
  estimated_hours INTEGER NOT NULL DEFAULT 1,
  created_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_press_schedule_tenant ON press_schedule(tenant_id);

CREATE TABLE IF NOT EXISTS press_materials (
  id               TEXT    PRIMARY KEY,
  profile_id       TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  paper_name       TEXT    NOT NULL,
  gsm              INTEGER NOT NULL DEFAULT 80,
  reams_in_stock   INTEGER NOT NULL DEFAULT 0,
  cost_per_ream_kobo INTEGER NOT NULL DEFAULT 0,
  reorder_level    INTEGER NOT NULL DEFAULT 5,
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_press_materials_tenant ON press_materials(tenant_id);
