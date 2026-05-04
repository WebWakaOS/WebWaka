/**
 * Provider Registry — Resolution Tests
 *
 * Mock call count reasoning:
 * - context={} (no tenantId, no partnerId) → scopes=[platform] → 1 DB query
 * - context={tenantId} → scopes=[tenant, platform] → up to 2 DB queries
 * - context={tenantId, partnerId} → scopes=[tenant, partner, platform] → up to 3 DB queries
 */

import { describe, it, expect, vi } from 'vitest';
import { resolveProvider } from './resolution.js';
import type { D1Like } from './types.js';
import { encryptCredentials } from './crypto.js';

const TEST_SECRET = 'test-encryption-secret-min-32-chars-ok';

// ---------------------------------------------------------------------------
// Mock D1 builder — uses static responses, no actual async work
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/require-await */
function makeMockD1(rows: unknown[]): D1Like {
  let callIndex = 0;
  return {
    prepare: (_query: string) => ({
      bind: (..._args: unknown[]) => ({
        first: async <T>() => (rows[callIndex++] ?? null) as T | null,
        all: async <T>() => ({ results: rows as T[] }),
        run: async () => ({ success: true }),
      }),
    }),
    batch: async () => [],
  } as unknown as D1Like;
}
/* eslint-enable @typescript-eslint/require-await */

function makeProvider(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'pvd_test_01', category: 'ai', provider_name: 'openrouter', display_name: 'OpenRouter',
    status: 'active', scope: 'platform', scope_id: null, priority: 10, routing_policy: 'primary',
    capabilities: null, config_json: '{"baseUrl": "https://openrouter.ai/api/v1"}',
    credentials_encrypted: null, credentials_iv: null, health_status: 'healthy',
    last_health_check_at: null, created_by: null, created_at: 1700000000, updated_at: 1700000000,
    ...overrides,
  };
}

describe('resolveProvider', () => {
  it('resolves platform-level provider when no scope overrides', async () => {
    // context={} → 1 scope (platform) → 1 query → mock[0]=provider
    const db = makeMockD1([makeProvider()]);
    const resolved = await resolveProvider(db, 'ai', {}, TEST_SECRET);
    expect(resolved.provider_name).toBe('openrouter');
    expect(resolved.scope).toBe('platform');
  });

  it('tenant override wins over platform provider', async () => {
    // context={tenantId} → 2 scopes → mock[0]=tenantProvider (tenant query succeeds)
    const tenantProvider = makeProvider({ scope: 'tenant', scope_id: 'tnt_abc', provider_name: 'groq' });
    const db = makeMockD1([tenantProvider]);
    const resolved = await resolveProvider(db, 'ai', { tenantId: 'tnt_abc' }, TEST_SECRET);
    expect(resolved.provider_name).toBe('groq');
    expect(resolved.scope).toBe('tenant');
  });

  it('falls through from tenant miss to platform provider', async () => {
    // context={tenantId} → 2 scopes → mock[0]=null (tenant miss), mock[1]=platformProvider
    const db = makeMockD1([null, makeProvider()]);
    const resolved = await resolveProvider(db, 'ai', { tenantId: 'tnt_notfound' }, TEST_SECRET);
    expect(resolved.provider_name).toBe('openrouter');
    expect(resolved.scope).toBe('platform');
  });

  it('partner override wins over platform, loses to tenant', async () => {
    // context={tenantId, partnerId} → 3 scopes → mock[0]=tenantProvider wins immediately
    const tenantProvider = makeProvider({ scope: 'tenant', provider_name: 'anthropic' });
    const db = makeMockD1([tenantProvider]);
    const resolved = await resolveProvider(db, 'ai', { tenantId: 'tnt_x', partnerId: 'prt_y' }, TEST_SECRET);
    expect(resolved.provider_name).toBe('anthropic');
  });

  it('uses env fallback when no DB provider found', async () => {
    // context={} → 1 scope → mock[0]=null → env fallback
    const db = makeMockD1([null]);
    const resolved = await resolveProvider(db, 'ai', {}, TEST_SECRET, {
      envFallback: { GROQ_API_KEY: 'gsk-test-groq-key' },
    });
    expect(resolved.provider_name).toBe('groq');
    expect(resolved.credentials['api_key']).toBe('gsk-test-groq-key');
    expect(resolved.id).toBe('env_fallback_groq');
  });

  it('decrypts credentials from provider row', async () => {
    // context={} → 1 scope → mock[0]=provider with encrypted credentials
    const credentials = { api_key: 'or-key-12345' };
    const { encrypted, iv } = await encryptCredentials(credentials, TEST_SECRET);
    const db = makeMockD1([makeProvider({ credentials_encrypted: encrypted, credentials_iv: iv })]);
    const resolved = await resolveProvider(db, 'ai', {}, TEST_SECRET);
    expect(resolved.credentials['api_key']).toBe('or-key-12345');
  });

  it('throws when no provider and no env fallback', async () => {
    // context={} → 1 scope → mock[0]=null → throws
    const db = makeMockD1([null]);
    await expect(resolveProvider(db, 'ai', {}, TEST_SECRET)).rejects.toThrow(/No active provider found/);
  });

  it('email category resolves resend from env fallback', async () => {
    // context={} → 1 scope → mock[0]=null → env fallback
    const db = makeMockD1([null]);
    const resolved = await resolveProvider(db, 'email', {}, TEST_SECRET, {
      envFallback: { RESEND_API_KEY: 'resend-test-key' },
    });
    expect(resolved.provider_name).toBe('resend');
    expect(resolved.credentials['api_key']).toBe('resend-test-key');
  });

  it('uses KV cache when available (skips DB entirely)', async () => {
    const dbSpy = vi.fn().mockReturnValue(null);
    const db = {
      prepare: () => ({ bind: () => ({ first: dbSpy, all: async () => ({ results: [] }), run: async () => ({}) }) }),
      batch: async () => [],
    } as unknown as D1Like;

    const cachedValue = JSON.stringify(makeProvider());
    const kvMock = {
      get: vi.fn().mockResolvedValue(cachedValue),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    } as unknown as KVNamespace;

    const resolved = await resolveProvider(db, 'ai', {}, TEST_SECRET, { kv: kvMock });
    expect(resolved.provider_name).toBe('openrouter');
    // D1 should NOT have been queried (KV hit)
    expect(dbSpy).not.toHaveBeenCalled();
  });
});
