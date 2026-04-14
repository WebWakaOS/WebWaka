-- Migration: 0234_projection_checkpoints
-- Description: Checkpoint table for incremental event-log projection rebuilds (Issue 4 / P21).
-- Each named projection stores the last processed event position and run metadata.
-- The projections CRON uses this for incremental (not full) rebuilds at scale.
-- T3: This table is NOT tenant-scoped — it is a system-level operational table.

CREATE TABLE IF NOT EXISTS projection_checkpoints (
  id           TEXT NOT NULL PRIMARY KEY,
  projection   TEXT NOT NULL UNIQUE,
  last_event_id TEXT,
  last_run_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  run_count    INTEGER NOT NULL DEFAULT 0,
  last_error   TEXT,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_projection_checkpoints_projection
  ON projection_checkpoints(projection);
