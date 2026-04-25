-- Migration 0392: DSAR requests v2 — R2-backed export processor (COMP-002)
-- Adds retry tracking, error capture, and R2 object key columns.
-- Adds status 'completed' and 'permanently_failed' to lifecycle.
-- G23: additive ALTER TABLE only — no existing data is modified.

ALTER TABLE dsar_requests ADD COLUMN export_key     TEXT;
ALTER TABLE dsar_requests ADD COLUMN retry_count    INTEGER NOT NULL DEFAULT 0;
ALTER TABLE dsar_requests ADD COLUMN error_message  TEXT;

-- Efficient queue polling: pending requests ordered by submission time.
CREATE INDEX IF NOT EXISTS idx_dsar_requests_queue
  ON dsar_requests (status, requested_at ASC);
