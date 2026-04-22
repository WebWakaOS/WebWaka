-- 0329b_fix_mosque_profiles_schema.sql
-- Upgrade mosque_profiles from v1 to v2 schema.
-- v1 columns: id, organization_id, workspace_id, tenant_id, mosque_name,
--             it_number, total_members, status, created_at
-- v2 columns (required by 0330+): id, workspace_id, tenant_id, mosque_name,
--             nscia_affiliation_number, it_registration_number, state, lga,
--             congregation_size, status, created_at, updated_at
-- mosque_profiles has 0 rows at migration time — DROP and recreate is safe.
-- ============================================================

DROP TABLE IF EXISTS mosque_profiles;

CREATE TABLE mosque_profiles (
  id                       TEXT    PRIMARY KEY,
  workspace_id             TEXT    NOT NULL,
  tenant_id                TEXT    NOT NULL,
  mosque_name              TEXT    NOT NULL,
  nscia_affiliation_number TEXT,
  it_registration_number   TEXT,
  state                    TEXT,
  lga                      TEXT,
  congregation_size        INTEGER NOT NULL DEFAULT 0,
  status                   TEXT    NOT NULL DEFAULT 'seeded'
                           CHECK (status IN ('seeded','claimed','it_verified','active')),
  created_at               INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at               INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_mosque_profiles_tenant    ON mosque_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mosque_profiles_workspace ON mosque_profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_mosque_profiles_state     ON mosque_profiles(state, tenant_id);
