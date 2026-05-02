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
