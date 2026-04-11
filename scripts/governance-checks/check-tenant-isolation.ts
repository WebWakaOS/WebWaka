#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';

const ROUTE_DIRS = [
  path.resolve(__dirname, '../../apps/api/src/routes'),
];

const IGNORED_FILES = ['health.ts', 'geography.ts', 'discovery.ts'];

const DANGEROUS_PATTERNS = [
  /\.prepare\([^)]*\)\s*\.bind\(\s*\)/,
  /req\.param\(['"]tenant_id['"]\)/,
  /req\.query\(['"]tenant_id['"]\)/,
  /body\.tenant_id/,
  /body\['tenant_id'\]/,
];

let failures = 0;

function checkFile(filePath: string): void {
  const basename = path.basename(filePath);
  if (IGNORED_FILES.includes(basename)) return;

  const content = fs.readFileSync(filePath, 'utf8');

  for (const pattern of DANGEROUS_PATTERNS) {
    const match = content.match(pattern);
    if (match) {
      console.error(`FAIL: ${filePath} — tenant_id from user input: ${match[0]}`);
      failures++;
    }
  }
}

function walkDir(dir: string): void {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.name.endsWith('.ts')) {
      checkFile(fullPath);
    }
  }
}

function main(): void {
  for (const dir of ROUTE_DIRS) {
    walkDir(dir);
  }

  if (failures > 0) {
    console.error(`\n${failures} tenant isolation violation(s) found.`);
    process.exit(1);
  }

  console.log('PASS: No tenant isolation violations detected.');
}

main();
