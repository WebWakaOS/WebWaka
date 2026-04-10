-- Migration 0164: Gym / Fitness Centre vertical (M11)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- P13: member_ref_id opaque; health metrics (weight/height) NEVER to AI

CREATE TABLE IF NOT EXISTS gym_fitness_profiles (
  id             TEXT    PRIMARY KEY,
  workspace_id   TEXT    NOT NULL,
  tenant_id      TEXT    NOT NULL,
  gym_name       TEXT    NOT NULL,
  cac_rc         TEXT,
  nfscn_cert     TEXT,   -- Nigeria Fitness Sports Council of Nigeria
  gym_type       TEXT    NOT NULL DEFAULT 'gym', -- gym/yoga/martial_arts/mixed
  status         TEXT    NOT NULL DEFAULT 'seeded',
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_gym_fitness_profiles_tenant ON gym_fitness_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gym_fitness_profiles_workspace ON gym_fitness_profiles(workspace_id);

CREATE TABLE IF NOT EXISTS gym_memberships (
  id                TEXT    PRIMARY KEY,
  profile_id        TEXT    NOT NULL,
  tenant_id         TEXT    NOT NULL,
  member_ref_id     TEXT    NOT NULL, -- opaque (P13)
  membership_type   TEXT    NOT NULL DEFAULT 'monthly', -- daily/monthly/quarterly/annual
  fee_kobo          INTEGER NOT NULL DEFAULT 0,
  start_date        INTEGER NOT NULL,
  end_date          INTEGER,
  status            TEXT    NOT NULL DEFAULT 'active', -- active/expired/paused/cancelled
  created_at        INTEGER NOT NULL,
  updated_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_gym_memberships_tenant ON gym_memberships(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gym_memberships_profile ON gym_memberships(profile_id);

CREATE TABLE IF NOT EXISTS gym_equipment (
  id                    TEXT    PRIMARY KEY,
  profile_id            TEXT    NOT NULL,
  tenant_id             TEXT    NOT NULL,
  equipment_name        TEXT    NOT NULL,
  category              TEXT,
  purchase_cost_kobo    INTEGER NOT NULL DEFAULT 0,
  purchase_date         INTEGER,
  maintenance_due       INTEGER,
  condition             TEXT    NOT NULL DEFAULT 'good', -- good/fair/poor/decommissioned
  created_at            INTEGER NOT NULL,
  updated_at            INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_gym_equipment_tenant ON gym_equipment(tenant_id);

CREATE TABLE IF NOT EXISTS gym_class_schedule (
  id                    TEXT    PRIMARY KEY,
  profile_id            TEXT    NOT NULL,
  tenant_id             TEXT    NOT NULL,
  class_name            TEXT    NOT NULL,
  trainer_ref           TEXT,   -- opaque (P13)
  day_of_week           INTEGER NOT NULL DEFAULT 0, -- 0=Sun … 6=Sat
  start_time            INTEGER NOT NULL, -- minutes from midnight
  duration_minutes      INTEGER NOT NULL DEFAULT 60,
  capacity              INTEGER NOT NULL DEFAULT 20,
  fee_kobo              INTEGER NOT NULL DEFAULT 0,
  created_at            INTEGER NOT NULL,
  updated_at            INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_gym_class_schedule_tenant ON gym_class_schedule(tenant_id);
