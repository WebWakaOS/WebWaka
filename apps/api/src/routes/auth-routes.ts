/**
 * Auth routes.
 *
 * POST   /auth/login            — authenticate with email + password, returns JWT + user
 * POST   /auth/register         — self-service tenant + workspace + user creation (also inserts tenants row)
 * POST   /auth/refresh          — refresh an expiring JWT (auth required)
 * GET    /auth/me               — return the caller's extended profile (auth required)
 * PATCH  /auth/profile          — update user phone / full name (auth required) [P19-B]
 * POST   /auth/verify           — validate a JWT and return its decoded payload
 * POST   /auth/forgot-password  — initiate password reset — stores token in KV + sends email via Resend [P19-A]
 * POST   /auth/reset-password   — complete password reset using KV token
 * POST   /auth/change-password  — change password for authenticated user (auth required)
 * POST   /auth/logout           — server-side token blacklist + session cleanup (auth required) [P19-C]
 * DELETE /auth/me               — NDPR Article 3.1(9) Right to Erasure (auth required)
 */

import { Hono } from 'hono';
import { issueJwt, verifyJwt, extractAuthContext } from '@webwaka/auth';
import { Role } from '@webwaka/types';
import type { UserId, WorkspaceId, TenantId } from '@webwaka/types';
import { asId } from '@webwaka/types';
import { errorResponse, ErrorCode } from '@webwaka/shared-config';
import { kvGetText } from '@webwaka/core';
import { EmailService } from '../lib/email-service.js';
import type { Env } from '../env.js';

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  workspace_id: string;
  tenant_id: string;
  role: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;
const RESET_TOKEN_TTL = 3600;
const RESET_TOKEN_TTL_HOURS = RESET_TOKEN_TTL / 3600;

function validatePassword(pw: string): string | null {
  if (pw.length < PASSWORD_MIN || pw.length > PASSWORD_MAX) {
    return `password must be between ${PASSWORD_MIN} and ${PASSWORD_MAX} characters.`;
  }
  return null;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const saltBuf = new Uint8Array(16);
  crypto.getRandomValues(saltBuf);
  const salt64 = btoa(String.fromCharCode(...saltBuf));
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), { name: 'PBKDF2' }, false, ['deriveBits'],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBuf, iterations: 600_000, hash: 'SHA-256' },
    keyMaterial,
    256,
  );
  const hash64 = btoa(String.fromCharCode(...new Uint8Array(derivedBits)));
  return `${salt64}:${hash64}`;
}

