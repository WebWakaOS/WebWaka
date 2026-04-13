/**
 * CircuitBreaker — P7-D: MED-006 (ARC-15)
 *
 * Implements the classic circuit breaker pattern for external API calls
 * (Paystack, Termii, Prembly, WhatsApp, OpenAI, etc.) using Cloudflare KV
 * as the shared state store with TTL-based automatic recovery.
 *
 * State machine:
 *   CLOSED     — normal operation; all calls go through
 *   OPEN       — tripped; calls immediately throw without hitting the API
 *   HALF_OPEN  — recovery probe; one call allowed through to test the service
 *
 * Transitions:
 *   CLOSED  → OPEN      after failureThreshold consecutive failures
 *   OPEN    → HALF_OPEN after recoveryTimeoutMs have elapsed (TTL-based)
 *   HALF_OPEN → CLOSED  on successful call
 *   HALF_OPEN → OPEN    on failure (reset recovery timer)
 *
 * Platform Invariants: ARC-15, SEC (never expose internal error details)
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerOptions {
  /** Number of consecutive failures before tripping the breaker. */
  failureThreshold: number;
  /** Time in ms after which an OPEN breaker transitions to HALF_OPEN. */
  recoveryTimeoutMs: number;
}

interface CircuitRecord {
  state: CircuitState;
  failures: number;
  openedAt?: number;
}

const DEFAULT_OPTIONS: CircuitBreakerOptions = {
  failureThreshold: 5,
  recoveryTimeoutMs: 30_000,
};

export class CircuitBreaker {
  private readonly kvKey: string;
  private readonly opts: CircuitBreakerOptions;

  constructor(
    private readonly kv: KVNamespace,
    private readonly service: string,
    opts: Partial<CircuitBreakerOptions> = {},
  ) {
    this.kvKey = `cb:${service}`;
    this.opts = { ...DEFAULT_OPTIONS, ...opts };
  }

  /**
   * Attempt to call fn through the circuit breaker.
   * Throws if the circuit is OPEN (service unavailable).
   */
  async call<T>(fn: () => Promise<T>): Promise<T> {
    const record = await this.getRecord();

    if (record.state === 'OPEN') {
      // Check if recovery timeout has elapsed
      const elapsed = Date.now() - (record.openedAt ?? 0);
      if (elapsed < this.opts.recoveryTimeoutMs) {
        throw new Error(`[CircuitBreaker] ${this.service} is unavailable (circuit OPEN)`);
      }
      // Transition to HALF_OPEN — allow one probe call through
      await this.saveRecord({ ...record, state: 'HALF_OPEN' });
    }

    try {
      const result = await fn();
      await this.onSuccess(record);
      return result;
    } catch (err) {
      await this.onFailure(record);
      throw err;
    }
  }

  /** Returns the current circuit state. */
  async getState(): Promise<CircuitState> {
    const record = await this.getRecord();
    return record.state;
  }

  /** Manually reset the breaker to CLOSED (operator override). */
  async reset(): Promise<void> {
    await this.saveRecord({ state: 'CLOSED', failures: 0 });
  }

  private async getRecord(): Promise<CircuitRecord> {
    try {
      const raw = await this.kv.get(this.kvKey, { type: 'json' }) as CircuitRecord | null;
      return raw ?? { state: 'CLOSED', failures: 0 };
    } catch {
      // KV read failure — fail-open (treat as CLOSED)
      return { state: 'CLOSED', failures: 0 };
    }
  }

  private async saveRecord(record: CircuitRecord): Promise<void> {
    try {
      const ttlSeconds = Math.ceil(this.opts.recoveryTimeoutMs / 1000) * 2;
      await this.kv.put(this.kvKey, JSON.stringify(record), {
        expirationTtl: ttlSeconds,
      });
    } catch {
      // KV write failure — non-fatal; breaker state may be stale but not critical
    }
  }

  private async onSuccess(current: CircuitRecord): Promise<void> {
    if (current.state === 'HALF_OPEN') {
      // Successful probe — close the circuit
      await this.saveRecord({ state: 'CLOSED', failures: 0 });
    } else if (current.failures > 0) {
      // Reset failure count on success in CLOSED state
      await this.saveRecord({ state: 'CLOSED', failures: 0 });
    }
  }

  private async onFailure(current: CircuitRecord): Promise<void> {
    const newFailures = current.failures + 1;

    if (current.state === 'HALF_OPEN' || newFailures >= this.opts.failureThreshold) {
      // Trip the breaker
      await this.saveRecord({
        state: 'OPEN',
        failures: newFailures,
        openedAt: Date.now(),
      });
    } else {
      // Increment failure count — still CLOSED
      await this.saveRecord({ state: 'CLOSED', failures: newFailures });
    }
  }
}
