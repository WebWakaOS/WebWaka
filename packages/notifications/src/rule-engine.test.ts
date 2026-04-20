/**
 * Rule engine unit tests (N-021, Phase 2).
 *
 * Tests:
 *  - loadMatchingRules: tenant override > platform default
 *  - evaluateRule: enabled/min_severity/feature_flag gates
 *  - parseChannels: valid/invalid JSON
 */

import { describe, it, expect } from 'vitest';
import { loadMatchingRules, evaluateRule, parseChannels } from './rule-engine.js';
import type { NotificationRuleRow } from './rule-engine.js';
import type { D1LikeFull } from './db-types.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRule(overrides: Partial<NotificationRuleRow> = {}): NotificationRuleRow {
  return {
    id: 'rule_test_001',
    tenant_id: null,
    event_key: 'auth.user.registered',
    rule_name: 'Test rule',
    enabled: 1,
    audience_type: 'actor',
    audience_filter: null,
    channels: '["email","in_app"]',
    channel_fallback: '["in_app"]',
    template_family: 'auth.welcome',
    priority: 'normal',
    digest_eligible: 0,
    min_severity: 'info',
    feature_flag: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// D1 fake for loadMatchingRules tests
// ---------------------------------------------------------------------------

interface FakeRow {
  tenantRows: NotificationRuleRow[];
  platformRows: NotificationRuleRow[];
}

function makeD1Fake({ tenantRows, platformRows }: FakeRow): D1LikeFull {
  let callCount = 0;
  return {
    prepare: (query: string) => ({
      bind: (..._args: unknown[]) => ({
        run: async () => ({ success: true }),
        first: async () => null,
        all: async <T>() => {
          callCount++;
          // First call = tenant-specific query (has tenant_id = ?)
          if (query.includes('tenant_id = ?') && !query.includes('IS NULL')) {
            return { results: tenantRows as unknown as T[] };
          }
          // Second call = platform query (has tenant_id IS NULL)
          if (query.includes('IS NULL')) {
            return { results: platformRows as unknown as T[] };
          }
          return { results: [] };
        },
      }),
    }),
  };
}

// ---------------------------------------------------------------------------
// evaluateRule
// ---------------------------------------------------------------------------

describe('evaluateRule', () => {
  it('returns true for an enabled rule with matching severity', () => {
    const rule = makeRule({ enabled: 1, min_severity: 'info', feature_flag: null });
    expect(evaluateRule(rule, 'info')).toBe(true);
    expect(evaluateRule(rule, 'warning')).toBe(true);
    expect(evaluateRule(rule, 'critical')).toBe(true);
  });

  it('returns false when enabled = 0', () => {
    const rule = makeRule({ enabled: 0 });
    expect(evaluateRule(rule, 'info')).toBe(false);
  });

  it('returns false when severity below min_severity threshold', () => {
    const rule = makeRule({ min_severity: 'warning', feature_flag: null });
    expect(evaluateRule(rule, 'info')).toBe(false);
    expect(evaluateRule(rule, 'warning')).toBe(true);
    expect(evaluateRule(rule, 'critical')).toBe(true);
  });

  it('returns false when min_severity is critical and event is warning', () => {
    const rule = makeRule({ min_severity: 'critical', feature_flag: null });
    expect(evaluateRule(rule, 'warning')).toBe(false);
    expect(evaluateRule(rule, 'critical')).toBe(true);
  });

  it('returns false when feature_flag is set (Phase 5 stub)', () => {
    const rule = makeRule({ feature_flag: 'SOME_FLAG', min_severity: 'info' });
    expect(evaluateRule(rule, 'info')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// parseChannels
// ---------------------------------------------------------------------------

describe('parseChannels', () => {
  it('parses a valid JSON array', () => {
    expect(parseChannels('["email","in_app"]')).toEqual(['email', 'in_app']);
    expect(parseChannels('["sms"]')).toEqual(['sms']);
  });

  it('returns empty array for invalid JSON', () => {
    expect(parseChannels('not-json')).toEqual([]);
    expect(parseChannels('')).toEqual([]);
    expect(parseChannels('null')).toEqual([]);
  });

  it('filters out non-string entries', () => {
    expect(parseChannels('[1, "email", null, "in_app"]')).toEqual(['email', 'in_app']);
  });
});

// ---------------------------------------------------------------------------
// loadMatchingRules
// ---------------------------------------------------------------------------

describe('loadMatchingRules', () => {
  it('returns tenant-specific rules when they exist (override platform)', async () => {
    const tenantRule = makeRule({ id: 'rule_tenant', tenant_id: 'tenant_001' });
    const platformRule = makeRule({ id: 'rule_platform', tenant_id: null });
    const db = makeD1Fake({ tenantRows: [tenantRule], platformRows: [platformRule] });

    const rules = await loadMatchingRules(db, 'auth.user.registered', 'tenant_001');
    expect(rules).toHaveLength(1);
    expect(rules[0]!.id).toBe('rule_tenant');
  });

  it('falls back to platform rules when no tenant rules exist', async () => {
    const platformRule = makeRule({ id: 'rule_platform', tenant_id: null });
    const db = makeD1Fake({ tenantRows: [], platformRows: [platformRule] });

    const rules = await loadMatchingRules(db, 'auth.user.registered', 'tenant_001');
    expect(rules).toHaveLength(1);
    expect(rules[0]!.id).toBe('rule_platform');
  });

  it('returns empty array when no rules match', async () => {
    const db = makeD1Fake({ tenantRows: [], platformRows: [] });
    const rules = await loadMatchingRules(db, 'unknown.event', 'tenant_001');
    expect(rules).toHaveLength(0);
  });

  it('returns multiple rules when multiple exist', async () => {
    const r1 = makeRule({ id: 'rule_p1' });
    const r2 = makeRule({ id: 'rule_p2' });
    const db = makeD1Fake({ tenantRows: [], platformRows: [r1, r2] });
    const rules = await loadMatchingRules(db, 'auth.user.registered', 'tenant_001');
    expect(rules).toHaveLength(2);
  });
});
