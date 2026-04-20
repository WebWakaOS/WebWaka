/**
 * dialog360-whatsapp-channel.test.ts — N-045 (Phase 4)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Dialog360WhatsAppChannel } from './dialog360-whatsapp-channel.js';
import type { DispatchContext } from '../types.js';

function makeCtx(overrides: Partial<DispatchContext> = {}): DispatchContext {
  return {
    deliveryId: 'delivery_d360_001',
    tenantId: 'tenant_abc',
    recipientId: 'user_001',
    recipientType: 'user',
    channel: 'whatsapp',
    template: {
      subject: 'Order shipped',
      body: '<p>Your order #ORD-1234 has been shipped.</p>',
      bodyPlainText: 'Your order #ORD-1234 has been shipped.',
      locale: 'en',
      templateId: 'order.shipped',
      templateVersion: 1,
    },
    idempotencyKey: 'idem-d360-001',
    source: 'queue_consumer',
    severity: 'info',
    sandboxMode: false,
    channelAddress: '+2348012345678',
    ...overrides,
  };
}

function makeDbWithStatus(status: string | null) {
  return {
    prepare: (_sql: string) => ({
      bind: (..._args: unknown[]) => ({
        first: async <T>() => ({ whatsapp_approval_status: status } as unknown as T),
        all: async <T>() => ({ results: [] as T[] }),
        run: async () => ({ success: true, meta: {} }),
      }),
    }),
  };
}

function mockFetch(ok: boolean, responseBody: unknown): void {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 400,
    text: async () => JSON.stringify(responseBody),
  }));
}

describe('Dialog360WhatsAppChannel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('dispatches WhatsApp message successfully', async () => {
    const db = makeDbWithStatus('meta_approved');
    mockFetch(true, { messages: [{ id: 'd360_msg_001' }] });

    const channel = new Dialog360WhatsAppChannel({
      platformApiKey: 'd360_api_key',
      db: db as never,
    });
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBe('d360_msg_001');
  });

  it('sends to correct phone number', async () => {
    const db = makeDbWithStatus('meta_approved');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ messages: [{ id: 'x' }] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const channel = new Dialog360WhatsAppChannel({ platformApiKey: 'key', db: db as never });
    await channel.dispatch(makeCtx({ channelAddress: '+2348099999999' }));

    const body = JSON.parse(((fetchMock.mock.calls as Array<[string, RequestInit]>)[0]!)[1].body as string);
    expect(body.to).toBe('+2348099999999');
  });

  it('sends D360-API-KEY header', async () => {
    const db = makeDbWithStatus('meta_approved');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ messages: [{ id: 'x' }] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const channel = new Dialog360WhatsAppChannel({ platformApiKey: 'my-d360-key', db: db as never });
    await channel.dispatch(makeCtx());

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers['D360-API-KEY']).toBe('my-d360-key');
  });

  it('G17: blocks dispatch when template is pending_meta_approval', async () => {
    const db = makeDbWithStatus('pending_meta_approval');
    const channel = new Dialog360WhatsAppChannel({ platformApiKey: 'key', db: db as never });
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(false);
    expect(result.lastError).toContain('not_meta_approved');
  });

  it('G17: blocks dispatch when template is meta_rejected', async () => {
    const db = makeDbWithStatus('meta_rejected');
    const channel = new Dialog360WhatsAppChannel({ platformApiKey: 'key', db: db as never });
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(false);
    expect(result.lastError).toContain('not_meta_approved');
  });

  it('G24: sandbox mode skips dispatch', async () => {
    const channel = new Dialog360WhatsAppChannel({ platformApiKey: 'key' });
    const result = await channel.dispatch(makeCtx({ sandboxMode: true }));

    expect(result.success).toBe(true);
    expect(result.sandboxRedirect).toBe(true);
    expect(result.providerMessageId).toBe('sandbox-skipped');
  });

  it('returns failure when 360dialog API returns error', async () => {
    const db = makeDbWithStatus('meta_approved');
    mockFetch(false, { errors: [{ message: 'Invalid API key' }] });

    const channel = new Dialog360WhatsAppChannel({ platformApiKey: 'bad', db: db as never });
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(false);
    expect(result.lastError).toContain('360dialog API error');
  });

  it('returns failure when channelAddress is missing', async () => {
    const db = makeDbWithStatus('meta_approved');
    const channel = new Dialog360WhatsAppChannel({ platformApiKey: 'key', db: db as never });
    const result = await channel.dispatch(makeCtx({ channelAddress: undefined } as unknown as Partial<DispatchContext>));

    expect(result.success).toBe(false);
    expect(result.lastError).toContain('channelAddress missing');
  });

  it('returns dev-skipped when no API key configured', async () => {
    const db = makeDbWithStatus('meta_approved');
    const channel = new Dialog360WhatsAppChannel({ db: db as never });
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBe('dev-skipped');
  });

  it('returns failure when fetch throws', async () => {
    const db = makeDbWithStatus('meta_approved');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('DNS timeout')));

    const channel = new Dialog360WhatsAppChannel({ platformApiKey: 'key', db: db as never });
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(false);
    expect(result.lastError).toContain('DNS timeout');
  });

  it('uses custom api_url from metadata when available', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ messages: [{ id: 'x' }] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const dialog360ProviderRow = {
      id: 'prov_001',
      provider_name: 'dialog360',
      credentials_kv_key: null,
      custom_from_email: null,
      custom_from_name: null,
      custom_from_domain_verified: 0,
      platform_sender_fallback: 0,
      metadata: '{"api_url":"https://custom.360dialog.io/v1/messages"}',
      is_platform_default: 0,
      tenant_display_name: null,
    };
    const customDb = {
      prepare: (sql: string) => ({
        bind: (..._args: unknown[]) => {
          if (sql.includes('whatsapp_approval_status')) {
            // G17 template approval check
            return {
              first: async <T>() => ({ whatsapp_approval_status: 'meta_approved' } as unknown as T),
              all: async <T>() => ({ results: [] as unknown as T[] }),
              run: async () => ({ success: true }),
            };
          }
          if (sql.includes('provider_name') && sql.includes('cp.tenant_id')) {
            // Tenant channel_provider lookup (resolveChannelProvider)
            return {
              first: async <T>() => dialog360ProviderRow as unknown as T,
              all: async <T>() => ({ results: [dialog360ProviderRow] as unknown as T[] }),
              run: async () => ({ success: true }),
            };
          }
          // Default: platform fallback — no row
          return {
            first: async <T>() => null as T | null,
            all: async <T>() => ({ results: [] as unknown as T[] }),
            run: async () => ({ success: true }),
          };
        },
      }),
    };

    const channel = new Dialog360WhatsAppChannel({ platformApiKey: 'key', db: customDb as never });
    await channel.dispatch(makeCtx());

    const [url] = fetchMock.mock.calls[0] as [string, unknown];
    expect(url).toBe('https://custom.360dialog.io/v1/messages');
  });

  it('isEntitled: false for free and standard plans', () => {
    const channel = new Dialog360WhatsAppChannel({});
    expect(channel.isEntitled('free')).toBe(false);
    expect(channel.isEntitled('standard')).toBe(false);
  });

  it('isEntitled: true for business and enterprise plans', () => {
    const channel = new Dialog360WhatsAppChannel({});
    expect(channel.isEntitled('business')).toBe(true);
    expect(channel.isEntitled('enterprise')).toBe(true);
  });
});
