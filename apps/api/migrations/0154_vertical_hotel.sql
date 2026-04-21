-- Migration 0154: Hotel / Guesthouse / Shortlet vertical (M9)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- P13: guest_ref_id opaque; RevPAR aggregate only to AI

CREATE TABLE IF NOT EXISTS hotel_profiles (
  id                       TEXT    PRIMARY KEY,
  workspace_id             TEXT    NOT NULL,
  tenant_id                TEXT    NOT NULL,
  hotel_name               TEXT    NOT NULL,
  nihotour_licence         TEXT,
  state_tourism_board_ref  TEXT,
  cac_rc                   TEXT,
  star_rating              INTEGER,
  hotel_type               TEXT    NOT NULL DEFAULT 'hotel', -- hotel/guesthouse/shortlet
  status                   TEXT    NOT NULL DEFAULT 'seeded',
  created_at               INTEGER NOT NULL,
  updated_at               INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_hotel_profiles_tenant ON hotel_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hotel_profiles_workspace ON hotel_profiles(workspace_id);

CREATE TABLE IF NOT EXISTS hotel_rooms (
  id                  TEXT    PRIMARY KEY,
  profile_id          TEXT    NOT NULL,
  tenant_id           TEXT    NOT NULL,
  room_number         TEXT    NOT NULL,
  room_type           TEXT    NOT NULL, -- single/double/suite/deluxe/shortlet
  floor               INTEGER,
  capacity            INTEGER NOT NULL DEFAULT 1,
  rate_per_night_kobo INTEGER NOT NULL,
  status              TEXT    NOT NULL DEFAULT 'available', -- available/occupied/maintenance
  created_at          INTEGER NOT NULL,
  updated_at          INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_hotel_rooms_tenant ON hotel_rooms(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hotel_rooms_profile ON hotel_rooms(profile_id);

CREATE TABLE IF NOT EXISTS hotel_reservations (
  id              TEXT    PRIMARY KEY,
  profile_id      TEXT    NOT NULL,
  room_id         TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  guest_ref_id    TEXT    NOT NULL, -- opaque (P13)
  check_in        INTEGER NOT NULL,
  check_out       INTEGER NOT NULL,
  nights          INTEGER NOT NULL,
  total_kobo      INTEGER NOT NULL,
  deposit_kobo    INTEGER NOT NULL DEFAULT 0,
  status          TEXT    NOT NULL DEFAULT 'pending', -- pending/confirmed/checked_in/checked_out/cancelled
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_hotel_reservations_tenant ON hotel_reservations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hotel_reservations_profile ON hotel_reservations(profile_id);
CREATE INDEX IF NOT EXISTS idx_hotel_reservations_room ON hotel_reservations(room_id);

CREATE TABLE IF NOT EXISTS hotel_revenue_summary (
  id                  TEXT    PRIMARY KEY,
  profile_id          TEXT    NOT NULL,
  tenant_id           TEXT    NOT NULL,
  summary_date        INTEGER NOT NULL, -- unix timestamp of day start
  rooms_available     INTEGER NOT NULL DEFAULT 0,
  rooms_sold          INTEGER NOT NULL DEFAULT 0,
  total_revenue_kobo  INTEGER NOT NULL DEFAULT 0,
  revpar_kobo         INTEGER NOT NULL DEFAULT 0, -- revenue per available room in kobo
  created_at          INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_hotel_revenue_tenant ON hotel_revenue_summary(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hotel_revenue_profile ON hotel_revenue_summary(profile_id);
