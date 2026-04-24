-- Rollback: 0387_hitl_events_append_only
-- Remove the append-only enforcement triggers added in 0387.

DROP TRIGGER IF EXISTS trg_hitl_events_no_update;
DROP TRIGGER IF EXISTS trg_hitl_events_no_delete;
DROP TRIGGER IF EXISTS trg_hitl_queue_terminal_guard;
