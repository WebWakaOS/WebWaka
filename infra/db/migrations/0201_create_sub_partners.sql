-- Migration: 0201_create_sub_partners
-- Description: Create sub_partners table for M11 Partner & White-Label.
-- Governance: partner-and-subpartner-model.md Phase 2
-- Invariant: T3 (tenant_id isolation), rule 3 (auditable parent record)

CREATE TABLE IF NOT EXISTS sub_partners (
  id                        TEXT NOT NULL PRIMARY KEY,
  partner_id                TEXT NOT NULL REFERENCES partners(id),
  tenant_id                 TEXT NOT NULL,
  workspace_id              TEXT NOT NULL REFERENCES workspaces(id),
  delegation_agreement_ref  TEXT,
  status                    TEXT NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'suspended', 'deactivated')),
  created_by                TEXT NOT NULL,
  created_at                TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at                TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sub_partners_partner_id ON sub_partners(partner_id);
CREATE INDEX IF NOT EXISTS idx_sub_partners_tenant_id ON sub_partners(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sub_partners_workspace_id ON sub_partners(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sub_partners_status ON sub_partners(status);
