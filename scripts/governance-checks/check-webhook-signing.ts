#!/usr/bin/env node
/**
 * SEC-007 Governance Check: Outbound webhook signing enforcement.
 *
 * Verifies that all webhook dispatcher files include X-WebWaka-Signature
 * in their outbound delivery headers and that no unsigned fetch() calls
 * deliver payloads to partner URLs without signing.
 *
 * Allowed: apps/api/src/lib/webhook-dispatcher.ts (canonical dispatcher)
 * Flagged: any other file that calls fetch() with a webhook-like URL pattern
 *          without including X-WebWaka-Signature.
 */
import * as fs from 'fs';
import * as path from 'path';

const SCAN_DIRS = [
  path.resolve(__dirname, '../../apps'),
  path.resolve(__dirname, '../../packages'),
];

const CANONICAL_DISPATCHER = 'webhook-dispatcher.ts';

// Files that are not partner-facing webhook dispatchers:
// - Internal notification channels (Slack, Teams, etc.) send to *our* own services, not partners
// - Test files do not dispatch production webhooks
const EXCLUDED_PATTERNS = [
  '/channels/',          // notification channels (Slack, Teams — internal only)
  '.test.ts',            // test files
  '.spec.ts',            // spec files
  '/node_modules/',      // dependencies
];

let failures = 0;

function isExcluded(filePath: string): boolean {
  return EXCLUDED_PATTERNS.some((p) => filePath.includes(p));
}

function checkFile(filePath: string): void {
  const basename = path.basename(filePath);
  if (basename === CANONICAL_DISPATCHER) return;
  if (isExcluded(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');

  // Only flag fetch() calls that deliver to partner-facing webhook endpoints.
  // Pattern: fetch() with a URL variable that is clearly a partner delivery URL
  // (partnerUrl, deliveryUrl, hookUrl, endpointUrl — distinct from internal Slack/Teams URLs).
  const hasPartnerWebhookFetch =
    /fetch\s*\(.*partnerUrl/i.test(content) ||
    /fetch\s*\(.*deliveryUrl/i.test(content) ||
    /fetch\s*\(.*hookUrl/i.test(content) ||
    /fetch\s*\(.*endpointUrl/i.test(content) ||
    /fetch\s*\(.*subscriberUrl/i.test(content);

  if (!hasPartnerWebhookFetch) return;

  if (!content.includes('X-WebWaka-Signature')) {
    console.error(
      `FAIL [webhook-signing]: ${filePath} — fetch() to partner webhook URL without X-WebWaka-Signature header`,
    );
    failures++;
  }
}

function walkDir(dir: string): void {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      walkDir(fullPath);
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      checkFile(fullPath);
    }
  }
}

function main(): void {
  for (const dir of SCAN_DIRS) {
    walkDir(dir);
  }

  if (failures > 0) {
    console.error(
      `\n${failures} unsigned webhook delivery call(s) found. All outbound webhook fetches must use X-WebWaka-Signature (SEC-007).`,
    );
    process.exit(1);
  }

  console.log('PASS: All outbound webhook dispatchers include X-WebWaka-Signature (SEC-007 compliant).');
}

main();
