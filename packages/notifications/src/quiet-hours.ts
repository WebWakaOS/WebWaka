/**
 * @webwaka/notifications — QuietHoursService (N-062, Phase 5).
 *
 * Timezone-aware quiet hours evaluation and CF Queue delay computation.
 *
 * Design decisions:
 *   - Uses Intl.DateTimeFormat for timezone-aware hour extraction.
 *     This works in CF Workers (V8 Intl support) and Node.js ≥18.
 *   - Africa/Lagos (WAT, UTC+1) is the platform default (G11).
 *   - "Wrapping" windows supported: start=22, end=6 (22:00–06:00 next day).
 *   - G12: severity='critical' ALWAYS bypasses quiet hours (no delay).
 *   - G21: USSD-origin SMS bypasses quiet hours (handled by PreferenceService).
 *   - Queue delay is in MILLISECONDS (CF Queue `delaySeconds` param divides by 1000).
 *
 * Guardrails:
 *   G11 — quiet hours store timezone; deferred delivery via Queue delay (not suppression)
 *   G12 — severity='critical' bypasses quiet hours
 */

import type { NotificationSeverity } from './types.js';

// ---------------------------------------------------------------------------
// QuietHoursConfig — subset of ResolvedPreference fields needed here
// ---------------------------------------------------------------------------

export interface QuietHoursConfig {
  quietHoursStart?: number;   // hour 0-23
  quietHoursEnd?: number;     // hour 0-23
  timezone: string;           // IANA tz string, default 'Africa/Lagos'
}

// ---------------------------------------------------------------------------
// currentHourInTZ — extract local hour (0-23) for a given timezone
// ---------------------------------------------------------------------------

/**
 * Returns the current local hour (0-23) in the given IANA timezone.
 * Uses Intl.DateTimeFormat — supported in CF Workers + Node ≥18.
 */
export function currentHourInTZ(timezone: string, now: Date = new Date()): number {
  try {
    const formatted = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: timezone,
    }).format(now);
    // hour12:false returns '00'–'23'; '24' can appear at midnight in some locales
    const parsed = parseInt(formatted, 10);
    return Number.isNaN(parsed) ? 0 : parsed % 24;
  } catch {
    // Fallback: unknown timezone — use UTC
    return now.getUTCHours();
  }
}

// ---------------------------------------------------------------------------
// isInQuietHours — check if the current time falls within quiet window
// ---------------------------------------------------------------------------

/**
 * Returns true if the current local hour falls within [quietStart, quietEnd).
 *
 * Handles wrapping windows (e.g., 22:00 → 06:00):
 *   - Non-wrapping: start < end  → isIn = hour >= start && hour < end
 *   - Wrapping:     start >= end → isIn = hour >= start || hour < end
 *
 * Returns false if quietHoursStart or quietHoursEnd is undefined (no window set).
 *
 * G12: severity='critical' ALWAYS returns false (bypasses quiet hours entirely).
 */
export function isInQuietHours(
  config: QuietHoursConfig,
  severity: NotificationSeverity = 'info',
  now: Date = new Date(),
): boolean {
  // G12: critical severity bypasses all quiet hours
  if (severity === 'critical') return false;

  const { quietHoursStart, quietHoursEnd } = config;
  if (quietHoursStart == null || quietHoursEnd == null) return false;

  const hour = currentHourInTZ(config.timezone, now);

  if (quietHoursStart < quietHoursEnd) {
    // Non-wrapping: e.g., 22:00–06:00 becomes 22:00–24:00 + 00:00–06:00 (wrapping)
    // Here: start=08, end=18 → block 08–17
    return hour >= quietHoursStart && hour < quietHoursEnd;
  }

  if (quietHoursStart === quietHoursEnd) {
    // Edge case: zero-width window — treat as "all day blocked"
    return true;
  }

  // Wrapping: e.g., start=22, end=6 → block 22–23 OR 0–5
  return hour >= quietHoursStart || hour < quietHoursEnd;
}

// ---------------------------------------------------------------------------
// computeQueueDelayMs — ms until quiet window end (for CF Queue delay)
// ---------------------------------------------------------------------------

/**
 * Compute the delay (in milliseconds) until the quiet window ends.
 *
 * Used to set `delaySeconds` on CF Queue messages (G11):
 *   await queue.send(message, { delaySeconds: computeQueueDelayMs(...) / 1000 })
 *
 * Returns 0 if not currently in quiet hours (caller should check isInQuietHours first).
 * Returns 0 if quietHoursEnd is undefined.
 *
 * Algorithm:
 *   1. Get current minutes/seconds in target timezone.
 *   2. Compute next occurrence of quietHoursEnd o'clock.
 *   3. Return (target - now) in milliseconds.
 */
export function computeQueueDelayMs(
  config: QuietHoursConfig,
  now: Date = new Date(),
): number {
  const { quietHoursEnd } = config;
  if (quietHoursEnd == null) return 0;

  const nowMs = now.getTime();

  // Build the target datetime: today at quietHoursEnd:00:00 in the given timezone.
  // Strategy: iterate candidate dates (today + up to 2 days) until we find one
  // that is strictly in the future.
  for (let dayOffset = 0; dayOffset <= 2; dayOffset++) {
    // Get year/month/day in the target timezone for the candidate day
    const candidateDate = new Date(nowMs + dayOffset * 86_400_000);
    const parts = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: config.timezone,
    }).formatToParts(candidateDate);

    const yearStr  = parts.find(p => p.type === 'year')?.value  ?? String(candidateDate.getUTCFullYear());
    const monthStr = parts.find(p => p.type === 'month')?.value ?? String(candidateDate.getUTCMonth() + 1).padStart(2, '0');
    const dayStr   = parts.find(p => p.type === 'day')?.value   ?? String(candidateDate.getUTCDate()).padStart(2, '0');

    // ISO-8601 string for midnight local date — then add quietHoursEnd hours
    // We construct an approximate UTC epoch by subtracting tz offset.
    const tz = config.timezone;
    const targetIso = `${yearStr}-${monthStr}-${dayStr}T${String(quietHoursEnd).padStart(2, '0')}:00:00`;

    // Use Intl to figure out the UTC offset at this candidate local time
    const localCandidate = new Date(targetIso);  // parsed as local (UTC in Workers)

    // Compute the offset correction by checking what local hour would be at this UTC time
    const checkHour = currentHourInTZ(tz, localCandidate);
    const offsetHours = checkHour - quietHoursEnd;
    const targetMs = localCandidate.getTime() - offsetHours * 3_600_000;

    if (targetMs > nowMs) {
      return targetMs - nowMs;
    }
  }

  // Fallback: 1 hour
  return 3_600_000;
}

// ---------------------------------------------------------------------------
// QuietHoursService — wrapper class for DI and testability
// ---------------------------------------------------------------------------

/**
 * Thin service wrapper around the pure quiet-hours functions.
 * Allows injecting `now` for deterministic testing.
 */
export class QuietHoursService {
  constructor(private readonly getNow: () => Date = () => new Date()) {}

  isInQuietHours(config: QuietHoursConfig, severity: NotificationSeverity = 'info'): boolean {
    return isInQuietHours(config, severity, this.getNow());
  }

  computeQueueDelayMs(config: QuietHoursConfig): number {
    return computeQueueDelayMs(config, this.getNow());
  }
}
