-- Migration 0463: Rename INEC-specific fundraising columns to generic names (DEBT-002, P1-021/P1-023)
--
-- PRD Class 2 debt: fundraising_campaigns table had INEC-Nigeria-specific column names.
-- These are renamed to generic equivalents so the same engine can serve any regulated vertical
-- (church tithe limits, NGO donor disclosure, CBN transaction caps, etc.).
--
-- Column mapping:
--   inec_cap_kobo          → contribution_cap_kobo
--   inec_disclosure_required → disclosure_required
--
-- Backward compat: All existing rows retain their values. No data loss.
-- Policy engine: contribution_cap policy_rules row seeded in migration 0434 still applies.
--
-- T3 invariant: tenant_id filter unaffected by this rename.
-- Rollback: 0463_rename_fundraising_compliance_fields.rollback.sql

ALTER TABLE fundraising_campaigns RENAME COLUMN inec_cap_kobo TO contribution_cap_kobo;
ALTER TABLE fundraising_campaigns RENAME COLUMN inec_disclosure_required TO disclosure_required;
