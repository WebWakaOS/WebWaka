/**
 * @webwaka/ai — AI provider abstraction type contracts.
 * (TDR-0009, Platform Invariants P7 + P8)
 *
 * Milestone 3: type contracts only.
 * Runtime adapters (OpenAI, Anthropic, BYOK): Milestone 5+.
 */

export type {
  AIProvider,
  AIProviderConfig,
  AIMessage,
  AIRequest,
  AIResponse,
  AIAdapter,
} from './types.js';
