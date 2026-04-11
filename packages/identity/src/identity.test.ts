/**
 * @webwaka/identity — Unit tests (M7a)
 * Target: 25 tests covering consent, BVN, NIN, CAC, FRSC, hashing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { assertConsentExists, hashPII, maskPhone, maskEmail } from './consent.js';
import { validateCACNumber } from './cac.js';
import { IdentityError, type ConsentRecord } from './types.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeConsent(overrides: Partial<ConsentRecord> = {}): ConsentRecord {
  return {
    id: 'consent-1',
    user_id: 'user-abc',
    tenant_id: 'tenant-1',
    data_type: 'BVN',
    purpose: 'kyc_uplift',
    consented_at: Math.floor(Date.now() / 1000) - 60,
    ...overrides,
  };
}

// ─── assertConsentExists ─────────────────────────────────────────────────────

describe('assertConsentExists', () => {
  it('passes when consent is valid', () => {
    const consent = makeConsent();
    expect(() => assertConsentExists(consent, 'BVN')).not.toThrow();
  });

  it('throws consent_missing when consent is null', () => {
    expect(() => assertConsentExists(null, 'BVN'))
      .toThrow(IdentityError);
  });

  it('throws consent_missing when consent is undefined', () => {
    expect(() => assertConsentExists(undefined, 'NIN'))
      .toThrow('consent');
  });

  it('throws consent_revoked when consent has revoked_at', () => {
    const consent = makeConsent({ revoked_at: Math.floor(Date.now() / 1000) - 10 });
    let err: IdentityError | undefined;
    try {
      assertConsentExists(consent, 'NIN');
    } catch (e) {
      err = e as IdentityError;
    }
    expect(err?.code).toBe('consent_revoked');
  });

  it('throws IdentityError with correct code for missing consent', () => {
    let err: IdentityError | undefined;
    try {
      assertConsentExists(null, 'CAC');
    } catch (e) {
      err = e as IdentityError;
    }
    expect(err?.code).toBe('consent_missing');
    expect(err?.name).toBe('IdentityError');
  });
});

// ─── hashPII ─────────────────────────────────────────────────────────────────

describe('hashPII', () => {
  it('returns a 64-char hex string', async () => {
    const hash = await hashPII('test-salt', '12345678901');
    expect(hash).toHaveLength(64);
    expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
  });

  it('returns different hashes for different values', async () => {
    const h1 = await hashPII('salt', 'bvn-a');
    const h2 = await hashPII('salt', 'bvn-b');
    expect(h1).not.toBe(h2);
  });

  it('returns different hashes for different salts', async () => {
    const h1 = await hashPII('salt-1', 'same-value');
    const h2 = await hashPII('salt-2', 'same-value');
    expect(h1).not.toBe(h2);
  });

  it('is deterministic — same salt + value always gives same hash', async () => {
    const h1 = await hashPII('my-salt', 'my-bvn');
    const h2 = await hashPII('my-salt', 'my-bvn');
    expect(h1).toBe(h2);
  });
});

// ─── maskPhone ───────────────────────────────────────────────────────────────

describe('maskPhone', () => {
  it('shows only last 4 digits', () => {
    expect(maskPhone('+2348012345678')).toBe('****5678');
  });

  it('handles short strings gracefully', () => {
    expect(maskPhone('12')).toBe('****');
  });

  it('works with local Nigerian format', () => {
    expect(maskPhone('08023456789')).toBe('****6789');
  });
});

// ─── maskEmail ───────────────────────────────────────────────────────────────

describe('maskEmail', () => {
  it('shows only @domain part', () => {
    expect(maskEmail('user@gmail.com')).toBe('****@gmail.com');
  });

  it('handles missing @ gracefully', () => {
    expect(maskEmail('notanemail')).toBe('****');
  });

  it('handles multi-part domains', () => {
    expect(maskEmail('test@mail.company.ng')).toBe('****@mail.company.ng');
  });
});

// ─── validateCACNumber ────────────────────────────────────────────────────────

describe('validateCACNumber', () => {
  it('accepts standard RC number with prefix', () => {
    expect(validateCACNumber('RC-1234567')).toBe('RC-1234567');
  });

  it('accepts numeric-only RC number and adds RC- prefix', () => {
    expect(validateCACNumber('1234567')).toBe('RC-1234567');
  });

  it('accepts BN-prefixed number', () => {
    expect(validateCACNumber('BN-123456')).toBe('BN-123456');
  });

  it('normalizes lowercase rc to uppercase', () => {
    expect(validateCACNumber('rc-123456')).toBe('RC-123456');
  });

  it('returns null for invalid formats', () => {
    expect(validateCACNumber('INVALID')).toBeNull();
    expect(validateCACNumber('12')).toBeNull();
    expect(validateCACNumber('')).toBeNull();
  });
});

// ─── IdentityError ────────────────────────────────────────────────────────────

describe('IdentityError', () => {
  it('has correct name and code', () => {
    const err = new IdentityError('bvn_not_found', 'BVN not found');
    expect(err.name).toBe('IdentityError');
    expect(err.code).toBe('bvn_not_found');
    expect(err.message).toBe('BVN not found');
  });

  it('is an instance of Error', () => {
    const err = new IdentityError('provider_error', 'test');
    expect(err instanceof Error).toBe(true);
    expect(err instanceof IdentityError).toBe(true);
  });
});

// ─── BVN format validation (unit: no external calls) ─────────────────────────

describe('BVN format checks (consent gate)', () => {
  it('fails consent gate before hitting BVN format check', async () => {
    const { verifyBVN } = await import('./bvn.js');
    await expect(
      verifyBVN('12345678901', null as unknown as ConsentRecord, '08012345678', {
        PREMBLY_API_KEY: 'test-key',
        PAYSTACK_SECRET_KEY: 'test-key',
        LOG_PII_SALT: 'test-salt',
      }),
    ).rejects.toThrow(IdentityError);
  });

  it('rejects BVN shorter than 11 digits even with valid consent', async () => {
    const { verifyBVN } = await import('./bvn.js');
    const consent = makeConsent({ data_type: 'BVN' });
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      verifyBVN('1234', consent, '08012345678', {
        PREMBLY_API_KEY: 'k',
        PAYSTACK_SECRET_KEY: 'k',
        LOG_PII_SALT: 's',
      }),
    ).rejects.toThrow('11 digits');

    vi.unstubAllGlobals();
  });
});

// ─── NIN format validation (unit: no external calls) ─────────────────────────

describe('NIN format checks (consent gate)', () => {
  it('rejects NIN shorter than 11 digits with valid consent', async () => {
    const { verifyNIN } = await import('./nin.js');
    const consent = makeConsent({ data_type: 'NIN' });
    vi.stubGlobal('fetch', vi.fn());

    await expect(
      verifyNIN('123', consent, { PREMBLY_API_KEY: 'key' }),
    ).rejects.toThrow('11 digits');

    vi.unstubAllGlobals();
  });
});
