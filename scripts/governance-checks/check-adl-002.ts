#!/usr/bin/env npx tsx
/**
 * N-127 — ADL-002 governance check: confirm zero provider API keys in D1 (Phase 9).
 *
 * ADL-002 (docs/governance/security-baseline.md):
 *   "Provider credentials (API keys, tokens, secrets) MUST be stored AES-256-GCM
 *    encrypted in Cloudflare KV (NOTIFICATION_KV), referenced from D1 via
 *    credentials_kv_key. Zero plaintext credentials stored in D1 tables."
 *
 * This script performs three checks:
 *
 *   CHECK-1  SQL migrations: scan all .sql files for column names that suggest
 *            raw credential storage (api_key, api_secret, secret_key, access_token,
 *            auth_token, password, private_key) in CREATE TABLE statements.
 *            Exception: columns named `credentials_kv_key` are the APPROVED pattern.
 *
 *   CHECK-2  TypeScript source: scan for D1 INSERT/UPDATE statements (via .run())
 *            that bind values to columns matching the forbidden names above.
 *
 *   CHECK-3  channel_provider schema assertion: verify that the channel_provider
 *            table uses credentials_kv_key (not a raw credential column).
 *
 * Exit code: 0 = pass, 1 = violation found.
 *
 * Guardrails enforced: G16 (ADL-002).
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../..');
const MIGRATIONS_DIR = path.join(ROOT, 'infra/db/migrations');
const SCAN_DIRS = [
  path.join(ROOT, 'apps'),
  path.join(ROOT, 'packages'),
];

let failures = 0;
let warnings = 0;

// ---------------------------------------------------------------------------
// Column name patterns that indicate raw credential storage (G16 violation)
// ---------------------------------------------------------------------------

const FORBIDDEN_COLUMN_PATTERNS: RegExp[] = [
  /\bapi_key\b/i,
  /\bapi_secret\b/i,
  /\bsecret_key\b/i,
  /\baccess_token\b/i,
  /\bauth_token\b/i,
  /\bbearer_token\b/i,
  /\bprivate_key\b/i,
  /\bwebhook_secret\b/i,
  /\bresend_key\b/i,
  /\btermii_key\b/i,
];

const APPROVED_COLUMN_NAME = 'credentials_kv_key';

const ALLOWED_MIGRATION_FILES: string[] = [
  'node_modules',
];

const ALLOWED_TS_FILES: string[] = [
  'node_modules',
  '.d.ts',
  'check-adl-002.ts',
  'credential-store.ts',
  'credential-store.test.ts',
];

// ---------------------------------------------------------------------------
// CHECK-1: Scan SQL migrations for raw credential columns
// ---------------------------------------------------------------------------

function checkMigrations(): void {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.warn(`WARN: migrations directory not found at ${MIGRATIONS_DIR}`);
    return;
  }

  const sqlFiles = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql') && !f.endsWith('.rollback.sql'))
    .sort();

  let sqlFailures = 0;

  for (const file of sqlFiles) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    const createTableBlocks = extractCreateTableBlocks(content);

    for (const block of createTableBlocks) {
      const tableName = block.tableName;
      const columnBlock = block.body;

      const columnLines = columnBlock
        .split('\n')
        .filter((line) => line.trim() && !line.trim().startsWith('--'));

      for (const line of columnLines) {
        const columnNameMatch = line.trim().match(/^(\w+)\s/);
        if (!columnNameMatch) continue;

        const columnName = columnNameMatch[1]!.toLowerCase();

        if (columnName === APPROVED_COLUMN_NAME.toLowerCase()) continue;

        for (const pattern of FORBIDDEN_COLUMN_PATTERNS) {
          if (pattern.test(columnName)) {
            console.error(
              `FAIL [CHECK-1] ADL-002 violation: ${file} — table "${tableName}" has raw credential column: "${columnName}"`,
            );
            console.error(`  Line: ${line.trim()}`);
            console.error(`  Fix: rename to "credentials_kv_key" and store actual credentials in NOTIFICATION_KV`);
            sqlFailures++;
            failures++;
          }
        }
      }
    }
  }

  if (sqlFailures === 0) {
    console.log(`PASS [CHECK-1] SQL migrations: no raw credential columns found in ${sqlFiles.length} migration files.`);
  }
}

interface CreateTableBlock {
  tableName: string;
  body: string;
}

function extractCreateTableBlocks(sql: string): CreateTableBlock[] {
  const blocks: CreateTableBlock[] = [];
  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\(([^;]+)\)/gi;

  let match: RegExpExecArray | null;
  while ((match = createTableRegex.exec(sql)) !== null) {
    blocks.push({
      tableName: match[1]!,
      body: match[2]!,
    });
  }
  return blocks;
}

// ---------------------------------------------------------------------------
// CHECK-2: Scan TypeScript source for D1 inserts with credential values
// ---------------------------------------------------------------------------

const SUSPICIOUS_TS_PATTERNS: RegExp[] = [
  /\.prepare\s*\([^)]*(?:INSERT|UPDATE)[^)]*(?:api_key|api_secret|secret_key|access_token|auth_token|private_key)\b/i,
  /bind\s*\([^)]*(?:apiKey|secretKey|accessToken|authToken|privateKey|resendKey|termiiKey)\b/i,
];

function isAllowedTsFile(filePath: string): boolean {
  return ALLOWED_TS_FILES.some((a) => filePath.includes(a));
}

function findTsFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.name === 'node_modules' || entry.name === '.git') continue;

    if (entry.isDirectory()) {
      results.push(...findTsFiles(fullPath));
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

function checkTypeScriptSource(): void {
  const tsFiles: string[] = [];
  for (const dir of SCAN_DIRS) {
    tsFiles.push(...findTsFiles(dir));
  }

  let tsFailures = 0;

  for (const filePath of tsFiles) {
    if (isAllowedTsFile(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;

      for (const pattern of SUSPICIOUS_TS_PATTERNS) {
        if (pattern.test(line)) {
          const relPath = path.relative(ROOT, filePath);
          console.error(
            `FAIL [CHECK-2] ADL-002 violation: ${relPath}:${i + 1} — potential raw credential in D1 operation`,
          );
          console.error(`  Line: ${line.trim()}`);
          console.error(`  Fix: store credentials in NOTIFICATION_KV, reference via credentials_kv_key`);
          tsFailures++;
          failures++;
        }
      }
    }
  }

  if (tsFailures === 0) {
    console.log(`PASS [CHECK-2] TypeScript source: no suspicious raw-credential D1 operations found in ${tsFiles.length} files.`);
  }
}

// ---------------------------------------------------------------------------
// CHECK-3: channel_provider table uses credentials_kv_key
// ---------------------------------------------------------------------------

function checkChannelProviderSchema(): void {
  const providerMigrationPattern = /channel_provider/i;

  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.warn('WARN [CHECK-3] Cannot verify channel_provider schema — migrations dir not found');
    return;
  }

  const sqlFiles = fs.readdirSync(MIGRATIONS_DIR).filter((f) =>
    f.endsWith('.sql') && !f.endsWith('.rollback.sql'),
  );

  let found = false;
  let hasApprovedPattern = false;

  for (const file of sqlFiles) {
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    if (providerMigrationPattern.test(content)) {
      found = true;

      if (content.includes(APPROVED_COLUMN_NAME)) {
        hasApprovedPattern = true;
      }

      const hasForbidden = FORBIDDEN_COLUMN_PATTERNS.some((p) => {
        const tableBlocks = extractCreateTableBlocks(content);
        return tableBlocks
          .filter((b) => /channel_provider/i.test(b.tableName))
          .some((b) => p.test(b.body) && !b.body.includes(APPROVED_COLUMN_NAME));
      });

      if (hasForbidden) {
        console.error(
          `FAIL [CHECK-3] ADL-002 violation: channel_provider table in ${file} contains raw credential columns`,
        );
        console.error(`  Expected: credentials_kv_key column (references AES-256-GCM encrypted KV entry)`);
        failures++;
      }
    }
  }

  if (!found) {
    console.warn('WARN [CHECK-3] channel_provider table migration not found — skipping schema assertion');
    warnings++;
    return;
  }

  if (!hasApprovedPattern) {
    console.error(
      'FAIL [CHECK-3] ADL-002 violation: channel_provider table found but missing credentials_kv_key column',
    );
    console.error('  Expected: credentials_kv_key TEXT column per ADL-002 pattern');
    failures++;
  } else {
    console.log('PASS [CHECK-3] channel_provider table correctly uses credentials_kv_key (ADL-002 compliant).');
  }
}

// ---------------------------------------------------------------------------
// CHECK-4: Scan for hardcoded provider keys in environment variable patterns
// ---------------------------------------------------------------------------

const ENV_CREDENTIAL_PATTERNS: RegExp[] = [
  /RESEND_API_KEY\s*=\s*["']re_[a-zA-Z0-9]{20,}/,
  /TERMII_API_KEY\s*=\s*["']TL[a-zA-Z0-9]{20,}/,
  /FCM_SERVER_KEY\s*=\s*["'][A-Za-z0-9_-]{100,}/,
];

function checkHardcodedSecrets(): void {
  const tsFiles: string[] = [];
  for (const dir of SCAN_DIRS) {
    tsFiles.push(...findTsFiles(dir));
  }

  let secretFailures = 0;

  for (const filePath of tsFiles) {
    if (isAllowedTsFile(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;

      for (const pattern of ENV_CREDENTIAL_PATTERNS) {
        if (pattern.test(line)) {
          const relPath = path.relative(ROOT, filePath);
          console.error(
            `FAIL [CHECK-4] ADL-002 violation: hardcoded credential pattern found in ${relPath}:${i + 1}`,
          );
          console.error(`  Line: ${line.trim()}`);
          secretFailures++;
          failures++;
        }
      }
    }
  }

  if (secretFailures === 0) {
    console.log('PASS [CHECK-4] No hardcoded provider credential patterns found in source files.');
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  console.log('=== ADL-002 Governance Check (N-127, Phase 9) ===');
  console.log('Checking: provider credentials stored in KV only, never in D1\n');

  checkMigrations();
  checkTypeScriptSource();
  checkChannelProviderSchema();
  checkHardcodedSecrets();

  console.log('');
  if (failures > 0) {
    console.error(`FAIL: ${failures} ADL-002 violation(s) found. Provider credentials MUST be in KV (NOTIFICATION_KV), not D1.`);
    console.error('See docs/governance/security-baseline.md G16 for remediation guidance.');
    process.exit(1);
  } else {
    console.log(`PASS: ADL-002 compliance verified — zero raw credentials in D1 schema or source. ${warnings > 0 ? `(${warnings} warning(s))` : ''}`);
    process.exit(0);
  }
}

main();
