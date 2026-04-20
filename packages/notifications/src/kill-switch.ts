/**
 * @webwaka/notifications — Kill-switch implementation.
 *
 * N-009 (OQ-002): NOTIFICATION_PIPELINE_ENABLED controls whether the
 * notification pipeline is active. When "0", all NotificationService.raise()
 * calls are no-ops, preserving the legacy EmailService path.
 *
 * This is the safety gate that prevents a partially-deployed notification
 * engine from processing events prematurely.
 */

import type { KillSwitch, KillSwitchConfig } from './types.js';

/**
 * Environment-variable-backed kill switch.
 * Thread-safe in Cloudflare Workers (single-threaded per isolate).
 */
export class EnvKillSwitch implements KillSwitch {
  private readonly _enabled: boolean;

  constructor(config: KillSwitchConfig) {
    this._enabled = config.notificationPipelineEnabled === '1';
  }

  isEnabled(): boolean {
    return this._enabled;
  }
}

/**
 * Create a kill switch from env vars.
 * Call once per Worker request/invocation.
 */
export function createKillSwitch(config: KillSwitchConfig): KillSwitch {
  return new EnvKillSwitch(config);
}
