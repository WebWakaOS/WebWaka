-- Migration 0137: Music Studio / Recording Studio vertical (M10)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- P13: artiste_ref_id opaque; royalty splits / deal terms never to AI
-- ADL-010: L2 AI cap; COSON gate

CREATE TABLE IF NOT EXISTS music_studio_profiles (
  id                TEXT    PRIMARY KEY,
  workspace_id      TEXT    NOT NULL,
  tenant_id         TEXT    NOT NULL,
  studio_name       TEXT    NOT NULL,
  coson_membership  TEXT,
  mcsn_registration TEXT,
  cac_rc            TEXT,
  studio_type       TEXT    NOT NULL DEFAULT 'all', -- recording/mixing/mastering/rehearsal/all
  status            TEXT    NOT NULL DEFAULT 'seeded',
  created_at        INTEGER NOT NULL,
  updated_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_music_studio_profiles_tenant ON music_studio_profiles(tenant_id);

CREATE TABLE IF NOT EXISTS studio_sessions (
  id                TEXT    PRIMARY KEY,
  profile_id        TEXT    NOT NULL,
  tenant_id         TEXT    NOT NULL,
  artiste_ref_id    TEXT    NOT NULL,
  engineer_ref_id   TEXT,
  booking_date      INTEGER NOT NULL,
  hours             INTEGER NOT NULL,
  session_rate_kobo INTEGER NOT NULL,
  total_kobo        INTEGER NOT NULL,
  status            TEXT    NOT NULL DEFAULT 'booked', -- booked/confirmed/completed/cancelled
  created_at        INTEGER NOT NULL,
  updated_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_studio_sessions_tenant ON studio_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_studio_sessions_profile ON studio_sessions(profile_id);

CREATE TABLE IF NOT EXISTS studio_beats (
  id               TEXT    PRIMARY KEY,
  profile_id       TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  beat_name        TEXT    NOT NULL,
  producer_ref_id  TEXT    NOT NULL,
  genre            TEXT    NOT NULL,
  bpm              INTEGER NOT NULL,
  license_type     TEXT    NOT NULL, -- exclusive/non-exclusive
  license_fee_kobo INTEGER NOT NULL,
  streams_reference TEXT,
  created_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_studio_beats_tenant ON studio_beats(tenant_id);

CREATE TABLE IF NOT EXISTS studio_equipment (
  id            TEXT    PRIMARY KEY,
  profile_id    TEXT    NOT NULL,
  tenant_id     TEXT    NOT NULL,
  equipment_name TEXT   NOT NULL,
  brand         TEXT,
  purchase_cost_kobo INTEGER NOT NULL DEFAULT 0,
  condition     TEXT    NOT NULL DEFAULT 'good', -- excellent/good/fair/needs_repair
  created_at    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_studio_equipment_tenant ON studio_equipment(tenant_id);
