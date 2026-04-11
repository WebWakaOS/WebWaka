-- Migration 0139: Record Label / Music Publisher vertical (M12)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- royalty_split_bps is INTEGER basis points out of 10,000 (no floats)
-- P13: artiste_ref_id opaque; contract terms / royalty splits never to AI

CREATE TABLE IF NOT EXISTS recording_label_profiles (
  id                TEXT    PRIMARY KEY,
  workspace_id      TEXT    NOT NULL,
  tenant_id         TEXT    NOT NULL,
  label_name        TEXT    NOT NULL,
  coson_membership  TEXT,
  mcsn_registration TEXT,
  cac_rc            TEXT,
  status            TEXT    NOT NULL DEFAULT 'seeded',
  created_at        INTEGER NOT NULL,
  updated_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_recording_label_profiles_tenant ON recording_label_profiles(tenant_id);

CREATE TABLE IF NOT EXISTS label_artistes (
  id                TEXT    PRIMARY KEY,
  profile_id        TEXT    NOT NULL,
  tenant_id         TEXT    NOT NULL,
  artiste_ref_id    TEXT    NOT NULL UNIQUE,
  royalty_split_bps INTEGER NOT NULL,
  contract_start    INTEGER NOT NULL,
  contract_end      INTEGER,
  status            TEXT    NOT NULL DEFAULT 'signed', -- signed/released/suspended
  created_at        INTEGER NOT NULL,
  updated_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_label_artistes_tenant ON label_artistes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_label_artistes_profile ON label_artistes(profile_id);

CREATE TABLE IF NOT EXISTS label_releases (
  id                      TEXT    PRIMARY KEY,
  profile_id              TEXT    NOT NULL,
  tenant_id               TEXT    NOT NULL,
  artiste_ref_id          TEXT    NOT NULL,
  release_name            TEXT    NOT NULL,
  genre                   TEXT    NOT NULL,
  release_date            INTEGER NOT NULL,
  streaming_revenue_kobo  INTEGER NOT NULL DEFAULT 0,
  created_at              INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_label_releases_tenant ON label_releases(tenant_id);

CREATE TABLE IF NOT EXISTS label_royalty_distributions (
  id                TEXT    PRIMARY KEY,
  profile_id        TEXT    NOT NULL,
  tenant_id         TEXT    NOT NULL,
  artiste_ref_id    TEXT    NOT NULL,
  period            TEXT    NOT NULL,
  gross_kobo        INTEGER NOT NULL,
  artiste_share_kobo INTEGER NOT NULL,
  label_share_kobo  INTEGER NOT NULL,
  distributed_date  INTEGER NOT NULL,
  created_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_label_royalty_distributions_tenant ON label_royalty_distributions(tenant_id);
