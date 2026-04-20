/**
 * @webwaka/notifications — Provider credential store (N-054, Phase 4).
 *
 * ADL-002 compliance: All provider API keys/secrets are stored AES-256-GCM
 * encrypted in Cloudflare KV. Zero credentials are written to D1.
 *
 * Design:
 *   Master key: env.NOTIFICATION_KV_MASTER_KEY (base64-encoded 32-byte key).
 *   Encryption: AES-256-GCM with a randomly generated 12-byte IV per encrypt.
 *   KV value format (JSON):
 *     { algorithm: 'AES-256-GCM', version: 1, iv: <base64>, ciphertext: <base64> }
 *   ciphertext = encrypt(plaintext_utf8) — WebCrypto appends 16-byte GCM tag.
 *
 * Public API:
 *   encryptCredentials(masterKeyB64, credentials) → envelope JSON string
 *   decryptCredentials(masterKeyB64, envelopeJson) → credentials Record<string,string>
 *   storeCredentials(kv, masterKeyB64, kvKey, credentials) → void
 *   loadCredentials(kv, masterKeyB64, kvKey) → Record<string,string> | null
 *
 * Guardrails:
 *   G16 (ADL-002) — credentials only in KV, never in D1
 *   G1  — credentials are tenant-scoped by kvKey convention:
 *          "platform:ch_creds:{channel}:{provider}" (platform)
 *          "{tenantId}:ch_creds:{channel}:{provider}" (tenant override)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CredentialEnvelope {
  algorithm: 'AES-256-GCM';
  version: 1;
  iv: string;           // base64-encoded 12-byte IV
  ciphertext: string;   // base64-encoded ciphertext (includes 16-byte GCM auth tag)
}

export interface KVLike {
  get(key: string, format: 'text'): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function base64Encode(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function base64Decode(b64: string): Uint8Array {
  const binaryString = atob(b64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function importMasterKey(masterKeyB64: string): Promise<CryptoKey> {
  const rawKey = base64Decode(masterKeyB64);
  if (rawKey.length !== 32) {
    throw new Error(
      `[credential-store] Master key must be 32 bytes (256-bit); got ${rawKey.length} bytes. ` +
      `Set NOTIFICATION_KV_MASTER_KEY to a base64-encoded 32-byte random key.`,
    );
  }
  return crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM', length: 256 },
    false,           // not extractable
    ['encrypt', 'decrypt'],
  );
}

// ---------------------------------------------------------------------------
// encryptCredentials
// ---------------------------------------------------------------------------

/**
 * Encrypt a credentials object to an envelope JSON string.
 *
 * @param masterKeyB64 - base64-encoded 32-byte AES-256 master key
 * @param credentials  - flat key→value map of provider credentials (e.g. { api_key: '...' })
 * @returns JSON string of CredentialEnvelope — safe to store in KV
 */
export async function encryptCredentials(
  masterKeyB64: string,
  credentials: Record<string, string>,
): Promise<string> {
  const key = await importMasterKey(masterKeyB64);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(credentials));

  const ciphertextBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext,
  );

  const envelope: CredentialEnvelope = {
    algorithm: 'AES-256-GCM',
    version: 1,
    iv: base64Encode(iv.buffer),
    ciphertext: base64Encode(ciphertextBuf),
  };

  return JSON.stringify(envelope);
}

// ---------------------------------------------------------------------------
// decryptCredentials
// ---------------------------------------------------------------------------

/**
 * Decrypt a CredentialEnvelope JSON string back to the credentials map.
 *
 * @param masterKeyB64  - base64-encoded 32-byte AES-256 master key
 * @param envelopeJson  - JSON string previously returned by encryptCredentials()
 * @returns Decrypted credentials map
 * @throws  If decryption fails (wrong key, tampered ciphertext, invalid envelope)
 */
export async function decryptCredentials(
  masterKeyB64: string,
  envelopeJson: string,
): Promise<Record<string, string>> {
  let envelope: unknown;
  try {
    envelope = JSON.parse(envelopeJson);
  } catch {
    throw new Error('[credential-store] Envelope is not valid JSON');
  }

  if (
    typeof envelope !== 'object' ||
    envelope === null ||
    (envelope as CredentialEnvelope).algorithm !== 'AES-256-GCM' ||
    (envelope as CredentialEnvelope).version !== 1
  ) {
    throw new Error('[credential-store] Envelope has unknown algorithm or version');
  }

  const env = envelope as CredentialEnvelope;
  const key = await importMasterKey(masterKeyB64);

  const iv = base64Decode(env.iv);
  const ciphertext = base64Decode(env.ciphertext);

  let plaintextBuf: ArrayBuffer;
  try {
    plaintextBuf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext,
    );
  } catch {
    throw new Error(
      '[credential-store] Decryption failed — wrong master key or tampered ciphertext',
    );
  }

  const plaintext = new TextDecoder().decode(plaintextBuf);
  let parsed: unknown;
  try {
    parsed = JSON.parse(plaintext);
  } catch {
    throw new Error('[credential-store] Decrypted plaintext is not valid JSON');
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('[credential-store] Decrypted credentials must be a JSON object');
  }

  return parsed as Record<string, string>;
}

// ---------------------------------------------------------------------------
// storeCredentials
// ---------------------------------------------------------------------------

/**
 * Encrypt credentials and write to KV under the given key.
 *
 * Key naming convention (G1 — tenant scope):
 *   Platform:  "platform:ch_creds:{channel}:{provider}"
 *   Tenant:    "{tenantId}:ch_creds:{channel}:{provider}"
 *
 * @param kv           - KVNamespace binding
 * @param masterKeyB64 - base64-encoded 32-byte AES-256 master key
 * @param kvKey        - KV key to store under
 * @param credentials  - credentials map to encrypt and store
 */
export async function storeCredentials(
  kv: KVLike,
  masterKeyB64: string,
  kvKey: string,
  credentials: Record<string, string>,
): Promise<void> {
  const envelopeJson = await encryptCredentials(masterKeyB64, credentials);
  await kv.put(kvKey, envelopeJson);
}

// ---------------------------------------------------------------------------
// loadCredentials
// ---------------------------------------------------------------------------

/**
 * Load and decrypt credentials from KV.
 *
 * Returns null if the KV key does not exist (no credentials configured).
 * Throws if the key exists but decryption fails (misconfiguration / key rotation error).
 *
 * @param kv           - KVNamespace binding
 * @param masterKeyB64 - base64-encoded 32-byte AES-256 master key
 * @param kvKey        - KV key to load from
 * @returns Decrypted credentials map, or null if not found
 */
export async function loadCredentials(
  kv: KVLike,
  masterKeyB64: string,
  kvKey: string,
): Promise<Record<string, string> | null> {
  const envelopeJson = await kv.get(kvKey, 'text');
  if (envelopeJson === null) {
    return null;
  }
  return decryptCredentials(masterKeyB64, envelopeJson);
}
