/**
 * @webwaka/notifications — PreferenceService (N-060, N-061, Phase 5).
 *
 * Implements IPreferenceStore with 4-level inheritance:
 *   platform → tenant → role → user  (most specific wins)
 *
 * Reads are KV-cached for 300 s with tenant-prefixed keys (N-061, G1):
 *   key = `{tenant_id}:pref:{userId}:{channel}`
 *
 * G21 (OQ-009) — USSD-origin: if source='ussd_gateway' and channel='sms',
 *   quiet hours are bypassed (SMS sent immediately regardless of window).
 * G22 (OQ-011) — low_data_mode:
 *   - push   → enabled forced false
 *   - in_app → lowDataMode=true propagated (caller sets text_only_mode=1)
 *   - sms    → caller must check lowDataMode + severity='critical' before sending
 * G1  — tenant_id included in every D1 query.
 * G9  — preference changes written to notification_audit_log via update().
 */

import type { D1LikeFull } from './db-types.js';
import type {
  IPreferenceStore,
  NotificationChannel,
  PreferenceScope,
  ResolvedPreference,
} from './types.js';
import type { NotificationEventSource } from '@webwaka/events';
import { writeAuditLog } from './audit-service.js';

// ---------------------------------------------------------------------------
// KV abstraction — duck-typed for testability
// ---------------------------------------------------------------------------

export interface KVLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// DB row shape from notification_preference table (migration 0256)
// ---------------------------------------------------------------------------

interface PrefRow {
  scope_type: string;
  enabled: number;
  quiet_hours_start: number | null;
  quiet_hours_end: number | null;
  timezone: string;
  digest_window: string;
  low_data_mode: number;
}

// ---------------------------------------------------------------------------
// KV cache TTL — 5 minutes (G1: tenant-prefixed key)
// ---------------------------------------------------------------------------

const KV_TTL_SECONDS = 300;

/**
 * Build the KV cache key for a preference lookup.
 * Format: `{tenant_id}:pref:{userId}:{channel}`
 * G1: tenant_id is always the first segment.
 */
export function buildPrefCacheKey(
  tenantId: string,
  userId: string,
  channel: NotificationChannel,
): string {
  return `${tenantId}:pref:${userId}:${channel}`;
}

// ---------------------------------------------------------------------------
// mergePreferenceRows — fold platform → tenant → role → user (last wins)
// ---------------------------------------------------------------------------

/**
 * Merge preference rows from most-general to most-specific.
 * Each row overrides all fields from the previous scope level.
 * Rows must be pre-sorted: platform(1) → tenant(2) → role(3) → user(4).
 */
