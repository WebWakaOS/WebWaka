/**
 * @webwaka/verticals-furniture-maker — test suite (M10)
 * Covers: FSM, P9 kobo guards, T3 isolation, order management
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { FurnitureMakerRepository } from './furniture-maker.js';
import {
  isValidFurnitureMakerTransition,
  guardL2AiCap,
} from './types.js';

function makeDb() {
  const store = new Map<string, Record<string, unknown>>();
  return {
    prepare: (sql: string) => ({
      bind: (...vals: unknown[]) => ({
        // eslint-disable-next-line @typescript-eslint/require-await
        run: async () => {
          const upper = sql.trim().toUpperCase();
          if (upper.startsWith('INSERT')) {
            const tM = sql.match(/INTO\s+(\w+)/i);
            const cM = sql.match(/\(([^)]+)\)\s+VALUES/i);
            const vM = sql.match(/VALUES\s*\(([^)]+)\)/i);
            if (tM && cM && vM) {
              const table = tM[1]!;
              const cols = cM[1]!.split(',').map((c: string) => c.trim());
              const tokens = vM[1]!.split(',').map((v: string) => v.trim());
              const row: Record<string, unknown> = { _table: table };
              let bi = 0;
              cols.forEach((col: string, i: number) => {
                const tok = tokens[i] ?? '?';
                if (tok === '?') row[col] = vals[bi++];
                else if (tok.toLowerCase() === 'unixepoch()') row[col] = 1000;
                else if (tok.startsWith("'") && tok.endsWith("'")) row[col] = tok.slice(1, -1);
                else row[col] = vals[bi++];
              });
              store.set(`${table}:${String(row['id'])}`, row);
            }
          } else if (upper.startsWith('UPDATE')) {
            const tM = sql.match(/UPDATE\s+(\w+)/i);
            if (tM) {
              const table = tM[1]!;
              const id = vals[vals.length - 2] as string;
              const tid = vals[vals.length - 1] as string;
              const key = `${table}:${id}`;
              const row = store.get(key);
              if (row && row['tenant_id'] === tid) {
                row['status'] = vals[0];
                row['updated_at'] = 1001;
                store.set(key, row);
              }
            }
          }
          return { success: true };
        },
        // eslint-disable-next-line @typescript-eslint/require-await
        first: async <T>() => {
          const tM = sql.match(/FROM\s+(\w+)/i);
          if (!tM) return null as T;
          const table = tM[1]!;
          const id = vals[0] as string;
          const tenantId = vals[1] as string | undefined;
          const key = `${table}:${id}`;
          const row = store.get(key);
          if (!row) return null as T;
          if (tenantId !== undefined && row['tenant_id'] !== tenantId) return null as T;
          return row as T;
        },
        // eslint-disable-next-line @typescript-eslint/require-await
        all: async <T>() => ({ results: [] as T[] }),
      }),
    }),
  };
}

describe('verticals-furniture-maker', () => {
  let repo: FurnitureMakerRepository;
  beforeEach(() => { repo = new FurnitureMakerRepository(makeDb() as never); });

  it('FSM: seeded → claimed is valid', () => { expect(isValidFurnitureMakerTransition('seeded', 'claimed')).toBe(true); });
  it('FSM: claimed → cac_verified is valid', () => { expect(isValidFurnitureMakerTransition('claimed', 'cac_verified')).toBe(true); });
  it('FSM: cac_verified → active is valid', () => { expect(isValidFurnitureMakerTransition('cac_verified', 'active')).toBe(true); });
  it('FSM: active → suspended is valid', () => { expect(isValidFurnitureMakerTransition('active', 'suspended')).toBe(true); });
  it('FSM: suspended → active is valid (recovery)', () => { expect(isValidFurnitureMakerTransition('suspended', 'active')).toBe(true); });
  it('FSM: seeded → active is invalid', () => { expect(isValidFurnitureMakerTransition('seeded', 'active')).toBe(false); });
  it('FSM: active → seeded is invalid', () => { expect(isValidFurnitureMakerTransition('active', 'seeded')).toBe(false); });

  it('guardL2AiCap blocks autonomyLevel > 2', () => {
    const r = guardL2AiCap({ autonomyLevel: 3 });
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('L2');
  });
  it('guardL2AiCap passes for L2', () => { expect(guardL2AiCap({ autonomyLevel: 2 }).allowed).toBe(true); });
  it('guardL2AiCap passes when no autonomyLevel provided', () => { expect(guardL2AiCap({}).allowed).toBe(true); });
  it('FSM: claimed → suspended is invalid (must go via cac_verified)', () => { expect(isValidFurnitureMakerTransition('claimed', 'suspended')).toBe(false); });

  it('createProfile sets status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Lagos Furniture Co' });
    expect(p.status).toBe('seeded');
    expect(p.businessName).toBe('Lagos Furniture Co');
  });

  it('findProfileById T3 isolation — wrong tenant returns null', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'ABC Furniture' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('createProfile stores workspaceId and tenantId', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws-fm', tenantId: 'tn-fm', businessName: 'Delta Craft' });
    expect(p.workspaceId).toBe('ws-fm');
    expect(p.tenantId).toBe('tn-fm');
  });

  it('createOrder rejects non-integer totalKobo (P9)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Sofa City' });
    await expect(
      repo.createOrder(p.id, 'tn1', { clientRefId: 'CL-001', itemType: 'Sofa', quantity: 1, unitPriceKobo: 50000, totalKobo: 50000.5, depositKobo: 10000 }),
    ).rejects.toThrow('P9');
  });

  it('transitionStatus changes FSM state', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Craft Works' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'claimed');
    expect(updated.status).toBe('claimed');
  });
});
