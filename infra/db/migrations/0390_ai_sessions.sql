-- Migration: 0390_ai_sessions
-- SA-6.x — Server-side Agent Sessions: persistent conversation state for /superagent/chat.
--
-- Background: each /chat call is currently stateless; the client must resend the full
-- message history on every request. Agent Sessions add a D1-backed store so callers
-- can pass an optional session_id and get continuity across turns.
--
-- Tables:
--   ai_sessions          — one row per conversation (TTL-capped, 7-day default)
--   ai_session_messages  — ordered message history with per-row token estimates
--
-- Platform Invariants:
--   T3  — all queries scoped on tenant_id; no cross-tenant leakage
--   P9  — no monetary fields; token_estimate is informational only
--   P13 — content is stored as-is (PII stripping happens at call site, before storage)
--   G23 — additive migration; no destructive changes
--
-- Rollback: 0390_ai_sessions.rollback.sql

-- ── ai_sessions ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_sessions (
  id              TEXT    PRIMARY KEY,
  tenant_id       TEXT    NOT NULL,
  user_id         TEXT    NOT NULL,
  workspace_id    TEXT,
  vertical        TEXT,
  title           TEXT,
  message_count   INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  last_active_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  expires_at      TEXT    NOT NULL
);

-- Lookup by owner (list page, pagination)
CREATE INDEX IF NOT EXISTS idx_ai_sessions_owner
  ON ai_sessions(tenant_id, user_id, last_active_at DESC);

-- TTL sweep (scheduler pruning)
CREATE INDEX IF NOT EXISTS idx_ai_sessions_expires
  ON ai_sessions(expires_at);

-- ── ai_session_messages ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_session_messages (
  id               TEXT    PRIMARY KEY,
  session_id       TEXT    NOT NULL REFERENCES ai_sessions(id) ON DELETE CASCADE,
  tenant_id        TEXT    NOT NULL,
  role             TEXT    NOT NULL
                           CHECK (role IN ('system', 'user', 'assistant', 'tool')),
  content          TEXT    NOT NULL DEFAULT '',
  tool_calls_json  TEXT,           -- JSON array of ToolCall objects (assistant turns)
  tool_call_id     TEXT,           -- populated for role='tool' result messages
  token_estimate   INTEGER NOT NULL DEFAULT 0,
  created_at       TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- History load: all messages for a session in order (tenant-scoped for T3 safety)
CREATE INDEX IF NOT EXISTS idx_ai_session_messages_session
  ON ai_session_messages(session_id, tenant_id, created_at ASC);
