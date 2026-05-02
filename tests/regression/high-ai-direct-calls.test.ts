/**
 * Regression: P7 — No direct AI SDK usage outside packages/ai-adapters
 *
 * Platform Invariant P7: All AI calls go through @webwaka/ai-adapters.
 * Direct OpenAI/Anthropic SDK imports or raw API fetch() outside the
 * adapters package are prohibited (Cloudflare Worker constraints + security).
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const SCAN_DIRS = [
  join(process.cwd(), 'apps'),
  join(process.cwd(), 'packages'),
];

const ALLOWED_PREFIXES = [
  join(process.cwd(), 'packages', 'ai-adapters'),
  join(process.cwd(), 'packages', 'ai'),
];

const VIOLATION_PATTERNS = [
  /new\s+OpenAI\s*\(/,
  /new\s+Anthropic\s*\(/,
  /import\s+.*from\s+['"]openai['"]/,
  /import\s+.*from\s+['"]@anthropic-ai/,
  /require\s*\(\s*['"]openai['"]\s*\)/,
  /fetch\s*\(\s*['"]https:\/\/api\.openai\.com/,
  /fetch\s*\(\s*['"]https:\/\/api\.anthropic\.com/,
  /process\.env\.(OPENAI|ANTHROPIC|GROQ|GEMINI)_(KEY|SECRET|TOKEN)\b/,
  /\bnew\s+Groq\s*\(/,
];

const SKIP = ['node_modules', '.d.ts', '.test.ts', '.spec.ts'];

function isAllowed(p: string) {
  return ALLOWED_PREFIXES.some(a => p.startsWith(a)) || SKIP.some(s => p.includes(s));
}

function scanDir(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const violations: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      violations.push(...scanDir(full));
    } else if (e.name.endsWith('.ts') && !isAllowed(full)) {
      const lines = readFileSync(full, 'utf8').split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        if (VIOLATION_PATTERNS.some(p => p.test(line))) {
          violations.push(`${full}:${i + 1}: ${line.trim()}`);
        }
      }
    }
  }
  return violations;
}

describe('Regression: P7 — no direct AI SDK usage outside ai-adapters', () => {
  it('no OpenAI/Anthropic SDK imports or raw fetch outside packages/ai-adapters', () => {
    const violations: string[] = [];
    for (const dir of SCAN_DIRS) {
      violations.push(...scanDir(dir));
    }
    if (violations.length > 0) {
      throw new Error(
        `P7 regression: direct AI SDK usage found:\n${violations.join('\n')}\n` +
        `All AI calls must go through @webwaka/ai-adapters.`
      );
    }
    expect(violations).toHaveLength(0);
  });
});
