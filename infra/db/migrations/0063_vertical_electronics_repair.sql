-- Migration 0063: Electronics Repair Shop vertical
-- Platform Invariants: P9 (kobo integers), T3 (tenant_id NOT NULL on every table)
-- M9 — Commerce P2 Batch 1 (Set A, Task V-COMM-EXT-A7)

CREATE TABLE IF NOT EXISTS electronics_repair_profiles (
  id               TEXT    PRIMARY KEY,
  workspace_id     TEXT    REFERENCES workspaces(id),
  tenant_id        TEXT    NOT NULL,
  shop_name        TEXT    NOT NULL,
  cac_number       TEXT,
  son_registration TEXT,
  location_cluster TEXT    NOT NULL DEFAULT 'other',  -- computer_village/onitsha/aba/other
  state            TEXT    NOT NULL,
  status           TEXT    NOT NULL DEFAULT 'seeded',
  created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_erepair_tenant ON electronics_repair_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_erepair_status ON electronics_repair_profiles(status);

CREATE TABLE IF NOT EXISTS repair_jobs (
  id                TEXT    PRIMARY KEY,
  workspace_id      TEXT    REFERENCES workspaces(id),
  tenant_id         TEXT    NOT NULL,
  device_type       TEXT    NOT NULL,  -- phone/laptop/tablet/tv/other
  brand             TEXT    NOT NULL,
  model             TEXT,
  imei              TEXT,              -- stored hashed / last 4 digits only (P13)
  fault_description TEXT    NOT NULL,
  customer_phone    TEXT    NOT NULL,
  diagnosis         TEXT,
  labour_cost_kobo  INTEGER NOT NULL DEFAULT 0,  -- P9
  parts_cost_kobo   INTEGER NOT NULL DEFAULT 0,  -- P9
  warranty_days     INTEGER NOT NULL DEFAULT 0,
  status            TEXT    NOT NULL DEFAULT 'intake',
  created_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_repjob_tenant ON repair_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_repjob_status ON repair_jobs(status);

CREATE TABLE IF NOT EXISTS repair_parts_inventory (
  id                TEXT    PRIMARY KEY,
  workspace_id      TEXT    REFERENCES workspaces(id),
  tenant_id         TEXT    NOT NULL,
  part_name         TEXT    NOT NULL,
  compatible_models TEXT    NOT NULL DEFAULT '[]',  -- JSON array
  quantity          INTEGER NOT NULL DEFAULT 0,
  unit_cost_kobo    INTEGER NOT NULL,               -- P9
  supplier          TEXT,
  created_at        INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_repparts_tenant ON repair_parts_inventory(tenant_id);
