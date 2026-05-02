/**
 * Regression: Issue #1 — Migration SQL syntax: backslash-escaped quotes
 *
 * SQLite does NOT support \'  (backslash-escaped single quotes).
 * Standard is '' (doubled quote). Any migration with \' is a deploy blocker.
 *
 * This was a CRITICAL issue fixed before production readiness.
 * This test prevents re-emergence.
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const MIGRATIONS_DIR = join(process.cwd(), 'infra', 'db', 'migrations');
// Backslash-escaped quote pattern (invalid SQLite)
const BACKSLASH_QUOTE = /\\'/g;

describe('Regression: Issue #1 — no backslash-escaped quotes in SQL migrations', () => {
  it('infra/db/migrations directory must exist', () => {
    expect(existsSync(MIGRATIONS_DIR)).toBe(true);
  });

  it('no migration file contains backslash-escaped single quotes (invalid SQLite)', () => {
    const files = readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql') && !f.endsWith('.rollback.sql'))
      .slice(-50); // check the 50 most recent for speed

    const violations: string[] = [];
    for (const file of files) {
      const content = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
      // Skip LFS pointer files
      if (content.startsWith('version https://git-lfs')) continue;
      const matches = content.match(BACKSLASH_QUOTE);
      if (matches) {
        violations.push(`${file}: found ${matches.length} backslash-escaped quote(s)`);
      }
    }

    if (violations.length > 0) {
      throw new Error(
        `Regression detected! Backslash-escaped quotes in migrations:\n${violations.join('\n')}\n` +
        `Fix: replace \\' with '' (SQLite standard doubled-quote escaping).`
      );
    }
    expect(violations).toHaveLength(0);
  });
});
