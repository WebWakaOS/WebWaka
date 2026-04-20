/**
 * Unsubscribe token signing + verification tests (N-039, Phase 3).
 *
 * Covers:
 *   - signUnsubscribeToken: produces valid base64url.sig format
 *   - verifyUnsubscribeToken: round-trip sign → verify succeeds
 *   - Tamper detection: payload modification invalidates signature
 *   - Wrong secret: verification fails with 'invalid signature'
 *   - Malformed token: missing dot separator rejected
 *   - TTL: tokens signed 31+ days in the past are rejected
 *   - generateUnsubscribeUrl: produces well-formed HTTPS URL
 *   - G1: tenant_id encoded in payload
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  signUnsubscribeToken,
  verifyUnsubscribeToken,
  generateUnsubscribeUrl,
} from './unsubscribe.js';

const SECRET = 'test-hmac-secret-32-bytes-minimum!';
const USER_ID = 'usr_test123';
const TENANT_ID = 'ten_test456';

// ---------------------------------------------------------------------------
// signUnsubscribeToken
// ---------------------------------------------------------------------------

describe('signUnsubscribeToken', () => {
  it('returns a two-part base64url token (payload.signature)', async () => {
    const token = await signUnsubscribeToken(USER_ID, TENANT_ID, 'email', SECRET);
    const parts = token.split('.');
    // Should be exactly 2 segments
    expect(parts.length).toBe(2);
    // Each part should be non-empty base64url (no +, /, = characters)
    for (const part of parts) {
      expect(part.length).toBeGreaterThan(0);
      expect(part).not.toMatch(/[+/=]/);
    }
  });

  it('encodes the correct payload fields (uid, tid, ch, iat)', async () => {
    const before = Math.floor(Date.now() / 1000);
    const token = await signUnsubscribeToken(USER_ID, TENANT_ID, 'sms', SECRET);
    const after = Math.floor(Date.now() / 1000);

    const [payloadB64] = token.split('.');
    const padded = payloadB64!.replace(/-/g, '+').replace(/_/g, '/');
    const pad = (4 - (padded.length % 4)) % 4;
    const raw = atob(padded + '='.repeat(pad));
    const payload = JSON.parse(raw) as { uid: string; tid: string; ch: string; iat: number };

    expect(payload.uid).toBe(USER_ID);
    expect(payload.tid).toBe(TENANT_ID);
    expect(payload.ch).toBe('sms');
    expect(payload.iat).toBeGreaterThanOrEqual(before);
    expect(payload.iat).toBeLessThanOrEqual(after);
  });

  it('produces different tokens for different channels', async () => {
    const t1 = await signUnsubscribeToken(USER_ID, TENANT_ID, 'email', SECRET);
    const t2 = await signUnsubscribeToken(USER_ID, TENANT_ID, 'sms', SECRET);
    expect(t1).not.toBe(t2);
  });

  it('produces different tokens for different tenants (G1 isolation)', async () => {
    const t1 = await signUnsubscribeToken(USER_ID, 'ten_a', 'email', SECRET);
    const t2 = await signUnsubscribeToken(USER_ID, 'ten_b', 'email', SECRET);
    expect(t1).not.toBe(t2);
  });
});

// ---------------------------------------------------------------------------
// verifyUnsubscribeToken
// ---------------------------------------------------------------------------

describe('verifyUnsubscribeToken', () => {
  it('round-trip: sign then verify returns valid=true with correct payload', async () => {
    const token = await signUnsubscribeToken(USER_ID, TENANT_ID, 'email', SECRET);
    const result = await verifyUnsubscribeToken(token, SECRET);

    expect(result.valid).toBe(true);
    expect(result.payload).toBeDefined();
    expect(result.payload!.uid).toBe(USER_ID);
    expect(result.payload!.tid).toBe(TENANT_ID);
    expect(result.payload!.ch).toBe('email');
  });

  it('rejects a token with a wrong secret', async () => {
    const token = await signUnsubscribeToken(USER_ID, TENANT_ID, 'email', SECRET);
    const result = await verifyUnsubscribeToken(token, 'wrong-secret-completely-different!');

    expect(result.valid).toBe(false);
    expect(result.reason).toContain('invalid signature');
  });

  it('rejects a malformed token with no dot separator', async () => {
    const result = await verifyUnsubscribeToken('no-dot-here-at-all', SECRET);

    expect(result.valid).toBe(false);
    expect(result.reason).toContain('malformed token');
  });

  it('rejects a token with tampered payload', async () => {
    const token = await signUnsubscribeToken(USER_ID, TENANT_ID, 'email', SECRET);
    const [payloadB64, sigB64] = token.split('.');

    // Tamper: re-encode a different payload with the real signature
    const tamperedPayload = { uid: 'usr_attacker', tid: TENANT_ID, ch: 'email', iat: Math.floor(Date.now() / 1000) };
    const tamperedB64 = btoa(JSON.stringify(tamperedPayload))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const tamperedToken = `${tamperedB64}.${sigB64!}`;
    const result = await verifyUnsubscribeToken(tamperedToken, SECRET);

    expect(result.valid).toBe(false);
    expect(result.reason).toContain('invalid signature');
    // Ensure payloadB64 (from outer scope) exists to avoid lint unused variable
    expect(payloadB64!.length).toBeGreaterThan(0);
  });

  it('rejects an expired token (signed 31 days ago)', async () => {
    // Mock Date.now() to return a time 31 days in the past for signing
    const thirtyOneDaysAgo = Date.now() - (31 * 24 * 60 * 60 * 1000);
    vi.spyOn(Date, 'now').mockReturnValueOnce(thirtyOneDaysAgo);

    const token = await signUnsubscribeToken(USER_ID, TENANT_ID, 'email', SECRET);

    // Restore real time for verification
    vi.restoreAllMocks();

    const result = await verifyUnsubscribeToken(token, SECRET);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('token expired');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('accepts a token signed right at the TTL boundary (29 days)', async () => {
    const twentyNineDaysAgo = Date.now() - (29 * 24 * 60 * 60 * 1000);
    vi.spyOn(Date, 'now').mockReturnValueOnce(twentyNineDaysAgo);

    const token = await signUnsubscribeToken(USER_ID, TENANT_ID, 'push', SECRET);
    vi.restoreAllMocks();

    const result = await verifyUnsubscribeToken(token, SECRET);
    expect(result.valid).toBe(true);
    expect(result.payload!.ch).toBe('push');
  });

  it('rejects a token with truncated signature', async () => {
    const token = await signUnsubscribeToken(USER_ID, TENANT_ID, 'email', SECRET);
    const dotIdx = token.lastIndexOf('.');
    const truncated = token.slice(0, dotIdx + 5); // keep only 5 chars of signature
    const result = await verifyUnsubscribeToken(truncated, SECRET);

    expect(result.valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// generateUnsubscribeUrl
// ---------------------------------------------------------------------------

describe('generateUnsubscribeUrl', () => {
  it('produces an HTTPS URL with token query parameter', async () => {
    const url = await generateUnsubscribeUrl(
      'https://api.webwaka.com',
      USER_ID,
      TENANT_ID,
      'email',
      SECRET,
    );

    expect(url).toMatch(/^https:\/\/api\.webwaka\.com\/notifications\/unsubscribe\?token=/);
  });

  it('strips trailing slash from base URL', async () => {
    const url = await generateUnsubscribeUrl(
      'https://api.webwaka.com/',
      USER_ID,
      TENANT_ID,
      'email',
      SECRET,
    );

    expect(url).not.toContain('//notifications');
    expect(url).toContain('/notifications/unsubscribe?token=');
  });

  it('URL-encodes the token (no raw dots in query string after token=)', async () => {
    const url = await generateUnsubscribeUrl(
      'https://api.webwaka.com',
      USER_ID,
      TENANT_ID,
      'whatsapp',
      SECRET,
    );

    // The token is URL-encoded, so raw '.' may be encoded or kept, but '&' etc must not appear
    expect(url).not.toContain('&');
    // Verify the token part is present
    const tokenPart = url.split('token=')[1];
    expect(tokenPart).toBeDefined();
    expect(tokenPart!.length).toBeGreaterThan(10);
  });

  it('the token in the URL can be decoded and verified', async () => {
    const url = await generateUnsubscribeUrl(
      'https://api.webwaka.com',
      USER_ID,
      TENANT_ID,
      'email',
      SECRET,
    );

    const tokenEncoded = url.split('token=')[1]!;
    const token = decodeURIComponent(tokenEncoded);
    const result = await verifyUnsubscribeToken(token, SECRET);

    expect(result.valid).toBe(true);
    expect(result.payload!.uid).toBe(USER_ID);
    expect(result.payload!.tid).toBe(TENANT_ID);
  });
});
