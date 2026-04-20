/**
 * @webwaka/notifications — Termii SMS channel (N-043, Phase 4).
 *
 * Implements INotificationChannel for the 'sms' channel via Termii API.
 * Termii is the primary SMS provider for Nigeria (WebWaka's primary market).
 *
 * API: POST https://api.ng.termii.com/api/sms/send
 * Docs: https://developers.termii.com/messaging
 *
 * Credentials (G16 ADL-002 — loaded from KV, never from D1):
 *   { api_key: string }     — Termii API key
 *
 * Provider-specific config from channel_provider.metadata (JSON):
 *   { sender_id: string, route: string, sms_type: 'plain'|'unicode' }
 *
 * Guardrails:
 *   G5  — CBN R8: SMS channel must NOT be blocked for OTP events; always dispatches
 *   G16 (ADL-002) — credentials from KV only, never D1
 *   G24 (OQ-012) — sandbox redirect: if sandboxMode=true and sandboxPhone set, use it
 *   G20 — suppression check done by NotificationService before dispatch(); trusted here
 *   G1  — tenantId used in resolveChannelProvider() DB query
 */

import type { INotificationChannel, DispatchContext, DispatchResult } from '../types.js';
import type { D1LikeFull } from '../db-types.js';
import { resolveChannelProvider } from '../channel-provider-resolver.js';
import { loadCredentials } from '../credential-store.js';
import type { KVLike } from '../credential-store.js';
import { sha256hex } from '../crypto-utils.js';

// ---------------------------------------------------------------------------
// Termii API constants
// ---------------------------------------------------------------------------

const TERMII_API_URL = 'https://api.ng.termii.com/api/sms/send';

// ---------------------------------------------------------------------------
// TermiiSmsChannelOptions
// ---------------------------------------------------------------------------

export interface TermiiSmsChannelOptions {
  /** Platform-level Termii API key from env.TERMII_API_KEY. Fallback if tenant has none in KV. */
  platformApiKey?: string;
  /** Platform-level sender ID (default: 'WebWaka'). Used when falling back to platform creds. */
  platformSenderId?: string;
  /** D1 database binding for resolving per-tenant channel_provider config (N-053). */
  db?: D1LikeFull;
  /** KV namespace for loading AES-256-GCM encrypted credentials (G16 ADL-002). */
  kv?: KVLike;
  /** AES-256-GCM master key (base64) from env.NOTIFICATION_KV_MASTER_KEY. */
  masterKey?: string;
}

// ---------------------------------------------------------------------------
// TermiiSmsChannel
// ---------------------------------------------------------------------------

export class TermiiSmsChannel implements INotificationChannel {
  readonly channel = 'sms' as const;
  readonly providerName = 'termii';

  private readonly platformApiKey: string | undefined;
  private readonly platformSenderId: string;
  private readonly db: D1LikeFull | undefined;
  private readonly kv: KVLike | undefined;
  private readonly masterKey: string | undefined;

  constructor(options: TermiiSmsChannelOptions = {}) {
    this.platformApiKey = options.platformApiKey;
    this.platformSenderId = options.platformSenderId ?? 'WebWaka';
    this.db = options.db;
    this.kv = options.kv;
    this.masterKey = options.masterKey;
  }

