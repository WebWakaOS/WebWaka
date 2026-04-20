/**
 * PreferenceService test suite — N-060, N-061 (Phase 5).
 *
 * Covers:
 *   - 4-level inheritance (platform → tenant → role → user)
 *   - KV cache hit/miss
 *   - USSD-origin bypass (G21)
 *   - low_data_mode restrictions (G22)
 *   - update() upsert + KV invalidation + audit log
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  PreferenceService,
  mergePreferenceRows,
  applyOverrides,
  buildPrefCacheKey,
  type KVLike,
} from './preference-service.js';
import type { D1LikeFull } from './db-types.js';

// ---------------------------------------------------------------------------
// Test doubles
// ---------------------------------------------------------------------------

function makeKV(initial: Record<string, string> = {}): KVLike & { store: Map<string, string> } {
  const store = new Map(Object.entries(initial));
  return {
    store,
    async get(key: string) { return store.get(key) ?? null; },
    async put(key: string, value: string) { store.set(key, value); },
    async delete(key: string) { store.delete(key); },
  };
}

function makeDB(rows: Record<string, unknown>[], userRole = 'member'): D1LikeFull {
  return {
    prepare(sql: string) {
      return {
        bind(..._args: unknown[]) {
          // Distinguish user role query from preference query by SQL content
          if (sql.includes('FROM user')) {
            return {
              async run() { return { success: true }; },
              async first<T>() { return { role: userRole } as T; },
              async all<T>() { return { results: [] as T[] }; },
            };
          }
          if (sql.includes('notification_audit_log')) {
            return {
              async run() { return { success: true }; },
              async first<T>() { return null as T; },
              async all<T>() { return { results: [] as T[] }; },
            };
          }
          if (sql.includes('notification_preference')) {
            return {
              async run() { return { success: true }; },
              async first<T>() { return null as T; },
              async all<T>() { return { results: rows as T[] }; },
            };
          }
          return {
            async run() { return { success: true }; },
            async first<T>() { return null as T; },
            async all<T>() { return { results: [] as T[] }; },
          };
        },
      };
    },
  } as D1LikeFull;
}

// ---------------------------------------------------------------------------
// buildPrefCacheKey
// ---------------------------------------------------------------------------

describe('buildPrefCacheKey', () => {
  it('formats key with tenant prefix first (G1)', () => {
    const key = buildPrefCacheKey('tenant_abc', 'user_xyz', 'email');
    expect(key).toBe('tenant_abc:pref:user_xyz:email');
  });
});

// ---------------------------------------------------------------------------
// mergePreferenceRows
// ---------------------------------------------------------------------------

describe('mergePreferenceRows', () => {
  it('returns defaults when no rows', () => {
    const result = mergePreferenceRows([]);
    expect(result).toEqual({
      enabled: true,
      timezone: 'Africa/Lagos',
      digestWindow: 'none',
      lowDataMode: false,
    });
  });

  it('platform → user: user scope wins for enabled', () => {
    const rows = [
      { scope_type: 'platform', enabled: 1, quiet_hours_start: null, quiet_hours_end: null, timezone: 'Africa/Lagos', digest_window: 'none', low_data_mode: 0 },
      { scope_type: 'tenant',   enabled: 0, quiet_hours_start: null, quiet_hours_end: null, timezone: 'Africa/Lagos', digest_window: 'none', low_data_mode: 0 },
      { scope_type: 'user',     enabled: 1, quiet_hours_start: 22,   quiet_hours_end: 6,    timezone: 'Africa/Lagos', digest_window: 'daily', low_data_mode: 0 },
    ];
    const result = mergePreferenceRows(rows);
    expect(result.enabled).toBe(true);       // user overrides tenant's 0
    expect(result.digestWindow).toBe('daily');
    expect(result.quietHoursStart).toBe(22);
    expect(result.quietHoursEnd).toBe(6);
  });

  it('quiet hours from parent are cleared when user scope has none set', () => {
    const rows = [
      { scope_type: 'platform', enabled: 1, quiet_hours_start: 22, quiet_hours_end: 6, timezone: 'Africa/Lagos', digest_window: 'none', low_data_mode: 0 },
      { scope_type: 'user',     enabled: 1, quiet_hours_start: null, quiet_hours_end: null, timezone: 'Africa/Lagos', digest_window: 'none', low_data_mode: 0 },
    ];
    const result = mergePreferenceRows(rows);
    expect(result.quietHoursStart).toBeUndefined();
    expect(result.quietHoursEnd).toBeUndefined();
  });

  it('lowDataMode: 1 row sets flag', () => {
    const rows = [
      { scope_type: 'user', enabled: 1, quiet_hours_start: null, quiet_hours_end: null, timezone: 'Africa/Lagos', digest_window: 'none', low_data_mode: 1 },
    ];
    expect(mergePreferenceRows(rows).lowDataMode).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// applyOverrides
// ---------------------------------------------------------------------------

describe('applyOverrides', () => {
  it('G21: ussd_gateway + sms clears quiet hours', () => {
    const pref = { enabled: true, timezone: 'Africa/Lagos', digestWindow: 'none' as const, lowDataMode: false, quietHoursStart: 22, quietHoursEnd: 6 };
    const result = applyOverrides(pref, 'sms', 'ussd_gateway');
    expect(result.quietHoursStart).toBeUndefined();
    expect(result.quietHoursEnd).toBeUndefined();
  });

  it('G21: ussd_gateway + email does NOT clear quiet hours', () => {
    const pref = { enabled: true, timezone: 'Africa/Lagos', digestWindow: 'none' as const, lowDataMode: false, quietHoursStart: 22, quietHoursEnd: 6 };
    const result = applyOverrides(pref, 'email', 'ussd_gateway');
    expect(result.quietHoursStart).toBe(22);
  });

  it('G22: low_data_mode + push → enabled forced false', () => {
    const pref = { enabled: true, timezone: 'Africa/Lagos', digestWindow: 'none' as const, lowDataMode: true };
    const result = applyOverrides(pref, 'push', 'api');
    expect(result.enabled).toBe(false);
  });

  it('G22: low_data_mode + sms → enabled unchanged (caller checks severity)', () => {
    const pref = { enabled: true, timezone: 'Africa/Lagos', digestWindow: 'none' as const, lowDataMode: true };
    const result = applyOverrides(pref, 'sms', 'api');
    expect(result.enabled).toBe(true);      // SMS gated by severity in NotificationService
    expect(result.lowDataMode).toBe(true);  // caller can inspect this
  });
});

// ---------------------------------------------------------------------------
// PreferenceService.resolve()
// ---------------------------------------------------------------------------

describe('PreferenceService.resolve()', () => {
  it('returns cached preference on KV hit (no DB query)', async () => {
    const cachedPref = { enabled: true, timezone: 'Africa/Lagos', digestWindow: 'none', lowDataMode: false };
    const kv = makeKV({ 'ten_1:pref:usr_1:email': JSON.stringify(cachedPref) });
    const dbSpy = vi.fn();
    const db = { prepare: dbSpy } as unknown as D1LikeFull;

    const svc = new PreferenceService(db, kv);
    const result = await svc.resolve('ten_1', 'usr_1', 'email', 'api');

    expect(result.enabled).toBe(true);
    expect(dbSpy).not.toHaveBeenCalled();
  });

  it('queries DB on KV miss and caches result', async () => {
    const kv = makeKV();
    const rows = [
      { scope_type: 'tenant', enabled: 1, quiet_hours_start: null, quiet_hours_end: null, timezone: 'Africa/Lagos', digest_window: 'none', low_data_mode: 0 },
    ];
    const db = makeDB(rows, 'member');

    const svc = new PreferenceService(db, kv);
    const result = await svc.resolve('ten_1', 'usr_1', 'email', 'api');

    expect(result.enabled).toBe(true);
    expect(kv.store.has('ten_1:pref:usr_1:email')).toBe(true);
  });

  it('applies G21 USSD override on top of cached pref (quiet hours cleared)', async () => {
    const cachedPref = { enabled: true, timezone: 'Africa/Lagos', digestWindow: 'none', lowDataMode: false, quietHoursStart: 22, quietHoursEnd: 6 };
    const kv = makeKV({ 'ten_1:pref:usr_1:sms': JSON.stringify(cachedPref) });
    const db = makeDB([], 'member');

    const svc = new PreferenceService(db, kv);
    const result = await svc.resolve('ten_1', 'usr_1', 'sms', 'ussd_gateway');

    expect(result.quietHoursStart).toBeUndefined();
    expect(result.quietHoursEnd).toBeUndefined();
  });

  it('applies G22 low_data_mode: push disabled', async () => {
    const kv = makeKV();
    const rows = [
      { scope_type: 'user', enabled: 1, quiet_hours_start: null, quiet_hours_end: null, timezone: 'Africa/Lagos', digest_window: 'none', low_data_mode: 1 },
    ];
    const db = makeDB(rows, 'member');

    const svc = new PreferenceService(db, kv);
    const result = await svc.resolve('ten_1', 'usr_1', 'push', 'api');

    expect(result.enabled).toBe(false);
  });

  it('returns defaults (enabled=true) when no preference rows exist', async () => {
    const kv = makeKV();
    const db = makeDB([], 'member');

    const svc = new PreferenceService(db, kv);
    const result = await svc.resolve('ten_1', 'usr_1', 'email', 'api');

    expect(result.enabled).toBe(true);
    expect(result.digestWindow).toBe('none');
    expect(result.lowDataMode).toBe(false);
  });

  it('handles corrupt KV cache gracefully (falls through to DB)', async () => {
    const kv = makeKV({ 'ten_1:pref:usr_1:email': 'INVALID_JSON' });
    const rows = [
      { scope_type: 'user', enabled: 0, quiet_hours_start: null, quiet_hours_end: null, timezone: 'Africa/Lagos', digest_window: 'none', low_data_mode: 0 },
    ];
    const db = makeDB(rows, 'member');

    const svc = new PreferenceService(db, kv);
    const result = await svc.resolve('ten_1', 'usr_1', 'email', 'api');

    expect(result.enabled).toBe(false); // DB row's value
  });
});

// ---------------------------------------------------------------------------
// PreferenceService.update()
// ---------------------------------------------------------------------------

describe('PreferenceService.update()', () => {
  it('invalidates KV cache after update', async () => {
    const kv = makeKV({ 'ten_1:pref:usr_1:email': '{"enabled":true,"timezone":"Africa/Lagos","digestWindow":"none","lowDataMode":false}' });
    const db = makeDB([], 'member');

    const svc = new PreferenceService(db, kv);
    await svc.update('ten_1', 'usr_1', 'user', 'email', { enabled: false }, 'actor_1');

    expect(kv.store.has('ten_1:pref:usr_1:email')).toBe(false);
  });
});
