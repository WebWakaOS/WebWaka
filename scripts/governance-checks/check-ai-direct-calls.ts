#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';

const SCAN_DIRS = [
  path.resolve(__dirname, '../../apps'),
  path.resolve(__dirname, '../../packages'),
];

const ALLOWED_FILES = [
  'ai-adapters/src/',
  'ai/src/',
  'node_modules/',
  '.d.ts',
];

const SDK_PATTERNS = [
  /new\s+OpenAI\s*\(/,
  /new\s+Anthropic\s*\(/,
  /import\s+.*from\s+['"]openai['"]/,
  /import\s+.*from\s+['"]@anthropic-ai/,
  /require\s*\(\s*['"]openai['"]\s*\)/,
  /fetch\s*\(\s*['"]https:\/\/api\.openai\.com/,
  /fetch\s*\(\s*['"]https:\/\/api\.anthropic\.com/,
];

let failures = 0;

function isAllowed(filePath: string): boolean {
  return ALLOWED_FILES.some((a) => filePath.includes(a));
}

function checkFile(filePath: string): void {
  if (isAllowed(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');

  for (const pattern of SDK_PATTERNS) {
    const match = content.match(pattern);
    if (match) {
      console.error(`FAIL: ${filePath} — direct AI SDK call: ${match[0]}`);
      failures++;
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
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.js')) {
      checkFile(fullPath);
    }
  }
}

function main(): void {
  for (const dir of SCAN_DIRS) {
    walkDir(dir);
  }

  if (failures > 0) {
    console.error(`\n${failures} direct AI SDK call(s) found. Use @webwaka/ai-adapters (P7).`);
    process.exit(1);
  }

  console.log('PASS: No direct AI SDK calls detected (P7 compliant).');
}

main();
