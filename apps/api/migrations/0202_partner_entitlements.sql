-- Migration: 0202_partner_entitlements
-- Description: Partner entitlement grants table for M11 Partner & White-Label.
-- Governance: partner-and-subpartner-model.md Phase 1 + entitlement-model.md
-- Invariant: T3 (partner_id scoped), T5 (subscription-gated entitlements)
--
-- Each row grants a single entitlement dimension to a partner.
-- Dimensions align with entitlement-model.md:
--   white_label_depth    INTEGER (0=none, 1=partial, 2=full)
--   delegation_rights    INTEGER (0=none, 1=sub_partner_creation_allowed)
--   max_sub_partners     INTEGER
--   max_tenants          INTEGER
--   max_workspaces       INTEGER
--   ai_access            TEXT    ('none'|'basic'|'advanced'|'byok')
--   visibility_featured  INTEGER (0=no, 1=yes)

CREATE TABLE IF NOT EXISTS partner_entitlements (
  id             TEXT NOT NULL PRIMARY KEY,
  partner_id     TEXT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  dimension      TEXT NOT NULL
                 CHECK (dimension IN (
                   'white_label_depth', 'delegation_rights', 'max_sub_partners',
                   'max_tenants', 'max_workspaces', 'ai_access', 'visibility_featured'
                 )),
  value          TEXT NOT NULL,
  granted_by     TEXT NOT NULL,
  granted_at     TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at     TEXT,
  UNIQUE(partner_id, dimension)
);

CREATE INDEX IF NOT EXISTS idx_partner_entitlements_partner_id ON partner_entitlements(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_entitlements_dimension  ON partner_entitlements(dimension);
