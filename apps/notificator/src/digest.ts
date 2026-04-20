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
import { checkBounceRateAnomalies } from '@webwaka/notifications';
import type { D1LikeFull } from '@webwaka/notifications';

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

  // N-110 (Phase 7): Bounce rate anomaly detection — run once per digest sweep.
  // If bounce rate > 5% for any provider+channel, log a warning for ops.
  // Callers with full pipeline access should surface this as system.provider_down.
  try {
    const db = env.DB as unknown as D1LikeFull;
    const anomalies = await checkBounceRateAnomalies(db, { windowHours: 1, threshold: 0.05 });
    for (const anomaly of anomalies) {
      console.warn(
        `[notificator:anomaly] G24/N-110 BOUNCE RATE EXCEEDED — ` +
        `provider=${anomaly.provider} channel=${anomaly.channel} ` +
        `rate=${(anomaly.bounceRate * 100).toFixed(1)}% ` +
        `(${anomaly.failed}/${anomaly.total} in last 1h) — ` +
        `system.provider_down event should be raised`,
      );
    }
    if (anomalies.length > 0) {
      console.warn(
        `[notificator:anomaly] ${anomalies.length} provider(s) exceeded bounce threshold — ` +
        'check channel provider health dashboard',
      );
    }
  } catch (err) {
    // Anomaly check failure must not abort the digest sweep (non-critical observability path).
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[notificator:anomaly] bounce rate check failed — ${msg}`);
  }
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
// runDomainVerificationPoll — N-053b (Phase 4)
// ---------------------------------------------------------------------------

/**
 * D1Like for domain verification poll — extended with bind() + run/first/all
 */
interface D1ForDomainPoll {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      all<T>(): Promise<{ results: T[] }>;
      run(): Promise<{ success: boolean }>;
    };
  };
}

interface ChannelProviderRow {
  id: string;
  tenant_id: string;
  custom_from_domain: string;
  domain_verification_token: string | null;
}

interface ResendDomainResponse {
  id?: string;
  status?: string;
  records?: Array<{
    type: string;
    name: string;
    value: string;
    status: 'verified' | 'not_started' | 'pending';
  }>;
}

/**
 * Run the Resend domain verification poll (N-053b, Phase 4).
 *
 * Queries channel_provider rows with unverified custom email domains and
 * polls the Resend API to check if the domain's DNS records are verified.
 * Called every 6 hours (cron: runs at minute 0 every 6th hour).
 *
 * Flow per domain:
 *   1. GET https://api.resend.com/domains/{domain} (using domain name as ID)
 *   2. If status === 'verified' → UPDATE custom_from_domain_verified = 1
 *   3. Update domain_last_checked_at in both cases
 *
 * Guardrails:
 *   G1: tenant_id in all queries
 *   LIMIT 20 per poll (CF Worker CPU budget)
 *   Checks only rows where domain_last_checked_at < (now - 6h) to avoid hammering the API
 */
export async function runDomainVerificationPoll(env: Env): Promise<void> {
  console.log('[notificator:domain-verification] poll starting');

  if (env.NOTIFICATION_PIPELINE_ENABLED !== '1') {
    console.log('[notificator:domain-verification] pipeline disabled — poll skipped');
    return;
  }

  const apiKey = env.RESEND_API_KEY_FOR_DOMAIN_POLL ?? env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[notificator:domain-verification] no Resend API key configured — poll skipped');
    return;
  }

  await pollUnverifiedDomains(env.DB as unknown as D1ForDomainPoll, apiKey);
}

/**
 * Core implementation — extracted for testability.
 */
export async function pollUnverifiedDomains(
  db: D1ForDomainPoll,
  resendApiKey: string,
): Promise<void> {
  const sixHoursAgo = Math.floor(Date.now() / 1000) - 21600;

  const { results: unverified } = await db
    .prepare(
      `SELECT id, tenant_id, custom_from_domain, domain_verification_token
       FROM channel_provider
       WHERE channel = 'email'
         AND custom_from_domain IS NOT NULL
         AND custom_from_domain_verified = 0
         AND (domain_last_checked_at IS NULL OR domain_last_checked_at < ?)
       LIMIT 20`,
    )
    .bind(sixHoursAgo)
    .all<ChannelProviderRow>();

  if (unverified.length === 0) {
    console.log('[notificator:domain-verification] no unverified domains to check');
    return;
  }

  let verified = 0;
  let errors = 0;
  const now = Math.floor(Date.now() / 1000);

  for (const row of unverified) {
    try {
      const isVerified = await checkResendDomainVerified(
        resendApiKey,
        row.custom_from_domain,
      );

      if (isVerified) {
        await db
          .prepare(
            `UPDATE channel_provider
             SET custom_from_domain_verified = 1, domain_last_checked_at = ?, updated_at = ?
             WHERE id = ? AND tenant_id = ?`,
          )
          .bind(now, now, row.id, row.tenant_id)
          .run();
        verified++;
        console.log(
          `[notificator:domain-verification] domain verified — ` +
          `domain=${row.custom_from_domain} tenant=${row.tenant_id}`,
        );
      } else {
        await db
          .prepare(
            `UPDATE channel_provider
             SET domain_last_checked_at = ?, updated_at = ?
             WHERE id = ? AND tenant_id = ?`,
          )
          .bind(now, now, row.id, row.tenant_id)
          .run();
      }
    } catch (err) {
      errors++;
      console.error(
        `[notificator:domain-verification] check failed — ` +
        `domain=${row.custom_from_domain} tenant=${row.tenant_id} ` +
        `err=${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  console.log(
    `[notificator:domain-verification] poll complete — ` +
    `checked=${unverified.length} newly_verified=${verified} errors=${errors}`,
  );
}

/**
 * Check Resend API to see if a domain is verified.
 *
 * Resend GET /domains/{domain_name_or_id} returns domain status.
 * A domain is considered verified when:
 *   - response.status === 'verified'
 *   - OR all DNS records have status === 'verified'
 */
async function checkResendDomainVerified(
  apiKey: string,
  domain: string,
): Promise<boolean> {
  const res = await fetch(`https://api.resend.com/domains/${encodeURIComponent(domain)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Resend GET /domains/${domain} → ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json() as ResendDomainResponse;

  if (data.status === 'verified') {
    return true;
  }

  // Check if all DNS records are individually verified
  if (data.records && data.records.length > 0) {
    return data.records.every((r) => r.status === 'verified');
  }

  return false;
}
