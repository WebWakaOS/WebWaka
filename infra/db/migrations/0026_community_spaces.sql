-- infra/db/migrations/0026_community_spaces.sql

CREATE TABLE IF NOT EXISTS community_spaces (
  id              TEXT NOT NULL PRIMARY KEY,
  workspace_id    TEXT NOT NULL,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  visibility      TEXT NOT NULL DEFAULT 'public'
                  CHECK (visibility IN ('public', 'private', 'invite_only')),
  tenant_id       TEXT NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_community_workspace ON community_spaces(workspace_id);
CREATE INDEX IF NOT EXISTS idx_community_tenant ON community_spaces(tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_community_slug ON community_spaces(slug, tenant_id);

CREATE TABLE IF NOT EXISTS membership_tiers (
  id              TEXT NOT NULL PRIMARY KEY,
  community_id    TEXT NOT NULL REFERENCES community_spaces(id),
  name            TEXT NOT NULL,
  price_kobo      INTEGER NOT NULL DEFAULT 0 CHECK (price_kobo >= 0),
  billing_cycle   TEXT NOT NULL DEFAULT 'monthly'
                  CHECK (billing_cycle IN ('monthly', 'annual', 'one_time')),
  kyc_tier_min    INTEGER NOT NULL DEFAULT 0 CHECK (kyc_tier_min IN (0, 1, 2, 3)),
  access_channels TEXT NOT NULL DEFAULT '[]',   -- JSON array of channel IDs
  access_courses  TEXT NOT NULL DEFAULT '[]',   -- JSON array of course IDs
  is_default      INTEGER NOT NULL DEFAULT 0,   -- 0/1 — the free/base tier
  tenant_id       TEXT NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_tiers_community ON membership_tiers(community_id);

CREATE TABLE IF NOT EXISTS community_memberships (
  id              TEXT NOT NULL PRIMARY KEY,
  community_id    TEXT NOT NULL REFERENCES community_spaces(id),
  user_id         TEXT NOT NULL,
  tier_id         TEXT NOT NULL REFERENCES membership_tiers(id),
  role            TEXT NOT NULL DEFAULT 'member'
                  CHECK (role IN ('owner', 'admin', 'moderator', 'member', 'guest')),
  kyc_tier        INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'suspended', 'banned', 'expired')),
  joined_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at      INTEGER,
  tenant_id       TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_membership_unique ON community_memberships(community_id, user_id);
CREATE INDEX IF NOT EXISTS idx_membership_community ON community_memberships(community_id, status);
CREATE INDEX IF NOT EXISTS idx_membership_tenant ON community_memberships(tenant_id);
