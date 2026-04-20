/**
 * @webwaka/notifications — Resend email channel (N-025 Phase 2 + N-042 Phase 4).
 *
 * Implements INotificationChannel for the 'email' channel via Resend API.
 *
 * Phase 4 upgrade (N-042):
 *   - Per-tenant FROM address resolved from channel_provider table (G3/OQ-004)
 *   - Per-tenant Resend API key loaded from KV via credential-store (G16 ADL-002)
 *   - Sender fallback: if domain not verified → use platform FROM + senderFallbackUsed=true
 *   - Subject prefix "[{tenantDisplayName}]" when fallback active (G3/OQ-004)
 *
 * Guardrails:
 *   G3  (OQ-004): FROM address resolved from channel_provider; fallback = platform sender
 *   G16 (ADL-002): API key loaded from KV (credentials_kv_key); never stored in D1
 *   G24 (OQ-012): sandbox redirect — if sandboxMode=true, send to sandboxRecipient.email
 *   G20: suppression checked by NotificationService BEFORE calling dispatch()
 *   G1:  tenantId used in all DB queries via resolveChannelProvider()
 *
 * If no API key is available (KV empty + platform key not set), email is logged and skipped.
 */

import type { INotificationChannel, DispatchContext, DispatchResult } from '../types.js';
import type { D1LikeFull } from '../db-types.js';
import { sha256hex } from '../crypto-utils.js';
import { resolveChannelProvider } from '../channel-provider-resolver.js';
import { loadCredentials } from '../credential-store.js';
import type { KVLike } from '../credential-store.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RESEND_API_URL = 'https://api.resend.com/emails';
const PLATFORM_FROM_EMAIL = 'noreply@webwaka.com';
const PLATFORM_FROM_NAME = 'WebWaka';

// ---------------------------------------------------------------------------
// ResendEmailChannelOptions
// ---------------------------------------------------------------------------

export interface ResendEmailChannelOptions {
  /**
   * Platform-level Resend API key from env.RESEND_API_KEY.
   * Used as fallback when tenant has no custom credentials in KV.
   * If undefined, email dispatch is logged and skipped (dev mode).
   */
  platformApiKey?: string;
  /**
   * D1 database binding for resolving per-tenant channel_provider config (N-053).
   * Phase 4 required; if omitted, always uses platform sender and platform API key.
   */
  db?: D1LikeFull;
  /**
   * KV namespace for loading per-tenant AES-256-GCM encrypted credentials (G16 ADL-002).
   * Phase 4 required alongside masterKey; if omitted, always uses platformApiKey.
   */
  kv?: KVLike;
  /**
   * AES-256-GCM master key (base64) from env.NOTIFICATION_KV_MASTER_KEY (G16 ADL-002).
   * Required to decrypt per-tenant credentials from KV.
   */
  masterKey?: string;
}

// ---------------------------------------------------------------------------
// ResendEmailChannel
// ---------------------------------------------------------------------------

export class ResendEmailChannel implements INotificationChannel {
  readonly channel = 'email' as const;
  readonly providerName = 'resend';

  private readonly platformApiKey: string | undefined;
  private readonly db: D1LikeFull | undefined;
  private readonly kv: KVLike | undefined;
  private readonly masterKey: string | undefined;

  constructor(options: ResendEmailChannelOptions | string | undefined) {
    // Backward-compatible: old Phase 2 constructor accepted a raw string API key.
    if (typeof options === 'string' || options === undefined) {
      this.platformApiKey = options;
    } else {
      this.platformApiKey = options.platformApiKey;
      this.db = options.db;
      this.kv = options.kv;
      this.masterKey = options.masterKey;
    }
  }

