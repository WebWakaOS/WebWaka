/**
 * Governance Check Tests — check-ai-direct-calls (Wave 3 C1-5)
 *
 * Verifies the P7 check correctly identifies prohibited AI SDK patterns
 * and allows legitimate code in the adapters package.
 */
import { describe, it, expect } from 'vitest';
import { join } from 'path';

const ALLOWED_PREFIXES = [
  join(process.cwd(), 'packages', 'ai-adapters'),
  join(process.cwd(), 'packages', 'ai'),
];

const VIOLATION_PATTERNS = [
  /new\s+OpenAI\s*\(/,
  /new\s+Anthropic\s*\(/,
  /import\s+.*from\s+['"]openai['"]/,
  /import\s+.*from\s+['"]@anthropic-ai/,
  /fetch\s*\(\s*['"]https:\/\/api\.openai\.com/,
  /fetch\s*\(\s*['"]https:\/\/api\.anthropic\.com/,
  /process\.env\.(OPENAI|ANTHROPIC|GROQ|GEMINI)_(KEY|SECRET|TOKEN)\b/,
  /\bnew\s+Groq\s*\(/,
];

function isAllowed(filePath: string): boolean {
  return ALLOWED_PREFIXES.some(a => filePath.startsWith(a));
}

function detectViolations(code: string): string[] {
  const violations: string[] = [];
  for (const line of code.split('\n')) {
    if (VIOLATION_PATTERNS.some(p => p.test(line))) {
      violations.push(line.trim());
    }
  }
  return violations;
}

describe('Governance check: check-ai-direct-calls (C1-5)', () => {
  describe('catches violations', () => {
    it('catches new OpenAI() constructor', () => {
      expect(detectViolations("const client = new OpenAI({ apiKey });")).toHaveLength(1);
    });
    it('catches import from openai', () => {
      expect(detectViolations("import OpenAI from 'openai';")).toHaveLength(1);
    });
    it('catches import from @anthropic-ai', () => {
      expect(detectViolations("import Anthropic from '@anthropic-ai/sdk';")).toHaveLength(1);
    });
    it('catches raw fetch to openai API', () => {
      expect(detectViolations(`fetch('https://api.openai.com/v1/chat/completions', opts)`)).toHaveLength(1);
    });
    it('catches raw fetch to anthropic API', () => {
      expect(detectViolations(`await fetch('https://api.anthropic.com/v1/messages', opts)`)).toHaveLength(1);
    });
    it('catches process.env.OPENAI_KEY', () => {
      expect(detectViolations('const k = process.env.OPENAI_KEY;')).toHaveLength(1);
    });
    it('catches new Groq()', () => {
      expect(detectViolations('const groq = new Groq({ apiKey: key });')).toHaveLength(1);
    });
  });

  describe('allowlist — ai-adapters package is permitted', () => {
    it('ai-adapters path is allowed', () => {
      expect(isAllowed(join(process.cwd(), 'packages', 'ai-adapters', 'src', 'openai-compat.ts'))).toBe(true);
    });
    it('ai package path is allowed', () => {
      expect(isAllowed(join(process.cwd(), 'packages', 'ai', 'src', 'router.ts'))).toBe(true);
    });
    it('other packages are not allowed', () => {
      expect(isAllowed(join(process.cwd(), 'packages', 'superagent', 'src', 'agent-loop.ts'))).toBe(false);
    });
    it('apps path is not allowed', () => {
      expect(isAllowed(join(process.cwd(), 'apps', 'api', 'src', 'routes', 'chat.ts'))).toBe(false);
    });
  });

  describe('clean code passes', () => {
    it('@webwaka/ai import is allowed', () => {
      expect(detectViolations("import { AIAdapter } from '@webwaka/ai';")).toHaveLength(0);
    });
    it('@webwaka/ai-adapters import is allowed', () => {
      expect(detectViolations("import { OpenAICompatAdapter } from '@webwaka/ai-adapters';")).toHaveLength(0);
    });
    it('regular fetch to own API is allowed', () => {
      expect(detectViolations("const res = await fetch('/api/v1/superagent/chat', opts);")).toHaveLength(0);
    });
  });
});
