-- 0388_organizations_discovery_columns.rollback.sql
-- Rollback: remove Pillar 3 discovery columns from organizations.
-- SQLite does not support DROP COLUMN (before 3.35); simulate with table recreate.
--
-- WARNING: This rollback drops is_published, category, place_id, description,
-- phone, website, logo_url data. Run only when rolling back the staging deploy
-- that applied 0388_organizations_discovery_columns.sql.

ALTER TABLE organizations RENAME TO organizations_0388_bak;
DROP INDEX IF EXISTS idx_organizations_is_published;
DROP INDEX IF EXISTS idx_organizations_category;
DROP INDEX IF EXISTS idx_organizations_place_id;

CREATE TABLE IF NOT EXISTS organizations (
  id                  TEXT NOT NULL PRIMARY KEY,
  tenant_id           TEXT NOT NULL,
  name                TEXT NOT NULL DEFAULT '',
  registration_number TEXT,
  verification_state  TEXT NOT NULL DEFAULT 'unverified',
  created_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  email               TEXT,
  data_residency      TEXT NOT NULL DEFAULT 'NG',
  slug                TEXT UNIQUE,
  organization_type   TEXT NOT NULL DEFAULT 'unclassified',
  legal_name          TEXT,
  display_name        TEXT,
  status              TEXT NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_organizations_tenant_id ON organizations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_organizations_type      ON organizations(organization_type);
CREATE INDEX IF NOT EXISTS idx_organizations_status    ON organizations(status);

INSERT OR IGNORE INTO organizations
  (id, tenant_id, name, registration_number, verification_state,
   created_at, updated_at, email, data_residency, slug,
   organization_type, legal_name, display_name, status)
SELECT
  id, tenant_id, name, registration_number, verification_state,
  created_at, updated_at, email, data_residency, slug,
  organization_type, legal_name, display_name, status
FROM organizations_0388_bak;
