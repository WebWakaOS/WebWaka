-- Migration 0433: Group electoral extensions + GOTV table migration
-- Phase 0 per PRD: Extract electoral-specific data from core groups table.
--
-- Changes:
--   (a) Create group_electoral_extensions: holds politician_id, campaign_office_id,
--       election_cycle_id, INEC registration — formerly on support_groups core table
--   (b) Create political_gotv_records: new canonical GOTV table
--       Migrates data from support_group_gotv_records (now shadow table).
--   (c) Populate group_electoral_extensions from legacy support_groups.politician_id
--
-- Design principle (P4):
--   The core groups table has no vertical-specific columns.
--   Electoral data lives in extension tables loaded on demand.
--
-- Tenant invariant (T3): tenant_id ON every table — enforced.
-- Rollback: 0433_rollback.sql

-- ============================================================
-- 1. group_electoral_extensions
-- ============================================================

CREATE TABLE IF NOT EXISTS group_electoral_extensions (
  group_id          TEXT    NOT NULL,
  workspace_id      TEXT    NOT NULL,
  tenant_id         TEXT    NOT NULL,
  politician_id     TEXT,
  campaign_office_id TEXT,
  election_cycle_id TEXT,
  target_state_code TEXT,
  target_lga_code   TEXT,
  target_ward_code  TEXT,
  inec_registered   INTEGER NOT NULL DEFAULT 0,
  inec_reg_number   TEXT,
  created_at        INTEGER NOT NULL,
  updated_at        INTEGER NOT NULL,
  PRIMARY KEY (group_id, tenant_id),
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- Populate from legacy support_groups rows that had politician_id set
INSERT OR IGNORE INTO group_electoral_extensions
  (group_id, workspace_id, tenant_id, politician_id, campaign_office_id,
   created_at, updated_at)
SELECT
  id, workspace_id, tenant_id, politician_id, campaign_office_id,
  created_at, updated_at
FROM support_groups
WHERE politician_id IS NOT NULL OR campaign_office_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_grp_electoral_politician ON group_electoral_extensions(politician_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_grp_electoral_election   ON group_electoral_extensions(election_cycle_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_grp_electoral_target     ON group_electoral_extensions(target_state_code, target_lga_code, tenant_id);

-- ============================================================
-- 2. political_gotv_records
--    (was: support_group_gotv_records — now renamed and re-homed)
--
-- P13: voter_ref is stored hashed. Callers must hash before inserting.
--   voter_ref is NEVER returned in list API responses.
--   voter_ref is NEVER passed to AI contexts.
--   Only aggregate stats (total/accredited/voted) are surfaced.
-- ============================================================

CREATE TABLE IF NOT EXISTS political_gotv_records (
  id                    TEXT    NOT NULL,
  group_id              TEXT    NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  workspace_id          TEXT    NOT NULL,
  tenant_id             TEXT    NOT NULL,
  voter_ref             TEXT    NOT NULL,  -- @P13: hashed voter ID, never surfaced
  polling_unit_code     TEXT    NOT NULL,
  state_code            TEXT,
  lga_code              TEXT,
  ward_code             TEXT,
  coordinator_member_id TEXT    NOT NULL,
  accredited            INTEGER NOT NULL DEFAULT 0,
  voted                 INTEGER NOT NULL DEFAULT 0,
  mobilized_at          INTEGER NOT NULL,
  vote_confirmed_at     INTEGER,
  PRIMARY KEY (id),
  CHECK (accredited IN (0, 1)),
  CHECK (voted      IN (0, 1))
);

-- Migrate existing GOTV records from shadow table
INSERT OR IGNORE INTO political_gotv_records
  (id, group_id, workspace_id, tenant_id, voter_ref, polling_unit_code,
   state_code, lga_code, ward_code, coordinator_member_id,
   accredited, voted, mobilized_at, vote_confirmed_at)
SELECT
  id, group_id, workspace_id, tenant_id, voter_ref, polling_unit_code,
  state_code, lga_code, ward_code, coordinator_member_id,
  accredited, voted, mobilized_at, vote_confirmed_at
FROM support_group_gotv_records;

CREATE INDEX IF NOT EXISTS idx_gotv_group          ON political_gotv_records(group_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_gotv_polling_unit   ON political_gotv_records(polling_unit_code, tenant_id);
CREATE INDEX IF NOT EXISTS idx_gotv_ward           ON political_gotv_records(ward_code, tenant_id);
CREATE INDEX IF NOT EXISTS idx_gotv_coordinator    ON political_gotv_records(coordinator_member_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_gotv_mobilized_at   ON political_gotv_records(mobilized_at, tenant_id);

-- ============================================================
-- NOTE: support_group_gotv_records is kept as shadow table until Phase 0 QA pass.
-- Removal: 0438_drop_support_groups_shadow_tables.sql
-- ============================================================
