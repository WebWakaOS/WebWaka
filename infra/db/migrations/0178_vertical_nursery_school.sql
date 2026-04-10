-- Migration 0178: Nursery / Crèche / Early Childhood Centre vertical (M12)
-- T3: tenant_id NOT NULL; P9: fees in kobo integers
-- P13 (HIGHEST): NO individual child data — ONLY aggregate by age bracket
-- AI: age bracket counts only; no child_ref_id ever stored in AI-facing tables

CREATE TABLE IF NOT EXISTS nursery_school_profiles (
  id               TEXT    PRIMARY KEY,
  workspace_id     TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  school_name      TEXT    NOT NULL,
  subeb_reg        TEXT,   -- State Universal Basic Education Board registration
  lga_edu_cert     TEXT,   -- LGA Education Secretariat certificate
  proprietor_ref   TEXT,   -- opaque (P13)
  capacity         INTEGER NOT NULL DEFAULT 0,
  status           TEXT    NOT NULL DEFAULT 'seeded',
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_nursery_school_profiles_tenant ON nursery_school_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_nursery_school_profiles_workspace ON nursery_school_profiles(workspace_id);

-- AGGREGATE ONLY — no child_ref_id anywhere in this table (P13 absolute)
CREATE TABLE IF NOT EXISTS nursery_enrollment_summary (
  id                   TEXT    PRIMARY KEY,
  profile_id           TEXT    NOT NULL,
  tenant_id            TEXT    NOT NULL,
  term                 TEXT    NOT NULL, -- e.g. '2024/1st'
  age_bracket_0_2      INTEGER NOT NULL DEFAULT 0,
  age_bracket_2_4      INTEGER NOT NULL DEFAULT 0,
  age_bracket_4_6      INTEGER NOT NULL DEFAULT 0,
  total_enrolled       INTEGER NOT NULL DEFAULT 0,
  total_graduated      INTEGER NOT NULL DEFAULT 0,
  created_at           INTEGER NOT NULL,
  updated_at           INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_nursery_enrollment_summary_tenant ON nursery_enrollment_summary(tenant_id);

CREATE TABLE IF NOT EXISTS nursery_fees (
  id              TEXT    PRIMARY KEY,
  profile_id      TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  fee_type        TEXT    NOT NULL DEFAULT 'monthly', -- registration/monthly/termly
  amount_kobo     INTEGER NOT NULL DEFAULT 0,
  academic_year   TEXT    NOT NULL,
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_nursery_fees_tenant ON nursery_fees(tenant_id);

CREATE TABLE IF NOT EXISTS nursery_activities (
  id                TEXT    PRIMARY KEY,
  profile_id        TEXT    NOT NULL,
  tenant_id         TEXT    NOT NULL,
  activity_date     INTEGER NOT NULL,
  activity_type     TEXT    NOT NULL, -- story_time/outdoor_play/music/art/field_trip
  participant_count INTEGER NOT NULL DEFAULT 0, -- count only — no child refs
  created_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_nursery_activities_tenant ON nursery_activities(tenant_id);
