/**
 * Google Gemini native adapter (direct BYOK).
 * (SA-1.3 — TDR-0009, Platform Invariant P7)
 *
 * Used when a user or workspace has a direct Google AI BYOK key (routing levels 1-2).
 * Aggregator routing (level 3-4) uses OpenAI-compat via openrouter with gemini_via_agg.
 *
 * Google Generative Language REST API v1beta.
 * Cloudflare Workers compatible — no SDK, HTTP only.
 *
 * P7:  No Google Generative AI SDK import.
 * P8:  Never log apiKey.
 * P13: Callers must strip PII before calling.
 */

import type {
  AIAdapter,
  AIRequest,
  AIResponse,
} from '@webwaka/ai';

const GOOGLE_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MODEL = 'gemini-1.5-flash';

export interface GoogleAdapterConfig {
  apiKey: string;
  model?: string;
}

export class GoogleAdapter implements AIAdapter {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(config: GoogleAdapterConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model ?? DEFAULT_MODEL;
  }

  async complete(request: AIRequest): Promise<AIResponse> {
    const url = `${GOOGLE_BASE_URL}/models/${this.model}:generateContent?key=${this.apiKey}`;

    // Convert AIMessage[] to Gemini contents format
    const systemMessages = request.messages.filter((m) => m.role === 'system');
    const conversationMessages = request.messages.filter((m) => m.role !== 'system');

    const body: Record<string, unknown> = {
      contents: conversationMessages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        maxOutputTokens: request.maxTokens ?? 1024,
        temperature: request.temperature ?? 0.7,
      },
    };

    if (systemMessages.length > 0) {
      body['systemInstruction'] = {
        parts: [{ text: systemMessages.map((m) => m.content).join('\n\n') }],
      };
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '(no body)');
      throw new Error(`[google] HTTP ${resp.status}: ${errText}`);
    }

    const data = (await resp.json()) as {
      candidates: Array<{
        content: { parts: Array<{ text: string }> };
        finishReason: string;
      }>;
      usageMetadata: { totalTokenCount: number };
    };

    const candidate = data.candidates[0];
    if (!candidate) {
      throw new Error('[google] No candidates in response');
    }

    const text = candidate.content.parts.map((p) => p.text).join('');

    return {
      content: text,
      provider: 'google',
      model: this.model,
      tokensUsed: data.usageMetadata?.totalTokenCount ?? 0,
      finishReason:
        candidate.finishReason === 'STOP'
          ? 'stop'
          : candidate.finishReason === 'MAX_TOKENS'
            ? 'length'
            : 'error',
    };
  }
}
