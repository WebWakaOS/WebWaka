-- infra/db/migrations/0031_social_profiles.sql

CREATE TABLE IF NOT EXISTS social_profiles (
  id              TEXT NOT NULL PRIMARY KEY,
  profile_id      TEXT NOT NULL UNIQUE,     -- FK → profiles.id (M3 scaffold)
  handle          TEXT NOT NULL UNIQUE,     -- @username
  bio             TEXT,
  avatar_url      TEXT,
  follower_count  INTEGER NOT NULL DEFAULT 0,
  following_count INTEGER NOT NULL DEFAULT 0,
  is_verified     INTEGER NOT NULL DEFAULT 0,   -- 0/1 — blue tick: NIN or BVN verified
  visibility      TEXT NOT NULL DEFAULT 'public'
                  CHECK (visibility IN ('public', 'private')),
  tenant_id       TEXT NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_social_handle ON social_profiles(handle);
CREATE INDEX IF NOT EXISTS idx_social_tenant ON social_profiles(tenant_id);

CREATE TABLE IF NOT EXISTS social_follows (
  id              TEXT NOT NULL PRIMARY KEY,
  follower_id     TEXT NOT NULL,            -- social_profiles.id
  followee_id     TEXT NOT NULL,            -- social_profiles.id
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'pending')),
  tenant_id       TEXT NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_follow_unique ON social_follows(follower_id, followee_id);
CREATE INDEX IF NOT EXISTS idx_follow_follower ON social_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follow_followee ON social_follows(followee_id);

CREATE TABLE IF NOT EXISTS social_blocks (
  id              TEXT NOT NULL PRIMARY KEY,
  blocker_id      TEXT NOT NULL,
  blocked_id      TEXT NOT NULL,
  tenant_id       TEXT NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_block_unique ON social_blocks(blocker_id, blocked_id);
