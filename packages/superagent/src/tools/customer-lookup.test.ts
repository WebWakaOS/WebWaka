import { describe, it, expect, vi } from 'vitest';
import { customerLookupTool } from './customer-lookup.js';
import type { ToolExecutionContext } from '../tool-registry.js';

function makeMockDB(overrides: Record<string, { first?: unknown; results?: unknown[] }> = {}) {
  const db = {
    prepare: vi.fn().mockImplementation((sql: string) => {
      const match = Object.entries(overrides).find(([k]) => sql.includes(k));
      const val = match?.[1] ?? { results: [] };
      return {
        bind: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue({ results: val.results ?? [] }),
          first: vi.fn().mockResolvedValue(val.first ?? null),
          run: vi.fn().mockResolvedValue({ success: true, meta: { changes: 1 } }),
        }),
      };
    }),
    batch: vi.fn().mockResolvedValue([{ success: true }, { success: true }]),
  };
  return db as unknown as D1Database;
}

function makeCtx(db: D1Database): ToolExecutionContext {
  return {
    tenantId: 'tenant-1',
    workspaceId: 'ws-1',
    userId: 'user-1',
    db,
    vertical: 'retail',
    hitlService: { submit: vi.fn().mockResolvedValue({ queueItemId: 'hitl-1' }) } as never,
    autonomyLevel: 3,
  };
}

describe('customer_lookup', () => {
  it('returns matching individuals by name fragment', async () => {
    const db = makeMockDB({
      individuals: {
        results: [
          { id: 'i-1', display_name: 'Ada Okafor', account_type: 'individual', last_active_at: 1700000000, verification_state: 'verified' },
        ],
      },
      organizations: { results: [] },
    });
    const result = JSON.parse(await customerLookupTool.handler({ query: 'Ada' }, makeCtx(db)));
    expect(result.status).toBe('ok');
    expect(result.results[0].display_name).toBe('Ada Okafor');
    expect(result.results[0].id).toBe('i-1');
    expect(result.results[0].account_type).toBe('individual');
  });

  it('returns matching organizations by name fragment', async () => {
    const db = makeMockDB({
      individuals: { results: [] },
      organizations: {
        results: [
          { id: 'org-1', display_name: 'Zenith Motors', account_type: 'organisation', last_active_at: 1700000001, verification_state: 'unverified' },
        ],
      },
    });
    const result = JSON.parse(await customerLookupTool.handler({ query: 'Zenith', entity_type: 'organisation' }, makeCtx(db)));
    expect(result.status).toBe('ok');
    expect(result.results[0].id).toBe('org-1');
  });

  it('searches individuals by phone/email via contact_channels join', async () => {
    const db = makeMockDB({
      individuals: {
        results: [
          { id: 'i-2', display_name: 'Bola Tinubu', account_type: 'individual', last_active_at: 1700000002, verification_state: 'verified' },
        ],
      },
      organizations: { results: [] },
    });
    const result = JSON.parse(await customerLookupTool.handler({ query: '0802', entity_type: 'individual' }, makeCtx(db)));
    expect(result.status).toBe('ok');
    const sql = ((db.prepare as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] ?? '') as string;
    expect(sql).toContain('contact_channels');
    expect(sql).toContain('cc.value LIKE');
  });

  it('rejects queries shorter than 2 characters', async () => {
    const db = makeMockDB();
    const result = JSON.parse(await customerLookupTool.handler({ query: 'A' }, makeCtx(db)));
    expect(result.error).toBe('QUERY_TOO_SHORT');
  });

  it('returns empty results gracefully when nothing found', async () => {
    const db = makeMockDB({
      individuals: { results: [] },
      organizations: { results: [] },
    });
    const result = JSON.parse(await customerLookupTool.handler({ query: 'nobody' }, makeCtx(db)));
    expect(result.status).toBe('ok');
    expect(result.results).toHaveLength(0);
  });

  it('never returns PII fields (only id, display_name, account_type, last_active_at, verification_state)', async () => {
    const db = makeMockDB({
      individuals: {
        results: [
          {
            id: 'i-3',
            display_name: 'Ngozi Adeyemi',
            account_type: 'individual',
            last_active_at: 1700000003,
            verification_state: 'verified',
            phone: '+2348012345678',
            email: 'ngozi@example.com',
            nin: '12345678901',
          },
        ],
      },
      organizations: { results: [] },
    });
    const result = JSON.parse(await customerLookupTool.handler({ query: 'Ngozi' }, makeCtx(db)));
    const row = result.results[0];
    expect(row).not.toHaveProperty('phone');
    expect(row).not.toHaveProperty('email');
    expect(row).not.toHaveProperty('nin');
  });

  it('T3: scopes query to tenantId', async () => {
    const db = makeMockDB({ individuals: { results: [] }, organizations: { results: [] } });
    await customerLookupTool.handler({ query: 'test' }, makeCtx(db));
    const firstCall = ((db.prepare as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] ?? '') as string;
    expect(firstCall).toContain('tenant_id');
  });
});
