-- Migration 0176: Motivational Speaker / Training Firm vertical (M12)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- P13: client_ref_id, participant_ref opaque

CREATE TABLE IF NOT EXISTS motivational_speaker_profiles (
  id                    TEXT    PRIMARY KEY,
  workspace_id          TEXT    NOT NULL,
  tenant_id             TEXT    NOT NULL,
  business_name         TEXT    NOT NULL,
  speaker_name          TEXT    NOT NULL,
  cac_rc                TEXT,
  specialisation        TEXT,
  itf_training_affiliate INTEGER NOT NULL DEFAULT 0,
  status                TEXT    NOT NULL DEFAULT 'seeded',
  created_at            INTEGER NOT NULL,
  updated_at            INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_motivational_speaker_profiles_tenant ON motivational_speaker_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_motivational_speaker_profiles_workspace ON motivational_speaker_profiles(workspace_id);

CREATE TABLE IF NOT EXISTS speaking_engagements (
  id             TEXT    PRIMARY KEY,
  profile_id     TEXT    NOT NULL,
  tenant_id      TEXT    NOT NULL,
  client_ref_id  TEXT    NOT NULL, -- opaque (P13)
  event_name     TEXT    NOT NULL,
  event_date     INTEGER NOT NULL,
  audience_size  INTEGER NOT NULL DEFAULT 0,
  fee_kobo       INTEGER NOT NULL DEFAULT 0,
  travel_kobo    INTEGER NOT NULL DEFAULT 0,
  total_kobo     INTEGER NOT NULL DEFAULT 0,
  status         TEXT    NOT NULL DEFAULT 'enquiry', -- enquiry/confirmed/completed/cancelled
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_speaking_engagements_tenant ON speaking_engagements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_speaking_engagements_profile ON speaking_engagements(profile_id);

CREATE TABLE IF NOT EXISTS training_programs (
  id                        TEXT    PRIMARY KEY,
  profile_id                TEXT    NOT NULL,
  tenant_id                 TEXT    NOT NULL,
  program_name              TEXT    NOT NULL,
  duration_days             INTEGER NOT NULL DEFAULT 1,
  capacity                  INTEGER NOT NULL DEFAULT 20,
  fee_per_participant_kobo  INTEGER NOT NULL DEFAULT 0,
  upcoming_date             INTEGER,
  status                    TEXT    NOT NULL DEFAULT 'open', -- open/full/completed/cancelled
  created_at                INTEGER NOT NULL,
  updated_at                INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_training_programs_tenant ON training_programs(tenant_id);

CREATE TABLE IF NOT EXISTS training_enrollments (
  id               TEXT    PRIMARY KEY,
  program_id       TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  participant_ref  TEXT    NOT NULL, -- opaque (P13)
  enrollment_date  INTEGER NOT NULL,
  fee_kobo         INTEGER NOT NULL DEFAULT 0,
  status           TEXT    NOT NULL DEFAULT 'enrolled', -- enrolled/attended/no_show/refunded
  created_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_tenant ON training_enrollments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_program ON training_enrollments(program_id);
