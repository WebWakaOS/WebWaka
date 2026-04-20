/**
 * @webwaka/notifications — DigestEngine (N-064, Phase 5).
 *
 * Processes a pending digest batch: queries all items, renders a consolidated
 * digest notification, and dispatches it via the appropriate channel.
 *
 * Called from apps/notificator consumer.ts when a 'digest_batch' Queue message
 * is dequeued (enqueued by sweepPendingBatches() in digest.ts).
 *
 * Pipeline:
 *   1. Load batch header (validates tenant_id — G12)
 *   2. Load batch items (all with AND tenant_id = ? — G1)
 *   3. Render consolidated digest template
 *   4. Dispatch via the matching INotificationChannel
 *   5. Create delivery row + audit log entry
 *   6. Update batch status to 'sent' or 'failed'
 *
 * Guardrails:
 *   G1  — tenant_id in every D1 query
 *   G12 — batch is verified to belong to tenantId before any processing
 *   G7  — idempotency_key computed per batch (not per item) — prevents re-dispatch
 *   G9  — audit log written on success and failure
 */

import type { D1LikeFull } from './db-types.js';
import type { INotificationChannel, RenderedTemplate, NotificationSeverity } from './types.js';
import { createDeliveryRow, updateDeliveryStatus } from './delivery-service.js';
import { writeAuditLog } from './audit-service.js';
import { computeIdempotencyKey } from './crypto-utils.js';

// ---------------------------------------------------------------------------
// DB row types
// ---------------------------------------------------------------------------

interface DigestBatchRow {
  id: string;
  tenant_id: string;
  user_id: string;
  channel: string;
  window_type: string;
  window_start: number;
  window_end: number;
  status: string;
  item_count: number;
}

interface DigestItemRow {
  id: string;
  notification_event_id: string;
  event_key: string;
  title: string;
  body_summary: string;
  cta_url: string | null;
  severity: string;
  created_at: number;
}

// ---------------------------------------------------------------------------
// renderDigestTemplate — produce a RenderedTemplate from N digest items
// ---------------------------------------------------------------------------

/**
 * Render a consolidated digest notification from accumulated items.
 *
 * Phase 5 uses a simple plain-text/HTML list format.
 * Phase 7+ will use ITemplateRenderer with a dedicated 'notification.digest'
 * template family for branding and locale support.
 */
