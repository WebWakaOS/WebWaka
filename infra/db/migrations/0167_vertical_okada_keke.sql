-- Migration 0167: Okada / Keke Rider Co-op vertical (M11)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- P13: driver_ref_id, owner_ref_id opaque
-- State ban awareness: Lagos ban on okada (2022)
-- AI: L2 max; aggregate daily returns only — no driver_ref

CREATE TABLE IF NOT EXISTS okada_keke_profiles (
  id                     TEXT    PRIMARY KEY,
  workspace_id           TEXT    NOT NULL,
  tenant_id              TEXT    NOT NULL,
  coop_name              TEXT    NOT NULL,
  nurtw_reg              TEXT,   -- NURTW (National Union of Road Transport Workers)
  state_transport_permit TEXT,
  cac_rc                 TEXT,
  vehicle_type           TEXT    NOT NULL DEFAULT 'both', -- okada/keke/both
  state                  TEXT,
  ban_status             TEXT    NOT NULL DEFAULT 'active', -- active/banned/restricted
  status                 TEXT    NOT NULL DEFAULT 'seeded',
  created_at             INTEGER NOT NULL,
  updated_at             INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_okada_keke_profiles_tenant ON okada_keke_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_okada_keke_profiles_workspace ON okada_keke_profiles(workspace_id);

CREATE TABLE IF NOT EXISTS okada_keke_fleet (
  id            TEXT    PRIMARY KEY,
  profile_id    TEXT    NOT NULL,
  tenant_id     TEXT    NOT NULL,
  vehicle_type  TEXT    NOT NULL, -- okada/keke
  plate_number  TEXT,
  reg_number    TEXT,
  owner_ref_id  TEXT,             -- opaque (P13)
  driver_ref_id TEXT,             -- opaque (P13)
  status        TEXT    NOT NULL DEFAULT 'active', -- active/inactive/impounded
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_okada_keke_fleet_tenant ON okada_keke_fleet(tenant_id);
CREATE INDEX IF NOT EXISTS idx_okada_keke_fleet_profile ON okada_keke_fleet(profile_id);

CREATE TABLE IF NOT EXISTS okada_keke_daily_returns (
  id              TEXT    PRIMARY KEY,
  profile_id      TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  vehicle_id      TEXT    NOT NULL,
  driver_ref_id   TEXT    NOT NULL, -- opaque (P13) — aggregate only to AI
  return_date     INTEGER NOT NULL,
  revenue_kobo    INTEGER NOT NULL DEFAULT 0,
  levy_kobo       INTEGER NOT NULL DEFAULT 0,
  net_kobo        INTEGER NOT NULL DEFAULT 0,
  created_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_okada_keke_daily_returns_tenant ON okada_keke_daily_returns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_okada_keke_daily_returns_profile ON okada_keke_daily_returns(profile_id);

CREATE TABLE IF NOT EXISTS okada_keke_levies (
  id          TEXT    PRIMARY KEY,
  profile_id  TEXT    NOT NULL,
  tenant_id   TEXT    NOT NULL,
  levy_type   TEXT    NOT NULL, -- daily/weekly/monthly/nurtw_due
  amount_kobo INTEGER NOT NULL DEFAULT 0,
  frequency   TEXT    NOT NULL DEFAULT 'daily',
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_okada_keke_levies_tenant ON okada_keke_levies(tenant_id);
