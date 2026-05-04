/**
 * AI Key Pool — Multi-key support for AI providers (BATCH 3)
 *
 * Manages a pool of encrypted API keys with LRU selection and rate-limit tracking.
 * Keys are stored encrypted in D1 (AES-256-GCM). This module inlines the minimal
 * decryption helper to avoid cross-package rootDir violations.
 *
 * P8 invariant: API keys are stored encrypted in D1. Keys are decrypted only at
 * selection time and MUST NOT be logged.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SelectedKey {
  id: string;
  label: string;
  apiKey: string; // Decrypted — NEVER log this (P8)
}

export interface D1LikeForPool {
  prepare(query: string): {
    bind(...args: unknown[]): {
      first<T = unknown>(): Promise<T | null>;
      all<T = unknown>(): Promise<{ results: T[] }>;
      run(): Promise<{ success: boolean }>;
    };
  };
}

// ---------------------------------------------------------------------------
// AES-256-GCM decrypt helper (inlined to avoid cross-package rootDir violation)
// Matches the encryption in packages/provider-registry/src/crypto.ts
// ---------------------------------------------------------------------------

async function decryptApiKey(
  encrypted: string,
  ivBase64: string,
  encryptionSecret: string,
): Promise<string | null> {
  try {
    const rawBytes = new TextEncoder().encode(encryptionSecret);
    const keyBytes = new Uint8Array(32);
    keyBytes.set(rawBytes.slice(0, 32));
    const key = await crypto.subtle.importKey(
      'raw', keyBytes, { name: 'AES-GCM' }, false, ['decrypt'],
    );
    const cipherBytes = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
    const plainBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherBytes);
    const creds = JSON.parse(new TextDecoder().decode(plainBuffer)) as Record<string, string>;
    return creds['api_key'] ?? null;
  } catch {
    return null; // Decryption failure — skip this key
  }
}

// ---------------------------------------------------------------------------
// KV key helpers
// ---------------------------------------------------------------------------

const kvRateLimitKey = (keyId: string): string => `ai_key_rl:${keyId}`;

// ---------------------------------------------------------------------------
// Key Pool Operations
// ---------------------------------------------------------------------------

/**
 * Select the least-recently-used active API key for a provider.
 * Skips keys that are currently rate-limited.
 * Returns null if no active key is available.
 */
export async function selectKeyFromPool(
  db: D1LikeForPool,
  providerId: string,
  encryptionSecret: string,
  kv?: KVNamespace,
): Promise<SelectedKey | null> {
  const now = Math.floor(Date.now() / 1000);

  const result = await db
    .prepare(
      `SELECT id, key_label, key_encrypted, key_iv, status, rate_limited_until, last_used_at
       FROM ai_provider_keys
       WHERE provider_id = ? AND status = 'active'
       ORDER BY last_used_at ASC NULLS FIRST`,
    )
    .bind(providerId)
    .all<{ id: string; key_label: string; key_encrypted: string; key_iv: string; status: string; rate_limited_until: number | null; last_used_at: number | null }>();

  if (result.results.length === 0) return null;

  for (const key of result.results) {
    // Fast KV rate-limit check
    if (kv) {
      const rlInKv = await kv.get(kvRateLimitKey(key.id)).catch(() => null);
      if (rlInKv) continue;
    }
    // D1 rate-limit check
    if (key.rate_limited_until && key.rate_limited_until > now) continue;

    const apiKey = await decryptApiKey(key.key_encrypted, key.key_iv, encryptionSecret);
    if (!apiKey) continue;

    return { id: key.id, label: key.key_label, apiKey };
  }

  return null;
}

/**
 * Mark a key as rate-limited after receiving a 429 response.
 */
export async function markKeyRateLimited(
  db: D1LikeForPool,
  keyId: string,
  rateLimitDurationSecs = 60,
  kv?: KVNamespace,
): Promise<void> {
  const until = Math.floor(Date.now() / 1000) + rateLimitDurationSecs;
  await db
    .prepare(
      `UPDATE ai_provider_keys
       SET status = 'rate_limited', rate_limited_until = ?, failed_requests = failed_requests + 1,
           updated_at = unixepoch()
       WHERE id = ?`,
    )
    .bind(until, keyId)
    .run();
  if (kv) {
    await kv
      .put(kvRateLimitKey(keyId), String(until), { expirationTtl: rateLimitDurationSecs })
      .catch(() => { /* non-blocking */ });
  }
}

/** Record a successful key use. */
export async function recordKeySuccess(db: D1LikeForPool, keyId: string): Promise<void> {
  await db
    .prepare(
      `UPDATE ai_provider_keys
       SET successful_requests = successful_requests + 1,
           total_requests = total_requests + 1,
           last_used_at = unixepoch(),
           updated_at = unixepoch()
       WHERE id = ?`,
    )
    .bind(keyId)
    .run();
}

/** Record a non-rate-limit failure. */
export async function recordKeyFailure(db: D1LikeForPool, keyId: string): Promise<void> {
  await db
    .prepare(
      `UPDATE ai_provider_keys
       SET failed_requests = failed_requests + 1,
           total_requests = total_requests + 1,
           updated_at = unixepoch()
       WHERE id = ?`,
    )
    .bind(keyId)
    .run();
}

/** Re-activate keys whose rate_limited_until has expired. */
export async function clearExpiredRateLimits(db: D1LikeForPool): Promise<void> {
  await db
    .prepare(
      `UPDATE ai_provider_keys
       SET status = 'active', rate_limited_until = NULL, updated_at = unixepoch()
       WHERE status = 'rate_limited' AND rate_limited_until < unixepoch()`,
    )
    .bind()
    .run();
}

/** Get pool health summary for admin dashboard. */
export async function getPoolHealth(
  db: D1LikeForPool,
  providerId: string,
): Promise<{ total: number; active: number; rateLimited: number; disabled: number }> {
  const result = await db
    .prepare(
      `SELECT status, COUNT(*) as count FROM ai_provider_keys WHERE provider_id = ? GROUP BY status`,
    )
    .bind(providerId)
    .all<{ status: string; count: number }>();

  const counts = { total: 0, active: 0, rateLimited: 0, disabled: 0 };
  for (const row of result.results) {
    counts.total += row.count;
    if (row.status === 'active') counts.active += row.count;
    if (row.status === 'rate_limited') counts.rateLimited += row.count;
    if (row.status === 'disabled') counts.disabled += row.count;
  }
  return counts;
}
