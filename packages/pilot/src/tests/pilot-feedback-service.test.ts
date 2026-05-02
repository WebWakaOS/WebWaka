import { describe, it, expect, beforeEach } from 'vitest';
import { PilotFeedbackService } from '../pilot-feedback-service.js';

// ---------------------------------------------------------------------------
// In-memory stub
// ---------------------------------------------------------------------------

type Row = Record<string, unknown>;

class StubDB {
  public rows: Row[] = [];

  prepare(sql: string) {
    const rows = this.rows;
    const sqlUpper = sql.trim().toUpperCase();

    return {
      bind: (...args: unknown[]) => ({
        run: async () => {
          if (sqlUpper.startsWith('INSERT INTO PILOT_FEEDBACK')) {
            rows.push({
              id: args[0],
              tenant_id: args[1],
              workspace_id: args[2],
              user_id: args[3],
              feedback_type: args[4],
              nps_score: args[5],
              message: args[6],
              context_route: args[7],
              submitted_at: args[8],
            });
          }
          return { meta: { changes: 1 } };
        },
        first: async <T>() => {
          const id = args[0] as string;
          return (rows.find((r) => r.id === id) ?? null) as T | null;
        },
        all: async <T>() => {
          const tenantId = args[0] as string;
          const limit = (args[1] as number) ?? 50;
          const results = rows
            .filter((r) => r.tenant_id === tenantId)
            .slice(0, limit);
          return { results: results as T[] };
        },
      }),
    };
  }
}

// summary() uses two separate prepare calls — wrap with a smart stub:
class SummaryStubDB extends StubDB {
  prepare(sql: string) {
    const rows = this.rows;
    const sqlUpper = sql.trim().toUpperCase();

    return {
      bind: (...args: unknown[]) => ({
        run: async () => ({ meta: { changes: 0 } }),
        first: async <T>() => {
          // NPS stats query
          const cutoff = args[0] as string;
          const npsRows = rows.filter(
            (r) =>
              r.feedback_type === 'nps' &&
              r.nps_score != null &&
              (r.submitted_at as string) >= cutoff,
          );
          const total_nps = npsRows.length;
          const promoters  = npsRows.filter((r) => (r.nps_score as number) >= 9).length;
          const passives   = npsRows.filter((r) => {
            const s = r.nps_score as number;
            return s >= 7 && s <= 8;
          }).length;
          const detractors = npsRows.filter((r) => (r.nps_score as number) <= 6).length;
          const avg_nps    = total_nps > 0
            ? npsRows.reduce((sum, r) => sum + (r.nps_score as number), 0) / total_nps
            : null;
          return { total_nps, avg_nps, promoters, passives, detractors } as T;
        },
        all: async <T>() => {
          if (sqlUpper.includes('COUNT') && sqlUpper.includes('GROUP BY FEEDBACK_TYPE')) {
            const cutoff = args[0] as string;
            const counts: Record<string, number> = {};
            for (const r of rows) {
              if ((r.submitted_at as string) >= cutoff) {
                const ft = r.feedback_type as string;
                counts[ft] = (counts[ft] ?? 0) + 1;
              }
            }
            return {
              results: Object.entries(counts).map(([feedback_type, cnt]) => ({
                feedback_type,
                cnt,
              })) as T[],
            };
          }
          const tenantId = args[0] as string;
          const limit = (args[1] as number) ?? 50;
          return {
            results: rows
              .filter((r) => r.tenant_id === tenantId)
              .slice(0, limit) as T[],
          };
        },
      }),
    };
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PilotFeedbackService', () => {
  let svc: PilotFeedbackService;
  let stub: SummaryStubDB;

  beforeEach(() => {
    stub = new SummaryStubDB();
    svc = new PilotFeedbackService(stub as never);
  });

  it('submits NPS feedback and returns the record', async () => {
    const fb = await svc.submit({
      tenant_id: 'tenant_a',
      workspace_id: 'ws_a',
      user_id: 'user_1',
      feedback_type: 'nps',
      nps_score: 9,
      message: 'Really useful platform!',
    });

    expect(fb.feedback_type).toBe('nps');
    expect(fb.nps_score).toBe(9);
    expect(fb.tenant_id).toBe('tenant_a');
  });

  it('submits bug feedback without nps_score', async () => {
    const fb = await svc.submit({
      tenant_id: 'tenant_b',
      workspace_id: 'ws_b',
      user_id: 'user_2',
      feedback_type: 'bug',
      message: 'POS receipt not printing',
      context_route: '/pos/checkout',
    });

    expect(fb.feedback_type).toBe('bug');
    expect(fb.nps_score).toBeNull();
    expect(fb.context_route).toBe('/pos/checkout');
  });

  it('calculates NPS score correctly for mixed responses', async () => {
    // 3 promoters (9,10,9), 1 passive (7), 1 detractor (5)
    for (const score of [9, 10, 9, 7, 5]) {
      await svc.submit({
        tenant_id: 't1',
        workspace_id: 'ws1',
        user_id: `u${score}`,
        feedback_type: 'nps',
        nps_score: score,
      });
    }

    const summary = await svc.summary('1970-01-01T00:00:00.000Z');
    // NPS = ((3 - 1) / 5) * 100 = 40
    expect(summary.promoters).toBe(3);
    expect(summary.detractors).toBe(1);
    expect(summary.nps_score).toBe(40);
  });

  it('returns null nps_score when no NPS responses exist', async () => {
    await svc.submit({
      tenant_id: 't2',
      workspace_id: 'ws2',
      user_id: 'u1',
      feedback_type: 'bug',
      message: 'App crash on login',
    });
    const summary = await svc.summary('1970-01-01T00:00:00.000Z');
    expect(summary.nps_score).toBeNull();
  });

  it('counts feedback by type correctly', async () => {
    await svc.submit({ tenant_id: 't3', workspace_id: 'ws3', user_id: 'u1', feedback_type: 'bug' });
    await svc.submit({ tenant_id: 't3', workspace_id: 'ws3', user_id: 'u2', feedback_type: 'bug' });
    await svc.submit({ tenant_id: 't3', workspace_id: 'ws3', user_id: 'u3', feedback_type: 'feature_request' });
    await svc.submit({ tenant_id: 't3', workspace_id: 'ws3', user_id: 'u4', feedback_type: 'general' });

    const summary = await svc.summary('1970-01-01T00:00:00.000Z');
    expect(summary.by_type.bug).toBe(2);
    expect(summary.by_type.feature_request).toBe(1);
    expect(summary.by_type.general).toBe(1);
    expect(summary.total).toBe(4);
  });

  it('listForTenant returns only that tenant\'s feedback', async () => {
    await svc.submit({ tenant_id: 'tenant_x', workspace_id: 'wx', user_id: 'u1', feedback_type: 'nps', nps_score: 8 });
    await svc.submit({ tenant_id: 'tenant_y', workspace_id: 'wy', user_id: 'u2', feedback_type: 'nps', nps_score: 7 });

    const list = await svc.listForTenant('tenant_x');
    expect(list).toHaveLength(1);
    expect(list[0].tenant_id).toBe('tenant_x');
  });
});
