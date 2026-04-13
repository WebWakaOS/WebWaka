/**
 * Auth routes.
 *
 * POST   /auth/login   — authenticate with email + password, returns JWT
 * POST   /auth/refresh — refresh an expiring JWT (auth required)
 * GET    /auth/me      — return the caller's AuthContext (auth required)
 * POST   /auth/verify  — validate a JWT and return its decoded payload
 * DELETE /auth/me      — NDPR Article 3.1(9) Right to Erasure (auth required)
 */

import { Hono } from 'hono';
import { issueJwt, verifyJwt, extractAuthContext } from '@webwaka/auth';
import { Role } from '@webwaka/types';
import type { UserId, WorkspaceId, TenantId } from '@webwaka/types';
import { asId } from '@webwaka/types';
import { errorResponse, ErrorCode } from '@webwaka/shared-config';
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
    return c.json(errorResponse(ErrorCode.BadRequest, 'email and password are required.'), 400);
  }
  // SEC-09: Password complexity validation (NIST SP 800-63B: min 8, max 128)
  if (body.password.length < 8 || body.password.length > 128) {
    return c.json(errorResponse(ErrorCode.BadRequest, 'password must be between 8 and 128 characters.'), 400);
  }

  // Look up user by email
  const userRow = await c.env.DB.prepare(
    `SELECT id, password_hash, workspace_id, tenant_id, role
     FROM users WHERE email = ? LIMIT 1`,
  )
    .bind(body.email.toLowerCase().trim())
    .first<UserRow>();

  if (!userRow) {
    // SEC-16: Log failed auth attempt with IP for security monitoring
    const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? 'unknown';
    console.error(JSON.stringify({
      level: 'warn', event: 'auth_failure', reason: 'user_not_found',
      email: body.email.toLowerCase().trim(), ip,
      timestamp: new Date().toISOString(),
    }));
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Invalid email or password.'), 401);
  }

  // Verify password using Web Crypto (PBKDF2)
  const encoder = new TextEncoder();
  const [storedSalt, storedHash] = userRow.password_hash.split(':');

  if (!storedSalt || !storedHash) {
    return c.json(errorResponse(ErrorCode.InternalError, 'Authentication configuration error.'), 500);
  }

  // SEC-05: Increased from 100_000 to 600_000 iterations (OWASP 2024 recommendation).
  // Backward compat: try 600k first, fallback to 100k for legacy hashes.
  const saltBuffer = Uint8Array.from(atob(storedSalt), (c) => c.charCodeAt(0));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(body.password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );

  let derivedHash: string;
  let needsRehash = false;

  // Try current iteration count first (600k)
  const derivedBits600k = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBuffer, iterations: 600_000, hash: 'SHA-256' },
    keyMaterial,
    256,
  );
  derivedHash = btoa(String.fromCharCode(...new Uint8Array(derivedBits600k)));

  if (derivedHash !== storedHash) {
    // Fallback: try legacy 100k iterations
    const derivedBits100k = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: saltBuffer, iterations: 100_000, hash: 'SHA-256' },
      keyMaterial,
      256,
    );
    const legacyHash = btoa(String.fromCharCode(...new Uint8Array(derivedBits100k)));
    if (legacyHash === storedHash) {
      derivedHash = legacyHash;
      needsRehash = true;
    }
  }

  if (derivedHash !== storedHash) {
    // SEC-16: Log failed auth attempt with IP for security monitoring
    const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? 'unknown';
    console.error(JSON.stringify({
      level: 'warn', event: 'auth_failure', reason: 'wrong_password',
      userId: userRow.id, ip,
      timestamp: new Date().toISOString(),
    }));
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Invalid email or password.'), 401);
  }

  // SEC-05: Transparent rehash to 600k iterations if login used legacy 100k hash
  if (needsRehash) {
    try {
      const newSaltBuf = new Uint8Array(16);
      crypto.getRandomValues(newSaltBuf);
      const newSalt64 = btoa(String.fromCharCode(...newSaltBuf));
      const newKey = await crypto.subtle.importKey(
        'raw', encoder.encode(body.password), { name: 'PBKDF2' }, false, ['deriveBits'],
      );
      const newBits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: newSaltBuf, iterations: 600_000, hash: 'SHA-256' }, newKey, 256,
      );
      const newHash64 = btoa(String.fromCharCode(...new Uint8Array(newBits)));
      await c.env.DB.prepare(`UPDATE users SET password_hash = ?, updated_at = unixepoch() WHERE id = ?`)
        .bind(`${newSalt64}:${newHash64}`, userRow.id).run();
    } catch {
      // Rehash failure is non-critical — user can log in on next attempt
    }
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

  // SEC-11: Record session in D1 for NDPR erasure compliance
  try {
    const jti = crypto.randomUUID();
    await c.env.DB.prepare(
      `INSERT INTO sessions (id, user_id, tenant_id, issued_at, expires_at)
       VALUES (?, ?, ?, unixepoch(), unixepoch() + 3600)`,
    ).bind(jti, userRow.id, userRow.tenant_id).run();
  } catch {
    // sessions table may not exist yet — non-blocking
  }

  return c.json({ token });
});

