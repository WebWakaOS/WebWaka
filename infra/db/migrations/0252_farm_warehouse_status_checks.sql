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
--
-- NOTE: INSERT statements use explicit column mapping because 0252 redefines the
-- schema (drops legacy columns, adds profile_id/type columns).  SELECT * would
-- fail due to column-count mismatch against the 0219-0221 originals.

PRAGMA foreign_keys = OFF;

-- -------------------------------------------------------------------------
-- farm_profiles
-- 0219 had: id, workspace_id, tenant_id, farm_name, cac_number, state, lga,
--           farm_size_hectares, primary_crop, status, created_at, updated_at
-- 0252 new: id, tenant_id, workspace_id, profile_id, farm_type, status,
--           created_at, updated_at
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
INSERT INTO farm_profiles (id, tenant_id, workspace_id, status, created_at, updated_at)
  SELECT id, tenant_id, workspace_id, status,
         CAST(created_at AS TEXT), CAST(updated_at AS TEXT)
  FROM _farm_profiles_old;
DROP TABLE _farm_profiles_old;
CREATE INDEX IF NOT EXISTS idx_farm_profiles_tenant    ON farm_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_farm_profiles_workspace ON farm_profiles(workspace_id, tenant_id);

-- -------------------------------------------------------------------------
-- farm_produce_records
-- 0219 had: id, profile_id, tenant_id, crop_type, quantity_kg, harvest_date,
--           price_per_kg_kobo, total_kobo, buyer_ref_id, status, notes,
--           created_at, updated_at
-- 0252 new: id, profile_id, produce_type, quantity_kg, unit_price_kobo,
--           status, recorded_at, created_at, updated_at
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
INSERT INTO farm_produce_records (id, profile_id, quantity_kg, status,
                                  recorded_at, created_at, updated_at)
  SELECT id, profile_id, CAST(quantity_kg AS REAL), status,
         CAST(created_at AS TEXT), CAST(created_at AS TEXT), CAST(updated_at AS TEXT)
  FROM _farm_produce_records_old;
DROP TABLE _farm_produce_records_old;

-- -------------------------------------------------------------------------
-- poultry_farm_profiles
-- 0220 had: id, workspace_id, tenant_id, farm_name, cac_number, state, lga,
--           bird_type, capacity_birds, status, created_at, updated_at
-- 0252 new: id, tenant_id, workspace_id, profile_id, poultry_type, status,
--           created_at, updated_at
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
INSERT INTO poultry_farm_profiles (id, tenant_id, workspace_id, status,
                                   created_at, updated_at)
  SELECT id, tenant_id, workspace_id, status,
         CAST(created_at AS TEXT), CAST(updated_at AS TEXT)
  FROM _poultry_farm_profiles_old;
DROP TABLE _poultry_farm_profiles_old;
CREATE INDEX IF NOT EXISTS idx_poultry_profiles_tenant    ON poultry_farm_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_poultry_profiles_workspace ON poultry_farm_profiles(workspace_id, tenant_id);

-- -------------------------------------------------------------------------
-- poultry_batches
-- 0220 had: id, profile_id, tenant_id, bird_type, quantity, cost_per_bird_kobo,
--           total_cost_kobo, placement_date, expected_harvest_date, status,
--           mortality_count, notes, created_at, updated_at
-- 0252 new: id, profile_id, batch_type, quantity, status, started_at,
--           closed_at, created_at, updated_at
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
INSERT INTO poultry_batches (id, profile_id, quantity, status, created_at, updated_at)
  SELECT id, profile_id, quantity, status,
         CAST(created_at AS TEXT), CAST(updated_at AS TEXT)
  FROM _poultry_batches_old;
DROP TABLE _poultry_batches_old;

-- -------------------------------------------------------------------------
-- warehouse_profiles
-- 0221 had: id, workspace_id, tenant_id, warehouse_name, cac_number, state,
--           lga, capacity_sqm, warehouse_type, status, created_at, updated_at
-- 0252 new: id, tenant_id, workspace_id, profile_id, warehouse_type, status,
--           created_at, updated_at
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
INSERT INTO warehouse_profiles (id, tenant_id, workspace_id, warehouse_type,
                                status, created_at, updated_at)
  SELECT id, tenant_id, workspace_id, warehouse_type, status,
         CAST(created_at AS TEXT), CAST(updated_at AS TEXT)
  FROM _warehouse_profiles_old;
DROP TABLE _warehouse_profiles_old;
CREATE INDEX IF NOT EXISTS idx_warehouse_profiles_tenant    ON warehouse_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_profiles_workspace ON warehouse_profiles(workspace_id, tenant_id);

-- -------------------------------------------------------------------------
-- warehouse_storage_contracts
-- 0221 had: id, profile_id, tenant_id, client_ref_id, goods_type, quantity_kg,
--           quantity_units, rate_per_day_kobo, start_date, end_date, total_kobo,
--           deposit_kobo, status, notes, created_at, updated_at
-- 0252 new: id, profile_id, tenant_id, customer_name, goods_description,
--           quantity_units, rate_kobo_per_unit, status, start_date, end_date,
--           created_at, updated_at
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
INSERT INTO warehouse_storage_contracts (id, profile_id, tenant_id, quantity_units,
                                         status, start_date, end_date,
                                         created_at, updated_at)
  SELECT id, profile_id, tenant_id, quantity_units, status,
         CAST(start_date AS TEXT), CAST(end_date AS TEXT),
         CAST(created_at AS TEXT), CAST(updated_at AS TEXT)
  FROM _warehouse_storage_contracts_old;
DROP TABLE _warehouse_storage_contracts_old;

PRAGMA foreign_keys = ON;
