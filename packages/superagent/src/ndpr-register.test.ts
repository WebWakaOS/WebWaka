import { describe, it, expect, vi } from 'vitest';
import { NdprRegister } from './ndpr-register.js';

function makeMockDB(overrides: Record<string, { first?: unknown; results?: unknown[]; run?: { success: boolean; meta?: { changes?: number } } }> = {}) {
  return {
    prepare: vi.fn().mockImplementation((sql: string) => {
      const match = Object.entries(overrides).find(([k]) => sql.includes(k));
      const val = match?.[1] ?? { first: null, results: [], run: { success: true } };
      return {
        bind: vi.fn().mockReturnValue({
          run: vi.fn().mockResolvedValue(val.run ?? { success: true }),
          first: vi.fn().mockResolvedValue(val.first ?? null),
          all: vi.fn().mockResolvedValue({ results: val.results ?? [] }),
        }),
      };
    }),
  };
}

describe('NdprRegister', () => {
  describe('seedFromVerticalConfigs', () => {
    it('seeds register entries from vertical configs', async () => {
      const db = makeMockDB();
      const register = new NdprRegister({ db: db as never });

      const configs = {
        hospital: {
          slug: 'hospital',
          allowedCapabilities: ['bio_generator', 'superagent_chat'] as const,
        },
      };

      const seeded = await register.seedFromVerticalConfigs('t1', configs);
      expect(seeded).toBe(2);
    });

    it('skips already-existing entries', async () => {
      const db = makeMockDB({
        'SELECT id FROM ai_processing_register': { first: { id: 'existing' } },
      });
      const register = new NdprRegister({ db: db as never });

      const configs = {
        hospital: {
          slug: 'hospital',
          allowedCapabilities: ['bio_generator'] as const,
        },
      };

      const seeded = await register.seedFromVerticalConfigs('t1', configs);
      expect(seeded).toBe(0);
    });

    it('skips capabilities without register template', async () => {
      const db = makeMockDB();
      const register = new NdprRegister({ db: db as never });

      const configs = {
        test: {
          slug: 'test',
          allowedCapabilities: ['unknown_capability'] as const,
        },
      };

      const seeded = await register.seedFromVerticalConfigs('t1', configs);
      expect(seeded).toBe(0);
    });
  });

  describe('listActivities', () => {
    it('returns all activities for tenant', async () => {
      const db = makeMockDB({
        'SELECT id, tenant_id': {
          results: [{
            id: 'a1', tenant_id: 't1', activity_name: 'AI Bio Generation',
            purpose: 'Generate bio', legal_basis: 'Consent',
            data_categories: 'Profile', data_subjects: 'Owners',
            recipients: 'AI provider', retention_period: '12 months',
            security_measures: 'AES-256', vertical: 'hospital', capability: 'bio_generator',
            is_active: 1, last_reviewed_at: null,
            created_at: '2026-04-11T00:00:00Z', updated_at: '2026-04-11T00:00:00Z',
          }],
        },
      });
      const register = new NdprRegister({ db: db as never });

      const activities = await register.listActivities('t1');
      expect(activities).toHaveLength(1);
      expect(activities[0]!.activityName).toBe('AI Bio Generation');
    });
  });

  describe('markReviewed', () => {
    it('marks an entry as reviewed', async () => {
      const db = makeMockDB({
        'UPDATE ai_processing_register': { run: { success: true, meta: { changes: 1 } } },
      });
      const register = new NdprRegister({ db: db as never });

      const updated = await register.markReviewed('a1', 't1');
      expect(updated).toBe(true);
    });

    it('returns false for missing entry', async () => {
      const db = makeMockDB({
        'UPDATE ai_processing_register': { run: { success: true, meta: { changes: 0 } } },
      });
      const register = new NdprRegister({ db: db as never });

      const updated = await register.markReviewed('missing', 't1');
      expect(updated).toBe(false);
    });
  });

  describe('exportRegister', () => {
    it('exports register with metadata', async () => {
      const db = makeMockDB({
        'SELECT id, tenant_id': {
          results: [
            {
              id: 'a1', tenant_id: 't1', activity_name: 'Bio Gen',
              purpose: 'Generate', legal_basis: 'Consent',
              data_categories: 'Profile', data_subjects: 'Users',
              recipients: 'AI', retention_period: '12m',
              security_measures: 'AES', vertical: 'hospital', capability: 'bio_generator',
              is_active: 1, last_reviewed_at: null,
              created_at: '2026-04-11T00:00:00Z', updated_at: '2026-04-11T00:00:00Z',
            },
            {
              id: 'a2', tenant_id: 't1', activity_name: 'Chat',
              purpose: 'Assist', legal_basis: 'Consent',
              data_categories: 'Text', data_subjects: 'Members',
              recipients: 'AI', retention_period: '12m',
              security_measures: 'AES', vertical: 'hospital', capability: 'superagent_chat',
              is_active: 0, last_reviewed_at: null,
              created_at: '2026-04-11T00:00:00Z', updated_at: '2026-04-11T00:00:00Z',
            },
          ],
        },
      });
      const register = new NdprRegister({ db: db as never });

      const exported = await register.exportRegister('t1');
      expect(exported.totalActivities).toBe(2);
      expect(exported.activeActivities).toBe(1);
      expect(exported.generatedAt).toBeTruthy();
      expect(exported.controller).toContain('t1');
    });
  });
});
