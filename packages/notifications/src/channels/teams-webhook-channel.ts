/**
 * @webwaka/notifications — Microsoft Teams incoming webhook channel (N-049, Phase 4).
 *
 * Implements INotificationChannel for the 'webhook' channel type with Teams provider.
 * Uses Microsoft Teams Incoming Webhook (Adaptive Card payload).
 *
 * API: POST {webhook_url} (Teams Incoming Webhook)
 * Docs: https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook
 *
 * Credentials (G16 ADL-002):
 *   { webhook_url: string }  — Teams incoming webhook URL
 *
 * Guardrails:
 *   G16 (ADL-002) — webhook URL from KV only
 *   G24 (OQ-012) — sandbox redirect: skip actual post
 *   G1  — tenantId in resolveChannelProvider() query
 *
 * Note: Teams channel uses channel='webhook' with providerName='teams_webhook'.
 * This allows it to coexist with other webhook-type channels in the system.
 */

import type { INotificationChannel, DispatchContext, DispatchResult } from '../types.js';
import type { D1LikeFull } from '../db-types.js';
import { resolveChannelProvider } from '../channel-provider-resolver.js';
import { loadCredentials } from '../credential-store.js';
import type { KVLike } from '../credential-store.js';

// ---------------------------------------------------------------------------
// TeamsWebhookChannelOptions
// ---------------------------------------------------------------------------

export interface TeamsWebhookChannelOptions {
  /** Platform-level Teams webhook URL (fallback). */
  platformWebhookUrl?: string;
  /** D1 database binding. */
  db?: D1LikeFull;
  /** KV namespace for credentials (G16 ADL-002). */
  kv?: KVLike;
  /** AES-256-GCM master key (base64). */
  masterKey?: string;
}

// ---------------------------------------------------------------------------
// TeamsWebhookChannel
// ---------------------------------------------------------------------------

export class TeamsWebhookChannel implements INotificationChannel {
  readonly channel = 'webhook' as const;
  readonly providerName = 'teams_webhook';

  private readonly platformWebhookUrl: string | undefined;
  private readonly db: D1LikeFull | undefined;
  private readonly kv: KVLike | undefined;
  private readonly masterKey: string | undefined;

  constructor(options: TeamsWebhookChannelOptions = {}) {
    this.platformWebhookUrl = options.platformWebhookUrl;
    this.db = options.db;
    this.kv = options.kv;
    this.masterKey = options.masterKey;
  }

  async dispatch(ctx: DispatchContext): Promise<DispatchResult> {
    // G24: sandbox redirect — skip
    if (ctx.sandboxMode) {
      console.log(
        `[teams-webhook] sandbox mode — skipping dispatch deliveryId=${ctx.deliveryId}`,
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
        `[teams-webhook] no webhook URL configured — skipped (dev mode) deliveryId=${ctx.deliveryId}`,
      );
      return { success: true, providerMessageId: 'dev-skipped' };
    }

    const title = ctx.template.subject ?? 'Notification';
    const bodyText = (ctx.template.bodyPlainText ?? ctx.template.body)
      .replace(/<[^>]+>/g, '')
      .trim()
      .slice(0, 28000);  // Teams message body limit ~28KB

    // Adaptive Card payload for Teams
    const adaptiveCard: {
      type: string;
      version: string;
      body: unknown[];
      actions?: unknown[];
    } = {
      type: 'AdaptiveCard',
      version: '1.3',
      body: [
        {
          type: 'TextBlock',
          size: 'Medium',
          weight: 'Bolder',
          text: title.slice(0, 150),
          wrap: true,
        },
        {
          type: 'TextBlock',
          text: bodyText,
          wrap: true,
          color: 'Default',
        },
        {
          type: 'TextBlock',
          text: `severity: ${ctx.severity} | tenant: ${ctx.tenantId}`,
          wrap: true,
          size: 'Small',
          color: 'Accent',
        },
      ],
    };

    if (ctx.template.ctaUrl && ctx.template.ctaLabel) {
      adaptiveCard.actions = [
        {
          type: 'Action.OpenUrl',
          title: ctx.template.ctaLabel.slice(0, 75),
          url: ctx.template.ctaUrl,
        },
      ];
    }

    const teamsPayload = {
      type: 'message',
      attachments: [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        contentUrl: null,
        content: adaptiveCard,
      }],
    };

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamsPayload),
      });

      if (res.ok) {
        return { success: true, providerMessageId: `teams-${Date.now()}` };
      }

      const errText = await res.text();
      return {
        success: false,
        lastError: `Teams webhook error ${res.status}: ${errText.slice(0, 500)}`,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'network error';
      return {
        success: false,
        lastError: `Teams fetch failed: ${msg}`,
      };
    }
  }

  /**
   * Teams channel available on business plan and above.
   */
  isEntitled(workspacePlan: string): boolean {
    return workspacePlan === 'business' || workspacePlan === 'enterprise';
  }

  private async resolveConfig(tenantId: string): Promise<{
    webhookUrl: string | undefined;
  }> {
    if (!this.db) {
      return { webhookUrl: this.platformWebhookUrl };
    }

    let provider = null;
    try {
      provider = await resolveChannelProvider(this.db, tenantId, 'webhook');
    } catch {
      return { webhookUrl: this.platformWebhookUrl };
    }

    if (!provider || provider.providerName !== 'teams_webhook') {
      return { webhookUrl: this.platformWebhookUrl };
    }

    if (provider.credentialsKvKey && this.kv && this.masterKey) {
      try {
        const creds = await loadCredentials(this.kv, this.masterKey, provider.credentialsKvKey);
        if (creds?.['webhook_url']) {
          return { webhookUrl: creds['webhook_url'] };
        }
      } catch {
        // Fall through
      }
    }

    return { webhookUrl: this.platformWebhookUrl };
  }
}
