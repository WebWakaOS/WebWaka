/**
 * P3-F: External API Contract Tests — Prembly (BVN verification)
 * MED-009 · docs/ops/implementation-plan.md
 *
 * Verifies that the Prembly BVN adapter:
 *   1. Calls the documented Prembly endpoint with correct headers and body
 *   2. Falls back to Paystack BVN on Prembly 5xx
 *   3. Throws IdentityError with the correct error code on API failures
 *   4. Enforces P10: consent must exist before any lookup
 *   5. Validates 11-digit BVN format before making any network call
 *   6. Normalises phone numbers for the phone_match comparison
 *
 * NO live HTTP calls — fetch is stubbed via vi.stubGlobal.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { verifyBVN } from '@webwaka/identity';
import { IdentityError } from '@webwaka/identity';
import type { ConsentRecord, IdentityEnv } from '@webwaka/identity';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const VALID_CONSENT: ConsentRecord = {
  id: 'con_001',
  user_id: 'usr_001',
  tenant_id: 'tnt_001',
  data_type: 'BVN',
  purpose: 'kyc_verification',
  consented_at: Date.now() - 1000,
};

const ENV: IdentityEnv = {
  PREMBLY_API_KEY: 'prembly_key_test',
  PAYSTACK_SECRET_KEY: 'sk_test_paystack',
  LOG_PII_SALT: 'salt_value',
};

function premblySuccess(phoneNumber = '08012345678'): Response {
  return new Response(JSON.stringify({
    status: true,
    detail: 'BVN record found',
    response_code: '00',
    bvn_data: {
      full_name: 'Emeka Okafor',
      phone_number: phoneNumber,
      date_of_birth: '1990-05-15',
      gender: 'Male',
    },
  }), { status: 200 });
}

function premblyNotFound(): Response {
  return new Response(JSON.stringify({
    status: false,
    detail: 'BVN not found',
    response_code: 'BVN_NOT_FOUND',
  }), { status: 200 });
}

function premblyMismatch(): Response {
  return new Response(JSON.stringify({
    status: false,
    detail: 'BVN mismatch',
    response_code: 'MISMATCH',
  }), { status: 200 });
}

function premblyServerError(): Response {
  return new Response('{}', { status: 503 });
}

function paystackBVNSuccess(): Response {
  return new Response(JSON.stringify({
    status: true,
    message: 'BVN resolved',
    data: {
      first_name: 'Emeka',
      last_name: 'Okafor',
      dob: '1990-05-15',
      mobile: '08012345678',
    },
  }), { status: 200 });
}

function paystackBVNFail(): Response {
  return new Response(JSON.stringify({
    status: false,
    message: 'BVN not found',
  }), { status: 200 });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Prembly · verifyBVN — P10 consent enforcement', () => {
  it('throws IdentityError consent_missing when no consent provided', async () => {
    await expect(verifyBVN('12345678901', null as never, '+2348012345678', ENV))
      .rejects.toThrow(IdentityError);

    await expect(verifyBVN('12345678901', null as never, '+2348012345678', ENV))
      .rejects.toMatchObject({ code: 'consent_missing' });
  });

  it('throws IdentityError consent_revoked when consent has revoked_at set', async () => {
    const revoked: ConsentRecord = { ...VALID_CONSENT, revoked_at: Date.now() - 500 };

    await expect(verifyBVN('12345678901', revoked, '+2348012345678', ENV))
      .rejects.toMatchObject({ code: 'consent_revoked' });
  });
});

describe('Prembly · verifyBVN — BVN format validation', () => {
  it('throws IdentityError for BVN with fewer than 11 digits', async () => {
    await expect(verifyBVN('1234567890', VALID_CONSENT, '+2348012345678', ENV))
      .rejects.toMatchObject({ code: 'bvn_not_found' });
  });

  it('throws IdentityError for BVN with more than 11 digits', async () => {
    await expect(verifyBVN('123456789012', VALID_CONSENT, '+2348012345678', ENV))
      .rejects.toMatchObject({ code: 'bvn_not_found' });
  });

  it('throws IdentityError for BVN containing non-digits', async () => {
    await expect(verifyBVN('1234567890A', VALID_CONSENT, '+2348012345678', ENV))
      .rejects.toMatchObject({ code: 'bvn_not_found' });
  });

  it('does NOT call fetch if BVN format is invalid', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    try {
      await verifyBVN('12345', VALID_CONSENT, '+2348012345678', ENV);
    } catch {
      // expected
    }

    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

describe('Prembly · verifyBVN — Prembly primary path', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls Prembly BVN endpoint via POST', async () => {
    fetchSpy.mockResolvedValueOnce(premblySuccess());

    await verifyBVN('12345678901', VALID_CONSENT, '+2348012345678', ENV);

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('prembly.com');
    expect(url).toContain('bvn');
    expect(init.method).toBe('POST');
  });

  it('sends x-api-key header with PREMBLY_API_KEY', async () => {
    fetchSpy.mockResolvedValueOnce(premblySuccess());

    await verifyBVN('12345678901', VALID_CONSENT, '+2348012345678', ENV);

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['x-api-key']).toBe('prembly_key_test');
  });

  it('sends BVN as "number" in request body', async () => {
    fetchSpy.mockResolvedValueOnce(premblySuccess());

    await verifyBVN('12345678901', VALID_CONSENT, '+2348012345678', ENV);

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as { number: string };
    expect(body.number).toBe('12345678901');
  });

  it('returns verified: true with full_name from Prembly', async () => {
    fetchSpy.mockResolvedValueOnce(premblySuccess());

    const result = await verifyBVN('12345678901', VALID_CONSENT, '+2348012345678', ENV);

    expect(result.verified).toBe(true);
    expect(result.full_name).toBe('Emeka Okafor');
    expect(result.provider).toBe('prembly');
  });

  it('returns phone_match: true when phone digits normalise to same value', async () => {
    fetchSpy.mockResolvedValueOnce(premblySuccess('08012345678'));

    const result = await verifyBVN('12345678901', VALID_CONSENT, '08012345678', ENV);

    expect(result.phone_match).toBe(true);
  });

  it('returns phone_match: false when phones differ', async () => {
    fetchSpy.mockResolvedValueOnce(premblySuccess('08012345678'));

    const result = await verifyBVN('12345678901', VALID_CONSENT, '+2348099999999', ENV);

    expect(result.phone_match).toBe(false);
  });

  it('throws IdentityError bvn_not_found for BVN_NOT_FOUND response code', async () => {
    fetchSpy.mockResolvedValueOnce(premblyNotFound());

    await expect(verifyBVN('12345678901', VALID_CONSENT, '+2348012345678', ENV))
      .rejects.toMatchObject({ code: 'bvn_not_found' });
  });

  it('throws IdentityError bvn_mismatch for non-BVN_NOT_FOUND failure codes', async () => {
    fetchSpy.mockResolvedValueOnce(premblyMismatch());

    await expect(verifyBVN('12345678901', VALID_CONSENT, '+2348012345678', ENV))
      .rejects.toMatchObject({ code: 'bvn_mismatch' });
  });
});

describe('Prembly · verifyBVN — Paystack BVN fallback on 5xx', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('falls back to Paystack BVN endpoint when Prembly returns 5xx', async () => {
    fetchSpy
      .mockResolvedValueOnce(premblyServerError())
      .mockResolvedValueOnce(paystackBVNSuccess());

    const result = await verifyBVN('12345678901', VALID_CONSENT, '08012345678', ENV);

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    const [secondUrl] = fetchSpy.mock.calls[1] as [string, RequestInit];
    expect(secondUrl).toContain('paystack.co');
    expect(secondUrl).toContain('resolve_bvn');
    expect(result.provider).toBe('paystack');
    expect(result.verified).toBe(true);
  });

  it('fallback sends Authorization header with PAYSTACK_SECRET_KEY', async () => {
    fetchSpy
      .mockResolvedValueOnce(premblyServerError())
      .mockResolvedValueOnce(paystackBVNSuccess());

    await verifyBVN('12345678901', VALID_CONSENT, '08012345678', ENV);

    const [, fallbackInit] = fetchSpy.mock.calls[1] as [string, RequestInit];
    expect((fallbackInit.headers as Record<string, string>)['Authorization'])
      .toBe('Bearer sk_test_paystack');
  });

  it('fallback concatenates first_name and last_name into full_name', async () => {
    fetchSpy
      .mockResolvedValueOnce(premblyServerError())
      .mockResolvedValueOnce(paystackBVNSuccess());

    const result = await verifyBVN('12345678901', VALID_CONSENT, '08012345678', ENV);

    expect(result.full_name).toBe('Emeka Okafor');
  });

  it('throws IdentityError provider_error if Paystack BVN also fails', async () => {
    fetchSpy
      .mockResolvedValueOnce(premblyServerError())
      .mockResolvedValueOnce(new Response('{}', { status: 500 }));

    await expect(verifyBVN('12345678901', VALID_CONSENT, '08012345678', ENV))
      .rejects.toMatchObject({ code: 'provider_error' });
  });

  it('throws IdentityError bvn_not_found if Paystack BVN returns status: false', async () => {
    fetchSpy
      .mockResolvedValueOnce(premblyServerError())
      .mockResolvedValueOnce(paystackBVNFail());

    await expect(verifyBVN('12345678901', VALID_CONSENT, '08012345678', ENV))
      .rejects.toMatchObject({ code: 'bvn_not_found' });
  });

  it('does NOT fall back for non-5xx Prembly errors (e.g. bvn_not_found)', async () => {
    fetchSpy.mockResolvedValueOnce(premblyNotFound());

    await expect(verifyBVN('12345678901', VALID_CONSENT, '08012345678', ENV))
      .rejects.toMatchObject({ code: 'bvn_not_found' });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
