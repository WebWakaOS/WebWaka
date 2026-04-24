-- Migration: 0387_hitl_events_append_only
-- BUG-022: HITL append-only DDL.
-- Enforce write-once semantics on ai_hitl_events at the DB level using SQLite triggers.
-- Once an event row is written, it must never be updated or deleted — audit immutability.

-- Prevent UPDATE on ai_hitl_events (any column change is forbidden).
CREATE TRIGGER IF NOT EXISTS trg_hitl_events_no_update
BEFORE UPDATE ON ai_hitl_events
BEGIN
  SELECT RAISE(ABORT, 'ai_hitl_events is append-only: UPDATE is forbidden');
END;

-- Prevent DELETE on ai_hitl_events.
CREATE TRIGGER IF NOT EXISTS trg_hitl_events_no_delete
BEFORE DELETE ON ai_hitl_events
BEGIN
  SELECT RAISE(ABORT, 'ai_hitl_events is append-only: DELETE is forbidden');
END;

-- Also enforce on ai_hitl_queue: once a terminal status (approved/rejected/expired)
-- is set, the status column may never be changed again.
CREATE TRIGGER IF NOT EXISTS trg_hitl_queue_terminal_guard
BEFORE UPDATE OF status ON ai_hitl_queue
WHEN OLD.status IN ('approved', 'rejected', 'expired')
BEGIN
  SELECT RAISE(ABORT, 'ai_hitl_queue: terminal status cannot be changed (append-only guard)');
END;
