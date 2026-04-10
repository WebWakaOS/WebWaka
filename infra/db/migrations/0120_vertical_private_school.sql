-- Migration 0120: Private School Operator vertical (M12)
-- FSM: seeded → claimed → subeb_verified → active → suspended
-- P9: term_fee_kobo, monthly_salary_kobo as INTEGER
-- T3: tenant_id NOT NULL
-- P13: student_ref_id opaque UUID; no individual grades to AI

CREATE TABLE IF NOT EXISTS private_school_profiles (
  id                  TEXT PRIMARY KEY,
  workspace_id        TEXT NOT NULL,
  tenant_id           TEXT NOT NULL,
  school_name         TEXT NOT NULL,
  subeb_approval      TEXT,
  waec_centre_number  TEXT,
  neco_centre_number  TEXT,
  cac_rc              TEXT,
  school_type         TEXT NOT NULL DEFAULT 'primary',
  status              TEXT NOT NULL DEFAULT 'seeded',
  created_at          INTEGER NOT NULL,
  updated_at          INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ps_profiles_tenant ON private_school_profiles(tenant_id);

CREATE TABLE IF NOT EXISTS school_students (
  id                  TEXT PRIMARY KEY,
  profile_id          TEXT NOT NULL,
  tenant_id           TEXT NOT NULL,
  student_ref_id      TEXT NOT NULL,
  class_level         TEXT NOT NULL,
  admission_date      INTEGER,
  term_fee_kobo       INTEGER NOT NULL,
  waec_neco_reg_number TEXT,
  status              TEXT NOT NULL DEFAULT 'active',
  created_at          INTEGER NOT NULL,
  updated_at          INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_school_students_tenant ON school_students(tenant_id);
CREATE INDEX IF NOT EXISTS idx_school_students_profile ON school_students(profile_id);

CREATE TABLE IF NOT EXISTS school_fees_log (
  id           TEXT PRIMARY KEY,
  profile_id   TEXT NOT NULL,
  tenant_id    TEXT NOT NULL,
  student_ref_id TEXT NOT NULL,
  term         TEXT NOT NULL,
  fee_kobo     INTEGER NOT NULL,
  paid_kobo    INTEGER NOT NULL DEFAULT 0,
  outstanding_kobo INTEGER NOT NULL DEFAULT 0,
  payment_date INTEGER,
  created_at   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_school_fees_tenant ON school_fees_log(tenant_id);

CREATE TABLE IF NOT EXISTS school_teachers (
  id                   TEXT PRIMARY KEY,
  profile_id           TEXT NOT NULL,
  tenant_id            TEXT NOT NULL,
  teacher_name         TEXT NOT NULL,
  qualification        TEXT,
  assigned_class       TEXT,
  monthly_salary_kobo  INTEGER NOT NULL,
  created_at           INTEGER NOT NULL,
  updated_at           INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_school_teachers_tenant ON school_teachers(tenant_id);