const authRoutes = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// POST /auth/login
// ---------------------------------------------------------------------------
authRoutes.post('/login', async (c) => {
  const body = await c.req.json<{ email: string; password: string }>().catch(() => null);

  if (!body?.email || !body?.password) {
    return c.json(errorResponse(ErrorCode.BadRequest, 'email and password are required.'), 400);
  }
  const pwErr = validatePassword(body.password);
  if (pwErr) return c.json(errorResponse(ErrorCode.BadRequest, pwErr), 400);

  const email = body.email.toLowerCase().trim();
  const userRow = await c.env.DB.prepare(
    `SELECT id, email, password_hash, workspace_id, tenant_id, role
     FROM users WHERE email = ? LIMIT 1`,
  ).bind(email).first<UserRow>();

  if (!userRow) {
    const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? 'unknown';
    console.error(JSON.stringify({
      level: 'warn', event: 'auth_failure', reason: 'user_not_found', email, ip,
      timestamp: new Date().toISOString(),
    }));
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Invalid email or password.'), 401);
  }

  const encoder = new TextEncoder();
  const [storedSalt, storedHash] = userRow.password_hash.split(':');

  if (!storedSalt || !storedHash) {
    return c.json(errorResponse(ErrorCode.InternalError, 'Authentication configuration error.'), 500);
  }

  const saltBuffer = Uint8Array.from(atob(storedSalt), (ch) => ch.charCodeAt(0));
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(body.password), { name: 'PBKDF2' }, false, ['deriveBits'],
  );

  let derivedHash: string;
  let needsRehash = false;

  const derivedBits600k = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBuffer, iterations: 600_000, hash: 'SHA-256' },
    keyMaterial, 256,
  );
  derivedHash = btoa(String.fromCharCode(...new Uint8Array(derivedBits600k)));

  if (derivedHash !== storedHash) {
    const derivedBits100k = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: saltBuffer, iterations: 100_000, hash: 'SHA-256' },
      keyMaterial, 256,
    );
    const legacyHash = btoa(String.fromCharCode(...new Uint8Array(derivedBits100k)));
    if (legacyHash === storedHash) {
      derivedHash = legacyHash;
      needsRehash = true;
    }
  }

  if (derivedHash !== storedHash) {
    const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? 'unknown';
    console.error(JSON.stringify({
      level: 'warn', event: 'auth_failure', reason: 'wrong_password',
      userId: userRow.id, ip, timestamp: new Date().toISOString(),
    }));
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Invalid email or password.'), 401);
  }

  if (needsRehash) {
    try {
      const newHash = await hashPassword(body.password);
      await c.env.DB.prepare(
        `UPDATE users SET password_hash = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`,
      ).bind(newHash, userRow.id, userRow.tenant_id).run();
    } catch {
      // Rehash failure is non-critical
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

  try {
    const jti = crypto.randomUUID();
    await c.env.DB.prepare(
      `INSERT INTO sessions (id, user_id, tenant_id, issued_at, expires_at)
       VALUES (?, ?, ?, unixepoch(), unixepoch() + 3600)`,
    ).bind(jti, userRow.id, userRow.tenant_id).run();
  } catch {
    // sessions table may not exist yet — non-blocking
  }

  return c.json({
    token,
    user: {
      id: userRow.id,
      email: userRow.email,
      tenantId: userRow.tenant_id,
      workspaceId: userRow.workspace_id,
      role: userRow.role,
    },
  });
});

// ---------------------------------------------------------------------------
// POST /auth/register — self-service tenant registration
// Creates a new tenant row, workspace, and admin user in a single batch.
// T3: tenant_id is generated server-side — never accepted from the client.
// P19-F: also inserts a row into the tenants table.
// ---------------------------------------------------------------------------
authRoutes.post('/register', async (c) => {
  const body = await c.req.json<{
    email: string;
    password: string;
    businessName: string;
    phone?: string;
  }>().catch(() => null);

  if (!body?.email || !body?.password || !body?.businessName) {
    return c.json(
      errorResponse(ErrorCode.BadRequest, 'email, password, and businessName are required.'),
      400,
    );
  }
  if (!EMAIL_RE.test(body.email)) {
    return c.json(errorResponse(ErrorCode.BadRequest, 'Invalid email address.'), 400);
  }
  const pwErr = validatePassword(body.password);
  if (pwErr) return c.json(errorResponse(ErrorCode.BadRequest, pwErr), 400);

  if (body.businessName.trim().length < 2) {
    return c.json(errorResponse(ErrorCode.BadRequest, 'businessName must be at least 2 characters.'), 400);
  }

  const db = c.env.DB;
  const email = body.email.toLowerCase().trim();

  const existing = await db.prepare(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
  ).bind(email).first<{ id: string }>();

  if (existing) {
    return c.json(errorResponse(ErrorCode.Conflict, 'An account with this email already exists.'), 409);
  }

  const uid = crypto.randomUUID().replace(/-/g, '');
  const userId = `usr_${uid.slice(0, 20)}`;
  const tenantId = `tnt_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
  const workspaceId = `ws_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;

  const passwordHash = await hashPassword(body.password);
  const businessName = body.businessName.trim();

  await db.batch([
    // P19-F: Insert tenant row first (no FK constraints in D1 SQLite schema)
    db.prepare(`
      INSERT OR IGNORE INTO tenants (id, name, plan, status, created_at, updated_at)
      VALUES (?, ?, 'free', 'active', unixepoch(), unixepoch())
    `).bind(tenantId, businessName),

    db.prepare(`
      INSERT INTO workspaces
        (id, tenant_id, name, owner_type, owner_id,
         subscription_plan, subscription_status, active_layers,
         created_at, updated_at)
      VALUES (?, ?, ?, 'organization', ?, 'free', 'active', '["discovery"]', unixepoch(), unixepoch())
    `).bind(workspaceId, tenantId, businessName, userId),

    db.prepare(`
      INSERT INTO users
        (id, email, phone, password_hash, full_name,
         workspace_id, tenant_id, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'admin', unixepoch(), unixepoch())
    `).bind(
      userId,
      email,
      body.phone?.trim() ?? null,
      passwordHash,
      businessName,
      workspaceId,
      tenantId,
    ),
  ]);

  const token = await issueJwt(
    {
      sub: asId<UserId>(userId),
      workspace_id: asId<WorkspaceId>(workspaceId),
      tenant_id: asId<TenantId>(tenantId),
      role: Role.Admin,
    },
    c.env.JWT_SECRET,
  );

  return c.json({
    token,
    user: {
      id: userId,
      email,
      tenantId,
      workspaceId,
      role: 'admin',
    },
  }, 201);
});

