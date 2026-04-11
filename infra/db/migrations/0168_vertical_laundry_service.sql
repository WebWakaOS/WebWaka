-- Migration 0168: Laundromat / Laundry Service (P3 Specialist) vertical (M11)
-- Distinct from 0162 laundry (dry cleaner); this is coin/card laundromat
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- P13: client_ref_id opaque

CREATE TABLE IF NOT EXISTS laundry_service_profiles (
  id                        TEXT    PRIMARY KEY,
  workspace_id              TEXT    NOT NULL,
  tenant_id                 TEXT    NOT NULL,
  business_name             TEXT    NOT NULL,
  cac_rc                    TEXT,
  machine_count             INTEGER NOT NULL DEFAULT 1,
  capacity_kg_per_load_x100 INTEGER NOT NULL DEFAULT 700, -- 7kg × 100
  status                    TEXT    NOT NULL DEFAULT 'seeded',
  created_at                INTEGER NOT NULL,
  updated_at                INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_laundry_service_profiles_tenant ON laundry_service_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_laundry_service_profiles_workspace ON laundry_service_profiles(workspace_id);

CREATE TABLE IF NOT EXISTS laundry_service_machines (
  id               TEXT    PRIMARY KEY,
  profile_id       TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  machine_number   TEXT    NOT NULL,
  machine_type     TEXT    NOT NULL DEFAULT 'washer', -- washer/dryer/washer_dryer
  capacity_kg_x100 INTEGER NOT NULL DEFAULT 700,
  status           TEXT    NOT NULL DEFAULT 'available', -- available/in_use/maintenance
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_laundry_service_machines_tenant ON laundry_service_machines(tenant_id);

CREATE TABLE IF NOT EXISTS laundry_service_sessions (
  id                TEXT    PRIMARY KEY,
  profile_id        TEXT    NOT NULL,
  tenant_id         TEXT    NOT NULL,
  machine_id        TEXT    NOT NULL,
  client_ref_id     TEXT    NOT NULL, -- opaque (P13)
  load_count        INTEGER NOT NULL DEFAULT 1,
  wash_price_kobo   INTEGER NOT NULL DEFAULT 0,
  dry_price_kobo    INTEGER NOT NULL DEFAULT 0,
  total_kobo        INTEGER NOT NULL DEFAULT 0,
  start_time        INTEGER NOT NULL,
  end_time          INTEGER,
  status            TEXT    NOT NULL DEFAULT 'active', -- active/completed/cancelled
  created_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_laundry_service_sessions_tenant ON laundry_service_sessions(tenant_id);

CREATE TABLE IF NOT EXISTS laundry_service_subscriptions (
  id                    TEXT    PRIMARY KEY,
  profile_id            TEXT    NOT NULL,
  tenant_id             TEXT    NOT NULL,
  client_ref_id         TEXT    NOT NULL, -- opaque (P13)
  loads_per_month       INTEGER NOT NULL DEFAULT 4,
  monthly_price_kobo    INTEGER NOT NULL DEFAULT 0,
  start_date            INTEGER NOT NULL,
  end_date              INTEGER,
  status                TEXT    NOT NULL DEFAULT 'active',
  created_at            INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_laundry_service_subscriptions_tenant ON laundry_service_subscriptions(tenant_id);
