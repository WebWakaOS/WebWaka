-- Rollback for 0392_dsar_requests_v2.sql
-- SQLite does not support DROP COLUMN on older versions; recreate table without new columns.
DROP INDEX IF EXISTS idx_dsar_requests_queue;

CREATE TABLE dsar_requests_old AS SELECT
  id, user_id, tenant_id, status, download_key,
  requested_at, completed_at, expires_at
FROM dsar_requests;

DROP TABLE dsar_requests;

ALTER TABLE dsar_requests_old RENAME TO dsar_requests;

CREATE INDEX IF NOT EXISTS idx_dsar_requests_user   ON dsar_requests (user_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_dsar_requests_status ON dsar_requests (status, expires_at);
