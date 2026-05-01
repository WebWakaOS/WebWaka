#!/usr/bin/env tsx
/**
 * Governance check: H-6 — Cross-Worker Security Header Consistency
 *
 * Verifies that every HTTP-serving Cloudflare Worker entry point applies
 * the required security baseline middleware:
 *   1. secureHeaders()    — Hono built-in (CSP, HSTS, X-Frame-Options, etc.)
 *   2. CORS middleware    — from hono/cors (N/A for non-browser workers)
 *   3. X-Request-ID      — request-ID propagation for distributed tracing
 *
 * Workers that serve only queue/cron handlers (no browser fetch surface)
 * are explicitly exempt from CORS and request-ID checks.
 *
 * Exit 0 = all checks pass.  Exit 1 = one or more workers fail.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

interface WorkerConfig {
  /** Display name for error messages */
  name: string;
  /** Path to the worker entry point relative to repo root */
  entryPoint: string;
  /** Additional source files that may carry the middleware (e.g. middleware/index.ts) */
  auxiliaryFiles?: string[];
  /**
   * true = worker serves HTTP to browsers and must have CORS + requestId.
   * false = pure queue/cron worker; only secureHeaders is checked.
   */
  httpSurface: boolean;
}

// ---------------------------------------------------------------------------
// Worker registry
// ---------------------------------------------------------------------------
const WORKERS: WorkerConfig[] = [
  {
    name: 'api',
    entryPoint: 'apps/api/src/index.ts',
    auxiliaryFiles: ['apps/api/src/middleware/index.ts'],
    httpSurface: true,
  },
  {
    name: 'admin-dashboard',
    entryPoint: 'apps/admin-dashboard/src/index.ts',
    httpSurface: true,
  },
  {
    name: 'brand-runtime',
    entryPoint: 'apps/brand-runtime/src/index.ts',
    httpSurface: true,
  },
  {
    name: 'partner-admin',
    entryPoint: 'apps/partner-admin/src/index.ts',
    httpSurface: true,
  },
  {
    name: 'projections',
    entryPoint: 'apps/projections/src/index.ts',
    httpSurface: true,
  },
  {
    name: 'public-discovery',
    entryPoint: 'apps/public-discovery/src/index.ts',
    httpSurface: true,
  },
  {
    name: 'tenant-public',
    entryPoint: 'apps/tenant-public/src/index.ts',
    httpSurface: true,
  },
  {
    name: 'notificator',
    entryPoint: 'apps/notificator/src/index.ts',
    // Queue consumer + health probe only — no browser clients; CORS N/A
    httpSurface: false,
  },
  {
    name: 'ussd-gateway',
    entryPoint: 'apps/ussd-gateway/src/index.ts',
    // USSD telco protocol — no browser origin; CORS N/A
    httpSurface: false,
  },
  // schedulers: pure cron worker, no Hono app — fully exempt
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname_local = dirname(__filename);
const REPO_ROOT = resolve(__dirname_local, '../..');

function loadSources(worker: WorkerConfig): string {
  const files = [worker.entryPoint, ...(worker.auxiliaryFiles ?? [])];
  return files
    .map((rel) => {
      const abs = resolve(REPO_ROOT, rel);
      if (!existsSync(abs)) {
        console.error(`  ✗  [${worker.name}] entry point not found: ${rel}`);
        process.exit(1);
      }
      return readFileSync(abs, 'utf8');
    })
    .join('\n');
}

function check(source: string, pattern: RegExp): boolean {
  return pattern.test(source);
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------
const RULES = {
  secureHeaders: /secureHeaders\s*\(/,
  cors: /\bcors\s*\(/,
  requestId: /X-Request-ID|requestId/,
} as const;

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
let failures = 0;

for (const worker of WORKERS) {
  const src = loadSources(worker);
  const errs: string[] = [];

  if (!check(src, RULES.secureHeaders)) {
    errs.push('missing secureHeaders()');
  }

  if (worker.httpSurface) {
    if (!check(src, RULES.cors)) {
      errs.push('missing cors() middleware');
    }
    if (!check(src, RULES.requestId)) {
      errs.push('missing X-Request-ID / requestId middleware');
    }
  }

  if (errs.length === 0) {
    console.log(`  ✓  ${worker.name}${worker.httpSurface ? '' : ' (queue/cron — CORS+requestId exempt)'}`);
  } else {
    console.error(`  ✗  ${worker.name}: ${errs.join(', ')}`);
    failures++;
  }
}

console.log('');
if (failures === 0) {
  console.log(`✅  Security baseline check passed for all ${WORKERS.length} workers.`);
  process.exit(0);
} else {
  console.error(`❌  ${failures} worker(s) failed the security baseline check.`);
  console.error('    Each HTTP-facing worker must call secureHeaders(), cors(), and set X-Request-ID.');
  process.exit(1);
}
