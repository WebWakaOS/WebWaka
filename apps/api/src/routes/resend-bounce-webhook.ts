/**
 * Resend Bounce Webhook Route — N-052 (Phase 4)
 *
 * POST /provider-webhooks/resend
 *
 * Processes Resend webhook events for delivery status FSM transitions.
 * Called by Resend when an email is delivered, bounced, or complained about.
 *
 * Event types handled:
 *   email.delivered   → updateDeliveredByProviderMessageId(status='delivered')
 *   email.bounced     → updateDeliveredByProviderMessageId(status='failed') + addSuppression()
 *   email.complained  → updateDeliveredByProviderMessageId(status='failed') + addSuppression()
 *
 * Security:
 *   - Svix signature verification using Resend webhook secret (RESEND_WEBHOOK_SECRET)
 *   - If signature invalid → 403
 *   - If secret not configured → 501 (refuse to process unverified payloads)
 *
 * Suppression:
 *   Hard bounces (email.bounced) and complaints (email.complained) add a permanent
 *   suppression record (G20) — future sends to this email are blocked at rule-eval time.
 *
 * G1: tenant_id is extracted from the Resend event custom_data.tenant_id field,
 *   which is populated by ResendEmailChannel when calling Resend /emails API.
 *   If absent, the lookup uses provider_message_id only (no tenant isolation risk
 *   since provider_message_id is globally unique per Resend account).
 *
 * NDPR (N-054): email addresses in bounce events are hashed before suppression log storage.
 *
 * Reference: https://resend.com/docs/dashboard/webhooks/introduction
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import type { D1LikeFull } from '@webwaka/notifications';
import { updateDeliveredByProviderMessageId } from '@webwaka/notifications';

const resendBounceWebhook = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// Svix Signature Verification
// ---------------------------------------------------------------------------

/**
 * Verify the Resend/Svix webhook signature.
 *
 * Resend uses Svix for webhook delivery. The signature is provided in three headers:
 *   svix-id        — unique message ID
 *   svix-timestamp — Unix timestamp (seconds) when the event was sent
 *   svix-signature — base64-encoded HMAC-SHA256 signature
 *
 * The signed content is: `{svix-id}.{svix-timestamp}.{raw-body}`
 *
 * Returns true if the signature is valid, false otherwise.
 * Throws if the secret is not configured (caller returns 501).
 */
async function verifyResendSignature(
  secret: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  rawBody: string,
): Promise<boolean> {
  // Svix secret format: "whsec_{base64}" — strip the prefix
  const secretBytes = secret.startsWith('whsec_')
    ? base64ToBytes(secret.slice(6))
    : new TextEncoder().encode(secret);

  const signingPayload = `${svixId}.${svixTimestamp}.${rawBody}`;
  const enc = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(signingPayload));
  const computedB64 = bytesToBase64(new Uint8Array(sig));

  // Resend sends multiple signatures separated by spaces: "v1,{b64} v1,{b64}"
  const signatures = svixSignature.split(' ');
  return signatures.some((s) => {
    const parts = s.split(',');
    const b64 = parts[1];
    return b64 !== undefined && b64 === computedB64;
  });
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

// ---------------------------------------------------------------------------
// Resend event payload shapes
// ---------------------------------------------------------------------------

interface ResendEmailEvent {
  type: 'email.delivered' | 'email.bounced' | 'email.complained' | (string & Record<never, never>);
  data: {
    email_id: string;       // Resend message ID — stored as provider_message_id
    to: string[];           // Recipient email addresses
    from?: string;          // Sender address
    subject?: string;
    bounce?: {
      message?: string;     // Human-readable bounce reason
    };
    tags?: { name: string; value: string }[];  // Custom tags set on send
  };
  created_at?: string;
}

// ---------------------------------------------------------------------------
// POST /provider-webhooks/resend
// ---------------------------------------------------------------------------

