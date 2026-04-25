-- Rollback for 0392_dsar_requests_v2.sql
-- Recreates dsar_requests without the added columns, preserving all original constraints.
-- SQLite does not support DROP COLUMN in older D1 versions; table-recreation is required.

DROP INDEX IF EXISTS idx_dsar_requests_queue;

CREATE TABLE IF NOT EXISTS dsar_requests_rollback (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL,
  tenant_id       TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending',
  download_key    TEXT,
  requested_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  completed_at    INTEGER,
  expires_at      INTEGER NOT NULL
);

INSERT INTO dsar_requests_rollback
  (id, user_id, tenant_id, status, download_key, requested_at, completed_at, expires_at)
SELECT id, user_id, tenant_id, status, download_key, requested_at, completed_at, expires_at
FROM dsar_requests;

DROP TABLE dsar_requests;

ALTER TABLE dsar_requests_rollback RENAME TO dsar_requests;

CREATE INDEX IF NOT EXISTS idx_dsar_requests_user   ON dsar_requests (user_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_dsar_requests_status ON dsar_requests (status, expires_at);
