-- COMP-001 / ENH-039: NDPR DSAR (Data Subject Access Request) table.
-- Users can request a full export of their personal data.
-- Scheduler processes pending requests and stores exports in KV with 48h TTL.
CREATE TABLE IF NOT EXISTS dsar_requests (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL,
  tenant_id       TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending',  -- pending | processing | ready | expired
  download_key    TEXT,
  requested_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  completed_at    INTEGER,
  expires_at      INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dsar_requests_user    ON dsar_requests (user_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_dsar_requests_status  ON dsar_requests (status, expires_at);
