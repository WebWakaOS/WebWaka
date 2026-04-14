-- SQLite does not support DROP COLUMN on older versions; recreate table to roll back.
-- Rollback drops the extended columns by recreating sessions without them.
DROP INDEX IF EXISTS idx_sessions_jti;

CREATE TABLE IF NOT EXISTS sessions_old (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  tenant_id  TEXT NOT NULL,
  issued_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO sessions_old (id, user_id, tenant_id, issued_at, expires_at, revoked_at)
SELECT id, user_id, tenant_id, issued_at, expires_at, revoked_at FROM sessions;

DROP TABLE sessions;
ALTER TABLE sessions_old RENAME TO sessions;

CREATE INDEX IF NOT EXISTS idx_sessions_user_id   ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_tenant_id ON sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
