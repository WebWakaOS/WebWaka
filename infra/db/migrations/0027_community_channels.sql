-- infra/db/migrations/0027_community_channels.sql

CREATE TABLE IF NOT EXISTS community_channels (
  id              TEXT NOT NULL PRIMARY KEY,
  community_id    TEXT NOT NULL REFERENCES community_spaces(id),
  name            TEXT NOT NULL,
  type            TEXT NOT NULL DEFAULT 'forum'
                  CHECK (type IN ('forum', 'chat', 'announcement')),
  access_tier_id  TEXT REFERENCES membership_tiers(id),  -- NULL = all members
  position        INTEGER NOT NULL DEFAULT 0,
  tenant_id       TEXT NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_channel_community ON community_channels(community_id, position);

CREATE TABLE IF NOT EXISTS channel_posts (
  id              TEXT NOT NULL PRIMARY KEY,
  channel_id      TEXT NOT NULL REFERENCES community_channels(id),
  author_id       TEXT NOT NULL,
  parent_id       TEXT REFERENCES channel_posts(id),     -- Threading (up to 5 levels)
  depth           INTEGER NOT NULL DEFAULT 0 CHECK (depth BETWEEN 0 AND 4),
  title           TEXT,                                   -- Only on root posts (depth=0)
  content         TEXT NOT NULL,
  is_pinned       INTEGER NOT NULL DEFAULT 0,
  is_flagged      INTEGER NOT NULL DEFAULT 0,
  moderation_status TEXT NOT NULL DEFAULT 'published'
                  CHECK (moderation_status IN ('published', 'under_review', 'removed')),
  reply_count     INTEGER NOT NULL DEFAULT 0,
  reaction_count  INTEGER NOT NULL DEFAULT 0,
  tenant_id       TEXT NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_post_channel ON channel_posts(channel_id, is_pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_parent ON channel_posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_post_author ON channel_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_post_tenant ON channel_posts(tenant_id);
