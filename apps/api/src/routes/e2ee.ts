/**
 * E2EE Key Management Routes (L-9 / ADR-0043)
 *
 * Phase 1 endpoints for client-side key publication and retrieval.
 * The server stores only the public key — private keys never leave the client.
 *
 * Routes:
 *   PATCH  /profile/e2e-pubkey          — register/update own public key
 *   GET    /profile/:id/e2e-pubkey       — fetch another user's public key (for encryption)
 *   DELETE /profile/e2e-pubkey          — revoke own public key
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';
import { authMiddleware } from '../middleware/auth.js';

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext; userId: string; tenantId: string } };

export const e2eeRoutes = new Hono<AppEnv>();

// ── JWK validation ────────────────────────────────────────────────────────────

interface JwkPublicKey {
  kty: string;
  crv?: string;
  x?: string;
  y?: string;
  use?: string;
  key_ops?: string[];
}

/**
 * Validates that the provided object is a valid ECDH P-256 public key JWK.
 * Only the public components (x, y) should be present — never d (private).
 */
function validateEcdhPublicKey(jwk: unknown): { valid: boolean; error?: string } {
  if (typeof jwk !== 'object' || jwk === null) {
    return { valid: false, error: 'JWK must be a JSON object' };
  }
  const key = jwk as JwkPublicKey;

  if (key.kty !== 'EC') {
    return { valid: false, error: 'JWK kty must be "EC"' };
  }
  if (key.crv !== 'P-256') {
    return { valid: false, error: 'JWK crv must be "P-256"' };
  }
  if (typeof key.x !== 'string' || key.x.length === 0) {
    return { valid: false, error: 'JWK must have non-empty x coordinate' };
  }
  if (typeof key.y !== 'string' || key.y.length === 0) {
    return { valid: false, error: 'JWK must have non-empty y coordinate' };
  }
  // Safety: ensure no private key component is present
  if ('d' in key) {
    return { valid: false, error: 'JWK must not contain private key component (d)' };
  }

  return { valid: true };
}

// ── Endpoints ─────────────────────────────────────────────────────────────────

/**
 * PATCH /profile/e2e-pubkey
 * Registers or updates the authenticated user's ECDH public key.
 * Body: { publicKey: JWK }
 */
e2eeRoutes.patch('/profile/e2e-pubkey', authMiddleware, async (c) => {
  const userId: string = c.get('userId');
  const tenantId: string = c.get('tenantId');

  let body: { publicKey?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const validation = validateEcdhPublicKey(body.publicKey);
  if (!validation.valid) {
    return c.json({ error: validation.error }, 400);
  }

  const jwkString = JSON.stringify(body.publicKey);
  const nowEpoch = Math.floor(Date.now() / 1000);

  await c.env.DB.prepare(
    `UPDATE profiles
     SET    e2e_public_key         = ?,
            e2e_pubkey_updated_at  = ?,
            updated_at             = ?
     WHERE  id        = ?
     AND    tenant_id = ?`,
  )
    .bind(jwkString, nowEpoch, nowEpoch, userId, tenantId)
    .run();

  console.info(JSON.stringify({
    level: 'info',
    event: 'e2e_pubkey_registered',
    user_id: userId,
    tenant_id: tenantId,
    ts: new Date().toISOString(),
  }));

  return c.json({ ok: true, message: 'E2EE public key registered' });
});

/**
 * GET /profile/:id/e2e-pubkey
 * Returns the ECDH public key for a given user ID.
 * Required to encrypt a DM to that user.
 * Authentication required (public keys are accessible to authenticated users only).
 */
e2eeRoutes.get('/profile/:id/e2e-pubkey', authMiddleware, async (c) => {
  const tenantId: string = c.get('tenantId');
  const targetId = c.req.param('id');

  const row = await c.env.DB.prepare(
    `SELECT e2e_public_key, e2e_pubkey_updated_at
     FROM   profiles
     WHERE  id        = ?
     AND    tenant_id = ?
     LIMIT  1`,
  )
    .bind(targetId, tenantId)
    .first<{ e2e_public_key: string | null; e2e_pubkey_updated_at: number | null }>();

  if (!row || !row.e2e_public_key) {
    return c.json(
      {
        error: 'E2EE public key not found for this user',
        hint: 'The user may not have enabled E2EE yet',
        e2ee_enabled: false,
      },
      404,
    );
  }

  let publicKey: unknown;
  try {
    publicKey = JSON.parse(row.e2e_public_key);
  } catch {
    return c.json({ error: 'Stored public key is malformed' }, 500);
  }

  return c.json({
    userId: targetId,
    publicKey,
    updatedAt: row.e2e_pubkey_updated_at,
    e2ee_enabled: true,
  });
});

/**
 * DELETE /profile/e2e-pubkey
 * Revokes the authenticated user's public key.
 * After revocation, senders cannot encrypt new DMs to this user (E2EE).
 * Existing E2EE messages remain readable to the recipient if they have their private key.
 */
e2eeRoutes.delete('/profile/e2e-pubkey', authMiddleware, async (c) => {
  const userId: string = c.get('userId');
  const tenantId: string = c.get('tenantId');
  const nowEpoch = Math.floor(Date.now() / 1000);

  await c.env.DB.prepare(
    `UPDATE profiles
     SET    e2e_public_key        = NULL,
            e2e_pubkey_updated_at = NULL,
            updated_at            = ?
     WHERE  id        = ?
     AND    tenant_id = ?`,
  )
    .bind(nowEpoch, userId, tenantId)
    .run();

  console.info(JSON.stringify({
    level: 'info',
    event: 'e2e_pubkey_revoked',
    user_id: userId,
    tenant_id: tenantId,
    ts: new Date().toISOString(),
  }));

  return c.json({ ok: true, message: 'E2EE public key revoked' });
});
