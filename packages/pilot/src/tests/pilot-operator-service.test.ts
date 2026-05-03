import { describe, it, expect, beforeEach } from 'vitest';
import { PilotOperatorService } from '../pilot-operator-service.js';


// ---------------------------------------------------------------------------
// Minimal in-memory D1 stub
// ---------------------------------------------------------------------------

type Row = Record<string, unknown>;

class StubDB {
  private tables: Record<string, Row[]> = { pilot_operators: [] };

  prepare(sql: string) {
    const tables = this.tables;
    const sqlUpper = sql.trim().toUpperCase();

    return {
      bind: (...args: unknown[]) => ({
        run: async () => {
          if (sqlUpper.startsWith('INSERT INTO PILOT_OPERATORS')) {
            const row: Row = {
              id: args[0],
              tenant_id: args[1],
              workspace_id: args[2],
              vertical_slug: args[3],
              operator_name: args[4],
              contact_phone: args[5],
              contact_email: args[6],
              lga: args[7],
              state: args[8],
              cohort: args[9],
              status: 'invited',
              notes: args[10],
              created_at: args[11],
              updated_at: args[12],
              onboarded_at: null,
              first_txn_at: null,
              graduated_at: null,
            };
            tables.pilot_operators.push(row);
          } else if (sqlUpper.startsWith('UPDATE PILOT_OPERATORS')) {
            // Handle status transitions
            const tenantId = args[args.length - 1] as string;
            for (const row of tables.pilot_operators) {
              if (row.tenant_id === tenantId) {
                if (args[0] !== undefined) row.status = args[0];
                if (args[1] !== undefined) row.updated_at = args[1];
                if (typeof args[2] === 'string' && args[2].includes('T')) {
                  // extra field (onboarded_at or graduated_at)
                  const now = args[2];
                  if (row.status === 'active' && !row.onboarded_at) row.onboarded_at = now;
                  if (row.status === 'graduated' && !row.graduated_at) row.graduated_at = now;
                }
              }
            }
          }
          return { meta: { changes: 1 } };
        },
        first: async <T>() => {
          const id = args[0] as string;
          const found = tables.pilot_operators.find((r) => r.id === id || r.tenant_id === id);
          return (found ?? null) as T | null;
        },
        all: async <T>() => {
          let results = tables.pilot_operators;
          if (args[0]) {
            const val = args[0] as string;
            results = results.filter(
              (r) => r.cohort === val || r.status === val,
            );
          }
          return { results: results as T[] };
        },
      }),
    };
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PilotOperatorService', () => {
  let svc: PilotOperatorService;

  beforeEach(() => {
    svc = new PilotOperatorService(new StubDB() as never);
  });

  it('enrols a new pilot operator with status=invited', async () => {
    const op = await svc.enrol({
      tenant_id: 'tenant_001',
      workspace_id: 'ws_001',
      vertical_slug: 'restaurant',
      operator_name: 'Mama Chuks Kitchen',
      state: 'Lagos',
      cohort: 'cohort_1',
    });

    expect(op.status).toBe('invited');
    expect(op.tenant_id).toBe('tenant_001');
    expect(op.vertical_slug).toBe('restaurant');
    expect(op.cohort).toBe('cohort_1');
  });

  it('defaults state to Lagos if not provided', async () => {
    const op = await svc.enrol({
      tenant_id: 'tenant_002',
      workspace_id: 'ws_002',
      vertical_slug: 'pharmacy',
      operator_name: 'Apex Pharmacy',
    });
    expect(op.state).toBe('Lagos');
  });

  it('defaults cohort to cohort_1 if not provided', async () => {
    const op = await svc.enrol({
      tenant_id: 'tenant_003',
      workspace_id: 'ws_003',
      vertical_slug: 'hotel',
      operator_name: 'Naija Suites',
    });
    expect(op.cohort).toBe('cohort_1');
  });

  it('transitions status without throwing', async () => {
    await svc.enrol({
      tenant_id: 'tenant_004',
      workspace_id: 'ws_004',
      vertical_slug: 'logistics-delivery',
      operator_name: 'FastWay Logistics',
    });
    await expect(svc.transition('tenant_004', 'active')).resolves.toBeUndefined();
  });

  it('get returns null for unknown tenant', async () => {
    const result = await svc.get('nonexistent_tenant');
    expect(result).toBeNull();
  });

  it('summary returns zero counts for empty state', async () => {
    const summary = await svc.summary();
    expect(summary.invited).toBe(0);
    expect(summary.active).toBe(0);
    expect(summary.graduated).toBe(0);
  });

  it('enrols an operator with full optional fields', async () => {
    const op = await svc.enrol({
      tenant_id: 'tenant_005',
      workspace_id: 'ws_005',
      vertical_slug: 'supermarket',
      operator_name: 'ChoiceShop',
      contact_phone: '+2348012345678',
      contact_email: 'shop@choiceshop.ng',
      lga: 'Alimosho',
      state: 'Lagos',
      cohort: 'cohort_2',
      notes: 'Referred by partner',
    });

    expect(op.lga).toBe('Alimosho');
    expect(op.contact_phone).toBe('+2348012345678');
    expect(op.cohort).toBe('cohort_2');
    expect(op.notes).toBe('Referred by partner');
  });
});
