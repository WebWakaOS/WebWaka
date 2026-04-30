/**
 * Governance Check: No Rollback Files in Forward Migrations Directory (CI-005)
 *
 * Verifies that apps/api/migrations/ contains ONLY forward migration files.
 * Rollback files (*.rollback.sql) must NOT be present — wrangler d1 applies
 * all .sql files alphabetically and would execute rollbacks as forward migrations,
 * potentially dropping columns or tables in production.
 *
 * Rollback files live exclusively in infra/db/migrations/*.rollback.sql.
 */

import { readdirSync, existsSync } from 'fs';
import { join } from 'path';

const MIGRATIONS_DIR = join(process.cwd(), 'apps', 'api', 'migrations');

if (!existsSync(MIGRATIONS_DIR)) {
  console.log('SKIP: apps/api/migrations/ does not exist (no forward migrations committed).');
  process.exit(0);
}

const files = readdirSync(MIGRATIONS_DIR);
const rollbackFiles = files.filter((f) => f.endsWith('.rollback.sql'));

if (rollbackFiles.length > 0) {
  console.error('FAIL: Rollback files found in apps/api/migrations/ (forward-only directory):');
  for (const f of rollbackFiles) {
    console.error(`  ❌ ${f}`);
  }
  console.error('');
  console.error('Rollback files must NOT be in apps/api/migrations/ — wrangler would apply them');
  console.error('as forward migrations. Move them to infra/db/migrations/ only.');
  process.exit(1);
} else {
  console.log(`PASS: No rollback files in apps/api/migrations/ (${files.length} forward migrations).`);
}
