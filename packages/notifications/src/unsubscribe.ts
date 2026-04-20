/**
 * @webwaka/notifications — Unsubscribe token signing (N-039, Phase 3).
 *
 * Generates and verifies HMAC-SHA256 signed unsubscribe tokens.
 * Tokens are injected into email body as {{unsubscribe_url}} at render time.
 *
 * Token format: base64url(payload).base64url(signature)
 *   payload = JSON { uid, tid, ch, iat }
 *     uid  — user ID (recipient)
 *     tid  — tenant ID (G1: tenant-scoped)
 *     ch   — channel ('email' | 'sms' | 'whatsapp' | 'push')
 *     iat  — issued-at Unix timestamp (seconds)
 *
 * Signature: HMAC-SHA256(payload, UNSUBSCRIBE_HMAC_SECRET)
 *
 * TTL: tokens are valid for 30 days. Verification rejects expired tokens.
 *
 * Web Crypto API (available in Cloudflare Workers and modern browsers).
 * Falls back to node:crypto when running in Node.js (vitest, miniflare).
 *
 * Guardrails:
 *   G1  — tid (tenant_id) in every token; unsubscribe is tenant-scoped
 *   G9  — unsubscribe action written to notification_audit_log by the API handler
 *   List-Unsubscribe header: `List-Unsubscribe: <{{unsubscribe_url}}>` injected by
 *         ResendEmailChannel when it dispatches (N-039).
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UnsubscribeChannel = 'email' | 'sms' | 'whatsapp' | 'push';

export interface UnsubscribePayload {
  uid: string;
  tid: string;
  ch: UnsubscribeChannel;
  iat: number;
}

export interface VerifyResult {
  valid: boolean;
  payload?: UnsubscribePayload | undefined;
  reason?: string | undefined;
}

// ---------------------------------------------------------------------------
// Helpers — base64url
// ---------------------------------------------------------------------------

function encodeBase64url(data: Uint8Array): string {
  // btoa works with binary strings
  const bin = Array.from(data, (b) => String.fromCharCode(b)).join('');
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function decodeBase64url(b64: string): Uint8Array {
  const padded = b64.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (padded.length % 4)) % 4;
  const raw = atob(padded + '='.repeat(pad));
  return new Uint8Array(Array.from(raw, (c) => c.charCodeAt(0)));
}

// ---------------------------------------------------------------------------
// HMAC key derivation
// ---------------------------------------------------------------------------

async function importHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

// ---------------------------------------------------------------------------
// signUnsubscribeToken
// ---------------------------------------------------------------------------

/**
 * Generate a signed unsubscribe token.
 *
 * @param userId   - recipient user ID
 * @param tenantId - tenant ID (G1 isolation)
 * @param channel  - notification channel being unsubscribed
 * @param secret   - HMAC secret (from UNSUBSCRIBE_HMAC_SECRET env var)
 * @returns signed token string: `{payload_b64url}.{sig_b64url}`
 */
export async function signUnsubscribeToken(
  userId: string,
  tenantId: string,
  channel: UnsubscribeChannel,
  secret: string,
): Promise<string> {
  const payload: UnsubscribePayload = {
    uid: userId,
    tid: tenantId,
    ch: channel,
    iat: Math.floor(Date.now() / 1000),
  };

  const enc = new TextEncoder();
  const payloadJson = JSON.stringify(payload);
  const payloadB64 = encodeBase64url(enc.encode(payloadJson));

  const key = await importHmacKey(secret);
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64));
  const sigB64 = encodeBase64url(new Uint8Array(sigBuf));

  return `${payloadB64}.${sigB64}`;
}

// ---------------------------------------------------------------------------
// verifyUnsubscribeToken
// ---------------------------------------------------------------------------

/**
 * Verify an unsubscribe token.
 * Returns the parsed payload if valid; reason string if invalid.
 *
 * @param token  - token produced by signUnsubscribeToken
 * @param secret - HMAC secret (must match signing secret)
 */
export async function verifyUnsubscribeToken(
  token: string,
  secret: string,
): Promise<VerifyResult> {
  const dotIdx = token.lastIndexOf('.');
  if (dotIdx === -1) {
    return { valid: false, reason: 'malformed token — missing dot separator' };
  }

  const payloadB64 = token.slice(0, dotIdx);
  const sigB64 = token.slice(dotIdx + 1);

  // Verify signature
  let key: CryptoKey;
  try {
    key = await importHmacKey(secret);
  } catch {
    return { valid: false, reason: 'key import failed' };
  }

  const enc = new TextEncoder();
  let sigValid = false;
  try {
    const sigBytes = decodeBase64url(sigB64);
    sigValid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(payloadB64));
  } catch {
    return { valid: false, reason: 'signature verification failed' };
  }

  if (!sigValid) {
    return { valid: false, reason: 'invalid signature' };
  }

  // Decode payload
  let payload: UnsubscribePayload;
  try {
    const payloadBytes = decodeBase64url(payloadB64);
    payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as UnsubscribePayload;
  } catch {
    return { valid: false, reason: 'payload decode failed' };
  }

  // Check required fields
  if (!payload.uid || !payload.tid || !payload.ch || typeof payload.iat !== 'number') {
    return { valid: false, reason: 'payload missing required fields' };
  }

  // Check TTL
  const nowSecs = Math.floor(Date.now() / 1000);
  if (nowSecs - payload.iat > TOKEN_TTL_SECONDS) {
    return { valid: false, reason: 'token expired' };
  }

  return { valid: true, payload };
}

// ---------------------------------------------------------------------------
// generateUnsubscribeUrl
// ---------------------------------------------------------------------------

/**
 * Generate a full unsubscribe URL for injection into email templates.
 * The URL format: `{baseUrl}/notifications/unsubscribe?token={token}`
 *
 * @param baseUrl  - tenant base URL or platform API base (HTTPS)
 * @param userId   - recipient user ID
 * @param tenantId - tenant ID
 * @param channel  - channel being unsubscribed from
 * @param secret   - HMAC signing secret
 */
export async function generateUnsubscribeUrl(
  baseUrl: string,
  userId: string,
  tenantId: string,
  channel: UnsubscribeChannel,
  secret: string,
): Promise<string> {
  const token = await signUnsubscribeToken(userId, tenantId, channel, secret);
  const base = baseUrl.replace(/\/$/, '');
  return `${base}/notifications/unsubscribe?token=${encodeURIComponent(token)}`;
}
