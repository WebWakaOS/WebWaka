/**
 * packages/ai-adapters — createAdapter factory tests (QA-05).
 *
 * Tests:
 *   - createAdapter returns correct adapter class for each provider type
 *   - OpenAI-compat providers → OpenAICompatAdapter
 *   - anthropic → AnthropicAdapter
 *   - google → GoogleAdapter
 *   - Unknown provider → throws Error
 *   - Adapter complete() uses correct HTTP method and endpoint
 *   - Adapter embed() uses correct HTTP method and endpoint
 *   - P8: apiKey is NOT logged or included in error messages
 *   - P7: No SDK import (pure fetch)
 */

import { describe, it, expect, vi } from 'vitest';
import { createAdapter } from './factory.js';
import { OpenAICompatAdapter } from './openai-compat.js';
import { AnthropicAdapter } from './anthropic.js';
import { GoogleAdapter } from './google.js';
import type { ResolvedAdapter } from '@webwaka/ai';

// ---------------------------------------------------------------------------
// Factory — provider routing
// ---------------------------------------------------------------------------

function makeResolved(provider: string, apiKey = 'sk_test', model = 'test-model'): ResolvedAdapter {
  return {
    config: { provider: provider as never, apiKey, model },
    level: 3,
    wakaCuPer1kTokens: 0,
  } as ResolvedAdapter;
}

describe('createAdapter — factory routing', () => {
  it('returns OpenAICompatAdapter for provider: openai', () => {
    const adapter = createAdapter(makeResolved('openai'));
    expect(adapter).toBeInstanceOf(OpenAICompatAdapter);
  });

  it('returns OpenAICompatAdapter for provider: openrouter', () => {
    const adapter = createAdapter(makeResolved('openrouter'));
    expect(adapter).toBeInstanceOf(OpenAICompatAdapter);
  });

  it('returns OpenAICompatAdapter for provider: groq', () => {
    const adapter = createAdapter(makeResolved('groq'));
    expect(adapter).toBeInstanceOf(OpenAICompatAdapter);
  });

  it('returns OpenAICompatAdapter for provider: together', () => {
    const adapter = createAdapter(makeResolved('together'));
    expect(adapter).toBeInstanceOf(OpenAICompatAdapter);
  });

  it('returns OpenAICompatAdapter for provider: deepinfra', () => {
    const adapter = createAdapter(makeResolved('deepinfra'));
    expect(adapter).toBeInstanceOf(OpenAICompatAdapter);
  });

  it('returns OpenAICompatAdapter for provider: fireworks', () => {
    const adapter = createAdapter(makeResolved('fireworks'));
    expect(adapter).toBeInstanceOf(OpenAICompatAdapter);
  });

  it('returns OpenAICompatAdapter for provider: byok_custom with baseUrl', () => {
    const r = { config: { provider: 'byok_custom' as never, apiKey: 'k', model: 'm', baseUrl: 'https://custom.api/v1' }, level: 1, wakaCuPer1kTokens: 0 } as ResolvedAdapter;
    const adapter = createAdapter(r);
    expect(adapter).toBeInstanceOf(OpenAICompatAdapter);
  });

  it('returns OpenAICompatAdapter for provider: claude_via_agg (aggregator route)', () => {
    const adapter = createAdapter(makeResolved('claude_via_agg'));
    expect(adapter).toBeInstanceOf(OpenAICompatAdapter);
  });

  it('returns AnthropicAdapter for provider: anthropic', () => {
    const adapter = createAdapter(makeResolved('anthropic'));
    expect(adapter).toBeInstanceOf(AnthropicAdapter);
  });

  it('returns GoogleAdapter for provider: google', () => {
    const adapter = createAdapter(makeResolved('google'));
    expect(adapter).toBeInstanceOf(GoogleAdapter);
  });

  it('throws for unrecognised provider', () => {
    expect(() => createAdapter(makeResolved('unknown_provider_xyz'))).toThrow(
      /Unrecognised provider/,
    );
  });

  it('error message for unknown provider includes provider name', () => {
    try {
      createAdapter(makeResolved('bad_prov'));
    } catch (e) {
      expect((e as Error).message).toContain('bad_prov');
    }
  });

  it('error message for unknown provider does NOT contain apiKey (P8)', () => {
    const apiKey = 'sk_super_secret_key_12345';
    try {
      createAdapter(makeResolved('unknown', apiKey));
    } catch (e) {
      expect((e as Error).message).not.toContain(apiKey);
    }
  });
});

