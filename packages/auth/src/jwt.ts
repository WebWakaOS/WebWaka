/**
 * JWT validation scaffold for WebWaka OS.
 * (TDR-0008, security-baseline.md §2)
 *
 * IMPORTANT: This module is designed for the Cloudflare Workers runtime.
 * It uses the Web Crypto API (available in Workers, browsers, and Node 18+).
 *
 * Production JWT secret is stored in Cloudflare Worker secrets via
 * `wrangler secret put JWT_SECRET` — never in wrangler.toml or .env files.
 */

import type { JwtPayload } from '@webwaka/types';
import type { AuthContext } from '@webwaka/types';
import { asId } from '@webwaka/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Subset of JwtPayload needed to issue a new token (iat/exp are auto-set). */
export type JwtPayloadInput = Pick<JwtPayload, 'sub' | 'workspace_id' | 'tenant_id' | 'role'>;

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class JwtValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JwtValidationError';
  }
}

export class MissingTenantContextError extends JwtValidationError {
  constructor() {
    super(
      'tenant_id is missing from JWT payload. ' +
      'Every authenticated request must include tenant context. (TDR-0008)',
    );
    this.name = 'MissingTenantContextError';
  }
}

// ---------------------------------------------------------------------------
// JWT decode helpers (no signature verification — for structure parsing only)
// ---------------------------------------------------------------------------

/**
 * Decodes a JWT without verifying the signature.
 * Use only for inspecting claims after signature verification.
 */
function decodeJwtPayload(token: string): unknown {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new JwtValidationError('Malformed JWT: expected 3 parts');
  }
  const base64 = parts[1];
  if (!base64) {
    throw new JwtValidationError('Malformed JWT: missing payload segment');
  }
  const padded = base64.replace(/-/g, '+').replace(/_/g, '/');
  const json = atob(padded);
  return JSON.parse(json) as unknown;
}

// ---------------------------------------------------------------------------
// Payload shape validation
// ---------------------------------------------------------------------------

function isValidJwtPayload(payload: unknown): payload is JwtPayload {
  if (typeof payload !== 'object' || payload === null) return false;
  const p = payload as Record<string, unknown>;
  return (
    typeof p['sub'] === 'string' &&
    typeof p['workspace_id'] === 'string' &&
    typeof p['tenant_id'] === 'string' &&
    typeof p['role'] === 'string' &&
    typeof p['iat'] === 'number' &&
    typeof p['exp'] === 'number'
  );
}

// ---------------------------------------------------------------------------
// HMAC-SHA256 JWT verification (Cloudflare Workers Web Crypto)
// ---------------------------------------------------------------------------

/**
 * Verifies a JWT using HMAC-SHA256 and returns the typed payload.
 *
 * @param token - Raw JWT string from Authorization header
 * @param secret - JWT secret from Cloudflare Worker secrets (JWT_SECRET)
 * @throws JwtValidationError on invalid signature, expiry, or missing claims
 */
export async function verifyJwt(token: string, secret: string): Promise<JwtPayload> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new JwtValidationError('Malformed JWT: expected 3 parts');
  }

  const [headerB64, payloadB64, signatureB64] = parts as [string, string, string];
  const signingInput = `${headerB64}.${payloadB64}`;

  // SEC-JWT-01: Validate the algorithm header BEFORE signature verification to prevent
  // algorithm-confusion attacks (e.g. alg:none or unexpected RS256 with a public-key secret).
  try {
    const headerPadded = headerB64.replace(/-/g, '+').replace(/_/g, '/');
    const headerJson = atob(headerPadded);
    const header = JSON.parse(headerJson) as Record<string, unknown>;
    if (header['alg'] !== 'HS256') {
      throw new JwtValidationError(
        `JWT algorithm mismatch: expected 'HS256', got '${String(header['alg'])}'`,
      );
    }
  } catch (e) {
    if (e instanceof JwtValidationError) throw e;
    throw new JwtValidationError('Malformed JWT: cannot decode header');
  }

  // Import key
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );

  // Decode signature
  const signaturePadded = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
  const signatureBytes = Uint8Array.from(atob(signaturePadded), (c: string) => c.charCodeAt(0));

  // Verify
  const isValid = await crypto.subtle.verify(
    'HMAC',
    cryptoKey,
    signatureBytes,
    encoder.encode(signingInput),
  );

  if (!isValid) {
    throw new JwtValidationError('JWT signature verification failed');
  }

  // Decode and validate payload
  const payload = decodeJwtPayload(token);

  if (!isValidJwtPayload(payload)) {
    throw new JwtValidationError(
      'JWT payload missing required claims: sub, workspace_id, tenant_id, role, iat, exp',
    );
  }

  // Check expiry
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    throw new JwtValidationError(`JWT expired at ${new Date(payload.exp * 1000).toISOString()}`);
  }

  // Enforce tenant_id presence (security-baseline.md §2)
  if (!payload.tenant_id) {
    throw new MissingTenantContextError();
  }

  return payload;
}

// ---------------------------------------------------------------------------
// JWT issuance (HMAC-SHA256, Cloudflare Workers Web Crypto)
// ---------------------------------------------------------------------------

/**
 * Issues a signed JWT using HMAC-SHA256.
 *
 * @param payload - Claims to embed (iat/exp are automatically added)
 * @param secret  - JWT secret from Cloudflare Worker secrets (JWT_SECRET)
 * @param expiresInSec - Token lifetime in seconds (default: 1 hour)
 */
export async function issueJwt(
  payload: JwtPayloadInput,
  secret: string,
  expiresInSec = 3600,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = { ...payload, iat: now, exp: now + expiresInSec };

  const b64url = (str: string): string =>
    btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  const headerB64 = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadB64 = b64url(JSON.stringify(fullPayload));
  const signingInput = `${headerB64}.${payloadB64}`;

  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(signingInput));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${signingInput}.${sigB64}`;
}

// ---------------------------------------------------------------------------
// Extract auth context from a verified payload
// ---------------------------------------------------------------------------

/**
 * Converts a verified JwtPayload into an AuthContext.
 * The AuthContext is passed through all request handlers.
 */
export function extractAuthContext(payload: JwtPayload): AuthContext {
  if (!payload || typeof payload !== 'object') {
    throw new JwtValidationError('Invalid payload passed to extractAuthContext');
  }

  if (!payload.sub || !payload.workspace_id || !payload.tenant_id || !payload.role) {
    throw new JwtValidationError('Missing required claims in payload for AuthContext');
  }

  return {
    userId: asId(payload.sub),
    workspaceId: asId(payload.workspace_id),
    tenantId: asId(payload.tenant_id),
    role: payload.role,
  };
}

// ---------------------------------------------------------------------------
// Bearer token extraction
// ---------------------------------------------------------------------------

/**
 * Extracts the Bearer token from an Authorization header.
 * Returns null if the header is absent or malformed.
 */
export function extractBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) return null;
  const match = /^Bearer\s+(\S+)$/i.exec(authorizationHeader);
  return match?.[1] ?? null;
}
