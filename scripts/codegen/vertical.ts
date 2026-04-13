#!/usr/bin/env npx tsx
/**
 * WebWaka Vertical Codegen CLI (P2-A / MED-002)
 *
 * Generates the three files required to scaffold a new vertical:
 *   1. infra/db/migrations/<next>_<slug_snake>_profiles.sql
 *   2. infra/db/migrations/<next>_<slug_snake>_profiles.rollback.sql
 *   3. apps/api/src/routes/verticals/<slug>.ts
 *   4. apps/api/src/routes/verticals/<slug>.test.ts
 *
 * Usage:
 *   npx tsx scripts/codegen/vertical.ts \
 *     --slug laundry-shop \
 *     --category commerce \
 *     --fsm-states pending,active,suspended
 *
 * Governance invariants encoded into generated files:
 *   T3  — tenant_id on all DB queries (from auth context, never request body)
 *   T4  — Cloudflare Workers edge (no Node.js APIs)
 *   P9  — all monetary values INTEGER kobo (no floats)
 *
 * Notes:
 *   - The CLI is additive — it never overwrites existing files.
 *   - The generated route must be manually imported and mounted in index.ts.
 *   - The generated test starts with 1 placeholder passing test; expand manually.
 */

import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

function parseArgs(): { slug: string; category: string; fsmStates: string[] } {
  const args = process.argv.slice(2);
  let slug = '';
  let category = 'general';
  let fsmStates = ['pending', 'active'];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--slug' && args[i + 1]) {
      slug = args[++i];
    } else if (args[i] === '--category' && args[i + 1]) {
      category = args[++i];
    } else if (args[i] === '--fsm-states' && args[i + 1]) {
      fsmStates = args[++i].split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  if (!slug) {
    console.error('Error: --slug is required');
    console.error('Usage: npx tsx scripts/codegen/vertical.ts --slug <slug> [--category <category>] [--fsm-states <state1,state2,...>]');
    process.exit(1);
  }

  if (!/^[a-z][a-z0-9-]*$/.test(slug)) {
    console.error(`Error: --slug must be lowercase kebab-case (e.g. "laundry-shop"). Got: "${slug}"`);
    process.exit(1);
  }

  if (fsmStates.length < 1) {
    console.error('Error: --fsm-states must include at least one state');
    process.exit(1);
  }

  return { slug, category, fsmStates };
}

// ---------------------------------------------------------------------------
// Derivations
// ---------------------------------------------------------------------------

function toSnakeCase(slug: string): string {
  return slug.replace(/-/g, '_');
}

function toDisplayName(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function toIdPrefix(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0))
    .join('');
}

