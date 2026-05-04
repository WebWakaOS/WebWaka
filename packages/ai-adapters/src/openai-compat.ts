/**
 * OpenAI-compatible adapter.
 * (SA-1.3 — TDR-0009, Platform Invariant P7)
 *
 * Covers:
 *   - OpenAI (direct BYOK)
 *   - Groq, OpenRouter, Together, DeepInfra, Fireworks, Perplexity (aggregators)
 *   - Any provider that serves the OpenAI chat completions API spec
 *
 * All of the aggregator-routable providers in the PLATFORM_AGGREGATORS registry
 * use this adapter. Only the baseUrl and apiKey differ.
 *
 * P7:  Never import OpenAI SDK. HTTP only — Cloudflare Workers compatible.
 * P8:  Never log apiKey values.
 * P13: Callers must strip PII from messages before passing to this adapter.
 */

import type {
  AIAdapter,
  AIRequest,
  AIResponse,
  AIEmbedRequest,
  AIEmbedResponse,
  AIProvider,
  ToolCall,
} from '@webwaka/ai';

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';

export interface OpenAICompatAdapterConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  model: string;
}

export class OpenAICompatAdapter implements AIAdapter {
  private readonly config: Required<OpenAICompatAdapterConfig>;

  constructor(config: OpenAICompatAdapterConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
    };
  }

  async complete(request: AIRequest): Promise<AIResponse> {
    const url = `${this.config.baseUrl}/chat/completions`;

    const body: Record<string, unknown> = {
      model: this.config.model,
      messages: request.messages,
      max_tokens: request.maxTokens ?? 1024,
      temperature: request.temperature ?? 0.7,
      stream: false,
    };

    // SA-5.x: inject tools when present (OpenAI function-calling format)
    if (request.tools && request.tools.length > 0) {
      body.tools = request.tools;
      body.tool_choice = request.tool_choice ?? 'auto';
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '(no body)');
      throw new Error(
        `[openai-compat] HTTP ${resp.status} from ${this.config.provider}: ${errText}`,
      );
    }

    const rawJson: unknown = await resp.json();
    const data = rawJson as {
      choices: Array<{
        message: {
          content: string | null;
          tool_calls?: ToolCall[];
        };
        finish_reason: string;
      }>;
      usage: { total_tokens: number };
      model: string;
    };

    const choice = data.choices[0];
    if (!choice) {
      throw new Error(`[openai-compat] Empty choices array from ${this.config.provider}`);
    }

    const finishReason = choice.finish_reason === 'tool_calls'
      ? 'tool_calls'
      : choice.finish_reason === 'stop'
        ? 'stop'
        : choice.finish_reason === 'length'
          ? 'length'
          : 'error';

    return {
      content: choice.message.content ?? '',
      provider: this.config.provider,
      model: data.model ?? this.config.model,
      tokensUsed: data.usage?.total_tokens ?? 0,
      finishReason,
      // exactOptionalPropertyTypes: omit toolCalls entirely when absent rather than
      // setting it to undefined, which would violate the strict optional type contract.
      ...(choice.message.tool_calls ? { toolCalls: choice.message.tool_calls } : {}),
    };
  }

  async embed(request: AIEmbedRequest): Promise<AIEmbedResponse> {
    const url = `${this.config.baseUrl}/embeddings`;

    const resp = await fetch(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        model: request.model ?? this.config.model,
        input: request.input,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '(no body)');
      throw new Error(
        `[openai-compat:embed] HTTP ${resp.status} from ${this.config.provider}: ${errText}`,
      );
    }

    const data = (await resp.json() as unknown) as {
      data: Array<{ embedding: number[] }>;
      usage: { total_tokens: number };
      model: string;
    };

    return {
      embeddings: data.data.map((d) => d.embedding),
      provider: this.config.provider,
      model: data.model ?? request.model ?? this.config.model,
      tokensUsed: data.usage?.total_tokens ?? 0,
    };
  }

  async *stream(request: AIRequest): AsyncIterable<string> {
    const url = `${this.config.baseUrl}/chat/completions`;

    const resp = await fetch(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        model: this.config.model,
        messages: request.messages,
        max_tokens: request.maxTokens ?? 1024,
        temperature: request.temperature ?? 0.7,
        stream: true,
      }),
    });

    if (!resp.ok || !resp.body) {
      const errText = await resp.text().catch(() => '(no body)');
      throw new Error(
        `[openai-compat:stream] HTTP ${resp.status} from ${this.config.provider}: ${errText}`,
      );
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { done, value } = await reader.read();
        if (done) break;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data) as {
              choices: Array<{ delta: { content?: string } }>;
            };
            const content = parsed.choices[0]?.delta?.content;
            if (content) yield content;
          } catch {
            // malformed SSE line — skip
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.apiKey}`,
    };
  }
}
