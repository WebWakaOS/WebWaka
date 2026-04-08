-- infra/db/migrations/0030_moderation_log.sql

CREATE TABLE IF NOT EXISTS moderation_log (
  id              TEXT NOT NULL PRIMARY KEY,
  moderator_id    TEXT NOT NULL,
  content_type    TEXT NOT NULL
                  CHECK (content_type IN ('channel_post', 'social_post', 'dm_message', 'comment')),
  content_id      TEXT NOT NULL,
  action          TEXT NOT NULL
                  CHECK (action IN ('hide', 'restore', 'warn', 'mute', 'ban_temp', 'ban_perm', 'dismiss')),
  reason          TEXT NOT NULL,
  flag_category   TEXT
                  CHECK (flag_category IN ('spam', 'profanity', 'harassment', 'nsfw', 'misinformation', 'illegal')),
  duration_hours  INTEGER,                  -- For temporary bans/mutes
  tenant_id       TEXT NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_modlog_content ON moderation_log(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_modlog_moderator ON moderation_log(moderator_id);
CREATE INDEX IF NOT EXISTS idx_modlog_tenant ON moderation_log(tenant_id);

CREATE TABLE IF NOT EXISTS content_flags (
  id              TEXT NOT NULL PRIMARY KEY,
  reporter_id     TEXT NOT NULL,
  content_type    TEXT NOT NULL
                  CHECK (content_type IN ('channel_post', 'social_post', 'dm_message')),
  content_id      TEXT NOT NULL,
  category        TEXT NOT NULL
                  CHECK (category IN ('spam', 'profanity', 'harassment', 'nsfw', 'misinformation', 'illegal')),
  tenant_id       TEXT NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_flags_content ON content_flags(content_type, content_id);
