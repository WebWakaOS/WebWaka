/**
 * apps/notificator — Digest sweep CRON handler.
 *
 * N-012a (Phase 1, OQ-007): Queue-continued global CRON sweep.
 * CRON fires at window close time, queries pending digest batches (LIMIT 100),
 * enqueues each as a separate Queue message, and returns within 10ms.
 *
 * The Queue consumer then processes each batch independently:
 * - One batch per message
 * - One 100ms CPU budget per batch
 * - T3-safe: each Queue message contains tenant_id, all queries include AND tenant_id=?
 *
 * @see G12 — each batch message includes tenant_id (cross-tenant batch is a T3 violation)
 * @see OQ-007 — Queue-continuation pattern for unbounded scaling
 *
 * Phase 0 (N-008): Skeleton — logs CRON invocation.
 * Phase 1 (N-012a): Full batch query and Queue enqueue implemented.
 * Phase 5 (N-063, N-064): DigestEngine.processDigestBatch() wired.
 */

import type { Env } from './env.js';

export type DigestCronType = 'hourly' | 'daily' | 'weekly';

/**
 * Determine which digest window type to sweep based on the CRON expression.
 */
export function resolveDigestType(cron: string): DigestCronType | null {
  switch (cron) {
    case '0 * * * *':     return 'hourly';
    case '0 23 * * *':    return 'daily';
    case '0 23 * * 0':    return 'weekly';
    default:              return null;
  }
}

/**
 * Run the digest sweep for a given window type.
 * Called by the scheduled() handler in src/index.ts.
 *
 * Phase 0 skeleton: logs intent, no DB queries yet.
 * Phase 1 / Phase 5: queries notification_digest_batch and enqueues messages.
 */
export async function runDigestSweep(
  digestType: DigestCronType,
  env: Env,
): Promise<void> {
  console.log(`[notificator:digest] sweep starting — type=${digestType} pipeline=${env.NOTIFICATION_PIPELINE_ENABLED}`);

  if (env.NOTIFICATION_PIPELINE_ENABLED !== '1') {
    console.log('[notificator:digest] NOTIFICATION_PIPELINE_ENABLED=0 — sweep skipped');
    return;
  }

  // Phase 5 (N-063): Query up to 100 pending digest batches and enqueue each.
  // Example (to be implemented in Phase 5):
  //
  // const db = env.DB;
  // const now = Math.floor(Date.now() / 1000);
  // const pendingBatches = await db
  //   .prepare(`SELECT id, tenant_id FROM notification_digest_batch WHERE status='pending' AND window_end <= ? LIMIT 100`)
  //   .bind(now)
  //   .all<{ id: string; tenant_id: string }>();
  //
  // for (const batch of pendingBatches.results) {
  //   await env.NOTIFICATION_QUEUE.send({
  //     type: 'digest_batch',
  //     batchId: batch.id,
  //     tenantId: batch.tenant_id,   // G12: required in every Queue message
  //   });
  // }
  //
  // console.log(`[notificator:digest] enqueued ${pendingBatches.results.length} digest batches`);

  console.log(`[notificator:digest] sweep complete — type=${digestType} (Phase 5 implementation pending)`);
}

/**
 * Run the data retention sweep (N-115, Phase 8).
 * Deletes delivery logs >90 days and inbox items >365 days.
 * Called daily at 03:00 WAT (cron = "0 2 * * *").
 *
 * Phase 0 skeleton: no-op.
 * Phase 8 (N-115): Full retention CRON implemented.
 */
export async function runRetentionSweep(env: Env): Promise<void> {
  console.log('[notificator:retention] sweep starting (Phase 8 implementation pending)');
  void env;
}

/**
 * Run the Resend domain verification poll (N-053b, Phase 4).
 * Checks each unverified tenant domain against Resend API.
 * Called every 6 hours.
 *
 * Phase 0 skeleton: no-op.
 * Phase 4 (N-053b): Full verification poll implemented.
 */
export async function runDomainVerificationPoll(env: Env): Promise<void> {
  console.log('[notificator:domain-verification] poll starting (Phase 4 implementation pending)');
  void env;
}
