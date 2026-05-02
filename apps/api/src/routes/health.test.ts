/**
 * GET /health — liveness probe smoke tests.
 * SEC: no auth required. Tests: status 200, body shape, environment field.
 */

import { describe, it, expect } from 'vitest';
import app from '../app.js';
import type { Env } from '../env.js';

const stubKV = {
  get: async (_key: string) => null,
  put: async (_key: string, _value: string, _opts?: unknown) => undefined,
} as unknown as KVNamespace;

function makeDb() {
  return {
    prepare: (_sql: string) => ({
      bind: (..._args: unknown[]) => ({
        run: async () => ({ success: true }),
        first: async <T>(): Promise<T | null> => null,
        all: async <T>() => ({ results: [] as T[] }),
      }),
      run: async () => ({ success: true }),
      first: async <T>(): Promise<T | null> => null,
      all: async <T>() => ({ results: [] as T[] }),
    }),
  };
}

function makeEnv(extras: Partial<Env> = {}): Env {
  return {
    DB: makeDb() as unknown as D1Database,
    GEOGRAPHY_CACHE: stubKV,
    RATE_LIMIT_KV: stubKV,
    JWT_SECRET: 'test-jwt-secret-minimum-32-characters!',
    ENVIRONMENT: 'development',
    PAYSTACK_SECRET_KEY: 'sk_test_fake',
    PREMBLY_API_KEY: 'prembly_test_key',
    TERMII_API_KEY: 'termii_test_key',
    WHATSAPP_ACCESS_TOKEN: 'wa_test_token',
    WHATSAPP_PHONE_NUMBER_ID: 'wa_phone_id',
    TELEGRAM_BOT_TOKEN: 'tg_test_token',
    LOG_PII_SALT: 'test-pii-salt-32-chars-minimum!!',
    ...extras,
  } as Env;
}

function req(path: string, init: RequestInit = {}): Request {
  return new Request(`https://api.webwaka.com${path}`, init);
}

describe('GET /health — liveness probe', () => {
  it('returns 200 with status: ok', async () => {
    const res = await app.fetch(req('/health'), makeEnv());
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body['status']).toBe('ok');
    expect(body['service']).toBe('webwaka-api');
    expect(body['environment']).toBe('development');
    expect(typeof body['timestamp']).toBe('string');
  });

  it('returns correct Content-Type', async () => {
    const res = await app.fetch(req('/health'), makeEnv());
    expect(res.headers.get('content-type')).toMatch(/application\/json/);
  });

  it('returns 200 for staging environment', async () => {
    const res = await app.fetch(req('/health'), makeEnv({ ENVIRONMENT: 'staging' }));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body['environment']).toBe('staging');
  });

  it('does not require Authorization header', async () => {
    const res = await app.fetch(req('/health'), makeEnv());
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});

describe('GET /health/version', () => {
  it('returns version string', async () => {
    const res = await app.fetch(req('/health/version'), makeEnv());
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(typeof body['version']).toBe('string');
    expect((body['version'] as string)).toMatch(/^\d+\.\d+\.\d+/);
  });
});
