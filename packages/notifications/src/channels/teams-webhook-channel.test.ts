/**
 * teams-webhook-channel.test.ts — N-049 (Phase 4)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeamsWebhookChannel } from './teams-webhook-channel.js';
import type { DispatchContext } from '../types.js';

function makeCtx(overrides: Partial<DispatchContext> = {}): DispatchContext {
  return {
    deliveryId: 'delivery_teams_001',
    tenantId: 'tenant_abc',
    recipientId: 'system',
    recipientType: 'system',
    channel: 'webhook',
    template: {
      subject: 'Alert: Disbursement failure',
      body: '<p>A disbursement to <strong>John</strong> failed with code E501.</p>',
      bodyPlainText: 'A disbursement to John failed with code E501.',
      locale: 'en',
      templateId: 'disbursement.failed',
      templateVersion: 1,
    },
    idempotencyKey: 'idem-teams-001',
    source: 'cron',
    severity: 'critical',
    sandboxMode: false,
    ...overrides,
  };
}

function mockFetch(ok: boolean, responseText = ''): void {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 400,
    text: async () => responseText,
  }));
}

describe('TeamsWebhookChannel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('dispatches Teams message successfully', async () => {
    mockFetch(true, '1');

    const channel = new TeamsWebhookChannel({
      platformWebhookUrl: 'https://prod-85.westeurope.logic.azure.com/workflows/abc',
    });
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBeDefined();
  });

  it('sends AdaptiveCard payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => '1' });
    vi.stubGlobal('fetch', fetchMock);

    const channel = new TeamsWebhookChannel({
      platformWebhookUrl: 'https://teams-webhook-url',
    });
    await channel.dispatch(makeCtx());

    const body = JSON.parse(((fetchMock.mock.calls as Array<[string, RequestInit]>)[0]!)[1].body as string);
    expect(body.type).toBe('message');
    expect(body.attachments[0].contentType).toBe('application/vnd.microsoft.card.adaptive');
    const card = body.attachments[0].content;
    expect(card.type).toBe('AdaptiveCard');
    expect(card.version).toBe('1.3');
  });

  it('includes subject as header TextBlock', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => '1' });
    vi.stubGlobal('fetch', fetchMock);

    const channel = new TeamsWebhookChannel({ platformWebhookUrl: 'https://url' });
    await channel.dispatch(makeCtx());

    const body = JSON.parse(((fetchMock.mock.calls as Array<[string, RequestInit]>)[0]!)[1].body as string);
    const card = body.attachments[0].content;
    const headerBlock = (card.body as Array<{ type: string; text?: string; weight?: string }>)
      .find((b) => b.weight === 'Bolder');
    expect(headerBlock?.text).toBe('Alert: Disbursement failure');
  });

  it('strips HTML from body before sending', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => '1' });
    vi.stubGlobal('fetch', fetchMock);

    const channel = new TeamsWebhookChannel({ platformWebhookUrl: 'https://url' });
    await channel.dispatch(makeCtx());

    const body = JSON.parse(((fetchMock.mock.calls as Array<[string, RequestInit]>)[0]!)[1].body as string);
    const card = body.attachments[0].content;
    const bodyBlock = (card.body as Array<{ type: string; text?: string; weight?: string }>)
      .find((b) => b.type === 'TextBlock' && !b.weight);
    expect(bodyBlock?.text).not.toContain('<p>');
    expect(bodyBlock?.text).toContain('John');
  });

  it('includes CTA action button when ctaUrl and ctaLabel are set', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => '1' });
    vi.stubGlobal('fetch', fetchMock);

    const channel = new TeamsWebhookChannel({ platformWebhookUrl: 'https://url' });
    const ctx = makeCtx({
      template: {
        subject: 'Alert',
        body: 'Body',
        locale: 'en',
        templateId: 'x',
        templateVersion: 1,
        ctaUrl: 'https://app.webwaka.com/alerts',
        ctaLabel: 'View Alert',
      },
    });
    await channel.dispatch(ctx);

    const body = JSON.parse(((fetchMock.mock.calls as Array<[string, RequestInit]>)[0]!)[1].body as string);
    const card = body.attachments[0].content;
    const ctaAction = (card.actions as Array<{ type: string; title: string; url: string }>)[0];
    expect(ctaAction?.type).toBe('Action.OpenUrl');
    expect(ctaAction?.url).toBe('https://app.webwaka.com/alerts');
    expect(ctaAction?.title).toBe('View Alert');
  });

  it('does not include actions block when no CTA', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => '1' });
    vi.stubGlobal('fetch', fetchMock);

    const channel = new TeamsWebhookChannel({ platformWebhookUrl: 'https://url' });
    await channel.dispatch(makeCtx());

    const body = JSON.parse(((fetchMock.mock.calls as Array<[string, RequestInit]>)[0]!)[1].body as string);
    const card = body.attachments[0].content;
    expect(card.actions).toBeUndefined();
  });

  it('G24: sandbox mode skips dispatch', async () => {
    const channel = new TeamsWebhookChannel({ platformWebhookUrl: 'https://url' });
    const result = await channel.dispatch(makeCtx({ sandboxMode: true }));

    expect(result.success).toBe(true);
    expect(result.sandboxRedirect).toBe(true);
    expect(result.providerMessageId).toBe('sandbox-skipped');
  });

  it('returns failure when Teams API returns error', async () => {
    mockFetch(false, 'WebhookNotFound');

    const channel = new TeamsWebhookChannel({ platformWebhookUrl: 'https://url' });
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(false);
    expect(result.lastError).toContain('400');
    expect(result.lastError).toContain('WebhookNotFound');
  });

  it('returns failure when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network unreachable')));

    const channel = new TeamsWebhookChannel({ platformWebhookUrl: 'https://url' });
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(false);
    expect(result.lastError).toContain('network unreachable');
  });

  it('returns dev-skipped when no webhook URL configured', async () => {
    const channel = new TeamsWebhookChannel({});
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBe('dev-skipped');
  });

  it('isEntitled: false for free and standard plans', () => {
    const channel = new TeamsWebhookChannel({});
    expect(channel.isEntitled('free')).toBe(false);
    expect(channel.isEntitled('standard')).toBe(false);
  });

  it('isEntitled: true for business and enterprise plans', () => {
    const channel = new TeamsWebhookChannel({});
    expect(channel.isEntitled('business')).toBe(true);
    expect(channel.isEntitled('enterprise')).toBe(true);
  });
});