function toCamelCase(slug: string): string {
  const parts = slug.split('-');
  return parts[0] + parts.slice(1).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

function toPascalCase(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

// ---------------------------------------------------------------------------
// Migration number resolution
// ---------------------------------------------------------------------------

function resolveNextMigrationNumber(): string {
  const migrationsDir = path.resolve('infra/db/migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.error(`Error: migrations directory not found at ${migrationsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir);
  const numbers = files
    .map((f) => {
      const match = f.match(/^(\d{4})_/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((n): n is number => n !== null);

  if (numbers.length === 0) {
    return '0001';
  }

  const next = Math.max(...numbers) + 1;
  return String(next).padStart(4, '0');
}

// ---------------------------------------------------------------------------
// File existence check
// ---------------------------------------------------------------------------

function assertNotExists(filePath: string): void {
  if (fs.existsSync(filePath)) {
    console.error(`Error: File already exists — will not overwrite: ${filePath}`);
    console.error('Delete or rename the existing file before running codegen.');
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Template generators
// ---------------------------------------------------------------------------

function generateMigrationSql(
  migNumber: string,
  slug: string,
  slugSnake: string,
  displayName: string,
  fsmStates: string[],
): string {
  const firstState = fsmStates[0];
  const statesComment = fsmStates.join(', ');

  return `-- Migration ${migNumber}: ${slug}-profiles
-- ${displayName} vertical — profile table
-- Generated by: npx tsx scripts/codegen/vertical.ts
-- Invariants: T3 tenant isolation, P9 integer kobo

CREATE TABLE IF NOT EXISTS ${slugSnake}_profiles (
  id          TEXT NOT NULL PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  tenant_id   TEXT NOT NULL,
  fsm_state   TEXT NOT NULL DEFAULT '${firstState}', -- states: ${statesComment}
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (tenant_id)    REFERENCES tenants(id)
);

CREATE INDEX IF NOT EXISTS idx_${slugSnake}_profiles_workspace
  ON ${slugSnake}_profiles(workspace_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_${slugSnake}_profiles_tenant
  ON ${slugSnake}_profiles(tenant_id);
`;
}

function generateRollbackSql(slugSnake: string): string {
  return `DROP TABLE IF EXISTS ${slugSnake}_profiles;\n`;
}

function generateRouteTs(
  slug: string,
  slugSnake: string,
  displayName: string,
  idPrefix: string,
  camelName: string,
  fsmStates: string[],
): string {
  const firstState = fsmStates[0];
  const statesLiteral = fsmStates.map((s) => `'${s}'`).join(' | ');

  return `/**
 * ${displayName} vertical route
 * Generated by: npx tsx scripts/codegen/vertical.ts
 *
 * Governance invariants:
 *   T3 — tenantId from auth context only (c.get('auth')); never from request body or URL
 *   T4 — Cloudflare Workers edge runtime (no Node.js APIs)
 *   P9 — all monetary amounts must be INTEGER kobo
 *
 * Auth: applied globally in apps/api/src/router.ts — do NOT add authMiddleware here.
 */

import { Hono } from 'hono';
import type { Env } from '../../env.js';

const router = new Hono<{ Bindings: Env }>();

type AuthCtx = { userId: string; tenantId: string };

// GET /${slug}/workspace/:workspaceId — list profiles for a workspace (T3)
router.get('/workspace/:workspaceId', async (c) => {
  const { tenantId } = c.get('auth') as AuthCtx;
  const { workspaceId } = c.req.param();
  const rows = await c.env.DB.prepare(
    \`SELECT * FROM ${slugSnake}_profiles
     WHERE workspace_id = ? AND tenant_id = ?
     ORDER BY created_at DESC LIMIT 50\`,
  ).bind(workspaceId, tenantId).all();
  return c.json({ data: rows.results });
});

// GET /${slug}/:id — get a single profile by ID (T3)
router.get('/:id', async (c) => {
  const { tenantId } = c.get('auth') as AuthCtx;
  const { id } = c.req.param();
  const row = await c.env.DB.prepare(
    \`SELECT * FROM ${slugSnake}_profiles
     WHERE id = ? AND tenant_id = ? LIMIT 1\`,
  ).bind(id, tenantId).first();
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json(row);
});

// POST /${slug} — create a new profile
// T3: tenantId from auth context; workspace_id from request body.
router.post('/', async (c) => {
  const { tenantId } = c.get('auth') as AuthCtx;
  let body: { workspace_id?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id) return c.json({ error: 'workspace_id is required' }, 400);
  const id = \`${idPrefix}_\${crypto.randomUUID()}\`;
  await c.env.DB.prepare(
    \`INSERT INTO ${slugSnake}_profiles (id, workspace_id, tenant_id, fsm_state)
     VALUES (?, ?, ?, '${firstState}')\`,
  ).bind(id, body.workspace_id, tenantId).run();
  return c.json({ id }, 201);
});

// POST /${slug}/:id/transition — advance FSM state
// Valid transitions: ${fsmStates.join(' → ')}
router.post('/:id/transition', async (c) => {
  const { tenantId } = c.get('auth') as AuthCtx;
  const { id } = c.req.param();
  let body: { to_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to_status) return c.json({ error: 'to_status is required' }, 400);

  type State = ${statesLiteral};
  const VALID_STATES: State[] = ${JSON.stringify(fsmStates)} as State[];
  if (!VALID_STATES.includes(body.to_status as State)) {
    return c.json({ error: \`Invalid state. Valid states: \${VALID_STATES.join(', ')}\` }, 422);
  }

  const existing = await c.env.DB.prepare(
    \`SELECT id FROM ${slugSnake}_profiles WHERE id = ? AND tenant_id = ? LIMIT 1\`,
  ).bind(id, tenantId).first();
  if (!existing) return c.json({ error: 'Not found' }, 404);

  await c.env.DB.prepare(
    \`UPDATE ${slugSnake}_profiles SET fsm_state = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?\`,
  ).bind(body.to_status, id, tenantId).run();

  return c.json({ id, fsm_state: body.to_status });
});

export const ${camelName}Routes = router;
`;
}

function generateTestTs(
  slug: string,
  slugSnake: string,
  displayName: string,
  camelName: string,
  fsmStates: string[],
): string {
  const secondState = fsmStates[1] ?? fsmStates[0];

  return `/**
 * ${displayName} vertical — route tests
 * Generated by: npx tsx scripts/codegen/vertical.ts
 *
 * Invariants under test:
 *   T3 — tenant isolation (tenantId from auth context; cross-tenant returns 404)
 *   T4 — no Node.js runtime APIs used
 *   FSM — only valid states accepted in POST /transition
 */

import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { ${camelName}Routes } from './${slug}.js';

// ---------------------------------------------------------------------------
// D1 mock helpers (matches patterns used across all vertical tests)
// ---------------------------------------------------------------------------

interface D1Stmt {
  bind(...args: unknown[]): D1Stmt;
  run(): Promise<{ success: boolean }>;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
}

type SqlHandler = (sql: string, ...args: unknown[]) => unknown;

function makeDb(handlers: Record<string, SqlHandler> = {}): { prepare: (q: string) => D1Stmt } {
  const resolve = (sql: string): SqlHandler | null => {
    for (const [key, fn] of Object.entries(handlers)) {
      if (sql.includes(key)) return fn;
    }
    return null;
  };
  const stmtFor = (sql: string): D1Stmt => {
    const args: unknown[] = [];
    const stmt: D1Stmt = {
      bind: (...a: unknown[]) => { args.push(...a); return stmt; },
      run: async () => ({ success: true }),
      first: async <T>() => {
        const fn = resolve(sql);
        return fn ? (await fn(sql, ...args)) as T : null;
      },
      all: async <T>() => {
        const fn = resolve(sql);
        return fn ? { results: (await fn(sql, ...args)) as T[] } : { results: [] as T[] };
      },
    };
    return stmt;
  };
  return { prepare: (q: string) => stmtFor(q) };
}

function makeApp(db: ReturnType<typeof makeDb>, tenantId = 'ten_a') {
  const app = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  // Inject env bindings + auth context without JWT verification (standard test harness pattern)
  app.use('*', async (c, next) => {
    c.env = { DB: db, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never;
    c.set('auth', { userId: 'usr_test', tenantId });
    await next();
  });
  app.route('/${slug}', ${camelName}Routes);
  return app;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('${displayName} — GET /${slug}/workspace/:workspaceId', () => {
  it('returns 200 with empty list when no profiles exist', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/${slug}/workspace/wsp_a', { method: 'GET' });
    expect(res.status).toBe(200);
    const body = await res.json<{ data: unknown[] }>();
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('T3: binds workspaceId and tenantId in DB query', async () => {
    let capturedArgs: unknown[] = [];
    const db = makeDb({
      '${slugSnake}_profiles': (_sql: string, ...args: unknown[]) => {
        capturedArgs = args;
        return [];
      },
    });
    const app = makeApp(db, 'ten_a');
    await app.request('/${slug}/workspace/wsp_a');
    expect(capturedArgs).toContain('wsp_a');
    expect(capturedArgs).toContain('ten_a');
  });
});

describe('${displayName} — POST /${slug}', () => {
  it('returns 400 when workspace_id is missing', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/${slug}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it('creates a profile and returns 201 with id', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/${slug}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: 'wsp_a' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json<{ id: string }>();
    expect(typeof body.id).toBe('string');
  });
});

describe('${displayName} — GET /${slug}/:id', () => {
  it('returns 404 when profile does not exist', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/${slug}/nonexistent-id');
    expect(res.status).toBe(404);
  });

  it('T3: tenant_id is always bound in query (cross-tenant isolation)', async () => {
    let capturedArgs: unknown[] = [];
    const db = makeDb({
      'SELECT * FROM ${slugSnake}_profiles': (_sql: string, ...args: unknown[]) => {
        capturedArgs = args;
        return null;
      },
    });
    const app = makeApp(db, 'ten_a');
    await app.request('/${slug}/prof_xyz');
    expect(capturedArgs).toContain('ten_a');
  });
});

describe('${displayName} — POST /${slug}/:id/transition', () => {
  it('returns 422 for invalid to_status', async () => {
    const db = makeDb({
      'SELECT id FROM ${slugSnake}_profiles': () => ({ id: 'prf_001' }),
    });
    const app = makeApp(db);
    const res = await app.request('/${slug}/prf_001/transition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to_status: 'invalid_xyz' }),
    });
    expect(res.status).toBe(422);
  });

  it('advances state to "${secondState}" and returns 200', async () => {
    const db = makeDb({
      'SELECT id FROM ${slugSnake}_profiles': () => ({ id: 'prf_001' }),
    });
    const app = makeApp(db);
    const res = await app.request('/${slug}/prf_001/transition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to_status: '${secondState}' }),
    });
    expect(res.status).toBe(200);
  });

  it('returns 404 when profile not found', async () => {
    const app = makeApp(makeDb());
    const res = await app.request('/${slug}/missing_id/transition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to_status: '${secondState}' }),
    });
    expect(res.status).toBe(404);
  });
});
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const { slug, category, fsmStates } = parseArgs();

const slugSnake = toSnakeCase(slug);
const displayName = toDisplayName(slug);
const idPrefix = toIdPrefix(slug);
const camelName = toCamelCase(slug);
const migNumber = resolveNextMigrationNumber();

const migFile = path.resolve(`infra/db/migrations/${migNumber}_${slugSnake}_profiles.sql`);
const rollbackFile = path.resolve(`infra/db/migrations/${migNumber}_${slugSnake}_profiles.rollback.sql`);
const routeFile = path.resolve(`apps/api/src/routes/verticals/${slug}.ts`);
const testFile = path.resolve(`apps/api/src/routes/verticals/${slug}.test.ts`);

// Guard — never overwrite existing files
assertNotExists(migFile);
assertNotExists(rollbackFile);
assertNotExists(routeFile);
assertNotExists(testFile);

console.log(`\nWebWaka Vertical Codegen`);
console.log(`  Slug:        ${slug}`);
console.log(`  Snake:       ${slugSnake}`);
console.log(`  Display:     ${displayName}`);
console.log(`  ID prefix:   ${idPrefix}_`);
console.log(`  FSM states:  ${fsmStates.join(' → ')}`);
console.log(`  Migration:   ${migNumber}`);
console.log(`  Category:    ${category}`);
console.log('');

// Write migration
fs.writeFileSync(migFile, generateMigrationSql(migNumber, slug, slugSnake, displayName, fsmStates));
console.log(`✓ Created: ${migFile}`);

// Write rollback
fs.writeFileSync(rollbackFile, generateRollbackSql(slugSnake));
console.log(`✓ Created: ${rollbackFile}`);

// Ensure verticals route dir exists
fs.mkdirSync(path.dirname(routeFile), { recursive: true });

// Write route
fs.writeFileSync(routeFile, generateRouteTs(slug, slugSnake, displayName, idPrefix, camelName, fsmStates));
console.log(`✓ Created: ${routeFile}`);

// Write test
fs.writeFileSync(testFile, generateTestTs(slug, slugSnake, displayName, camelName, fsmStates));
console.log(`✓ Created: ${testFile}`);

console.log('');
console.log('Next steps:');
console.log(`  1. Apply migration: wrangler d1 migrations apply webwaka-os-staging --env staging`);
console.log(`  2. Import + mount in apps/api/src/router.ts:`);
console.log(`       import { ${camelName}Routes } from './routes/verticals/${slug}.js';`);
console.log(`       // then inside registerRoutes(app):`);
console.log(`       app.use('/${slug}/*', authMiddleware);`);
console.log(`       app.route('/${slug}', ${camelName}Routes);`);
console.log(`  3. Run: npx vitest run apps/api/src/routes/verticals/${slug}.test.ts`);
console.log('');
