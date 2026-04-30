-- Migration 0444 — Group Extension Tables (Civic, Faith, Cooperative)
-- Phase 2: packages/groups-civic, packages/groups-faith, packages/groups-cooperative
--
-- Platform Invariants:
--   T3  — tenant_id on all records
--   P4  — extension fields in extension tables; core groups table UNTOUCHED
--   P9  — kobo fields are INTEGER

-- ---------------------------------------------------------------------------
-- Civic Extension — for NGO / advocacy / civic groups
-- Package: @webwaka/groups-civic
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS group_civic_extensions (
  group_id                TEXT NOT NULL,
  tenant_id               TEXT NOT NULL,
  workspace_id            TEXT NOT NULL,
  ngo_reg_number          TEXT,          -- NGO registration number (e.g. CAC IG)
  ngo_reg_body            TEXT,          -- e.g. 'CAC', 'SCUML', 'EFCC_regulated'
  beneficiary_tracking    INTEGER NOT NULL DEFAULT 0 CHECK (beneficiary_tracking IN (0,1)),
  focus_area              TEXT,          -- e.g. 'education', 'health', 'environment'
  state_code              TEXT,
  lga_code                TEXT,
  created_at              INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at              INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (group_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_group_civic_ext_tenant
  ON group_civic_extensions (tenant_id, workspace_id);

-- Beneficiary records — linked to a civic group
CREATE TABLE IF NOT EXISTS group_civic_beneficiaries (
  id               TEXT PRIMARY KEY,
  tenant_id        TEXT NOT NULL,
  group_id         TEXT NOT NULL,
  workspace_id     TEXT NOT NULL,
  display_name     TEXT NOT NULL,        -- P13: never store NIN, BVN here
  category         TEXT,                 -- e.g. 'youth', 'widow', 'pwdi'
  state_code       TEXT,
  lga_code         TEXT,
  ward_code        TEXT,
  ndpr_consented   INTEGER NOT NULL DEFAULT 0 CHECK (ndpr_consented IN (0,1)), -- P10
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','exited','deceased')),
  enrolled_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  exited_at        INTEGER,
  notes            TEXT
);

CREATE INDEX IF NOT EXISTS idx_group_civic_beneficiaries_group
  ON group_civic_beneficiaries (tenant_id, group_id);

-- ---------------------------------------------------------------------------
-- Faith Extension — for churches, mosques, and faith communities
-- Package: @webwaka/groups-faith
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS group_faith_extensions (
  group_id                TEXT NOT NULL,
  tenant_id               TEXT NOT NULL,
  workspace_id            TEXT NOT NULL,
  faith_tradition         TEXT NOT NULL CHECK (
                            faith_tradition IN ('christianity','islam','traditional','other')
                          ),
  denomination            TEXT,          -- e.g. 'Baptist', 'Anglican', 'Redeemed'
  tithe_bridge_enabled    INTEGER NOT NULL DEFAULT 0 CHECK (tithe_bridge_enabled IN (0,1)),
  service_day             TEXT,          -- e.g. 'sunday', 'friday'
  congregation_size       INTEGER,
  state_code              TEXT,
  lga_code                TEXT,
  created_at              INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at              INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (group_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_group_faith_ext_tenant
  ON group_faith_extensions (tenant_id, workspace_id);

-- ---------------------------------------------------------------------------
-- Cooperative Extension — for savings groups, cooperatives, associations
-- Package: @webwaka/groups-cooperative
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS group_cooperative_extensions (
  group_id                TEXT NOT NULL,
  tenant_id               TEXT NOT NULL,
  workspace_id            TEXT NOT NULL,
  coop_type               TEXT NOT NULL DEFAULT 'savings' CHECK (
                            coop_type IN ('savings','credit','multipurpose','producer','consumer')
                          ),
  cac_reg_number          TEXT,          -- CAC cooperative registration
  savings_goal_kobo       INTEGER DEFAULT 0,   -- P9
  loan_fund_kobo          INTEGER DEFAULT 0,   -- P9
  shares_per_member_kobo  INTEGER DEFAULT 0,   -- P9 — standard share value
  dividend_rate_bps       INTEGER DEFAULT 0,   -- basis points (100 bps = 1%)
  state_code              TEXT,
  lga_code                TEXT,
  created_at              INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at              INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (group_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_group_cooperative_ext_tenant
  ON group_cooperative_extensions (tenant_id, workspace_id);
