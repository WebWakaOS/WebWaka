-- Migration 0138: Photography Studio / Videography vertical (M10)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- P13: client_ref_id opaque; no client details in AI

CREATE TABLE IF NOT EXISTS photography_studio_profiles (
  id               TEXT    PRIMARY KEY,
  workspace_id     TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  studio_name      TEXT    NOT NULL,
  apcon_registered INTEGER NOT NULL DEFAULT 0,
  nuj_affiliation  TEXT,
  cac_rc           TEXT,
  status           TEXT    NOT NULL DEFAULT 'seeded',
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_photography_studio_profiles_tenant ON photography_studio_profiles(tenant_id);

CREATE TABLE IF NOT EXISTS photo_bookings (
  id                TEXT    PRIMARY KEY,
  profile_id        TEXT    NOT NULL,
  tenant_id         TEXT    NOT NULL,
  client_ref_id     TEXT    NOT NULL,
  shoot_type        TEXT    NOT NULL, -- wedding/corporate/music_video/event/portrait/fashion
  shoot_date        INTEGER NOT NULL,
  location          TEXT,
  package_fee_kobo  INTEGER NOT NULL,
  deposit_kobo      INTEGER NOT NULL DEFAULT 0,
  balance_kobo      INTEGER NOT NULL,
  deliverable_ref   TEXT,
  status            TEXT    NOT NULL DEFAULT 'enquiry', -- enquiry/confirmed/shoot_day/editing/delivered
  created_at        INTEGER NOT NULL,
  updated_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_photo_bookings_tenant ON photo_bookings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_photo_bookings_profile ON photo_bookings(profile_id);

CREATE TABLE IF NOT EXISTS photo_equipment (
  id                 TEXT    PRIMARY KEY,
  profile_id         TEXT    NOT NULL,
  tenant_id          TEXT    NOT NULL,
  item_name          TEXT    NOT NULL,
  category           TEXT    NOT NULL, -- camera/lens/lighting/drone/other
  purchase_cost_kobo INTEGER NOT NULL DEFAULT 0,
  condition          TEXT    NOT NULL DEFAULT 'good', -- excellent/good/fair/needs_repair
  created_at         INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_photo_equipment_tenant ON photo_equipment(tenant_id);
