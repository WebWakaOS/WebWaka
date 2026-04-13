/**
 * @webwaka/core — Core runtime utilities for WebWaka OS Workers.
 *
 * Exports:
 *   - CircuitBreaker — KV-backed circuit breaker for external API calls (P7-D)
 *   - kvGet / kvGetText — Safe KV read wrappers (P7-E)
 */

export { CircuitBreaker } from './circuit-breaker.js';
export type { CircuitState } from './circuit-breaker.js';
export { kvGet, kvGetText } from './kv-safe.js';
