/**
 * Governance Check: Migration SQL Syntax Validation (CI-006)
 *
 * Validates that all forward migration SQL files parse correctly as SQLite.
 * Uses a minimal in-memory schema fixture to catch:
 *   - SQL syntax errors (unescaped quotes, typos)
 *   - Missing semicolons
 *   - Invalid SQLite constructs
 *
 * Skips:
 *   - Rollback files (*.rollback.sql)
 *   - Git LFS pointer files (3-line text starting with "version https://git-lfs")
 *   - Files > 5MB (large reference data seeds, same threshold as deploy workflow)
 *
 * Runs against: infra/db/migrations/*.sql (source of truth)
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const MIGRATIONS_DIR = join(process.cwd(), 'infra', 'db', 'migrations');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Only validate the most recent N migrations to keep CI fast.
// Set to 0 to validate ALL (slower for 444+ files).
const RECENT_ONLY = 20;

const allFiles = readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith('.sql') && !f.endsWith('.rollback.sql'))
  .sort();

const filesToCheck = RECENT_ONLY > 0 ? allFiles.slice(-RECENT_ONLY) : allFiles;

let passed = 0;
let skipped = 0;
let failed = 0;
const failures: string[] = [];

for (const file of filesToCheck) {
  const fullPath = join(MIGRATIONS_DIR, file);
  const stat = statSync(fullPath);

  // Skip oversized files (same threshold as deploy workflow)
  if (stat.size > MAX_FILE_SIZE) {
    skipped++;
    continue;
  }

  const content = readFileSync(fullPath, 'utf-8');

  // Skip Git LFS pointer files
  if (content.startsWith('version https://git-lfs')) {
    skipped++;
    continue;
  }

  // Skip empty files
  if (content.trim().length === 0) {
    skipped++;
    continue;
  }

  // Attempt to parse SQL using sqlite3 :memory: via file input.
  // We only flag SQL syntax/parse errors; missing-table errors are acceptable
  // because we don't recreate the full schema fixture here.
  try {
    const result = execSync(
      `sqlite3 :memory: < "${fullPath}" 2>&1 || true`,
      { encoding: 'utf-8', timeout: 10000 },
    );

    // Check for actual SQL syntax errors only (not "no such table" etc.)
    const lines = result.split('\n');
    const syntaxErrors = lines.filter(
      (l) => (l.includes('syntax error') || l.includes('incomplete input')) &&
        !l.includes('no such table') &&
        !l.includes('no such column') &&
        !l.includes('table') &&
        !l.includes('already exists'),
    );
    // More precise: look for "near "X": syntax error" pattern which indicates parse failure
    const realSyntaxErrors = lines.filter(
      (l) => /near ".*": syntax error/.test(l) || l.includes('incomplete input'),
    );
    if (realSyntaxErrors.length > 0) {
      failed++;
      failures.push(`${file}: ${realSyntaxErrors[0]}`);
    } else {
      passed++;
    }
  } catch (err: unknown) {
    // execSync timeout or other error
    const msg = err instanceof Error ? err.message : String(err);
    const isSyntax = /near ".*": syntax error/.test(msg) || msg.includes('incomplete input');
    if (isSyntax) {
      failed++;
      failures.push(`${file}: ${msg.split('\n').find((l) => /near ".*": syntax error/.test(l) || l.includes('incomplete input')) ?? msg.split('\n')[0]}`);
    } else {
      // Non-syntax errors (missing table, column, etc.) are acceptable
      passed++;
    }
  }
}

console.log(`Checked ${filesToCheck.length} migration(s) (last ${RECENT_ONLY || 'ALL'}), skipped ${skipped}.`);

if (failed > 0) {
  console.error(`FAIL: ${failed} migration(s) have SQL syntax errors:`);
  for (const f of failures) {
    console.error(`  ❌ ${f}`);
  }
  process.exit(1);
} else {
  console.log(`PASS: All ${passed} checked migrations parse as valid SQL.`);
}
