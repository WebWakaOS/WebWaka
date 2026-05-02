/**
 * AI Provider Circuit Breaker — Wave 3 (C2-2)
 * WebWaka OS — Per-provider circuit breaker to prevent cascade failures.
 *
 * States:
 *   CLOSED    — normal; calls pass through
 *   OPEN      — N consecutive failures → block calls for openTtlMs
 *   HALF_OPEN — after TTL, one probe call; success → CLOSED, failure → OPEN
 *
 * Defaults: failureThreshold=5, openTtlMs=60_000
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  provider: string;
  failureThreshold?: number;
  openTtlMs?: number;
  now?: () => number;
}

export class CircuitOpenError extends Error {
  public readonly provider: string;
  public readonly remainingMs: number;
  constructor(provider: string, remainingMs: number) {
    super(`Circuit OPEN for provider '${provider}'. Retry in ${Math.ceil(remainingMs / 1000)}s.`);
    this.name = 'CircuitOpenError';
    this.provider = provider;
    this.remainingMs = remainingMs;
  }
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private consecutiveFailures = 0;
  private openedAt: number | null = null;

  private readonly provider: string;
  private readonly failureThreshold: number;
  private readonly openTtlMs: number;
  private readonly now: () => number;

  constructor(opts: CircuitBreakerOptions) {
    this.provider         = opts.provider;
    this.failureThreshold = opts.failureThreshold ?? 5;
    this.openTtlMs        = opts.openTtlMs        ?? 60_000;
    this.now              = opts.now               ?? (() => Date.now());
  }

  get currentState(): CircuitState {
    this.maybeTransitionFromOpen();
    return this.state;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.maybeTransitionFromOpen();
    if (this.state === 'OPEN') {
      const remaining = this.openedAt! + this.openTtlMs - this.now();
      throw new CircuitOpenError(this.provider, Math.max(0, remaining));
    }
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  reset(): void {
    this.state = 'CLOSED';
    this.consecutiveFailures = 0;
    this.openedAt = null;
  }

  private maybeTransitionFromOpen(): void {
    if (this.state === 'OPEN' && this.openedAt !== null) {
      if (this.now() >= this.openedAt + this.openTtlMs) {
        this.state = 'HALF_OPEN';
      }
    }
  }

  private onSuccess(): void {
    this.consecutiveFailures = 0;
    this.openedAt = null;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.consecutiveFailures++;
    if (this.state === 'HALF_OPEN') {
      this.openedAt = this.now();
      this.state = 'OPEN';
    } else if (this.consecutiveFailures >= this.failureThreshold) {
      this.openedAt = this.now();
      this.state = 'OPEN';
    }
  }
}

// Global registry — one breaker per provider
const _registry = new Map<string, CircuitBreaker>();

export function getCircuitBreaker(
  provider: string,
  opts: Omit<CircuitBreakerOptions, 'provider'> = {},
): CircuitBreaker {
  if (!_registry.has(provider)) {
    _registry.set(provider, new CircuitBreaker({ provider, ...opts }));
  }
  return _registry.get(provider)!;
}

export function resetAllCircuitBreakers(): void {
  _registry.forEach((cb) => cb.reset());
}

export function isProviderOpen(provider: string): boolean {
  const cb = _registry.get(provider);
  return cb ? cb.currentState === 'OPEN' : false;
}
