import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackEvent, assertNoPii } from './tracker.js';

describe('tracker.ts', () => {
  describe('assertNoPii', () => {
    it('passes non-PII properties unchanged', () => {
      const cleaned = assertNoPii({ group_id: 'grp_01', member_count: 50 });
      expect(cleaned).toEqual({ group_id: 'grp_01', member_count: 50 });
    });

    it('strips direct PII fields', () => {
      const cleaned = assertNoPii({ donor_phone: '08012345678', email: 'test@example.com', amount_kobo: 100_000 });
      expect(cleaned).toEqual({ amount_kobo: 100_000 });
    });

    it('strips PII fields as suffixes/prefixes', () => {
      const cleaned = assertNoPii({ user_email: 'test@example.com', phone_number: '123', safe: true });
      expect(cleaned).toEqual({ safe: true });
    });

    it('handles undefined or null values gracefully', () => {
      const cleaned = assertNoPii({ safe: null, other: undefined, email: 'a@b.com' });
      expect(cleaned).toEqual({ safe: null, other: undefined });
    });
  });

  describe('trackEvent', () => {
    let mockConsoleError: any;

    beforeEach(() => {
      mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      mockConsoleError.mockRestore();
    });

    function makeMockDb() {
      const analyticsEvents: Record<string, unknown>[] = [];
      const db = {
        _analyticsEvents: analyticsEvents,
        prepare: vi.fn((sql: string) => {
          return {
            bind: vi.fn((...args: unknown[]) => {
              return {
                run: vi.fn().mockImplementation(async () => {
                  analyticsEvents.push({
                    id: args[0],
                    tenant_id: args[1],
                    workspace_id: args[2],
                    event_key: args[3],
                    entity_type: args[4],
                    entity_id: args[5],
                    actor_id: args[6],
                    properties_json: args[7],
                    occurred_at: args[8],
                  });
                  return { success: true };
                }),
              };
            }),
          };
        }),
      };
      return db as unknown as { _analyticsEvents: any[]; prepare: any };
    }

    it('inserts analytics event with all fields and properties', async () => {
      const db = makeMockDb();
      await trackEvent(db, {
        tenantId: 't1',
        workspaceId: 'w1',
        eventKey: 'user.login',
        entityType: 'user',
        entityId: 'u1',
        actorId: 'a1',
        properties: { method: 'password', ip_address: '127.0.0.1' }, // ip_address should be stripped
      });

      expect(db._analyticsEvents).toHaveLength(1);
      const event = db._analyticsEvents[0];
      expect(event.tenant_id).toBe('t1');
      expect(event.workspace_id).toBe('w1');
      expect(event.event_key).toBe('user.login');
      expect(event.entity_type).toBe('user');
      expect(event.entity_id).toBe('u1');
      expect(event.actor_id).toBe('a1');

      // properties check
      expect(event.properties_json).toBe(JSON.stringify({ method: 'password' }));
      expect(typeof event.id).toBe('string');
      expect(event.id).toMatch(/^ae_[a-z0-9]{20}$/);
      expect(typeof event.occurred_at).toBe('number');
    });

    it('inserts analytics event without optional fields', async () => {
      const db = makeMockDb();
      await trackEvent(db, {
        tenantId: 't1',
        workspaceId: 'w1',
        eventKey: 'user.logout',
        entityType: 'user',
        entityId: 'u1',
      });

      expect(db._analyticsEvents).toHaveLength(1);
      const event = db._analyticsEvents[0];
      expect(event.actor_id).toBeNull();
      expect(event.properties_json).toBeNull();
    });

    it('inserts analytics event with empty properties', async () => {
      const db = makeMockDb();
      await trackEvent(db, {
        tenantId: 't1',
        workspaceId: 'w1',
        eventKey: 'user.logout',
        entityType: 'user',
        entityId: 'u1',
        properties: {},
      });

      expect(db._analyticsEvents).toHaveLength(1);
      const event = db._analyticsEvents[0];
      expect(event.properties_json).toBeNull();
    });

    it('inserts analytics event when all properties are stripped as PII', async () => {
      const db = makeMockDb();
      await trackEvent(db, {
        tenantId: 't1',
        workspaceId: 'w1',
        eventKey: 'user.logout',
        entityType: 'user',
        entityId: 'u1',
        properties: { email: 'test@example.com' },
      });

      expect(db._analyticsEvents).toHaveLength(1);
      const event = db._analyticsEvents[0];
      expect(event.properties_json).toBeNull(); // Because all keys stripped -> empty object -> null
    });

    it('does not throw and logs to console.error when db throws', async () => {
      const brokenDb = {
        prepare: () => ({
          bind: () => ({
            run: async () => { throw new Error('DB error'); },
          }),
        }),
      };

      await expect(
        trackEvent(brokenDb as any, {
          tenantId: 't1',
          workspaceId: 'w1',
          eventKey: 'user.logout',
          entityType: 'user',
          entityId: 'u1',
        })
      ).resolves.toBeUndefined();

      expect(mockConsoleError).toHaveBeenCalledTimes(1);
      expect(mockConsoleError).toHaveBeenCalledWith('[analytics:trackEvent] non-blocking failure:', expect.any(Error));
    });
  });
});
