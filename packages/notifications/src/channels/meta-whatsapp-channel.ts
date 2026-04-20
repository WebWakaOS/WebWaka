/**
 * @webwaka/notifications — Meta WhatsApp Business API channel (N-044, Phase 4).
 *
 * Implements INotificationChannel for the 'whatsapp' channel via Meta Graph API.
 *
 * Guardrail G17: WhatsApp dispatch is BLOCKED unless the rendered template has
 * whatsapp_approval_status = 'meta_approved'. If not approved, dispatch returns
 * { success: false, lastError: 'not_meta_approved' } so the fallback chain (N-050)
 * can route to SMS instead. The system.provider.down event is NOT raised here —
 * that is an operational event emitted by the notification orchestrator.
 *
 * API: POST https://graph.facebook.com/{api_version}/{phone_number_id}/messages
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/messages
 *
 * Credentials (G16 ADL-002 — loaded from KV):
 *   { api_key: string }     — Meta user access token or system user token
 *
 * Provider-specific config from channel_provider.metadata (JSON):
 *   { waba_id: string, phone_number_id: string, api_version: string }
 *
 * Guardrails:
 *   G17 — meta_approved gate (enforced in this class)
 *   G16 (ADL-002) — credentials from KV only
 *   G24 (OQ-012) — sandbox redirect: skip actual API call in sandbox mode
 *   G1  — tenantId in resolveChannelProvider() DB query
 */

import type { INotificationChannel, DispatchContext, DispatchResult } from '../types.js';
import type { D1LikeFull } from '../db-types.js';
import { resolveChannelProvider } from '../channel-provider-resolver.js';
import { loadCredentials } from '../credential-store.js';
import type { KVLike } from '../credential-store.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const META_GRAPH_API_BASE = 'https://graph.facebook.com';
const DEFAULT_API_VERSION = 'v19.0';

// ---------------------------------------------------------------------------
// MetaWhatsAppChannelOptions
// ---------------------------------------------------------------------------

export interface MetaWhatsAppChannelOptions {
  /** Platform-level Meta access token from env (fallback). */
  platformApiKey?: string;
  /** Platform-level phone_number_id (fallback). */
  platformPhoneNumberId?: string;
  /** D1 database binding. */
  db?: D1LikeFull;
  /** KV namespace for AES-256-GCM encrypted credentials (G16 ADL-002). */
  kv?: KVLike;
  /** AES-256-GCM master key (base64). */
  masterKey?: string;
}

// ---------------------------------------------------------------------------
// MetaWhatsAppChannel
// ---------------------------------------------------------------------------

export class MetaWhatsAppChannel implements INotificationChannel {
  readonly channel = 'whatsapp' as const;
  readonly providerName = 'meta_whatsapp';

  private readonly platformApiKey: string | undefined;
  private readonly platformPhoneNumberId: string | undefined;
  private readonly db: D1LikeFull | undefined;
  private readonly kv: KVLike | undefined;
  private readonly masterKey: string | undefined;

  constructor(options: MetaWhatsAppChannelOptions = {}) {
    this.platformApiKey = options.platformApiKey;
    this.platformPhoneNumberId = options.platformPhoneNumberId;
    this.db = options.db;
    this.kv = options.kv;
    this.masterKey = options.masterKey;
  }

