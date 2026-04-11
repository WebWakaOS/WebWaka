/**
 * @webwaka/negotiation — Price-Lock Token
 *
 * Generates a URL-safe base64-encoded token that locks a negotiated price
 * for checkout. The token carries the session ID, final price in integer kobo,
 * tenant ID, and issue timestamp.
 *
 * P9: final_price_kobo is always an INTEGER. Assertion is made at generation time.
 *
 * SECURITY: When PRICE_LOCK_SECRET is provided the token is HMAC-SHA256 signed
 * using SubtleCrypto (Cloudflare Workers / Web Crypto API).
 * Without a secret the token is unsigned (legacy/test only — do NOT use in prod).
 *
 * Token validity: 24 hours from issued_at.
 */

import type { NegotiationSession, PriceLockPayload } from './types.js';
import { InvalidPriceLockError } from './types.js';

const TOKEN_VALIDITY_SECONDS = 24 * 3600;

async function hmacSign(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function hmacVerify(payload: string, sig: string, secret: string): Promise<boolean> {
  const expected = await hmacSign(payload, secret);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

export async function generatePriceLockToken(session: NegotiationSession, secret?: string): Promise<string> {
  if (session.final_price_kobo === null) {
    throw new Error('Cannot generate price lock token for a non-accepted session');
  }
  if (!Number.isInteger(session.final_price_kobo) || session.final_price_kobo <= 0) {
    throw new Error('final_price_kobo must be a positive integer');
  }

  const payload: PriceLockPayload = {
    session_id: session.id,
    final_price_kobo: session.final_price_kobo,
    tenant_id: session.tenant_id,
    issued_at: Math.floor(Date.now() / 1000),
  };

  const json = JSON.stringify(payload);
  const payloadB64 = btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  if (!secret) return payloadB64;

  const sig = await hmacSign(payloadB64, secret);
  return `${payloadB64}.${sig}`;
}

export async function verifyPriceLockToken(
  token: string,
  tenantId: string,
  secret?: string,
): Promise<{ session_id: string; final_price_kobo: number }> {
  let payloadB64: string;
  let sigPart: string | undefined;

  const dotIdx = token.lastIndexOf('.');
  if (dotIdx !== -1) {
    payloadB64 = token.slice(0, dotIdx);
    sigPart = token.slice(dotIdx + 1);
  } else {
    payloadB64 = token;
  }

  if (secret) {
    if (!sigPart) throw new InvalidPriceLockError('missing signature');
    const valid = await hmacVerify(payloadB64, sigPart, secret);
    if (!valid) throw new InvalidPriceLockError('invalid signature');
  }

  let payload: PriceLockPayload;
  try {
    const padded = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (padded.length % 4)) % 4;
    const json = atob(padded + '='.repeat(padLen));
    payload = JSON.parse(json) as PriceLockPayload;
  } catch {
    throw new InvalidPriceLockError('malformed token');
  }

  if (
    typeof payload.session_id !== 'string' ||
    typeof payload.final_price_kobo !== 'number' ||
    typeof payload.tenant_id !== 'string' ||
    typeof payload.issued_at !== 'number'
  ) {
    throw new InvalidPriceLockError('missing required fields');
  }

  if (payload.tenant_id !== tenantId) {
    throw new InvalidPriceLockError('tenant mismatch');
  }

  const now = Math.floor(Date.now() / 1000);
  if (now - payload.issued_at > TOKEN_VALIDITY_SECONDS) {
    throw new InvalidPriceLockError('token expired');
  }

  if (!Number.isInteger(payload.final_price_kobo) || payload.final_price_kobo <= 0) {
    throw new InvalidPriceLockError('invalid price');
  }

  return {
    session_id: payload.session_id,
    final_price_kobo: payload.final_price_kobo,
  };
}
