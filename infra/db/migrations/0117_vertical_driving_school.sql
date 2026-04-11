-- Migration 0117: Driving School vertical (M9)
-- FSM: seeded → claimed → frsc_verified → active → suspended
-- P9: enrolment_fee_kobo, purchase_cost_kobo as INTEGER
-- T3: tenant_id NOT NULL on all tables
-- P13: student_ref_id is opaque UUID — no student names, clinical detail

CREATE TABLE IF NOT EXISTS driving_school_profiles (
  id                TEXT PRIMARY KEY,
  workspace_id      TEXT NOT NULL,
  tenant_id         TEXT NOT NULL,
  school_name       TEXT NOT NULL,
  frsc_registration TEXT,
  state             TEXT,
  cac_rc            TEXT,
  status            TEXT NOT NULL DEFAULT 'seeded',
  created_at        INTEGER NOT NULL,
  updated_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ds_profiles_tenant ON driving_school_profiles(tenant_id);

CREATE TABLE IF NOT EXISTS ds_students (
  id                  TEXT PRIMARY KEY,
  profile_id          TEXT NOT NULL,
  tenant_id           TEXT NOT NULL,
  student_ref_id      TEXT NOT NULL,
  course_type         TEXT NOT NULL DEFAULT 'car',
  enrolment_fee_kobo  INTEGER NOT NULL,
  lessons_paid        INTEGER NOT NULL DEFAULT 0,
  start_date          INTEGER,
  frsc_test_date      INTEGER,
  test_status         TEXT NOT NULL DEFAULT 'pending',
  cert_issued         INTEGER NOT NULL DEFAULT 0,
  created_at          INTEGER NOT NULL,
  updated_at          INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ds_students_tenant ON ds_students(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ds_students_profile ON ds_students(profile_id);

CREATE TABLE IF NOT EXISTS ds_lessons (
  id             TEXT PRIMARY KEY,
  profile_id     TEXT NOT NULL,
  tenant_id      TEXT NOT NULL,
  student_ref_id TEXT NOT NULL,
  instructor_id  TEXT NOT NULL,
  vehicle_id     TEXT NOT NULL,
  lesson_date    INTEGER NOT NULL,
  lesson_type    TEXT NOT NULL DEFAULT 'practical',
  attended       INTEGER NOT NULL DEFAULT 0,
  created_at     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ds_lessons_tenant ON ds_lessons(tenant_id);

CREATE TABLE IF NOT EXISTS ds_vehicles (
  id                   TEXT PRIMARY KEY,
  profile_id           TEXT NOT NULL,
  tenant_id            TEXT NOT NULL,
  vehicle_plate        TEXT NOT NULL,
  type                 TEXT NOT NULL DEFAULT 'car',
  purchase_cost_kobo   INTEGER NOT NULL,
  last_service_date    INTEGER,
  status               TEXT NOT NULL DEFAULT 'active',
  created_at           INTEGER NOT NULL,
  updated_at           INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ds_vehicles_tenant ON ds_vehicles(tenant_id);