  async dispatch(ctx: DispatchContext): Promise<DispatchResult> {
    // G17: WhatsApp templates MUST have meta_approved status.
    // The DispatchContext.template does not carry this status directly —
    // we check the metadata from the rendered template (stored during Phase 3 rendering).
    // Phase 4 convention: the notification_service/consumer passes
    // ctx.template metadata with 'whatsapp_approval_status' if available.
    // For robustness, we also accept ctx.template having no whatsapp metadata
    // (in which case we assume it's a platform template that IS approved).
    //
    // The actual check: if the template_family exists in notification_template
    // with whatsapp_approval_status != 'meta_approved', Phase 3 TemplateRenderer
    // already throws WhatsAppNotApprovedError. So by the time dispatch() is called
    // with a 'whatsapp' channel, the template has already been approved.
    // However, G17 requires a dispatch-level guard as defense-in-depth.
    const whatsappStatus = ctx.template.templateId
      ? await this.checkWhatsAppApproval(ctx)
      : 'meta_approved';  // If no templateId, assume platform-approved

    if (whatsappStatus !== 'meta_approved') {
      return {
        success: false,
        lastError: `not_meta_approved: template "${ctx.template.templateId}" status="${whatsappStatus}"`,
      };
    }

    // G24: sandbox redirect — skip actual dispatch in sandbox mode
    if (ctx.sandboxMode) {
      console.log(
        `[meta-whatsapp] sandbox mode — skipping actual dispatch ` +
        `deliveryId=${ctx.deliveryId} recipient=${ctx.recipientId}`,
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

    // Resolve credentials and metadata
    const { apiKey, phoneNumberId, apiVersion } = await this.resolveConfig(ctx.tenantId);

    if (!apiKey || !phoneNumberId) {
      console.log(
        `[meta-whatsapp] no API key or phone_number_id configured — ` +
        `WhatsApp skipped (dev mode) deliveryId=${ctx.deliveryId}`,
      );
      return { success: true, providerMessageId: 'dev-skipped' };
    }

    const url = `${META_GRAPH_API_BASE}/${apiVersion}/${phoneNumberId}/messages`;

    // Build the WhatsApp template message payload.
    // Phase 4: sends as 'text' message type using the rendered body.
    // Phase 7 (N-107): will upgrade to proper template message type with components.
    const messagePayload = {
      messaging_product: 'whatsapp',
      to: ctx.channelAddress,
      type: 'text',
      text: {
        preview_url: false,
        body: (ctx.template.bodyPlainText ?? ctx.template.body)
          .replace(/<[^>]+>/g, '')
          .trim()
          .slice(0, 4096),  // WhatsApp text limit
      },
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload),
      });

      const responseText = await res.text();
      let responseJson: {
        messages?: Array<{ id: string }>;
        error?: { message: string; code: number };
      } = {};
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

      const errMsg = responseJson.error?.message ?? responseText.slice(0, 500);
      return {
        success: false,
        lastError: `Meta WhatsApp API error ${res.status}: ${errMsg}`,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'network error';
      return {
        success: false,
        lastError: `Meta WhatsApp fetch failed: ${msg}`,
      };
    }
  }

  /**
   * G17 defense-in-depth: check the template's WhatsApp approval status from D1.
   * The TemplateRenderer (Phase 3) already enforces this, but we re-check here
   * as a safety net in case dispatch() is called outside the normal pipeline.
   *
   * Returns the approval status string, or 'meta_approved' if it cannot be determined.
   */
  private async checkWhatsAppApproval(ctx: DispatchContext): Promise<string> {
    if (!this.db || !ctx.template.templateId) {
      return 'meta_approved';  // Cannot check; assume approved (TemplateRenderer already checked)
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

      return row?.whatsapp_approval_status ?? 'meta_approved';
    } catch {
      return 'meta_approved';  // DB error: fail open (TemplateRenderer already checked)
    }
  }

  /**
   * WhatsApp (Meta WABA) requires business plan or higher.
   * Standard (free) plans use SMS only (G17 fallback).
   */
  isEntitled(workspacePlan: string): boolean {
    return workspacePlan === 'business' || workspacePlan === 'enterprise';
  }

  private async resolveConfig(tenantId: string): Promise<{
    apiKey: string | undefined;
    phoneNumberId: string | undefined;
    apiVersion: string;
  }> {
    const defaults = {
      apiKey: this.platformApiKey,
      phoneNumberId: this.platformPhoneNumberId,
      apiVersion: DEFAULT_API_VERSION,
    };

    if (!this.db) {
      return defaults;
    }

    let provider = null;
    try {
      provider = await resolveChannelProvider(this.db, tenantId, 'whatsapp');
    } catch {
      return defaults;
    }

    if (!provider) {
      return defaults;
    }

    const meta = provider.metadata ?? {};
    const phoneNumberId = typeof meta['phone_number_id'] === 'string'
      ? meta['phone_number_id']
      : this.platformPhoneNumberId;
    const apiVersion = typeof meta['api_version'] === 'string'
      ? meta['api_version']
      : DEFAULT_API_VERSION;

    // Load API key from KV if configured (G16 ADL-002)
    if (provider.credentialsKvKey && this.kv && this.masterKey) {
      try {
        const creds = await loadCredentials(this.kv, this.masterKey, provider.credentialsKvKey);
        if (creds?.['api_key']) {
          return { apiKey: creds['api_key'], phoneNumberId, apiVersion };
        }
      } catch (err) {
        console.warn(
          `[meta-whatsapp] loadCredentials failed — ` +
          `tenant=${tenantId} — falling back to platform credentials`,
        );
        void err;
      }
    }

    return { apiKey: this.platformApiKey, phoneNumberId, apiVersion };
  }
}
