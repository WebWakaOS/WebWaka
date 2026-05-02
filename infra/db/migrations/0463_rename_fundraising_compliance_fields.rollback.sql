-- Rollback for migration 0463: Restore INEC-specific column names
-- Apply only if rolling back to pre-0463 code that expects the old column names.

ALTER TABLE fundraising_campaigns RENAME COLUMN contribution_cap_kobo TO inec_cap_kobo;
ALTER TABLE fundraising_campaigns RENAME COLUMN disclosure_required TO inec_disclosure_required;
