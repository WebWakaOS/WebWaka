-- Migration 0042: SuperAgent BYOK key store
-- (SA-1.4 — TDR-0009, Platform Invariants P7, P8)
--
-- Stores AES-256-GCM encrypted BYOK keys for users and workspace tenants.
-- Keys are NEVER stored in plaintext. encrypted_key = base64(iv || ciphertext).
-- key_hint = last 4 chars of the original key — safe to display in UI.
--
-- scope:
--   'user'      = user's personal BYOK key (routing level 1)
--   'workspace' = workspace operator's key (routing level 2)
--
-- P8: encrypted_key must NEVER be selected in API responses.
-- T3: All queries must include WHERE tenant_id = ?

CREATE TABLE IF NOT EXISTS superagent_keys (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL,
  scope         TEXT NOT NULL CHECK (scope IN ('user', 'workspace')),
  user_id       TEXT,                   -- NULL for workspace-scoped keys
  provider      TEXT NOT NULL CHECK (
                  provider IN ('openai', 'anthropic', 'google', 'byok_custom')
                ),
  encrypted_key TEXT NOT NULL,          -- AES-256-GCM, base64(iv||ciphertext)
  key_hint      TEXT NOT NULL,          -- last 4 chars — safe to display
  is_active     INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  revoked_at    TEXT                    -- NULL while active
);

-- Efficient lookup for the 5-level routing chain
CREATE INDEX IF NOT EXISTS idx_superagent_keys_tenant_scope
  ON superagent_keys (tenant_id, scope, provider, is_active);

-- User-level key lookup
CREATE INDEX IF NOT EXISTS idx_superagent_keys_user
  ON superagent_keys (tenant_id, user_id, provider, is_active)
  WHERE user_id IS NOT NULL;

-- Enforce one active key per (tenant, scope, user, provider) slot
-- (enforced in application code via upsert — SQLite partial unique index workaround)
CREATE UNIQUE INDEX IF NOT EXISTS idx_superagent_keys_active_slot
  ON superagent_keys (tenant_id, scope, user_id, provider)
  WHERE is_active = 1;
