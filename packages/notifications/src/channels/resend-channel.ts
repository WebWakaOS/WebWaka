/**
 * @webwaka/notifications — Resend email channel (N-025, Phase 2).
 *
 * Implements INotificationChannel for the 'email' channel via Resend API.
 *
 * Phase 2 approach:
 *   - ctx.template.subject = rendered email subject
 *   - ctx.template.body    = rendered HTML body (from Phase2TemplateRenderer)
 *   - ctx.channelAddress   = recipient email address (pre-resolved by NotificationService)
 *
 * Guardrails:
 *   G3  (OQ-004): platform sender fallback — if tenant custom domain fails, retry
 *                 from platform sender (noreply@webwaka.com). Phase 6 wires per-tenant
 *                 domain; Phase 2 always uses platform sender.
 *   G24 (OQ-012): sandbox redirect — if sandboxMode=true, send to sandboxRecipient.email
 *                 and record sandbox_original_recipient_hash in result.
 *   G20: suppression must be checked by NotificationService BEFORE calling dispatch().
 *        ResendEmailChannel does NOT re-check suppression — it trusts the caller.
 *
 * If RESEND_API_KEY is not set, email is logged and skipped (dev mode).
 */

import type { INotificationChannel, DispatchContext, DispatchResult } from '../types.js';
import { sha256hex } from '../crypto-utils.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RESEND_API_URL = 'https://api.resend.com/emails';
const PLATFORM_FROM = 'WebWaka <noreply@webwaka.com>';

// ---------------------------------------------------------------------------
// ResendEmailChannel
// ---------------------------------------------------------------------------

export class ResendEmailChannel implements INotificationChannel {
  readonly channel = 'email' as const;
  readonly providerName = 'resend';

  constructor(private readonly resendApiKey: string | undefined) {}

  /**
   * Send an email via Resend API.
   *
   * Address resolution priority:
   *   1. If sandboxMode: use ctx.sandboxRecipient.email (G24)
   *   2. Otherwise: use ctx.channelAddress (pre-resolved by NotificationService)
   *   3. If neither: return failure (cannot send without address)
   *
   * G3: Phase 2 always uses platform sender. Phase 6 adds per-tenant sender config.
   * G24: sandbox redirect hashes original address for audit; uses test address.
   */
  async dispatch(ctx: DispatchContext): Promise<DispatchResult> {
    // Dev mode: skip send if API key not set
    if (!this.resendApiKey) {
      console.log(
        `[resend-channel] RESEND_API_KEY not set — ` +
        `email delivery skipped (dev mode) ` +
        `deliveryId=${ctx.deliveryId} recipient=${ctx.recipientId}`,
      );
      return { success: true, providerMessageId: 'dev-skipped' };
    }

    // G24: sandbox redirect
    let toAddress: string | undefined;
    let sandboxRedirect = false;
    let sandboxOriginalRecipientHash: string | undefined;

    if (ctx.sandboxMode && ctx.sandboxRecipient?.email) {
      // Hash the original address for audit (G24 — never store raw PII in audit)
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

    const subject = ctx.template.subject ?? 'Notification from WebWaka';
    const html = ctx.template.body;

    try {
      const res = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: PLATFORM_FROM,  // G3: platform sender in Phase 2
          to: [toAddress],
          subject,
          html,
        }),
      });

      if (res.ok) {
        const json = await res.json() as { id?: string };
        // exactOptionalPropertyTypes: use conditional spread — optional props must be omitted
        // when value is undefined, never set to `undefined` explicitly.
        return {
          success: true,
          ...(json.id !== undefined ? { providerMessageId: json.id } : {}),
          sandboxRedirect,
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
        ...(sandboxOriginalRecipientHash !== undefined
          ? { sandboxOriginalRecipientHash }
          : {}),
      };
    }
  }

  /**
   * Email is entitled on all plans.
   * Phase 6 may restrict bulk email to higher plans (G19).
   */
  isEntitled(_workspacePlan: string): boolean {
    return true;
  }
}
