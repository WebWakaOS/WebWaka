/**
 * @webwaka/notifications — NotificationService (N-020, Phase 2).
 *
 * Core pipeline orchestrator. Called from apps/notificator consumer after
 * processNotificationEvent() writes the notification_event row.
 *
 * Pipeline execution per rule:
 *   1. loadMatchingRules()      — load tenant/platform rules for event_key (N-021)
 *   2. evaluateRule()           — check enabled/min_severity/feature_flag gates
 *   3. resolveAudience()        — map audience_type → [{ userId, email }] (N-022)
 *   4. lookupRecipientEmail()   — fill in missing emails for actor/subject types
 *   5. For each recipient × channel:
 *      a. computeIdempotencyKey() — SHA-256(notifEventId + recipientId + channel) (G7)
 *      b. createDeliveryRow()     — INSERT OR IGNORE 'queued' (G7 idempotency)
 *      c. checkSuppression()      — G20: skip suppressed addresses
 *      d. renderPhase2()          — produce subject/html/title/body
 *      e. channel.dispatch()      — send via INotificationChannel
 *      f. updateDeliveryStatus()  — transition FSM to dispatched/failed
 *      g. writeAuditLog()         — G9: record every attempt
 *   6. markNotifEventProcessed() — set processed_at on notification_event
 *
 * Kill-switch (N-009, G-KS):
 *   processEvent() does NOT check the kill-switch — that is the consumer's
 *   responsibility. By the time processEvent() is called, the pipeline is enabled.
 *
 * Guardrails enforced:
 *   G1  — tenant_id in every D1 query
 *   G7  — idempotency_key UNIQUE; INSERT OR IGNORE prevents duplicate deliveries
 *   G9  — audit log written for every send attempt (success AND failure)
 *   G10 — dead_lettered status for max-retry exhaustion (handled by consumer)
 *   G20 — suppression checked before every external dispatch
 *   G23 — only userId stored in audit; email/phone never in audit log
 *   G24 — sandbox redirect via ResendEmailChannel
 */

import type { D1LikeFull } from './db-types.js';
import type { INotificationChannel, NotificationSeverity, SandboxRecipient } from './types.js';
import { loadMatchingRules, evaluateRule, parseChannels } from './rule-engine.js';
import {
  resolveAudience,
  lookupRecipientEmail,
  deduplicateRecipients,
} from './audience-resolver.js';
import {
  createDeliveryRow,
  updateDeliveryStatus,
  markNotifEventProcessed,
} from './delivery-service.js';
import { writeAuditLog } from './audit-service.js';
import { checkSuppression } from './suppression-service.js';
import { renderPhase2, buildRenderedTemplate } from './phase2-renderer.js';
import { computeIdempotencyKey } from './crypto-utils.js';

// ---------------------------------------------------------------------------
// ProcessEventParams
// ---------------------------------------------------------------------------

export interface ProcessEventParams {
  /** notification_event.id — derived by consumer as `notif_${eventId}` */
  notifEventId: string;
  /** event_log.id — original event from publishEvent() */
  eventKey: string;
  /** G1: always required */
  tenantId: string;
  /** The user who triggered the event (for audience_type='actor') */
  actorId?: string | null;
  actorType: string;
  /** The subject entity user (for audience_type='subject') */
  subjectId?: string | null;
  subjectType?: string | null;
  /** Workspace context for workspace_admins/all_members audience types */
  workspaceId?: string | null;
  /** Event payload — passed to template renderer */
  payload: Record<string, unknown>;
  /** N-060a: USSD/api/cron origin tag */
  source: string;
  /** Event severity — used for min_severity gate and G12 quiet-hours bypass */
  severity: string;
  /** N-011: cross-service distributed tracing */
  correlationId?: string | null;
}

// ---------------------------------------------------------------------------
// SandboxConfig — G24 (OQ-012)
// ---------------------------------------------------------------------------

