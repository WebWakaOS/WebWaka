import { describe, expect, it } from 'vitest';
import { assertBroadcastChannel, type SupportGroupEntitlements } from './entitlements';

describe('assertBroadcastChannel', () => {
  it('throws an Error if the channel is not in the entitlements broadcastChannels list', () => {
    const mockEntitlements = {
      broadcastChannels: ['in_app', 'email'],
    } as unknown as SupportGroupEntitlements;

    expect(() => assertBroadcastChannel('sms', mockEntitlements)).toThrowError(
      /ENTITLEMENT_DENIED: Broadcast channel 'sms' is not included in your current plan/,
    );
  });

  it('does not throw if the channel is included in the entitlements broadcastChannels list', () => {
    const mockEntitlements = {
      broadcastChannels: ['in_app', 'sms', 'email'],
    } as unknown as SupportGroupEntitlements;

    expect(() => assertBroadcastChannel('sms', mockEntitlements)).not.toThrow();
  });
});
