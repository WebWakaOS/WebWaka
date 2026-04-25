-- Migration: 0389_hitl_executed_status
-- SA-4.6 — Complete the HITL state machine by adding 'executed' as a valid
-- status on ai_hitl_queue and as a valid event_type on ai_hitl_events.
--
-- Root cause: markExecuted() (F-020 fix) updates status 'approved' → 'executed',
-- but two guards blocked this:
--   (a) trg_hitl_queue_terminal_guard treated 'approved' as a terminal state,
--       raising ABORT on any status change from 'approved'.
--   (b) ai_hitl_queue.status CHECK constraint excluded 'executed'.
--   (c) ai_hitl_events.event_type CHECK constraint excluded 'executed'.
--
-- This migration:
--   1. Drops and recreates trg_hitl_queue_terminal_guard so only truly terminal
--      states (rejected, expired, executed) block further changes. 'approved'
--      is now correctly treated as a transient state that progresses to 'executed'.
--   2. Rebuilds ai_hitl_queue with status CHECK extended to include 'executed'.
--   3. Rebuilds ai_hitl_events with event_type CHECK extended to include 'executed'.
--   4. Recreates all dependent triggers on the rebuilt tables.
--
-- Uses the SQLite table-rebuild pattern (no ALTER COLUMN / DROP CONSTRAINT support).
-- Foreign key enforcement suspended for the duration of the rebuild.

PRAGMA foreign_keys = OFF;

-- ─── 1. Drop the blocking terminal guard trigger ──────────────────────────────
-- Will be recreated with corrected condition after the table rebuild.
DROP TRIGGER IF EXISTS trg_hitl_queue_terminal_guard;

-- ─── 2. Rebuild ai_hitl_queue with 'executed' in status CHECK ────────────────
ALTER TABLE ai_hitl_queue RENAME TO _ai_hitl_queue_0389;

CREATE TABLE ai_hitl_queue (
  id                   TEXT    PRIMARY KEY,
  tenant_id            TEXT    NOT NULL,
  workspace_id         TEXT    NOT NULL,
  user_id              TEXT    NOT NULL,
  vertical             TEXT    NOT NULL,
  capability           TEXT    NOT NULL,
  hitl_level           INTEGER NOT NULL CHECK (hitl_level IN (1, 2, 3)),
  status               TEXT    NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'executed')),
  ai_request_payload   TEXT    NOT NULL,
  ai_response_payload  TEXT,
  reviewer_id          TEXT,
  reviewed_at          TEXT,
  review_note          TEXT,
  expires_at           TEXT    NOT NULL,
  created_at           TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

INSERT INTO ai_hitl_queue SELECT * FROM _ai_hitl_queue_0389;
DROP TABLE _ai_hitl_queue_0389;

CREATE INDEX IF NOT EXISTS idx_hitl_queue_tenant_status ON ai_hitl_queue(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_hitl_queue_reviewer       ON ai_hitl_queue(tenant_id, reviewer_id);
CREATE INDEX IF NOT EXISTS idx_hitl_queue_expires        ON ai_hitl_queue(expires_at);

-- ─── 3. Rebuild ai_hitl_events with 'executed' in event_type CHECK ───────────
-- Drop append-only triggers before rename so they can be recreated on the new table.
DROP TRIGGER IF EXISTS trg_hitl_events_no_update;
DROP TRIGGER IF EXISTS trg_hitl_events_no_delete;

ALTER TABLE ai_hitl_events RENAME TO _ai_hitl_events_0389;

CREATE TABLE ai_hitl_events (
  id             TEXT PRIMARY KEY,
  tenant_id      TEXT NOT NULL,
  queue_item_id  TEXT NOT NULL REFERENCES ai_hitl_queue(id),
  event_type     TEXT NOT NULL
                      CHECK (event_type IN ('created', 'approved', 'rejected', 'expired', 'escalated', 'executed')),
  actor_id       TEXT,
  note           TEXT,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

INSERT INTO ai_hitl_events SELECT * FROM _ai_hitl_events_0389;
DROP TABLE _ai_hitl_events_0389;

CREATE INDEX IF NOT EXISTS idx_hitl_events_queue  ON ai_hitl_events(queue_item_id);
CREATE INDEX IF NOT EXISTS idx_hitl_events_tenant ON ai_hitl_events(tenant_id);

-- ─── 4. Recreate all triggers on the new tables ───────────────────────────────

-- Append-only guards for ai_hitl_events (from migration 0387):
CREATE TRIGGER trg_hitl_events_no_update
BEFORE UPDATE ON ai_hitl_events
BEGIN
  SELECT RAISE(ABORT, 'ai_hitl_events is append-only: UPDATE is forbidden');
END;

CREATE TRIGGER trg_hitl_events_no_delete
BEFORE DELETE ON ai_hitl_events
BEGIN
  SELECT RAISE(ABORT, 'ai_hitl_events is append-only: DELETE is forbidden');
END;

-- Terminal guard for ai_hitl_queue (corrected):
-- 'approved' removed from terminal list — it is now a transient state.
-- State machine: pending → approved → executed (or) rejected/expired (terminal).
CREATE TRIGGER trg_hitl_queue_terminal_guard
BEFORE UPDATE OF status ON ai_hitl_queue
WHEN OLD.status IN ('rejected', 'expired', 'executed')
BEGIN
  SELECT RAISE(ABORT, 'ai_hitl_queue: status cannot be changed once terminal (rejected/expired/executed)');
END;

PRAGMA foreign_keys = ON;
