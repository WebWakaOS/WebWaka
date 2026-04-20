/**
 * Auth routes.
 *
 * POST   /auth/login                — authenticate with email + password, returns JWT + user
 * POST   /auth/register             — self-service tenant + workspace + user creation (also inserts tenants row)
 * POST   /auth/refresh              — refresh an expiring JWT (auth required)
 * GET    /auth/me                   — return the caller's extended profile (auth required)
 * PATCH  /auth/profile              — update user phone / full name (auth required) [P19-B]
 * POST   /auth/verify               — validate a JWT and return its decoded payload
 * POST   /auth/forgot-password      — initiate password reset — stores token in KV + sends email via Resend [P19-A]
 * POST   /auth/reset-password       — complete password reset using KV token
 * POST   /auth/change-password      — change password for authenticated user (auth required)
 * POST   /auth/logout               — server-side token blacklist + session cleanup (auth required) [P19-C]
 * DELETE /auth/me                   — NDPR Article 3.1(9) Right to Erasure (auth required)
 *
 * P20-A  Workspace Member Invitations:
 * POST   /auth/invite               — invite member by email (admin/owner only) [P20-A]
 * GET    /auth/invite/pending        — list pending invitations for workspace (admin only) [P20-A]
 * DELETE /auth/invite/:id            — revoke a pending invitation (admin only) [P20-A]
 * POST   /auth/accept-invite         — accept an invitation token (public) [P20-A]
 *
 * P20-B  Multi-Device Session Management:
 * GET    /auth/sessions             — list active sessions (auth required) [P20-B]
 * DELETE /auth/sessions             — revoke all sessions except current (auth required) [P20-B]
 * DELETE /auth/sessions/:id         — revoke a specific session by id (auth required) [P20-B]
 *
 * P20-C  Email Verification:
 * POST   /auth/send-verification    — send email verification link (auth required, throttled) [P20-C]
 * GET    /auth/verify-email         — consume verification token and mark email verified (public) [P20-C]
 */

import { Hono } from 'hono';
import { issueJwt, verifyJwt, extractAuthContext } from '@webwaka/auth';
import { Role } from '@webwaka/types';
import type { UserId, WorkspaceId, TenantId } from '@webwaka/types';
import { asId } from '@webwaka/types';
import { errorResponse, ErrorCode } from '@webwaka/shared-config';
import { kvGetText } from '@webwaka/core';
import { EmailService } from '../lib/email-service.js';
import { publishEvent } from '../lib/publish-event.js';
import { AuthEventType } from '@webwaka/events';
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
// Nigerian phone: optional +234 prefix, then 7–9 plus 10 digits (e.g. +2348012345678 or 08012345678)
const PHONE_RE = /^(\+234|0)[789]\d{9}$/;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;
const RESET_TOKEN_TTL = 3600;
const RESET_TOKEN_TTL_HOURS = RESET_TOKEN_TTL / 3600;
// P20-A: Invite token — 24-hour TTL
const INVITE_TOKEN_TTL = 86_400;
const INVITE_TOKEN_TTL_HOURS = INVITE_TOKEN_TTL / 3600;
// P20-C: Email verification token — 24-hour TTL; re-send throttle = 5 minutes
const VERIFY_TOKEN_TTL = 86_400;
const VERIFY_THROTTLE_TTL = 300;
// P20-B: Session TTL matches JWT lifetime (1 hour)
const SESSION_TTL = 3600;

// ---------------------------------------------------------------------------
// Crypto helpers
// ---------------------------------------------------------------------------

/** Returns the hex-encoded SHA-256 of the given string (for token hashing). */
async function sha256hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Derives a short device hint from a User-Agent string (browser/OS only, no PII). */
function deviceHintFromUA(ua: string | null | undefined): string {
  if (!ua) return 'Unknown device';
  if (/mobile|android|iphone|ipad/i.test(ua)) return 'Mobile browser';
  // BUG-01 fix: check Edge before Chrome — Chromium Edge UAs contain both "Edg" and "Chrome"
  if (/edg\//i.test(ua)) return 'Edge';
  if (/chrome/i.test(ua)) return 'Chrome';
  if (/firefox/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua)) return 'Safari';
  if (/curl|httpie|postman/i.test(ua)) return 'API client';
  return 'Browser';
}

