/**
 * @webwaka/analytics — Metrics queries
 *
 * Phase 2: getWorkspaceMetrics, getGroupMetrics, getCampaignMetrics
 * M12 gate: analytics dashboard shows 3 key metrics per workspace.
 *
 * Platform Invariants:
 *   T3  — tenant_id in every query predicate
 *   P13 — queries return aggregate counts, never PII fields
 */

import type { WorkspaceMetrics, GroupMetrics, CampaignMetrics } from './types.js';

export interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

/**
 * Workspace-level metrics (M12 gate: 3 key metrics):
 *   1. active_groups  — count of active groups in this workspace
 *   2. total_contributions_kobo — sum of confirmed fundraising contributions
 *   3. open_cases — count of non-resolved/non-closed cases
 *
 * @T3 tenantId predicate on all sub-queries.
 */
export async function getWorkspaceMetrics(
  db: D1Like,
  tenantId: string,
  workspaceId: string,
): Promise<WorkspaceMetrics> {
  const groupsRow = await db
    .prepare(
      `SELECT COUNT(*) as cnt FROM groups
       WHERE tenant_id = ? AND workspace_id = ? AND status = 'active'`,
    )
    .bind(tenantId, workspaceId)
    .first<{ cnt: number }>();

  const contribRow = await db
    .prepare(
      `SELECT COALESCE(SUM(amount_kobo), 0) as total
       FROM fundraising_contributions
       WHERE tenant_id = ? AND workspace_id = ? AND status = 'confirmed'`,
    )
    .bind(tenantId, workspaceId)
    .first<{ total: number }>();

  const casesRow = await db
    .prepare(
      `SELECT COUNT(*) as cnt FROM cases
       WHERE tenant_id = ? AND workspace_id = ? AND status NOT IN ('resolved','closed')`,
    )
    .bind(tenantId, workspaceId)
    .first<{ cnt: number }>();

  return {
    tenantId,
    workspaceId,
    activeGroups: groupsRow?.cnt ?? 0,
    totalContributionsKobo: contribRow?.total ?? 0,
    openCases: casesRow?.cnt ?? 0,
    computedAt: Math.floor(Date.now() / 1000),
  };
}

/**
 * Group-level metrics (FR-AN-01):
 *   member_count, broadcast_count, event_count
 */
export async function getGroupMetrics(
  db: D1Like,
  tenantId: string,
  groupId: string,
): Promise<GroupMetrics> {
  const memberRow = await db
    .prepare(
      `SELECT COUNT(*) as cnt FROM group_members
       WHERE tenant_id = ? AND group_id = ? AND status = 'active'`,
    )
    .bind(tenantId, groupId)
    .first<{ cnt: number }>();

  const broadcastRow = await db
    .prepare(
      `SELECT COUNT(*) as cnt FROM group_broadcasts
       WHERE tenant_id = ? AND group_id = ?`,
    )
    .bind(tenantId, groupId)
    .first<{ cnt: number }>();

  const eventRow = await db
    .prepare(
      `SELECT COUNT(*) as cnt FROM analytics_events
       WHERE tenant_id = ? AND entity_type = 'group' AND entity_id = ?`,
    )
    .bind(tenantId, groupId)
    .first<{ cnt: number }>();

  return {
    tenantId,
    groupId,
    memberCount: memberRow?.cnt ?? 0,
    broadcastCount: broadcastRow?.cnt ?? 0,
    eventCount: eventRow?.cnt ?? 0,
    computedAt: Math.floor(Date.now() / 1000),
  };
}

/**
 * Campaign-level metrics (FR-AN-02):
 *   raised_kobo, contributor_count, pending_payouts
 */
export async function getCampaignMetrics(
  db: D1Like,
  tenantId: string,
  campaignId: string,
): Promise<CampaignMetrics> {
  const raisedRow = await db
    .prepare(
      `SELECT COALESCE(SUM(amount_kobo), 0) as total, COUNT(*) as cnt
       FROM fundraising_contributions
       WHERE tenant_id = ? AND campaign_id = ? AND status = 'confirmed'`,
    )
    .bind(tenantId, campaignId)
    .first<{ total: number; cnt: number }>();

  const payoutsRow = await db
    .prepare(
      `SELECT COUNT(*) as cnt FROM fundraising_payout_requests
       WHERE tenant_id = ? AND campaign_id = ? AND status = 'pending'`,
    )
    .bind(tenantId, campaignId)
    .first<{ cnt: number }>();

  return {
    tenantId,
    campaignId,
    raisedKobo: raisedRow?.total ?? 0,
    contributorCount: raisedRow?.cnt ?? 0,
    pendingPayouts: payoutsRow?.cnt ?? 0,
    computedAt: Math.floor(Date.now() / 1000),
  };
}
