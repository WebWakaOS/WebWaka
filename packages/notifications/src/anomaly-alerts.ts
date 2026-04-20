/**
 * @webwaka/notifications — Delivery anomaly detection (N-110, Phase 7).
 *
 * Monitors notification_delivery rows for bounce-rate anomalies per channel
 * provider. When the bounce rate exceeds the configured threshold, returns
 * a result that the caller should surface as a `system.provider_down` event
 * (SystemEventType.SystemProviderDown in @webwaka/events).
 *
 * Guardrails:
 *   G10 — never silently discard failures; anomalies become observable events
 *   G15 — no PII in returned data; only provider name + aggregate counts
 *   G24 — cross-tenant delivery monitoring is platform-level; not tenant-scoped
 *
 * Usage pattern (in apps/notificator/src/digest.ts cron sweep):
 *   const anomalies = await checkBounceRateAnomalies(db, { windowHours: 1 });
 *   for (const anomaly of anomalies) {
 *     // publish system.provider_down event via publishEvent()
 *   }
 */

import type { D1LikeFull } from './db-types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BounceRateOptions {
  /** Time window in hours to look back (default: 1) */
  windowHours?: number;
  /** Bounce rate fraction that triggers an anomaly (default: 0.05 = 5%) */
  threshold?: number;
  /** Optional: restrict check to a specific channel (e.g. 'email', 'sms') */
  channel?: string;
}

export interface BounceAnomalyResult {
  /** Provider name from notification_delivery.provider */
  provider: string;
  /** Channel (e.g. 'email', 'sms') */
  channel: string;
  /** Total dispatched deliveries in the window */
  total: number;
  /** Failed + dead_lettered deliveries in the window */
  failed: number;
  /** Bounce rate as a fraction (0.0–1.0) */
  bounceRate: number;
  /** Threshold that was exceeded */
  threshold: number;
}

// Row shape returned by D1 query
interface ProviderStatRow {
  provider: string;
  channel: string;
  total: number;
  failed: number;
}

// ---------------------------------------------------------------------------
// checkBounceRateAnomalies — N-110
// ---------------------------------------------------------------------------

/**
 * Check bounce rate per provider+channel in a rolling time window.
 *
 * Queries notification_delivery rows where status transitioned to
 * 'failed' or 'dead_lettered' and computes the ratio against total
 * dispatched deliveries for each provider+channel combination.
 *
 * This is a platform-level health check (not tenant-scoped) — the goal is
 * to detect provider outages before they affect many tenants.
 *
 * @param db      — D1LikeFull database binding
 * @param options — windowHours, threshold, optional channel filter
 * @returns Array of BounceAnomalyResult for providers exceeding the threshold
 */
export async function checkBounceRateAnomalies(
  db: D1LikeFull,
  options: BounceRateOptions = {},
): Promise<BounceAnomalyResult[]> {
  const windowHours = options.windowHours ?? 1;
  const threshold = options.threshold ?? 0.05;
  const windowSecs = windowHours * 3600;
  const cutoff = Math.floor(Date.now() / 1000) - windowSecs;

  // Query: aggregate delivery outcomes per provider+channel in the window.
  // 'dispatched', 'delivered', 'opened', 'clicked', 'failed', 'dead_lettered'
  // all represent "dispatched" deliveries (queued → something happened).
  // We exclude 'queued', 'rendering', 'suppressed' (never actually dispatched).
  const baseQuery = `
    SELECT
      provider,
      channel,
      COUNT(*) AS total,
      SUM(CASE WHEN status IN ('failed', 'dead_lettered') THEN 1 ELSE 0 END) AS failed
    FROM notification_delivery
    WHERE
      created_at >= ?
      AND status NOT IN ('queued', 'rendering', 'suppressed')
      ${options.channel !== undefined ? 'AND channel = ?' : ''}
    GROUP BY provider, channel
    HAVING COUNT(*) >= 10
  `;

  // Minimum 10 deliveries in the window to avoid false positives from small volumes.
  // This mirrors industry practice (e.g. Resend: min 20 events for bounce rate calc).

  let stmt = db.prepare(baseQuery);
  const bound = options.channel !== undefined
    ? stmt.bind(cutoff, options.channel)
    : stmt.bind(cutoff);

  const { results } = await bound.all<ProviderStatRow>();

  const anomalies: BounceAnomalyResult[] = [];

  for (const row of results) {
    const bounceRate = row.total > 0 ? row.failed / row.total : 0;
    if (bounceRate > threshold) {
      anomalies.push({
        provider: row.provider,
        channel: row.channel,
        total: row.total,
        failed: row.failed,
        bounceRate,
        threshold,
      });
    }
  }

  return anomalies;
}