function renderDigestTemplate(
  batch: DigestBatchRow,
  items: DigestItemRow[],
): RenderedTemplate {
  const windowLabel = {
    hourly: 'Hourly',
    daily:  'Daily',
    weekly: 'Weekly',
  }[batch.window_type] ?? 'Digest';

  const count = items.length;
  const subject = `${windowLabel} Digest: ${count} notification${count === 1 ? '' : 's'}`;

  // Plain-text summary list
  const itemLines = items.map((item, i) =>
    `${i + 1}. ${item.title}\n   ${item.body_summary}${item.cta_url ? `\n   ${item.cta_url}` : ''}`,
  );
  const bodyPlainText = `You have ${count} notification${count === 1 ? '' : 's'}:\n\n${itemLines.join('\n\n')}`;

  // Minimal HTML (Phase 7: replaced by full branded template)
  const htmlItems = items
    .map(
      (item) =>
        `<li style="margin-bottom:12px">
          <strong>${escapeHtml(item.title)}</strong><br/>
          <span style="color:#6b7280">${escapeHtml(item.body_summary)}</span>
          ${item.cta_url ? `<br/><a href="${escapeHtml(item.cta_url)}" style="color:#0F4C81">View →</a>` : ''}
        </li>`,
    )
    .join('');

  const body = `<p>You have <strong>${count}</strong> notification${count === 1 ? '' : 's'}:</p>
<ul style="list-style:none;padding:0;margin:0">${htmlItems}</ul>`;

  return {
    subject,
    body,
    bodyPlainText,
    locale: 'en',
    templateId: 'notification.digest',
    templateVersion: 1,
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------------------------------------------------------------------------
// ProcessDigestBatchOptions
// ---------------------------------------------------------------------------

export interface ProcessDigestBatchOptions {
  /** G1, G12: must match batch.tenant_id — reject if mismatch */
  tenantId: string;
  /** Channel implementations available to the digest engine */
  channels: INotificationChannel[];
  /** G24: sandbox redirect config */
  sandbox?: { enabled: boolean; sandboxRecipient?: import('./types.js').SandboxRecipient };
}

// ---------------------------------------------------------------------------
// processDigestBatch — N-064 entry point
// ---------------------------------------------------------------------------

/**
 * Process a single pending digest batch identified by batchId.
 *
 * Called by apps/notificator consumer.ts when it receives a 'digest_batch'
 * Queue message (enqueued by sweepPendingBatches in digest.ts).
 *
 * Returns early (without throwing) if the batch is already processed,
 * belongs to a different tenant, or has no items.
 *
 * G1:  Every D1 query includes AND tenant_id = ?
 * G7:  Idempotency key = SHA-256('digest:' + batchId) — prevents re-dispatch
 * G9:  Audit log written on success and failure
 * G12: tenantId from Queue message verified against batch.tenant_id
 */
export async function processDigestBatch(
  db: D1LikeFull,
  batchId: string,
  options: ProcessDigestBatchOptions,
): Promise<void> {
  const { tenantId, channels, sandbox = { enabled: false } } = options;

  // ── Step 1: Load batch header (G1 + G12 verification) ────────────────────
  const batch = await db
    .prepare(
      `SELECT id, tenant_id, user_id, channel, window_type, window_start, window_end, status, item_count
       FROM notification_digest_batch
       WHERE id = ? AND tenant_id = ?`,
    )
    .bind(batchId, tenantId)
    .first<DigestBatchRow>();

  if (!batch) {
    console.warn(`[digest-engine] batch not found or tenant mismatch — batchId=${batchId} tenantId=${tenantId}`);
    return;
  }

  if (batch.status !== 'pending') {
    console.log(`[digest-engine] batch already processed — batchId=${batchId} status=${batch.status}`);
    return;
  }

  // Mark processing to prevent concurrent Worker double-dispatch (optimistic lock)
  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      `UPDATE notification_digest_batch
       SET status = 'processing', updated_at = ?
       WHERE id = ? AND tenant_id = ? AND status = 'pending'`,
    )
    .bind(now, batchId, tenantId)
    .run();

  // ── Step 2: Load batch items (G1: AND tenant_id = ?) ─────────────────────
  const { results: items } = await db
    .prepare(
      `SELECT id, notification_event_id, event_key, title, body_summary,
              cta_url, severity, created_at
       FROM notification_digest_batch_item
       WHERE digest_batch_id = ? AND tenant_id = ?
       ORDER BY created_at ASC`,
    )
    .bind(batchId, tenantId)
    .all<DigestItemRow>();

  if (items.length === 0) {
    // Empty batch — mark skipped
    await db
      .prepare(
        `UPDATE notification_digest_batch
         SET status = 'skipped', updated_at = ?
         WHERE id = ? AND tenant_id = ?`,
      )
      .bind(now, batchId, tenantId)
      .run();
    return;
  }

  // ── Step 3: Render consolidated digest template ───────────────────────────
  const rendered = renderDigestTemplate(batch, items);

  // ── Step 4: Resolve channel implementation ────────────────────────────────
  const channelMap = new Map<string, INotificationChannel>(
    channels.map((c) => [c.channel, c]),
  );
  const channelImpl = channelMap.get(batch.channel);

  // G7: idempotency key per batch (not per item)
  const idempotencyKey = await computeIdempotencyKey(
    `digest:${batchId}`,
    batch.user_id,
    batch.channel,
  );

  const deliveryId = `delivery_${crypto.randomUUID().replace(/-/g, '')}`;

  // Determine highest severity in batch for audit
  const highestSeverity = (items.reduce<string>((acc, item) => {
    if (item.severity === 'critical') return 'critical';
    if (item.severity === 'warning' && acc !== 'critical') return 'warning';
    return acc;
  }, 'info')) as NotificationSeverity;

  // Create delivery row
  try {
    await createDeliveryRow(db, {
      deliveryId,
      notifEventId: `digest_event_${batchId}`,
      tenantId,
      recipientId: batch.user_id,
      recipientType: 'user',
      channel: batch.channel as import('./types.js').NotificationChannel,
      provider: batch.channel === 'email' ? 'resend' : batch.channel === 'in_app' ? 'internal' : batch.channel,
      templateId: 'notification.digest',
      idempotencyKey,
      source: 'cron',
      sandboxRedirect: sandbox.enabled && batch.channel !== 'in_app',
    });
  } catch (err) {
    console.error(`[digest-engine] createDeliveryRow failed — batchId=${batchId} err=${err instanceof Error ? err.message : String(err)}`);
    // Non-fatal: still attempt dispatch
  }

  // ── Step 5: Dispatch ──────────────────────────────────────────────────────
  let success = false;
  let lastError: string | undefined;

  if (!channelImpl) {
    lastError = `channel '${batch.channel}' not wired in digest engine`;
    console.warn(`[digest-engine] ${lastError} — batchId=${batchId}`);
  } else {
    const ctx: import('./types.js').DispatchContext = {
      deliveryId,
      tenantId,
      recipientId: batch.user_id,
      recipientType: 'user',
      channel: batch.channel as import('./types.js').NotificationChannel,
      template: rendered,
      idempotencyKey,
      source: 'cron',
      severity: highestSeverity,
      sandboxMode: sandbox.enabled,
      ...(sandbox.sandboxRecipient !== undefined ? { sandboxRecipient: sandbox.sandboxRecipient } : {}),
    };

    try {
      const result = await channelImpl.dispatch(ctx);
      success = result.success;
      lastError = result.lastError;
    } catch (err) {
      lastError = `dispatch threw: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  // ── Step 6: Update batch status (G1: AND tenant_id = ?) ──────────────────
  const finalStatus = success ? 'sent' : 'failed';
  const nowFinal = Math.floor(Date.now() / 1000);

  await db
    .prepare(
      `UPDATE notification_digest_batch
       SET status    = ?,
           sent_at   = ?,
           delivery_id = ?,
           last_error = ?,
           updated_at = ?
       WHERE id = ? AND tenant_id = ?`,
    )
    .bind(
      finalStatus,
      success ? nowFinal : null,
      deliveryId,
      lastError ?? null,
      nowFinal,
      batchId,
      tenantId,
    )
    .run();

  // Update delivery status
  await updateDeliveryStatus(db, tenantId, {
    deliveryId,
    status: success ? 'dispatched' : 'failed',
    attempts: 1,
    ...(lastError ? { lastError } : {}),
  }).catch((err) => {
    console.error(`[digest-engine] updateDeliveryStatus failed — ${err instanceof Error ? err.message : String(err)}`);
  });

  // G9: Audit log
  await writeAuditLog(db, {
    tenantId,
    eventType: success ? 'notification.sent' : 'notification.failed',
    recipientId: batch.user_id,
    channel: batch.channel as import('./types.js').NotificationChannel,
    deliveryId,
    metadata: {
      batchId,
      itemCount: items.length,
      windowType: batch.window_type,
      ...(lastError ? { lastError: lastError.slice(0, 500) } : {}),
    },
  }).catch((err) => {
    console.error(`[digest-engine] writeAuditLog failed — ${err instanceof Error ? err.message : String(err)}`);
  });
}
