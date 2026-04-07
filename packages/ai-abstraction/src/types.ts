/**
 * AI provider abstraction type contracts for WebWaka OS.
 * (Platform Invariants P7, P8 — TDR-0009)
 *
 * Milestone 3: interfaces only — no runtime calls.
 * Full adapter implementations (OpenAI, Anthropic, BYOK): Milestone 5+.
 *
 * P7: No direct SDK calls to OpenAI/Anthropic anywhere in the codebase.
 *     All AI access goes through these typed contracts.
 * P8: BYOK (Bring Your Own Key) — tenants may supply their own API keys.
 *     Never hardcode or log AI API keys.
 */

// ---------------------------------------------------------------------------
// Provider enum
// ---------------------------------------------------------------------------

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'byok';

// ---------------------------------------------------------------------------
// Provider configuration
// ---------------------------------------------------------------------------

export interface AIProviderConfig {
  /** Which AI provider to use */
  provider: AIProvider;
  /** Specific model identifier (e.g. "gpt-4o", "claude-3-sonnet") */
  model: string;
  /** API key from tenant BYOK config or platform secret — NEVER hardcoded */
  apiKey: string;
  /** For BYOK or self-hosted — override the provider base URL */
  baseUrl?: string;
}

// ---------------------------------------------------------------------------
// Message types
// ---------------------------------------------------------------------------

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// ---------------------------------------------------------------------------
// Request / Response
// ---------------------------------------------------------------------------

export interface AIRequest {
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
  /** If true, the adapter should return a streaming iterable */
  stream?: boolean;
}

export interface AIResponse {
  /** The generated text content */
  content: string;
  /** Which provider produced this response */
  provider: AIProvider;
  /** Exact model that produced this response */
  model: string;
  /** Total tokens consumed (prompt + completion) */
  tokensUsed: number;
  /** Why the generation stopped */
  finishReason: 'stop' | 'length' | 'error';
}

// ---------------------------------------------------------------------------
// Adapter interface (P7 — the contract every AI integration must implement)
// ---------------------------------------------------------------------------

/**
 * Every AI provider integration must implement this interface.
 *
 * Implementations live in `packages/ai-adapters/*` (Milestone 5+).
 * The platform layer selects the adapter based on tenant configuration.
 */
export interface AIAdapter {
  /** Non-streaming completion */
  complete(request: AIRequest): Promise<AIResponse>;

  /**
   * Streaming completion (optional).
   * If not implemented, callers must check `typeof adapter.stream === 'function'`.
   */
  stream?(request: AIRequest): AsyncIterable<string>;
}