  /**
   * Send an email via Resend API.
   *
   * FROM address resolution (G3/OQ-004):
   *   1. resolveChannelProvider(db, tenantId, 'email')
   *   2. If tenant has custom domain (custom_from_domain_verified=1) AND tenant API key in KV:
   *      → use tenant FROM + tenant API key
   *   3. Else: use PLATFORM_FROM + platform API key; senderFallbackUsed=true
   *      → prepend "[{tenantDisplayName}] " to subject (G3)
   *
   * Address resolution (G24):
   *   1. sandboxMode + sandboxRecipient.email → redirect to sandbox (G24)
   *   2. Else: use ctx.channelAddress
   *   3. If neither: return failure
   */
  async dispatch(ctx: DispatchContext): Promise<DispatchResult> {
    // G24: sandbox redirect
    let toAddress: string | undefined;
    let sandboxRedirect = false;
    let sandboxOriginalRecipientHash: string | undefined;

    if (ctx.sandboxMode && ctx.sandboxRecipient?.email) {
      if (ctx.channelAddress) {
        sandboxOriginalRecipientHash = await sha256hex(ctx.channelAddress.toLowerCase());
      }
      toAddress = ctx.sandboxRecipient.email;
      sandboxRedirect = true;
    } else {
      toAddress = ctx.channelAddress;
    }

    if (!toAddress) {
      return {
        success: false,
        lastError: 'No recipient email address available (channelAddress missing)',
      };
    }

    // Resolve per-tenant sender config + API key (N-042, N-053, G3, G16)
    const { apiKey, fromAddress, senderFallbackUsed, subject } =
      await this.resolveEmailSender(ctx);

    // Dev mode: skip if no API key
    if (!apiKey) {
      console.log(
        `[resend-channel] no API key available — ` +
        `email delivery skipped (dev mode) ` +
        `deliveryId=${ctx.deliveryId} recipient=${ctx.recipientId}`,
      );
      return { success: true, providerMessageId: 'dev-skipped' };
    }

    const html = ctx.template.body;

    try {
      const res = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [toAddress],
          subject,
          html,
          ...(ctx.template.bodyPlainText ? { text: ctx.template.bodyPlainText } : {}),
        }),
      });

      if (res.ok) {
        const json = await res.json() as { id?: string };
        return {
          success: true,
          ...(json.id !== undefined ? { providerMessageId: json.id } : {}),
          sandboxRedirect,
          ...(senderFallbackUsed ? { senderFallbackUsed: true } : {}),
          ...(sandboxOriginalRecipientHash !== undefined
            ? { sandboxOriginalRecipientHash }
            : {}),
        };
      }

      const errBody = await res.text();
      return {
        success: false,
        lastError: `Resend API error ${res.status}: ${errBody.slice(0, 500)}`,
        sandboxRedirect,
        ...(senderFallbackUsed ? { senderFallbackUsed: true } : {}),
        ...(sandboxOriginalRecipientHash !== undefined
          ? { sandboxOriginalRecipientHash }
          : {}),
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'network error';
      return {
        success: false,
        lastError: `Resend fetch failed: ${msg}`,
        sandboxRedirect,
        ...(senderFallbackUsed ? { senderFallbackUsed: true } : {}),
        ...(sandboxOriginalRecipientHash !== undefined
          ? { sandboxOriginalRecipientHash }
          : {}),
      };
    }
  }

  /**
   * Resolve API key, FROM address, and subject for this dispatch.
   *
   * G3/OQ-004:
   *   - Use tenant custom FROM if domain is verified AND credentials_kv_key is set in KV
   *   - Otherwise fall back to platform FROM; set senderFallbackUsed=true
   *   - Prepend "[{tenantDisplayName}] " to subject when fallback used
   */
  private async resolveEmailSender(ctx: DispatchContext): Promise<{
    apiKey: string | undefined;
    fromAddress: string;
    senderFallbackUsed: boolean;
    subject: string;
  }> {
    const baseSubject = ctx.template.subject ?? 'Notification from WebWaka';

    // If no DB, always use platform sender (Phase 2 backward-compat or test mode)
    if (!this.db) {
      return {
        apiKey: this.platformApiKey,
        fromAddress: `${PLATFORM_FROM_NAME} <${PLATFORM_FROM_EMAIL}>`,
        senderFallbackUsed: false,
        subject: baseSubject,
      };
    }

    let provider = null;
    try {
      provider = await resolveChannelProvider(this.db, ctx.tenantId, 'email');
    } catch (err) {
      console.warn(
        `[resend-channel] resolveChannelProvider failed — ` +
        `tenant=${ctx.tenantId} err=${err instanceof Error ? err.message : String(err)} ` +
        `— falling back to platform sender`,
      );
    }

    // No provider configured at all — use platform key + platform FROM
    if (!provider) {
      return {
        apiKey: this.platformApiKey,
        fromAddress: `${PLATFORM_FROM_NAME} <${PLATFORM_FROM_EMAIL}>`,
        senderFallbackUsed: true,
        subject: baseSubject,
      };
    }

    // Determine whether to use tenant's custom sender
    const useTenantSender =
      !provider.platformSenderFallback &&
      provider.customFromDomainVerified &&
      provider.customFromEmail !== null &&
      provider.credentialsKvKey !== null &&
      this.kv !== undefined &&
      this.masterKey !== undefined;

    if (useTenantSender && this.kv && this.masterKey && provider.credentialsKvKey) {
      // Attempt to load tenant API key from KV (G16 ADL-002)
      let tenantCreds: Record<string, string> | null = null;
      try {
        tenantCreds = await loadCredentials(this.kv, this.masterKey, provider.credentialsKvKey);
      } catch (err) {
        console.warn(
          `[resend-channel] loadCredentials failed — ` +
          `tenant=${ctx.tenantId} kvKey=${provider.credentialsKvKey} ` +
          `err=${err instanceof Error ? err.message : String(err)} ` +
          `— falling back to platform sender`,
        );
      }

      if (tenantCreds?.['api_key']) {
        const fromName = provider.customFromName ?? PLATFORM_FROM_NAME;
        const fromEmail = provider.customFromEmail!;
        return {
          apiKey: tenantCreds['api_key'],
          fromAddress: `${fromName} <${fromEmail}>`,
          senderFallbackUsed: false,
          subject: baseSubject,
        };
      }
    }

    // Fallback to platform sender (G3/OQ-004)
    const displayName = provider.tenantDisplayName ?? ctx.tenantId;
    const fallbackSubject = `[${displayName}] ${baseSubject}`;

    return {
      apiKey: this.platformApiKey,
      fromAddress: `${PLATFORM_FROM_NAME} <${PLATFORM_FROM_EMAIL}>`,
      senderFallbackUsed: true,
      subject: fallbackSubject,
    };
  }

  /**
   * Email is entitled on all plans.
   * Phase 6 may restrict bulk email to higher plans (G19).
   */
  isEntitled(_workspacePlan: string): boolean {
    return true;
  }
}
