-- BUG-005 / ENH-004: Scheduled jobs dispatch table for the dedicated schedulers Worker.
-- One CRON slot fires every 30 minutes; this table drives all internal recurring jobs,
-- freeing the 5 production CRON slots for critical-path only.
CREATE TABLE IF NOT EXISTS scheduled_jobs (
  name                 TEXT PRIMARY KEY,
  enabled              INTEGER NOT NULL DEFAULT 1,
  priority             INTEGER NOT NULL DEFAULT 5,   -- higher = runs first
  run_interval_seconds INTEGER NOT NULL DEFAULT 3600,
  next_run_at          INTEGER NOT NULL DEFAULT 0,   -- 0 = run on first tick
  last_run_at          INTEGER,
  last_status          TEXT,                         -- 'ok' | 'error' | 'skipped'
  last_error           TEXT
);

INSERT OR IGNORE INTO scheduled_jobs (name, run_interval_seconds, priority) VALUES
  ('audit-log-redriver',         300,    10),
  ('refresh-token-cleanup',      86400,  1),
  ('ndpr-retention-sweep',       86400,  3),
  ('wallet-tier-reconciliation', 86400,  8),
  ('dsar-export-processor',      3600,   7);
