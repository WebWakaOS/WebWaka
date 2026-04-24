-- BUG-004 / SEC-002: Opaque refresh token rotation
-- Replaces stateless JWT-to-JWT refresh with single-use opaque tokens.
-- Tokens are stored as SHA-256 hashes (jti_hash). The raw token is returned
-- to the client only at issuance time and is never persisted.
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id               TEXT PRIMARY KEY,          -- server-assigned UUID (not the opaque value)
  jti_hash         TEXT NOT NULL UNIQUE,      -- SHA-256 hex of the raw opaque token value
  user_id          TEXT NOT NULL,
  tenant_id        TEXT NOT NULL,
  workspace_id     TEXT,
  role             TEXT NOT NULL DEFAULT 'member',
  created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at       INTEGER NOT NULL,          -- unixepoch() + 2592000 (30 days)
  revoked_at       INTEGER,                   -- NULL = still valid
  replaced_by      TEXT                       -- ID of successor token (rotation chain)
);

CREATE INDEX IF NOT EXISTS idx_rt_user ON refresh_tokens(user_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_rt_jti  ON refresh_tokens(jti_hash);
CREATE INDEX IF NOT EXISTS idx_rt_expires ON refresh_tokens(expires_at);
