import { describe, it, expect, vi } from 'vitest';
import { trackEvent, assertNoPii } from './tracker.js';

// ── In-memory mock DB ──────────────────────────────────────────────────────

type Row = Record<string, unknown>;

function makeMockDb(data: {
  analyticsEvents?: Row[];
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
          };
        },
      };
    },
  };
}

const TENANT = 'ten_analytics';
const WS = 'ws_analytics';

describe('@webwaka/analytics/tracker', () => {

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

      const id = db._analyticsEvents[0]?.id as string;
      expect(id).toMatch(/^ae_/);
      expect(id.length).toBe(23); // 'ae_' + 20 chars

      const propsJson = db._analyticsEvents[0]?.properties_json as string;
      expect(JSON.parse(propsJson)).toEqual({ role: 'member', ward: 'VI' });
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

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(trackEvent(brokenDb as any, {
        tenantId: TENANT, workspaceId: WS, eventKey: 'test', entityType: 'group', entityId: 'g1',
      })).resolves.toBeUndefined();

      expect(consoleErrorSpy).toHaveBeenCalledWith('[analytics:trackEvent] non-blocking failure:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    it('inserts event with null properties_json if properties is omitted', async () => {
      const db = makeMockDb();
      await trackEvent(db as any, {
        tenantId: TENANT, workspaceId: WS, eventKey: 'test.event',
        entityType: 'test', entityId: 't_01', actorId: 'user_01',
      });
      expect(db._analyticsEvents).toHaveLength(1);
      expect(db._analyticsEvents[0]?.properties_json).toBeNull();
    });

    it('inserts event with null properties_json if properties is an empty object', async () => {
      const db = makeMockDb();
      await trackEvent(db as any, {
        tenantId: TENANT, workspaceId: WS, eventKey: 'test.event',
        entityType: 'test', entityId: 't_01', actorId: 'user_01',
        properties: {},
      });
      expect(db._analyticsEvents).toHaveLength(1);
      expect(db._analyticsEvents[0]?.properties_json).toBeNull();
    });

    it('binds null for actor_id if not provided', async () => {
      const db = makeMockDb();
      await trackEvent(db as any, {
        tenantId: TENANT, workspaceId: WS, eventKey: 'test.event',
        entityType: 'test', entityId: 't_01',
      });
      expect(db._analyticsEvents).toHaveLength(1);
      expect(db._analyticsEvents[0]?.actor_id).toBeNull();
    });
  });

});
