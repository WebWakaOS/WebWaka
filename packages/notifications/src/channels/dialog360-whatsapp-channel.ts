/**
 * @webwaka/notifications — 360dialog WhatsApp channel (N-045, Phase 4).
 *
 * Implements INotificationChannel for the 'whatsapp' channel via 360dialog API.
 * 360dialog is an alternative WhatsApp Business Solution Provider (BSP).
 *
 * API: POST https://waba.360dialog.io/v1/messages
 *   (or custom partner URL from metadata.api_url)
 * Docs: https://docs.360dialog.com/whatsapp-api/whatsapp-api/message
 *
 * Credentials (G16 ADL-002):
 *   { api_key: string }   — 360dialog Partner API key (D360-API-KEY header)
 *
 * Provider-specific metadata:
 *   { api_url?: string, namespace?: string }
 *
 * Guardrails:
 *   G17 — meta_approved gate (same as MetaWhatsAppChannel)
 *   G16 (ADL-002) — credentials from KV only
 *   G24 — sandbox redirect: skip actual API call
 *   G1  — tenantId in resolveChannelProvider() query
 */

import type { INotificationChannel, DispatchContext, DispatchResult } from '../types.js';
import type { D1LikeFull } from '../db-types.js';
import { resolveChannelProvider } from '../channel-provider-resolver.js';
import { loadCredentials } from '../credential-store.js';
import type { KVLike } from '../credential-store.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_API_URL = 'https://waba.360dialog.io/v1/messages';

// ---------------------------------------------------------------------------
// Dialog360WhatsAppChannelOptions
// ---------------------------------------------------------------------------

export interface Dialog360WhatsAppChannelOptions {
  /** Platform-level 360dialog API key (fallback). */
  platformApiKey?: string;
  /** D1 database binding. */
  db?: D1LikeFull;
  /** KV namespace for credentials (G16 ADL-002). */
  kv?: KVLike;
  /** AES-256-GCM master key (base64). */
  masterKey?: string;
}

// ---------------------------------------------------------------------------
// Dialog360WhatsAppChannel
// ---------------------------------------------------------------------------

export class Dialog360WhatsAppChannel implements INotificationChannel {
  readonly channel = 'whatsapp' as const;
  readonly providerName = 'dialog360';

  private readonly platformApiKey: string | undefined;
  private readonly db: D1LikeFull | undefined;
  private readonly kv: KVLike | undefined;
  private readonly masterKey: string | undefined;

  constructor(options: Dialog360WhatsAppChannelOptions = {}) {
    this.platformApiKey = options.platformApiKey;
    this.db = options.db;
    this.kv = options.kv;
    this.masterKey = options.masterKey;
  }

  async dispatch(ctx: DispatchContext): Promise<DispatchResult> {
    // G17: check meta_approved status
    const approved = await this.checkWhatsAppApproval(ctx);
    if (!approved) {
      return {
        success: false,
        lastError: `not_meta_approved: template "${ctx.template.templateId}"`,
      };
    }

    // G24: sandbox redirect
    if (ctx.sandboxMode) {
      console.log(
        `[dialog360-whatsapp] sandbox mode — skipping dispatch ` +
        `deliveryId=${ctx.deliveryId}`,
      );
      return {
        success: true,
        providerMessageId: 'sandbox-skipped',
        sandboxRedirect: true,
      };
    }

    if (!ctx.channelAddress) {
      return {
        success: false,
        lastError: 'No recipient phone number available (channelAddress missing)',
      };
    }

    const { apiKey, apiUrl } = await this.resolveConfig(ctx.tenantId);

    if (!apiKey) {
      console.log(
        `[dialog360-whatsapp] no API key — skipped (dev mode) deliveryId=${ctx.deliveryId}`,
      );
      return { success: true, providerMessageId: 'dev-skipped' };
    }

    const bodyText = (ctx.template.bodyPlainText ?? ctx.template.body)
      .replace(/<[^>]+>/g, '')
      .trim()
      .slice(0, 4096);

    const messagePayload = {
      messaging_product: 'whatsapp',
      to: ctx.channelAddress,
      type: 'text',
      text: { preview_url: false, body: bodyText },
    };

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'D360-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload),
      });

      const responseText = await res.text();
      let responseJson: { messages?: Array<{ id: string }>; errors?: unknown[] } = {};
      try {
        responseJson = JSON.parse(responseText) as typeof responseJson;
      } catch {
        // Non-JSON response
      }

      if (res.ok && responseJson.messages?.[0]?.id) {
        return {
          success: true,
          providerMessageId: responseJson.messages[0].id,
        };
      }

      return {
        success: false,
        lastError: `360dialog API error ${res.status}: ${responseText.slice(0, 500)}`,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'network error';
      return {
        success: false,
        lastError: `360dialog fetch failed: ${msg}`,
      };
    }
  }

  /**
   * WhatsApp (360dialog BSP) requires business plan or higher.
   */
  isEntitled(workspacePlan: string): boolean {
    return workspacePlan === 'business' || workspacePlan === 'enterprise';
  }

  private async checkWhatsAppApproval(ctx: DispatchContext): Promise<boolean> {
    if (!this.db || !ctx.template.templateId) {
      return true;  // Assume approved; TemplateRenderer already enforced G17
    }
    try {
      const row = await this.db
        .prepare(
          `SELECT whatsapp_approval_status
           FROM notification_template
           WHERE id = ? AND (tenant_id = ? OR tenant_id IS NULL)
           LIMIT 1`,
        )
        .bind(ctx.template.templateId, ctx.tenantId)
        .first<{ whatsapp_approval_status: string | null }>();

      const status = row?.whatsapp_approval_status ?? 'meta_approved';
      return status === 'meta_approved';
    } catch {
      return true;  // Fail open; TemplateRenderer already checked
    }
  }

  private async resolveConfig(tenantId: string): Promise<{
    apiKey: string | undefined;
    apiUrl: string;
  }> {
    const defaults = { apiKey: this.platformApiKey, apiUrl: DEFAULT_API_URL };

    if (!this.db) {
      return defaults;
    }

    let provider = null;
    try {
      provider = await resolveChannelProvider(this.db, tenantId, 'whatsapp');
    } catch {
      return defaults;
    }

    if (!provider || provider.providerName !== 'dialog360') {
      return defaults;
    }

    const meta = provider.metadata ?? {};
    const apiUrl = typeof meta['api_url'] === 'string' ? meta['api_url'] : DEFAULT_API_URL;

    if (provider.credentialsKvKey && this.kv && this.masterKey) {
      try {
        const creds = await loadCredentials(this.kv, this.masterKey, provider.credentialsKvKey);
        if (creds?.['api_key']) {
          return { apiKey: creds['api_key'], apiUrl };
        }
      } catch {
        // Fall through to platform key
      }
    }

    return { apiKey: this.platformApiKey, apiUrl };
  }
}
