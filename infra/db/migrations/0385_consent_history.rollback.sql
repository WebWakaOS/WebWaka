DROP INDEX IF EXISTS idx_consent_history_version;
DROP INDEX IF EXISTS idx_consent_history_user;
DROP TABLE IF EXISTS consent_history;
-- Note: consent_version and consented_at columns on users cannot be dropped automatically.
-- Coordinate with DBA for column removal if needed.
