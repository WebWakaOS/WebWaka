/**
 * @webwaka/hl-wallet — Feature flag tests
 */

import { describe, it, expect } from 'vitest';
import { isFeatureEnabled, assertFeatureEnabled, setFeatureFlag, getAllFeatureFlags } from '../feature-flags.js';
import { WalletError } from '../errors.js';

function makeKv(store: Record<string, string> = {}) {
  return {
    async get(key: string) { return store[key] ?? null; },
    async put(key: string, value: string) { store[key] = value; },
  };
}

describe('isFeatureEnabled', () => {
  it('returns false when flag is absent', async () => {
    expect(await isFeatureEnabled('transfers', makeKv())).toBe(false);
  });

  it('returns false when flag is "0"', async () => {
    expect(await isFeatureEnabled('transfers', makeKv({ 'wallet:flag:transfers_enabled': '0' }))).toBe(false);
  });

  it('returns true when flag is "1"', async () => {
    expect(await isFeatureEnabled('transfers', makeKv({ 'wallet:flag:transfers_enabled': '1' }))).toBe(true);
  });
});

describe('assertFeatureEnabled', () => {
  it('does not throw when flag is enabled', async () => {
    const kv = makeKv({ 'wallet:flag:withdrawals_enabled': '1' });
    await expect(assertFeatureEnabled('withdrawals', kv)).resolves.toBeUndefined();
  });

  it('throws FEATURE_DISABLED when flag is disabled', async () => {
    await expect(assertFeatureEnabled('withdrawals', makeKv())).rejects.toMatchObject({
      code: 'FEATURE_DISABLED',
    });
  });
});

describe('setFeatureFlag', () => {
  it('sets flag to enabled', async () => {
    const store: Record<string, string> = {};
    const kv = makeKv(store);
    await setFeatureFlag('mla_payout', true, kv);
    expect(store['wallet:flag:mla_payout_enabled']).toBe('1');
  });

  it('sets flag to disabled', async () => {
    const store: Record<string, string> = { 'wallet:flag:mla_payout_enabled': '1' };
    const kv = makeKv(store);
    await setFeatureFlag('mla_payout', false, kv);
    expect(store['wallet:flag:mla_payout_enabled']).toBe('0');
  });
});

describe('getAllFeatureFlags', () => {
  it('returns all flags with defaults', async () => {
    const flags = await getAllFeatureFlags(makeKv());
    expect(flags.transfers).toBe(false);
    expect(flags.withdrawals).toBe(false);
    expect(flags.online_funding).toBe(false);
    expect(flags.mla_payout).toBe(false);
  });

  it('reflects individual flag states', async () => {
    const kv = makeKv({ 'wallet:flag:transfers_enabled': '1', 'wallet:flag:mla_payout_enabled': '1' });
    const flags = await getAllFeatureFlags(kv);
    expect(flags.transfers).toBe(true);
    expect(flags.mla_payout).toBe(true);
    expect(flags.withdrawals).toBe(false);
    expect(flags.online_funding).toBe(false);
  });
});
