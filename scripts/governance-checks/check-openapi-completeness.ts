#!/usr/bin/env tsx
/**
 * Governance Check: OpenAPI Spec Completeness (CI-007) — Wave 3 C2-5
 *
 * Ensures every documented Hono route in the API has a corresponding
 * OpenAPI operation in docs/openapi/v1.yaml.
 *
 * Strategy:
 *   1. Parse .get/.post/.put/.patch/.delete registrations from router + route-group files.
 *   2. Parse path keys from docs/openapi/v1.yaml.
 *   3. Report any route missing an OpenAPI definition.
 *
 * Exempt (internal / infra routes that need no public docs):
 *   /health, /metrics, /internal/*, /__cf/*, /favicon
 *
 * Exit 0 = all routes documented (or check skipped gracefully).
 * Exit 1 = undocumented routes found.
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, join } from 'path';

const REPO_ROOT = resolve(process.cwd());
const ROUTER_FILES = [
  resolve(REPO_ROOT, 'apps/api/src/router.ts'),
  resolve(REPO_ROOT, 'apps/api/src/index.ts'),
];
const ROUTE_GROUP_DIR = resolve(REPO_ROOT, 'apps/api/src/route-groups');
const OPENAPI_FILE   = resolve(REPO_ROOT, 'docs/openapi/v1.yaml');

const EXEMPT_PREFIXES = ['/health', '/metrics', '/internal', '/__cf', '/favicon'];
const HTTP_METHODS   = ['get', 'post', 'put', 'patch', 'delete'];

function extractRoutes(source: string): { method: string; path: string }[] {
  const routes: { method: string; path: string }[] = [];
  for (const m of HTTP_METHODS) {
    const re = new RegExp(`\\.${m}\\s*\\(\\s*['"\`]([^'"\`]+)['"\`]`, 'g');
    let match: RegExpExecArray | null;
    while ((match = re.exec(source)) !== null) {
      routes.push({ method: m.toUpperCase(), path: match[1]! });
    }
  }
  return routes;
}

function extractOpenAPIPaths(yaml: string): Set<string> {
  const paths = new Set<string>();
  const re = /^\s{2}['"]?(\/[a-zA-Z0-9/_{}.-]+)['"]?\s*:/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(yaml)) !== null) paths.add(m[1]!);
  return paths;
}

function normalise(path: string): string {
  return path.replace(/:([a-zA-Z_]+)/g, '{$1}');
}

function isExempt(path: string): boolean {
  return EXEMPT_PREFIXES.some(p => path.startsWith(p));
}

// ── Collect source ───────────────────────────────────────────────────────
let combined = '';
for (const f of ROUTER_FILES) {
  if (existsSync(f)) combined += '\n' + readFileSync(f, 'utf8');
}
if (existsSync(ROUTE_GROUP_DIR)) {
  for (const f of readdirSync(ROUTE_GROUP_DIR)) {
    if (f.endsWith('.ts')) combined += '\n' + readFileSync(join(ROUTE_GROUP_DIR, f), 'utf8');
  }
}

if (!combined.trim()) {
  console.log('SKIP: No router source files found.');
  process.exit(0);
}

if (!existsSync(OPENAPI_FILE)) {
  console.error(`FAIL: OpenAPI spec not found: ${OPENAPI_FILE}`);
  process.exit(1);
}

const routes        = extractRoutes(combined).filter(r => !isExempt(r.path));
const openApiPaths  = extractOpenAPIPaths(readFileSync(OPENAPI_FILE, 'utf8'));

const undocumented = routes.filter(({ path }) => {
  const norm = normalise(path);
  return !openApiPaths.has(norm) && !openApiPaths.has(path);
});

if (undocumented.length > 0) {
  console.error(`\nFAIL: ${undocumented.length} route(s) missing from OpenAPI spec:`);
  for (const r of undocumented) console.error(`  ❌  ${r.method} ${r.path}`);
  console.error('\nAdd operations to docs/openapi/v1.yaml for these routes.\n');
  process.exit(1);
}

console.log(`PASS: All ${routes.length} API routes are documented in OpenAPI spec.`);
process.exit(0);
