-- Migration: 0200_create_partners
-- Description: Create partners table for M11 Partner & White-Label.
-- Governance: partner-and-subpartner-model.md Phase 1
-- Invariant: T3 (tenant_id on every record), T5 (subscription-gated)

CREATE TABLE IF NOT EXISTS partners (
  id                TEXT NOT NULL PRIMARY KEY,
  tenant_id         TEXT NOT NULL,
  workspace_id      TEXT NOT NULL REFERENCES workspaces(id),
  company_name      TEXT NOT NULL,
  contact_email     TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'active', 'suspended', 'deactivated')),
  max_sub_partners  INTEGER NOT NULL DEFAULT 10,
  onboarded_at      TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_partners_tenant_id ON partners(tenant_id);
CREATE INDEX IF NOT EXISTS idx_partners_workspace_id ON partners(workspace_id);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