// ---------------------------------------------------------------------------
// POST /auth/refresh — re-issue a fresh JWT for the authenticated caller
// SEC-04: Refresh token rotation — the old token is blacklisted upon refresh.
// ---------------------------------------------------------------------------
authRoutes.post('/refresh', async (c) => {
  const auth = c.get('auth');
  if (!auth) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Not authenticated.'), 401);
  }

  const oldToken = c.req.header('Authorization')?.replace(/^Bearer\s+/i, '');
  if (oldToken) {
    try {
      const kv = c.env.RATE_LIMIT_KV;
      await kv.put(`blacklist:${oldToken}`, '1', { expirationTtl: 3600 });
    } catch {
      // KV unavailable — fail open
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

// ---------------------------------------------------------------------------
// GET /auth/me — return the caller's extended profile
// P19-B: returns phone, fullName, businessName in addition to core identity fields.
// ---------------------------------------------------------------------------
authRoutes.get('/me', async (c) => {
  const auth = c.get('auth');
  if (!auth) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Not authenticated.'), 401);
  }

  const userRow = await c.env.DB.prepare(
    'SELECT email, phone, full_name FROM users WHERE id = ? AND tenant_id = ? LIMIT 1',
  ).bind(auth.userId, auth.tenantId).first<{ email: string; phone: string | null; full_name: string | null }>();

  const wsRow = auth.workspaceId
    ? await c.env.DB.prepare(
        'SELECT name FROM workspaces WHERE id = ? AND tenant_id = ? LIMIT 1',
      ).bind(auth.workspaceId, auth.tenantId).first<{ name: string }>()
    : null;

  return c.json({
    id: auth.userId,
    email: userRow?.email ?? '',
    phone: userRow?.phone ?? null,
    fullName: userRow?.full_name ?? null,
    businessName: wsRow?.name ?? null,
    tenantId: auth.tenantId,
    workspaceId: auth.workspaceId,
    role: auth.role,
  });
});

// ---------------------------------------------------------------------------
// PATCH /auth/profile — update mutable user profile fields (auth required)
// P19-B: allows updating phone and/or fullName without a full PATCH on workspaces.
// ---------------------------------------------------------------------------
authRoutes.patch('/profile', async (c) => {
  const auth = c.get('auth');
  if (!auth) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Not authenticated.'), 401);
  }

  const body = await c.req.json<{ phone?: string; fullName?: string }>().catch(() => null);

  if (!body || (body.phone === undefined && body.fullName === undefined)) {
    return c.json(
      errorResponse(ErrorCode.BadRequest, 'At least one field (phone, fullName) is required.'),
      400,
    );
  }

  const parts: string[] = [];
  const bindings: unknown[] = [];

  if (body.phone !== undefined) {
    parts.push('phone = ?');
    bindings.push(body.phone.trim() || null);
  }
  if (body.fullName !== undefined) {
    parts.push('full_name = ?');
    bindings.push(body.fullName.trim() || null);
  }
  parts.push('updated_at = unixepoch()');
  bindings.push(auth.userId, auth.tenantId);

  await c.env.DB.prepare(
    `UPDATE users SET ${parts.join(', ')} WHERE id = ? AND tenant_id = ?`,
  ).bind(...bindings).run();

  return c.json({ message: 'Profile updated successfully.' });
});

// ---------------------------------------------------------------------------
// POST /auth/forgot-password — initiate password reset
// P19-A: Stores a short-lived reset token in RATE_LIMIT_KV (TTL = 1 hour)
//        and sends a reset link via Resend transactional email.
// Always returns 200 to avoid email enumeration (SEC baseline).
// ---------------------------------------------------------------------------
authRoutes.post('/forgot-password', async (c) => {
  const body = await c.req.json<{ email: string }>().catch(() => null);

  if (!body?.email) {
    return c.json(errorResponse(ErrorCode.BadRequest, 'email is required.'), 400);
  }

  const email = body.email.toLowerCase().trim();
  const userRow = await c.env.DB.prepare(
    'SELECT id, full_name FROM users WHERE email = ? LIMIT 1',
  ).bind(email).first<{ id: string; full_name: string | null }>();

  if (userRow) {
    try {
      const resetToken = crypto.randomUUID();
      await c.env.RATE_LIMIT_KV.put(
        `pwd_reset:${resetToken}`,
        userRow.id,
        { expirationTtl: RESET_TOKEN_TTL },
      );

      const appBase = c.env.APP_BASE_URL?.replace(/\/$/, '') ?? 'https://app.webwaka.com';
      const resetUrl = `${appBase}/reset-password?token=${resetToken}`;
      const userName = userRow.full_name?.split(' ')[0] ?? 'there';

      const emailService = new EmailService(c.env.RESEND_API_KEY);
      await emailService.sendTransactional(email, 'password-reset', {
        name: userName,
        reset_url: resetUrl,
        expires_in_hours: RESET_TOKEN_TTL_HOURS,
      });

      console.log(JSON.stringify({
        level: 'info',
        event: 'password_reset_initiated',
        userId: userRow.id,
        timestamp: new Date().toISOString(),
      }));
    } catch {
      // KV or email failure — still return 200 to avoid enumeration
    }
  }

  return c.json({
    message: 'If an account exists with that email address, a password reset link has been sent.',
  });
});

// ---------------------------------------------------------------------------
// POST /auth/reset-password — complete password reset using KV token
// ---------------------------------------------------------------------------
authRoutes.post('/reset-password', async (c) => {
  const body = await c.req.json<{ token: string; password: string }>().catch(() => null);

  if (!body?.token || !body?.password) {
    return c.json(errorResponse(ErrorCode.BadRequest, 'token and password are required.'), 400);
  }
  const pwErr = validatePassword(body.password);
  if (pwErr) return c.json(errorResponse(ErrorCode.BadRequest, pwErr), 400);

  const kvKey = `pwd_reset:${body.token}`;
  const userId = await kvGetText(c.env.RATE_LIMIT_KV, kvKey, null);

  if (!userId) {
    return c.json(
      errorResponse(ErrorCode.Unauthorized, 'Password reset token is invalid or has expired.'),
      401,
    );
  }

  const newHash = await hashPassword(body.password);

  await c.env.DB.prepare(
    `UPDATE users SET password_hash = ?, updated_at = unixepoch() WHERE id = ?`,
  ).bind(newHash, userId).run();

  try {
    await c.env.RATE_LIMIT_KV.delete(kvKey);
  } catch {
    // Deletion failure is non-critical — token TTL will expire it
  }

  return c.json({ message: 'Password has been reset successfully. Please log in with your new password.' });
});

// ---------------------------------------------------------------------------
// POST /auth/logout — server-side token invalidation (auth required)
// P19-C: Blacklists the current JWT in RATE_LIMIT_KV and deletes all active
//        sessions for the user from the sessions table.
// ---------------------------------------------------------------------------
authRoutes.post('/logout', async (c) => {
  const auth = c.get('auth');
  if (!auth) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Not authenticated.'), 401);
  }

  const currentToken = c.req.header('Authorization')?.replace(/^Bearer\s+/i, '');
  if (currentToken) {
    try {
      await c.env.RATE_LIMIT_KV.put(`blacklist:${currentToken}`, '1', { expirationTtl: 3600 });
    } catch {
      // KV unavailable — fail open; local token cleared by client regardless
    }
  }

  try {
    await c.env.DB.prepare(
      `DELETE FROM sessions WHERE user_id = ? AND (tenant_id = ? OR tenant_id IS NULL)`,
    ).bind(auth.userId, auth.tenantId).run();
  } catch {
    // sessions table may not exist — non-blocking
  }

  return c.json({ message: 'Logged out successfully.' });
});

