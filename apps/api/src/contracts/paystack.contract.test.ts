/**
 * P3-F: External API Contract Tests — Paystack
 * MED-009 · docs/ops/implementation-plan.md
 *
 * Verifies that the Paystack adapter:
 *   1. Calls the exact documented Paystack endpoints
 *   2. Sends the required Authorization and Content-Type headers
 *   3. Serialises the request body per the Paystack API spec
 *   4. Maps response fields correctly — amounts always in kobo (P9)
 *   5. Throws PaystackError on API-level failures and non-ok HTTP
 *   6. verifyWebhookSignature uses HMAC-SHA512 (Edge-Runtime crypto only)
 *
 * NO live HTTP calls — fetch is stubbed via vi.stubGlobal.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  initializePayment,
  verifyPayment,
  verifyWebhookSignature,
  PaystackError,
} from '@webwaka/payments';
import type { ProviderConfig, PaymentIntent } from '@webwaka/payments';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeConfig(overrides?: Partial<ProviderConfig>): ProviderConfig {
  return { secretKey: 'sk_test_abc123', baseUrl: 'https://api.paystack.co', ...overrides };
}

function makeIntent(overrides?: Partial<PaymentIntent>): PaymentIntent {
  return {
    workspaceId: 'wsp_001',
    subscriptionId: 'sub_001',
    amountKobo: 500_000,
    email: 'test@example.com',
    currency: 'NGN',
    callbackUrl: 'https://app.webwaka.com/callback',
    ...overrides,
  };
}

function mockOk(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

function mockFail(status: number): Response {
  return new Response('{}', { status });
}

// ---------------------------------------------------------------------------
// initializePayment
// ---------------------------------------------------------------------------

describe('Paystack · initializePayment', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls POST /transaction/initialize', async () => {
    fetchSpy.mockResolvedValueOnce(mockOk({
      status: true,
      message: 'Authorization URL created',
      data: { authorization_url: 'https://pay.example.com', access_code: 'ac_001', reference: 'ref_001' },
    }));

    await initializePayment(makeConfig(), makeIntent());

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.paystack.co/transaction/initialize');
    expect(init.method).toBe('POST');
  });

  it('sends Bearer Authorization header with secretKey', async () => {
    fetchSpy.mockResolvedValueOnce(mockOk({
      status: true,
      message: '',
      data: { authorization_url: 'https://pay.example.com', access_code: 'ac_001', reference: 'ref_001' },
    }));

    await initializePayment(makeConfig({ secretKey: 'sk_live_xyz' }), makeIntent());

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer sk_live_xyz');
  });

  it('sends Content-Type: application/json', async () => {
    fetchSpy.mockResolvedValueOnce(mockOk({
      status: true,
      message: '',
      data: { authorization_url: 'https://pay.example.com', access_code: 'ac_001', reference: 'ref_001' },
    }));

    await initializePayment(makeConfig(), makeIntent());

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('sends amountKobo as integer amount field (P9 invariant)', async () => {
    fetchSpy.mockResolvedValueOnce(mockOk({
      status: true,
      message: '',
      data: { authorization_url: 'https://pay.example.com', access_code: 'ac_001', reference: 'ref_001' },
    }));

    await initializePayment(makeConfig(), makeIntent({ amountKobo: 250_000 }));

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as { amount: number };
    expect(body.amount).toBe(250_000);
    expect(Number.isInteger(body.amount)).toBe(true);
  });

  it('includes workspace_id in metadata', async () => {
    fetchSpy.mockResolvedValueOnce(mockOk({
      status: true,
      message: '',
      data: { authorization_url: 'https://pay.example.com', access_code: 'ac_001', reference: 'ref_001' },
    }));

    await initializePayment(makeConfig(), makeIntent({ workspaceId: 'wsp_99' }));

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as { metadata: { workspace_id: string } };
    expect(body.metadata.workspace_id).toBe('wsp_99');
  });

  it('returns amountKobo from intent unchanged (P9)', async () => {
    fetchSpy.mockResolvedValueOnce(mockOk({
      status: true,
      message: '',
      data: { authorization_url: 'https://pay.example.com', access_code: 'ac_X', reference: 'ref_X' },
    }));

    const result = await initializePayment(makeConfig(), makeIntent({ amountKobo: 100_000 }));

    expect(result.amountKobo).toBe(100_000);
    expect(Number.isInteger(result.amountKobo)).toBe(true);
  });

  it('throws PaystackError on non-ok HTTP response', async () => {
    fetchSpy.mockResolvedValueOnce(mockFail(401));

    const err = await initializePayment(makeConfig(), makeIntent()).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(PaystackError);
    expect((err as PaystackError).message).toMatch(/401/);
  });

  it('throws PaystackError when Paystack returns status: false', async () => {
    fetchSpy.mockResolvedValueOnce(mockOk({ status: false, message: 'Invalid key' }));

    const err = await initializePayment(makeConfig(), makeIntent()).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(PaystackError);
    expect((err as PaystackError).message).toMatch(/Invalid key/);
  });

  it('uses provided baseUrl override', async () => {
    fetchSpy.mockResolvedValueOnce(mockOk({
      status: true,
      message: '',
      data: { authorization_url: 'https://pay.example.com', access_code: 'ac_001', reference: 'ref_001' },
    }));

    await initializePayment(makeConfig({ baseUrl: 'https://sandbox.paystack.co' }), makeIntent());

    const [url] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('sandbox.paystack.co');
  });
});

// ---------------------------------------------------------------------------
// verifyPayment
// ---------------------------------------------------------------------------

describe('Paystack · verifyPayment', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls GET /transaction/verify/:reference', async () => {
    fetchSpy.mockResolvedValueOnce(mockOk({
      status: true,
      message: 'Verification successful',
      data: { reference: 'ref_001', status: 'success', amount: 500_000, currency: 'NGN', paid_at: '2024-01-01T00:00:00.000Z' },
    }));

    await verifyPayment(makeConfig(), 'ref_001');

    const [url] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.paystack.co/transaction/verify/ref_001');
  });

  it('URL-encodes the reference to prevent path traversal', async () => {
    fetchSpy.mockResolvedValueOnce(mockOk({
      status: true,
      message: '',
      data: { reference: 'ref/slashed', status: 'success', amount: 1000, currency: 'NGN', paid_at: null },
    }));

    await verifyPayment(makeConfig(), 'ref/slashed');

    const [url] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('ref%2Fslashed');
  });

  it('maps data.amount → amountKobo (P9 — integer kobo)', async () => {
    fetchSpy.mockResolvedValueOnce(mockOk({
      status: true,
      message: '',
      data: { reference: 'ref_001', status: 'success', amount: 750_000, currency: 'NGN', paid_at: '2024-01-01T00:00:00.000Z' },
    }));

    const result = await verifyPayment(makeConfig(), 'ref_001');

    expect(result.amountKobo).toBe(750_000);
    expect(Number.isInteger(result.amountKobo)).toBe(true);
  });

  it('maps Paystack "success" status → "success"', async () => {
    fetchSpy.mockResolvedValueOnce(mockOk({
      status: true,
      message: '',
      data: { reference: 'ref_001', status: 'success', amount: 1000, currency: 'NGN', paid_at: '2024-01-01T00:00:00.000Z' },
    }));

    const result = await verifyPayment(makeConfig(), 'ref_001');
    expect(result.status).toBe('success');
  });

  it('maps Paystack "failed" status → "failed"', async () => {
    fetchSpy.mockResolvedValueOnce(mockOk({
      status: true,
      message: '',
      data: { reference: 'ref_001', status: 'failed', amount: 1000, currency: 'NGN', paid_at: null },
    }));

    const result = await verifyPayment(makeConfig(), 'ref_001');
    expect(result.status).toBe('failed');
  });

  it('maps any other Paystack status → "abandoned"', async () => {
    fetchSpy.mockResolvedValueOnce(mockOk({
      status: true,
      message: '',
      data: { reference: 'ref_001', status: 'reversed', amount: 1000, currency: 'NGN', paid_at: null },
    }));

    const result = await verifyPayment(makeConfig(), 'ref_001');
    expect(result.status).toBe('abandoned');
  });

  it('throws PaystackError on non-ok HTTP', async () => {
    fetchSpy.mockResolvedValueOnce(mockFail(404));

    await expect(verifyPayment(makeConfig(), 'ref_001')).rejects.toThrow(PaystackError);
  });

  it('throws PaystackError when response status is false', async () => {
    fetchSpy.mockResolvedValueOnce(mockOk({ status: false, message: 'Transaction not found' }));

    const err = await verifyPayment(makeConfig(), 'ref_001').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(PaystackError);
    expect((err as PaystackError).message).toMatch(/Transaction not found/);
  });

  it('sends Bearer Authorization header', async () => {
    fetchSpy.mockResolvedValueOnce(mockOk({
      status: true,
      message: '',
      data: { reference: 'ref_001', status: 'success', amount: 1000, currency: 'NGN', paid_at: null },
    }));

    await verifyPayment(makeConfig({ secretKey: 'sk_prod_def456' }), 'ref_001');

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer sk_prod_def456');
  });
});

// ---------------------------------------------------------------------------
// verifyWebhookSignature
// ---------------------------------------------------------------------------

describe('Paystack · verifyWebhookSignature', () => {
  it('returns true for a correctly computed HMAC-SHA512 signature', async () => {
    const secret = 'webhook_secret_key';
    const payload = JSON.stringify({ event: 'charge.success', data: { reference: 'ref_001' } });

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    const signature = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const result = await verifyWebhookSignature(payload, signature, secret);
    expect(result).toBe(true);
  });

  it('returns false for a tampered payload', async () => {
    const secret = 'webhook_secret_key';
    const payload = '{"event":"charge.success"}';
    const tampered = '{"event":"charge.failed"}';

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    const signature = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const result = await verifyWebhookSignature(tampered, signature, secret);
    expect(result).toBe(false);
  });

  it('returns false for a wrong secret', async () => {
    const payload = '{"event":"charge.success"}';

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode('correct_secret'),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    const signature = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const result = await verifyWebhookSignature(payload, signature, 'wrong_secret');
    expect(result).toBe(false);
  });

  it('returns false for a completely invalid signature string', async () => {
    const result = await verifyWebhookSignature('{}', 'not_a_valid_hex_sig', 'secret');
    expect(result).toBe(false);
  });
});
