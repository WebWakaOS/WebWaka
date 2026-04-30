/**
 * @webwaka/vertical-engine — Test Suite
 *
 * Tests: FSM, CRUD, Registry, Route Generation
 * Verifies: T3 (tenant isolation), P9 (kobo integers), P13 (PII exclusion)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { FSMEngine } from './fsm.js';
import { VerticalCRUD } from './crud.js';
import { VerticalEngine } from './engine.js';
import { getVerticalConfig, getRegistry, listSlugs, getRegistryStats } from './registry.js';
import { generateRoutes } from './generators/route-generator.js';
import type { VerticalConfig, FSMConfig } from './schema.js';

// ---------------------------------------------------------------------------
// Mock D1 Database
// ---------------------------------------------------------------------------

function makeDb() {
  const tables = new Map<string, Map<string, Record<string, unknown>>>();

  function getTable(name: string) {
    if (!tables.has(name)) tables.set(name, new Map());
    return tables.get(name)!;
  }

  return {
    prepare: (sql: string) => ({
      bind: (...vals: unknown[]) => ({
        run: async () => {
          const upper = sql.trim().toUpperCase();
          if (upper.startsWith('INSERT')) {
            const tM = sql.match(/INTO\s+(\w+)/i);
            const cM = sql.match(/\(([^)]+)\)\s+VALUES/i);
            // Use greedy match for VALUES to handle unixepoch() parentheses
            const vIdx = sql.toUpperCase().indexOf('VALUES');
            let vContent = '';
            if (vIdx >= 0) {
              const afterValues = sql.slice(vIdx + 6).trim();
              // Strip outer parens
              if (afterValues.startsWith('(') && afterValues.endsWith(')')) {
                vContent = afterValues.slice(1, -1);
              }
            }
            if (tM && cM && vContent) {
              const table = tM[1]!;
              const cols = cM[1]!.split(',').map((c: string) => c.trim());
              // Split tokens handling unixepoch() as a single token
              const tokens: string[] = [];
              let depth = 0;
              let current = '';
              for (const ch of vContent) {
                if (ch === '(' && current.trim().toLowerCase().endsWith('unixepoch')) depth++;
                if (ch === ')' && depth > 0) { depth--; current += ch; continue; }
                if (ch === ',' && depth === 0) { tokens.push(current.trim()); current = ''; continue; }
                current += ch;
              }
              if (current.trim()) tokens.push(current.trim());

              const row: Record<string, unknown> = {};
              let bi = 0;
              cols.forEach((col: string, i: number) => {
                const tok = tokens[i] ?? '?';
                if (tok === '?') row[col] = vals[bi++];
                else if (tok.toLowerCase().includes('unixepoch')) row[col] = Math.floor(Date.now() / 1000);
                else if (tok.startsWith("'")) row[col] = tok.slice(1, -1);
                else row[col] = vals[bi++];
              });
              getTable(table).set(String(row['id']), row);
            }
          } else if (upper.startsWith('UPDATE')) {
            const tM = sql.match(/UPDATE\s+(\w+)/i);
            const setM = sql.match(/SET\s+(.+)\s+WHERE/i);
            if (tM && setM) {
              const table = tM[1]!;
              // Extract the WHERE id=? AND tenant_id=? values (last 2 in bind)
              const id = vals[vals.length - 2] as string;
              const tid = vals[vals.length - 1] as string;
              const row = getTable(table).get(id);
              if (row && row['tenant_id'] === tid) {
                // Parse SET clauses
                const setCols = setM[1]!.split(',').map(s => s.trim());
                let bi = 0;
                for (const clause of setCols) {
                  const eqParts = clause.split('=');
                  const colName = eqParts[0]!.trim();
                  const valExpr = eqParts[1]!.trim();
                  if (valExpr === '?') row[colName] = vals[bi++];
                  else if (valExpr.toLowerCase() === 'unixepoch()') row[colName] = Math.floor(Date.now() / 1000);
                }
                getTable(table).set(id, row);
              }
            }
          }
          return { success: true };
        },
        first: async <T>() => {
          const tM = sql.match(/FROM\s+(\w+)/i);
          if (!tM) return null as T;
          const table = tM[1]!;
          const tbl = getTable(table);
          // Determine query type
          if (sql.includes('workspace_id=?')) {
            const wsId = vals[0] as string;
            const tid = vals[1] as string;
            for (const row of tbl.values()) {
              if (row['workspace_id'] === wsId && row['tenant_id'] === tid) return row as T;
            }
            return null as T;
          }
          const id = vals[0] as string;
          const tid = vals[1] as string | undefined;
          const row = tbl.get(id);
          if (!row) return null as T;
          if (tid && row['tenant_id'] !== tid) return null as T;
          return row as T;
        },
        all: async <T>() => {
          const tM = sql.match(/FROM\s+(\w+)/i);
          if (!tM) return { results: [] as T[] };
          const table = tM[1]!;
          const tbl = getTable(table);
          const results: Record<string, unknown>[] = [];
          const tid = vals[0] as string;
          for (const row of tbl.values()) {
            if (row['tenant_id'] === tid) results.push(row);
          }
          return { results: results as T[] };
        },
      }),
    }),
  };
}

// ---------------------------------------------------------------------------
// FSMEngine Tests
// ---------------------------------------------------------------------------

describe('FSMEngine', () => {
  const config: FSMConfig = {
    states: ['seeded', 'claimed', 'verified', 'active', 'suspended'],
    initialState: 'seeded',
    transitions: [
      { from: 'seeded', to: 'claimed' },
      { from: 'claimed', to: 'verified', guard: 'checkLicense' },
      { from: 'verified', to: 'active' },
      { from: 'active', to: 'suspended' },
      { from: 'suspended', to: 'active' },
    ],
    guards: [
      { name: 'checkLicense', requiredFields: ['license'], rule: 'license present', failureMessage: 'License required' },
    ],
  };

  let fsm: FSMEngine;
  beforeEach(() => { fsm = new FSMEngine(config); });

  it('returns correct initial state', () => {
    expect(fsm.initialState).toBe('seeded');
  });

  it('validates legal transition', () => {
    expect(fsm.isValidTransition('seeded', 'claimed')).toBe(true);
  });

  it('rejects illegal transition', () => {
    expect(fsm.isValidTransition('seeded', 'active')).toBe(false);
  });

  it('returns next states', () => {
    expect(fsm.getNextStates('claimed')).toEqual(['verified']);
  });

  it('returns guard name for guarded transition', () => {
    expect(fsm.getGuardName('claimed', 'verified')).toBe('checkLicense');
  });

  it('returns undefined for unguarded transition', () => {
    expect(fsm.getGuardName('seeded', 'claimed')).toBeUndefined();
  });

  it('validate() returns valid for legal transition', () => {
    expect(fsm.validate('seeded', 'claimed')).toEqual({ valid: true });
  });

  it('validate() returns invalid with reason for illegal transition', () => {
    const result = fsm.validate('seeded', 'active');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('not allowed');
  });

  it('validate() returns invalid for unknown state', () => {
    const result = fsm.validate('unknown', 'claimed');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Unknown state');
  });

  it('toTransitionPairs() returns correct pairs', () => {
    expect(fsm.toTransitionPairs()).toHaveLength(5);
    expect(fsm.toTransitionPairs()[0]).toEqual(['seeded', 'claimed']);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Registry', () => {
  it('has at least 5 initial verticals', () => {
    expect(listSlugs().length).toBeGreaterThanOrEqual(5);
  });

  it('getVerticalConfig returns config for known slug', () => {
    const config = getVerticalConfig('bakery');
    expect(config).toBeDefined();
    expect(config!.slug).toBe('bakery');
    expect(config!.displayName).toBe('Bakery / Confectionery');
  });

  it('getVerticalConfig returns undefined for unknown slug', () => {
    expect(getVerticalConfig('nonexistent')).toBeUndefined();
  });

  it('getRegistryStats returns correct totals', () => {
    const stats = getRegistryStats();
    expect(stats.total).toBeGreaterThanOrEqual(5);
    expect(stats.byPillar[2]).toBeGreaterThan(0); // Marketplace verticals
  });

  it('all configs have required fields', () => {
    const registry = getRegistry();
    for (const [slug, config] of Object.entries(registry)) {
      expect(config.slug).toBe(slug);
      expect(config.displayName).toBeTruthy();
      expect(config.tableName).toBeTruthy();
      expect(config.fsm.states.length).toBeGreaterThan(0);
      expect(config.fsm.initialState).toBe('seeded');
      expect(config.ai.allowedCapabilities.length).toBeGreaterThan(0);
    }
  });

  it('gym has gym-fitness as deprecated alias', () => {
    const gymConfig = getVerticalConfig('gym');
    expect(gymConfig!.deprecatedAliases).toContain('gym-fitness');
  });
});

// ---------------------------------------------------------------------------
// VerticalCRUD Tests (using bakery config)
// ---------------------------------------------------------------------------

describe('VerticalCRUD', () => {
  let crud: VerticalCRUD;
  const bakeryConfig = getVerticalConfig('bakery')!;

  beforeEach(() => {
    crud = new VerticalCRUD(bakeryConfig, makeDb() as never);
  });

  it('creates profile with initial FSM state (seeded)', async () => {
    const profile = await crud.createProfile(
      { bakeryName: 'Mama Joy Bakery' },
      'tenant_1',
      'ws_1',
    );
    expect(profile['status']).toBe('seeded');
    expect(profile['tenantId']).toBe('tenant_1');
    expect(profile['workspaceId']).toBe('ws_1');
    expect(profile['bakeryName']).toBe('Mama Joy Bakery');
  });

  it('findById enforces T3 tenant isolation', async () => {
    const profile = await crud.createProfile(
      { bakeryName: 'Test Bakery' },
      'tenant_1',
      'ws_1',
    );
    const id = profile['id'] as string;
    // Same tenant: found
    expect(await crud.findById(id, 'tenant_1')).not.toBeNull();
    // Different tenant: not found (T3)
    expect(await crud.findById(id, 'tenant_OTHER')).toBeNull();
  });

  it('P9 validation enforced on sub-entity create (kobo must be integer)', async () => {
    // unitPriceKobo is a sub-entity (products) field, not a profile field
    // P9 enforcement is on sub-entity creation, which we test here
    const profile = await crud.createProfile(
      { bakeryName: 'P9 Test Bakery' },
      'tenant_1',
      'ws_1',
    );
    const profileId = profile['id'] as string;
    const productsDef = bakeryConfig.subEntities![0]!;

    // Should reject float kobo (P9 violation)
    await expect(
      crud.createSubEntity(productsDef, profileId, 'tenant_1', {
        productName: 'Bad Bread',
        category: 'bread',
        unitPriceKobo: 10.5, // NOT integer — P9 violation
      }),
    ).rejects.toThrow('must be an integer (P9)');
  });

  it('advanceState validates FSM', async () => {
    const profile = await crud.createProfile(
      { bakeryName: 'FSM Bakery' },
      'tenant_1',
      'ws_1',
    );
    const id = profile['id'] as string;

    // Valid transition: seeded → claimed
    const result = await crud.advanceState(id, 'tenant_1', 'claimed');
    expect(result.success).toBe(true);
    expect(result.profile!['status']).toBe('claimed');

    // Invalid transition: claimed → active (must go through nafdac_verified)
    const result2 = await crud.advanceState(id, 'tenant_1', 'active');
    expect(result2.success).toBe(false);
    expect(result2.reason).toContain('not allowed');
  });

  it('getAISafeFields excludes PII fields (P13)', () => {
    const safeFields = crud.getAISafeFields();
    const piiFields = safeFields.filter(f => f.isPII);
    expect(piiFields).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// VerticalEngine Tests
// ---------------------------------------------------------------------------

describe('VerticalEngine', () => {
  let engine: VerticalEngine;
  const gymConfig = getVerticalConfig('gym')!;

  beforeEach(() => {
    engine = new VerticalEngine(gymConfig, makeDb() as never);
  });

  it('creates profile and advances state', async () => {
    const profile = await engine.createProfile(
      { businessName: 'Iron Gym Lagos' },
      'tenant_gym',
      'ws_gym',
    );
    expect(profile['status']).toBe('seeded');

    const result = await engine.advanceState(profile['id'] as string, 'tenant_gym', 'claimed');
    expect(result.success).toBe(true);
  });

  it('isCapabilityAllowed checks config', () => {
    expect(engine.isCapabilityAllowed('bio_generator')).toBe(true);
    expect(engine.isCapabilityAllowed('price_suggest')).toBe(false); // Not in allowed list
  });

  it('getAISafeProjection excludes PII', () => {
    const safe = engine.getAISafeProjection();
    expect(safe).not.toContain('memberRefId'); // memberRefId is PII in gym memberships
  });
});

// ---------------------------------------------------------------------------
// Route Generator Tests
// ---------------------------------------------------------------------------

describe('generateRoutes', () => {
  it('generates a Hono router for a vertical config', () => {
    const bakeryConfig = getVerticalConfig('bakery')!;
    const router = generateRoutes(bakeryConfig);
    expect(router).toBeDefined();
    // Hono router has .routes property
    expect(router.routes).toBeDefined();
  });

  it('generated router has expected route count (CRUD + sub-entities)', () => {
    const bakeryConfig = getVerticalConfig('bakery')!;
    const router = generateRoutes(bakeryConfig);
    // POST /, GET /:id, PATCH /:id, POST /:id/advance, GET /workspace/:workspaceId
    // + 2 sub-entities × 2 routes each (POST + GET)
    const routes = router.routes;
    expect(routes.length).toBeGreaterThanOrEqual(5); // At minimum 5 profile routes
  });
});
