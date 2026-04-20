/**
 * @webwaka/notifications — Rule engine (N-021, Phase 2).
 *
 * Loads and evaluates notification_rule rows from D1 for a given event.
 *
 * Rule selection logic (per spec Section 8.1, Layer 3):
 *   1. Load tenant-specific rules first (tenant_id = tenantId, event_key = eventKey).
 *   2. If tenant-specific rules exist → use those exclusively (override semantics).
 *   3. If no tenant-specific rules → fall back to platform defaults (tenant_id IS NULL).
 *
 * Rule evaluation gates (must ALL pass for a rule to be active):
 *   - enabled = 1
 *   - severity meets min_severity threshold
 *   - feature_flag is NULL (Phase 5 wires feature flag KV lookup)
 *
 * Guardrails enforced:
 *   G1 — all D1 queries include tenant_id (T3 isolation)
 */

import type { D1LikeFull } from './db-types.js';
import type { NotificationSeverity } from './types.js';

// ---------------------------------------------------------------------------
// NotificationRuleRow — shape from notification_rule table
// ---------------------------------------------------------------------------

export interface NotificationRuleRow {
  id: string;
  tenant_id: string | null;
  event_key: string;
  rule_name: string;
  enabled: 0 | 1;
  audience_type: string;
  audience_filter: string | null;
  channels: string;
  channel_fallback: string | null;
  template_family: string;
  priority: string;
  digest_eligible: 0 | 1;
  min_severity: string;
  feature_flag: string | null;
}

// ---------------------------------------------------------------------------
// Severity ordering — critical > warning > info
// ---------------------------------------------------------------------------

const SEVERITY_ORDER: Record<string, number> = {
  info: 0,
  warning: 1,
  critical: 2,
};

/**
 * Returns true if the event severity meets the rule's min_severity threshold.
 * e.g. event severity 'warning' satisfies min_severity='info' and 'warning'
 * but NOT 'critical'.
 */
function meetsSeverityThreshold(
  eventSeverity: string,
  minSeverity: string,
): boolean {
  const eventLevel = SEVERITY_ORDER[eventSeverity] ?? 0;
  const minLevel = SEVERITY_ORDER[minSeverity] ?? 0;
  return eventLevel >= minLevel;
}

// ---------------------------------------------------------------------------
// loadMatchingRules
// ---------------------------------------------------------------------------

/**
 * Load all qualifying notification_rule rows for a given event + tenant.
 *
 * Strategy:
 *   - Query tenant-specific rules (tenant_id = tenantId, event_key = eventKey).
 *   - If any tenant-specific rules exist, return those (tenant overrides platform).
 *   - Otherwise query platform rules (tenant_id IS NULL, event_key = eventKey).
 *
 * @param db       - D1LikeFull database binding (G1: tenant_id in every query)
 * @param eventKey - e.g. 'auth.user.registered'
 * @param tenantId - The tenant context for this notification (G1 required)
 * @returns        - Array of matching rule rows (may be empty if none configured)
 */
export async function loadMatchingRules(
  db: D1LikeFull,
  eventKey: string,
  tenantId: string,
): Promise<NotificationRuleRow[]> {
  // 1. Load tenant-specific rules first (G1: tenant_id = tenantId)
  const tenantResult = await db
    .prepare(
      `SELECT id, tenant_id, event_key, rule_name, enabled,
              audience_type, audience_filter, channels, channel_fallback,
              template_family, priority, digest_eligible, min_severity, feature_flag
       FROM notification_rule
       WHERE tenant_id = ? AND event_key = ?
       ORDER BY priority DESC, id ASC`,
    )
    .bind(tenantId, eventKey)
    .all<NotificationRuleRow>();

  if (tenantResult.results.length > 0) {
    // Tenant-specific rules exist → tenant overrides platform completely
    return tenantResult.results;
  }

  // 2. Fall back to platform defaults (tenant_id IS NULL)
  const platformResult = await db
    .prepare(
      `SELECT id, tenant_id, event_key, rule_name, enabled,
              audience_type, audience_filter, channels, channel_fallback,
              template_family, priority, digest_eligible, min_severity, feature_flag
       FROM notification_rule
       WHERE tenant_id IS NULL AND event_key = ?
       ORDER BY priority DESC, id ASC`,
    )
    .bind(eventKey)
    .all<NotificationRuleRow>();

  return platformResult.results;
}

// ---------------------------------------------------------------------------
// evaluateRule
// ---------------------------------------------------------------------------

/**
 * Evaluate whether a single rule should fire for the given event severity.
 *
 * Gates checked:
 *   1. enabled = 1 (admin/tenant can disable rules)
 *   2. min_severity threshold met (G12: critical always fires regardless of quiet hours,
 *      but severity gate here determines if rule fires at all)
 *   3. feature_flag IS NULL (Phase 5 adds KV lookup for non-null feature flags)
 *
 * @param rule     - The rule row to evaluate
 * @param severity - The event's severity ('info' | 'warning' | 'critical')
 * @returns        - true if this rule should produce deliveries
 */
export function evaluateRule(
  rule: NotificationRuleRow,
  severity: NotificationSeverity,
): boolean {
  // Gate 1: rule must be enabled
  if (rule.enabled !== 1) {
    return false;
  }

  // Gate 2: event severity must meet the rule's min_severity threshold
  if (!meetsSeverityThreshold(severity, rule.min_severity)) {
    return false;
  }

  // Gate 3: feature_flag — Phase 5 will look up KV. For now, skip if set.
  // This is a safe conservative default: unknown feature flags = disabled.
  if (rule.feature_flag !== null) {
    // TODO Phase 5 (N-062): resolve feature_flag from NOTIFICATION_KV
    // For now: platform seeded rules have feature_flag = NULL so this is fine.
    return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// parseChannels
// ---------------------------------------------------------------------------

/**
 * Parse the JSON channels array from a rule row.
 * Returns empty array on parse failure (safe default — no channels = no dispatch).
 */
export function parseChannels(channelsJson: string): string[] {
  try {
    const parsed = JSON.parse(channelsJson);
    if (Array.isArray(parsed)) {
      return parsed.filter((c): c is string => typeof c === 'string');
    }
    return [];
  } catch {
    return [];
  }
}