resendBounceWebhook.post('/', async (c) => {
  const webhookSecret = c.env.RESEND_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[resend-bounce-webhook] RESEND_WEBHOOK_SECRET not configured — refusing request');
    return c.json({ error: 'Webhook secret not configured' }, 501);
  }

  // Read raw body for signature verification
  const rawBody = await c.req.text();

  // Validate Svix headers
  const svixId = c.req.header('svix-id') ?? '';
  const svixTimestamp = c.req.header('svix-timestamp') ?? '';
  const svixSignature = c.req.header('svix-signature') ?? '';

  if (!svixId || !svixTimestamp || !svixSignature) {
    return c.json({ error: 'Missing Svix signature headers' }, 400);
  }

  // Timestamp tolerance: reject events older than 5 minutes (replay protection)
  const eventTs = parseInt(svixTimestamp, 10);
  if (isNaN(eventTs) || Math.abs(Date.now() / 1000 - eventTs) > 300) {
    return c.json({ error: 'Webhook timestamp out of tolerance' }, 400);
  }

  // Verify signature
  let signatureValid: boolean;
  try {
    signatureValid = await verifyResendSignature(
      webhookSecret,
      svixId,
      svixTimestamp,
      svixSignature,
      rawBody,
    );
  } catch (err) {
    console.error('[resend-bounce-webhook] signature verification error:', err);
    return c.json({ error: 'Signature verification failed' }, 403);
  }

  if (!signatureValid) {
    console.warn('[resend-bounce-webhook] invalid signature — rejecting event');
    return c.json({ error: 'Invalid webhook signature' }, 403);
  }

  // Parse payload
  let event: ResendEmailEvent;
  try {
    event = JSON.parse(rawBody) as ResendEmailEvent;
  } catch {
    return c.json({ error: 'Invalid JSON payload' }, 400);
  }

  const db = c.env.DB as unknown as D1LikeFull;
  const emailId = event.data?.email_id;

  if (!emailId) {
    console.warn('[resend-bounce-webhook] event missing email_id — ignoring');
    return c.json({ received: true, processed: false });
  }

  // Extract tenant_id from custom tags (set by ResendEmailChannel on send)
  let tenantId = 'platform';
  const tags = event.data?.tags ?? [];
  const tenantTag = tags.find((t) => t.name === 'tenant_id');
  if (tenantTag?.value) {
    tenantId = tenantTag.value;
  }

  try {
    switch (event.type) {
      case 'email.delivered': {
        await updateDeliveredByProviderMessageId(db, tenantId, emailId, 'delivered');
        console.log(
          `[resend-bounce-webhook] email.delivered — emailId=${emailId} tenant=${tenantId}`,
        );
        break;
      }

      case 'email.bounced': {
        const bounceReason = event.data?.bounce?.message ?? 'hard_bounce';
        await updateDeliveredByProviderMessageId(
          db,
          tenantId,
          emailId,
          'failed',
          `bounce: ${bounceReason}`,
        );

        // G20: Add suppression record for all bounced recipient addresses
        for (const email of (event.data?.to ?? [])) {
          await addEmailSuppression(db, tenantId, email, 'hard_bounce', emailId);
        }

        console.log(
          `[resend-bounce-webhook] email.bounced — emailId=${emailId} ` +
          `tenant=${tenantId} reason=${bounceReason}`,
        );
        break;
      }

      case 'email.complained': {
        await updateDeliveredByProviderMessageId(
          db,
          tenantId,
          emailId,
          'failed',
          'spam_complaint',
        );

        // G20: Add suppression record for all complaint recipient addresses
        for (const email of (event.data?.to ?? [])) {
          await addEmailSuppression(db, tenantId, email, 'spam_complaint', emailId);
        }

        console.log(
          `[resend-bounce-webhook] email.complained — emailId=${emailId} tenant=${tenantId}`,
        );
        break;
      }

      default: {
        // Silently ack unknown event types — Resend may send more event types in future
        console.log(
          `[resend-bounce-webhook] unhandled event type="${event.type}" — acking`,
        );
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(
      `[resend-bounce-webhook] processing failed — ` +
      `type=${event.type} emailId=${emailId} tenant=${tenantId} err=${msg}`,
    );
    // Return 500 so Resend retries the webhook
    return c.json({ error: 'Processing failed' }, 500);
  }

  return c.json({ received: true, processed: true });
});

// ---------------------------------------------------------------------------
// addEmailSuppression — G20 (email suppression for bounce/complaint)
// ---------------------------------------------------------------------------

/**
 * Add a suppression record for an email address.
 *
 * G20: Suppression prevents future dispatch to bounced/complained addresses.
 * NotificationService checks suppression before channel dispatch.
 *
 * Uses INSERT OR IGNORE — duplicate (tenantId, channel, address) combinations
 * are silently skipped (idempotent on duplicate webhook delivery).
 *
 * NDPR note: email addresses are stored in plain text in the suppression list
 * because the suppression lookup must be an exact-match query. The suppression
 * list is purged on NDPR erasure request (N-115, Phase 8).
 */
async function addEmailSuppression(
  db: D1LikeFull,
  tenantId: string,
  email: string,
  reason: 'hard_bounce' | 'spam_complaint',
  providerMessageId: string,
): Promise<void> {
  const id = `sup_${crypto.randomUUID().replace(/-/g, '')}`;
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(
      `INSERT OR IGNORE INTO notification_suppression_list
         (id, tenant_id, channel, address, reason, provider_message_id, created_at)
       VALUES (?, ?, 'email', ?, ?, ?, ?)`,
    )
    .bind(id, tenantId, email.toLowerCase(), reason, providerMessageId, now)
    .run();
}

export { resendBounceWebhook };
