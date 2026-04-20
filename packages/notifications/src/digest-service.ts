/**
 * @webwaka/notifications — DigestService (N-063, Phase 5).
 *
 * Manages notification_digest_batch rows and their associated items.
 * Called from NotificationService.processEvent() when a recipient's preference
 * has digestWindow !== 'none'.
 *
 * Design decisions:
 *   - findOrCreateDigestBatch() is idempotent: uses INSERT OR IGNORE + SELECT
 *     so concurrent consumer calls for the same window produce one batch.
 *   - Window bounds are computed in UTC for hourly/daily/weekly using simple
 *     floor arithmetic — consistent with the CRON schedule in wrangler.toml.
 *   - G1: tenant_id included in EVERY query.
 *   - G12: every digest Queue message must carry tenant_id (enforced by caller
 *     in digest.ts sweepPendingBatches).
 *
 * Guardrails:
 *   G1  — tenant_id in all D1 queries
 *   G12 — T3 tenant isolation; cross-tenant batching is a T3 violation
 */

import type { D1LikeFull } from './db-types.js';

// ---------------------------------------------------------------------------
// DigestWindowType — matches notification_digest_batch.window_type CHECK
// ---------------------------------------------------------------------------

export type DigestWindowType = 'hourly' | 'daily' | 'weekly';

// ---------------------------------------------------------------------------
// DigestBatchChannel — channels that support digesting
// ---------------------------------------------------------------------------

export type DigestBatchChannel = 'email' | 'push' | 'in_app';

// ---------------------------------------------------------------------------
// Window bound computation
// ---------------------------------------------------------------------------

const HOUR_S  = 3_600;
const DAY_S   = 86_400;
const WEEK_S  = 7 * DAY_S;

/**
 * Compute [windowStart, windowEnd) bounds (Unix seconds) for the current
 * digest window based on UTC floor arithmetic.
 *
 * hourly → floor to current hour
 * daily  → floor to midnight UTC of the current day
 * weekly → floor to Monday 00:00:00 UTC of the current week
 */
export function getWindowBounds(
  windowType: DigestWindowType,
  nowMs: number = Date.now(),
): { windowStart: number; windowEnd: number } {
  const nowSec = Math.floor(nowMs / 1000);

  switch (windowType) {
    case 'hourly': {
      const windowStart = nowSec - (nowSec % HOUR_S);
      return { windowStart, windowEnd: windowStart + HOUR_S };
    }
    case 'daily': {
      const windowStart = nowSec - (nowSec % DAY_S);
      return { windowStart, windowEnd: windowStart + DAY_S };
    }
    case 'weekly': {
      // Monday = ISO day 1; Sunday = 0 in JS getDay()
      const dayOfWeek = new Date(nowMs).getUTCDay(); // 0=Sun, 1=Mon, …, 6=Sat
      const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStartSec = nowSec - (nowSec % DAY_S) - daysSinceMonday * DAY_S;
      return { windowStart: weekStartSec, windowEnd: weekStartSec + WEEK_S };
    }
  }
}

// ---------------------------------------------------------------------------
// FindOrCreateParams
// ---------------------------------------------------------------------------

export interface FindOrCreateDigestBatchParams {
  tenantId: string;          // G1, G12
  userId: string;
  channel: DigestBatchChannel;
  windowType: DigestWindowType;
  nowMs?: number;            // injectable for tests
}

// ---------------------------------------------------------------------------
// findOrCreateDigestBatch — idempotent batch acquisition (N-063)
// ---------------------------------------------------------------------------

/**
 * Find an existing pending digest batch for the user+channel+window,
 * or create one if none exists.
 *
 * Returns the batchId.
 *
 * G1: ALL queries include AND tenant_id = ?
 * G12: tenantId is included in every digest Queue message by the caller.
 */
