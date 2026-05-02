/**
 * Regression: Issue #2 — Stray rollback files in apps/api/migrations/
 *
 * apps/api/migrations/ is the forward-migrations directory used by Wrangler D1.
 * Wrangler applies ALL .sql files alphabetically — a stray *.rollback.sql
 * would drop production columns or tables.
 *
 * This was CRITICAL — one stray rollback was found and removed.
 * This test ensures it cannot happen again.
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, existsSync } from 'fs';
import { join } from 'path';

const FORWARD_DIR = join(process.cwd(), 'apps', 'api', 'migrations');

describe('Regression: Issue #2 — no rollback files in forward migrations dir', () => {
  it('apps/api/migrations/ must not contain any *.rollback.sql files', () => {
    if (!existsSync(FORWARD_DIR)) {
      // Directory not present — no violation possible
      return;
    }
    const files = readdirSync(FORWARD_DIR);
    const rollbacks = files.filter(f => f.endsWith('.rollback.sql'));

    if (rollbacks.length > 0) {
      throw new Error(
        `Regression detected! Rollback files found in apps/api/migrations/:\n` +
        rollbacks.map(f => `  ❌ ${f}`).join('\n') + '\n' +
        `These would be applied by Wrangler D1 as forward migrations and could drop production data.\n` +
        `Move them to infra/db/migrations/ only.`
      );
    }
    expect(rollbacks).toHaveLength(0);
  });
});
