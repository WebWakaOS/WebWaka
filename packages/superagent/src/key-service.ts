/**
 * SuperAgent key service — BYOK key management.
 * (SA-1.4 — TDR-0009, Platform Invariants P7, P8)
 *
 * Stores encrypted BYOK keys in D1 (superagent_keys table — migration 0042).
 * Keys are AES-256-GCM encrypted using the platform LOG_PII_SALT-derived key.
 * Keys are NEVER returned in plaintext over the API — only keyHint (last 4).
 *
 * P8: BYOK keys must never be logged or exposed in error messages.
 * T3: All queries are tenant-scoped.
 */

import type { SuperAgentKey, SuperAgentKeyScope, SuperAgentKeyProvider } from './types.js';

export interface KeyServiceDeps {
  db: D1Database;
  /** Raw encryption secret — derive a key from this, never use raw */
  encryptionSecret: string;
}

export interface UpsertKeyInput {
  tenantId: string;
  scope: SuperAgentKeyScope;
  userId: string | null;
  provider: SuperAgentKeyProvider;
  /** The raw API key — encrypted before storage, never persisted in plaintext */
  rawKey: string;
}

export interface ResolveKeyResult {
  rawKey: string;
  scope: SuperAgentKeyScope;
}

// ---------------------------------------------------------------------------
// Key derivation + encryption (Web Crypto — Cloudflare Workers compatible)
// ---------------------------------------------------------------------------

async function deriveEncKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HKDF' },
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: enc.encode('webwaka:superagent:byok-v1'), info: new Uint8Array() },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function encryptKey(rawKey: string, secret: string): Promise<string> {
  const key = await deriveEncKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(rawKey),
  );
  // Encode as base64: iv (12 bytes) | ciphertext
  const combined = new Uint8Array(12 + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), 12);
  return btoa(String.fromCharCode(...combined));
}

async function decryptKey(ciphertext: string, secret: string): Promise<string> {
  const key = await deriveEncKey(secret);
  const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new TextDecoder().decode(plaintext);
}

// ---------------------------------------------------------------------------
// Key service
// ---------------------------------------------------------------------------

export class KeyService {
  private readonly db: D1Database;
  private readonly encryptionSecret: string;

  constructor(deps: KeyServiceDeps) {
    this.db = deps.db;
    this.encryptionSecret = deps.encryptionSecret;
  }

