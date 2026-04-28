-- Rollback for 0432: Restore groups_* tables back to support_groups_*
-- Phase 0 rollback — reverse the table rename from groups_* → support_groups_*
--
-- WARNING: This rollback DESTROYS any data written to groups_* tables after
--          migration 0432 ran. Only execute if migration 0432 failed mid-run
--          or during QA gate rejection before Phase 1 is deployed.
--
-- T3 invariant: tenant_id preserved on all tables throughout rollback.

-- ============================================================
-- 1. support_groups (was: groups)
-- ============================================================
CREATE TABLE IF NOT EXISTS support_groups (
  id                   TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  workspace_id         TEXT NOT NULL,
  tenant_id            TEXT NOT NULL,
  name                 TEXT NOT NULL,
  slug                 TEXT NOT NULL,
  description          TEXT,
  group_type           TEXT NOT NULL DEFAULT 'general',
  hierarchy_level      TEXT NOT NULL DEFAULT 'national',
  parent_group_id      TEXT REFERENCES support_groups(id),
  place_id             TEXT,
  state_code           TEXT,
  lga_code             TEXT,
  ward_code            TEXT,
  polling_unit_code    TEXT,
  visibility           TEXT NOT NULL DEFAULT 'public',
  join_policy          TEXT NOT NULL DEFAULT 'open',
  status               TEXT NOT NULL DEFAULT 'active',
  member_count         INTEGER NOT NULL DEFAULT 0,
  logo_url             TEXT,
  cover_url            TEXT,
  constitution_url     TEXT,
  website_url          TEXT,
  ndpr_consent_required INTEGER NOT NULL DEFAULT 1,
  created_at           INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at           INTEGER NOT NULL DEFAULT (unixepoch())
);
INSERT OR IGNORE INTO support_groups SELECT
  id, workspace_id, tenant_id, name, slug, description,
  category AS group_type,
  hierarchy_level, parent_group_id, place_id, state_code, lga_code,
  ward_code, polling_unit_code, visibility, join_policy, status,
  member_count, logo_url, cover_url, constitution_url, website_url,
  ndpr_consent_required, created_at, updated_at
FROM groups;
DROP TABLE IF EXISTS groups;

CREATE UNIQUE INDEX IF NOT EXISTS ux_support_groups_tenant_slug ON support_groups(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_support_groups_workspace ON support_groups(workspace_id, tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_support_groups_geo ON support_groups(tenant_id, state_code, lga_code, ward_code);
CREATE INDEX IF NOT EXISTS idx_support_groups_parent ON support_groups(parent_group_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_support_groups_type ON support_groups(tenant_id, group_type, status);

-- ============================================================
-- 2. Remaining tables: restore support_groups_* names
-- ============================================================
ALTER TABLE group_members           RENAME TO support_group_members;
ALTER TABLE group_meetings          RENAME TO support_group_meetings;
ALTER TABLE group_broadcasts        RENAME TO support_group_broadcasts;
ALTER TABLE group_events            RENAME TO support_group_events;
ALTER TABLE group_petitions         RENAME TO support_group_petitions;
ALTER TABLE group_petition_signatures RENAME TO support_group_petition_signatures;
ALTER TABLE group_analytics_daily   RENAME TO support_group_analytics_daily;

-- Restore original table name for GOTV (was support_group_gotv_records)
ALTER TABLE political_gotv_records  RENAME TO support_group_gotv_records;