/** Returns true if the caller's role is admin-level (admin or super_admin). */
function isAdminRole(role: string | undefined): boolean {
  return role === 'admin' || role === 'super_admin';
}

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

  // P20-B: Store session row with token hash (jti = sha256hex(token)) for per-session revocation.
  try {
    const sessionId = crypto.randomUUID();
    const tokenHash = await sha256hex(token);
    const ua = c.req.header('User-Agent') ?? null;
    const hint = deviceHintFromUA(ua);
    await c.env.DB.prepare(
      `INSERT INTO sessions (id, user_id, tenant_id, issued_at, expires_at, device_hint, user_agent, last_seen_at, jti)
       VALUES (?, ?, ?, unixepoch(), unixepoch() + ?, ?, ?, unixepoch(), ?)`,
    ).bind(sessionId, userRow.id, userRow.tenant_id, SESSION_TTL, hint, ua, tokenHash).run();
  } catch {
    // sessions table extensions may not exist yet — non-blocking
    try {
      const sessionId = crypto.randomUUID();
      await c.env.DB.prepare(
        `INSERT INTO sessions (id, user_id, tenant_id, issued_at, expires_at)
         VALUES (?, ?, ?, unixepoch(), unixepoch() + ?)`,
      ).bind(sessionId, userRow.id, userRow.tenant_id, SESSION_TTL).run();
    } catch {
      // sessions table may not exist — non-blocking
    }
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
    'SELECT email, phone, full_name, email_verified_at FROM users WHERE id = ? AND tenant_id = ? LIMIT 1',
  ).bind(auth.userId, auth.tenantId).first<{
    email: string; phone: string | null; full_name: string | null; email_verified_at: number | null;
  }>();

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
    emailVerifiedAt: userRow?.email_verified_at ?? null,
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
    const trimmedPhone = body.phone.trim();
    if (trimmedPhone && !PHONE_RE.test(trimmedPhone)) {
      return c.json(
        errorResponse(
          ErrorCode.BadRequest,
          'phone must be a valid Nigerian number (e.g. +2348012345678 or 08012345678).',
        ),
        400,
      );
    }
    parts.push('phone = ?');
    bindings.push(trimmedPhone || null);
  }
  if (body.fullName !== undefined) {
    const trimmedName = body.fullName.trim();
    if (trimmedName && trimmedName.length > 100) {
      return c.json(
        errorResponse(ErrorCode.BadRequest, 'fullName must be 100 characters or fewer.'),
        400,
      );
    }
    parts.push('full_name = ?');
    bindings.push(trimmedName || null);
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
    'SELECT id, full_name, tenant_id FROM users WHERE email = ? LIMIT 1',
  ).bind(email).first<{ id: string; full_name: string | null; tenant_id: string }>();

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

      if (c.env.NOTIFICATION_PIPELINE_ENABLED === '1') {
        // N-026 Phase 2: fire via notification pipeline
        await publishEvent(c.env, {
          eventId: crypto.randomUUID(),
          eventKey: AuthEventType.UserPasswordResetRequested,
          tenantId: userRow.tenant_id,
          actorId: userRow.id,
          actorType: 'user',
          payload: { name: userName, reset_url: resetUrl, expires_in_hours: RESET_TOKEN_TTL_HOURS },
          source: 'api',
          severity: 'info',
        });
      } else {
        // Kill-switch fallback: legacy EmailService path
        const emailService = new EmailService(c.env.RESEND_API_KEY);
        await emailService.sendTransactional(email, 'password-reset', {
          name: userName,
          reset_url: resetUrl,
          expires_in_hours: RESET_TOKEN_TTL_HOURS,
        });
      }

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

// ===========================================================================
// P20-A: Workspace Member Invitations
// ===========================================================================

