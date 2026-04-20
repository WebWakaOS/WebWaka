/**
 * meta-whatsapp-channel.test.ts — N-044 (Phase 4)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MetaWhatsAppChannel } from './meta-whatsapp-channel.js';
import type { DispatchContext } from '../types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCtx(overrides: Partial<DispatchContext> = {}): DispatchContext {
  return {
    deliveryId: 'delivery_wa_001',
    tenantId: 'tenant_abc',
    recipientId: 'user_001',
    recipientType: 'user',
    channel: 'whatsapp',
    template: {
      subject: 'Welcome',
      body: '<p>Welcome to WebWaka!</p>',
      bodyPlainText: 'Welcome to WebWaka!',
      locale: 'en',
      templateId: 'auth.welcome',
      templateVersion: 1,
    },
    idempotencyKey: 'idem-wa-001',
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
        run: async () => ({ success: true, meta: { changes: 0, duration: 0, rows_written: 0, rows_read: 0, last_row_id: 0, changed_db: false, size_after: 0 } }),
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('MetaWhatsAppChannel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('G17: blocks dispatch when template not meta_approved', async () => {
    const db = makeDbWithStatus('pending_meta_approval');
    const channel = new MetaWhatsAppChannel({
      platformApiKey: 'meta_token',
      platformPhoneNumberId: '12345',
      db: db as never,
    });

    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(false);
    expect(result.lastError).toContain('not_meta_approved');
  });

  it('G17: blocks dispatch when template is meta_rejected', async () => {
    const db = makeDbWithStatus('meta_rejected');
    const channel = new MetaWhatsAppChannel({
      platformApiKey: 'meta_token',
      platformPhoneNumberId: '12345',
      db: db as never,
    });

    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(false);
    expect(result.lastError).toContain('not_meta_approved');
  });

  it('G17: allows dispatch when template is meta_approved', async () => {
    const db = makeDbWithStatus('meta_approved');
    mockFetch(true, { messages: [{ id: 'wamid.abc123' }] });

    const channel = new MetaWhatsAppChannel({
      platformApiKey: 'meta_token',
      platformPhoneNumberId: '12345',
      db: db as never,
    });

    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBe('wamid.abc123');
  });

  it('G17: allows dispatch when no DB provided (assume approved)', async () => {
    mockFetch(true, { messages: [{ id: 'wamid.xyz' }] });

    const channel = new MetaWhatsAppChannel({
      platformApiKey: 'meta_token',
      platformPhoneNumberId: '67890',
    });

    const result = await channel.dispatch(makeCtx());
    expect(result.success).toBe(true);
  });

  it('G24: sandbox mode skips actual dispatch', async () => {
    const channel = new MetaWhatsAppChannel({ platformApiKey: 'token', platformPhoneNumberId: '123' });
    const ctx = makeCtx({ sandboxMode: true });
    const result = await channel.dispatch(ctx);

    expect(result.success).toBe(true);
    expect(result.sandboxRedirect).toBe(true);
    expect(result.providerMessageId).toBe('sandbox-skipped');
  });

  it('returns failure when Meta API returns error', async () => {
    const db = makeDbWithStatus('meta_approved');
    mockFetch(false, { error: { message: 'Invalid token', code: 190 } });

    const channel = new MetaWhatsAppChannel({
      platformApiKey: 'bad_token',
      platformPhoneNumberId: '12345',
      db: db as never,
    });

    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(false);
    expect(result.lastError).toContain('Invalid token');
  });

  it('returns failure when channelAddress is missing', async () => {
    const db = makeDbWithStatus('meta_approved');
    const channel = new MetaWhatsAppChannel({
      platformApiKey: 'token',
      platformPhoneNumberId: '123',
      db: db as never,
    });

    const result = await channel.dispatch(makeCtx({ channelAddress: undefined, sandboxMode: false } as unknown as Partial<DispatchContext>));

    expect(result.success).toBe(false);
    expect(result.lastError).toContain('channelAddress missing');
  });

  it('returns dev-skipped when no API key or phone number ID', async () => {
    const db = makeDbWithStatus('meta_approved');
    const channel = new MetaWhatsAppChannel({ db: db as never });
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBe('dev-skipped');
  });

  it('isEntitled: false for standard plan', () => {
    const channel = new MetaWhatsAppChannel({});
    expect(channel.isEntitled('standard')).toBe(false);
    expect(channel.isEntitled('free')).toBe(false);
  });

  it('isEntitled: true for business and enterprise plans', () => {
    const channel = new MetaWhatsAppChannel({});
    expect(channel.isEntitled('business')).toBe(true);
    expect(channel.isEntitled('enterprise')).toBe(true);
  });

  it('returns failure when fetch throws', async () => {
    const db = makeDbWithStatus('meta_approved');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('DNS failure')));

    const channel = new MetaWhatsAppChannel({
      platformApiKey: 'token',
      platformPhoneNumberId: '123',
      db: db as never,
    });

    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(false);
    expect(result.lastError).toContain('DNS failure');
  });
});
