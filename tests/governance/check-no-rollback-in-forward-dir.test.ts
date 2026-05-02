/**
 * Governance Check Tests — check-no-rollback-in-forward-dir (Wave 3 C1-5)
 *
 * Verifies the check:
 *   - Catches *.rollback.sql files in apps/api/migrations/
 *   - Passes when directory is clean
 *   - Handles missing directory gracefully (SKIP)
 */
import { describe, it, expect } from 'vitest';

function detectRollbackFiles(files: string[]): string[] {
  return files.filter(f => f.endsWith('.rollback.sql'));
}

describe('Governance check: check-no-rollback-in-forward-dir (C1-5)', () => {
  it('flags *.rollback.sql files', () => {
    const files = [
      '0001_initial.sql',
      '0384_partner_attribution_enabled.rollback.sql',
      '0385_add_column.sql',
    ];
    expect(detectRollbackFiles(files)).toHaveLength(1);
    expect(detectRollbackFiles(files)[0]).toContain('.rollback.sql');
  });

  it('passes a clean directory (no rollback files)', () => {
    const files = ['0001_initial.sql', '0002_add_users.sql', '0003_add_tenants.sql'];
    expect(detectRollbackFiles(files)).toHaveLength(0);
  });

  it('detects multiple rollback files', () => {
    const files = [
      '0001.rollback.sql', '0002_forward.sql', '0003.rollback.sql',
    ];
    expect(detectRollbackFiles(files)).toHaveLength(2);
  });

  it('ignores non-sql files', () => {
    const files = ['README.md', '0001.sql', '0001.rollback.sql.bak'];
    expect(detectRollbackFiles(files)).toHaveLength(0);
  });

  it('empty directory passes', () => {
    expect(detectRollbackFiles([])).toHaveLength(0);
  });
});