  /**
   * Store or update a BYOK key for a tenant/user.
   * If a key for the same (tenantId, scope, userId, provider) already exists,
   * it is revoked and replaced.
   */
  async upsertKey(input: UpsertKeyInput): Promise<Pick<SuperAgentKey, 'id' | 'keyHint'>> {
    const { tenantId, scope, userId, provider, rawKey } = input;

    // Revoke any existing active key for this slot
    await this.db
      .prepare(
        `UPDATE superagent_keys
         SET revoked_at = datetime('now'), is_active = 0
         WHERE tenant_id = ? AND scope = ? AND provider = ?
           AND (user_id = ? OR (user_id IS NULL AND ? IS NULL))
           AND is_active = 1`,
      )
      .bind(tenantId, scope, provider, userId, userId)
      .run();

    const encryptedKey = await encryptKey(rawKey, this.encryptionSecret);
    const keyHint = rawKey.slice(-4);
    const id = crypto.randomUUID();

    await this.db
      .prepare(
        `INSERT INTO superagent_keys
           (id, tenant_id, scope, user_id, provider, encrypted_key, key_hint, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
      )
      .bind(id, tenantId, scope, userId, provider, encryptedKey, keyHint)
      .run();

    return { id, keyHint };
  }

  /**
   * Resolve the best available BYOK key for a provider.
   * Priority: user key (level 1) → workspace key (level 2) → null.
   */
  async resolveKey(
    tenantId: string,
    provider: SuperAgentKeyProvider,
    userId?: string,
  ): Promise<ResolveKeyResult | null> {
    // Level 1: user key
    if (userId) {
      const userRow = await this.db
        .prepare(
          `SELECT encrypted_key, scope FROM superagent_keys
           WHERE tenant_id = ? AND scope = 'user' AND user_id = ? AND provider = ? AND is_active = 1
           ORDER BY created_at DESC LIMIT 1`,
        )
        .bind(tenantId, userId, provider)
        .first<{ encrypted_key: string; scope: string }>();

      if (userRow) {
        const rawKey = await decryptKey(userRow.encrypted_key, this.encryptionSecret);
        return { rawKey, scope: 'user' };
      }
    }

    // Level 2: workspace key
    const wsRow = await this.db
      .prepare(
        `SELECT encrypted_key, scope FROM superagent_keys
         WHERE tenant_id = ? AND scope = 'workspace' AND provider = ? AND is_active = 1
         ORDER BY created_at DESC LIMIT 1`,
      )
      .bind(tenantId, provider)
      .first<{ encrypted_key: string; scope: string }>();

    if (wsRow) {
      const rawKey = await decryptKey(wsRow.encrypted_key, this.encryptionSecret);
      return { rawKey, scope: 'workspace' };
    }

    return null;
  }

  /**
   * List key hints for a tenant (safe — no plaintext keys returned).
   */
  async listKeys(tenantId: string): Promise<Omit<SuperAgentKey, 'encryptedKey'>[]> {
    const result = await this.db
      .prepare(
        `SELECT id, tenant_id, scope, user_id, provider, key_hint,
                created_at, revoked_at, is_active
         FROM superagent_keys
         WHERE tenant_id = ?
         ORDER BY created_at DESC`,
      )
      .bind(tenantId)
      .all<{
        id: string; tenant_id: string; scope: string; user_id: string | null;
        provider: string; key_hint: string; created_at: string;
        revoked_at: string | null; is_active: number;
      }>();

    return (result.results ?? []).map((r) => ({
      id: r.id,
      tenantId: r.tenant_id,
      scope: r.scope as SuperAgentKeyScope,
      userId: r.user_id,
      provider: r.provider as SuperAgentKeyProvider,
      keyHint: r.key_hint,
      createdAt: r.created_at,
      revokedAt: r.revoked_at,
      isActive: r.is_active === 1,
    }));
  }

  /** Revoke a specific key by ID. T3: must belong to tenantId. */
  async revokeKey(id: string, tenantId: string): Promise<boolean> {
    const result = await this.db
      .prepare(
        `UPDATE superagent_keys
         SET revoked_at = datetime('now'), is_active = 0
         WHERE id = ? AND tenant_id = ? AND is_active = 1`,
      )
      .bind(id, tenantId)
      .run();
    return (result.meta?.changes ?? 0) > 0;
  }
  // ── Wave 3 aliases & additions ───────────────────────────────────────────

  /** Wave 3 alias for upsertKey — matches HTTP route naming */
  async upsert(input: UpsertKeyInput): Promise<{ id: string; keyHint: string; createdAt: string }> {
    const result = await this.upsertKey(input);
    return { id: result.id, keyHint: result.keyHint, createdAt: new Date().toISOString() };
  }

  /** Wave 3 alias for listKeys — returns only active keys */
  async listActive(tenantId: string): Promise<Omit<SuperAgentKey, 'encryptedKey'>[]> {
    const all = await this.listKeys(tenantId);
    return all.filter((k) => k.isActive);
  }

  /** Wave 3 alias for revokeKey */
  async revoke(id: string, tenantId: string): Promise<boolean> {
    return this.revokeKey(id, tenantId);
  }

  /**
   * Wave 3 (A3-7): Rotate a BYOK key — replace encrypted key, update hint.
   * Returns null if the key is not found or belongs to a different tenant.
   * P8: raw key is never stored; encrypted immediately.
   */
  async rotate(id: string, tenantId: string, newRawKey: string): Promise<Omit<SuperAgentKey, 'encryptedKey'> | null> {
    // Verify ownership
    const existing = await this.db
      .prepare('SELECT id, provider, scope, user_id FROM superagent_keys WHERE id = ? AND tenant_id = ? AND is_active = 1')
      .bind(id, tenantId)
      .first<{ id: string; provider: string; scope: string; user_id: string | null }>();

    if (!existing) return null;

    const encryptedKey = await encryptKey(newRawKey, this.encryptionSecret);
    const keyHint = newRawKey.slice(-4);

    await this.db
      .prepare('UPDATE superagent_keys SET encrypted_key = ?, key_hint = ? WHERE id = ? AND tenant_id = ?')
      .bind(encryptedKey, keyHint, id, tenantId)
      .run();

    return {
      id,
      tenantId,
      scope: existing.scope as SuperAgentKeyScope,
      userId: existing.user_id,
      provider: existing.provider as SuperAgentKeyProvider,
      keyHint,
      createdAt: new Date().toISOString(),
      revokedAt: null,
      isActive: true,
    };
  }

}
