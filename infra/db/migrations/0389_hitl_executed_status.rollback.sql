-- Rollback: 0389_hitl_executed_status
-- Restores original CHECK constraints and triggers (removes 'executed' support).
-- Any rows with status='executed' or event_type='executed' are excluded from the
-- restored tables (they would violate the original CHECK constraints).

PRAGMA foreign_keys = OFF;

-- Remove updated triggers
DROP TRIGGER IF EXISTS trg_hitl_queue_terminal_guard;
DROP TRIGGER IF EXISTS trg_hitl_events_no_update;
DROP TRIGGER IF EXISTS trg_hitl_events_no_delete;

-- ─── Rebuild ai_hitl_queue without 'executed' ────────────────────────────────
ALTER TABLE ai_hitl_queue RENAME TO _ai_hitl_queue_0389_rb;

CREATE TABLE ai_hitl_queue (
  id                   TEXT    PRIMARY KEY,
  tenant_id            TEXT    NOT NULL,
  workspace_id         TEXT    NOT NULL,
  user_id              TEXT    NOT NULL,
  vertical             TEXT    NOT NULL,
  capability           TEXT    NOT NULL,
  hitl_level           INTEGER NOT NULL CHECK (hitl_level IN (1, 2, 3)),
  status               TEXT    NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  ai_request_payload   TEXT    NOT NULL,
  ai_response_payload  TEXT,
  reviewer_id          TEXT,
  reviewed_at          TEXT,
  review_note          TEXT,
  expires_at           TEXT    NOT NULL,
  created_at           TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

INSERT INTO ai_hitl_queue
SELECT * FROM _ai_hitl_queue_0389_rb
WHERE status IN ('pending', 'approved', 'rejected', 'expired');

DROP TABLE _ai_hitl_queue_0389_rb;

CREATE INDEX IF NOT EXISTS idx_hitl_queue_tenant_status ON ai_hitl_queue(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_hitl_queue_reviewer       ON ai_hitl_queue(tenant_id, reviewer_id);
CREATE INDEX IF NOT EXISTS idx_hitl_queue_expires        ON ai_hitl_queue(expires_at);

-- ─── Rebuild ai_hitl_events without 'executed' ───────────────────────────────
ALTER TABLE ai_hitl_events RENAME TO _ai_hitl_events_0389_rb;

CREATE TABLE ai_hitl_events (
  id             TEXT PRIMARY KEY,
  tenant_id      TEXT NOT NULL,
  queue_item_id  TEXT NOT NULL REFERENCES ai_hitl_queue(id),
  event_type     TEXT NOT NULL
                      CHECK (event_type IN ('created', 'approved', 'rejected', 'expired', 'escalated')),
  actor_id       TEXT,
  note           TEXT,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

INSERT INTO ai_hitl_events
SELECT * FROM _ai_hitl_events_0389_rb
WHERE event_type IN ('created', 'approved', 'rejected', 'expired', 'escalated');

DROP TABLE _ai_hitl_events_0389_rb;

CREATE INDEX IF NOT EXISTS idx_hitl_events_queue  ON ai_hitl_events(queue_item_id);
CREATE INDEX IF NOT EXISTS idx_hitl_events_tenant ON ai_hitl_events(tenant_id);

-- ─── Restore original triggers ────────────────────────────────────────────────
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

CREATE TRIGGER trg_hitl_queue_terminal_guard
BEFORE UPDATE OF status ON ai_hitl_queue
WHEN OLD.status IN ('approved', 'rejected', 'expired')
BEGIN
  SELECT RAISE(ABORT, 'ai_hitl_queue: terminal status cannot be changed (append-only guard)');
END;

PRAGMA foreign_keys = ON;
