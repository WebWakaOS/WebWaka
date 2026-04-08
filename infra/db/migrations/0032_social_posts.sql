-- infra/db/migrations/0032_social_posts.sql

CREATE TABLE IF NOT EXISTS social_posts (
  id              TEXT NOT NULL PRIMARY KEY,
  author_id       TEXT NOT NULL,            -- social_profiles.id
  content         TEXT NOT NULL CHECK (length(content) <= 2000),
  media_urls      TEXT NOT NULL DEFAULT '[]',   -- JSON array of R2 CDN URLs
  post_type       TEXT NOT NULL DEFAULT 'post'
                  CHECK (post_type IN ('post', 'repost', 'quote', 'story')),
  parent_id       TEXT REFERENCES social_posts(id),  -- For reposts/quotes
  group_id        TEXT,                     -- FK → social_groups.id (nullable)
  visibility      TEXT NOT NULL DEFAULT 'public'
                  CHECK (visibility IN ('public', 'followers', 'group', 'private')),
  language        TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'pcm', 'yo', 'ig', 'ha')),
  like_count      INTEGER NOT NULL DEFAULT 0,
  comment_count   INTEGER NOT NULL DEFAULT 0,
  repost_count    INTEGER NOT NULL DEFAULT 0,
  is_flagged      INTEGER NOT NULL DEFAULT 0,
  moderation_status TEXT NOT NULL DEFAULT 'published'
                  CHECK (moderation_status IN ('published', 'under_review', 'removed')),
  is_boosted      INTEGER NOT NULL DEFAULT 0,   -- Paid placement
  expires_at      INTEGER,                  -- For stories (NOW + 86400s)
  tenant_id       TEXT NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_social_post_author ON social_posts(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_post_group ON social_posts(group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_post_visibility ON social_posts(visibility, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_post_tenant ON social_posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_social_post_expires ON social_posts(expires_at) WHERE expires_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS social_groups (
  id              TEXT NOT NULL PRIMARY KEY,
  owner_id        TEXT NOT NULL,            -- social_profiles.id
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  description     TEXT,
  visibility      TEXT NOT NULL DEFAULT 'public'
                  CHECK (visibility IN ('public', 'private', 'secret')),
  member_count    INTEGER NOT NULL DEFAULT 0,
  tenant_id       TEXT NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_group_slug ON social_groups(slug, tenant_id);
CREATE INDEX IF NOT EXISTS idx_group_tenant ON social_groups(tenant_id);

CREATE TABLE IF NOT EXISTS social_group_members (
  id              TEXT NOT NULL PRIMARY KEY,
  group_id        TEXT NOT NULL REFERENCES social_groups(id),
  member_id       TEXT NOT NULL,            -- social_profiles.id
  role            TEXT NOT NULL DEFAULT 'member'
                  CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
  joined_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  tenant_id       TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_group_member_unique ON social_group_members(group_id, member_id);

CREATE TABLE IF NOT EXISTS social_reactions (
  id              TEXT NOT NULL PRIMARY KEY,
  post_id         TEXT NOT NULL REFERENCES social_posts(id),
  reactor_id      TEXT NOT NULL,            -- social_profiles.id
  type            TEXT NOT NULL DEFAULT 'like'
                  CHECK (type IN ('like', 'heart', 'fire', 'celebrate')),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_reaction_unique ON social_reactions(post_id, reactor_id);
CREATE INDEX IF NOT EXISTS idx_reaction_post ON social_reactions(post_id, type);
