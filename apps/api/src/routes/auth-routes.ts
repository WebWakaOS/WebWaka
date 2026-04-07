/**
 * Auth routes — login, refresh token.
 *
 * POST /auth/login   — authenticate with email + password, returns JWT
 * POST /auth/refresh — refresh an expiring JWT
 *
 * Note: WebWaka uses JWTs signed by the platform.
 * In production, credentials are validated against the users table in D1.
 */

import { Hono } from 'hono';
import { issueJwt } from '@webwaka/auth';
import { Role } from '@webwaka/types';
import type { UserId, WorkspaceId, TenantId } from '@webwaka/types';
import { asId } from '@webwaka/types';
import type { Env } from '../env.js';

interface UserRow {
  id: string;
  password_hash: string;
  workspace_id: string;
  tenant_id: string;
  role: string;
}

const authRoutes = new Hono<{ Bindings: Env }>();

// POST /auth/login
authRoutes.post('/login', async (c) => {
  const body = await c.req.json<{ email: string; password: string }>().catch(() => null);

  if (!body?.email || !body?.password) {
    return c.json({ error: 'email and password are required.' }, 400);
  }

  // Look up user by email
  const userRow = await c.env.DB.prepare(
    `SELECT id, password_hash, workspace_id, tenant_id, role
     FROM users WHERE email = ? LIMIT 1`,
  )
    .bind(body.email.toLowerCase().trim())
    .first<UserRow>();

  if (!userRow) {
    return c.json({ error: 'Invalid email or password.' }, 401);
  }

  // Verify password using Web Crypto (PBKDF2)
  const encoder = new TextEncoder();
  const [storedSalt, storedHash] = userRow.password_hash.split(':');

  if (!storedSalt || !storedHash) {
    return c.json({ error: 'Authentication configuration error.' }, 500);
  }

  const saltBuffer = Uint8Array.from(atob(storedSalt), (c) => c.charCodeAt(0));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(body.password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBuffer, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    256,
  );
  const derivedHash = btoa(String.fromCharCode(...new Uint8Array(derivedBits)));

  if (derivedHash !== storedHash) {
    return c.json({ error: 'Invalid email or password.' }, 401);
  }

  const token = await issueJwt(
    {
      sub: asId<UserId>(userRow.id),
      workspace_id: asId<WorkspaceId>(userRow.workspace_id),
      tenant_id: asId<TenantId>(userRow.tenant_id),
      role: (userRow.role as Role) ?? Role.Member,
    },
    c.env.JWT_SECRET,
  );

  return c.json({ token });
});

// POST /auth/refresh — simple re-issue if the token is still valid
authRoutes.post('/refresh', async (c) => {
  // Implemented in apps/api/src/middleware/auth.ts pipeline — token is already validated
  // We simply re-issue a fresh token for the same context
  const auth = c.get('auth');
  if (!auth) {
    return c.json({ error: 'Not authenticated.' }, 401);
  }

  const token = await issueJwt(
    {
      sub: auth.userId,
      workspace_id: auth.workspaceId,
      tenant_id: auth.tenantId,
      role: auth.role,
    },
    c.env.JWT_SECRET,
  );

  return c.json({ token });
});

export { authRoutes };