export function mergePreferenceRows(rows: PrefRow[]): ResolvedPreference {
  const result: ResolvedPreference = {
    enabled: true,
    timezone: 'Africa/Lagos',
    digestWindow: 'none',
    lowDataMode: false,
  };

  for (const row of rows) {
    result.enabled = row.enabled === 1;
    result.timezone = row.timezone ?? 'Africa/Lagos';
    result.digestWindow = row.digest_window as ResolvedPreference['digestWindow'];
    result.lowDataMode = row.low_data_mode === 1;

    if (row.quiet_hours_start != null) {
      result.quietHoursStart = row.quiet_hours_start;
    } else {
      delete result.quietHoursStart;
    }
    if (row.quiet_hours_end != null) {
      result.quietHoursEnd = row.quiet_hours_end;
    } else {
      delete result.quietHoursEnd;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// applyOverrides — G21 USSD-origin + G22 low_data_mode mutations
// ---------------------------------------------------------------------------

/**
 * Apply guardrail overrides to a resolved preference.
 * Mutates and returns the same object.
 *
 * G21 (OQ-009): USSD-origin + SMS → clear quiet hours (send immediately).
 * G22 (OQ-011): low_data_mode + push → force enabled=false.
 */
export function applyOverrides(
  pref: ResolvedPreference,
  channel: NotificationChannel,
  source: NotificationEventSource,
): ResolvedPreference {
  // G21: USSD gateway bypasses quiet hours for SMS
  if (source === 'ussd_gateway' && channel === 'sms') {
    delete pref.quietHoursStart;
    delete pref.quietHoursEnd;
  }

  // G22: low_data_mode → disable push channel entirely
  if (pref.lowDataMode && channel === 'push') {
    pref.enabled = false;
  }

  return pref;
}

// ---------------------------------------------------------------------------
// PreferenceService — implements IPreferenceStore
// ---------------------------------------------------------------------------

/**
 * PreferenceService implements the 4-level preference inheritance model
 * (N-060) with KV caching (N-061).
 *
 * Usage in NotificationService.processEvent():
 *   const svc = new PreferenceService(db, kv);
 *   const pref = await svc.resolve(tenantId, userId, channel, source);
 *   if (!pref.enabled) continue;               // channel disabled by user
 *   if (isInQuietHours(pref, now)) { ... }    // defer via Queue delay
 *   if (pref.digestWindow !== 'none') { ... } // route to DigestService
 */
export class PreferenceService implements IPreferenceStore {
  constructor(
    private readonly db: D1LikeFull,
    private readonly kv: KVLike,
  ) {}

  // -------------------------------------------------------------------------
  // resolve — 4-level inheritance (N-060) with KV cache (N-061)
  // -------------------------------------------------------------------------

  async resolve(
    tenantId: string,
    userId: string,
    channel: NotificationChannel,
    source: NotificationEventSource,
  ): Promise<ResolvedPreference> {
    const cacheKey = buildPrefCacheKey(tenantId, userId, channel);

    // KV cache read (N-061) — hit avoids D1 round-trips on every event
    const cached = await this.kv.get(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as ResolvedPreference;
        // Re-apply source-dependent overrides (source is NOT cached — it varies per event)
        return applyOverrides(parsed, channel, source);
      } catch {
        // Corrupt cache entry — fall through to DB query
      }
    }

    // ── Step 1: Look up user's role (needed for 'role' scope query) ─────────
    const userRow = await this.db
      .prepare('SELECT role FROM user WHERE id = ? AND tenant_id = ? LIMIT 1')
      .bind(userId, tenantId)
      .first<{ role: string | null }>();

    const userRole = userRow?.role ?? null;

    // ── Step 2: Load all matching preference rows (G1: tenantId guard) ──────
    //
    // Query selects rows that match any scope level relevant to this user.
    // If userRole is null, we use the sentinel '__NO_ROLE__' which will never
    // match a stored scope_id so the role level is simply skipped.
    //
    // Results ordered platform(1) → tenant(2) → role(3) → user(4)
    // so that the fold in mergePreferenceRows() produces "most specific wins".
    const { results } = await this.db
      .prepare(
        `SELECT scope_type, enabled, quiet_hours_start, quiet_hours_end,
                timezone, digest_window, low_data_mode
         FROM notification_preference
         WHERE tenant_id = ?
           AND channel   = ?
           AND (
             (scope_type = 'platform' AND scope_id = 'platform')
             OR (scope_type = 'tenant' AND scope_id = ?)
             OR (scope_type = 'role'   AND scope_id = ?)
             OR (scope_type = 'user'   AND scope_id = ?)
           )
         ORDER BY
           CASE scope_type
             WHEN 'platform' THEN 1
             WHEN 'tenant'   THEN 2
             WHEN 'role'     THEN 3
             WHEN 'user'     THEN 4
           END ASC`,
      )
      .bind(tenantId, channel, tenantId, userRole ?? '__NO_ROLE__', userId)
      .all<PrefRow>();

    // ── Step 3: Merge scope levels → effective preference ───────────────────
    const merged = mergePreferenceRows(results);

    // ── Step 4: Cache effective preference (source-agnostic) ─────────────────
    // We cache the preference WITHOUT source overrides applied so one cache
    // entry serves all sources (USSD override is re-applied after cache read).
    await this.kv
      .put(cacheKey, JSON.stringify(merged), { expirationTtl: KV_TTL_SECONDS })
      .catch((err) => {
        // Non-fatal — degrade gracefully if KV is unavailable
        console.warn(
          `[preference-service] KV put failed — key=${cacheKey} ` +
          `err=${err instanceof Error ? err.message : String(err)}`,
        );
      });

    // ── Step 5: Apply source-dependent overrides (G21, G22) ─────────────────
    return applyOverrides(merged, channel, source);
  }

  // -------------------------------------------------------------------------
  // update — upsert preference row + invalidate KV cache (G9)
  // -------------------------------------------------------------------------

  async update(
    tenantId: string,
    userId: string,
    scope: PreferenceScope,
    channel: NotificationChannel,
    patch: Partial<ResolvedPreference>,
    actorId: string,
  ): Promise<void> {
    const scopeId = scope === 'platform'
      ? 'platform'
      : scope === 'tenant'
        ? tenantId
        : userId;

    const now = Math.floor(Date.now() / 1000);

    // UPSERT preference row — G1: all fields include tenantId
    await this.db
      .prepare(
        `INSERT INTO notification_preference
           (id, scope_type, scope_id, tenant_id, event_key, channel,
            enabled, quiet_hours_start, quiet_hours_end, timezone,
            digest_window, low_data_mode, created_at, updated_at)
         VALUES (?, ?, ?, ?, '*', ?,  ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (scope_type, scope_id, tenant_id, event_key, channel)
         DO UPDATE SET
           enabled           = excluded.enabled,
           quiet_hours_start = excluded.quiet_hours_start,
           quiet_hours_end   = excluded.quiet_hours_end,
           timezone          = excluded.timezone,
           digest_window     = excluded.digest_window,
           low_data_mode     = excluded.low_data_mode,
           updated_at        = excluded.updated_at`,
      )
      .bind(
        `pref_${crypto.randomUUID().replace(/-/g, '')}`,
        scope,
        scopeId,
        tenantId,
        channel,
        patch.enabled === false ? 0 : 1,
        patch.quietHoursStart ?? null,
        patch.quietHoursEnd ?? null,
        patch.timezone ?? 'Africa/Lagos',
        patch.digestWindow ?? 'none',
        patch.lowDataMode ? 1 : 0,
        now,
        now,
      )
      .run();

    // Invalidate KV cache for this user (all channels share same entry per channel)
    const cacheKey = buildPrefCacheKey(tenantId, userId, channel);
    await this.kv.delete(cacheKey).catch(() => {});

    // G9: audit preference change
    await writeAuditLog(this.db, {
      tenantId,
      eventType: 'preference.changed',
      actorId,
      recipientId: userId,
      channel,
      metadata: {
        scope,
        patch: {
          enabled: patch.enabled,
          digestWindow: patch.digestWindow,
          lowDataMode: patch.lowDataMode,
          quietHoursStart: patch.quietHoursStart,
          quietHoursEnd: patch.quietHoursEnd,
          timezone: patch.timezone,
        },
      },
    }).catch((err) => {
      console.warn(
        `[preference-service] audit log failed — ` +
        `err=${err instanceof Error ? err.message : String(err)}`,
      );
    });
  }

  // -------------------------------------------------------------------------
  // invalidateCache — explicit cache bust (called from preference API)
  // -------------------------------------------------------------------------

  async invalidateCache(
    tenantId: string,
    userId: string,
    channel: NotificationChannel,
  ): Promise<void> {
    const cacheKey = buildPrefCacheKey(tenantId, userId, channel);
    await this.kv.delete(cacheKey).catch(() => {});
  }
}
