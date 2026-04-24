-- Rollback for 0381_password_hash_version.sql
-- SQLite does not support DROP COLUMN in D1 — this rollback is advisory only.
-- To fully roll back: recreate the users table without password_hash_version.
-- In practice, the column is safe to leave (DEFAULT 1 means no behaviour change).
SELECT 'Rollback of 0381: password_hash_version column cannot be dropped in SQLite/D1. Advisory only.' AS note;
