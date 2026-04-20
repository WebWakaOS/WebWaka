/**
 * @webwaka/notifications — Slack incoming webhook channel (N-048, Phase 4).
 *
 * Implements INotificationChannel for the 'slack' channel via Slack Incoming Webhooks.
 *
 * API: POST {webhook_url} (Slack Incoming Webhook)
 * Docs: https://api.slack.com/messaging/webhooks
 *
 * Primary use case: system alert notifications (N-055).
 * Replaces direct ALERT_WEBHOOK_URL HTTP calls in apps/api.
 *
 * Credentials (G16 ADL-002):
 *   { webhook_url: string }  — Slack incoming webhook URL
 *
 * Guardrails:
 *   G16 (ADL-002) — webhook URL from KV or env.ALERT_WEBHOOK_URL fallback
 *   G24 (OQ-012) — sandbox redirect: log and skip actual post
 *   G1  — tenantId in resolveChannelProvider() query
 */

import type { INotificationChannel, DispatchContext, DispatchResult } from '../types.js';
import type { D1LikeFull } from '../db-types.js';
import { resolveChannelProvider } from '../channel-provider-resolver.js';
import { loadCredentials } from '../credential-store.js';
import type { KVLike } from '../credential-store.js';

// ---------------------------------------------------------------------------
// SlackWebhookChannelOptions
// ---------------------------------------------------------------------------

export interface SlackWebhookChannelOptions {
  /**
   * Platform-level Slack webhook URL from env.ALERT_WEBHOOK_URL.
   * Fallback when tenant has no custom Slack webhook configured.
   * N-055: replaces direct ALERT_WEBHOOK_URL calls.
   */
  platformWebhookUrl?: string;
  /** D1 database binding. */
  db?: D1LikeFull;
  /** KV namespace for credentials (G16 ADL-002). */
  kv?: KVLike;
  /** AES-256-GCM master key (base64). */
  masterKey?: string;
}

// ---------------------------------------------------------------------------
// SlackWebhookChannel
// ---------------------------------------------------------------------------

export class SlackWebhookChannel implements INotificationChannel {
  readonly channel = 'slack' as const;
  readonly providerName = 'slack_webhook';

  private readonly platformWebhookUrl: string | undefined;
  private readonly db: D1LikeFull | undefined;
  private readonly kv: KVLike | undefined;
  private readonly masterKey: string | undefined;

  constructor(options: SlackWebhookChannelOptions = {}) {
    this.platformWebhookUrl = options.platformWebhookUrl;
    this.db = options.db;
    this.kv = options.kv;
    this.masterKey = options.masterKey;
  }

  async dispatch(ctx: DispatchContext): Promise<DispatchResult> {
    // G24: sandbox redirect — log and skip
    if (ctx.sandboxMode) {
      console.log(
        `[slack-webhook] sandbox mode — skipping dispatch ` +
        `deliveryId=${ctx.deliveryId} msg="${ctx.template.subject ?? ctx.template.body.slice(0, 60)}"`,
      );
      return {
        success: true,
        providerMessageId: 'sandbox-skipped',
        sandboxRedirect: true,
      };
    }

    const { webhookUrl } = await this.resolveConfig(ctx.tenantId);

    if (!webhookUrl) {
      console.log(
        `[slack-webhook] no webhook URL configured — skipped (dev mode) deliveryId=${ctx.deliveryId}`,
      );
      return { success: true, providerMessageId: 'dev-skipped' };
    }

    // Build Slack Block Kit message
    const title = ctx.template.subject;
    const bodyText = (ctx.template.bodyPlainText ?? ctx.template.body)
      .replace(/<[^>]+>/g, '')
      .trim()
      .slice(0, 3000);

    const blocks: unknown[] = [];

    if (title) {
      blocks.push({
        type: 'header',
        text: { type: 'plain_text', text: title.slice(0, 150), emoji: true },
      });
    }

    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: bodyText },
    });

    if (ctx.template.ctaUrl && ctx.template.ctaLabel) {
      blocks.push({
        type: 'actions',
        elements: [{
          type: 'button',
          text: { type: 'plain_text', text: ctx.template.ctaLabel.slice(0, 75) },
          url: ctx.template.ctaUrl,
        }],
      });
    }

    // Context: severity + delivery ID for ops traceability
    blocks.push({
      type: 'context',
      elements: [{
        type: 'mrkdwn',
        text: `severity: ${ctx.severity} | deliveryId: ${ctx.deliveryId} | tenant: ${ctx.tenantId}`,
      }],
    });

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks }),
      });

      if (res.ok) {
        return { success: true, providerMessageId: `slack-${Date.now()}` };
      }

      const errText = await res.text();
      return {
        success: false,
        lastError: `Slack webhook error ${res.status}: ${errText.slice(0, 500)}`,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'network error';
      return {
        success: false,
        lastError: `Slack fetch failed: ${msg}`,
      };
    }
  }

  /**
   * Slack channel is available on all plans (used for system alerts).
   * G19: Phase 6 may restrict tenant-configured Slack to higher plans.
   */
  isEntitled(_workspacePlan: string): boolean {
    return true;
  }

  private async resolveConfig(tenantId: string): Promise<{
    webhookUrl: string | undefined;
  }> {
    if (!this.db) {
      return { webhookUrl: this.platformWebhookUrl };
    }

    let provider = null;
    try {
      provider = await resolveChannelProvider(this.db, tenantId, 'slack');
    } catch {
      return { webhookUrl: this.platformWebhookUrl };
    }

    if (!provider) {
      return { webhookUrl: this.platformWebhookUrl };
    }

    if (provider.credentialsKvKey && this.kv && this.masterKey) {
      try {
        const creds = await loadCredentials(this.kv, this.masterKey, provider.credentialsKvKey);
        if (creds?.['webhook_url']) {
          return { webhookUrl: creds['webhook_url'] };
        }
      } catch (err) {
        console.warn(
          `[slack-webhook] loadCredentials failed — tenant=${tenantId} ` +
          `err=${err instanceof Error ? err.message : String(err)} ` +
          `— falling back to platform webhook URL`,
        );
      }
    }

    return { webhookUrl: this.platformWebhookUrl };
  }
}
