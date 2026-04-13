#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../..');
const SEARCH_DIRS = [
  path.join(ROOT, 'packages'),
  path.join(ROOT, 'apps'),
];

const VALID_PREFIXES = ['[Pillar 1]', '[Pillar 2]', '[Pillar 3]', '[Pillar 1+2]', '[Pillar 1+3]', '[Pillar 2+3]', '[Pillar 1+2+3]', '[AI]', '[Infra]', '[Cross-cutting]'];

function findPackageJsonFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.name === 'node_modules' || entry.name === '.git') continue;

    if (entry.isDirectory()) {
      const pkgPath = path.join(fullPath, 'package.json');
      if (fs.existsSync(pkgPath)) {
        results.push(pkgPath);
      }
      results.push(...findPackageJsonFiles(fullPath));
    }
  }

  return results;
}

function main(): void {
  const files: string[] = [];
  for (const dir of SEARCH_DIRS) {
    files.push(...findPackageJsonFiles(dir));
  }

  const uniqueFiles = [...new Set(files)];
  const violations: string[] = [];

  for (const file of uniqueFiles) {
    const content = JSON.parse(fs.readFileSync(file, 'utf8'));
    const desc: string = content.description ?? '';
    const relPath = path.relative(ROOT, file);

    const hasPrefix = VALID_PREFIXES.some(p => desc.startsWith(p));
    if (!hasPrefix) {
      violations.push(`${relPath}: description="${desc}" — missing pillar prefix`);
    }
  }

  if (violations.length > 0) {
    console.error(`FAIL: ${violations.length} package(s) missing pillar prefix in description:`);
    for (const v of violations.slice(0, 20)) console.error(`  - ${v}`);
    if (violations.length > 20) console.error(`  ... and ${violations.length - 20} more`);
    process.exit(1);
  }

  console.log(`PASS: All ${uniqueFiles.length} packages have pillar prefix in description.`);
}

main();
