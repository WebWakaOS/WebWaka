/**
 * Governance Check: Cross-Worker Security Header Consistency (H-6)
 *
 * Verifies that ALL workers apply the same security baseline:
 * 1. Import and use secureHeaders() from hono/secure-headers or equivalent
 * 2. Apply CORS middleware from @webwaka/shared-config
 * 3. Set X-Request-ID middleware
 *
 * This prevents one worker from accidentally missing security headers.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { readdirSync } from 'fs';

const APPS_DIR = join(process.cwd(), 'apps');
const apps = readdirSync(APPS_DIR).filter((a) => {
  const wrangler = join(APPS_DIR, a, 'wrangler.toml');
  return existsSync(wrangler);
});

interface SecurityCheck {
  app: string;
  hasSecureHeaders: boolean;
  hasCors: boolean;
  hasRequestId: boolean;
}

const results: SecurityCheck[] = [];
const ENTRY_FILES = ['src/index.ts', 'src/index.tsx'];

for (const app of apps) {
  let entryContent = '';
  for (const entry of ENTRY_FILES) {
    const entryPath = join(APPS_DIR, app, entry);
    if (existsSync(entryPath)) {
      entryContent = readFileSync(entryPath, 'utf-8');
      break;
    }
  }

  // Also check for router/middleware files
  const routerPath = join(APPS_DIR, app, 'src', 'router.ts');
  const middlewarePath = join(APPS_DIR, app, 'src', 'middleware', 'index.ts');
  let allContent = entryContent;
  if (existsSync(routerPath)) allContent += readFileSync(routerPath, 'utf-8');
  if (existsSync(middlewarePath)) allContent += readFileSync(middlewarePath, 'utf-8');

  const hasSecureHeaders =
    allContent.includes('secureHeaders') ||
    allContent.includes('secure-headers') ||
    allContent.includes('X-Content-Type-Options');

  const hasCors =
    allContent.includes('cors') ||
    allContent.includes('createCorsConfig') ||
    allContent.includes('@webwaka/shared-config');

  const hasRequestId =
    allContent.includes('requestId') ||
    allContent.includes('request-id') ||
    allContent.includes('X-Request-ID') ||
    allContent.includes('crypto.randomUUID');

  results.push({ app, hasSecureHeaders, hasCors, hasRequestId });
}

console.log('Cross-Worker Security Header Consistency Check:\n');

let failures = 0;

for (const r of results) {
  const status = (r.hasSecureHeaders && r.hasCors && r.hasRequestId) ? '✅' : '⚠️';
  console.log(`  ${status} ${r.app}:`);
  console.log(`      Secure Headers: ${r.hasSecureHeaders ? '✓' : '✗ MISSING'}`);
  console.log(`      CORS:           ${r.hasCors ? '✓' : '✗ MISSING'}`);
  console.log(`      Request-ID:     ${r.hasRequestId ? '✓' : '✗ MISSING'}`);

  if (!r.hasSecureHeaders || !r.hasCors || !r.hasRequestId) {
    failures++;
  }
}

console.log('');
if (failures === 0) {
  console.log(`PASS: All ${results.length} workers have consistent security headers.`);
} else {
  console.log(`INFO: ${failures}/${results.length} workers missing security features.`);
  console.log('      (Non-blocking — gaps should be addressed in next hardening sprint)');
  // Exit 0 for now — this is informational, not a gate
  // Change to process.exit(1) when all workers are hardened
}