// ---------------------------------------------------------------------------
// POST /auth/invite — send a workspace membership invitation (admin only)
// Generates a cryptographically random token, stores it in KV (24h TTL),
// inserts a row in the invitations table, and sends a workspace-invite email.
// ---------------------------------------------------------------------------
authRoutes.post('/invite', async (c) => {
  const auth = c.get('auth');
  if (!auth) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Not authenticated.'), 401);
  }
  if (!isAdminRole(auth.role)) {
    return c.json(errorResponse(ErrorCode.Forbidden, 'Only admins can invite workspace members.'), 403);
  }

  const body = await c.req.json<{
    email: string;
    role?: string;
    workspaceName?: string;
  }>().catch(() => null);

  if (!body?.email) {
    return c.json(errorResponse(ErrorCode.BadRequest, 'email is required.'), 400);
  }
  const email = body.email.toLowerCase().trim();
  if (!EMAIL_RE.test(email)) {
    return c.json(errorResponse(ErrorCode.BadRequest, 'Invalid email address.'), 400);
  }

  const ALLOWED_ROLES = ['member', 'agent', 'cashier', 'manager', 'admin'];
  const role = body.role ?? 'member';
  if (!ALLOWED_ROLES.includes(role)) {
    return c.json(
      errorResponse(ErrorCode.BadRequest, `Invalid role. Must be one of: ${ALLOWED_ROLES.join(', ')}.`),
      400,
    );
  }

  // BUG-02 fix: workspaceId required for workspace-scoped invite
  if (!auth.workspaceId) {
    return c.json(errorResponse(ErrorCode.BadRequest, 'Workspace not found in session.'), 400);
  }

  const workspaceId = auth.workspaceId;
  const tenantId = auth.tenantId;

  // Check for a pre-existing pending (not accepted, not expired) invite for this email+workspace
  const existing = await c.env.DB.prepare(
    `SELECT id FROM invitations
     WHERE email = ? AND workspace_id = ? AND tenant_id = ? AND accepted_at IS NULL AND expires_at > unixepoch()
     LIMIT 1`,
  ).bind(email, workspaceId, tenantId).first<{ id: string }>();

  if (existing) {
    return c.json(
      errorResponse(ErrorCode.Conflict, 'A pending invitation already exists for this email address.'),
      409,
    );
  }

  // Generate invite token and SHA-256 hash for DB storage
  const rawToken = crypto.randomUUID();
  const tokenHash = await sha256hex(rawToken);
  const inviteId = crypto.randomUUID();
  const expiresAt = Math.floor(Date.now() / 1000) + INVITE_TOKEN_TTL;

  // Store token in KV (key = invite:<rawToken> → inviteId for lookup)
  await c.env.RATE_LIMIT_KV.put(`invite:${rawToken}`, inviteId, { expirationTtl: INVITE_TOKEN_TTL });

  // Persist invitation row
  await c.env.DB.prepare(
    `INSERT INTO invitations (id, workspace_id, tenant_id, email, role, token_hash, invited_by, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch())`,
  ).bind(inviteId, workspaceId, tenantId, email, role, tokenHash, auth.userId, expiresAt).run();

  // Fetch workspace name for email
  const wsRow = await c.env.DB.prepare(
    'SELECT name FROM workspaces WHERE id = ? AND tenant_id = ? LIMIT 1',
  ).bind(workspaceId, tenantId).first<{ name: string }>();

  const appBase = c.env.APP_BASE_URL?.replace(/\/$/, '') ?? 'https://app.webwaka.com';
  const inviteUrl = `${appBase}/accept-invite?token=${rawToken}`;
  const workspaceName = wsRow?.name ?? 'your workspace';

  // Send invite email (best effort — failure does not abort the request)
  if (c.env.NOTIFICATION_PIPELINE_ENABLED === '1') {
    // N-026 Phase 2: fire via notification pipeline (invited user = actor for email routing)
    void publishEvent(c.env, {
      eventId: inviteId,
      eventKey: AuthEventType.UserInvited,
      tenantId: tenantId as string,
      actorId: auth.userId,
      actorType: 'user',
      workspaceId: workspaceId as string,
      payload: {
        inviter_name: auth.userId,
        workspace_name: workspaceName,
        invite_url: inviteUrl,
        expires_in_hours: INVITE_TOKEN_TTL_HOURS,
        recipient_email: email,
      },
      source: 'api',
      severity: 'info',
    });
  } else {
    // Kill-switch fallback: legacy EmailService path
    const emailService = new EmailService(c.env.RESEND_API_KEY);
    void emailService.sendTransactional(email, 'workspace-invite', {
      inviter_name: auth.userId,
      workspace_name: workspaceName,
      invite_url: inviteUrl,
      expires_in_hours: INVITE_TOKEN_TTL_HOURS,
    });
  }

  console.log(JSON.stringify({
    level: 'info', event: 'invite_sent', inviteId, email, role, workspaceId,
    tenantId, invitedBy: auth.userId, timestamp: new Date().toISOString(),
  }));

  return c.json({ inviteId, email, role, expiresAt, message: 'Invitation sent.' }, 201);
});

