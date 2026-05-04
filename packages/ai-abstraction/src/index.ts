/**
 * @webwaka/ai — AI provider abstraction type contracts + routing engine.
 * (TDR-0009, Platform Invariants P7 + P8)
 *
 * SA-1.1: types, capabilities
 * SA-1.2: router (ResolvedAdapter, resolveAdapter, PLATFORM_AGGREGATORS)
 */

export type {
  AIProvider,
  AIProviderConfig,
  AIMessage,
  AIRequest,
  AIResponse,
  AIEmbedRequest,
  AIEmbedResponse,
  AIAdapter,
  AggregatorConfig,
  AIRoutingContext,
  AIRoutingErrorCode,
  ToolDefinition,
  ToolCall,
} from './types.js';

export { AIRoutingError } from './types.js';

export type {
  AICapabilityType,
  CapabilityCheckResult,
} from './capabilities.js';

export {
  evaluateAICapability,
  CAPABILITY_PLAN_TIER,
} from './capabilities.js';

export type {
  ResolvedAdapter,
  ByokKeyResolver,
  RouterOptions,
} from './router.js';

export {
  resolveAdapter,
  PLATFORM_AGGREGATORS,
} from './router.js';

// Wave 3 (C2-1): Retry middleware for AI adapter calls
export { withRetry, classifyError, backoffMs, AIRetryError } from './retry.js';
export type { RetryOptions } from './retry.js';

// Wave 3 (C2-2): Circuit breaker for AI providers
export {
  CircuitBreaker,
  CircuitOpenError,
  getCircuitBreaker,
  resetAllCircuitBreakers,
  isProviderOpen,
} from './circuit-breaker.js';
export type { CircuitBreakerOptions, CircuitState } from './circuit-breaker.js';

// BATCH 3: Multi-key pool for AI providers (especially OpenRouter)
export {
  selectKeyFromPool,
  markKeyRateLimited,
  recordKeySuccess,
  recordKeyFailure,
  clearExpiredRateLimits,
  getPoolHealth,
} from './key-pool.js';
export type { SelectedKey } from './key-pool.js';

// BATCH 3: Free model allowlist governance
export {
  FREE_MODEL_ALLOWLIST,
  FREE_MODELS_OPENROUTER,
  FREE_MODELS_GROQ,
  getPreferredFreeModel,
  isModelFree,
} from './free-models.js';
export type { AggregatorProvider } from './free-models.js';
