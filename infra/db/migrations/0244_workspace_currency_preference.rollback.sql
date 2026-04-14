-- SQLite does not support DROP COLUMN on older versions.
-- Column remains but is ignored on rollback. Safe no-op.
SELECT 'rollback: display_currency column removal requires table recreation in SQLite';
