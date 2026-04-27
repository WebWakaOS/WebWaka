-- Rollback: 0418_profiles_extended_columns
-- D1/SQLite does not support DROP COLUMN before SQLite 3.35.
-- The columns added by this migration cannot be dropped via ALTER TABLE.
-- Rollback is a no-op — the columns will remain but are nullable and harmless.
-- If a full rollback is required, recreate the profiles table from 0005 schema.
-- This is documented as a known D1/SQLite limitation (see 0014_kyc_fields rollback).

-- No-op rollback (D1/SQLite DROP COLUMN not supported for this table version).
-- See: 0014_kyc_fields.rollback.sql for precedent.
SELECT 1; -- ensures the rollback file is valid SQL
