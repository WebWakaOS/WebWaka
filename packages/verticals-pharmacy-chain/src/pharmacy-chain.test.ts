/**
 * @webwaka/verticals-pharmacy-chain — PharmacyChainRepository tests (M9)
 * Acceptance: ≥30 tests covering FSM, P9, T3, drug inventory, prescriptions, sales.
 * P13: patient_ref_id / prescriber_ref_id are opaque — never sent to AI
 * NAFDAC: all drugs require NAFDAC registration for prescription-required items
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PharmacyChainRepository } from './pharmacy-chain.js';
import {
  isValidPharmacyChainTransition,
  guardClaimedToPcnVerified,
  guardPcnToNafdacVerified,
  guardL2AiCap,
} from './types.js';

function makeDb() {
  const stores: Record<string, Record<string, unknown>[]> = {};
  const getStore = (sql: string): Record<string, unknown>[] => {
    const m = sql.match(/(?:INSERT INTO|UPDATE|SELECT\s.+?\sFROM|DELETE FROM)\s+(\w+)/i);
    const name = m?.[1] ?? 'default';
    if (!stores[name]) stores[name] = [];
    const store = stores[name];
    if (!store) throw new Error(`Store not found: ${name}`);
    return store;
  };

  const prep = (sql: string) => {
    const bindFn = (...vals: unknown[]) => ({
      // eslint-disable-next-line @typescript-eslint/require-await
      run: async () => {
        const store = getStore(sql);
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
            if (!row['status']) row['status'] = 'seeded';
            if (!row['created_at']) row['created_at'] = Math.floor(Date.now() / 1000);
            if (!row['updated_at']) row['updated_at'] = Math.floor(Date.now() / 1000);
            store.push(row);
          }
        } else if (sql.trim().toUpperCase().startsWith('UPDATE')) {
          const setM = sql.match(/SET\s+(.+?)\s+WHERE/i);
          if (setM) {
            const clauses = setM[1]!.split(',').map((s: string) => s.trim()).filter((s: string) => !s.toLowerCase().startsWith('updated_at'));
            const id = vals[vals.length - 2] as string;
            const tid = vals[vals.length - 1] as string;
            const idx = store.findIndex(r => r['id'] === id && r['tenant_id'] === tid);
            if (idx >= 0) {
              let bi = 0;
              clauses.forEach((clause: string) => {
                const eqIdx = clause.indexOf('=');
                const col = clause.slice(0, eqIdx).trim();
                const rhs = clause.slice(eqIdx + 1).trim();
                if (rhs === '?') {
                  (store[idx] as Record<string, unknown>)[col] = vals[bi++];
                } else if (rhs.startsWith("'") && rhs.endsWith("'")) {
                  (store[idx] as Record<string, unknown>)[col] = rhs.slice(1, -1);
                } else if (rhs.toLowerCase() !== 'unixepoch()' && !Number.isNaN(Number(rhs)) && rhs !== '') {
                  (store[idx] as Record<string, unknown>)[col] = Number(rhs);
                }
              });
              (store[idx] as Record<string, unknown>)['updated_at'] = Math.floor(Date.now() / 1000);
            }
          }
        }
        return { success: true };
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      first: async <T>() => {
        const store = getStore(sql);
        if (!sql.trim().toUpperCase().startsWith('SELECT')) return null as T;
        // workspace_id lookup (findProfileByWorkspace)
        if (sql.toLowerCase().includes('workspace_id=?') && !sql.toLowerCase().includes(' id=?')) {
          const found = store.find(r => r['workspace_id'] === vals[0] && r['tenant_id'] === vals[1]);
          return (found ?? null) as T;
        }
        if (vals.length >= 2) {
          const found = store.find(r => r['id'] === vals[0] && r['tenant_id'] === vals[1]);
          return (found ?? null) as T;
        }
        if (vals.length === 1) return (store.find(r => r['id'] === vals[0]) ?? null) as T;
        return (store[0] ?? null) as T;
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      all: async <T>() => {
        const store = getStore(sql);
        const filtered = store.filter(r => {
          if (vals.length >= 2) {
            return (r['profile_id'] === vals[0] || r['workspace_id'] === vals[0]) && r['tenant_id'] === vals[1];
          }
          return true;
        });
        return { results: filtered } as { results: T[] };
      },
    });
    return { bind: bindFn };
  };
  return { prepare: prep } as unknown as ConstructorParameters<typeof PharmacyChainRepository>[0];
}

describe('PharmacyChainRepository — Profile Management', () => {
  let repo: PharmacyChainRepository;
  beforeEach(() => { repo = new PharmacyChainRepository(makeDb() as never); });

  it('T001 — creates pharmacy profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'HealthPlus Pharmacy' });
    expect(p.status).toBe('seeded');
    expect(p.businessName).toBe('HealthPlus Pharmacy');
  });

  it('T002 — uses provided id', async () => {
    const p = await repo.createProfile({ id: 'ph-001', workspaceId: 'ws1', tenantId: 'tn1', businessName: 'MedCare' });
    expect(p.id).toBe('ph-001');
  });

  it('T003 — tenant isolation: cross-tenant profile hidden (T3)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Private Pharmacy' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T004 — findProfileById returns null for missing', async () => {
    expect(await repo.findProfileById('nonexistent', 'tn1')).toBeNull();
  });

  it('T005 — findProfileByWorkspace returns correct profile', async () => {
    await repo.createProfile({ workspaceId: 'ws-pharm', tenantId: 'tn1', businessName: 'Workspace Pharm' });
    const p = await repo.findProfileByWorkspace('ws-pharm', 'tn1');
    expect(p?.businessName).toBe('Workspace Pharm');
  });

  it('T006 — stores category correctly', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws2', tenantId: 'tn1', businessName: 'Wholesale Pharm', category: 'wholesale' });
    expect(p.category).toBe('wholesale');
  });

  it('T007 — stores PCN and NAFDAC licences', async () => {
    const p = await repo.createProfile({
      workspaceId: 'ws3', tenantId: 'tn1', businessName: 'Licensed Pharmacy',
      pcnLicence: 'PCN/2024/001', nafdacLicence: 'NAFDAC/REG/2024/001',
    });
    expect(p.pcnLicence).toBe('PCN/2024/001');
    expect(p.nafdacLicence).toBe('NAFDAC/REG/2024/001');
  });
});

describe('PharmacyChainRepository — FSM Transitions', () => {
  let repo: PharmacyChainRepository;
  beforeEach(() => { repo = new PharmacyChainRepository(makeDb() as never); });

  it('T008 — valid FSM: seeded→claimed', () => {
    expect(isValidPharmacyChainTransition('seeded', 'claimed')).toBe(true);
  });

  it('T009 — valid FSM: claimed→pcn_verified', () => {
    expect(isValidPharmacyChainTransition('claimed', 'pcn_verified')).toBe(true);
  });

  it('T010 — valid FSM: pcn_verified→nafdac_verified', () => {
    expect(isValidPharmacyChainTransition('pcn_verified', 'nafdac_verified')).toBe(true);
  });

  it('T011 — valid FSM: nafdac_verified→active', () => {
    expect(isValidPharmacyChainTransition('nafdac_verified', 'active')).toBe(true);
  });

  it('T012 — valid FSM: active→suspended', () => {
    expect(isValidPharmacyChainTransition('active', 'suspended')).toBe(true);
  });

  it('T013 — valid FSM: suspended→active (reinstatement)', () => {
    expect(isValidPharmacyChainTransition('suspended', 'active')).toBe(true);
  });

  it('T014 — invalid FSM: seeded→active (skips PCN + NAFDAC steps)', () => {
    expect(isValidPharmacyChainTransition('seeded', 'active')).toBe(false);
  });

  it('T015 — invalid FSM: claimed→nafdac_verified (skips PCN)', () => {
    expect(isValidPharmacyChainTransition('claimed', 'nafdac_verified')).toBe(false);
  });

  it('T016 — guard PCN: claimed→pcn_verified requires PCN licence', () => {
    expect(guardClaimedToPcnVerified({ pcnLicence: null }).allowed).toBe(false);
    expect(guardClaimedToPcnVerified({ pcnLicence: '' }).allowed).toBe(false);
    expect(guardClaimedToPcnVerified({ pcnLicence: 'PCN/001' }).allowed).toBe(true);
  });

  it('T017 — guard NAFDAC: pcn_verified→nafdac_verified requires NAFDAC licence', () => {
    expect(guardPcnToNafdacVerified({ nafdacLicence: null }).allowed).toBe(false);
    expect(guardPcnToNafdacVerified({ nafdacLicence: 'NAFDAC/001' }).allowed).toBe(true);
  });

  it('T018 — AI L2 cap guard blocks L3+ autonomy', () => {
    expect(guardL2AiCap({ autonomyLevel: 3 }).allowed).toBe(false);
    expect(guardL2AiCap({ autonomyLevel: 2 }).allowed).toBe(true);
  });

  it('T019 — transitionStatus updates profile status', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Transit Pharm' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'claimed');
    expect(updated.status).toBe('claimed');
  });
});

describe('PharmacyChainRepository — Drug Inventory', () => {
  let repo: PharmacyChainRepository;
  beforeEach(() => { repo = new PharmacyChainRepository(makeDb() as never); });

  it('T020 — adds drug inventory with integer unit_price_kobo (P9)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Inventory Pharm' });
    const drug = await repo.addDrugInventory(p.id, 'tn1', {
      drugName: 'Paracetamol 500mg', nafdacReg: 'NAFDAC/04-1234', quantityInStock: 100,
      unitPriceKobo: 150000, wholesalePriceKobo: 100000, reorderLevel: 20, prescriptionRequired: false,
    });
    expect(drug.unitPriceKobo).toBe(150000);
    expect(drug.drugName).toBe('Paracetamol 500mg');
  });

  it('T021 — rejects float unit_price_kobo (P9)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Float Pharm' });
    await expect(repo.addDrugInventory(p.id, 'tn1', {
      drugName: 'Bad Drug', quantityInStock: 10, unitPriceKobo: 1500.50, wholesalePriceKobo: 1000,
    })).rejects.toThrow(/integer/i);
  });

  it('T022 — stores NAFDAC registration number', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'NAFDAC Pharm' });
    const drug = await repo.addDrugInventory(p.id, 'tn1', {
      drugName: 'Amoxicillin 500mg', nafdacReg: 'NAFDAC/AB-9876', quantityInStock: 50,
      unitPriceKobo: 200000, prescriptionRequired: true,
    });
    expect(drug.nafdacReg).toBe('NAFDAC/AB-9876');
    expect(drug.prescriptionRequired).toBe(true);
  });
});

describe('PharmacyChainRepository — Prescriptions & Sales', () => {
  let repo: PharmacyChainRepository;
  beforeEach(() => { repo = new PharmacyChainRepository(makeDb() as never); });

  it('T023 — dispenses prescription with integer total_kobo (P9)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Rx Pharm' });
    const drug = await repo.addDrugInventory(p.id, 'tn1', { drugName: 'Lisinopril 10mg', quantityInStock: 30, unitPriceKobo: 300000 });
    const dispensed = await repo.dispensePrescription(p.id, 'tn1', {
      patientRefId: 'patient-opaque-001', prescriberRefId: 'doctor-opaque-001',
      drugId: drug.id, quantity: 1, totalKobo: 300000, dispensedDate: Math.floor(Date.now() / 1000),
    });
    expect(dispensed.totalKobo).toBe(300000);
    expect(dispensed.status).toBe('pending');
  });

  it('T024 — rejects float total_kobo on prescription (P9)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Float Rx' });
    const drug = await repo.addDrugInventory(p.id, 'tn1', { drugName: 'Test Drug', quantityInStock: 10, unitPriceKobo: 100000 });
    await expect(repo.dispensePrescription(p.id, 'tn1', {
      patientRefId: 'p1', drugId: drug.id, quantity: 1, totalKobo: 100000.50, dispensedDate: Math.floor(Date.now() / 1000),
    })).rejects.toThrow(/integer/i);
  });

  it('T025 — patient_ref_id and prescriber_ref_id are opaque (P13)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'P13 Pharm' });
    const drug = await repo.addDrugInventory(p.id, 'tn1', { drugName: 'TestDrug', quantityInStock: 5, unitPriceKobo: 50000 });
    const rx = await repo.dispensePrescription(p.id, 'tn1', {
      patientRefId: 'patient-ref-xyz', prescriberRefId: 'dr-ref-abc',
      drugId: drug.id, quantity: 1, totalKobo: 50000, dispensedDate: Math.floor(Date.now() / 1000),
    });
    expect(rx.patientRefId).toBe('patient-ref-xyz');
    expect(rx.prescriberRefId).toBe('dr-ref-abc');
  });

  it('T026 — records drug sale with integer total_kobo (P9)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Sale Pharm' });
    const drug = await repo.addDrugInventory(p.id, 'tn1', { drugName: 'OTC Medication', quantityInStock: 100, unitPriceKobo: 50000 });
    const sale = await repo.recordSale(p.id, 'tn1', {
      drugId: drug.id, quantity: 2, unitPriceKobo: 50000, totalKobo: 100000,
      saleDate: Math.floor(Date.now() / 1000), isPrescription: false, isWholesale: false,
    });
    expect(sale.totalKobo).toBe(100000);
    expect(sale.isPrescription).toBe(false);
  });

  it('T027 — records wholesale sale correctly', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Wholesale Pharm', category: 'wholesale' });
    const drug = await repo.addDrugInventory(p.id, 'tn1', { drugName: 'Bulk Drug', quantityInStock: 500, unitPriceKobo: 50000, wholesalePriceKobo: 35000 });
    const sale = await repo.recordSale(p.id, 'tn1', {
      drugId: drug.id, quantity: 100, unitPriceKobo: 35000, totalKobo: 3500000,
      saleDate: Math.floor(Date.now() / 1000), isWholesale: true,
    });
    expect(sale.isWholesale).toBe(true);
    expect(sale.totalKobo).toBe(3500000);
  });

  it('T028 — rejects float total_kobo on sale (P9)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Float Sale' });
    const drug = await repo.addDrugInventory(p.id, 'tn1', { drugName: 'Drug X', quantityInStock: 10, unitPriceKobo: 50000 });
    await expect(repo.recordSale(p.id, 'tn1', {
      drugId: drug.id, quantity: 1, unitPriceKobo: 50000, totalKobo: 50000.99,
      saleDate: Math.floor(Date.now() / 1000),
    })).rejects.toThrow(/integer/i);
  });

  it('T029 — listSales returns tenant-scoped sales', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'List Sales Pharm' });
    const drug = await repo.addDrugInventory(p.id, 'tn1', { drugName: 'Listed Drug', quantityInStock: 50, unitPriceKobo: 100000 });
    await repo.recordSale(p.id, 'tn1', { drugId: drug.id, quantity: 1, unitPriceKobo: 100000, totalKobo: 100000, saleDate: Math.floor(Date.now() / 1000) });
    const sales = await repo.listSales(p.id, 'tn1');
    expect(sales.length).toBeGreaterThanOrEqual(1);
  });

  it('T030 — tenant isolation on sales list (T3)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn-A', businessName: 'TN-A Pharm' });
    const drug = await repo.addDrugInventory(p.id, 'tn-A', { drugName: 'A Drug', quantityInStock: 10, unitPriceKobo: 50000 });
    await repo.recordSale(p.id, 'tn-A', { drugId: drug.id, quantity: 1, unitPriceKobo: 50000, totalKobo: 50000, saleDate: Math.floor(Date.now() / 1000) });
    const salesB = await repo.listSales(p.id, 'tn-B');
    expect(salesB.length).toBe(0);
  });

  it('T031 — tenantId always present on all entities (T3)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn-invariant', businessName: 'T3 Pharm' });
    expect(p.tenantId).toBe('tn-invariant');
  });
});
