#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';

const ROUTE_DIRS = [
  path.resolve(__dirname, '../../apps/api/src/routes'),
  // Phase 0 extension: brand-runtime routes serve tenant-scoped public pages
  // (WakaPage public surface — Phase 1). Scan for tenant isolation violations proactively.
  path.resolve(__dirname, '../../apps/brand-runtime/src/routes'),
];

// Also scan the hl-wallet package for raw SQL against hl_* tables (T3 compliance).
const HL_WALLET_DIRS = [
  path.resolve(__dirname, '../../packages/hl-wallet/src'),
];

// Files that are intentionally platform-admin/super-admin only, or are public read-only,
// and do not receive tenant_id from user input in a dangerous way.
const IGNORED_FILES = ['health.ts', 'geography.ts', 'discovery.ts', 'notification-admin-routes.ts'];

const DANGEROUS_PATTERNS = [
  /\.prepare\([^)]*\)\s*\.bind\(\s*\)/,
  /req\.param\(['"]tenant_id['"]\)/,
  /req\.query\(['"]tenant_id['"]\)/,
  /body\.tenant_id/,
  /body\['tenant_id'\]/,
];

// hl_* tables that must always include tenant_id in any SQL statement that
// touches them (INSERT / SELECT / UPDATE / DELETE).
const HL_TABLES = [
  'hl_wallets',
  'hl_ledger',
  'hl_funding_requests',
  'hl_spend_events',
  'hl_mla_earnings',
];

let failures = 0;

function checkFile(filePath: string): void {
  const basename = path.basename(filePath);
  if (IGNORED_FILES.includes(basename)) return;

  const content = fs.readFileSync(filePath, 'utf8');

  for (const pattern of DANGEROUS_PATTERNS) {
    const match = content.match(pattern);
    if (match) {
      console.error(`FAIL [tenant-input]: ${filePath} — tenant_id from user input: ${match[0]}`);
      failures++;
    }
  }
}

/**
 * Verify that every SQL string literal in source files that references an
 * hl_* table also includes `tenant_id`.  This enforces the T3 invariant
 * (all hl_* queries must be scoped by tenant_id) across the wallet package
 * and API routes.
 *
 * The check extracts template literals / strings passed to `.prepare(...)`.
 * False positives are unlikely because all hl_* SQL is structured.
 * False negatives (missed queries) are possible but the pattern covers the
 * common cases: prepare(` ... `), prepare(' ... '), prepare(" ... ").
 */
function checkHlTableTenantIsolation(filePath: string): void {
  const content = fs.readFileSync(filePath, 'utf8');

  // SQL DML keywords — only flag strings that are actual SQL statements.
  const SQL_DML = /\b(SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|FROM)\b/i;
  // Strings annotated with GOVERNANCE_SKIP are intentional cross-tenant queries (e.g. CRON aggregates).
  const GOVERNANCE_SKIP = /GOVERNANCE_SKIP/;

  // Match backtick template literal strings — the dominant SQL pattern in this codebase.
  const allStrings = content.match(/`[^`]+`/g) ?? [];

  // BUG-017: Also check single/double-quoted SQL strings for hl_* table references.
  // Exclude newlines (\n) and backticks (`) from the character class so the regex
  // never spans multiple lines or bleeds into backtick template literals — doing so
  // produces false positives from SQL value literals like 'pending' -> 'active'.
  const singleQuotedStrings = content.match(/('[^'`\n]{10,}'|"[^"`\n]{10,}")/g) ?? [];
  for (const sqlStr of singleQuotedStrings) {
    if (!SQL_DML.test(sqlStr)) continue;
    if (GOVERNANCE_SKIP.test(sqlStr)) continue;
    for (const table of HL_TABLES) {
      if (sqlStr.includes(table) && !sqlStr.includes('tenant_id')) {
        console.error(
          `FAIL [hl-tenant-isolation] (single-quoted): ${filePath}\n` +
          `  SQL touches '${table}' but has no tenant_id scope:\n` +
          `  ${sqlStr.slice(0, 200).replace(/\n/g, ' ')}`,
        );
        failures++;
        break;
      }
    }
  }

  for (const str of allStrings) {
    if (!SQL_DML.test(str)) continue;     // not a SQL statement — skip
    if (GOVERNANCE_SKIP.test(str)) continue; // intentionally cross-tenant — skip

    for (const table of HL_TABLES) {
      if (str.includes(table)) {
        // Must have tenant_id somewhere in the same string
        if (!str.includes('tenant_id')) {
          console.error(
            `FAIL [hl-tenant-isolation]: ${filePath}\n` +
            `  SQL touches '${table}' but has no tenant_id scope:\n` +
            `  ${str.slice(0, 200).replace(/\n/g, ' ')}`,
          );
          failures++;
          break;
        }
      }
    }
  }
}

function walkDir(dir: string, hlCheck = false): void {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, hlCheck);
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts') && !entry.name.endsWith('.d.ts')) {
      checkFile(fullPath);
      if (hlCheck) checkHlTableTenantIsolation(fullPath);
    }
  }
}

function main(): void {
  console.log('Checking tenant isolation in API routes...');
  for (const dir of ROUTE_DIRS) {
    walkDir(dir, true);
  }

  console.log('Checking hl_* table tenant isolation in hl-wallet package...');
  for (const dir of HL_WALLET_DIRS) {
    walkDir(dir, true);
  }

  if (failures > 0) {
    console.error(`\n${failures} tenant isolation violation(s) found.`);
    process.exit(1);
  }

  console.log('PASS: No tenant isolation violations detected (including hl_* tables).');
}

main();
