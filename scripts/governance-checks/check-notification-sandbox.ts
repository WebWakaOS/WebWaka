#!/usr/bin/env tsx
/**
 * Governance check: H-5 — Notification Pipeline Sandbox Enforcement (G24 / OQ-012)
 *
 * Parses apps/notificator/wrangler.toml to assert:
 *   - [env.staging]   → NOTIFICATION_SANDBOX_MODE must be "true"
 *   - [env.production] → NOTIFICATION_SANDBOX_MODE must be "false"
 *
 * This prevents accidental real notifications from staging and ensures
 * production is not silently silenced by a misconfigured sandbox flag.
 *
 * Exit 0 = assertions pass.  Exit 1 = one or more assertions fail.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname_local = dirname(__filename);
const REPO_ROOT = resolve(__dirname_local, '../..');

const WRANGLER_TOML = resolve(REPO_ROOT, 'apps/notificator/wrangler.toml');

if (!existsSync(WRANGLER_TOML)) {
  console.error(`❌  apps/notificator/wrangler.toml not found at: ${WRANGLER_TOML}`);
  process.exit(1);
}

const content = readFileSync(WRANGLER_TOML, 'utf8');

// ---------------------------------------------------------------------------
// Parse a specific [env.<name>] section and extract NOTIFICATION_SANDBOX_MODE
// ---------------------------------------------------------------------------
function extractSandboxMode(env: string): string | null {
  // Match the section from [env.<name>] until the next top-level [section]
  const sectionPattern = new RegExp(
    `\\[env\\.${env}\\][\\s\\S]*?(?=\\n\\[(?!env\\.${env})|$)`,
    'g',
  );
  const sectionMatch = sectionPattern.exec(content);
  if (!sectionMatch) return null;

  const section = sectionMatch[0];

  // Extract NOTIFICATION_SANDBOX_MODE from this section only
  // It may be under [env.<name>.vars] or directly after [env.<name>]
  const varMatch = /NOTIFICATION_SANDBOX_MODE\s*=\s*"([^"]+)"/.exec(section);
  return varMatch ? varMatch[1] : null;
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------
interface Rule {
  env: string;
  expected: string;
  description: string;
}

const RULES: Rule[] = [
  {
    env: 'staging',
    expected: 'true',
    description: 'NOTIFICATION_SANDBOX_MODE must be "true" in staging (G24 / OQ-012) — all deliveries should be redirected to sandbox targets',
  },
  {
    env: 'production',
    expected: 'false',
    description: 'NOTIFICATION_SANDBOX_MODE must be "false" in production (G24 / OQ-012) — real notifications must be enabled for users',
  },
];

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
let failures = 0;

for (const rule of RULES) {
  const actual = extractSandboxMode(rule.env);

  if (actual === null) {
    console.error(`  ✗  [env.${rule.env}] NOTIFICATION_SANDBOX_MODE not found in wrangler.toml`);
    console.error(`       → ${rule.description}`);
    failures++;
    continue;
  }

  if (actual !== rule.expected) {
    console.error(`  ✗  [env.${rule.env}] NOTIFICATION_SANDBOX_MODE = "${actual}" (expected "${rule.expected}")`);
    console.error(`       → ${rule.description}`);
    failures++;
  } else {
    console.log(`  ✓  [env.${rule.env}] NOTIFICATION_SANDBOX_MODE = "${actual}"`);
  }
}

console.log('');
if (failures === 0) {
  console.log('✅  Notification sandbox enforcement check passed.');
  process.exit(0);
} else {
  console.error(`❌  ${failures} sandbox enforcement rule(s) failed.`);
  console.error('    Fix apps/notificator/wrangler.toml before deploying.');
  process.exit(1);
}
