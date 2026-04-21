-- Migration: 0232_sessions_extend
-- Description: Extend sessions table for multi-device session management (P20-B).
-- Adds device_hint (browser/OS description), user_agent (raw UA string), and
-- last_seen_at (updated on each authenticated request) for session listing UX.

ALTER TABLE sessions ADD COLUMN device_hint   TEXT;
ALTER TABLE sessions ADD COLUMN user_agent    TEXT;
ALTER TABLE sessions ADD COLUMN last_seen_at  INTEGER;
ALTER TABLE sessions ADD COLUMN jti           TEXT;

CREATE INDEX IF NOT EXISTS idx_sessions_jti ON sessions(jti) WHERE jti IS NOT NULL;
