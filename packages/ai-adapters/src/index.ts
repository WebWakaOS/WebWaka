/**
 * @webwaka/ai-adapters — Runtime AI provider adapters.
 * (SA-1.3 — TDR-0009, Platform Invariant P7)
 *
 * Exports:
 *   OpenAICompatAdapter  — covers OpenAI, Groq, OpenRouter, Together, DeepInfra, Fireworks
 *   AnthropicAdapter     — direct Anthropic BYOK (level 1-2)
 *   GoogleAdapter        — direct Gemini BYOK (level 1-2)
 *   createAdapter        — factory: given a ResolvedAdapter, returns the correct AIAdapter
 */

export { OpenAICompatAdapter } from './openai-compat.js';
export type { OpenAICompatAdapterConfig } from './openai-compat.js';

export { AnthropicAdapter } from './anthropic.js';
export type { AnthropicAdapterConfig } from './anthropic.js';

export { GoogleAdapter } from './google.js';
export type { GoogleAdapterConfig } from './google.js';

export { createAdapter } from './factory.js';
