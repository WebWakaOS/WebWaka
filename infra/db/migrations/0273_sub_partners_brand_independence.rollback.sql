-- Rollback: 0273_sub_partners_brand_independence
-- SQLite does not support DROP COLUMN in all versions.
-- This rollback uses the standard rename-create-copy-drop pattern.
PRAGMA foreign_keys = OFF;

DROP INDEX IF EXISTS idx_sub_partners_brand_independence;

ALTER TABLE sub_partners RENAME TO _sub_partners_brand_bkp;

CREATE TABLE sub_partners (
  id                TEXT PRIMARY KEY,
  partner_id        TEXT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  tenant_id         TEXT NOT NULL,
  workspace_id      TEXT,
  status            TEXT NOT NULL DEFAULT 'pending',
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

INSERT INTO sub_partners
  SELECT id, partner_id, tenant_id, workspace_id, status, created_at, updated_at
  FROM _sub_partners_brand_bkp;

DROP TABLE _sub_partners_brand_bkp;

CREATE INDEX IF NOT EXISTS idx_sub_partners_partner_id    ON sub_partners(partner_id);
CREATE INDEX IF NOT EXISTS idx_sub_partners_tenant_id     ON sub_partners(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sub_partners_workspace_id  ON sub_partners(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sub_partners_status        ON sub_partners(status);

PRAGMA foreign_keys = ON;
