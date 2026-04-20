/**
 * @webwaka/notifications — Crypto utilities.
 *
 * SHA-256 helpers using the Web Crypto API (crypto.subtle).
 * Compatible with both Cloudflare Workers and Node.js 18+ test environments.
 *
 * Used for:
 *   G7  — idempotency_key: SHA-256(notifEventId + ':' + recipientId + ':' + channel)
 *   G20 — suppression hash: SHA-256(lower(address) + ':' + tenantId + ':' + channel)
 *   G23 — NDPR erasure: hash stored, never raw PII address
 */

/**
 * Compute SHA-256 of a UTF-8 string and return the lowercase hex digest.
 */
export async function sha256hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compute the idempotency key for a delivery row (G7).
 * Format: SHA-256( notifEventId + ':' + recipientId + ':' + channel )
 */
export async function computeIdempotencyKey(
  notifEventId: string,
  recipientId: string,
  channel: string,
): Promise<string> {
  return sha256hex(`${notifEventId}:${recipientId}:${channel}`);
}

/**
 * Compute the suppression address hash (G20, G23 NDPR).
 * Format: SHA-256( lower(address) + ':' + tenantId + ':' + channel )
 * tenantId uses 'platform' for platform-wide suppression rows.
 */
export async function computeSuppressionHash(
  address: string,
  tenantId: string,
  channel: string,
): Promise<string> {
  return sha256hex(`${address.toLowerCase()}:${tenantId}:${channel}`);
}
