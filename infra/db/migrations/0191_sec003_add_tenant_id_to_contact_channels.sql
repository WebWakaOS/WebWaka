-- Migration 0191 — SEC-003: Add tenant_id to contact_channels
-- Platform Invariant T3: Every tenant-scoped table must have tenant_id.
-- contact_channels was created in 0018 without tenant_id — a governance violation.

ALTER TABLE contact_channels ADD COLUMN tenant_id TEXT;

CREATE INDEX IF NOT EXISTS idx_contact_channels_tenant
  ON contact_channels(tenant_id);
