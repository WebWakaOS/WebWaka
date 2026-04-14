DROP INDEX IF EXISTS idx_users_email_verified;
-- SQLite does not support DROP COLUMN; column remains but is ignored.
-- To fully roll back, recreate users table without email_verified_at.
