/**
 * @webwaka/analytics — Analytics tests (Phase 2, T004)
 * 12 tests covering: trackEvent, assertNoPii, getWorkspaceMetrics, getGroupMetrics, getCampaignMetrics.
 */

import { describe, it, expect } from 'vitest';
import { trackEvent, assertNoPii } from './tracker.js';
import { getWorkspaceMetrics, getGroupMetrics, getCampaignMetrics } from './query.js';

// ── In-memory mock DB ──────────────────────────────────────────────────────

type Row = Record<string, unknown>;

function makeMockDb(data: {
  groups?: Row[];
  contributions?: Row[];
  cases?: Row[];
  groupMembers?: Row[];
  broadcasts?: Row[];
  analyticsEvents?: Row[];
  payoutRequests?: Row[];
} = {}) {
  const analyticsEvents: Row[] = data.analyticsEvents ?? [];

  return {
    _analyticsEvents: analyticsEvents,

    prepare(sql: string) {
      const lsql = sql.trim().toLowerCase();

      return {
        bind(...args: unknown[]) {
          return {
            async run() {
              if (lsql.startsWith('insert into analytics_events')) {
                analyticsEvents.push({
                  id: args[0], tenant_id: args[1], workspace_id: args[2],
                  event_key: args[3], entity_type: args[4], entity_id: args[5],
                  actor_id: args[6], properties_json: args[7], occurred_at: args[8],
                });
              }
              return { success: true };
            },

            async first<T>(): Promise<T | null> {
              if (lsql.includes('count(*) as cnt') && lsql.includes("status = 'active'") && lsql.includes('from groups')) {
                const [tenantId, workspaceId] = args as [string, string];
                const cnt = (data.groups ?? []).filter(g => g.tenant_id === tenantId && g.workspace_id === workspaceId && g.status === 'active').length;
                return { cnt } as T;
              }
              if (lsql.includes('coalesce(sum') && lsql.includes('fundraising_contributions')) {
                if (lsql.includes('workspace_id')) {
                  const [tenantId, workspaceId] = args as [string, string];
                  const items = (data.contributions ?? []).filter(c => c.tenant_id === tenantId && c.workspace_id === workspaceId && c.status === 'confirmed');
                  const total = items.reduce((s, c) => s + (c.amount_kobo as number), 0);
                  return { total, cnt: items.length } as T;
                }
                const [tId, cId] = args as [string, string];
                const items = (data.contributions ?? []).filter(c => c.tenant_id === tId && c.campaign_id === cId && c.status === 'confirmed');
                const total = items.reduce((s, c) => s + (c.amount_kobo as number), 0);
                return { total, cnt: items.length } as T;
              }
              if (lsql.includes('count(*) as cnt') && lsql.includes('from cases')) {
                const [tenantId, workspaceId] = args as [string, string];
                const cnt = (data.cases ?? []).filter(c => c.tenant_id === tenantId && c.workspace_id === workspaceId && c.status !== 'resolved' && c.status !== 'closed').length;
                return { cnt } as T;
              }
              if (lsql.includes('count(*) as cnt') && lsql.includes('from group_members')) {
                const [tenantId, groupId] = args as [string, string];
                const cnt = (data.groupMembers ?? []).filter(m => m.tenant_id === tenantId && m.group_id === groupId && m.status === 'active').length;
                return { cnt } as T;
              }
              if (lsql.includes('count(*) as cnt') && lsql.includes('from group_broadcasts')) {
                const [tenantId, groupId] = args as [string, string];
                const cnt = (data.broadcasts ?? []).filter(b => b.tenant_id === tenantId && b.group_id === groupId).length;
                return { cnt } as T;
              }
              if (lsql.includes('count(*) as cnt') && lsql.includes('from analytics_events')) {
                const [tenantId, groupId] = args as [string, string];
                const cnt = analyticsEvents.filter(e => e.tenant_id === tenantId && e.entity_id === groupId).length;
                return { cnt } as T;
              }
              if (lsql.includes('count(*) as cnt') && lsql.includes('from fundraising_payout_requests')) {
                const [tenantId, campaignId] = args as [string, string];
                const cnt = (data.payoutRequests ?? []).filter(p => p.tenant_id === tenantId && p.campaign_id === campaignId && p.status === 'pending').length;
                return { cnt } as T;
              }
              return null as T | null;
            },
            async all<T>(): Promise<{ results: T[] }> { return { results: [] }; },
          };
        },
        async first<T>(): Promise<T | null> { return null as T | null; },
        all<T>() { return Promise.resolve({ results: [] as T[] }); },
      };
    },
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────

const TENANT = 'ten_analytics';
const WS = 'ws_analytics';

describe('@webwaka/analytics', () => {

  describe('assertNoPii (P13)', () => {
    it('AN01 — passes non-PII properties unchanged', () => {
      const cleaned = assertNoPii({ group_id: 'grp_01', member_count: 50 });
      expect(cleaned).toEqual({ group_id: 'grp_01', member_count: 50 });
    });

    it('AN02 — strips donor_phone from properties (P13)', () => {
      const cleaned = assertNoPii({ donor_phone: '08012345678', amount_kobo: 100_000 });
      expect(cleaned).not.toHaveProperty('donor_phone');
      expect(cleaned).toHaveProperty('amount_kobo');
    });

    it('AN03 — strips bank_account_number (P13)', () => {
      const cleaned = assertNoPii({ bank_account_number: '0012345678', amount_kobo: 50_000 });
      expect(cleaned).not.toHaveProperty('bank_account_number');
    });

    it('AN04 — strips voter_ref (P13)', () => {
      const cleaned = assertNoPii({ voter_ref: 'hashed_ref_001', ward: 'Lagos Island' });
      expect(cleaned).not.toHaveProperty('voter_ref');
      expect(cleaned).toHaveProperty('ward');
    });

    it('AN05 — strips email (P13)', () => {
      const cleaned = assertNoPii({ email: 'user@example.com', event_key: 'test' });
      expect(cleaned).not.toHaveProperty('email');
      expect(cleaned).toHaveProperty('event_key');
    });
  });

  describe('trackEvent', () => {
    it('AN06 — inserts analytics event with safe properties', async () => {
      const db = makeMockDb();
      await trackEvent(db as any, {
        tenantId: TENANT, workspaceId: WS, eventKey: 'group.member_joined',
        entityType: 'group', entityId: 'grp_01', actorId: 'user_01',
        properties: { role: 'member', ward: 'VI' },
      });
      expect(db._analyticsEvents).toHaveLength(1);
      expect(db._analyticsEvents[0]?.event_key).toBe('group.member_joined');
    });

    it('AN07 — does not throw if DB insert fails (fire-and-forget)', async () => {
      const brokenDb = {
        prepare() {
          return {
            bind() {
              return {
                async run() { throw new Error('DB error'); },
              };
            },
          };
        },
      };
      await expect(trackEvent(brokenDb as any, {
        tenantId: TENANT, workspaceId: WS, eventKey: 'test', entityType: 'group', entityId: 'g1',
      })).resolves.toBeUndefined();
    });
  });

  describe('getWorkspaceMetrics (M12 gate: 3 key metrics)', () => {
    it('AN08 — returns 3 metrics: activeGroups, totalContributionsKobo, openCases', async () => {
      const db = makeMockDb({
        groups: [
          { tenant_id: TENANT, workspace_id: WS, status: 'active' },
          { tenant_id: TENANT, workspace_id: WS, status: 'active' },
        ],
        contributions: [
          { tenant_id: TENANT, workspace_id: WS, campaign_id: 'c1', status: 'confirmed', amount_kobo: 500_000 },
          { tenant_id: TENANT, workspace_id: WS, campaign_id: 'c1', status: 'confirmed', amount_kobo: 300_000 },
        ],
        cases: [
          { tenant_id: TENANT, workspace_id: WS, status: 'open' },
          { tenant_id: TENANT, workspace_id: WS, status: 'assigned' },
        ],
      });
      const metrics = await getWorkspaceMetrics(db as any, TENANT, WS);
      expect(metrics.activeGroups).toBe(2);
      expect(metrics.totalContributionsKobo).toBe(800_000);
      expect(metrics.openCases).toBe(2);
      expect(metrics.computedAt).toBeGreaterThan(0);
    });

    it('AN09 — returns zeros for empty workspace', async () => {
      const db = makeMockDb();
      const metrics = await getWorkspaceMetrics(db as any, TENANT, WS);
      expect(metrics.activeGroups).toBe(0);
      expect(metrics.totalContributionsKobo).toBe(0);
      expect(metrics.openCases).toBe(0);
    });
  });

  describe('getGroupMetrics', () => {
    it('AN10 — returns memberCount, broadcastCount, eventCount', async () => {
      const db = makeMockDb({
        groupMembers: [
          { tenant_id: TENANT, group_id: 'grp_x', status: 'active' },
          { tenant_id: TENANT, group_id: 'grp_x', status: 'active' },
          { tenant_id: TENANT, group_id: 'grp_x', status: 'suspended' },
        ],
        broadcasts: [
          { tenant_id: TENANT, group_id: 'grp_x' },
        ],
      });
      const metrics = await getGroupMetrics(db as any, TENANT, 'grp_x');
      expect(metrics.memberCount).toBe(2);
      expect(metrics.broadcastCount).toBe(1);
      expect(metrics.groupId).toBe('grp_x');
    });
  });

  describe('getCampaignMetrics', () => {
    it('AN11 — returns raisedKobo, contributorCount, pendingPayouts', async () => {
      const db = makeMockDb({
        contributions: [
          { tenant_id: TENANT, campaign_id: 'camp_01', status: 'confirmed', amount_kobo: 1_000_000 },
          { tenant_id: TENANT, campaign_id: 'camp_01', status: 'confirmed', amount_kobo: 500_000 },
        ],
        payoutRequests: [
          { tenant_id: TENANT, campaign_id: 'camp_01', status: 'pending' },
        ],
      });
      const metrics = await getCampaignMetrics(db as any, TENANT, 'camp_01');
      expect(metrics.raisedKobo).toBe(1_500_000);
      expect(metrics.contributorCount).toBe(2);
      expect(metrics.pendingPayouts).toBe(1);
    });

    it('AN12 — respects tenant_id isolation (T3)', async () => {
      const db = makeMockDb({
        contributions: [
          { tenant_id: 'ten_other', campaign_id: 'camp_02', status: 'confirmed', amount_kobo: 9_000_000 },
        ],
      });
      const metrics = await getCampaignMetrics(db as any, TENANT, 'camp_02');
      expect(metrics.raisedKobo).toBe(0);
      expect(metrics.contributorCount).toBe(0);
    });
  });

});
