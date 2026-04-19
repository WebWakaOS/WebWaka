-- Migration 0252: Add CHECK constraints for status state machines on farm/warehouse tables.
-- These were missing from migrations 0219-0221, leaving status columns without
-- database-level guards. SQLite does not support ALTER TABLE ADD CONSTRAINT,
-- so we use the safe rename-rebuild pattern.
--
-- Tables patched:
--   farm_profiles.status              ('seeded','active','inactive','suspended')
--   farm_produce_records.status       ('harvested','processing','sold','waste')
--   poultry_farm_profiles.status      ('seeded','active','inactive','suspended')
--   poultry_batches.status            ('active','sold','depleted','culled')
--   warehouse_profiles.status         ('seeded','active','inactive','suspended')
--   warehouse_storage_contracts.status('active','completed','cancelled','disputed')

PRAGMA foreign_keys = OFF;

-- -------------------------------------------------------------------------
-- farm_profiles
-- -------------------------------------------------------------------------
ALTER TABLE farm_profiles RENAME TO _farm_profiles_old;
CREATE TABLE farm_profiles (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  workspace_id TEXT NOT NULL,
  profile_id  TEXT,
  farm_type   TEXT,
  status      TEXT NOT NULL DEFAULT 'seeded'
                CHECK (status IN ('seeded','active','inactive','suspended')),
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
INSERT INTO farm_profiles SELECT * FROM _farm_profiles_old;
DROP TABLE _farm_profiles_old;
CREATE INDEX IF NOT EXISTS idx_farm_profiles_tenant    ON farm_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_farm_profiles_workspace ON farm_profiles(workspace_id, tenant_id);

-- -------------------------------------------------------------------------
-- farm_produce_records
-- -------------------------------------------------------------------------
ALTER TABLE farm_produce_records RENAME TO _farm_produce_records_old;
CREATE TABLE farm_produce_records (
  id          TEXT PRIMARY KEY,
  profile_id  TEXT NOT NULL REFERENCES farm_profiles(id) ON DELETE CASCADE,
  produce_type TEXT,
  quantity_kg  REAL,
  unit_price_kobo INTEGER,
  status      TEXT NOT NULL DEFAULT 'harvested'
                CHECK (status IN ('harvested','processing','sold','waste')),
  recorded_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
INSERT INTO farm_produce_records SELECT * FROM _farm_produce_records_old;
DROP TABLE _farm_produce_records_old;

-- -------------------------------------------------------------------------
-- poultry_farm_profiles
-- -------------------------------------------------------------------------
ALTER TABLE poultry_farm_profiles RENAME TO _poultry_farm_profiles_old;
CREATE TABLE poultry_farm_profiles (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  workspace_id TEXT NOT NULL,
  profile_id  TEXT,
  poultry_type TEXT,
  status      TEXT NOT NULL DEFAULT 'seeded'
                CHECK (status IN ('seeded','active','inactive','suspended')),
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
INSERT INTO poultry_farm_profiles SELECT * FROM _poultry_farm_profiles_old;
DROP TABLE _poultry_farm_profiles_old;
CREATE INDEX IF NOT EXISTS idx_poultry_profiles_tenant    ON poultry_farm_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_poultry_profiles_workspace ON poultry_farm_profiles(workspace_id, tenant_id);

-- -------------------------------------------------------------------------
-- poultry_batches
-- -------------------------------------------------------------------------
ALTER TABLE poultry_batches RENAME TO _poultry_batches_old;
CREATE TABLE poultry_batches (
  id          TEXT PRIMARY KEY,
  profile_id  TEXT NOT NULL REFERENCES poultry_farm_profiles(id) ON DELETE CASCADE,
  batch_type  TEXT,
  quantity    INTEGER,
  status      TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','sold','depleted','culled')),
  started_at  TEXT,
  closed_at   TEXT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
INSERT INTO poultry_batches SELECT * FROM _poultry_batches_old;
DROP TABLE _poultry_batches_old;

-- -------------------------------------------------------------------------
-- warehouse_profiles
-- -------------------------------------------------------------------------
ALTER TABLE warehouse_profiles RENAME TO _warehouse_profiles_old;
CREATE TABLE warehouse_profiles (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  workspace_id TEXT NOT NULL,
  profile_id  TEXT,
  warehouse_type TEXT,
  status      TEXT NOT NULL DEFAULT 'seeded'
                CHECK (status IN ('seeded','active','inactive','suspended')),
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
INSERT INTO warehouse_profiles SELECT * FROM _warehouse_profiles_old;
DROP TABLE _warehouse_profiles_old;
CREATE INDEX IF NOT EXISTS idx_warehouse_profiles_tenant    ON warehouse_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_profiles_workspace ON warehouse_profiles(workspace_id, tenant_id);

-- -------------------------------------------------------------------------
-- warehouse_storage_contracts
-- -------------------------------------------------------------------------
ALTER TABLE warehouse_storage_contracts RENAME TO _warehouse_storage_contracts_old;
CREATE TABLE warehouse_storage_contracts (
  id          TEXT PRIMARY KEY,
  profile_id  TEXT NOT NULL REFERENCES warehouse_profiles(id) ON DELETE CASCADE,
  tenant_id   TEXT NOT NULL,
  customer_name TEXT,
  goods_description TEXT,
  quantity_units INTEGER,
  rate_kobo_per_unit INTEGER,
  status      TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','completed','cancelled','disputed')),
  start_date  TEXT,
  end_date    TEXT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
INSERT INTO warehouse_storage_contracts SELECT * FROM _warehouse_storage_contracts_old;
DROP TABLE _warehouse_storage_contracts_old;

PRAGMA foreign_keys = ON;
