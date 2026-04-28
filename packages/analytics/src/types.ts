/**
 * @webwaka/analytics — Analytics types
 *
 * Phase 2: FR-AN-01..FR-AN-04
 *
 * Platform Invariants:
 *   T3  — tenant_id on all analytics queries
 *   P13 — properties_json MUST NOT contain PII (enforced by assertNoPii() in tracker.ts)
 */

// ---------------------------------------------------------------------------
// Analytics Event (written by trackEvent)
// DB table: analytics_events
// ---------------------------------------------------------------------------

export interface AnalyticsEvent {
  id: string;
  tenantId: string;
  workspaceId: string;
  eventKey: string;
  entityType: string;
  entityId: string;
  actorId: string | null;
  propertiesJson: string | null;
  occurredAt: number;
}

export interface TrackEventInput {
  tenantId: string;
  workspaceId: string;
  eventKey: string;
  entityType: string;
  entityId: string;
  actorId?: string;
  properties?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Metric aggregates (for dashboard APIs)
// ---------------------------------------------------------------------------

export interface WorkspaceMetrics {
  tenantId: string;
  workspaceId: string;
  activeGroups: number;
  totalContributionsKobo: number;
  openCases: number;
  computedAt: number;
}

export interface GroupMetrics {
  tenantId: string;
  groupId: string;
  memberCount: number;
  broadcastCount: number;
  eventCount: number;
  computedAt: number;
}

export interface CampaignMetrics {
  tenantId: string;
  campaignId: string;
  raisedKobo: number;
  contributorCount: number;
  pendingPayouts: number;
  computedAt: number;
}

// ---------------------------------------------------------------------------
// PII field guard (P13)
// ---------------------------------------------------------------------------

/** @P13 Fields forbidden from analytics_events.properties_json */
export const PII_FIELD_BLOCKLIST = [
  'donor_phone', 'pledger_phone', 'bank_account_number', 'voter_ref',
  'bvn', 'nin', 'phone', 'email', 'ip_address',
] as const;
