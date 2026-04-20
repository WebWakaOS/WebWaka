/**
 * fcm-push-channel.test.ts — N-047 (Phase 4)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FcmPushChannel } from './fcm-push-channel.js';
import type { DispatchContext } from '../types.js';

function makeCtx(overrides: Partial<DispatchContext> = {}): DispatchContext {
  return {
    deliveryId: 'delivery_push_001',
    tenantId: 'tenant_abc',
    recipientId: 'user_001',
    recipientType: 'user',
    channel: 'push',
    template: {
      subject: 'New Message',
      body: '<p>You have a new message from John.</p>',
      bodyPlainText: 'You have a new message from John.',
      locale: 'en',
      templateId: 'messaging.new_message',
      templateVersion: 1,
    },
    idempotencyKey: 'idem-push-001',
    source: 'queue_consumer',
    severity: 'info',
    sandboxMode: false,
    channelAddress: 'fcm-token-abc123xyz',
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

describe('FcmPushChannel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('dispatches FCM message successfully', async () => {
    mockFetch(true, { name: 'projects/my-project/messages/msg_001' });

    const channel = new FcmPushChannel({
      platformAccessToken: 'ya29.token',
      platformProjectId: 'my-project',
    });
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBe('msg_001');
  });

  it('sends to correct FCM endpoint with project ID', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ name: 'projects/proj/messages/m1' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const channel = new FcmPushChannel({
      platformAccessToken: 'token',
      platformProjectId: 'my-firebase-project',
    });
    await channel.dispatch(makeCtx());

    const [url] = fetchMock.mock.calls[0] as [string, unknown];
    expect(url).toContain('my-firebase-project');
    expect(url).toContain('messages:send');
  });

  it('sends correct push token in request body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ name: 'projects/p/messages/m' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const channel = new FcmPushChannel({
      platformAccessToken: 'token',
      platformProjectId: 'proj',
    });
    await channel.dispatch(makeCtx({ channelAddress: 'fcm-device-token-xyz' }));

    const body = JSON.parse(((fetchMock.mock.calls as Array<[string, RequestInit]>)[0]!)[1].body as string);
    expect(body.message.token).toBe('fcm-device-token-xyz');
  });

  it('includes subject as notification title', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ name: 'projects/p/messages/m' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const channel = new FcmPushChannel({ platformAccessToken: 'token', platformProjectId: 'p' });
    await channel.dispatch(makeCtx());

    const body = JSON.parse(((fetchMock.mock.calls as Array<[string, RequestInit]>)[0]!)[1].body as string);
    expect(body.message.notification.title).toBe('New Message');
  });

  it('G24: sandbox mode skips dispatch', async () => {
    const channel = new FcmPushChannel({ platformAccessToken: 'token', platformProjectId: 'p' });
    const result = await channel.dispatch(makeCtx({ sandboxMode: true }));

    expect(result.success).toBe(true);
    expect(result.sandboxRedirect).toBe(true);
    expect(result.providerMessageId).toBe('sandbox-skipped');
  });

  it('returns failure when FCM API returns error', async () => {
    mockFetch(false, {
      error: { code: 400, message: 'The registration token is not a valid FCM token.', status: 'INVALID_ARGUMENT' },
    });

    const channel = new FcmPushChannel({ platformAccessToken: 'token', platformProjectId: 'p' });
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(false);
    expect(result.lastError).toContain('FCM API error');
    expect(result.lastError).toContain('400');
  });

  it('returns failure when channelAddress (push token) is missing', async () => {
    const channel = new FcmPushChannel({ platformAccessToken: 'token', platformProjectId: 'p' });
    const result = await channel.dispatch(makeCtx({ channelAddress: undefined } as unknown as Partial<DispatchContext>));

    expect(result.success).toBe(false);
    expect(result.lastError).toContain('channelAddress missing');
  });

  it('returns dev-skipped when no credentials configured', async () => {
    const channel = new FcmPushChannel({});
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBe('dev-skipped');
  });

  it('returns failure when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));

    const channel = new FcmPushChannel({ platformAccessToken: 'token', platformProjectId: 'p' });
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(false);
    expect(result.lastError).toContain('ECONNREFUSED');
  });

  it('includes delivery_id and tenant_id in data payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ name: 'projects/p/messages/m' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const channel = new FcmPushChannel({ platformAccessToken: 'token', platformProjectId: 'p' });
    await channel.dispatch(makeCtx());

    const body = JSON.parse(((fetchMock.mock.calls as Array<[string, RequestInit]>)[0]!)[1].body as string);
    expect(body.message.data.delivery_id).toBe('delivery_push_001');
    expect(body.message.data.tenant_id).toBe('tenant_abc');
  });

  it('includes cta_url in data when provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ name: 'projects/p/messages/m' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const channel = new FcmPushChannel({ platformAccessToken: 'token', platformProjectId: 'p' });
    await channel.dispatch(makeCtx({
      template: {
        body: 'Body',
        locale: 'en',
        templateId: 'x',
        templateVersion: 1,
        ctaUrl: 'https://app.webwaka.com/messages/1',
      },
    }));

    const body = JSON.parse(((fetchMock.mock.calls as Array<[string, RequestInit]>)[0]!)[1].body as string);
    expect(body.message.data.cta_url).toBe('https://app.webwaka.com/messages/1');
  });

  it('isEntitled: false for free and standard plans', () => {
    const channel = new FcmPushChannel({});
    expect(channel.isEntitled('free')).toBe(false);
    expect(channel.isEntitled('standard')).toBe(false);
  });

  it('isEntitled: true for business and enterprise plans', () => {
    const channel = new FcmPushChannel({});
    expect(channel.isEntitled('business')).toBe(true);
    expect(channel.isEntitled('enterprise')).toBe(true);
  });
});
