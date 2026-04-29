/**
 * credential-store.test.ts — N-054 (Phase 4)
 *
 * Tests AES-256-GCM encrypt/decrypt round-trip, KV store/load, and
 * error conditions (wrong key, tampered ciphertext, invalid envelope).
 *
 * Uses Node.js 18+ globalThis.crypto (Web Crypto API) — same as CF Workers.
 */

import { describe, it, expect } from 'vitest';
import {
  encryptCredentials,
  decryptCredentials,
  storeCredentials,
  loadCredentials,
} from './credential-store.js';
import type { KVLike } from './credential-store.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a valid 32-byte base64-encoded master key for testing. */
async function generateTestKey(): Promise<string> {
  const raw = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...raw));
}

function makeMockKv(store: Map<string, string>): KVLike {
  return {
    async get(key: string, _format: 'text') {
      return store.get(key) ?? null;
    },
    async put(key: string, value: string) {
      store.set(key, value);
    },
  };
}

// ---------------------------------------------------------------------------
// encryptCredentials + decryptCredentials
// ---------------------------------------------------------------------------

describe('encryptCredentials + decryptCredentials', () => {
  it('round-trips a credentials map correctly', async () => {
    const masterKey = await generateTestKey();
    const credentials = { api_key: 'sk_live_abc123', sender_id: 'WebWaka' };

    const envelope = await encryptCredentials(masterKey, credentials);
    const result = await decryptCredentials(masterKey, envelope);

    expect(result).toEqual(credentials);
  });

  it('produces different ciphertexts for the same input (random IV)', async () => {
    const masterKey = await generateTestKey();
    const credentials = { api_key: 'same_key' };

    const env1 = await encryptCredentials(masterKey, credentials);
    const env2 = await encryptCredentials(masterKey, credentials);

    // Both decrypt correctly
    expect(await decryptCredentials(masterKey, env1)).toEqual(credentials);
    expect(await decryptCredentials(masterKey, env2)).toEqual(credentials);

    // But ciphertexts differ (random IV)
    const parsed1 = JSON.parse(env1) as { iv: string; ciphertext: string };
    const parsed2 = JSON.parse(env2) as { iv: string; ciphertext: string };
    expect(parsed1.iv).not.toBe(parsed2.iv);
    expect(parsed1.ciphertext).not.toBe(parsed2.ciphertext);
  });

  it('envelope has correct algorithm and version', async () => {
    const masterKey = await generateTestKey();
    const envelope = await encryptCredentials(masterKey, { x: '1' });
    const parsed = JSON.parse(envelope) as { algorithm: string; version: number };
    expect(parsed.algorithm).toBe('AES-256-GCM');
    expect(parsed.version).toBe(1);
  });

  it('throws on wrong master key (different key cannot decrypt)', async () => {
    const key1 = await generateTestKey();
    const key2 = await generateTestKey();
    const envelope = await encryptCredentials(key1, { secret: 'value' });

    await expect(decryptCredentials(key2, envelope)).rejects.toThrow(
      '[credential-store] Decryption failed',
    );
  });

  it('throws on tampered ciphertext', async () => {
    const masterKey = await generateTestKey();
    const envelope = await encryptCredentials(masterKey, { secret: 'value' });

    // Tamper: flip a character in the ciphertext
    const parsed = JSON.parse(envelope) as { algorithm: string; version: number; iv: string; ciphertext: string };
    const tampered = JSON.stringify({
      ...parsed,
      ciphertext: parsed.ciphertext.slice(0, -2) + 'AA',
    });

    await expect(decryptCredentials(masterKey, tampered)).rejects.toThrow();
  });

  it('throws on non-JSON envelope', async () => {
    const masterKey = await generateTestKey();
    await expect(decryptCredentials(masterKey, 'not json')).rejects.toThrow(
      'not valid JSON',
    );
  });

  it('throws on unknown algorithm in envelope', async () => {
    const masterKey = await generateTestKey();
    const badEnvelope = JSON.stringify({ algorithm: 'AES-128-CBC', version: 1, iv: 'a', ciphertext: 'b' });
    await expect(decryptCredentials(masterKey, badEnvelope)).rejects.toThrow(
      'unknown algorithm or version',
    );
  });

  it('throws on master key shorter than 32 bytes', async () => {
    const shortKey = btoa('tooshort');  // < 32 bytes
    await expect(encryptCredentials(shortKey, { x: '1' })).rejects.toThrow(
      'must be 32 bytes',
    );
  });

  it('handles credentials with many fields', async () => {
    const masterKey = await generateTestKey();
    const credentials = {
      api_key: 'live_key_abc',
      api_secret: 'secret_xyz',
      sender_id: 'WebWaka',
      phone_number_id: '12345678',
      waba_id: '98765432',
      route: 'dnd',
    };
    const envelope = await encryptCredentials(masterKey, credentials);
    const result = await decryptCredentials(masterKey, envelope);
    expect(result).toEqual(credentials);
  });
});

// ---------------------------------------------------------------------------
// storeCredentials + loadCredentials
// ---------------------------------------------------------------------------

describe('storeCredentials + loadCredentials', () => {
  it('stores encrypted credentials in KV and loads them back', async () => {
    const masterKey = await generateTestKey();
    const store = new Map<string, string>();
    const kv = makeMockKv(store);
    const credentials = { api_key: 'sk_live_xyz', sender_id: 'WebWaka' };

    await storeCredentials(kv, masterKey, 'platform:ch_creds:sms:termii', credentials);

    expect(store.has('platform:ch_creds:sms:termii')).toBe(true);

    // Raw KV value should be JSON (not the plaintext api_key)
    const raw = store.get('platform:ch_creds:sms:termii')!;
    expect(raw).not.toContain('sk_live_xyz');  // never plain text in KV

    const loaded = await loadCredentials(kv, masterKey, 'platform:ch_creds:sms:termii');
    expect(loaded).toEqual(credentials);
  });

  it('returns null when KV key does not exist', async () => {
    const masterKey = await generateTestKey();
    const kv = makeMockKv(new Map());

    const result = await loadCredentials(kv, masterKey, 'missing:key');
    expect(result).toBeNull();
  });

  it('G16 ADL-002: raw KV value never contains plaintext credentials', async () => {
    const masterKey = await generateTestKey();
    const store = new Map<string, string>();
    const kv = makeMockKv(store);
    const credentials = { api_key: 'SUPER_SECRET_TERMII_KEY_9999' };

    await storeCredentials(kv, masterKey, 'tenant123:ch_creds:sms:termii', credentials);

    const raw = store.get('tenant123:ch_creds:sms:termii')!;
    expect(raw).not.toContain('SUPER_SECRET_TERMII_KEY_9999');
  });

  it('tenant-scoped key convention works correctly', async () => {
    const masterKey = await generateTestKey();
    const store = new Map<string, string>();
    const kv = makeMockKv(store);

    const platformCreds = { api_key: 'platform_key' };
    const tenantCreds = { api_key: 'tenant_key' };

    await storeCredentials(kv, masterKey, 'platform:ch_creds:email:resend', platformCreds);
    await storeCredentials(kv, masterKey, 'tenant_abc:ch_creds:email:resend', tenantCreds);

    const loadedPlatform = await loadCredentials(kv, masterKey, 'platform:ch_creds:email:resend');
    const loadedTenant = await loadCredentials(kv, masterKey, 'tenant_abc:ch_creds:email:resend');

    expect(loadedPlatform).toEqual(platformCreds);
    expect(loadedTenant).toEqual(tenantCreds);
    expect(loadedPlatform!['api_key']).not.toBe(loadedTenant!['api_key']);
  });
});
