import { describe, it, expect, beforeEach } from 'vitest';
import { ProfessionalRepository } from './professional.js';
import { isValidProfessionalTransition, VALID_PROFESSIONAL_TRANSITIONS } from './types.js';
function makeDb() {
  const store: Record<string, unknown>[] = [];
  const prep = (sql: string) => {
    const bindFn = (...vals: unknown[]) => ({
      // eslint-disable-next-line @typescript-eslint/require-await
      run: async () => {
        if (sql.trim().toUpperCase().startsWith('INSERT')) {
          const colM = sql.match(/\(([^)]+)\)\s+VALUES/i);
          const valM = sql.match(/VALUES\s*\(([^)]+)\)/i);
          if (colM && valM) {
            const cols = colM[1]!.split(',').map((c: string) => c.trim());
            const tokens = valM[1]!.split(',').map((v: string) => v.trim());
            const row: Record<string, unknown> = {};
            let bi = 0;
            cols.forEach((col: string, i: number) => {
              const tok = tokens[i] ?? '?';
              if (tok === '?') { row[col] = vals[bi++]; }
              else if (tok.toUpperCase() === 'NULL') { row[col] = null; }
              else if (tok.toLowerCase() === 'unixepoch()') { row[col] = Math.floor(Date.now() / 1000); }
              else if (tok.startsWith("'") && tok.endsWith("'")) { row[col] = tok.slice(1, -1); }
              else if (!Number.isNaN(Number(tok))) { row[col] = Number(tok); }
              else { row[col] = vals[bi++]; }
            });
            if (row['status'] === undefined) row['status'] = 'seeded';
            if (row['available'] === undefined) row['available'] = 1;
            if (!row['created_at']) row['created_at'] = Math.floor(Date.now() / 1000);
            store.push(row);
          }
        } else if (sql.trim().toUpperCase().startsWith('UPDATE')) {
          const setM = sql.match(/SET\s+(.+?)\s+WHERE/i);
          if (setM) {
            const clauses = setM[1]!.split(',').map((s: string) => s.trim());
            const id = vals[vals.length - 2] as string;
            const tid = vals[vals.length - 1] as string;
            const idx = store.findIndex(r => r['id'] === id && r['tenant_id'] === tid);
            if (idx >= 0) {
              clauses.forEach((clause: string, i: number) => {
                const col = (clause.split('=')[0]! ?? '').trim();
                (store[idx]! as Record<string, unknown>)[col] = vals[i];
              });
            }
          }
        }
        return { success: true };
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      first: async <T>() => {
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
          if (sql.toLowerCase().includes('count(*)')) return ({ cnt: store.length }) as unknown as T;
          if (vals.length >= 2) {
            const v0 = vals[0]; const v1 = vals[1];
            const found = store.find(r =>
              (r['id'] === v0 || r['individual_id'] === v0 || r['member_number'] === v0 ||
               r['plate_number'] === v0 || r['route_id'] === v0) &&
              r['tenant_id'] === v1
            );
            return (found ?? null) as T;
          }
          if (vals.length === 1) return (store.find(r => r['id'] === vals[0] || r['individual_id'] === vals[0]) ?? null) as T;
          return (store[0] ?? null) as T;
        }
        return null as T;
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      all: async <T>() => {
        if (sql.trim().toUpperCase().startsWith('SELECT') && vals.length >= 2) {
          const filtered = store.filter(r => {
            const v0 = vals[0];
            const v1 = vals[1];
            const matchTenant = v1 === undefined || r['tenant_id'] === v1;
            const matchFirst = v0 === undefined ||
              r['workspace_id'] === v0 || r['goods_type'] === v0 ||
              r['facility_type'] === v0 || r['school_type'] === v0 ||
              r['profession'] === v0 || r['state'] === v0 ||
              r['lga'] === v0 || r['route_id'] === v0 ||
              r['creator_id'] === v0 || r['member_id'] === v0 ||
              r['available'] === v0;
            return matchFirst && matchTenant;
          });
          return ({ results: filtered }) as unknown as T;
        }
        return ({ results: store }) as unknown as T;
      },
    });
    return { bind: bindFn };
  };
  return { prepare: prep };
}
describe('ProfessionalRepository', () => {
  let db: ReturnType<typeof makeDb>; let repo: ProfessionalRepository;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  beforeEach(() => { db = makeDb(); repo = new ProfessionalRepository(db as any); });
  it('creates professional with seeded status', async () => { const p = await repo.create({ individualId: 'ind-1', workspaceId: 'ws1', tenantId: 't1', profession: 'lawyer' }); expect(p.status).toBe('seeded'); expect(p.profession).toBe('lawyer'); });
  it('uses provided id', async () => { const p = await repo.create({ id: 'pr-001', individualId: 'ind-2', workspaceId: 'ws1', tenantId: 't1', profession: 'doctor' }); expect(p.id).toBe('pr-001'); });
  it('default yearsExperience is 0', async () => { const p = await repo.create({ individualId: 'ind-3', workspaceId: 'ws1', tenantId: 't1', profession: 'accountant' }); expect(p.yearsExperience).toBe(0); });
  it('stores consultationFeeKobo (P9)', async () => { const p = await repo.create({ individualId: 'ind-4', workspaceId: 'ws1', tenantId: 't1', profession: 'engineer', consultationFeeKobo: 2500000 }); expect(p).not.toBeNull(); });
  it('findById returns null for missing', async () => { expect(await repo.findById('none', 't1')).toBeNull(); });
  it('findByProfession returns professionals', async () => { const ps = await repo.findByProfession('lawyer', 't1'); expect(Array.isArray(ps)).toBe(true); });
  it('update licenseBody', async () => { const p = await repo.create({ individualId: 'ind-5', workspaceId: 'ws1', tenantId: 't1', profession: 'lawyer' }); expect(await repo.update(p.id, 't1', { licenseBody: 'NBA' })).not.toBeNull(); });
  it('update licenseNumber', async () => { const p = await repo.create({ individualId: 'ind-6', workspaceId: 'ws1', tenantId: 't1', profession: 'doctor' }); expect(await repo.update(p.id, 't1', { licenseNumber: 'MDCN-001' })).not.toBeNull(); });
  it('update licenseExpires', async () => { const p = await repo.create({ individualId: 'ind-7', workspaceId: 'ws1', tenantId: 't1', profession: 'pharmacist' }); expect(await repo.update(p.id, 't1', { licenseExpires: 1900000000 })).not.toBeNull(); });
  it('update yearsExperience', async () => { const p = await repo.create({ individualId: 'ind-8', workspaceId: 'ws1', tenantId: 't1', profession: 'nurse' }); expect(await repo.update(p.id, 't1', { yearsExperience: 10 })).not.toBeNull(); });
  it('update consultationFeeKobo', async () => { const p = await repo.create({ individualId: 'ind-9', workspaceId: 'ws1', tenantId: 't1', profession: 'architect' }); expect(await repo.update(p.id, 't1', { consultationFeeKobo: 1500000 })).not.toBeNull(); });
  it('update profession', async () => { const p = await repo.create({ individualId: 'ind-10', workspaceId: 'ws1', tenantId: 't1', profession: 'others' }); expect(await repo.update(p.id, 't1', { profession: 'surveyor' })).not.toBeNull(); });
  it('transition seeded → claimed', async () => { const p = await repo.create({ individualId: 'ind-11', workspaceId: 'ws1', tenantId: 't1', profession: 'lawyer' }); expect(await repo.transition(p.id, 't1', 'claimed')).not.toBeNull(); });
  it('transition claimed → license_verified', async () => { const p = await repo.create({ individualId: 'ind-12', workspaceId: 'ws1', tenantId: 't1', profession: 'doctor' }); expect(await repo.transition(p.id, 't1', 'license_verified')).not.toBeNull(); });
  it('transition license_verified → active', async () => { const p = await repo.create({ individualId: 'ind-13', workspaceId: 'ws1', tenantId: 't1', profession: 'accountant' }); expect(await repo.transition(p.id, 't1', 'active')).not.toBeNull(); });
  it('empty update returns existing', async () => { const p = await repo.create({ individualId: 'ind-14', workspaceId: 'ws1', tenantId: 't1', profession: 'optician' }); expect(await repo.update(p.id, 't1', {})).not.toBeNull(); });
  it('stores tenantId', async () => { const p = await repo.create({ individualId: 'ind-15', workspaceId: 'ws1', tenantId: 'tenant-P', profession: 'dentist' }); expect(p.tenantId).toBe('tenant-P'); });
});
describe('Professional FSM', () => {
  it('seeded → claimed valid', () => { expect(isValidProfessionalTransition('seeded', 'claimed')).toBe(true); });
  it('claimed → license_verified valid', () => { expect(isValidProfessionalTransition('claimed', 'license_verified')).toBe(true); });
  it('license_verified → active valid', () => { expect(isValidProfessionalTransition('license_verified', 'active')).toBe(true); });
  it('seeded → active invalid', () => { expect(isValidProfessionalTransition('seeded', 'active')).toBe(false); });
  it('VALID_PROFESSIONAL_TRANSITIONS has 3 entries', () => { expect(VALID_PROFESSIONAL_TRANSITIONS).toHaveLength(3); });
});
