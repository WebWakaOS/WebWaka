-- D1/SQLite does not support DROP COLUMN on older versions.
-- To rollback: recreate users table without totp columns (coordinate with DBA).
-- Minimal safe rollback: zero out the columns in application layer before dropping.
SELECT 'MANUAL ROLLBACK REQUIRED: remove totp_secret, totp_enabled, totp_enrolled_at columns from users';
