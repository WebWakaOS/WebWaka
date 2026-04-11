#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../..');
const DEPENDENCY_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
const FORBIDDEN_PREFIXES = ['file:', 'github:'];

function findPackageJsonFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.name === 'node_modules' || entry.name === '.git') continue;

    if (entry.isDirectory()) {
      results.push(...findPackageJsonFiles(fullPath));
    } else if (entry.name === 'package.json') {
      results.push(fullPath);
    }
  }

  return results;
}

function main(): void {
  const files = findPackageJsonFiles(ROOT);
  const violations: string[] = [];

  for (const file of files) {
    if (file.includes('node_modules')) continue;

    const content = JSON.parse(fs.readFileSync(file, 'utf8'));
    const relPath = path.relative(ROOT, file);

    for (const field of DEPENDENCY_FIELDS) {
      const deps = content[field];
      if (!deps || typeof deps !== 'object') continue;

      for (const [pkg, version] of Object.entries(deps)) {
        const v = String(version);
        for (const prefix of FORBIDDEN_PREFIXES) {
          if (v.startsWith(prefix)) {
            violations.push(`${relPath} → ${field}.${pkg}: "${v}" uses forbidden '${prefix}' reference`);
          }
        }
      }
    }
  }

  if (violations.length > 0) {
    console.error(`FAIL: ${violations.length} forbidden dependency source(s) found:`);
    for (const v of violations) console.error(`  - ${v}`);
    process.exit(1);
  }

  console.log('PASS: No forbidden dependency sources (file:/github:) detected.');
}

main();
