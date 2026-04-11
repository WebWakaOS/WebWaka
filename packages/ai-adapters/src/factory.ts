/**
 * Adapter factory — maps a ResolvedAdapter from the router to a concrete AIAdapter.
 * (SA-1.3 — TDR-0009, Platform Invariant P7)
 *
 * This is the single point where provider identity maps to adapter implementation.
 * Every adapter construction must go through here — no direct instantiation in callers.
 */

import type { AIAdapter, ResolvedAdapter } from '@webwaka/ai';
import { OpenAICompatAdapter } from './openai-compat.js';
import { AnthropicAdapter } from './anthropic.js';
import { GoogleAdapter } from './google.js';

// OpenAI-compat providers (aggregators + direct OpenAI + byok_custom)
const OPENAI_COMPAT_PROVIDERS = new Set([
  'openai',
  'openrouter',
  'together',
  'groq',
  'eden',
  'fireworks',
  'deepinfra',
  'perplexity',
  'cohere',
  'mistral',
  'deepseek',
  'qwen',
  'yi',
  'gemini_via_agg',
  'claude_via_agg',
  'gpt_via_agg',
  'byok_custom',
]);

/**
 * Instantiate the correct AIAdapter for the resolved config.
 *
 * @throws Error if the provider is unrecognised (should never happen if
 *         the router PLATFORM_AGGREGATORS and AIProvider types are in sync).
 */
export function createAdapter(resolved: ResolvedAdapter): AIAdapter {
  const { config } = resolved;

  if (OPENAI_COMPAT_PROVIDERS.has(config.provider)) {
    return new OpenAICompatAdapter({
      provider: config.provider,
      apiKey: config.apiKey,
      model: config.model,
      ...(config.baseUrl !== undefined ? { baseUrl: config.baseUrl } : {}),
    });
  }

  if (config.provider === 'anthropic') {
    return new AnthropicAdapter({
      apiKey: config.apiKey,
      model: config.model,
    });
  }

  if (config.provider === 'google') {
    return new GoogleAdapter({
      apiKey: config.apiKey,
      model: config.model,
    });
  }

  throw new Error(
    `[createAdapter] Unrecognised provider: '${config.provider}'. ` +
    `Add a case to packages/ai-adapters/src/factory.ts.`,
  );
}
