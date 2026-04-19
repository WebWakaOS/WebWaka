-- Rollback for 0252: Remove CHECK constraints from farm/warehouse tables.
-- Re-creates tables without the CHECK clauses.
-- Note: This is a destructive rollback that will drop and recreate the tables.

PRAGMA foreign_keys = OFF;

-- farm_profiles (remove CHECK)
ALTER TABLE farm_profiles RENAME TO _farm_profiles_chk;
CREATE TABLE farm_profiles (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, workspace_id TEXT NOT NULL,
  profile_id TEXT, farm_type TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
INSERT INTO farm_profiles SELECT * FROM _farm_profiles_chk;
DROP TABLE _farm_profiles_chk;
CREATE INDEX IF NOT EXISTS idx_farm_profiles_tenant    ON farm_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_farm_profiles_workspace ON farm_profiles(workspace_id, tenant_id);

-- farm_produce_records (remove CHECK)
ALTER TABLE farm_produce_records RENAME TO _farm_produce_records_chk;
CREATE TABLE farm_produce_records (
  id TEXT PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES farm_profiles(id) ON DELETE CASCADE,
  produce_type TEXT, quantity_kg REAL, unit_price_kobo INTEGER,
  status TEXT NOT NULL DEFAULT 'harvested',
  recorded_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
INSERT INTO farm_produce_records SELECT * FROM _farm_produce_records_chk;
DROP TABLE _farm_produce_records_chk;

-- poultry_farm_profiles (remove CHECK)
ALTER TABLE poultry_farm_profiles RENAME TO _poultry_farm_profiles_chk;
CREATE TABLE poultry_farm_profiles (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, workspace_id TEXT NOT NULL,
  profile_id TEXT, poultry_type TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
INSERT INTO poultry_farm_profiles SELECT * FROM _poultry_farm_profiles_chk;
DROP TABLE _poultry_farm_profiles_chk;
CREATE INDEX IF NOT EXISTS idx_poultry_profiles_tenant    ON poultry_farm_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_poultry_profiles_workspace ON poultry_farm_profiles(workspace_id, tenant_id);

-- poultry_batches (remove CHECK)
ALTER TABLE poultry_batches RENAME TO _poultry_batches_chk;
CREATE TABLE poultry_batches (
  id TEXT PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES poultry_farm_profiles(id) ON DELETE CASCADE,
  batch_type TEXT, quantity INTEGER,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TEXT, closed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
INSERT INTO poultry_batches SELECT * FROM _poultry_batches_chk;
DROP TABLE _poultry_batches_chk;

-- warehouse_profiles (remove CHECK)
ALTER TABLE warehouse_profiles RENAME TO _warehouse_profiles_chk;
CREATE TABLE warehouse_profiles (
  id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, workspace_id TEXT NOT NULL,
  profile_id TEXT, warehouse_type TEXT,
  status TEXT NOT NULL DEFAULT 'seeded',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
INSERT INTO warehouse_profiles SELECT * FROM _warehouse_profiles_chk;
DROP TABLE _warehouse_profiles_chk;
CREATE INDEX IF NOT EXISTS idx_warehouse_profiles_tenant    ON warehouse_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_profiles_workspace ON warehouse_profiles(workspace_id, tenant_id);

-- warehouse_storage_contracts (remove CHECK)
ALTER TABLE warehouse_storage_contracts RENAME TO _warehouse_storage_contracts_chk;
CREATE TABLE warehouse_storage_contracts (
  id TEXT PRIMARY KEY, profile_id TEXT NOT NULL REFERENCES warehouse_profiles(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL, customer_name TEXT, goods_description TEXT,
  quantity_units INTEGER, rate_kobo_per_unit INTEGER,
  status TEXT NOT NULL DEFAULT 'active',
  start_date TEXT, end_date TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
INSERT INTO warehouse_storage_contracts SELECT * FROM _warehouse_storage_contracts_chk;
DROP TABLE _warehouse_storage_contracts_chk;

PRAGMA foreign_keys = ON;
