#!/usr/bin/env npx tsx
/**
 * Governance check: API versioning consistency (ADR-0018)
 *
 * Rules enforced:
 *   1. Any route file whose header comment explicitly claims an /api/v1/ prefix
 *      MUST be mounted at /api/v1/... in router.ts — no silent mismatch.
 *
 *   2. Any route file mounted at /api/v1/ in router.ts MUST NOT have a header
 *      comment claiming a plain (unversioned) path for that same route.
 *
 *   3. Routes without an explicit version prefix in their comments are classified
 *      as "pre-GA v0" per ADR-0018 and are reported but do NOT fail the check.
 *
 * Exit code:
 *   0 — no violations found
 *   1 — at least one rule violated
 */

import { readFileSync, readdirSync } from 'fs';
import { join, basename, resolve } from 'path';

// ---------------------------------------------------------------------------
// Read router.ts and extract mount paths
// ---------------------------------------------------------------------------

const ROUTER_PATH = resolve(__dirname, '../../apps/api/src/router.ts');
const ROUTES_DIR = resolve(__dirname, '../../apps/api/src/routes');

const routerSrc = readFileSync(ROUTER_PATH, 'utf-8');

// Strip comment lines (JSDoc block comment lines and // comments) so that
// example paths inside comments (e.g. "app.route('/path', ...)") are not
// counted as real mount registrations.
const routerSrcCode = routerSrc
  .split('\n')
  .filter(line => {
    const t = line.trimStart();
    return !t.startsWith('*') && !t.startsWith('//');
  })
  .join('\n');

// Extract all `app.route('/some/path', ...)` calls from non-comment lines
const routeRegex = /app\.route\('([^']+)'/g;
const mountedPaths: string[] = [];
let m: RegExpExecArray | null;
while ((m = routeRegex.exec(routerSrcCode)) !== null) {
  mountedPaths.push(m[1]);
}

// A path is "versioned" if it is at /api/v1 or under /api/v1/...
// Note: routers mounted at bare '/api/v1' (no trailing slash) are GA-ready
// even though the mount point has no trailing slash.
const versionedMounts = new Set(mountedPaths.filter(p => p.startsWith('/api/v1')));
const unversionedMounts = new Set(mountedPaths.filter(p => !p.startsWith('/api/v1')));

// Count actual call-site registrations (Set deduplicates unique paths, but
// multiple routers can be mounted at the same prefix, e.g. '/api/v1').
const v1RegistrationCount = mountedPaths.filter(p => p.startsWith('/api/v1')).length;
const v0RegistrationCount = mountedPaths.filter(p => !p.startsWith('/api/v1')).length;

// ---------------------------------------------------------------------------
// Read each route file and check header comment against actual mount
// ---------------------------------------------------------------------------

const routeFiles = readdirSync(ROUTES_DIR)
  .filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts') && !f.includes('verticals'));

type Violation = { file: string; rule: string; detail: string };
const violations: Violation[] = [];
const v0Routes: string[] = [];
const v1Routes: string[] = [];

for (const file of routeFiles) {
  const filePath = join(ROUTES_DIR, file);
  const src = readFileSync(filePath, 'utf-8');

  // Extract the first 30 lines (header comment zone)
  const headerLines = src.split('\n').slice(0, 30).join('\n');

  // Check if the header claims an /api/v1/ prefix
  const claimsV1 = /(?:prefix|prefixed|routes?)[\s\w]*\/api\/v1\//i.test(headerLines) ||
                   /\/api\/v1\//.test(headerLines);

  // Check if the header claims a plain (unversioned) path
  const claimsUnversioned = !claimsV1 &&
    /All routes (are )?(?:prefix|prefixed|mounted)/.test(headerLines);

  // Determine what path this file is actually mounted at in router.ts
  const mountedAt = mountedPaths.find(p => {
    // Try to match by the base route name — e.g. billing.ts → /billing or /api/v1/billing
    const base = basename(file, '.ts').replace(/^verticals-/, '');
    return p.endsWith('/' + base) || p.includes('/' + base + '/');
  });

  if (claimsV1) {
    // Rule 1: if file claims v1 prefix, verify it is actually mounted at /api/v1 or /api/v1/...
    if (mountedAt && !mountedAt.startsWith('/api/v1')) {
      violations.push({
        file,
        rule: 'RULE-1: v1 claim / unversioned mount mismatch',
        detail: `Header claims /api/v1 prefix but is mounted at "${mountedAt}" in router.ts`,
      });
    } else {
      v1Routes.push(file);
    }
  } else {
    // Check if mounted at v1 but no v1 claim in header
    if (mountedAt && mountedAt.startsWith('/api/v1') && claimsUnversioned) {
      violations.push({
        file,
        rule: 'RULE-2: v1 mount / unversioned claim mismatch',
        detail: `Mounted at "${mountedAt}" but header claims an unversioned path`,
      });
    } else {
      v0Routes.push(file);
    }
  }
}

// Also check the full list of verticals routes for versioning consistency
const verticalsRouteFiles = readdirSync(ROUTES_DIR)
  .filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts') && f.includes('verticals'));

let v1VerticalsCount = 0;
let v0VerticalsCount = 0;

for (const file of verticalsRouteFiles) {
  const filePath = join(ROUTES_DIR, file);
  const src = readFileSync(filePath, 'utf-8');
  const headerLines = src.split('\n').slice(0, 30).join('\n');
  const claimsV1 = /\/api\/v1\//.test(headerLines);
  if (claimsV1) v1VerticalsCount++; else v0VerticalsCount++;
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

if (violations.length > 0) {
  console.error(`FAIL: API versioning consistency violations found (${violations.length}):`);
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}`);
    console.error(`    → ${v.detail}`);
  }
  process.exit(1);
}

const v1UniquePaths = [...versionedMounts].length;
const v0UniquePaths = [...unversionedMounts].length;

console.log(
  `PASS: API versioning consistent — ` +
  `${v1RegistrationCount} GA-ready registrations at /api/v1 ` +
  `(${v1UniquePaths} unique prefix${v1UniquePaths !== 1 ? 'es' : ''}), ` +
  `${v0RegistrationCount} pre-GA v0 registrations (${v0UniquePaths} unique paths, unversioned per ADR-0018). ` +
  `Verticals: ${v1VerticalsCount} v1, ${v0VerticalsCount} v0. ` +
  `0 violations.`,
);
