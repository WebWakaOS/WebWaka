-- Migration 0050: Political Party vertical profiles
-- packages/verticals-political-party (M8b scaffold — promoted to full migration)
-- T3: tenant_id on all rows; indexed for scoped queries.

CREATE TABLE IF NOT EXISTS political_party_profiles (
  id              TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  workspace_id    TEXT NOT NULL REFERENCES workspaces(id),
  tenant_id       TEXT NOT NULL,
  party_name      TEXT NOT NULL,
  abbreviation    TEXT,
  cac_reg_number  TEXT,
  inec_reg_number TEXT,
  chairperson_id  TEXT,            -- FK → individuals(id); nullable
  status          TEXT NOT NULL DEFAULT 'seeded',  -- seeded|claimed|active|suspended|deprecated
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_party_tenant     ON political_party_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_party_workspace  ON political_party_profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_party_status     ON political_party_profiles(status, tenant_id);
