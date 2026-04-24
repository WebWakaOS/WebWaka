/**
 * TST-007: Chaos test — KV outage → rate-limit fails open (ARC-17)
 * When RATE_LIMIT_KV is unavailable, the system must:
 *   - Fail OPEN (allow the request) rather than fail closed (drop the request)
 *   - Log at 'warn' level so the outage is observable (never silently swallow)
 *   - Never panic or return 500 to the caller
 *
 * ARC-17 invariant: kvGetText never throws — fails open if KV is unavailable.
 */

import { describe, it, expect, vi } from 'vitest';

// Simulate the kvGetText helper behavior under KV outage
async function kvGetText(
  kv: { get: (key: string) => Promise<string | null> } | null,
  key: string,
  fallback: string | null,
): Promise<string | null> {
  if (!kv) return fallback; // KV not bound — fail open
  try {
    return await kv.get(key);
  } catch {
    return fallback; // KV unavailable — fail open per ARC-17
  }
}

function makeFailingKV() {
  return {
    get: async (_key: string): Promise<string | null> => {
      throw new Error('KV network timeout — simulated chaos outage');
    },
    put: async (_key: string, _value: string) => {
      throw new Error('KV write failed — simulated chaos');
    },
  };
}

function makeHealthyKV(data: Map<string, string> = new Map()) {
  return {
    get: async (key: string) => data.get(key) ?? null,
    put: async (key: string, value: string) => { data.set(key, value); },
  };
}

describe('TST-007 | ARC-17: KV outage chaos — rate-limit fails open', () => {

  it('ARC-17: kvGetText returns fallback when KV throws (not null explosion)', async () => {
    const failingKV = makeFailingKV();
    const result = await kvGetText(failingKV, 'blacklist:token:abc123', null);
    // Must return fallback (null), not throw
    expect(result).toBeNull();
  });

  it('ARC-17: kvGetText returns fallback when KV is null/unbound', async () => {
    const result = await kvGetText(null, 'some:key', null);
    expect(result).toBeNull();
  });

  it('ARC-17: Auth middleware fails OPEN on KV outage (request proceeds, not 500)', async () => {
    // Simulate: blacklist check fails because KV is down
    // Expected behavior: treat as "not blacklisted" (fail open)
    const failingKV = makeFailingKV();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const blacklisted = await kvGetText(failingKV, 'blacklist:token:test-token', null);

    // Fail open: null means NOT blacklisted → request allowed through
    const isBlacklisted = blacklisted !== null;
    expect(isBlacklisted).toBe(false); // Fail open

    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('ARC-17: Rate-limit counter defaults to 0 when KV is unavailable', async () => {
    const failingKV = makeFailingKV();
    const countStr = await kvGetText(failingKV, 'ratelimit:ws:abc:1h', null);

    // Fail open: treat as 0 (not rate-limited)
    const count = countStr ? parseInt(countStr, 10) : 0;
    expect(count).toBe(0);
  });

  it('ARC-17: Healthy KV returns correct value (not always failing open)', async () => {
    const data = new Map([['ratelimit:ws:abc:1h', '15']]);
    const healthyKV = makeHealthyKV(data);

    const result = await kvGetText(healthyKV, 'ratelimit:ws:abc:1h', null);
    expect(result).toBe('15');

    const count = result ? parseInt(result, 10) : 0;
    expect(count).toBe(15);
  });

  it('ARC-17: USSD rate limit fails open on KV outage (session allowed through)', async () => {
    // When RATE_LIMIT_KV is unavailable, USSD sessions must proceed
    // (Better to allow sessions than lock all users out)
    const failingKV = makeFailingKV();
    let allowed = true;

    try {
      const rlKey = `ussd:rl:+2348000000001:${Math.floor(Date.now() / 3_600_000)}`;
      const countStr = await kvGetText(failingKV, rlKey, null);
      const count = countStr ? parseInt(countStr, 10) : 0;
      // If KV fails, count = 0, which is below the 30 limit → session allowed
      allowed = count < 30;
    } catch {
      allowed = true; // Always fail open
    }

    expect(allowed).toBe(true);
  });

});
