-- Rollback 0226a: SQLite does not support DROP COLUMN on older versions.
-- The tags column is nullable with no default — leaving it in place is safe.
-- No action required.
SELECT 1;