export interface SandboxConfig {
  enabled: boolean;
  sandboxRecipient?: SandboxRecipient;
}

// ---------------------------------------------------------------------------
// processEvent — main pipeline orchestrator
// ---------------------------------------------------------------------------

/**
 * Execute the full notification pipeline for a single notification event.
 *
 * This function is idempotent: re-processing the same notifEventId produces
 * no additional deliveries (G7: INSERT OR IGNORE on idempotency_key).
 *
 * Errors in individual rule/recipient processing are isolated and logged —
 * a failure for one recipient does not block others (best-effort per recipient).
 *
 * @param params   - Event details (notifEventId, eventKey, tenantId, etc.)
 * @param db       - D1LikeFull database binding (G1: tenant_id in every query)
 * @param channels - Array of INotificationChannel implementations available
 * @param sandbox  - G24 sandbox configuration (from env.NOTIFICATION_SANDBOX_MODE)
 */
export async function processEvent(
  params: ProcessEventParams,
  db: D1LikeFull,
  channels: INotificationChannel[],
  sandbox: SandboxConfig = { enabled: false },
): Promise<void> {
  const {
    notifEventId,
    eventKey,
    tenantId,
    actorId,
    subjectId,
    workspaceId,
    payload,
    source,
    correlationId,
  } = params;

  const severity = (params.severity ?? 'info') as NotificationSeverity;

  // Build a channel map for O(1) lookup by channel name
  const channelMap = new Map<string, INotificationChannel>(
    channels.map((c) => [c.channel, c]),
  );

  // ── Step 1: Load matching rules ─────────────────────────────────────────
  let rules;
  try {
    rules = await loadMatchingRules(db, eventKey, tenantId);
  } catch (err) {
    console.error(
      `[notification-service] rule load failed — ` +
      `notifEventId=${notifEventId} eventKey=${eventKey} tenant=${tenantId} ` +
      `err=${err instanceof Error ? err.message : String(err)}`,
    );
    // Cannot proceed without rules — let the consumer retry
    throw err;
  }

  if (rules.length === 0) {
    console.log(
      `[notification-service] no rules found — ` +
      `notifEventId=${notifEventId} eventKey=${eventKey} tenant=${tenantId}`,
    );
    await markNotifEventProcessed(db, notifEventId, tenantId).catch(() => {});
    return;
  }

  // ── Step 2–5: Process each qualifying rule ───────────────────────────────
  for (const rule of rules) {
    // Gate evaluation (enabled, min_severity, feature_flag)
    if (!evaluateRule(rule, severity)) {
      continue;
    }

    const ruleChannels = parseChannels(rule.channels);
    if (ruleChannels.length === 0) {
      continue;
    }

    // ── Step 3: Resolve audience ────────────────────────────────────────
    let recipients;
    try {
      const rawRecipients = await resolveAudience(db, rule, {
        tenantId,
        // exactOptionalPropertyTypes: omit if undefined; coalesce null so AudienceContext
        // receives string | null (which it accepts) rather than string | null | undefined.
        ...(actorId !== undefined ? { actorId: actorId ?? null } : {}),
        ...(subjectId !== undefined ? { subjectId: subjectId ?? null } : {}),
        ...(workspaceId !== undefined ? { workspaceId: workspaceId ?? null } : {}),
      });
      recipients = deduplicateRecipients(rawRecipients);
    } catch (err) {
      console.error(
        `[notification-service] audience resolution failed — ` +
        `ruleId=${rule.id} err=${err instanceof Error ? err.message : String(err)}`,
      );
      continue;
    }

    if (recipients.length === 0) {
      continue;
    }

    // ── Step 4: Resolve missing emails (actor/subject types return email=null) ──
    for (const recipient of recipients) {
      if (!recipient.email) {
        recipient.email = await lookupRecipientEmail(
          db,
          recipient.userId,
          tenantId,
        ).catch(() => null);
      }
    }

    // Pre-render template for all channels in this rule
    const rendered = renderPhase2(rule.template_family, payload);

    // ── Step 5: Per-recipient × per-channel dispatch ─────────────────────
    for (const recipient of recipients) {
      for (const channelName of ruleChannels) {
        await dispatchToRecipient({
          notifEventId,
          tenantId,
          rule,
          recipient,
          channelName,
          rendered,
          db,
          channelMap,
          sandbox,
          source,
          // exactOptionalPropertyTypes: use conditional spread for string | null | undefined
          ...(correlationId != null ? { correlationId } : {}),
          severity,
        });
      }
    }
  }

  // ── Step 6: Mark event processed ────────────────────────────────────────
  await markNotifEventProcessed(db, notifEventId, tenantId).catch((err) => {
    console.error(
      `[notification-service] markNotifEventProcessed failed — ` +
      `notifEventId=${notifEventId} err=${err instanceof Error ? err.message : String(err)}`,
    );
  });
}

