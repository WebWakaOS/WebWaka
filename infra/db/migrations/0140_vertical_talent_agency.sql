-- Migration 0140: Talent Agency / Model Agency vertical (M12)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- commission_bps is INTEGER basis points (no floats)
-- P13: talent_ref_id opaque; deal terms never to AI

CREATE TABLE IF NOT EXISTS talent_agency_profiles (
  id                       TEXT    PRIMARY KEY,
  workspace_id             TEXT    NOT NULL,
  tenant_id                TEXT    NOT NULL,
  agency_name              TEXT    NOT NULL,
  nmma_registration        TEXT,
  state_entertainment_cert TEXT,
  cac_rc                   TEXT,
  status                   TEXT    NOT NULL DEFAULT 'seeded',
  created_at               INTEGER NOT NULL,
  updated_at               INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_talent_agency_profiles_tenant ON talent_agency_profiles(tenant_id);

CREATE TABLE IF NOT EXISTS talent_roster (
  id               TEXT    PRIMARY KEY,
  profile_id       TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  talent_ref_id    TEXT    NOT NULL UNIQUE,
  category         TEXT    NOT NULL, -- model/actor/singer/influencer/MC/comedian
  commission_bps   INTEGER NOT NULL,
  signed_date      INTEGER NOT NULL,
  status           TEXT    NOT NULL DEFAULT 'active', -- active/inactive/released
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_talent_roster_tenant ON talent_roster(tenant_id);
CREATE INDEX IF NOT EXISTS idx_talent_roster_profile ON talent_roster(profile_id);

CREATE TABLE IF NOT EXISTS talent_bookings (
  id                TEXT    PRIMARY KEY,
  profile_id        TEXT    NOT NULL,
  tenant_id         TEXT    NOT NULL,
  talent_ref_id     TEXT    NOT NULL,
  brand_ref_id      TEXT    NOT NULL,
  booking_date      INTEGER NOT NULL,
  deliverable_type  TEXT    NOT NULL,
  brand_fee_kobo    INTEGER NOT NULL,
  commission_kobo   INTEGER NOT NULL,
  talent_payout_kobo INTEGER NOT NULL,
  status            TEXT    NOT NULL DEFAULT 'enquiry', -- enquiry/confirmed/delivered/paid
  created_at        INTEGER NOT NULL,
  updated_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_talent_bookings_tenant ON talent_bookings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_talent_bookings_profile ON talent_bookings(profile_id);
