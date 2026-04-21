-- Migration 0119: Crèche / Day Care Centre vertical (M12)
-- FSM: seeded → claimed → subeb_verified → active → suspended
-- P9: monthly_fee_kobo, fee_kobo as INTEGER
-- T3: tenant_id NOT NULL
-- P13: child_ref_id is opaque UUID — MOST SENSITIVE child data; L3 HITL ALL AI

CREATE TABLE IF NOT EXISTS creche_profiles (
  id                        TEXT PRIMARY KEY,
  workspace_id              TEXT NOT NULL,
  tenant_id                 TEXT NOT NULL,
  creche_name               TEXT NOT NULL,
  subeb_registration        TEXT,
  state_social_welfare_cert TEXT,
  cac_rc                    TEXT,
  capacity                  INTEGER NOT NULL DEFAULT 0,
  status                    TEXT NOT NULL DEFAULT 'seeded',
  created_at                INTEGER NOT NULL,
  updated_at                INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_creche_profiles_tenant ON creche_profiles(tenant_id);

CREATE TABLE IF NOT EXISTS creche_children (
  id               TEXT PRIMARY KEY,
  profile_id       TEXT NOT NULL,
  tenant_id        TEXT NOT NULL,
  child_ref_id     TEXT NOT NULL,
  age_months       INTEGER NOT NULL,
  admission_date   INTEGER,
  monthly_fee_kobo INTEGER NOT NULL,
  status           TEXT NOT NULL DEFAULT 'active',
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_creche_children_tenant ON creche_children(tenant_id);
CREATE INDEX IF NOT EXISTS idx_creche_children_profile ON creche_children(profile_id);

CREATE TABLE IF NOT EXISTS creche_attendance (
  id              TEXT PRIMARY KEY,
  profile_id      TEXT NOT NULL,
  tenant_id       TEXT NOT NULL,
  child_ref_id    TEXT NOT NULL,
  attendance_date INTEGER NOT NULL,
  present         INTEGER NOT NULL DEFAULT 0,
  created_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_creche_attendance_tenant ON creche_attendance(tenant_id);

CREATE TABLE IF NOT EXISTS creche_billing (
  id               TEXT PRIMARY KEY,
  profile_id       TEXT NOT NULL,
  tenant_id        TEXT NOT NULL,
  child_ref_id     TEXT NOT NULL,
  billing_period   TEXT NOT NULL,
  fee_kobo         INTEGER NOT NULL,
  paid_kobo        INTEGER NOT NULL DEFAULT 0,
  outstanding_kobo INTEGER NOT NULL DEFAULT 0,
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_creche_billing_tenant ON creche_billing(tenant_id);
