-- SEC-11: Sessions table for NDPR Article 3.1(9) Right to Erasure compliance.
-- Tracks active JWT sessions so they can be purged when a user exercises erasure rights.
-- Also enables SEC-04 refresh token rotation audit trail.

CREATE TABLE IF NOT EXISTS sessions (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL,
  tenant_id     TEXT NOT NULL,
  issued_at     INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at    INTEGER NOT NULL,
  revoked_at    INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_tenant_id ON sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
