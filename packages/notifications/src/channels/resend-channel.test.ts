/**
 * ResendEmailChannel unit tests (N-025, G3, G24, Phase 2).
 */

import { describe, it, expect, vi } from 'vitest';
import { ResendEmailChannel } from './resend-channel.js';
import type { DispatchContext, RenderedTemplate } from '../types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCtx(overrides: Partial<DispatchContext> = {}): DispatchContext {
  const template: RenderedTemplate = {
    subject: 'Reset your password',
    body: '<p>Click here to reset</p>',
    locale: 'en',
    templateId: 'auth.password_reset',
    templateVersion: 1,
  };

  return {
    deliveryId: 'delivery_email001',
    tenantId: 'tenant_001',
    recipientId: 'usr_001',
    recipientType: 'user',
    channel: 'email',
    template,
    idempotencyKey: 'idem_email001',
    source: 'api',
    severity: 'info',
    sandboxMode: false,
    channelAddress: 'user@test.com',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ResendEmailChannel', () => {
  it('has channel = email and providerName = resend', () => {
    const ch = new ResendEmailChannel(undefined);
    expect(ch.channel).toBe('email');
    expect(ch.providerName).toBe('resend');
  });

  it('is always entitled in Phase 2', () => {
    const ch = new ResendEmailChannel('key');
    expect(ch.isEntitled('free')).toBe(true);
    expect(ch.isEntitled('enterprise')).toBe(true);
  });

  it('returns success=true (dev-skipped) when API key is undefined', async () => {
    const ch = new ResendEmailChannel(undefined);
    const result = await ch.dispatch(makeCtx());
    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBe('dev-skipped');
  });

  it('returns failure when channelAddress is missing and not sandbox', async () => {
    const ch = new ResendEmailChannel('test-api-key');
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'msg_001' }) });
    vi.stubGlobal('fetch', mockFetch);

    // exactOptionalPropertyTypes: build ctx without channelAddress (omit, don't set undefined)
    const ctxNoAddr = makeCtx();
    // Use unknown cast to delete the optional field without TS index-sig error
    delete (ctxNoAddr as unknown as { channelAddress?: string }).channelAddress;
    const result = await ch.dispatch(ctxNoAddr);
    expect(result.success).toBe(false);
    expect(result.lastError).toContain('channelAddress missing');

    vi.unstubAllGlobals();
  });

  it('calls Resend API with correct payload when API key is set', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'resend_msg_123' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const ch = new ResendEmailChannel('test-api-key');
    const result = await ch.dispatch(makeCtx());

    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBe('resend_msg_123');

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    const body = JSON.parse(options.body as string) as Record<string, unknown>;
    expect(body.to).toEqual(['user@test.com']);
    expect(body.subject).toBe('Reset your password');
    expect(body.from).toContain('noreply@webwaka.com');

    vi.unstubAllGlobals();
  });

  it('returns failure when Resend API returns non-ok', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      text: async () => 'Invalid recipient',
    });
    vi.stubGlobal('fetch', mockFetch);

    const ch = new ResendEmailChannel('test-api-key');
    const result = await ch.dispatch(makeCtx());

    expect(result.success).toBe(false);
    expect(result.lastError).toContain('422');

    vi.unstubAllGlobals();
  });

  it('G24: redirects to sandbox address when sandboxMode=true', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'resend_sandbox_001' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const ch = new ResendEmailChannel('test-api-key');
    const ctx = makeCtx({
      sandboxMode: true,
      sandboxRecipient: { email: 'sandbox@test.internal' },
      channelAddress: 'real@prod.com',
    });
    const result = await ch.dispatch(ctx);

    expect(result.success).toBe(true);
    expect(result.sandboxRedirect).toBe(true);
    expect(result.sandboxOriginalRecipientHash).toBeDefined();

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string) as Record<string, unknown>;
    expect(body.to).toEqual(['sandbox@test.internal']);

    vi.unstubAllGlobals();
  });

  it('returns failure when fetch throws a network error', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('network timeout'));
    vi.stubGlobal('fetch', mockFetch);

    const ch = new ResendEmailChannel('test-api-key');
    const result = await ch.dispatch(makeCtx());

    expect(result.success).toBe(false);
    expect(result.lastError).toContain('network timeout');

    vi.unstubAllGlobals();
  });
});
