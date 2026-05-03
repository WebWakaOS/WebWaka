#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';

const SCAN_DIRS = [
  path.resolve(__dirname, '../../apps/api/src'),
  path.resolve(__dirname, '../../packages'),
];

const MONETARY_FLOAT_PATTERNS = [
  /parseFloat\s*\([^)]*(?:price|amount|cost|fee|balance|naira|kobo|wakaCu)/i,
  /(?:price|amount|cost|fee|balance|naira|kobo|wakaCu)[^.]*\.toFixed\s*\(/i,
  /Math\.round\s*\([^)]*(?:price|amount|cost|fee|balance)/i,
];

const ALLOWED_FILES = [
  'node_modules/',
  '.d.ts',
  'check-monetary-integrity.ts',
  // Test files use floats intentionally to verify P9 rejection — not violations
  '.test.ts',
  '.test.idempotency.ts',
  '.fuzz.test.ts',
  '.spec.ts',
  '.e2e.ts',
];

let failures = 0;

function isAllowed(filePath: string): boolean {
  return ALLOWED_FILES.some((a) => filePath.includes(a));
}

// Lines that are exempt: display-only *naira fields (API response strings, not stored values).
// Convention: any field name ending in _naira or Naira is a display string (kobo / 100).toFixed(2).
// Also exempt lines annotated with // DISPLAY_ONLY.
// Also exempt template literals (backtick strings) with ₦ that show display amounts to users or AI.
const DISPLAY_ONLY_PATTERNS = [
  // _naira or camelCase Naira fields in object literals (key: value) or assignments.
  // Convention: variable/property name ending in _naira or Naira holds a display string, not stored float.
  /_naira\s*[=:]/,
  /Naira\s*[=:]/i,
  // Template literals showing ₦ formatting (display-only, not stored)
  /`[^`]*₦[^`]*\$/,
  /`Payment[^`]*₦[^`]*`/,
  /\/\/\s*DISPLAY_ONLY/,
];

function isDisplayOnlyLine(line: string): boolean {
  return DISPLAY_ONLY_PATTERNS.some((p) => p.test(line));
}

function checkFile(filePath: string): void {
  if (isAllowed(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    if (isDisplayOnlyLine(lines[i])) continue; // exempt display-only conversions
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