// POST /auth/refresh — re-issue a fresh JWT for the authenticated caller
// SEC-04: Refresh token rotation — the old token is blacklisted upon refresh.
// Note: authMiddleware must be applied before this route in the app entry
authRoutes.post('/refresh', async (c) => {
  const auth = c.get('auth');
  if (!auth) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Not authenticated.'), 401);
  }

  // SEC-10: Blacklist the old token to prevent replay attacks
  const oldToken = c.req.header('Authorization')?.replace(/^Bearer\s+/i, '');
  if (oldToken) {
    try {
      const kv = c.env.RATE_LIMIT_KV;
      await kv.put(`blacklist:${oldToken}`, '1', { expirationTtl: 3600 });
    } catch {
      // KV unavailable — fail open (token will expire naturally)
    }
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

// GET /auth/me — return the caller's decoded AuthContext
// Note: authMiddleware must be applied before this route in the app entry
authRoutes.get('/me', (c) => {
  const auth = c.get('auth');
  if (!auth) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Not authenticated.'), 401);
  }
  return c.json({ data: auth });
});

// DELETE /auth/me — NDPR Article 3.1(9) Right to Erasure (auth required)
// Anonymises PII in users table — does NOT delete the row (preserves FK integrity).
// T3: tenant_id sourced from JWT claim (auth.tenantId), not from header.
authRoutes.delete('/me', async (c) => {
  const auth = c.get('auth');
  if (!auth) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Not authenticated.'), 401);
  }

  const db = c.env.DB;
  const anonRef = `deleted_${crypto.randomUUID()}`;

  // Anonymise user PII (preserve row for FK integrity)
  await db
    .prepare(
      `UPDATE users SET
         email         = ?,
         full_name     = 'Deleted User',
         phone         = NULL,
         password_hash = NULL,
         updated_at    = unixepoch()
       WHERE id = ? AND tenant_id = ?`,
    )
    .bind(`${anonRef}@deleted.invalid`, auth.userId, auth.tenantId)
    .run();

  // Purge contact channels (phone numbers, OTP codes)
  // SEC-003: Added tenant_id predicate for T3 compliance (migration 0191)
  // Uses (tenant_id = ? OR tenant_id IS NULL) to handle legacy rows without tenant_id
  await db
    .prepare(
      `DELETE FROM contact_channels WHERE user_id = ? AND (tenant_id = ? OR tenant_id IS NULL)`,
    )
    .bind(auth.userId, auth.tenantId)
    .run();

  // Invalidate all active sessions (best-effort — ignore if table not yet created)
  // SEC-003: Added tenant_id predicate for T3 compliance
  try {
    await db
      .prepare(`DELETE FROM sessions WHERE user_id = ? AND (tenant_id = ? OR tenant_id IS NULL)`)
      .bind(auth.userId, auth.tenantId)
      .run();
  } catch {
    // sessions table may not exist — safe to ignore
  }

  return c.json(
    {
      message: 'Your personal data has been erased in compliance with NDPR Article 3.1(9).',
      erasedAt: new Date().toISOString(),
    },
    200,
  );
});

// POST /auth/verify — validate a JWT token and return its decoded payload (no secret in response)
authRoutes.post('/verify', async (c) => {
  const body = await c.req.json<{ token: string }>().catch(() => null);

  if (!body?.token) {
    return c.json(errorResponse(ErrorCode.BadRequest, 'token is required.'), 400);
  }

  try {
    const payload = await verifyJwt(body.token, c.env.JWT_SECRET);
    const context = extractAuthContext(payload);
    return c.json({ valid: true, data: context });
  } catch {
    return c.json({ valid: false, ...errorResponse(ErrorCode.Unauthorized, 'Invalid or expired token.') }, 401);
  }
});

export { authRoutes };
