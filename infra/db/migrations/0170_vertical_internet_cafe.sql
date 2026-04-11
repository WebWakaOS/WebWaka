-- Migration 0170: Internet Café / Business Centre vertical (M12)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- Session duration in integer minutes; no floats
-- P13: customer_ref_id opaque

CREATE TABLE IF NOT EXISTS internet_cafe_profiles (
  id               TEXT    PRIMARY KEY,
  workspace_id     TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  business_name    TEXT    NOT NULL,
  ncc_reg          TEXT,
  cac_rc           TEXT,
  workstation_count INTEGER NOT NULL DEFAULT 1,
  status           TEXT    NOT NULL DEFAULT 'seeded',
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_internet_cafe_profiles_tenant ON internet_cafe_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_internet_cafe_profiles_workspace ON internet_cafe_profiles(workspace_id);

CREATE TABLE IF NOT EXISTS cafe_stations (
  id              TEXT    PRIMARY KEY,
  profile_id      TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  station_number  TEXT    NOT NULL,
  station_type    TEXT    NOT NULL DEFAULT 'computer', -- computer/printer/scanner
  status          TEXT    NOT NULL DEFAULT 'available', -- available/in_use/maintenance
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cafe_stations_tenant ON cafe_stations(tenant_id);

CREATE TABLE IF NOT EXISTS cafe_sessions (
  id               TEXT    PRIMARY KEY,
  profile_id       TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  station_id       TEXT    NOT NULL,
  customer_ref_id  TEXT    NOT NULL, -- opaque (P13)
  start_time       INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  per_minute_kobo  INTEGER NOT NULL DEFAULT 0,
  session_total_kobo INTEGER NOT NULL DEFAULT 0,
  status           TEXT    NOT NULL DEFAULT 'active', -- active/completed/terminated
  created_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cafe_sessions_tenant ON cafe_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cafe_sessions_profile ON cafe_sessions(profile_id);

CREATE TABLE IF NOT EXISTS cafe_service_orders (
  id               TEXT    PRIMARY KEY,
  profile_id       TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  customer_ref_id  TEXT    NOT NULL, -- opaque (P13)
  service_type     TEXT    NOT NULL, -- photocopy/printing/scanning/lamination/form_submission
  quantity         INTEGER NOT NULL DEFAULT 1,
  unit_price_kobo  INTEGER NOT NULL DEFAULT 0,
  total_kobo       INTEGER NOT NULL DEFAULT 0,
  order_date       INTEGER NOT NULL,
  created_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cafe_service_orders_tenant ON cafe_service_orders(tenant_id);
