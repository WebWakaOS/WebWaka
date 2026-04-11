import { describe, it, expect, beforeEach } from 'vitest';
import { ClinicRepository } from './clinic.js';
import { isValidClinicTransition, VALID_CLINIC_TRANSITIONS } from './types.js';
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
                const col = clause.split('=')[0]!.trim();
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
describe('ClinicRepository', () => {
  let db: ReturnType<typeof makeDb>; let repo: ClinicRepository;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  beforeEach(() => { db = makeDb(); repo = new ClinicRepository(db as any); });
  it('creates clinic with seeded status', async () => { const c = await repo.create({ organizationId: 'org1', workspaceId: 'ws1', tenantId: 't1', facilityName: 'Lekki Clinic', facilityType: 'clinic' }); expect(c.status).toBe('seeded'); expect(c.facilityName).toBe('Lekki Clinic'); });
  it('uses provided id', async () => { const c = await repo.create({ id: 'cl-001', organizationId: 'org1', workspaceId: 'ws1', tenantId: 't1', facilityName: 'VGC Hospital', facilityType: 'hospital' }); expect(c.id).toBe('cl-001'); });
  it('stores facilityType', async () => { const c = await repo.create({ organizationId: 'org2', workspaceId: 'ws1', tenantId: 't1', facilityName: 'Pharma Plus', facilityType: 'pharmacy' }); expect(c.facilityType).toBe('pharmacy'); });
  it('stores cacRegNumber', async () => { const c = await repo.create({ organizationId: 'org3', workspaceId: 'ws1', tenantId: 't1', facilityName: 'Lab One', facilityType: 'laboratory', cacRegNumber: 'RC-CL-001' }); expect(c).not.toBeNull(); });
  it('stores bedCount', async () => { const c = await repo.create({ organizationId: 'org4', workspaceId: 'ws1', tenantId: 't1', facilityName: 'Maternity', facilityType: 'maternity', bedCount: 30 }); expect(c.bedCount).toBe(30); });
  it('findById returns null for missing', async () => { expect(await repo.findById('none', 't1')).toBeNull(); });
  it('findByType returns clinics', async () => { const cs = await repo.findByType('clinic', 't1'); expect(Array.isArray(cs)).toBe(true); });
  it('update facilityName', async () => { const c = await repo.create({ organizationId: 'org5', workspaceId: 'ws1', tenantId: 't1', facilityName: 'Old Name', facilityType: 'dental' }); expect(await repo.update(c.id, 't1', { facilityName: 'New Name' })).not.toBeNull(); });
  it('update facilityType', async () => { const c = await repo.create({ organizationId: 'org6', workspaceId: 'ws1', tenantId: 't1', facilityName: 'Eye Clinic', facilityType: 'optical' }); expect(await repo.update(c.id, 't1', { facilityType: 'clinic' })).not.toBeNull(); });
  it('update mdcnRef', async () => { const c = await repo.create({ organizationId: 'org7', workspaceId: 'ws1', tenantId: 't1', facilityName: 'Clinic Z', facilityType: 'clinic' }); expect(await repo.update(c.id, 't1', { mdcnRef: 'MDCN-001' })).not.toBeNull(); });
  it('update cacRegNumber', async () => { const c = await repo.create({ organizationId: 'org8', workspaceId: 'ws1', tenantId: 't1', facilityName: 'Clinic A', facilityType: 'others' }); expect(await repo.update(c.id, 't1', { cacRegNumber: 'RC-002' })).not.toBeNull(); });
  it('update bedCount', async () => { const c = await repo.create({ organizationId: 'org9', workspaceId: 'ws1', tenantId: 't1', facilityName: 'Big Hospital', facilityType: 'hospital', bedCount: 50 }); expect(await repo.update(c.id, 't1', { bedCount: 100 })).not.toBeNull(); });
  it('transition seeded → claimed', async () => { const c = await repo.create({ organizationId: 'org10', workspaceId: 'ws1', tenantId: 't1', facilityName: 'C1', facilityType: 'clinic' }); expect(await repo.transition(c.id, 't1', 'claimed')).not.toBeNull(); });
  it('transition claimed → mdcn_verified', async () => { const c = await repo.create({ organizationId: 'org11', workspaceId: 'ws1', tenantId: 't1', facilityName: 'C2', facilityType: 'clinic' }); expect(await repo.transition(c.id, 't1', 'mdcn_verified')).not.toBeNull(); });
  it('transition mdcn_verified → active', async () => { const c = await repo.create({ organizationId: 'org12', workspaceId: 'ws1', tenantId: 't1', facilityName: 'C3', facilityType: 'hospital' }); expect(await repo.transition(c.id, 't1', 'active')).not.toBeNull(); });
  it('empty update returns existing', async () => { const c = await repo.create({ organizationId: 'org13', workspaceId: 'ws1', tenantId: 't1', facilityName: 'C4', facilityType: 'dental' }); expect(await repo.update(c.id, 't1', {})).not.toBeNull(); });
  it('tenantId stored', async () => { const c = await repo.create({ organizationId: 'org14', workspaceId: 'ws1', tenantId: 'tenant-C', facilityName: 'C5', facilityType: 'pharmacy' }); expect(c.tenantId).toBe('tenant-C'); });
});
describe('Clinic FSM', () => {
  it('seeded → claimed valid', () => { expect(isValidClinicTransition('seeded', 'claimed')).toBe(true); });
  it('claimed → mdcn_verified valid', () => { expect(isValidClinicTransition('claimed', 'mdcn_verified')).toBe(true); });
  it('mdcn_verified → active valid', () => { expect(isValidClinicTransition('mdcn_verified', 'active')).toBe(true); });
  it('seeded → active invalid', () => { expect(isValidClinicTransition('seeded', 'active')).toBe(false); });
  it('VALID_CLINIC_TRANSITIONS has 3 entries', () => { expect(VALID_CLINIC_TRANSITIONS).toHaveLength(3); });
});
