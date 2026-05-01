-- Migration 0457: Platform-level contact form messages (marketing site)
-- Stores messages sent via the webwaka.com/contact form.
-- No tenant_id FK — these are pre-registration/pre-login enquiries.

CREATE TABLE IF NOT EXISTS platform_contact_messages (
  id          TEXT    PRIMARY KEY,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL,
  message     TEXT    NOT NULL,
  user_agent  TEXT,
  is_read     INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_pcm_created
  ON platform_contact_messages(created_at DESC);
