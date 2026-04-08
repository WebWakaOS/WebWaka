-- infra/db/migrations/0028_courses.sql

CREATE TABLE IF NOT EXISTS course_modules (
  id              TEXT NOT NULL PRIMARY KEY,
  community_id    TEXT NOT NULL REFERENCES community_spaces(id),
  title           TEXT NOT NULL,
  description     TEXT,
  status          TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'published')),
  access_tier_id  TEXT REFERENCES membership_tiers(id),
  sequence        INTEGER NOT NULL DEFAULT 0,
  tenant_id       TEXT NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_course_community ON course_modules(community_id, sequence);

CREATE TABLE IF NOT EXISTS course_lessons (
  id              TEXT NOT NULL PRIMARY KEY,
  module_id       TEXT NOT NULL REFERENCES course_modules(id),
  title           TEXT NOT NULL,
  content_type    TEXT NOT NULL DEFAULT 'text'
                  CHECK (content_type IN ('text', 'video', 'audio', 'pdf')),
  content_url     TEXT,             -- R2 CDN URL (for media lessons)
  body            TEXT,             -- Markdown content (for text lessons)
  duration_secs   INTEGER,
  sequence        INTEGER NOT NULL DEFAULT 0,
  is_free_preview INTEGER NOT NULL DEFAULT 0,
  tenant_id       TEXT NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_lesson_module ON course_lessons(module_id, sequence);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id              TEXT NOT NULL PRIMARY KEY,
  lesson_id       TEXT NOT NULL REFERENCES course_lessons(id),
  user_id         TEXT NOT NULL,
  completed_at    INTEGER,
  progress_pct    INTEGER NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  tenant_id       TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_progress_unique ON lesson_progress(lesson_id, user_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON lesson_progress(user_id, tenant_id);
