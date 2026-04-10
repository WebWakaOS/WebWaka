-- Migration 0118: Training Institute / Vocational School vertical (M9)
-- FSM: seeded → claimed → nbte_verified → active → suspended
-- P9: course_fee_kobo, enrolment_fee_kobo, exam_fee_kobo as INTEGER
-- T3: tenant_id NOT NULL
-- P13: student_ref_id is opaque UUID

CREATE TABLE IF NOT EXISTS training_institute_profiles (
  id                    TEXT PRIMARY KEY,
  workspace_id          TEXT NOT NULL,
  tenant_id             TEXT NOT NULL,
  institute_name        TEXT NOT NULL,
  nbte_accreditation    TEXT,
  itf_registration      TEXT,
  nabteb_centre_number  TEXT,
  cac_rc                TEXT,
  status                TEXT NOT NULL DEFAULT 'seeded',
  created_at            INTEGER NOT NULL,
  updated_at            INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ti_profiles_tenant ON training_institute_profiles(tenant_id);

CREATE TABLE IF NOT EXISTS ti_courses (
  id                   TEXT PRIMARY KEY,
  profile_id           TEXT NOT NULL,
  tenant_id            TEXT NOT NULL,
  course_name          TEXT NOT NULL,
  trade_area           TEXT,
  duration_weeks       INTEGER NOT NULL,
  course_fee_kobo      INTEGER NOT NULL,
  nbte_approval_number TEXT,
  created_at           INTEGER NOT NULL,
  updated_at           INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ti_courses_tenant ON ti_courses(tenant_id);

CREATE TABLE IF NOT EXISTS ti_students (
  id                TEXT PRIMARY KEY,
  profile_id        TEXT NOT NULL,
  tenant_id         TEXT NOT NULL,
  student_ref_id    TEXT NOT NULL,
  course_id         TEXT NOT NULL,
  enrolment_date    INTEGER,
  enrolment_fee_kobo INTEGER NOT NULL,
  exam_fee_kobo     INTEGER NOT NULL DEFAULT 0,
  nabteb_reg_number TEXT,
  siwes_placement   INTEGER NOT NULL DEFAULT 0,
  cert_issued       INTEGER NOT NULL DEFAULT 0,
  created_at        INTEGER NOT NULL,
  updated_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ti_students_tenant ON ti_students(tenant_id);

CREATE TABLE IF NOT EXISTS ti_trainers (
  id               TEXT PRIMARY KEY,
  profile_id       TEXT NOT NULL,
  tenant_id        TEXT NOT NULL,
  trainer_name     TEXT NOT NULL,
  qualification    TEXT,
  assigned_courses TEXT,
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ti_trainers_tenant ON ti_trainers(tenant_id);