// ---------------------------------------------------------------------------
// dispatchToRecipient — inner per-channel dispatch helper
// ---------------------------------------------------------------------------

interface DispatchToRecipientParams {
  notifEventId: string;
  tenantId: string;
  rule: import('./rule-engine.js').NotificationRuleRow;
  recipient: import('./audience-resolver.js').RecipientInfo;
  channelName: string;
  rendered: import('./phase2-renderer.js').Phase2RenderedOutput;
  db: D1LikeFull;
  channelMap: Map<string, INotificationChannel>;
  sandbox: SandboxConfig;
  source: string;
  correlationId?: string;
  severity: NotificationSeverity;
}

async function dispatchToRecipient(p: DispatchToRecipientParams): Promise<void> {
  const {
    notifEventId, tenantId, rule, recipient, channelName,
    rendered, db, channelMap, sandbox, source, correlationId, severity,
  } = p;

  // ── G7: Compute idempotency key ─────────────────────────────────────────
  const idempotencyKey = await computeIdempotencyKey(
    notifEventId,
    recipient.userId,
    channelName,
  );

  const deliveryId = `delivery_${crypto.randomUUID().replace(/-/g, '')}`;

  // ── Create delivery row (status='queued') ───────────────────────────────
  try {
    await createDeliveryRow(db, {
      deliveryId,
      notifEventId,
      tenantId,
      recipientId: recipient.userId,
      recipientType: 'user',
      channel: channelName as import('./types.js').NotificationChannel,
      provider: channelName === 'email' ? 'resend' : channelName === 'in_app' ? 'internal' : channelName,
      templateId: rule.template_family,
      idempotencyKey,
      source,
      // exactOptionalPropertyTypes: conditional spread avoids setting optional prop to undefined
      ...(correlationId !== undefined ? { correlationId } : {}),
      sandboxRedirect: sandbox.enabled && channelName !== 'in_app',
    });
  } catch (err) {
    // Delivery row creation failure (not idempotency skip — those are OR IGNORE)
    console.error(
      `[notification-service] createDeliveryRow failed — ` +
      `deliveryId=${deliveryId} err=${err instanceof Error ? err.message : String(err)}`,
    );
    return;
  }

  // ── G20: Suppression check (external channels only) ─────────────────────
  const channelAddress = recipient.email;
  if (channelName !== 'in_app' && channelAddress) {
    let suppressed = false;
    try {
      const suppressResult = await checkSuppression(
        db,
        channelAddress,
        tenantId,
        channelName as import('./types.js').NotificationChannel,
      );
      suppressed = suppressResult.suppressed;

      if (suppressed) {
        await updateDeliveryStatus(db, tenantId, {
          deliveryId,
          status: 'suppressed',
          lastError: `suppressed: ${suppressResult.reason ?? 'unknown'}`,
        });
        await writeAuditLog(db, {
          tenantId,
          eventType: 'notification.suppressed',
          recipientId: recipient.userId,   // G23: userId only
          channel: channelName as import('./types.js').NotificationChannel,
          notificationEventId: notifEventId,
          deliveryId,
          metadata: { reason: suppressResult.reason, ruleId: rule.id },
        });
        return;
      }
    } catch (err) {
      // Suppression check failure: conservative approach — do NOT send (fail safe)
      console.error(
        `[notification-service] suppression check failed — ` +
        `deliveryId=${deliveryId} err=${err instanceof Error ? err.message : String(err)}`,
      );
      return;
    }
  }

  // ── Resolve channel implementation ──────────────────────────────────────
  const channelImpl = channelMap.get(channelName);
  if (!channelImpl) {
    // Channel not wired in Phase 2 (e.g., SMS, push) — mark queued and skip
    console.log(
      `[notification-service] channel '${channelName}' not wired — ` +
      `deliveryId=${deliveryId} (Phase 2: email + in_app only)`,
    );
    return;
  }

  // ── Render template for this channel ─────────────────────────────────────
  const renderedTemplate = buildRenderedTemplate(rendered, channelName, rule.template_family);

  // ── Build dispatch context ────────────────────────────────────────────────
  // exactOptionalPropertyTypes: conditional spread for all optional fields to avoid
  // setting optional properties to undefined (which TS rejects with this compiler flag).
  const ctx: import('./types.js').DispatchContext = {
    deliveryId,
    tenantId,
    recipientId: recipient.userId,
    recipientType: 'user',
    channel: channelName as import('./types.js').NotificationChannel,
    template: renderedTemplate,
    idempotencyKey,
    source: source as import('@webwaka/events').NotificationEventSource,
    severity,
    sandboxMode: sandbox.enabled,
    ...(channelAddress != null ? { channelAddress } : {}),
    ...(correlationId !== undefined ? { correlationId } : {}),
    ...(sandbox.sandboxRecipient !== undefined ? { sandboxRecipient: sandbox.sandboxRecipient } : {}),
  };

  // ── Dispatch ──────────────────────────────────────────────────────────────
  let result: import('./types.js').DispatchResult;
  try {
    result = await channelImpl.dispatch(ctx);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    result = { success: false, lastError: `dispatch threw: ${msg}` };
  }

  // ── Update delivery status ────────────────────────────────────────────────
  const newStatus = result.success ? 'dispatched' : 'failed';
  await updateDeliveryStatus(db, tenantId, {
    deliveryId,
    status: newStatus,
    // exactOptionalPropertyTypes: conditional spread for optional result fields
    ...(result.providerMessageId !== undefined ? { providerMessageId: result.providerMessageId } : {}),
    ...(result.lastError !== undefined ? { lastError: result.lastError } : {}),
    attempts: 1,
    ...(result.senderFallbackUsed !== undefined ? { senderFallbackUsed: result.senderFallbackUsed } : {}),
  }).catch((err) => {
    console.error(
      `[notification-service] updateDeliveryStatus failed — ` +
      `deliveryId=${deliveryId} err=${err instanceof Error ? err.message : String(err)}`,
    );
  });

  // ── G9: Audit log (every attempt — success AND failure) ──────────────────
  await writeAuditLog(db, {
    tenantId,
    eventType: result.success ? 'notification.sent' : 'notification.failed',
    recipientId: recipient.userId,  // G23: userId only, never email address
    channel: channelName as import('./types.js').NotificationChannel,
    notificationEventId: notifEventId,
    deliveryId,
    metadata: {
      ruleId: rule.id,
      providerMessageId: result.providerMessageId,
      sandboxRedirect: result.sandboxRedirect ?? false,
      ...(result.lastError ? { lastError: result.lastError.slice(0, 500) } : {}),
    },
  }).catch((err) => {
    console.error(
      `[notification-service] writeAuditLog failed — ` +
      `deliveryId=${deliveryId} err=${err instanceof Error ? err.message : String(err)}`,
    );
  });
}
