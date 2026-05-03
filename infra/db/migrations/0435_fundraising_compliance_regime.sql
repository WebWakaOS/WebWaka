-- Migration 0435: Add compliance_regime column to fundraising_campaigns
-- Phase 0 per PRD: Surface compliance regime as a first-class column so the
-- Policy Engine (Phase 5) and Compliance Report route can query it directly.
--
-- compliance_regime values:
--   'none'    — standard fundraising; no regulatory body oversight
--   'inec'    — INEC-regulated political campaign fundraising
--   'cbn_ngo' — CBN/CAC-regulated NGO/charity fundraising
--
-- Invariant (P9): All monetary caps remain as integer kobo.
-- Rollback: 0435_rollback.sql

ALTER TABLE fundraising_campaigns
  ADD COLUMN compliance_regime TEXT NOT NULL DEFAULT 'none';

-- Set correct regime for existing political/election campaigns
UPDATE fundraising_campaigns
SET compliance_regime = 'inec'
WHERE campaign_type IN ('political', 'election')
  AND compliance_regime = 'none';

-- Set correct regime for existing NGO campaigns
UPDATE fundraising_campaigns
SET compliance_regime = 'cbn_ngo'
WHERE campaign_type IN ('ngo', 'emergency', 'community')
  AND compliance_regime = 'none';

-- Add CHECK constraint via recreation is not directly possible in D1 (SQLite ALTER is limited).
-- The constraint is enforced at the application layer and in future full-table migrations.
-- Annotated here for documentation:
--   CHECK (compliance_regime IN ('none','inec','cbn_ngo'))

CREATE INDEX IF NOT EXISTS idx_fundraising_compliance ON fundraising_campaigns(compliance_regime, tenant_id);

-- ============================================================
-- Also update fundraising_compliance_declarations to reference
-- the regime column. Add a 'regime' column to declarations
-- for consistency with the parent campaign row.
-- ============================================================

ALTER TABLE fundraising_compliance_declarations
  ADD COLUMN compliance_regime TEXT NOT NULL DEFAULT 'none';

-- Propagate from parent campaign
-- Note: SQLite does not support table aliases in UPDATE statements.
UPDATE fundraising_compliance_declarations
SET compliance_regime = (
  SELECT fc.compliance_regime
  FROM fundraising_campaigns fc
  WHERE fc.id = fundraising_compliance_declarations.campaign_id
  LIMIT 1
)
WHERE fundraising_compliance_declarations.compliance_regime = 'none';
