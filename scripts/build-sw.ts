#!/usr/bin/env tsx
/**
 * scripts/build-sw.ts — ARC-18 Service Worker Cache Auto-Versioning
 *
 * Injects a BUILD_TIMESTAMP into each app's sw.js, replacing the
 * __CACHE_VERSION__ token. Run this as part of the CI/CD build pipeline
 * before deploying, so each deploy gets a unique cache bucket and stale
 * assets are automatically evicted from user browsers.
 *
 * Usage:
 *   npx tsx scripts/build-sw.ts
 *   # or: node --loader ts-node/esm scripts/build-sw.ts
 *
 * The token in sw.js source: __CACHE_VERSION__
 * Gets replaced with: YYYYMMDD_HHmm (UTC) e.g. 20260414_0930
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SW_PATHS: string[] = [
  'apps/admin-dashboard/public/sw.js',
  'apps/partner-admin/public/sw.js',
];

const TOKEN = '__CACHE_VERSION__';

function buildTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    now.getUTCFullYear().toString() +
    pad(now.getUTCMonth() + 1) +
    pad(now.getUTCDate()) +
    '_' +
    pad(now.getUTCHours()) +
    pad(now.getUTCMinutes())
  );
}

function main() {
  const version = process.env.CACHE_VERSION ?? buildTimestamp();
  let processed = 0;
  let skipped = 0;

  for (const rel of SW_PATHS) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) {
      console.warn(`[build-sw] SKIP (not found): ${rel}`);
      skipped++;
      continue;
    }

    const src = fs.readFileSync(abs, 'utf8');
    if (!src.includes(TOKEN)) {
      console.warn(`[build-sw] SKIP (token absent): ${rel}`);
      skipped++;
      continue;
    }

    const updated = src.replaceAll(TOKEN, version);
    fs.writeFileSync(abs, updated, 'utf8');
    console.log(`[build-sw] OK  ${rel}  →  cache version: ${version}`);
    processed++;
  }

  console.log(`\n[build-sw] Done — ${processed} updated, ${skipped} skipped.`);
  if (processed === 0 && skipped === SW_PATHS.length) {
    process.exit(1);
  }
}

main();
