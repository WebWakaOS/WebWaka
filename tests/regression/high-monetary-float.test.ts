/**
 * Regression: P9 — No float arithmetic on monetary/WakaCU values
 *
 * Platform Invariant P9: All WakaCU and kobo amounts are integers.
 * Floats cause compounding rounding errors in multi-tenant billing.
 *
 * Scans packages/superagent and packages/ai-abstraction for violations.
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';

const SCAN_DIRS = [
  join(process.cwd(), 'packages', 'superagent', 'src'),
  join(process.cwd(), 'packages', 'ai-abstraction', 'src'),
];

const FLOAT_PATTERNS = [
  /parseFloat\s*\([^)]*(?:price|amount|cost|fee|balance|naira|kobo|wakaCu)/i,
  /(?:price|amount|cost|fee|balance|naira|kobo|wakaCu)[^=\n]*\.toFixed\s*\(/i,
  /Math\.round\s*\([^)]*(?:price|amount|cost|fee|balance|wakaCu)/i,
];

const EXEMPT_SUFFIXES = ['.test.ts', '.spec.ts', '.fuzz.test.ts', '.test.idempotency.ts'];

function scanDir(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const violations: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      violations.push(...scanDir(full));
    } else if (e.name.endsWith('.ts')) {
      if (EXEMPT_SUFFIXES.some(s => e.name.endsWith(s))) continue;
      const lines = readFileSync(full, 'utf8').split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        if (line.includes('_naira') || line.includes('// DISPLAY_ONLY')) continue;
        if (FLOAT_PATTERNS.some(p => p.test(line))) {
          violations.push(`${full}:${i + 1}: ${line.trim()}`);
        }
      }
    }
  }
  return violations;
}

describe('Regression: P9 — no float arithmetic on monetary values', () => {
  it('no float operations on monetary/WakaCU fields in superagent + ai-abstraction', () => {
    const violations: string[] = [];
    for (const dir of SCAN_DIRS) {
      violations.push(...scanDir(dir));
    }
    if (violations.length > 0) {
      throw new Error(
        `P9 regression: float arithmetic on monetary fields:\n${violations.join('\n')}\n` +
        `Fix: use Math.ceil() / Math.floor() / integer arithmetic only.`
      );
    }
    expect(violations).toHaveLength(0);
  });
});