export async function findOrCreateDigestBatch(
  db: D1LikeFull,
  params: FindOrCreateDigestBatchParams,
): Promise<string> {
  const { tenantId, userId, channel, windowType, nowMs } = params;
  const { windowStart, windowEnd } = getWindowBounds(windowType, nowMs);

  // Try to find an existing pending batch for this exact window
  const existing = await db
    .prepare(
      `SELECT id FROM notification_digest_batch
       WHERE tenant_id   = ?
         AND user_id     = ?
         AND channel     = ?
         AND window_type = ?
         AND window_start = ?
         AND window_end   = ?
         AND status       = 'pending'
       LIMIT 1`,
    )
    .bind(tenantId, userId, channel, windowType, windowStart, windowEnd)
    .first<{ id: string }>();

  if (existing?.id) {
    return existing.id;
  }

  // Create a new batch — use INSERT OR IGNORE for race-condition safety
  const batchId = `digest_${crypto.randomUUID().replace(/-/g, '')}`;
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(
      `INSERT OR IGNORE INTO notification_digest_batch
         (id, tenant_id, user_id, channel, window_type, window_start, window_end,
          status, item_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 0, ?, ?)`,
    )
    .bind(batchId, tenantId, userId, channel, windowType, windowStart, windowEnd, now, now)
    .run();

  // After OR IGNORE, re-query to get the winning row (another Worker may have won the race)
  const winner = await db
    .prepare(
      `SELECT id FROM notification_digest_batch
       WHERE tenant_id   = ?
         AND user_id     = ?
         AND channel     = ?
         AND window_type = ?
         AND window_start = ?
         AND window_end   = ?
         AND status       = 'pending'
       LIMIT 1`,
    )
    .bind(tenantId, userId, channel, windowType, windowStart, windowEnd)
    .first<{ id: string }>();

  return winner?.id ?? batchId;
}

// ---------------------------------------------------------------------------
// AddToDigestBatchParams
// ---------------------------------------------------------------------------

export interface AddToDigestBatchParams {
  batchId: string;
  tenantId: string;             // G1, G12
  notificationEventId: string;
  userId: string;
  eventKey: string;
  title: string;
  bodySummary: string;          // ≤140 chars; truncated if longer
  ctaUrl?: string;
  severity?: 'info' | 'warning' | 'critical';
}

// ---------------------------------------------------------------------------
// addToDigestBatch — insert a batch item and increment item_count (N-063)
// ---------------------------------------------------------------------------

/**
 * Add a notification event to an existing digest batch.
 * Updates notification_digest_batch.item_count atomically.
 *
 * G1: BOTH queries include AND tenant_id = ?
 */
export async function addToDigestBatch(
  db: D1LikeFull,
  params: AddToDigestBatchParams,
): Promise<void> {
  const {
    batchId, tenantId, notificationEventId, userId, eventKey,
    title, bodySummary, severity = 'info',
  } = params;
  const ctaUrl = params.ctaUrl ?? null;

  const itemId = `ditem_${crypto.randomUUID().replace(/-/g, '')}`;
  const now = Math.floor(Date.now() / 1000);

  // Truncate bodySummary to 140 chars (spec requirement)
  const summary = bodySummary.length > 140
    ? bodySummary.slice(0, 137) + '…'
    : bodySummary;

  // Insert the item — G1: tenant_id in query
  await db
    .prepare(
      `INSERT OR IGNORE INTO notification_digest_batch_item
         (id, digest_batch_id, notification_event_id, tenant_id, user_id,
          title, body_summary, cta_url, event_key, severity, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(itemId, batchId, notificationEventId, tenantId, userId, title, summary, ctaUrl, eventKey, severity, now)
    .run();

  // Increment item_count on the batch — G1: AND tenant_id = ?
  await db
    .prepare(
      `UPDATE notification_digest_batch
       SET item_count = item_count + 1, updated_at = ?
       WHERE id = ? AND tenant_id = ?`,
    )
    .bind(now, batchId, tenantId)
    .run();
}

// ---------------------------------------------------------------------------
// DigestService — class wrapper for DI
// ---------------------------------------------------------------------------

/**
 * DigestService wraps findOrCreateDigestBatch and addToDigestBatch
 * for dependency injection and testability.
 */
export class DigestService {
  constructor(private readonly db: D1LikeFull) {}

  findOrCreateBatch(params: FindOrCreateDigestBatchParams): Promise<string> {
    return findOrCreateDigestBatch(this.db, params);
  }

  addItem(params: AddToDigestBatchParams): Promise<void> {
    return addToDigestBatch(this.db, params);
  }
}
