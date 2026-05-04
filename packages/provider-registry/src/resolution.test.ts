import { describe, it, expect, vi } from 'vitest';
import { resolveProvider } from './resolution.js';
import type { D1Like } from './types.js';
import { encryptCredentials } from './crypto.js';

const TEST_SECRET = 'test-encryption-secret-min-32-chars-ok';

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
    const db = makeMockD1([null, platformProvider()]);
    const resolved = await resolveProvider(db, 'ai', {}, TEST_SECRET);
    expect(resolved.provider_name).toBe('openrouter');
  });

  it('tenant override wins over platform provider', async () => {
    const tenantProvider = makeProvider({ scope: 'tenant', scope_id: 'tnt_abc', provider_name: 'groq' });
    const db = makeMockD1([tenantProvider]);
    const resolved = await resolveProvider(db, 'ai', { tenantId: 'tnt_abc' }, TEST_SECRET);
    expect(resolved.provider_name).toBe('groq');
    expect(resolved.scope).toBe('tenant');
  });

  it('falls through from tenant miss to platform provider', async () => {
    const db = makeMockD1([null, platformProvider()]);
    const resolved = await resolveProvider(db, 'ai', { tenantId: 'tnt_notfound' }, TEST_SECRET);
    expect(resolved.provider_name).toBe('openrouter');
  });

  it('uses env fallback when no DB provider found', async () => {
    const db = makeMockD1([null, null, null]);
    const resolved = await resolveProvider(db, 'ai', {}, TEST_SECRET, {
      envFallback: { GROQ_API_KEY: 'gsk-test-groq-key' },
    });
    expect(resolved.provider_name).toBe('groq');
    expect(resolved.credentials['api_key']).toBe('gsk-test-groq-key');
  });

  it('decrypts credentials from provider row', async () => {
    const credentials = { api_key: 'or-key-12345' };
    const { encrypted, iv } = await encryptCredentials(credentials, TEST_SECRET);
    const db = makeMockD1([null, makeProvider({ credentials_encrypted: encrypted, credentials_iv: iv })]);
    const resolved = await resolveProvider(db, 'ai', {}, TEST_SECRET);
    expect(resolved.credentials['api_key']).toBe('or-key-12345');
  });

  it('throws when no provider and no env fallback', async () => {
    const db = makeMockD1([null, null, null]);
    await expect(resolveProvider(db, 'ai', {}, TEST_SECRET)).rejects.toThrow(/No active provider found/);
  });

  it('uses KV cache when available', async () => {
    const dbSpy = vi.fn().mockReturnValue(null);
    const db = {
      prepare: () => ({ bind: () => ({ first: dbSpy, all: async () => ({ results: [] }), run: async () => ({}) }) }),
      batch: async () => [],
    } as unknown as D1Like;
    const kvMock = {
      get: vi.fn().mockResolvedValue(JSON.stringify(platformProvider())),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    } as unknown as KVNamespace;
    const resolved = await resolveProvider(db, 'ai', {}, TEST_SECRET, { kv: kvMock });
    expect(resolved.provider_name).toBe('openrouter');
    expect(dbSpy).not.toHaveBeenCalled();
  });
});

function platformProvider() { return makeProvider(); }
