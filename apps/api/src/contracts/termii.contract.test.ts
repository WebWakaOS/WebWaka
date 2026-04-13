/**
 * P3-F: External API Contract Tests — Termii SMS OTP
 * MED-009 · docs/ops/implementation-plan.md
 *
 * Verifies that the Termii SMS adapter:
 *   1. Calls the documented Termii /api/sms/send endpoint via POST
 *   2. Sends the OTP inside an intelligible SMS message body
 *   3. Routes via the "dnd" channel (best delivery on Nigerian networks)
 *   4. Sends api_key (not an Authorization header) as per Termii spec
 *   5. Returns the OTPSendResult shape with correct fields
 *   6. Throws on non-ok HTTP with the Termii error message
 *   7. Passes expires_at through unchanged
 *
 * NO live HTTP calls — fetch is stubbed via vi.stubGlobal.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendSMSOTP } from '@webwaka/otp';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TERMII_ENDPOINT = 'https://api.ng.termii.com/api/sms/send';

function termiiSuccess(messageId = 'msg_001'): Response {
  return new Response(JSON.stringify({
    message_id: messageId,
    message: 'Successfully Sent',
    balance: 50,
    user: 'waka',
  }), { status: 200 });
}

function termiiError(code = 'INSUFFICIENT_BALANCE', message = 'Insufficient balance'): Response {
  return new Response(JSON.stringify({ code, message }), { status: 402 });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Termii · sendSMSOTP — endpoint and method', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls POST to Termii /api/sms/send', async () => {
    fetchSpy.mockResolvedValueOnce(termiiSuccess());

    await sendSMSOTP('+2348012345678', '123456', 'termii_key', Date.now() + 600_000);

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(TERMII_ENDPOINT);
    expect(init.method).toBe('POST');
  });

  it('sends Content-Type: application/json', async () => {
    fetchSpy.mockResolvedValueOnce(termiiSuccess());

    await sendSMSOTP('+2348012345678', '654321', 'termii_key', Date.now() + 600_000);

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });
});

describe('Termii · sendSMSOTP — request body', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends "to" field with the E.164 phone number', async () => {
    fetchSpy.mockResolvedValueOnce(termiiSuccess());

    await sendSMSOTP('+2348012345678', '111222', 'termii_key', Date.now() + 600_000);

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(body.to).toBe('+2348012345678');
  });

  it('sends the OTP inside the sms message body', async () => {
    fetchSpy.mockResolvedValueOnce(termiiSuccess());

    await sendSMSOTP('+2348012345678', '789012', 'termii_key', Date.now() + 600_000);

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as Record<string, string>;
    expect(body.sms).toContain('789012');
  });

  it('routes via the "dnd" channel for Nigerian network delivery', async () => {
    fetchSpy.mockResolvedValueOnce(termiiSuccess());

    await sendSMSOTP('+2348012345678', '111111', 'termii_key', Date.now() + 600_000);

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as Record<string, string>;
    expect(body.channel).toBe('dnd');
  });

  it('sends api_key in the body (Termii spec — not Authorization header)', async () => {
    fetchSpy.mockResolvedValueOnce(termiiSuccess());

    await sendSMSOTP('+2348012345678', '222333', 'my_termii_api_key', Date.now() + 600_000);

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as Record<string, string>;
    expect(body.api_key).toBe('my_termii_api_key');
    expect((init.headers as Record<string, string>)?.['Authorization']).toBeUndefined();
  });

  it('sets type to "plain"', async () => {
    fetchSpy.mockResolvedValueOnce(termiiSuccess());

    await sendSMSOTP('+2348012345678', '444555', 'termii_key', Date.now() + 600_000);

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as Record<string, string>;
    expect(body.type).toBe('plain');
  });

  it('uses default senderId "WebWaka" when not specified', async () => {
    fetchSpy.mockResolvedValueOnce(termiiSuccess());

    await sendSMSOTP('+2348012345678', '666777', 'termii_key', Date.now() + 600_000);

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as Record<string, string>;
    expect(body.from).toBe('WebWaka');
  });

  it('accepts a custom senderId override', async () => {
    fetchSpy.mockResolvedValueOnce(termiiSuccess());

    await sendSMSOTP('+2348012345678', '888999', 'termii_key', Date.now() + 600_000, 'BRAND_X');

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as Record<string, string>;
    expect(body.from).toBe('BRAND_X');
  });
});

describe('Termii · sendSMSOTP — response mapping', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns sent: true on success', async () => {
    fetchSpy.mockResolvedValueOnce(termiiSuccess('msg_xyz'));

    const result = await sendSMSOTP('+2348012345678', '123456', 'termii_key', Date.now() + 600_000);

    expect(result.sent).toBe(true);
  });

  it('returns channel: "sms"', async () => {
    fetchSpy.mockResolvedValueOnce(termiiSuccess());

    const result = await sendSMSOTP('+2348012345678', '123456', 'termii_key', Date.now() + 600_000);

    expect(result.channel).toBe('sms');
  });

  it('returns message_id from Termii response body', async () => {
    fetchSpy.mockResolvedValueOnce(termiiSuccess('msg_termii_001'));

    const result = await sendSMSOTP('+2348012345678', '123456', 'termii_key', Date.now() + 600_000);

    expect(result.message_id).toBe('msg_termii_001');
  });

  it('passes expires_at through from the caller', async () => {
    fetchSpy.mockResolvedValueOnce(termiiSuccess());
    const expiresAt = Date.now() + 600_000;

    const result = await sendSMSOTP('+2348012345678', '123456', 'termii_key', expiresAt);

    expect(result.expires_at).toBe(expiresAt);
  });

  it('returns fallback_used: false for the primary SMS channel', async () => {
    fetchSpy.mockResolvedValueOnce(termiiSuccess());

    const result = await sendSMSOTP('+2348012345678', '123456', 'termii_key', Date.now() + 600_000);

    expect(result.fallback_used).toBe(false);
  });
});

describe('Termii · sendSMSOTP — error handling', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('throws an Error with Termii error message on non-ok response', async () => {
    fetchSpy.mockResolvedValueOnce(termiiError('INSUFFICIENT_BALANCE', 'Insufficient balance'));

    await expect(sendSMSOTP('+2348012345678', '123456', 'termii_key', Date.now() + 600_000))
      .rejects.toThrow('Insufficient balance');
  });

  it('thrown error message mentions Termii', async () => {
    fetchSpy.mockResolvedValueOnce(termiiError('RATE_LIMIT', 'Rate limit exceeded'));

    await expect(sendSMSOTP('+2348012345678', '123456', 'termii_key', Date.now() + 600_000))
      .rejects.toThrow(/Termii/i);
  });
});
