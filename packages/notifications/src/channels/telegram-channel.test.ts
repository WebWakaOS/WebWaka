/**
 * telegram-channel.test.ts — N-046 (Phase 4)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TelegramChannel } from './telegram-channel.js';
import type { DispatchContext } from '../types.js';

function makeCtx(overrides: Partial<DispatchContext> = {}): DispatchContext {
  return {
    deliveryId: 'delivery_tg_001',
    tenantId: 'tenant_abc',
    recipientId: 'user_001',
    recipientType: 'user',
    channel: 'telegram',
    template: {
      subject: 'Payment received',
      body: '<p>Your payment of ₦5,000 was received.</p>',
      bodyPlainText: 'Your payment of ₦5,000 was received.',
      locale: 'en',
      templateId: 'payment.received',
      templateVersion: 1,
    },
    idempotencyKey: 'idem-tg-001',
    source: 'queue_consumer',
    severity: 'info',
    sandboxMode: false,
    channelAddress: '123456789',
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

describe('TelegramChannel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('dispatches message successfully with platform bot token', async () => {
    mockFetch(true, { ok: true, result: { message_id: 42 } });

    const channel = new TelegramChannel({ platformBotToken: 'bot123:TOKEN' });
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBe('42');
  });

  it('sends to correct chat_id', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ ok: true, result: { message_id: 1 } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const channel = new TelegramChannel({ platformBotToken: 'botTOKEN' });
    await channel.dispatch(makeCtx({ channelAddress: '-100987654321' }));

    const body = JSON.parse(((fetchMock.mock.calls as Array<[string, RequestInit]>)[0]!)[1].body as string);
    expect(body.chat_id).toBe('-100987654321');
  });

  it('includes subject as bold header in message', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ ok: true, result: { message_id: 1 } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const channel = new TelegramChannel({ platformBotToken: 'botTOKEN' });
    await channel.dispatch(makeCtx());

    const body = JSON.parse(((fetchMock.mock.calls as Array<[string, RequestInit]>)[0]!)[1].body as string);
    expect(body.text).toContain('*Payment received*');
    expect(body.text).toContain('₦5,000');
  });

  it('G24: sandbox mode skips dispatch', async () => {
    const channel = new TelegramChannel({ platformBotToken: 'botTOKEN' });
    const result = await channel.dispatch(makeCtx({ sandboxMode: true }));

    expect(result.success).toBe(true);
    expect(result.sandboxRedirect).toBe(true);
    expect(result.providerMessageId).toBe('sandbox-skipped');
  });

  it('returns failure when Telegram API returns error', async () => {
    mockFetch(false, { ok: false, description: 'Bad Request: chat not found' });

    const channel = new TelegramChannel({ platformBotToken: 'botTOKEN' });
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(false);
    expect(result.lastError).toContain('chat not found');
  });

  it('returns failure when channelAddress (chat_id) is missing', async () => {
    const channel = new TelegramChannel({ platformBotToken: 'botTOKEN' });
    const result = await channel.dispatch(makeCtx({ channelAddress: undefined } as unknown as Partial<DispatchContext>));

    expect(result.success).toBe(false);
    expect(result.lastError).toContain('channelAddress missing');
  });

  it('returns dev-skipped when no bot token configured', async () => {
    const channel = new TelegramChannel({});
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBe('dev-skipped');
  });

  it('returns failure when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')));

    const channel = new TelegramChannel({ platformBotToken: 'botTOKEN' });
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(false);
    expect(result.lastError).toContain('timeout');
  });

  it('isEntitled: true for business and enterprise only', () => {
    const channel = new TelegramChannel({});
    expect(channel.isEntitled('free')).toBe(false);
    expect(channel.isEntitled('standard')).toBe(false);
    expect(channel.isEntitled('business')).toBe(true);
    expect(channel.isEntitled('enterprise')).toBe(true);
  });
});
