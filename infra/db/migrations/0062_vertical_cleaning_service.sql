-- Migration 0062: Cleaning Service vertical
-- Platform Invariants: P9 (kobo integers), T3 (tenant_id NOT NULL on every table)
-- M9 — Commerce P2 Batch 1 (Set A, Task V-COMM-EXT-A6)

CREATE TABLE IF NOT EXISTS cleaning_service_profiles (
  id                TEXT    PRIMARY KEY,
  workspace_id      TEXT    REFERENCES workspaces(id),
  tenant_id         TEXT    NOT NULL,
  company_name      TEXT    NOT NULL,
  cac_number        TEXT,
  env_agency_permit TEXT,
  service_types     TEXT    NOT NULL DEFAULT '[]',  -- JSON array
  status            TEXT    NOT NULL DEFAULT 'seeded',
  created_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_clean_tenant ON cleaning_service_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clean_status ON cleaning_service_profiles(status);

CREATE TABLE IF NOT EXISTS cleaning_jobs (
  id               TEXT    PRIMARY KEY,
  workspace_id     TEXT    REFERENCES workspaces(id),
  tenant_id        TEXT    NOT NULL,
  client_phone     TEXT    NOT NULL,
  address          TEXT    NOT NULL,
  job_type         TEXT    NOT NULL DEFAULT 'one_off',  -- one_off/recurring
  frequency        TEXT,                                 -- weekly/biweekly/monthly (recurring only)
  price_kobo       INTEGER NOT NULL,                    -- P9
  assigned_staff_id TEXT,
  status           TEXT    NOT NULL DEFAULT 'scheduled',
  scheduled_at     INTEGER,                             -- unix timestamp
  created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_cleanjob_tenant ON cleaning_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cleanjob_status ON cleaning_jobs(status);

CREATE TABLE IF NOT EXISTS cleaning_supplies (
  id               TEXT    PRIMARY KEY,
  workspace_id     TEXT    REFERENCES workspaces(id),
  tenant_id        TEXT    NOT NULL,
  supply_name      TEXT    NOT NULL,
  unit             TEXT    NOT NULL DEFAULT 'litre',
  quantity_in_stock REAL   NOT NULL DEFAULT 0,
  unit_cost_kobo   INTEGER NOT NULL,  -- P9
  created_at       INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_cleansup_tenant ON cleaning_supplies(tenant_id);
