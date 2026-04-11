#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';

const SCAN_DIRS = [
  path.resolve(__dirname, '../../apps/api/src'),
  path.resolve(__dirname, '../../packages'),
];

const MONETARY_FLOAT_PATTERNS = [
  /parseFloat\s*\([^)]*(?:price|amount|cost|fee|balance|naira|kobo|wakaCu)/i,
  /toFixed\s*\(\s*\d+\s*\)/,
  /Math\.round\s*\([^)]*(?:price|amount|cost|fee|balance)/i,
];

const ALLOWED_FILES = [
  'node_modules/',
  '.d.ts',
  'check-monetary-integrity.ts',
];

let failures = 0;

function isAllowed(filePath: string): boolean {
  return ALLOWED_FILES.some((a) => filePath.includes(a));
}

function checkFile(filePath: string): void {
  if (isAllowed(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    for (const pattern of MONETARY_FLOAT_PATTERNS) {
      if (pattern.test(lines[i])) {
        console.error(`FAIL: ${filePath}:${i + 1} — possible float on monetary value: ${lines[i].trim()}`);
        failures++;
      }
    }
  }
}

function walkDir(dir: string): void {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      walkDir(fullPath);
    } else if (entry.name.endsWith('.ts')) {
      checkFile(fullPath);
    }
  }
}

function main(): void {
  for (const dir of SCAN_DIRS) {
    walkDir(dir);
  }

  if (failures > 0) {
    console.error(`\n${failures} monetary float violation(s) found (P9: integers only).`);
    process.exit(1);
  }

  console.log('PASS: No monetary float violations detected (P9 compliant).');
}

main();