  async dispatch(ctx: DispatchContext): Promise<DispatchResult> {
    // G24: sandbox redirect
    let toPhone: string | undefined;
    let sandboxRedirect = false;
    let sandboxOriginalRecipientHash: string | undefined;

    if (ctx.sandboxMode && ctx.sandboxRecipient?.phone) {
      if (ctx.channelAddress) {
        sandboxOriginalRecipientHash = await sha256hex(ctx.channelAddress.toLowerCase());
      }
      toPhone = ctx.sandboxRecipient.phone;
      sandboxRedirect = true;
    } else if (ctx.sandboxMode) {
      // Sandbox mode but no sandbox phone — skip dispatch entirely (do not send to real number)
      console.log(
        `[termii-sms] sandbox mode — no sandbox phone configured; ` +
        `skipping dispatch deliveryId=${ctx.deliveryId}`,
      );
      return {
        success: true,
        providerMessageId: 'sandbox-skipped',
        sandboxRedirect: true,
      };
    } else {
      toPhone = ctx.channelAddress;
    }

    if (!toPhone) {
      return {
        success: false,
        lastError: 'No recipient phone number available (channelAddress missing)',
      };
    }

    // Resolve credentials and config
    const { apiKey, senderId, route, smsType } = await this.resolveConfig(ctx.tenantId);

    if (!apiKey) {
      console.log(
        `[termii-sms] no API key configured — ` +
        `SMS skipped (dev mode) deliveryId=${ctx.deliveryId}`,
      );
      return { success: true, providerMessageId: 'dev-skipped' };
    }

    // Build SMS text from template body (plain text for SMS)
    const smsText = (ctx.template.bodyPlainText ?? ctx.template.body)
      .replace(/<[^>]+>/g, '')  // strip any HTML tags
      .trim()
      .slice(0, 160);            // Termii standard SMS max length

    try {
      const res = await fetch(TERMII_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: toPhone,
          from: senderId,
          sms: smsText,
          type: smsType,
          channel: route,
          api_key: apiKey,
        }),
      });

      const responseText = await res.text();
      let responseJson: { message_id?: string; message?: string; code?: string } = {};
      try {
        responseJson = JSON.parse(responseText) as typeof responseJson;
      } catch {
        // Non-JSON response from Termii (rare)
      }

      if (res.ok) {
        return {
          success: true,
          ...(responseJson.message_id !== undefined
            ? { providerMessageId: responseJson.message_id }
            : {}),
          sandboxRedirect,
          ...(sandboxOriginalRecipientHash !== undefined
            ? { sandboxOriginalRecipientHash }
            : {}),
        };
      }

      const errDetail = responseJson.message ?? responseText.slice(0, 500);
      return {
        success: false,
        lastError: `Termii API error ${res.status}: ${errDetail}`,
        sandboxRedirect,
        ...(sandboxOriginalRecipientHash !== undefined
          ? { sandboxOriginalRecipientHash }
          : {}),
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'network error';
      return {
        success: false,
        lastError: `Termii fetch failed: ${msg}`,
        sandboxRedirect,
        ...(sandboxOriginalRecipientHash !== undefined
          ? { sandboxOriginalRecipientHash }
          : {}),
      };
    }
  }

  /**
   * G5 (CBN R8): SMS is always entitled — OTP flows require SMS regardless of plan.
   * Phase 6 may add bulk-SMS entitlement gates; OTP path is always exempt.
   */
  isEntitled(_workspacePlan: string): boolean {
    return true;
  }

  private async resolveConfig(tenantId: string): Promise<{
    apiKey: string | undefined;
    senderId: string;
    route: string;
    smsType: string;
  }> {
    const defaults = {
      apiKey: this.platformApiKey,
      senderId: this.platformSenderId,
      route: 'dnd',
      smsType: 'plain',
    };

    if (!this.db) {
      return defaults;
    }

    let provider = null;
    try {
      provider = await resolveChannelProvider(this.db, tenantId, 'sms');
    } catch {
      return defaults;
    }

    if (!provider) {
      return defaults;
    }

    // Extract provider-specific config from metadata
    const meta = provider.metadata ?? {};
    const senderId = typeof meta['sender_id'] === 'string' ? meta['sender_id'] : this.platformSenderId;
    const route = typeof meta['route'] === 'string' ? meta['route'] : 'dnd';
    const smsType = typeof meta['sms_type'] === 'string' ? meta['sms_type'] : 'plain';

    // Load credentials from KV if configured (G16 ADL-002)
    if (provider.credentialsKvKey && this.kv && this.masterKey) {
      try {
        const creds = await loadCredentials(this.kv, this.masterKey, provider.credentialsKvKey);
        if (creds?.['api_key']) {
          return { apiKey: creds['api_key'], senderId, route, smsType };
        }
      } catch (err) {
        console.warn(
          `[termii-sms] loadCredentials failed — ` +
          `tenant=${tenantId} kvKey=${provider.credentialsKvKey} ` +
          `err=${err instanceof Error ? err.message : String(err)} ` +
          `— falling back to platform API key`,
        );
      }
    }

    return { apiKey: this.platformApiKey, senderId, route, smsType };
  }
}