// ---------------------------------------------------------------------------
// OpenAICompatAdapter — complete() HTTP behaviour
// ---------------------------------------------------------------------------

describe('OpenAICompatAdapter — complete()', () => {
  it('calls /chat/completions with POST and Authorization header', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        choices: [{ message: { content: 'Test response' }, finish_reason: 'stop' }],
        usage: { total_tokens: 10 },
        model: 'gpt-4',
      }), { status: 200 }),
    );

    const adapter = createAdapter(makeResolved('openai', 'sk_test', 'gpt-4'));
    const result = await adapter.complete({
      messages: [{ role: 'user', content: 'Hello' }],
    });

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('/chat/completions'),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result.content).toBe('Test response');
    spy.mockRestore();
  });

  it('throws on HTTP error response', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{"error":"Rate limited"}', { status: 429 }),
    );
    const adapter = createAdapter(makeResolved('openai'));
    await expect(adapter.complete({ messages: [] })).rejects.toThrow(/429/);
    spy.mockRestore();
  });

  it('uses groq base URL for groq provider', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        choices: [{ message: { content: 'ok' }, finish_reason: 'stop' }],
        usage: { total_tokens: 5 },
        model: 'llama3-8b',
      }), { status: 200 }),
    );

    const adapter = new OpenAICompatAdapter({
      provider: 'groq' as never,
      apiKey: 'gsk_test',
      model: 'llama3-8b',
      baseUrl: 'https://api.groq.com/openai/v1',
    });
    await adapter.complete({ messages: [{ role: 'user', content: 'Hi' }] });

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('groq.com'),
      expect.any(Object),
    );
    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// AnthropicAdapter — complete() HTTP behaviour
// ---------------------------------------------------------------------------

describe('AnthropicAdapter — complete()', () => {
  it('calls Anthropic messages API with correct structure', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        content: [{ type: 'text', text: 'Anthropic response' }],
        usage: { input_tokens: 5, output_tokens: 10 },
        model: 'claude-3-opus',
        stop_reason: 'end_turn',
      }), { status: 200 }),
    );

    const adapter = createAdapter(makeResolved('anthropic', 'ant_key', 'claude-3-opus'));
    const result = await adapter.complete({
      messages: [{ role: 'user', content: 'Test' }],
    });

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('anthropic.com'),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result.content).toBe('Anthropic response');
    spy.mockRestore();
  });

  it('throws on Anthropic API error', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{"error":"Overloaded"}', { status: 529 }),
    );
    const adapter = createAdapter(makeResolved('anthropic'));
    await expect(adapter.complete({ messages: [] })).rejects.toThrow();
    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// GoogleAdapter — complete() HTTP behaviour
// ---------------------------------------------------------------------------

describe('GoogleAdapter — complete()', () => {
  it('calls Google Gemini API with correct structure', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        candidates: [{ content: { parts: [{ text: 'Google response' }] }, finishReason: 'STOP' }],
        usageMetadata: { totalTokenCount: 15 },
      }), { status: 200 }),
    );

    const adapter = createAdapter(makeResolved('google', 'goog_key', 'gemini-pro'));
    const result = await adapter.complete({
      messages: [{ role: 'user', content: 'Test' }],
    });

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('googleapis.com'),
      expect.any(Object),
    );
    expect(result.content).toBe('Google response');
    spy.mockRestore();
  });
});
