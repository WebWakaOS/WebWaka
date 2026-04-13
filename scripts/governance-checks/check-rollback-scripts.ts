#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';

const MIGRATIONS_DIR = path.resolve(__dirname, '../../infra/db/migrations');

function main(): void {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql') && !f.includes('.rollback.'))
    .sort();

  const missing: string[] = [];

  for (const file of files) {
    const base = file.replace('.sql', '');
    const hasSqlRollback = fs.existsSync(path.join(MIGRATIONS_DIR, `${base}.rollback.sql`));
    const hasMdRollback = fs.existsSync(path.join(MIGRATIONS_DIR, `${base}.rollback.md`));

    if (!hasSqlRollback && !hasMdRollback) {
      missing.push(file);
    }
  }

  if (missing.length > 0) {
    console.error(`FAIL: ${missing.length} migration(s) missing rollback script:`);
    for (const m of missing) console.error(`  - ${m}`);
    process.exit(1);
  }

  console.log(`PASS: All ${files.length} migrations have rollback scripts.`);
}

main();
