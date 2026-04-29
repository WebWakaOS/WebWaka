/**
 * Financial operation guard for Phase 3 (E22).
 * AC-OFF-05: Financial operations (contributions, pledges) are blocked when offline.
 *             No offline financial queue.
 *
 * Platform Invariant P5: Offline-first — but financial writes are the EXCEPTION.
 * Financial operations must never be queued offline because:
 *   1. They involve real money and cannot be replayed without risk of double-spend.
 *   2. Nigerian financial regulators (CBN, SEC) require real-time connectivity.
 */

import type { NetworkState } from './offline-indicator.js';

export class OfflineFinancialError extends Error {
  readonly code = 'FINANCIAL_BLOCKED_OFFLINE';

  constructor(operation?: string) {
    super(
      operation
        ? `Financial operation '${operation}' is blocked while offline. Please reconnect and try again.`
        : 'Financial operations are blocked while offline. Please reconnect and try again.',
    );
    this.name = 'OfflineFinancialError';
  }
}

/**
 * Assert that financial operations are allowed in the current network state.
 * Throws OfflineFinancialError if the device is offline (AC-OFF-05).
 * No-op when online or on slow connections (user is notified via network indicator).
 *
 * @param networkState - Current network state from observeNetworkState() / getNetworkState()
 * @param operation    - Optional: human-readable operation name for error messages
 */
export function assertFinancialBlocked(networkState: NetworkState, operation?: string): void {
  if (networkState === 'offline') {
    throw new OfflineFinancialError(operation);
  }
}