// ---------------------------------------------------------------------------
// GET /auth/invite/pending — list non-expired, non-accepted invitations (admin only)
// ---------------------------------------------------------------------------
authRoutes.get('/invite/pending', async (c) => {
  const auth = c.get('auth');
  if (!auth) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Not authenticated.'), 401);
  }
  if (!isAdminRole(auth.role)) {
    return c.json(errorResponse(ErrorCode.Forbidden, 'Only admins can view pending invitations.'), 403);
  }
  // BUG-02 fix: workspaceId is required for workspace-scoped invitation queries
  if (!auth.workspaceId) {
    return c.json(errorResponse(ErrorCode.BadRequest, 'Workspace not found in session.'), 400);
  }

  const rows = await c.env.DB.prepare(
    `SELECT id, email, role, invited_by, expires_at, created_at
     FROM invitations
     WHERE workspace_id = ? AND tenant_id = ? AND accepted_at IS NULL AND expires_at > unixepoch()
     ORDER BY created_at DESC LIMIT 50`,
  ).bind(auth.workspaceId, auth.tenantId).all<{
    id: string; email: string; role: string;
    invited_by: string; expires_at: number; created_at: number;
  }>();

  return c.json({ invitations: rows.results });
});

// ---------------------------------------------------------------------------
// DELETE /auth/invite/:id — revoke a pending invitation (admin only)
// ---------------------------------------------------------------------------
authRoutes.delete('/invite/:id', async (c) => {
  const auth = c.get('auth');
  if (!auth) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Not authenticated.'), 401);
  }
  if (!isAdminRole(auth.role)) {
    return c.json(errorResponse(ErrorCode.Forbidden, 'Only admins can revoke invitations.'), 403);
  }
  // BUG-02 fix: workspaceId required for workspace-scoped revocation
  if (!auth.workspaceId) {
    return c.json(errorResponse(ErrorCode.BadRequest, 'Workspace not found in session.'), 400);
  }

  const inviteId = c.req.param('id');
  const invite = await c.env.DB.prepare(
    `SELECT id FROM invitations WHERE id = ? AND workspace_id = ? AND tenant_id = ? AND accepted_at IS NULL LIMIT 1`,
  ).bind(inviteId, auth.workspaceId, auth.tenantId).first<{ id: string }>();

  if (!invite) {
    return c.json(errorResponse(ErrorCode.NotFound, 'Invitation not found or already accepted.'), 404);
  }

  await c.env.DB.prepare(
    `DELETE FROM invitations WHERE id = ? AND workspace_id = ? AND tenant_id = ?`,
  ).bind(inviteId, auth.workspaceId, auth.tenantId).run();

  return c.json({ message: 'Invitation revoked.' });
});

