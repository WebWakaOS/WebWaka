-- Rollback 0191 — Remove tenant_id from contact_channels
-- NOTE: SQLite does not support DROP COLUMN before 3.35.0.
-- D1 uses a recent SQLite version that supports ALTER TABLE DROP COLUMN.

DROP INDEX IF EXISTS idx_contact_channels_tenant;
ALTER TABLE contact_channels DROP COLUMN tenant_id;
