/**
 * termii-sms-channel.test.ts — N-043 (Phase 4)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TermiiSmsChannel } from './termii-sms-channel.js';
import type { DispatchContext } from '../types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCtx(overrides: Partial<DispatchContext> = {}): DispatchContext {
  return {
    deliveryId: 'delivery_001',
    tenantId: 'tenant_abc',
    recipientId: 'user_001',
    recipientType: 'user',
    channel: 'sms',
    template: {
      subject: 'Your OTP',
      body: 'Your OTP is 123456. Valid for 5 minutes.',
      locale: 'en',
      templateId: 'otp.send',
      templateVersion: 1,
    },
    idempotencyKey: 'idem-001',
    source: 'queue_consumer',
    severity: 'critical',
    sandboxMode: false,
    channelAddress: '+2348012345678',
    ...overrides,
  };
}

function mockFetch(ok: boolean, responseBody: unknown): void {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 400,
    text: async () => JSON.stringify(responseBody),
  }));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TermiiSmsChannel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('dispatches SMS successfully with platform API key', async () => {
    mockFetch(true, { message_id: 'termii_msg_001' });

    const channel = new TermiiSmsChannel({ platformApiKey: 'termii_key_123' });
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBe('termii_msg_001');
  });

  it('sends to correct phone number', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ message_id: 'x' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const channel = new TermiiSmsChannel({ platformApiKey: 'key' });
    await channel.dispatch(makeCtx({ channelAddress: '+2348099999999' }));

    const body = JSON.parse(((fetchMock.mock.calls as Array<[string, RequestInit]>)[0]!)[1].body as string);
    expect(body.to).toBe('+2348099999999');
  });

  it('includes api_key in POST body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ message_id: 'x' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const channel = new TermiiSmsChannel({ platformApiKey: 'secret_key' });
    await channel.dispatch(makeCtx());

    const body = JSON.parse(((fetchMock.mock.calls as Array<[string, RequestInit]>)[0]!)[1].body as string);
    expect(body.api_key).toBe('secret_key');
  });

  it('uses platformSenderId in POST body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ message_id: 'x' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const channel = new TermiiSmsChannel({
      platformApiKey: 'key',
      platformSenderId: 'MyBrand',
    });
    await channel.dispatch(makeCtx());

    const body = JSON.parse(((fetchMock.mock.calls as Array<[string, RequestInit]>)[0]!)[1].body as string);
    expect(body.from).toBe('MyBrand');
  });

  it('returns failure when Termii API returns error', async () => {
    mockFetch(false, { message: 'Invalid API key' });

    const channel = new TermiiSmsChannel({ platformApiKey: 'bad_key' });
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(false);
    expect(result.lastError).toContain('400');
    expect(result.lastError).toContain('Invalid API key');
  });

  it('returns failure when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network timeout')));

    const channel = new TermiiSmsChannel({ platformApiKey: 'key' });
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(false);
    expect(result.lastError).toContain('network timeout');
  });

  it('returns dev-skipped when no API key configured', async () => {
    const channel = new TermiiSmsChannel({});
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBe('dev-skipped');
  });

  it('G24: redirects to sandbox phone in sandbox mode', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ message_id: 'x' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const channel = new TermiiSmsChannel({ platformApiKey: 'key' });
    const ctx = makeCtx({
      sandboxMode: true,
      sandboxRecipient: { phone: '+2348000000000' },
      channelAddress: '+2348099999999',
    });
    const result = await channel.dispatch(ctx);

    expect(result.sandboxRedirect).toBe(true);
    const body = JSON.parse(((fetchMock.mock.calls as Array<[string, RequestInit]>)[0]!)[1].body as string);
    expect(body.to).toBe('+2348000000000');  // sent to sandbox, NOT real number
  });

  it('G24: sandbox mode without sandbox phone returns sandbox-skipped', async () => {
    const channel = new TermiiSmsChannel({ platformApiKey: 'key' });
    const ctx = makeCtx({
      sandboxMode: true,
      channelAddress: '+2348099999999',
    });
    const result = await channel.dispatch(ctx);

    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBe('sandbox-skipped');
  });

  it('returns failure when channelAddress is missing', async () => {
    const channel = new TermiiSmsChannel({ platformApiKey: 'key' });
    const ctx = makeCtx({ channelAddress: undefined, sandboxMode: false } as unknown as Partial<DispatchContext>);
    const result = await channel.dispatch(ctx);

    expect(result.success).toBe(false);
    expect(result.lastError).toContain('channelAddress missing');
  });

  it('G5: isEntitled always returns true (CBN R8 OTP requirement)', () => {
    const channel = new TermiiSmsChannel({ platformApiKey: 'key' });
    expect(channel.isEntitled('free')).toBe(true);
    expect(channel.isEntitled('business')).toBe(true);
    expect(channel.isEntitled('enterprise')).toBe(true);
  });

  it('strips HTML from SMS body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ message_id: 'x' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const channel = new TermiiSmsChannel({ platformApiKey: 'key' });
    const ctx = makeCtx({
      template: {
        body: '<p>Your <strong>OTP</strong> is <em>123456</em></p>',
        locale: 'en',
        templateId: 'otp',
        templateVersion: 1,
      },
    });
    await channel.dispatch(ctx);

    const body = JSON.parse(((fetchMock.mock.calls as Array<[string, RequestInit]>)[0]!)[1].body as string);
    expect(body.sms).not.toContain('<p>');
    expect(body.sms).toContain('123456');
  });

  it('truncates SMS body to 160 characters', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ message_id: 'x' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const channel = new TermiiSmsChannel({ platformApiKey: 'key' });
    const longBody = 'A'.repeat(500);
    const ctx = makeCtx({ template: { body: longBody, locale: 'en', templateId: 'x', templateVersion: 1 } });
    await channel.dispatch(ctx);

    const body = JSON.parse(((fetchMock.mock.calls as Array<[string, RequestInit]>)[0]!)[1].body as string);
    expect(body.sms.length).toBeLessThanOrEqual(160);
  });
});
