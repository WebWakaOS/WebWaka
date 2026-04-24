/**
 * SEC-007: Outbound webhook payload signing.
 *
 * Provides HMAC-SHA256 signing and verification for outbound webhook deliveries
 * so partners can verify that payloads originated from WebWaka.
 *
 * Signature format: `sha256=<lowercase hex>`
 * Header name: `X-WebWaka-Signature`
 */

/**
 * Sign a webhook payload string using a partner-specific secret.
 * Returns the full signature value to use as the X-WebWaka-Signature header.
 */
export async function signWebhookPayload(
  payload: string,
  secret: string,
): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `sha256=${hex}`;
}

/**
 * Verify an incoming X-WebWaka-Signature header value against the expected HMAC.
 * Uses constant-time comparison to prevent timing attacks.
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const expected = await signWebhookPayload(payload, secret);
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}
