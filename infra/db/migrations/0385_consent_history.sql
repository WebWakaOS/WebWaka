-- BUG-023 / COMP-004 / ENH-017: AI consent version persistence.
-- NDPR requires proof that a user consented to the *current* version of the AI terms.
-- consent_version: semver string e.g. "2.0" matching the active consent document.
-- consent_text_hash: sha256 of the full consent text at time of acceptance.
ALTER TABLE users ADD COLUMN consent_version  TEXT;
ALTER TABLE users ADD COLUMN consented_at     INTEGER;

CREATE TABLE IF NOT EXISTS consent_history (
  id                TEXT PRIMARY KEY,
  user_id           TEXT NOT NULL,
  tenant_id         TEXT NOT NULL,
  consent_version   TEXT NOT NULL,
  consent_text_hash TEXT NOT NULL,
  consented_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  ip_address        TEXT,
  user_agent        TEXT
);

CREATE INDEX IF NOT EXISTS idx_consent_history_user    ON consent_history (user_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_consent_history_version ON consent_history (consent_version, consented_at);
