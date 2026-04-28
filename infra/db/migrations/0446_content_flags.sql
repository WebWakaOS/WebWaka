-- Migration 0446 — Content Flags (Community Reporting)
-- Phase 2: Flag content for moderation review
--
-- Platform Invariants:
--   T3 — tenant_id on all records

CREATE TABLE IF NOT EXISTS content_flags (
  id                TEXT PRIMARY KEY,
  tenant_id         TEXT NOT NULL,
  workspace_id      TEXT NOT NULL,
  reporter_user_id  TEXT NOT NULL,
  content_type      TEXT NOT NULL,   -- e.g. 'broadcast', 'post', 'case_note', 'poll'
  content_id        TEXT NOT NULL,
  reason            TEXT NOT NULL CHECK (
                      reason IN (
                        'hate_speech','misinformation','spam',
                        'harassment','nudity','violence','other'
                      )
                    ),
  description       TEXT,            -- optional additional context from reporter
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (
                      status IN ('pending','reviewed','dismissed','actioned')
                    ),
  reviewed_by       TEXT,
  reviewed_at       INTEGER,
  review_note       TEXT,
  created_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_content_flags_tenant_status
  ON content_flags (tenant_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_flags_content
  ON content_flags (tenant_id, content_type, content_id);
