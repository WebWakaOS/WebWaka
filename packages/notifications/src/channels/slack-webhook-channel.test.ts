/**
 * slack-webhook-channel.test.ts — N-048 (Phase 4)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SlackWebhookChannel } from './slack-webhook-channel.js';
import type { DispatchContext } from '../types.js';

function makeCtx(overrides: Partial<DispatchContext> = {}): DispatchContext {
  return {
    deliveryId: 'delivery_slack_001',
    tenantId: 'tenant_abc',
    recipientId: 'system',
    recipientType: 'system',
    channel: 'slack',
    template: {
      subject: 'Alert: High bounce rate',
      body: '<p>Bounce rate exceeded 5% threshold.</p>',
      bodyPlainText: 'Bounce rate exceeded 5% threshold.',
      locale: 'en',
      templateId: 'system.alert',
      templateVersion: 1,
    },
    idempotencyKey: 'idem-slack-001',
    source: 'cron',
    severity: 'critical',
    sandboxMode: false,
    ...overrides,
  };
}

function mockFetch(ok: boolean, responseText = 'ok'): void {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 400,
    text: async () => responseText,
  }));
}

describe('SlackWebhookChannel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('dispatches Slack message successfully', async () => {
    mockFetch(true);

    const channel = new SlackWebhookChannel({
      platformWebhookUrl: 'https://hooks.slack.com/services/T/B/X',
    });
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBeDefined();
  });

  it('sends blocks payload with header and body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => 'ok' });
    vi.stubGlobal('fetch', fetchMock);

    const channel = new SlackWebhookChannel({
      platformWebhookUrl: 'https://hooks.slack.com/services/T/B/X',
    });
    await channel.dispatch(makeCtx());

    const body = JSON.parse(((fetchMock.mock.calls as Array<[string, RequestInit]>)[0]!)[1].body as string);
    expect(body.blocks).toBeDefined();
    const headerBlock = (body.blocks as Array<{ type: string; text?: { text: string } }>).find((b) => b.type === 'header');
    expect(headerBlock?.text?.text).toContain('Alert: High bounce rate');
  });

  it('includes CTA action button when ctaUrl and ctaLabel are set', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => 'ok' });
    vi.stubGlobal('fetch', fetchMock);

    const channel = new SlackWebhookChannel({
      platformWebhookUrl: 'https://hooks.slack.com/services/T/B/X',
    });
    const ctx = makeCtx({
      template: {
        subject: 'Alert',
        body: 'Something happened',
        locale: 'en',
        templateId: 'x',
        templateVersion: 1,
        ctaUrl: 'https://app.webwaka.com/alerts',
        ctaLabel: 'View Dashboard',
      },
    });
    await channel.dispatch(ctx);

    const body = JSON.parse(((fetchMock.mock.calls as Array<[string, RequestInit]>)[0]!)[1].body as string);
    const actionsBlock = (body.blocks as Array<{ type: string; elements?: unknown[] }>).find((b) => b.type === 'actions');
    expect(actionsBlock).toBeDefined();
  });

  it('G24: sandbox mode skips actual dispatch', async () => {
    const channel = new SlackWebhookChannel({
      platformWebhookUrl: 'https://hooks.slack.com/services/T/B/X',
    });
    const result = await channel.dispatch(makeCtx({ sandboxMode: true }));

    expect(result.success).toBe(true);
    expect(result.sandboxRedirect).toBe(true);
    expect(result.providerMessageId).toBe('sandbox-skipped');
  });

  it('returns failure when Slack webhook returns error', async () => {
    mockFetch(false, 'invalid_payload');

    const channel = new SlackWebhookChannel({
      platformWebhookUrl: 'https://hooks.slack.com/services/T/B/X',
    });
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(false);
    expect(result.lastError).toContain('400');
    expect(result.lastError).toContain('invalid_payload');
  });

  it('returns failure when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('connection refused')));

    const channel = new SlackWebhookChannel({
      platformWebhookUrl: 'https://hooks.slack.com/services/T/B/X',
    });
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(false);
    expect(result.lastError).toContain('connection refused');
  });

  it('returns dev-skipped when no webhook URL configured', async () => {
    const channel = new SlackWebhookChannel({});
    const result = await channel.dispatch(makeCtx());

    expect(result.success).toBe(true);
    expect(result.providerMessageId).toBe('dev-skipped');
  });

  it('isEntitled: true for all plans (system channel)', () => {
    const channel = new SlackWebhookChannel({});
    expect(channel.isEntitled('free')).toBe(true);
    expect(channel.isEntitled('standard')).toBe(true);
    expect(channel.isEntitled('enterprise')).toBe(true);
  });

  it('strips HTML from body before sending', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => 'ok' });
    vi.stubGlobal('fetch', fetchMock);

    const channel = new SlackWebhookChannel({
      platformWebhookUrl: 'https://hooks.slack.com/services/T/B/X',
    });
    await channel.dispatch(makeCtx({
      template: {
        body: '<strong>Alert:</strong> <em>bounce rate high</em>',
        locale: 'en',
        templateId: 'x',
        templateVersion: 1,
      },
    }));

    const body = JSON.parse(((fetchMock.mock.calls as Array<[string, RequestInit]>)[0]!)[1].body as string);
    const sectionBlock = (body.blocks as Array<{ type: string; text?: { text: string } }>).find((b) => b.type === 'section');
    expect(sectionBlock?.text?.text).not.toContain('<strong>');
    expect(sectionBlock?.text?.text).toContain('bounce rate high');
  });
});
