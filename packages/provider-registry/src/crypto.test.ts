import { describe, it, expect } from 'vitest';
import { encryptCredentials, decryptCredentials, maskCredentials } from './crypto.js';

const TEST_SECRET = 'test-encryption-secret-min-32-chars-ok';

describe('encryptCredentials / decryptCredentials', () => {
  it('roundtrip: encrypts and decrypts correctly', async () => {
    const credentials = { api_key: 'sk-test-1234567890', region: 'us-east-1' };
    const { encrypted, iv } = await encryptCredentials(credentials, TEST_SECRET);
    expect(typeof encrypted).toBe('string');
    expect(typeof iv).toBe('string');
    const decrypted = await decryptCredentials(encrypted, iv, TEST_SECRET);
    expect(decrypted).toEqual(credentials);
  });

  it('produces different ciphertext for same input (random IV)', async () => {
    const credentials = { api_key: 'same-key' };
    const r1 = await encryptCredentials(credentials, TEST_SECRET);
    const r2 = await encryptCredentials(credentials, TEST_SECRET);
    expect(r1.iv).not.toBe(r2.iv);
    const d1 = await decryptCredentials(r1.encrypted, r1.iv, TEST_SECRET);
    const d2 = await decryptCredentials(r2.encrypted, r2.iv, TEST_SECRET);
    expect(d1).toEqual(d2);
  });

  it('throws on wrong decryption key', async () => {
    const credentials = { api_key: 'secret-key' };
    const { encrypted, iv } = await encryptCredentials(credentials, TEST_SECRET);
    await expect(decryptCredentials(encrypted, iv, 'wrong-key-also-32-chars-long-ok!')).rejects.toThrow();
  });

  it('handles empty credentials object', async () => {
    const credentials: Record<string, string> = {};
    const { encrypted, iv } = await encryptCredentials(credentials, TEST_SECRET);
    const decrypted = await decryptCredentials(encrypted, iv, TEST_SECRET);
    expect(decrypted).toEqual({});
  });

  it('handles special characters in credentials', async () => {
    const credentials = { api_key: 'key/with+special=chars&more!@#$%' };
    const { encrypted, iv } = await encryptCredentials(credentials, TEST_SECRET);
    const decrypted = await decryptCredentials(encrypted, iv, TEST_SECRET);
    expect(decrypted.api_key).toBe(credentials.api_key);
  });
});

describe('maskCredentials', () => {
  it('masks all credential values', () => {
    const masked = maskCredentials({ api_key: 'real-key', secret: 'real-secret' });
    expect(masked.api_key).toBe('***masked***');
    expect(masked.secret).toBe('***masked***');
  });

  it('preserves keys', () => {
    const masked = maskCredentials({ api_key: 'v', token: 'v2' });
    expect(Object.keys(masked)).toEqual(['api_key', 'token']);
  });
});
