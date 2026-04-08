-- infra/db/migrations/0033_dm.sql
-- Encryption contract: AES-256-GCM at rest. See docs/social/dm-privacy.md.

CREATE TABLE IF NOT EXISTS dm_threads (
  id              TEXT NOT NULL PRIMARY KEY,
  type            TEXT NOT NULL DEFAULT 'direct'
                  CHECK (type IN ('direct', 'group')),
  participant_ids TEXT NOT NULL,            -- JSON array of social_profiles.id
  last_message_at INTEGER,
  tenant_id       TEXT NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_dm_thread_tenant ON dm_threads(tenant_id);

CREATE TABLE IF NOT EXISTS dm_messages (
  id              TEXT NOT NULL PRIMARY KEY,
  thread_id       TEXT NOT NULL REFERENCES dm_threads(id),
  sender_id       TEXT NOT NULL,            -- social_profiles.id
  content         TEXT NOT NULL,            -- AES-256-GCM encrypted ciphertext
  media_urls      TEXT NOT NULL DEFAULT '[]',   -- Encrypted CDN references (JSON)
  is_deleted      INTEGER NOT NULL DEFAULT 0,
  read_by         TEXT NOT NULL DEFAULT '{}',   -- JSON: { profileId: readAtUnix }
  tenant_id       TEXT NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_dm_thread ON dm_messages(thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dm_sender ON dm_messages(sender_id);
