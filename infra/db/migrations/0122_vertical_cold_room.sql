-- Migration 0122: Cold Room / Storage Facility vertical (M10)
-- FSM: seeded → claimed → nafdac_verified → active → suspended
-- P9: daily_rate_kobo, total_charged_kobo as INTEGER
-- T3: tenant_id NOT NULL
-- Temperature stored as integer millidegrees Celsius (no floats)

CREATE TABLE IF NOT EXISTS cold_room_profiles (
  id                    TEXT PRIMARY KEY,
  workspace_id          TEXT NOT NULL,
  tenant_id             TEXT NOT NULL,
  facility_name         TEXT NOT NULL,
  nafdac_cold_chain_cert TEXT,
  son_cert              TEXT,
  capacity_kg           INTEGER NOT NULL DEFAULT 0,
  cac_rc                TEXT,
  status                TEXT NOT NULL DEFAULT 'seeded',
  created_at            INTEGER NOT NULL,
  updated_at            INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cold_room_profiles_tenant ON cold_room_profiles(tenant_id);

CREATE TABLE IF NOT EXISTS cold_room_units (
  id              TEXT PRIMARY KEY,
  profile_id      TEXT NOT NULL,
  tenant_id       TEXT NOT NULL,
  unit_number     TEXT NOT NULL,
  capacity_kg     INTEGER NOT NULL,
  current_temp_mc INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'active',
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cold_units_tenant ON cold_room_units(tenant_id);

CREATE TABLE IF NOT EXISTS cold_storage_agreements (
  id                   TEXT PRIMARY KEY,
  profile_id           TEXT NOT NULL,
  tenant_id            TEXT NOT NULL,
  client_phone         TEXT NOT NULL,
  commodity_type       TEXT NOT NULL,
  quantity_kg          INTEGER NOT NULL,
  daily_rate_kobo      INTEGER NOT NULL,
  entry_date           INTEGER NOT NULL,
  exit_date            INTEGER,
  total_charged_kobo   INTEGER NOT NULL DEFAULT 0,
  status               TEXT NOT NULL DEFAULT 'active',
  created_at           INTEGER NOT NULL,
  updated_at           INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cold_agreements_tenant ON cold_storage_agreements(tenant_id);

CREATE TABLE IF NOT EXISTS cold_temp_log (
  id              TEXT PRIMARY KEY,
  profile_id      TEXT NOT NULL,
  tenant_id       TEXT NOT NULL,
  unit_id         TEXT NOT NULL,
  log_time        INTEGER NOT NULL,
  temperature_mc  INTEGER NOT NULL,
  alert_flag      INTEGER NOT NULL DEFAULT 0,
  created_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cold_temp_tenant ON cold_temp_log(tenant_id);
