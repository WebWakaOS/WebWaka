/**
 * Anthropic native adapter (direct BYOK).
 * (SA-1.3 — TDR-0009, Platform Invariant P7)
 *
 * Used when a user or workspace has a direct Anthropic BYOK key (routing level 1 or 2).
 * Aggregator routing (level 3-4) uses OpenAI-compat via openrouter with claude_via_agg.
 *
 * Anthropic Messages API (https://docs.anthropic.com/messages)
 * Cloudflare Workers compatible — no SDK, HTTP only.
 *
 * P7:  No Anthropic SDK import.
 * P8:  Never log apiKey.
 * P13: Callers must strip PII before calling.
 */

import type {
  AIAdapter,
  AIRequest,
  AIResponse,
} from '@webwaka/ai';

const ANTHROPIC_BASE_URL = 'https://api.anthropic.com/v1';
const ANTHROPIC_VERSION = '2023-06-01';
const DEFAULT_MODEL = 'claude-3-haiku-20240307';

export interface AnthropicAdapterConfig {
  apiKey: string;
  model?: string;
}

export class AnthropicAdapter implements AIAdapter {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(config: AnthropicAdapterConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model ?? DEFAULT_MODEL;
  }

  async complete(request: AIRequest): Promise<AIResponse> {
    // Anthropic separates system messages from the messages array
    const systemMessages = request.messages.filter((m) => m.role === 'system');
    const userMessages = request.messages.filter((m) => m.role !== 'system');

    const body: Record<string, unknown> = {
      model: this.model,
      max_tokens: request.maxTokens ?? 1024,
      messages: userMessages,
    };

    if (systemMessages.length > 0) {
      body['system'] = systemMessages.map((m) => m.content).join('\n\n');
    }

    const resp = await fetch(`${ANTHROPIC_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '(no body)');
      throw new Error(`[anthropic] HTTP ${resp.status}: ${errText}`);
    }

    const data = (await resp.json()) as {
      content: Array<{ type: string; text: string }>;
      stop_reason: string;
      usage: { input_tokens: number; output_tokens: number };
      model: string;
    };

    const textBlock = data.content.find((b) => b.type === 'text');
    if (!textBlock) {
      throw new Error('[anthropic] No text block in response');
    }

    return {
      content: textBlock.text,
      provider: 'anthropic',
      model: data.model ?? this.model,
      tokensUsed: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
      finishReason:
        data.stop_reason === 'end_turn'
          ? 'stop'
          : data.stop_reason === 'max_tokens'
            ? 'length'
            : 'error',
    };
  }
}
