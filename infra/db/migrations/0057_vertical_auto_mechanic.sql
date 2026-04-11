-- Migration 0057: Auto Mechanic / Garage vertical
-- Platform Invariants: P9 (kobo integers), T3 (tenant_id NOT NULL on every table)
-- M9 — Commerce P2 Batch 1 (Set A, Task V-COMM-EXT-A1)

CREATE TABLE IF NOT EXISTS auto_mechanic_profiles (
  id              TEXT    PRIMARY KEY,
  workspace_id    TEXT    REFERENCES workspaces(id),
  tenant_id       TEXT    NOT NULL,
  workshop_name   TEXT    NOT NULL,
  cac_number      TEXT,
  vio_registration TEXT,
  state           TEXT    NOT NULL,
  lga             TEXT    NOT NULL,
  status          TEXT    NOT NULL DEFAULT 'seeded',
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_amech_tenant   ON auto_mechanic_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_amech_status   ON auto_mechanic_profiles(status);
CREATE INDEX IF NOT EXISTS idx_amech_ws       ON auto_mechanic_profiles(workspace_id);

CREATE TABLE IF NOT EXISTS job_cards (
  id                TEXT    PRIMARY KEY,
  workspace_id      TEXT    REFERENCES workspaces(id),
  tenant_id         TEXT    NOT NULL,
  vehicle_plate     TEXT    NOT NULL,
  customer_phone    TEXT    NOT NULL,
  complaint         TEXT    NOT NULL,
  diagnosis         TEXT,
  mechanic_id       TEXT,
  labour_cost_kobo  INTEGER NOT NULL DEFAULT 0,  -- P9: integer kobo
  parts_cost_kobo   INTEGER NOT NULL DEFAULT 0,  -- P9: integer kobo
  status            TEXT    NOT NULL DEFAULT 'open',
  created_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_jobcards_tenant ON job_cards(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jobcards_status ON job_cards(status);
CREATE INDEX IF NOT EXISTS idx_jobcards_ws     ON job_cards(workspace_id);

CREATE TABLE IF NOT EXISTS mechanic_parts_inventory (
  id               TEXT    PRIMARY KEY,
  workspace_id     TEXT    REFERENCES workspaces(id),
  tenant_id        TEXT    NOT NULL,
  part_name        TEXT    NOT NULL,
  part_number      TEXT,
  quantity_in_stock INTEGER NOT NULL DEFAULT 0,
  unit_cost_kobo   INTEGER NOT NULL,              -- P9: integer kobo
  reorder_level    INTEGER NOT NULL DEFAULT 5,
  supplier         TEXT,
  created_at       INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_mechparts_tenant ON mechanic_parts_inventory(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mechparts_ws     ON mechanic_parts_inventory(workspace_id);
