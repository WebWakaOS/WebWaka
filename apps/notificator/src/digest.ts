/**
 * apps/notificator — Digest sweep CRON handler (N-012a, Phase 1).
 *
 * runDigestSweep(): queries notification_digest_batch for pending batches
 * whose window has closed (window_end <= now), and enqueues each as a
 * separate Queue message for independent consumer processing (OQ-007 pattern).
 *
 * Design decisions:
 *   - LIMIT 100 per sweep: CF Worker CPU budget constraint
 *   - Queue-continuation: CRON enqueues, consumer processes (decoupled)
 *   - Each Queue message carries tenant_id (G12: cross-tenant batch is T3 violation)
 *   - sweepPendingBatches() accepts duck-typed DB + Queue for testability
 *
 * Phase 1 (N-012a): Full sweep query + Queue enqueue implemented.
 * Phase 5 (N-063, N-064): DigestEngine.processDigestBatch() wired to consumer.
 *
 * Guardrails enforced:
 *   G1  — all D1 queries include tenant_id in returned rows
 *   G12 — each Queue message must include tenant_id (T3 isolation)
 */

import type { Env } from './env.js';

export type DigestCronType = 'hourly' | 'daily' | 'weekly';

// ---------------------------------------------------------------------------
// D1Like — duck-typed D1Database for testability
// ---------------------------------------------------------------------------

interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): {
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

// ---------------------------------------------------------------------------
// DigestQueueMessage — shape sent per pending batch
// ---------------------------------------------------------------------------

export interface DigestQueueMessage {
  type: 'digest_batch';
  batchId: string;
  /** G12: required in every digest Queue message (T3 isolation) */
  tenantId: string;
  /** Window type — passed through for consumer logging and Phase 5 processing */
  digestType: DigestCronType;
}

// ---------------------------------------------------------------------------
// QueueLike — duck-typed CF Queue binding for testability
// ---------------------------------------------------------------------------

interface QueueLike {
  send(message: DigestQueueMessage): Promise<void>;
}

// ---------------------------------------------------------------------------
// resolveDigestType — map CRON expression to window type
// ---------------------------------------------------------------------------

/**
 * Determine which digest window type to sweep based on the CRON expression.
 * Returns null for non-digest CRON triggers (retention, domain verification).
 */
export function resolveDigestType(cron: string): DigestCronType | null {
  switch (cron) {
    case '0 * * * *':  return 'hourly';
    case '0 23 * * *': return 'daily';
    case '0 23 * * 0': return 'weekly';
    default:           return null;
  }
}

// ---------------------------------------------------------------------------
// runDigestSweep — Phase 1 (N-012a) entry point
// ---------------------------------------------------------------------------

/**
 * Run the digest sweep for a given window type.
 * Called by the scheduled() handler in src/index.ts.
 *
 * N-012a (Phase 1): Delegates to sweepPendingBatches() after kill-switch check.
 * Phase 5 (N-063): Consumer-side DigestEngine.processDigestBatch() wired.
 *
 * @param digestType - Window type (hourly | daily | weekly)
 * @param env        - Worker environment bindings
 */
export async function runDigestSweep(
  digestType: DigestCronType,
  env: Env,
): Promise<void> {
  console.log(
    `[notificator:digest] sweep starting — type=${digestType} ` +
    `pipeline=${env.NOTIFICATION_PIPELINE_ENABLED}`,
  );

  if (env.NOTIFICATION_PIPELINE_ENABLED !== '1') {
    console.log('[notificator:digest] NOTIFICATION_PIPELINE_ENABLED=0 — sweep skipped');
    return;
  }

  await sweepPendingBatches(digestType, env.DB, env.NOTIFICATION_QUEUE);
}

// ---------------------------------------------------------------------------
// sweepPendingBatches — testable core (accepts duck-typed DB + Queue)
// ---------------------------------------------------------------------------

/**
 * Query pending digest batches whose window has closed and enqueue each.
 *
 * Extracted from runDigestSweep() for testability — accepts duck-typed
 * DB and Queue arguments so unit tests can inject mocks without CF bindings.
 *
 * Query: notification_digest_batch WHERE status='pending'
 *           AND window_type = ? AND window_end <= ? LIMIT 100
 *
 * Per batch:
 *   - G12: tenant_id is included in every Queue message
 *   - queue.send() errors are caught per-batch — one failure does not abort
 *     the sweep for remaining batches
 *
 * @param digestType - Window type filter (matches notification_digest_batch.window_type)
 * @param db         - D1 database binding
 * @param queue      - NOTIFICATION_QUEUE binding
 */
export async function sweepPendingBatches(
  digestType: DigestCronType,
  db: D1Like,
  queue: QueueLike,
): Promise<void> {
  // Unix timestamp in seconds — used to filter batches whose window has closed.
  const now = Math.floor(Date.now() / 1000);

  const { results: pendingBatches } = await db
    .prepare(
      `SELECT id, tenant_id
       FROM notification_digest_batch
       WHERE status = 'pending'
         AND window_type = ?
         AND window_end <= ?
       LIMIT 100`,
    )
    .bind(digestType, now)
    .all<{ id: string; tenant_id: string }>();

  if (pendingBatches.length === 0) {
    console.log(`[notificator:digest] no pending batches — type=${digestType}`);
    return;
  }

  let enqueued = 0;
  const errors: string[] = [];

  for (const batch of pendingBatches) {
    try {
      // G12: tenant_id is required in every digest Queue message (T3 isolation).
      await queue.send({
        type: 'digest_batch',
        batchId: batch.id,
        tenantId: batch.tenant_id,
        digestType,
      });
      enqueued++;
    } catch (err) {
      // Per-batch error: log and continue to enqueue remaining batches.
      // Failed batches remain 'pending' and will be picked up in the next sweep.
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`batchId=${batch.id}: ${msg}`);
      console.error(
        `[notificator:digest] failed to enqueue batchId=${batch.id} ` +
        `tenant=${batch.tenant_id} — ${msg}`,
      );
    }
  }

  console.log(
    `[notificator:digest] sweep complete — type=${digestType} ` +
    `found=${pendingBatches.length} enqueued=${enqueued} errors=${errors.length}`,
  );

  if (errors.length > 0) {
    // Log all enqueue failures for ops visibility. Non-fatal — next CRON retry
    // will pick up any batches that failed to enqueue.
    console.error('[notificator:digest] enqueue errors:', errors);
  }
}

// ---------------------------------------------------------------------------
// runRetentionSweep — Phase 8 stub (N-115)
// ---------------------------------------------------------------------------

/**
 * Run the data retention sweep (N-115, Phase 8).
 * Deletes delivery logs >90 days and inbox items >365 days.
 * Called daily at 03:00 WAT (cron = '0 2 * * *').
 *
 * Phase 1 skeleton: no-op.
 * Phase 8 (N-115): Full retention CRON implemented.
 */
export async function runRetentionSweep(env: Env): Promise<void> {
  console.log('[notificator:retention] sweep starting (Phase 8 implementation pending)');
  void env;
}

// ---------------------------------------------------------------------------
// runDomainVerificationPoll — Phase 4 stub (N-053b)
// ---------------------------------------------------------------------------

/**
 * Run the Resend domain verification poll (N-053b, Phase 4).
 * Checks each unverified tenant domain against Resend API.
 * Called every 6 hours (cron expression: every-6h, i.e. minute=0 every 6th hour).
 *
 * Phase 1 skeleton: no-op.
 * Phase 4 (N-053b): Full verification poll implemented.
 */
export async function runDomainVerificationPoll(env: Env): Promise<void> {
  console.log('[notificator:domain-verification] poll starting (Phase 4 implementation pending)');
  void env;
}
