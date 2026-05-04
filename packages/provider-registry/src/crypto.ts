/**
 * Provider Registry — Crypto Helpers
 * AES-256-GCM encryption / decryption using Web Crypto API.
 * CF Workers runtime compatible. No Node.js crypto module.
 */

const KEY_LENGTH_BYTES = 32;
const IV_LENGTH_BYTES = 12;

async function importKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const rawBytes = encoder.encode(secret);
  const keyBytes = new Uint8Array(KEY_LENGTH_BYTES);
  keyBytes.set(rawBytes.slice(0, KEY_LENGTH_BYTES));
  return crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export async function encryptCredentials(
  credentials: Record<string, string>,
  encryptionSecret: string,
): Promise<{ encrypted: string; iv: string }> {
  const key = await importKey(encryptionSecret);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES));
  const plaintext = new TextEncoder().encode(JSON.stringify(credentials));
  const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(cipherBuffer))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

export async function decryptCredentials(
  encrypted: string,
  ivBase64: string,
  encryptionSecret: string,
): Promise<Record<string, string>> {
  const key = await importKey(encryptionSecret);
  const cipherBytes = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
  const plainBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherBytes);
  return JSON.parse(new TextDecoder().decode(plainBuffer)) as Record<string, string>;
}

export function maskCredentials(credentials: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.keys(credentials).map(k => [k, '***masked***']));
}

export async function sha256hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
