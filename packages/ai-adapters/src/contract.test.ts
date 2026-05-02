/**
 * AI Provider Adapter Contract Tests — Wave 3 C1-4
 *
 * Validates that each adapter sends requests that match the provider's
 * HTTP API spec. Uses a mock HTTP server (intercepting fetch) so no
 * real credentials are needed.
 *
 * Contracts tested:
 *   OpenAI/Compat: POST /chat/completions — correct body shape, Authorization header
 *   Anthropic:     POST /messages — correct body shape, x-api-key, anthropic-version
 *   Google:        POST /models/{model}:generateContent — correct body, key in URL
 *
 * Platform Invariant P7: No AI SDK imports — HTTP only.
 * Platform Invariant P8: API key must never appear in logs.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Mock fetch interceptor ────────────────────────────────────────────────

interface CapturedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
}

let lastRequest: CapturedRequest | null = null;

function mockFetch(responseBody: unknown) {
  return vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
    const rawHeaders: Record<string, string> = {};
    if (init?.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((v, k) => { rawHeaders[k] = v; });
      } else {
        Object.assign(rawHeaders, init.headers);
      }
    }
    lastRequest = {
      url,
      method: init?.method ?? 'GET',
      headers: rawHeaders,
      body: init?.body ? JSON.parse(init.body as string) as Record<string, unknown> : {},
    };
    return {
      ok: true,
      status: 200,
      json: async () => responseBody,
    };
  });
}

// ── OpenAI-compat adapter contract ───────────────────────────────────────

const OPENAI_MOCK_RESPONSE = {
  choices: [{ message: { role: 'assistant', content: 'Hello!' }, finish_reason: 'stop' }],
  usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
};

describe('Contract: OpenAICompatAdapter (C1-4)', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => { originalFetch = global.fetch; });
  afterEach(() => { global.fetch = originalFetch; lastRequest = null; });

  it('sends POST to /chat/completions with correct shape', async () => {
    global.fetch = mockFetch(OPENAI_MOCK_RESPONSE) as unknown as typeof fetch;

    const { OpenAICompatAdapter } = await import('./openai-compat.js');
    const adapter = new OpenAICompatAdapter({
      provider: 'openai' as never,
      apiKey: 'sk-test-123',
      model: 'gpt-4o-mini',
    });

    await adapter.complete({
      messages: [{ role: 'user', content: 'Hello' }],
    });

    expect(lastRequest).not.toBeNull();
    expect(lastRequest!.url).toContain('/chat/completions');
    expect(lastRequest!.method).toBe('POST');
    expect(lastRequest!.body.model).toBe('gpt-4o-mini');
    expect(lastRequest!.body.messages).toBeInstanceOf(Array);
    expect(lastRequest!.body.stream).toBe(false);
  });

  it('sets Authorization: Bearer header', async () => {
    global.fetch = mockFetch(OPENAI_MOCK_RESPONSE) as unknown as typeof fetch;

    const { OpenAICompatAdapter } = await import('./openai-compat.js');
    const adapter = new OpenAICompatAdapter({
      provider: 'openai' as never,
      apiKey: 'sk-test-abc',
      model: 'gpt-4o-mini',
    });

    await adapter.complete({ messages: [{ role: 'user', content: 'hi' }] });

    const auth = lastRequest!.headers['Authorization'] ?? lastRequest!.headers['authorization'];
    expect(auth).toMatch(/^Bearer sk-test-abc$/);
  });

  it('respects custom baseUrl (for aggregators: Groq, OpenRouter, etc.)', async () => {
    global.fetch = mockFetch(OPENAI_MOCK_RESPONSE) as unknown as typeof fetch;

    const { OpenAICompatAdapter } = await import('./openai-compat.js');
    const adapter = new OpenAICompatAdapter({
      provider: 'openai' as never,
      apiKey: 'sk-groq-test',
      model: 'llama3-70b-8192',
      baseUrl: 'https://api.groq.com/openai/v1',
    });

    await adapter.complete({ messages: [{ role: 'user', content: 'test' }] });

    expect(lastRequest!.url).toContain('api.groq.com');
    expect(lastRequest!.url).toContain('/chat/completions');
  });

  it('propagates max_tokens from request', async () => {
    global.fetch = mockFetch(OPENAI_MOCK_RESPONSE) as unknown as typeof fetch;

    const { OpenAICompatAdapter } = await import('./openai-compat.js');
    const adapter = new OpenAICompatAdapter({
      provider: 'openai' as never, apiKey: 'sk-test', model: 'gpt-4o-mini',
    });

    await adapter.complete({ messages: [{ role: 'user', content: 'hi' }], maxTokens: 256 });

    expect(lastRequest!.body.max_tokens).toBe(256);
  });

  it('P8 invariant: response object does not include apiKey', async () => {
    global.fetch = mockFetch(OPENAI_MOCK_RESPONSE) as unknown as typeof fetch;

    const { OpenAICompatAdapter } = await import('./openai-compat.js');
    const adapter = new OpenAICompatAdapter({
      provider: 'openai' as never, apiKey: 'sk-secret-never-log-me', model: 'gpt-4o-mini',
    });

    const result = await adapter.complete({ messages: [{ role: 'user', content: 'hi' }] });
    expect(JSON.stringify(result)).not.toContain('sk-secret-never-log-me');
  });
});

// ── Anthropic adapter contract ────────────────────────────────────────────

const ANTHROPIC_MOCK_RESPONSE = {
  content: [{ type: 'text', text: 'Hello from Claude!' }],
  usage: { input_tokens: 8, output_tokens: 6 },
  stop_reason: 'end_turn',
};

describe('Contract: AnthropicAdapter (C1-4)', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => { originalFetch = global.fetch; });
  afterEach(() => { global.fetch = originalFetch; lastRequest = null; });

  it('sends POST to /v1/messages', async () => {
    global.fetch = mockFetch(ANTHROPIC_MOCK_RESPONSE) as unknown as typeof fetch;

    const { AnthropicAdapter } = await import('./anthropic.js');
    const adapter = new AnthropicAdapter({ apiKey: 'sk-ant-test' });

    await adapter.complete({ messages: [{ role: 'user', content: 'Hi Claude' }] });

    expect(lastRequest!.url).toContain('/v1/messages');
    expect(lastRequest!.method).toBe('POST');
  });

  it('sets x-api-key and anthropic-version headers', async () => {
    global.fetch = mockFetch(ANTHROPIC_MOCK_RESPONSE) as unknown as typeof fetch;

    const { AnthropicAdapter } = await import('./anthropic.js');
    const adapter = new AnthropicAdapter({ apiKey: 'sk-ant-my-key' });

    await adapter.complete({ messages: [{ role: 'user', content: 'test' }] });

    expect(lastRequest!.headers['x-api-key']).toBe('sk-ant-my-key');
    expect(lastRequest!.headers['anthropic-version']).toBeTruthy();
  });

  it('separates system messages from user messages in body', async () => {
    global.fetch = mockFetch(ANTHROPIC_MOCK_RESPONSE) as unknown as typeof fetch;

    const { AnthropicAdapter } = await import('./anthropic.js');
    const adapter = new AnthropicAdapter({ apiKey: 'sk-ant-test' });

    await adapter.complete({
      messages: [
        { role: 'system', content: 'You are helpful.' },
        { role: 'user', content: 'Hi' },
      ],
    });

    // Anthropic API: system is a top-level field, messages array has no system roles
    expect(lastRequest!.body.system).toBeTruthy();
    const messages = lastRequest!.body.messages as Array<{ role: string }>;
    expect(messages.every(m => m.role !== 'system')).toBe(true);
  });

  it('P8: response does not expose apiKey', async () => {
    global.fetch = mockFetch(ANTHROPIC_MOCK_RESPONSE) as unknown as typeof fetch;

    const { AnthropicAdapter } = await import('./anthropic.js');
    const adapter = new AnthropicAdapter({ apiKey: 'sk-ant-never-expose' });

    const result = await adapter.complete({ messages: [{ role: 'user', content: 'hi' }] });
    expect(JSON.stringify(result)).not.toContain('sk-ant-never-expose');
  });
});

// ── Google adapter contract ────────────────────────────────────────────────

const GOOGLE_MOCK_RESPONSE = {
  candidates: [{
    content: { parts: [{ text: 'Hello from Gemini!' }], role: 'model' },
    finishReason: 'STOP',
  }],
  usageMetadata: { promptTokenCount: 5, candidatesTokenCount: 6, totalTokenCount: 11 },
};

describe('Contract: GoogleAdapter (C1-4)', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => { originalFetch = global.fetch; });
  afterEach(() => { global.fetch = originalFetch; lastRequest = null; });

  it('sends POST to generateContent endpoint with key in URL', async () => {
    global.fetch = mockFetch(GOOGLE_MOCK_RESPONSE) as unknown as typeof fetch;

    const { GoogleAdapter } = await import('./google.js');
    const adapter = new GoogleAdapter({ apiKey: 'AIza-test' });

    await adapter.complete({ messages: [{ role: 'user', content: 'Hi Gemini' }] });

    expect(lastRequest!.url).toContain('generateContent');
    expect(lastRequest!.url).toContain('key=AIza-test');
    expect(lastRequest!.method).toBe('POST');
  });

  it('sends contents array in request body (Google format)', async () => {
    global.fetch = mockFetch(GOOGLE_MOCK_RESPONSE) as unknown as typeof fetch;

    const { GoogleAdapter } = await import('./google.js');
    const adapter = new GoogleAdapter({ apiKey: 'AIza-test' });

    await adapter.complete({ messages: [{ role: 'user', content: 'test' }] });

    expect(lastRequest!.body.contents).toBeInstanceOf(Array);
  });

  it('uses custom model when provided', async () => {
    global.fetch = mockFetch(GOOGLE_MOCK_RESPONSE) as unknown as typeof fetch;

    const { GoogleAdapter } = await import('./google.js');
    const adapter = new GoogleAdapter({ apiKey: 'AIza-test', model: 'gemini-1.5-pro' });

    await adapter.complete({ messages: [{ role: 'user', content: 'test' }] });

    expect(lastRequest!.url).toContain('gemini-1.5-pro');
  });

  it('P8: response does not expose apiKey', async () => {
    global.fetch = mockFetch(GOOGLE_MOCK_RESPONSE) as unknown as typeof fetch;

    const { GoogleAdapter } = await import('./google.js');
    const adapter = new GoogleAdapter({ apiKey: 'AIza-never-expose-this' });

    const result = await adapter.complete({ messages: [{ role: 'user', content: 'hi' }] });
    expect(JSON.stringify(result)).not.toContain('AIza-never-expose-this');
  });
});
