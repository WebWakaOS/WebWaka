/**
 * AI Adapter Retry Middleware — Wave 3 (C2-1)
 * WebWaka OS — Exponential backoff with jitter for outbound AI provider calls.
 *
 * Wraps any async function (typically an adapter.complete() or adapter.stream() call)
 * with retry logic:
 *   - Max 3 attempts (configurable)
 *   - Exponential backoff: 250ms, 500ms, 1000ms base (+ jitter)
 *   - Provider-specific error classification:
 *       RETRYABLE:    rate-limit (429), server error (5xx), network timeout
 *       NOT_RETRYABLE: auth error (401/403), bad request (400), context length (422)
 *
 * Usage:
 *   const result = await withRetry(() => adapter.complete(request), { maxAttempts: 3 });
 */

// ---------------------------------------------------------------------------
// Error classification
// ---------------------------------------------------------------------------

export type RetryDecision = 'retry' | 'abort';

export interface ProviderError {
  /** HTTP status code if available */
  status?: number;
  /** Provider error code string (e.g. 'rate_limit_exceeded', 'context_length_exceeded') */
  code?: string;
  message?: string;
}

/**
 * Classify whether an error should be retried.
 * Called before each retry decision.
 */
export function classifyError(err: unknown): RetryDecision {
  if (err == null) return 'abort';

  const e = err as ProviderError;
  const status = e.status;
  const code   = e.code ?? '';
  const msg    = (e.message ?? '').toLowerCase();

  // Explicit abort conditions
  if (status === 401 || status === 403) return 'abort';  // auth — won't get better
  if (status === 400) return 'abort';                     // bad request
  if (status === 422) return 'abort';                     // context length / validation
  if (code === 'context_length_exceeded') return 'abort';
  if (code === 'invalid_api_key')         return 'abort';
  if (code === 'model_not_found')         return 'abort';

  // Explicit retry conditions
  if (status === 429) return 'retry'; // rate limit
  if (status !== undefined && status >= 500 && status < 600) return 'retry'; // server error
  if (msg.includes('timeout'))         return 'retry';
  if (msg.includes('network'))         return 'retry';
  if (msg.includes('econnreset'))      return 'retry';
  if (msg.includes('service unavailable')) return 'retry';
  if (code === 'rate_limit_exceeded')  return 'retry';
  if (code === 'server_error')         return 'retry';

  // Unknown — retry conservatively
  return 'retry';
}

// ---------------------------------------------------------------------------
// Backoff calculation
// ---------------------------------------------------------------------------

/**
 * Compute delay in ms for the given attempt number (0-indexed).
 * Formula: base * 2^attempt + jitter(0..base/2)
 */
export function backoffMs(attempt: number, baseMs = 250): number {
  const exp   = baseMs * Math.pow(2, attempt);
  const jitter = Math.random() * (baseMs / 2);
  return Math.min(exp + jitter, 8000); // cap at 8s
}

// ---------------------------------------------------------------------------
// withRetry
// ---------------------------------------------------------------------------

export interface RetryOptions {
  maxAttempts?: number;
  baseMs?: number;
  /** Override sleep implementation (for tests) */
  sleep?: (ms: number) => Promise<void>;
  /** Called before each retry with attempt number and error */
  onRetry?: (attempt: number, err: unknown) => void;
}

export class AIRetryError extends Error {
  public readonly attempts: number;
  public readonly lastError: unknown;

  constructor(attempts: number, lastError: unknown) {
    const msg = lastError instanceof Error ? lastError.message : String(lastError);
    super(`AI call failed after ${attempts} attempt(s): ${msg}`);
    this.name = 'AIRetryError';
    this.attempts = attempts;
    this.lastError = lastError;
  }
}

/**
 * Wrap an async call with exponential-backoff retry.
 *
 * @throws AIRetryError if all attempts fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {},
): Promise<T> {
  const maxAttempts = opts.maxAttempts ?? 3;
  const baseMs      = opts.baseMs      ?? 250;
  const sleep       = opts.sleep       ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));

  let lastErr: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const decision = classifyError(err);

      if (decision === 'abort' || attempt === maxAttempts - 1) {
        throw new AIRetryError(attempt + 1, err);
      }

      opts.onRetry?.(attempt + 1, err);
      await sleep(backoffMs(attempt, baseMs));
    }
  }

  // Unreachable but satisfies TypeScript
  throw new AIRetryError(maxAttempts, lastErr);
}