// ---------------------------------------------------------------------------
// DELETE /auth/me — NDPR Article 3.1(9) Right to Erasure (auth required)
// ---------------------------------------------------------------------------
authRoutes.delete('/me', async (c) => {
  const auth = c.get('auth');
  if (!auth) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Not authenticated.'), 401);
  }

  const db = c.env.DB;
  const anonRef = `deleted_${crypto.randomUUID()}`;

  await db.prepare(
    `UPDATE users SET
       email         = ?,
       full_name     = 'Deleted User',
       phone         = NULL,
       password_hash = NULL,
       updated_at    = unixepoch()
     WHERE id = ? AND tenant_id = ?`,
  ).bind(`${anonRef}@deleted.invalid`, auth.userId, auth.tenantId).run();

  await db.prepare(
    `DELETE FROM contact_channels WHERE user_id = ? AND (tenant_id = ? OR tenant_id IS NULL)`,
  ).bind(auth.userId, auth.tenantId).run();

  try {
    await db.prepare(
      `DELETE FROM sessions WHERE user_id = ? AND (tenant_id = ? OR tenant_id IS NULL)`,
    ).bind(auth.userId, auth.tenantId).run();
  } catch {
    // sessions table may not exist — safe to ignore
  }

  return c.json({
    message: 'Your personal data has been erased in compliance with NDPR Article 3.1(9).',
    erasedAt: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// POST /auth/change-password — change password for authenticated user
// Requires currentPassword to prevent CSRF-style privilege escalation.
// ---------------------------------------------------------------------------
authRoutes.post('/change-password', async (c) => {
  const auth = c.get('auth');
  if (!auth) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Not authenticated.'), 401);
  }

  const body = await c.req.json<{
    currentPassword: string;
    newPassword: string;
  }>().catch(() => null);

  if (!body?.currentPassword || !body?.newPassword) {
    return c.json(
      errorResponse(ErrorCode.BadRequest, 'currentPassword and newPassword are required.'),
      400,
    );
  }

  const pwErr = validatePassword(body.newPassword);
  if (pwErr) return c.json(errorResponse(ErrorCode.BadRequest, pwErr), 400);

  if (body.currentPassword === body.newPassword) {
    return c.json(
      errorResponse(ErrorCode.BadRequest, 'New password must differ from current password.'),
      400,
    );
  }

  const userRow = await c.env.DB.prepare(
    'SELECT password_hash FROM users WHERE id = ? AND tenant_id = ? LIMIT 1',
  ).bind(auth.userId, auth.tenantId).first<{ password_hash: string }>();

  if (!userRow?.password_hash) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'User not found.'), 401);
  }

  const encoder = new TextEncoder();
  const [storedSalt, storedHash] = userRow.password_hash.split(':');

  if (!storedSalt || !storedHash) {
    return c.json(errorResponse(ErrorCode.InternalError, 'Authentication configuration error.'), 500);
  }

  const saltBuffer = Uint8Array.from(atob(storedSalt), (ch) => ch.charCodeAt(0));
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(body.currentPassword), { name: 'PBKDF2' }, false, ['deriveBits'],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBuffer, iterations: 600_000, hash: 'SHA-256' },
    keyMaterial, 256,
  );
  const derivedHash = btoa(String.fromCharCode(...new Uint8Array(derivedBits)));

  if (derivedHash !== storedHash) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Current password is incorrect.'), 401);
  }

  const newHash = await hashPassword(body.newPassword);
  await c.env.DB.prepare(
    `UPDATE users SET password_hash = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`,
  ).bind(newHash, auth.userId, auth.tenantId).run();

  return c.json({ message: 'Password changed successfully.' });
});

// ---------------------------------------------------------------------------
// POST /auth/verify — validate a JWT token and return decoded payload
// ---------------------------------------------------------------------------
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
