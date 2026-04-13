/**
 * kvGet — P7-E: MED-007 (ARC-17)
 *
 * Safe wrapper for Cloudflare KV reads.  All KV reads in the platform MUST
 * use kvGet instead of bare kv.get() calls to prevent unhandled 500 errors
 * from KV availability hiccups.
 *
 * Behaviour:
 *   1. If KV.get() returns a value → return it
 *   2. If KV.get() returns null → return fallback
 *   3. If KV.get() throws → log the error + return fallback (fail-open)
 *
 * Platform Invariants: ARC-17 (no unhandled 500 from KV), SEC (errors logged)
 */

/**
 * Safely read a JSON value from KV.  Falls back to `fallback` if the key is
 * absent or if the KV namespace is temporarily unavailable.
 *
 * @param kv       The KV namespace binding.
 * @param key      The KV key to read.
 * @param fallback The value to return when the key is absent or on error.
 * @returns        The stored value (typed as T) or the fallback.
 */
export async function kvGet<T>(
  kv: KVNamespace,
  key: string,
  fallback: T,
): Promise<T> {
  try {
    const val = await kv.get<T>(key, { type: 'json' });
    return val ?? fallback;
  } catch (err) {
    console.error(`[kvGet] KV read failed for key "${key}":`, err);
    return fallback;
  }
}

/**
 * Safely read a raw text value from KV.  Falls back to `fallback` if the key
 * is absent or if the KV namespace is temporarily unavailable.
 *
 * @param kv       The KV namespace binding.
 * @param key      The KV key to read.
 * @param fallback The string to return when the key is absent or on error.
 */
export async function kvGetText(
  kv: KVNamespace,
  key: string,
  fallback: string | null = null,
): Promise<string | null> {
  try {
    const val = await kv.get(key);
    return val ?? fallback;
  } catch (err) {
    console.error(`[kvGetText] KV read failed for key "${key}":`, err);
    return fallback;
  }
}
