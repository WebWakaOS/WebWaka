-- ALTER TABLE organizations DROP COLUMN slug; -- D1/SQLite does not support DROP COLUMN before 3.35
-- Manual table rebuild required.
DROP INDEX IF EXISTS idx_organizations_slug;
