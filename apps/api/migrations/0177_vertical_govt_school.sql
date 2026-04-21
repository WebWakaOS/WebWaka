-- Migration 0177: Government School Management vertical (M12)
-- T3: tenant_id NOT NULL; P9: grant amounts in kobo integers
-- P13: NO individual student data — aggregate enrollment counts ONLY
-- L2 AI max; aggregate trends only — no student IDs ever

CREATE TABLE IF NOT EXISTS govt_school_profiles (
  id             TEXT    PRIMARY KEY,
  workspace_id   TEXT    NOT NULL,
  tenant_id      TEXT    NOT NULL,
  school_name    TEXT    NOT NULL,
  subeb_ref      TEXT,   -- State Universal Basic Education Board
  ubec_ref       TEXT,   -- Universal Basic Education Commission
  nemis_id       TEXT,   -- National Educational Management Information System
  school_type    TEXT    NOT NULL DEFAULT 'primary', -- primary/secondary/both
  lga            TEXT,
  state          TEXT,
  status         TEXT    NOT NULL DEFAULT 'seeded',
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_govt_school_profiles_tenant ON govt_school_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_govt_school_profiles_workspace ON govt_school_profiles(workspace_id);

CREATE TABLE IF NOT EXISTS school_classes (
  id                TEXT    PRIMARY KEY,
  profile_id        TEXT    NOT NULL,
  tenant_id         TEXT    NOT NULL,
  class_name        TEXT    NOT NULL,
  teacher_ref_id    TEXT,   -- opaque (P13) — no teacher PII to AI
  student_count     INTEGER NOT NULL DEFAULT 0,
  gender_male       INTEGER NOT NULL DEFAULT 0,
  gender_female     INTEGER NOT NULL DEFAULT 0,
  academic_year     TEXT    NOT NULL,
  created_at        INTEGER NOT NULL,
  updated_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_school_classes_tenant ON school_classes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_school_classes_profile ON school_classes(profile_id);

CREATE TABLE IF NOT EXISTS school_enrollment_summary (
  id                    TEXT    PRIMARY KEY,
  profile_id            TEXT    NOT NULL,
  tenant_id             TEXT    NOT NULL,
  academic_year         TEXT    NOT NULL,
  total_enrolled        INTEGER NOT NULL DEFAULT 0,
  total_graduated       INTEGER NOT NULL DEFAULT 0,
  total_dropout         INTEGER NOT NULL DEFAULT 0,
  average_attendance_pct INTEGER NOT NULL DEFAULT 0,
  created_at            INTEGER NOT NULL,
  updated_at            INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_school_enrollment_summary_tenant ON school_enrollment_summary(tenant_id);

CREATE TABLE IF NOT EXISTS school_capitation_grants (
  id                  TEXT    PRIMARY KEY,
  profile_id          TEXT    NOT NULL,
  tenant_id           TEXT    NOT NULL,
  grant_year          TEXT    NOT NULL,
  grant_amount_kobo   INTEGER NOT NULL DEFAULT 0,
  disbursement_date   INTEGER,
  utilised_kobo       INTEGER NOT NULL DEFAULT 0,
  grant_source        TEXT    NOT NULL DEFAULT 'UBEC', -- UBEC/SUBEB/state/federal
  created_at          INTEGER NOT NULL,
  updated_at          INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_school_capitation_grants_tenant ON school_capitation_grants(tenant_id);