// ---------------------------------------------------------------------------
// POST /auth/accept-invite — accept a workspace invitation (public)
// Consumes the KV token, creates/associates the user in the workspace via memberships.
// ---------------------------------------------------------------------------
authRoutes.post('/accept-invite', async (c) => {
  const body = await c.req.json<{
    token: string;
    name?: string;
    password?: string;
  }>().catch(() => null);

  if (!body?.token) {
    return c.json(errorResponse(ErrorCode.BadRequest, 'token is required.'), 400);
  }

  // Look up invitation id from KV
  const kvKey = `invite:${body.token}`;
  const inviteId = await kvGetText(c.env.RATE_LIMIT_KV, kvKey, null);
  if (!inviteId) {
    return c.json(
      errorResponse(ErrorCode.Unauthorized, 'Invitation token is invalid or has expired.'),
      401,
    );
  }

  // Fetch invitation row to get email, role, workspace
  const invite = await c.env.DB.prepare(
    `SELECT id, workspace_id, tenant_id, email, role, expires_at, accepted_at
     FROM invitations WHERE id = ? LIMIT 1`,
  ).bind(inviteId).first<{
    id: string; workspace_id: string; tenant_id: string;
    email: string; role: string; expires_at: number; accepted_at: number | null;
  }>();

  if (!invite) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Invitation not found.'), 401);
  }
  if (invite.accepted_at) {
    return c.json(errorResponse(ErrorCode.Conflict, 'Invitation has already been accepted.'), 409);
  }
  if (invite.expires_at < Math.floor(Date.now() / 1000)) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Invitation has expired.'), 401);
  }

  const db = c.env.DB;
  const { workspace_id: workspaceId, tenant_id: tenantId, email, role } = invite;

  // Check if a user with this email already exists in the tenant
  let userId: string;
  const existingUser = await db.prepare(
    'SELECT id, workspace_id FROM users WHERE email = ? LIMIT 1',
  ).bind(email).first<{ id: string; workspace_id: string }>();

  if (existingUser) {
    userId = existingUser.id;
  } else {
    // Require name + password for new user registration via invite
    if (!body.name || !body.password) {
      return c.json(
        errorResponse(ErrorCode.BadRequest, 'name and password are required for new user registration.'),
        400,
      );
    }
    const pwErr = validatePassword(body.password);
    if (pwErr) return c.json(errorResponse(ErrorCode.BadRequest, pwErr), 400);

    const uid = crypto.randomUUID().replace(/-/g, '');
    userId = `usr_${uid.slice(0, 20)}`;
    const passwordHash = await hashPassword(body.password);
    await db.prepare(
      `INSERT INTO users (id, email, password_hash, full_name, workspace_id, tenant_id, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    ).bind(userId, email, passwordHash, body.name.trim(), workspaceId, tenantId, role).run();
  }

  // Upsert membership row (insert or update role if already a member)
  const membershipId = crypto.randomUUID();
  await db.prepare(
    `INSERT INTO memberships (id, workspace_id, tenant_id, user_id, role, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, unixepoch(), unixepoch())
     ON CONFLICT(workspace_id, user_id) DO UPDATE SET role = excluded.role, updated_at = unixepoch()`,
  ).bind(membershipId, workspaceId, tenantId, userId, role).run();

  // Mark invitation as accepted (T3 defense-in-depth: scope by tenant_id)
  await db.prepare(
    `UPDATE invitations SET accepted_at = unixepoch() WHERE id = ? AND tenant_id = ?`,
  ).bind(inviteId, tenantId).run();

  // Delete KV token (consumed — single use)
  try { await c.env.RATE_LIMIT_KV.delete(kvKey); } catch { /* non-critical */ }

  console.log(JSON.stringify({
    level: 'info', event: 'invite_accepted', inviteId, userId, email, role, workspaceId,
    tenantId, timestamp: new Date().toISOString(),
  }));

  return c.json({
    message: 'Invitation accepted. You have been added to the workspace.',
    userId, workspaceId, tenantId, role,
  });
});

// ===========================================================================
// P20-B: Multi-Device Session Management
// ===========================================================================

interface SessionRow {
  id: string;
  issued_at: number;
  expires_at: number;
  revoked_at: number | null;
  device_hint: string | null;
  last_seen_at: number | null;
}

// ---------------------------------------------------------------------------
// GET /auth/sessions — list active sessions for the current user
// ---------------------------------------------------------------------------
authRoutes.get('/sessions', async (c) => {
  const auth = c.get('auth');
  if (!auth) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Not authenticated.'), 401);
  }

  const rows = await c.env.DB.prepare(
    `SELECT id, issued_at, expires_at, revoked_at, device_hint, last_seen_at
     FROM sessions
     WHERE user_id = ? AND tenant_id = ? AND revoked_at IS NULL AND expires_at > unixepoch()
     ORDER BY issued_at DESC LIMIT 20`,
  ).bind(auth.userId, auth.tenantId).all<SessionRow>();

  const sessions = rows.results.map(s => ({
    id: s.id,
    deviceHint: s.device_hint ?? 'Unknown device',
    issuedAt: s.issued_at,
    expiresAt: s.expires_at,
    lastSeenAt: s.last_seen_at ?? s.issued_at,
    isExpired: s.expires_at < Math.floor(Date.now() / 1000),
  }));

  return c.json({ sessions, count: sessions.length });
});

// ---------------------------------------------------------------------------
// DELETE /auth/sessions/:id — revoke a specific session
// Marks the session as revoked in DB and blacklists its token hash in KV.
// ---------------------------------------------------------------------------
authRoutes.delete('/sessions/:id', async (c) => {
  const auth = c.get('auth');
  if (!auth) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Not authenticated.'), 401);
  }

  const sessionId = c.req.param('id');

  const session = await c.env.DB.prepare(
    `SELECT id, jti, expires_at FROM sessions WHERE id = ? AND user_id = ? AND tenant_id = ? AND revoked_at IS NULL LIMIT 1`,
  ).bind(sessionId, auth.userId, auth.tenantId).first<{ id: string; jti: string | null; expires_at: number }>();

  if (!session) {
    return c.json(errorResponse(ErrorCode.NotFound, 'Session not found or already revoked.'), 404);
  }

  // Mark revoked in DB
  await c.env.DB.prepare(
    `UPDATE sessions SET revoked_at = unixepoch() WHERE id = ? AND user_id = ? AND tenant_id = ?`,
  ).bind(sessionId, auth.userId, auth.tenantId).run();

  // Blacklist the token hash in KV so auth middleware rejects it immediately
  if (session.jti) {
    const ttl = Math.max(60, session.expires_at - Math.floor(Date.now() / 1000));
    try {
      await c.env.RATE_LIMIT_KV.put(`blacklist:jti:${session.jti}`, '1', { expirationTtl: ttl });
    } catch {
      // KV failure is non-critical — session is marked revoked in DB
    }
  }

  return c.json({ message: 'Session revoked.' });
});

// ---------------------------------------------------------------------------
// DELETE /auth/sessions — revoke ALL sessions except the current one
// Current session's token hash is computed from the Authorization header.
// ---------------------------------------------------------------------------
authRoutes.delete('/sessions', async (c) => {
  const auth = c.get('auth');
  if (!auth) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Not authenticated.'), 401);
  }

  // Compute current session's token hash to exclude it from revocation
  const rawToken = c.req.header('Authorization')?.replace(/^Bearer\s+/i, '');
  const currentHash = rawToken ? await sha256hex(rawToken) : null;

  // Fetch all active sessions (excluding the current token hash)
  let activeSessions: { id: string; jti: string | null; expires_at: number }[];
  if (currentHash) {
    const result = await c.env.DB.prepare(
      `SELECT id, jti, expires_at FROM sessions
       WHERE user_id = ? AND tenant_id = ? AND revoked_at IS NULL AND expires_at > unixepoch() AND (jti != ? OR jti IS NULL)`,
    ).bind(auth.userId, auth.tenantId, currentHash).all<{ id: string; jti: string | null; expires_at: number }>();
    activeSessions = result.results;
  } else {
    const result = await c.env.DB.prepare(
      `SELECT id, jti, expires_at FROM sessions
       WHERE user_id = ? AND tenant_id = ? AND revoked_at IS NULL AND expires_at > unixepoch()`,
    ).bind(auth.userId, auth.tenantId).all<{ id: string; jti: string | null; expires_at: number }>();
    activeSessions = result.results;
  }

  // Mark all as revoked
  await c.env.DB.prepare(
    `UPDATE sessions SET revoked_at = unixepoch()
     WHERE user_id = ? AND tenant_id = ? AND revoked_at IS NULL
     ${currentHash ? 'AND (jti != ? OR jti IS NULL)' : ''}`,
  ).bind(
    ...(currentHash
      ? [auth.userId, auth.tenantId, currentHash]
      : [auth.userId, auth.tenantId]),
  ).run();

  // Blacklist each revoked session's token hash in KV
  const now = Math.floor(Date.now() / 1000);
  for (const s of activeSessions) {
    if (s.jti) {
      const ttl = Math.max(60, s.expires_at - now);
      try {
        await c.env.RATE_LIMIT_KV.put(`blacklist:jti:${s.jti}`, '1', { expirationTtl: ttl });
      } catch {
        // Non-blocking
      }
    }
  }

  return c.json({ message: 'All other sessions have been revoked.', revokedCount: activeSessions.length });
});

// ===========================================================================
// P20-C: Email Verification
// ===========================================================================

// ---------------------------------------------------------------------------
// POST /auth/send-verification — send email verification link (auth required)
// Throttled: one email per 5 minutes per user. Always returns 200 to avoid
// timing attacks (do not reveal whether email was already verified).
// ---------------------------------------------------------------------------
authRoutes.post('/send-verification', async (c) => {
  const auth = c.get('auth');
  if (!auth) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Not authenticated.'), 401);
  }

  const userRow = await c.env.DB.prepare(
    'SELECT email, full_name, email_verified_at FROM users WHERE id = ? AND tenant_id = ? LIMIT 1',
  ).bind(auth.userId, auth.tenantId).first<{
    email: string; full_name: string | null; email_verified_at: number | null;
  }>();

  if (!userRow?.email) {
    return c.json({ message: 'Verification email sent if the account exists.' });
  }

  // Already verified — return success silently (idempotent)
  if (userRow.email_verified_at) {
    return c.json({ message: 'Your email address is already verified.' });
  }

  // Throttle: check KV for recent send
  const throttleKey = `verify_throttle:${auth.userId}`;
  const recentlySent = await kvGetText(c.env.RATE_LIMIT_KV, throttleKey, null);
  if (recentlySent) {
    return c.json(
      errorResponse(ErrorCode.RateLimitExceeded, 'A verification email was already sent recently. Please check your inbox.'),
      429,
    );
  }

  try {
    const verifyToken = crypto.randomUUID();
    const kvKey = `email_verify:${verifyToken}`;
    // KV: store userId for lookup when token is consumed
    await c.env.RATE_LIMIT_KV.put(kvKey, auth.userId, { expirationTtl: VERIFY_TOKEN_TTL });
    // Throttle key (prevents re-send spam)
    await c.env.RATE_LIMIT_KV.put(throttleKey, '1', { expirationTtl: VERIFY_THROTTLE_TTL });

    const appBase = c.env.APP_BASE_URL?.replace(/\/$/, '') ?? 'https://app.webwaka.com';
    const verifyUrl = `${appBase}/verify-email?token=${verifyToken}`;
    const name = userRow.full_name?.split(' ')[0] ?? 'there';

    if (c.env.NOTIFICATION_PIPELINE_ENABLED === '1') {
      // N-026 Phase 2: fire via notification pipeline
      await publishEvent(c.env, {
        eventId: verifyToken,
        eventKey: AuthEventType.UserEmailVerificationSent,
        tenantId: auth.tenantId as string,
        actorId: auth.userId,
        actorType: 'user',
        payload: { name, verify_url: verifyUrl, expires_in_hours: VERIFY_TOKEN_TTL / 3600 },
        source: 'api',
        severity: 'info',
      });
    } else {
      // Kill-switch fallback: legacy EmailService path
      const emailService = new EmailService(c.env.RESEND_API_KEY);
      await emailService.sendTransactional(userRow.email, 'email-verification', {
        name,
        verify_url: verifyUrl,
        expires_in_hours: VERIFY_TOKEN_TTL / 3600,
      });
    }

    console.log(JSON.stringify({
      level: 'info', event: 'verification_email_sent',
      userId: auth.userId, timestamp: new Date().toISOString(),
    }));
  } catch {
    // Email/KV failure — still return 200 to avoid enumeration
  }

  return c.json({ message: 'Verification email sent. Please check your inbox.' });
});

// ---------------------------------------------------------------------------
// GET /auth/verify-email?token= — consume verification token (public)
// Sets email_verified_at on the user row if the token is valid.
// ---------------------------------------------------------------------------
authRoutes.get('/verify-email', async (c) => {
  const token = c.req.query('token');
  if (!token) {
    return c.json(errorResponse(ErrorCode.BadRequest, 'token query parameter is required.'), 400);
  }

  const kvKey = `email_verify:${token}`;
  const userId = await kvGetText(c.env.RATE_LIMIT_KV, kvKey, null);

  if (!userId) {
    return c.json(
      errorResponse(ErrorCode.Unauthorized, 'Email verification token is invalid or has expired.'),
      401,
    );
  }

  // Set email_verified_at — safe to run even if already verified (idempotent timestamp set)
  await c.env.DB.prepare(
    `UPDATE users SET email_verified_at = unixepoch(), updated_at = unixepoch()
     WHERE id = ? AND email_verified_at IS NULL`,
  ).bind(userId).run();

  // Delete token (single use)
  try { await c.env.RATE_LIMIT_KV.delete(kvKey); } catch { /* non-critical */ }
  // Remove throttle key so user can re-verify from a different token if needed
  try { await c.env.RATE_LIMIT_KV.delete(`verify_throttle:${userId}`); } catch { /* non-critical */ }

  console.log(JSON.stringify({
    level: 'info', event: 'email_verified', userId, timestamp: new Date().toISOString(),
  }));

  return c.json({ message: 'Email address verified successfully.' });
});

export { authRoutes };
