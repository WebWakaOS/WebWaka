/**
 * ResourceHints component tests — Wave 3 C3-4
 */
import { describe, it, expect } from 'vitest';
import { AI_PROVIDER_ORIGINS, CF_WORKERS_ORIGIN, WEBWAKA_API_ORIGINS } from './ResourceHints.js';

// We test the origin constants directly (no DOM rendering needed)

describe('ResourceHints constants (C3-4)', () => {
  it('AI_PROVIDER_ORIGINS contains OpenAI', () => {
    expect(AI_PROVIDER_ORIGINS).toContain('https://api.openai.com');
  });
  it('AI_PROVIDER_ORIGINS contains Anthropic', () => {
    expect(AI_PROVIDER_ORIGINS).toContain('https://api.anthropic.com');
  });
  it('AI_PROVIDER_ORIGINS contains OpenRouter', () => {
    expect(AI_PROVIDER_ORIGINS).toContain('https://openrouter.ai');
  });
  it('AI_PROVIDER_ORIGINS contains Google AI', () => {
    expect(AI_PROVIDER_ORIGINS).toContain('https://generativelanguage.googleapis.com');
  });
  it('AI_PROVIDER_ORIGINS contains Groq', () => {
    expect(AI_PROVIDER_ORIGINS).toContain('https://api.groq.com');
  });

  it('CF_WORKERS_ORIGIN is a valid https URL', () => {
    expect(CF_WORKERS_ORIGIN).toMatch(/^https:\/\//);
  });

  it('WEBWAKA_API_ORIGINS contains staging and production', () => {
    expect(WEBWAKA_API_ORIGINS).toContain('https://api.webwaka.com');
    expect(WEBWAKA_API_ORIGINS).toContain('https://api-staging.webwaka.com');
  });

  it('all origins are valid https URLs', () => {
    const all = [...AI_PROVIDER_ORIGINS, CF_WORKERS_ORIGIN, ...WEBWAKA_API_ORIGINS];
    for (const origin of all) {
      expect(origin).toMatch(/^https:\/\/[a-z0-9.-]+/i);
    }
  });

  it('no duplicate origins', () => {
    const all = [...AI_PROVIDER_ORIGINS, CF_WORKERS_ORIGIN, ...WEBWAKA_API_ORIGINS];
    expect(all.length).toBe(new Set(all).size);
  });
});
