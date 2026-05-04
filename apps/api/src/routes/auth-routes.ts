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
import { getEmailService } from '../lib/provider-service-factory.js';
import { publishEvent } from '../lib/publish-event.js';
import { AuthEventType, WorkspaceEventType } from '@webwaka/events';
import { propagateErasure } from '@webwaka/notifications';
import type { Env } from '../env.js';

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  password_hash_version: number | null;  // SEC-001: 1=100k iterations (legacy), 2=600k iterations
  workspace_id: string;
  tenant_id: string;
  role: string;
  // BUG-038 / ENH-034: TOTP 2FA (super_admin only)
  totp_secret: string | null;
  totp_enabled: number | null;
  totp_enrolled_at: number | null;
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

// ---------------------------------------------------------------------------
// BUG-038 / ENH-034: TOTP helpers (RFC 6238) — Web Crypto only, no npm deps
// ---------------------------------------------------------------------------

/** Base32 decode (RFC 4648, upper-case, no padding strict required). */
function base32Decode(b32: string): Uint8Array {
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const s = b32.toUpperCase().replace(/=/g, '');
  const bytes: number[] = [];
  let buf = 0, bits = 0;
  for (const ch of s) {
    const idx = ALPHABET.indexOf(ch);
    if (idx === -1) continue;
    buf = (buf << 5) | idx;
    bits += 5;
    if (bits >= 8) { bytes.push((buf >> (bits - 8)) & 0xff); bits -= 8; }
  }
  return new Uint8Array(bytes);
}

/** Base32 encode — generates a random 20-byte TOTP secret string. */
function generateTotpSecret(): string {
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  let result = '';
  for (let i = 0; i < bytes.length; i += 5) {
    const b0 = bytes[i] ?? 0;
    const b1 = bytes[i+1] ?? 0;
    const b2 = bytes[i+2] ?? 0;
    const b3 = bytes[i+3] ?? 0;
    const b4 = bytes[i+4] ?? 0;
    result += ALPHABET[b0 >> 3]                       ?? '';
    result += ALPHABET[((b0 & 0x07) << 2) | (b1 >> 6)] ?? '';
    result += ALPHABET[(b1 >> 1) & 0x1f]               ?? '';
    result += ALPHABET[((b1 & 0x01) << 4) | (b2 >> 4)] ?? '';
    result += ALPHABET[((b2 & 0x0f) << 1) | (b3 >> 7)] ?? '';
    result += ALPHABET[(b3 >> 2) & 0x1f]               ?? '';
    result += ALPHABET[((b3 & 0x03) << 3) | (b4 >> 5)] ?? '';
    result += ALPHABET[b4 & 0x1f]                       ?? '';
  }
  return result;
}

/**
 * Verify a 6-digit TOTP code against a base32 secret.
 * Accepts a ±1 window (±30 seconds) for clock skew.
 */
async function verifyTotp(secret: string, code: string): Promise<boolean> {
  if (!/^\d{6}$/.test(code)) return false;
  const keyBytes = base32Decode(secret);
  const key = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'],
  );
  const T = Math.floor(Date.now() / 30000);
  for (const delta of [-1, 0, 1]) {
    const t = T + delta;
    const counter = new ArrayBuffer(8);
    const view = new DataView(counter);
    view.setUint32(0, Math.floor(t / 0x100000000), false);
    view.setUint32(4, t >>> 0, false);
    const sig = await crypto.subtle.sign('HMAC', key, counter);
    const hmac = new Uint8Array(sig);
    const offset = (hmac[19] ?? 0) & 0x0f;
    const otp = (
      (((hmac[offset]   ?? 0) & 0x7f) << 24) |
      (((hmac[offset+1] ?? 0) & 0xff) << 16) |
      (((hmac[offset+2] ?? 0) & 0xff) <<  8) |
       ((hmac[offset+3] ?? 0) & 0xff)
    ) % 1_000_000;
    if (String(otp).padStart(6, '0') === code) return true;
  }
  return false;
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
    `SELECT id, email, password_hash, password_hash_version, workspace_id, tenant_id, role,
            totp_secret, totp_enabled, totp_enrolled_at
     FROM users WHERE email = ? LIMIT 1`,
  ).bind(email).first<UserRow>();

  if (!userRow) {
    const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? 'unknown';
    console.error(JSON.stringify({
      level: 'warn', event: 'auth_failure', reason: 'user_not_found', email, ip,
      timestamp: new Date().toISOString(),
    }));
    // SEC-006: Structured AUTH_LOGIN_FAILURE with hashed PII for IDS/SIEM integration.
    void (async () => {
      try {
        console.log(JSON.stringify({
          level: 'warn', event: 'AUTH_LOGIN_FAILURE',
          reason: 'user_not_found',
          email_hash: await sha256hex(email),
          ip_hash: await sha256hex(ip),
          ua_hash: await sha256hex(c.req.header('User-Agent') ?? ''),
          ts: new Date().toISOString(),
        }));
      } catch { /* non-blocking */ }
    })();
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Invalid email or password.'), 401);
  }

  // N-080: KV-based login lockout — check for active lock before attempting hash comparison.
  // Lock is set for 15 minutes after MAX_LOGIN_FAIL consecutive bad-password attempts.
  const LOGIN_FAIL_KEY = `login-fail:${userRow.tenant_id}:${userRow.id}`;
  const LOGIN_LOCK_KEY = `login-lock:${userRow.tenant_id}:${userRow.id}`;
  const MAX_LOGIN_FAIL = 5;

  const lockValue = await c.env.RATE_LIMIT_KV.get(LOGIN_LOCK_KEY).catch(() => null);
  if (lockValue) {
    void publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: AuthEventType.UserAccountLocked,
      tenantId: userRow.tenant_id,
      actorId: userRow.id,
      actorType: 'user',
      payload: { reason: 'login_lockout_active', locked_until: lockValue },
      source: 'api',
      severity: 'warning',
      correlationId: c.get('requestId') ?? undefined,
    });
    return c.json(errorResponse(ErrorCode.Forbidden, 'Account temporarily locked. Try again later.'), 429);
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
    // SEC-006: Structured AUTH_LOGIN_FAILURE with hashed PII for IDS/SIEM integration.
    void (async () => {
      try {
        console.log(JSON.stringify({
          level: 'warn', event: 'AUTH_LOGIN_FAILURE',
          reason: 'wrong_password',
          email_hash: await sha256hex(email),
          ip_hash: await sha256hex(ip),
          ua_hash: await sha256hex(c.req.header('User-Agent') ?? ''),
          ts: new Date().toISOString(),
        }));
      } catch { /* non-blocking */ }
    })();
    // N-080: auth.user.login_failed event (wrong password)
    void publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: AuthEventType.UserLoginFailed,
      tenantId: userRow.tenant_id,
      actorId: userRow.id,
      actorType: 'user',
      payload: { reason: 'wrong_password' },
      source: 'api',
      severity: 'warning',
      correlationId: c.get('requestId') ?? undefined,
    });

    // N-080: increment failed-attempt counter; lock account at MAX_LOGIN_FAIL threshold.
    try {
      const rawCount = await c.env.RATE_LIMIT_KV.get(LOGIN_FAIL_KEY);
      const failCount = rawCount ? parseInt(rawCount, 10) + 1 : 1;
      await c.env.RATE_LIMIT_KV.put(LOGIN_FAIL_KEY, String(failCount), { expirationTtl: 900 });
      if (failCount >= MAX_LOGIN_FAIL) {
        const lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        await c.env.RATE_LIMIT_KV.put(LOGIN_LOCK_KEY, lockedUntil, { expirationTtl: 900 });
        await c.env.RATE_LIMIT_KV.delete(LOGIN_FAIL_KEY);
        void publishEvent(c.env, {
          eventId: crypto.randomUUID(),
          eventKey: AuthEventType.UserAccountLocked,
          tenantId: userRow.tenant_id,
          actorId: userRow.id,
          actorType: 'user',
          payload: { reason: 'too_many_failed_logins', locked_until: lockedUntil, attempts: failCount },
          source: 'api',
          severity: 'critical',
          correlationId: c.get('requestId') ?? undefined,
        });
      }
    } catch {
      // KV failure is non-blocking — login rejection is already being returned
    }
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Invalid email or password.'), 401);
  }

  // N-080: Clear failed-attempt counter on successful authentication.
  try {
    await c.env.RATE_LIMIT_KV.delete(LOGIN_FAIL_KEY);
    await c.env.RATE_LIMIT_KV.delete(LOGIN_LOCK_KEY);
  } catch {
    // Non-blocking — success path must not be gated on KV
  }

  if (needsRehash) {
    try {
      const newHash = await hashPassword(body.password);
      // SEC-001: Also update password_hash_version to 2 (600k iterations).
      await c.env.DB.prepare(
        `UPDATE users SET password_hash = ?, password_hash_version = 2, updated_at = unixepoch()
         WHERE id = ? AND tenant_id = ?`,
      ).bind(newHash, userRow.id, userRow.tenant_id).run();
    } catch {
      // Rehash failure is non-critical
    }
  }

  // BUG-038 / ENH-034: TOTP enforcement for super_admin role.
  // Super admins who have not enrolled in TOTP must do so before receiving a JWT.
  // Super admins who have enrolled must supply a valid TOTP code.
  if (userRow.role === 'super_admin') {
    if (!userRow.totp_enabled) {
      // Not yet enrolled — force enrollment before issuing JWT.
      return c.json({
        error: 'totp_enrolment_required',
        message: 'Super admin accounts must enrol in 2FA before logging in.',
        enrolmentUrl: '/auth/totp/enrol',
      }, 403);
    }
    // Enrolled — require a valid code.
    const totpCode = (body as Record<string, unknown>).totp_code;
    if (typeof totpCode !== 'string' || !await verifyTotp(userRow.totp_secret!, totpCode)) {
      return c.json({
        error: 'totp_required',
        message: 'A valid TOTP code is required for super admin login.',
      }, 401);
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

  // N-080: auth.user.login_success event
  void publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: AuthEventType.UserLoginSuccess,
    tenantId: userRow.tenant_id,
    actorId: userRow.id,
    actorType: 'user',
    workspaceId: userRow.workspace_id,
    payload: {},
    source: 'api',
    severity: 'info',
    correlationId: c.get('requestId') ?? undefined,
  });

  // BUG-004: Issue opaque refresh token (single-use, stored as SHA-256 hash in D1).
  // The raw value is returned to the client once and never persisted.
  let refreshTokenValue: string | undefined;
  try {
    const rawRt = crypto.randomUUID() + crypto.randomUUID(); // 72 chars of entropy
    const rtHash = await sha256hex(rawRt);
    await c.env.DB.prepare(
      `INSERT INTO refresh_tokens (id, jti_hash, user_id, tenant_id, workspace_id, role, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, unixepoch() + 2592000)`,
    ).bind(
      crypto.randomUUID(), rtHash,
      userRow.id, userRow.tenant_id, userRow.workspace_id, userRow.role,
    ).run();
    refreshTokenValue = rawRt;
  } catch {
    // refresh_tokens table may not exist yet (pre-migration) — non-blocking
  }

  return c.json({
    token,
    ...(refreshTokenValue ? { refresh_token: refreshTokenValue } : {}),
    expires_in: 3600,
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
  // Use 'wsp_' (4-char prefix like 'usr_' and 'tnt_') so all generated IDs have
  // a consistent total length of 24 characters, making log aggregation and
  // pattern-based routing unambiguous.
  const workspaceId = `wsp_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;

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

  // N-080: auth.user.registered + workspace.created events (fire-and-forget)
  void publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: AuthEventType.UserRegistered,
    tenantId,
    actorId: userId,
    actorType: 'user',
    workspaceId,
    payload: { email, workspace_id: workspaceId },
    source: 'api',
    severity: 'info',
    correlationId: c.get('requestId') ?? undefined,
  });
  void publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: WorkspaceEventType.WorkspaceCreated,
    tenantId,
    actorId: userId,
    actorType: 'user',
    workspaceId,
    payload: { workspace_id: workspaceId, plan: 'free', business_name: businessName },
    source: 'api',
    severity: 'info',
    correlationId: c.get('requestId') ?? undefined,
  });

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
// POST /auth/refresh — opaque refresh token rotation (BUG-004 / SEC-002)
// Single-use: consuming a refresh token atomically revokes it and issues a new one.
// Reuse detection: if a revoked token is re-presented, ALL sessions for that user
// are revoked (compromised token family assumption).
// BUG-016: workspace status checked — terminated workspaces cannot refresh.
// ---------------------------------------------------------------------------
authRoutes.post('/refresh', async (c) => {
  const body = await c.req.json<{ refresh_token: string }>().catch(() => null);
  if (!body?.refresh_token) {
    return c.json(errorResponse(ErrorCode.BadRequest, 'refresh_token is required.'), 400);
  }

  const rtHash = await sha256hex(body.refresh_token);
  const rtRow = await c.env.DB.prepare(
    `SELECT id, user_id, tenant_id, workspace_id, role, revoked_at, replaced_by
     FROM refresh_tokens WHERE jti_hash = ? AND expires_at > unixepoch() LIMIT 1`,
  ).bind(rtHash).first<{
    id: string; user_id: string; tenant_id: string; workspace_id: string | null;
    role: string; revoked_at: number | null; replaced_by: string | null;
  }>();

  if (!rtRow) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Invalid or expired refresh token.'), 401);
  }

  if (rtRow.revoked_at !== null) {
    // Reuse detected — revoke the entire token family to contain potential session theft.
    await c.env.DB.prepare(
      `UPDATE refresh_tokens SET revoked_at = unixepoch()
       WHERE user_id = ? AND tenant_id = ? AND revoked_at IS NULL`,
    ).bind(rtRow.user_id, rtRow.tenant_id).run().catch(() => {});
    console.error(JSON.stringify({
      level: 'error', event: 'REFRESH_TOKEN_REUSE',
      userId: rtRow.user_id, tenantId: rtRow.tenant_id,
      ts: new Date().toISOString(),
    }));
    return c.json(
      errorResponse(ErrorCode.Unauthorized, 'Refresh token reuse detected. All sessions have been revoked.'),
      401,
    );
  }

  // BUG-016: Verify workspace is still active before issuing a new token.
  if (rtRow.workspace_id) {
    const wsRow = await c.env.DB.prepare(
      `SELECT status FROM workspaces WHERE id = ? AND tenant_id = ? LIMIT 1`,
    ).bind(rtRow.workspace_id, rtRow.tenant_id).first<{ status: string }>();
    if (wsRow?.status === 'terminated') {
      return c.json(
        errorResponse(ErrorCode.Forbidden, 'Workspace has been terminated.'),
        403,
      );
    }
  }

  // Issue new access JWT + new opaque refresh token atomically via db.batch().
  const newAccessToken = await issueJwt(
    {
      sub: asId<UserId>(rtRow.user_id),
      workspace_id: asId<WorkspaceId>(rtRow.workspace_id ?? ''),
      tenant_id: asId<TenantId>(rtRow.tenant_id),
      role: (rtRow.role as Role) ?? Role.Member,
    },
    c.env.JWT_SECRET,
  );
  const newRefreshRaw = crypto.randomUUID() + crypto.randomUUID();
  const newRtHash = await sha256hex(newRefreshRaw);
  const newRtId = crypto.randomUUID();

  await c.env.DB.batch([
    c.env.DB.prepare(
      `UPDATE refresh_tokens SET revoked_at = unixepoch(), replaced_by = ? WHERE id = ?`,
    ).bind(newRtId, rtRow.id),
    c.env.DB.prepare(
      `INSERT INTO refresh_tokens (id, jti_hash, user_id, tenant_id, workspace_id, role, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, unixepoch() + 2592000)`,
    ).bind(newRtId, newRtHash, rtRow.user_id, rtRow.tenant_id, rtRow.workspace_id, rtRow.role),
  ]);

  return c.json({
    token: newAccessToken,
    refresh_token: newRefreshRaw,
    expires_in: 3600,
  });
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

  // N-080: auth.user.profile_updated event
  void publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: AuthEventType.UserProfileUpdated,
    tenantId: auth.tenantId,
    actorId: auth.userId,
    actorType: 'user',
    payload: {
      changed_fields: [
        ...(body.phone !== undefined ? ['phone'] : []),
        ...(body.fullName !== undefined ? ['full_name'] : []),
      ],
    },
    source: 'api',
    severity: 'info',
    correlationId: c.get('requestId') ?? undefined,
  });
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
          correlationId: c.get('requestId') ?? undefined,
        });
      } else {
        // Kill-switch fallback: legacy EmailService path (now registry-aware)
        const emailService = await getEmailService(c.env);
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

  // T3: look up tenant_id so every mutation is tenant-scoped
  const userTenant = await c.env.DB.prepare(
    'SELECT tenant_id FROM users WHERE id = ? LIMIT 1',
  ).bind(userId).first<{ tenant_id: string }>();
  if (!userTenant) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'User account not found.'), 401);
  }

  await c.env.DB.prepare(
    `UPDATE users SET password_hash = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`,
  ).bind(newHash, userId, userTenant.tenant_id).run();

  try {
    await c.env.RATE_LIMIT_KV.delete(kvKey);
  } catch {
    // Deletion failure is non-critical — token TTL will expire it
  }

  // SEC-SESS-02: Invalidate all active sessions after a password reset so that
  // any sessions established before the reset can no longer be used.
  try {
    await c.env.DB.prepare(
      `DELETE FROM sessions WHERE user_id = ? AND tenant_id = ?`,
    ).bind(userId, userTenant.tenant_id).run();
  } catch {
    console.warn('[reset-password] Failed to invalidate sessions for user', userId);
  }

  // N-080: auth.user.password_changed event for completed password reset
  const resetUserRow = await c.env.DB.prepare(
    'SELECT tenant_id, workspace_id FROM users WHERE id = ? LIMIT 1',
  ).bind(userId).first<{ tenant_id: string; workspace_id: string | null }>();
  if (resetUserRow) {
    void publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: AuthEventType.UserPasswordChanged,
      tenantId: resetUserRow.tenant_id,
      actorId: userId,
      actorType: 'user',
      workspaceId: resetUserRow.workspace_id ?? undefined,
      payload: { method: 'reset' },
      source: 'api',
      severity: 'info',
      correlationId: c.get('requestId') ?? undefined,
    });
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
      // SEC-003: Hash the token before using it as a KV key (avoids 512-byte KV key limit).
      const tokenHash = await sha256hex(currentToken);
      await c.env.RATE_LIMIT_KV.put(`blacklist:token:${tokenHash}`, '1', { expirationTtl: 3600 });
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

  // COMP-002 fix: Require explicit confirmation header to prevent accidental erasure
  // from any stray DELETE request. The client must send X-Confirm-Erasure: confirmed
  // as a deliberate, named gesture before data is irrevocably erased.
  const confirmHeader = c.req.header('X-Confirm-Erasure');
  if (confirmHeader !== 'confirmed') {
    return c.json(
      errorResponse(
        ErrorCode.BadRequest,
        'Erasure request requires X-Confirm-Erasure: confirmed header. This action is irreversible.',
      ),
      400,
    );
  }

  const db = c.env.DB;
  const anonRef = `deleted_${crypto.randomUUID()}`;
  const receiptId = crypto.randomUUID();
  const erasedAtUnix = Math.floor(Date.now() / 1000);
  const erasedAtIso = new Date().toISOString();

  // COMP-003 fix: Produce an opaque SHA-256 hash of userId for the erasure receipt.
  // The receipt must prove erasure without storing re-identifiable data (G23).
  const userIdHashBuf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(auth.userId as string),
  );
  const userIdHash = Array.from(new Uint8Array(userIdHashBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // COMP-003 fix: Wrap core anonymisation and erasure receipt in a single D1 batch
  // for atomicity. Previously, UPDATE users and DELETE contact_channels were separate
  // awaited calls — if the second call failed, the user was partially anonymised with
  // no receipt. db.batch() submits both in a single HTTP round-trip to D1 and rolls
  // back if either statement fails.
  await db.batch([
    db.prepare(
      `UPDATE users SET
         email         = ?,
         full_name     = 'Deleted User',
         phone         = NULL,
         password_hash = NULL,
         updated_at    = unixepoch()
       WHERE id = ? AND tenant_id = ?`,
    ).bind(`${anonRef}@deleted.invalid`, auth.userId, auth.tenantId),

    db.prepare(
      `DELETE FROM contact_channels WHERE user_id = ? AND (tenant_id = ? OR tenant_id IS NULL)`,
    ).bind(auth.userId, auth.tenantId),

    // G23: Insert erasure receipt — append-only record for compliance audit.
    // user_id_hash is SHA-256 of userId — opaque but auditable.
    db.prepare(
      `INSERT INTO erasure_receipts (id, tenant_id, user_id_hash, anon_ref, erased_at, method, created_at)
       VALUES (?, ?, ?, ?, ?, 'ndpr_self_request', unixepoch())`,
    ).bind(receiptId, auth.tenantId, userIdHash, anonRef, erasedAtUnix),
  ]);

  // Sessions deletion is in a separate try/catch because the sessions table is
  // optional (may not exist in all environments) — non-blocking.
  try {
    await db.prepare(
      `DELETE FROM sessions WHERE user_id = ? AND (tenant_id = ? OR tenant_id IS NULL)`,
    ).bind(auth.userId, auth.tenantId).run();
  } catch {
    // sessions table may not exist — safe to ignore
  }

  // N-116 (Phase 8): Propagate NDPR erasure to all notification tables.
  // G23: audit_log PII zeroed; all other user-scoped notification rows hard-deleted.
  // notification_suppression_list is intentionally preserved (G23).
  try {
    const result = await propagateErasure(
      c.env.DB as unknown as Parameters<typeof propagateErasure>[0],
      auth.userId as string,
      auth.tenantId as string,
    );
    console.log(JSON.stringify({
      level: 'info', event: 'ndpr_erasure_notification_propagated',
      receiptId,
      tenantId: auth.tenantId,
      auditRowsZeroed: result.auditLogRowsZeroed,
      deliveriesDeleted: result.deliveriesDeleted,
      inboxItemsDeleted: result.inboxItemsDeleted,
      eventsDeleted: result.eventsDeleted,
      preferencesDeleted: result.preferencesDeleted,
      subscriptionsDeleted: result.subscriptionsDeleted,
    }));
  } catch (err) {
    // Non-blocking: core user anonymization already succeeded.
    // Log for compliance ops team follow-up; erasure will be retried on next audit cycle.
    console.error('[auth:erasure] N-116 notification propagation failed:', err instanceof Error ? err.message : err);
  }

  // N-080: auth.user.deleted event (NDPR right-to-erasure)
  void publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: AuthEventType.UserDeleted,
    tenantId: auth.tenantId as string,
    actorId: auth.userId,
    actorType: 'user',
    workspaceId: auth.workspaceId,
    payload: { reason: 'ndpr_erasure_request' },
    source: 'api',
    severity: 'info',
    correlationId: c.get('requestId') ?? undefined,
  });

  // COMP-002/003: Return erasure receipt ID so the user (and compliance ops) can
  // reference this specific erasure event. The receiptId is stored in erasure_receipts.
  return c.json({
    message: 'Your personal data has been erased in compliance with NDPR Article 3.1(9).',
    erasedAt: erasedAtIso,
    receiptId,
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

  // SEC-SESS-01: Invalidate all active sessions after a password change so that
  // any stolen token cannot be used past this point.  Non-blocking — failure is
  // logged but does not prevent returning success to the caller.
  try {
    await c.env.DB.prepare(
      `DELETE FROM sessions WHERE user_id = ? AND (tenant_id = ? OR tenant_id IS NULL)`,
    ).bind(auth.userId, auth.tenantId).run();
  } catch {
    console.warn('[change-password] Failed to invalidate sessions for user', auth.userId);
  }

  // N-080: auth.user.password_changed event
  void publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: AuthEventType.UserPasswordChanged,
    tenantId: auth.tenantId as string,
    actorId: auth.userId,
    actorType: 'user',
    workspaceId: auth.workspaceId,
    payload: { method: 'change' },
    source: 'api',
    severity: 'info',
    correlationId: c.get('requestId') ?? undefined,
  });

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
      correlationId: c.get('requestId') ?? undefined,
    });
  } else {
    // Kill-switch fallback: legacy EmailService path (now registry-aware)
    const emailService = await getEmailService(c.env);
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
     WHERE workspace_id = ? AND tenant_id = ?
       AND accepted_at IS NULL
       AND revoked_at IS NULL
       AND expires_at > unixepoch()
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
    `SELECT id FROM invitations
     WHERE id = ? AND workspace_id = ? AND tenant_id = ?
       AND accepted_at IS NULL AND revoked_at IS NULL
     LIMIT 1`,
  ).bind(inviteId, auth.workspaceId, auth.tenantId).first<{ id: string }>();

  if (!invite) {
    return c.json(errorResponse(ErrorCode.NotFound, 'Invitation not found, already accepted, or already revoked.'), 404);
  }

  // Soft-delete: set revoked_at rather than deleting the row.
  // This preserves the audit trail — a hard DELETE destroys evidence of who
  // was invited, by whom, and when, which is required for compliance.
  // Migration 0378_invitations_soft_delete.sql added the revoked_at column.
  await c.env.DB.prepare(
    `UPDATE invitations SET revoked_at = unixepoch()
     WHERE id = ? AND workspace_id = ? AND tenant_id = ?`,
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
     FROM invitations WHERE id = ? AND revoked_at IS NULL LIMIT 1`,
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

  // Check if a user with this email already exists in the tenant.
  // T3: scope by tenant_id to prevent cross-tenant user enumeration — a user
  // in tenant-A sharing an email with tenant-B must be treated as a new user
  // in tenant-B and must not inherit tenant-A's userId.
  let userId: string;
  const existingUser = await db.prepare(
    'SELECT id, workspace_id FROM users WHERE email = ? AND tenant_id = ? LIMIT 1',
  ).bind(email, tenantId).first<{ id: string; workspace_id: string }>();

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

  // N-080: auth.user.invite_accepted event
  void publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: AuthEventType.UserInviteAccepted,
    tenantId,
    actorId: userId,
    actorType: 'user',
    workspaceId,
    payload: { invite_id: inviteId, role },
    source: 'api',
    severity: 'info',
    correlationId: c.get('requestId') ?? undefined,
  });

  // N-081/T2: workspace.invite_accepted — workspace gained a new member
  void publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: WorkspaceEventType.WorkspaceInviteAccepted,
    tenantId,
    actorId: userId,
    actorType: 'user',
    workspaceId,
    payload: { invite_id: inviteId, role, new_member_id: userId },
    source: 'api',
    severity: 'info',
    correlationId: c.get('requestId') ?? undefined,
  });

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

  // N-080: auth.user.logout event for single session revocation
  void publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: AuthEventType.UserLogout,
    tenantId: auth.tenantId as string,
    actorId: auth.userId,
    actorType: 'user',
    workspaceId: auth.workspaceId,
    payload: { session_id: sessionId, scope: 'single' },
    source: 'api',
    severity: 'info',
    correlationId: c.get('requestId') ?? undefined,
  });

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

  // N-080: auth.user.logout event for all-sessions revocation
  void publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: AuthEventType.UserLogout,
    tenantId: auth.tenantId as string,
    actorId: auth.userId,
    actorType: 'user',
    workspaceId: auth.workspaceId,
    payload: { scope: 'all_other', revoked_count: activeSessions.length },
    source: 'api',
    severity: 'info',
    correlationId: c.get('requestId') ?? undefined,
  });

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
        correlationId: c.get('requestId') ?? undefined,
      });
    } else {
      // Kill-switch fallback: legacy EmailService path (now registry-aware)
      const emailService = await getEmailService(c.env);
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

  // T3: look up tenant_id to ensure the UPDATE is properly scoped
  const verifyUserTenant = await c.env.DB.prepare(
    'SELECT tenant_id FROM users WHERE id = ? LIMIT 1',
  ).bind(userId).first<{ tenant_id: string }>();
  if (!verifyUserTenant) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'User account not found.'), 401);
  }

  // Set email_verified_at — safe to run even if already verified (idempotent timestamp set)
  await c.env.DB.prepare(
    `UPDATE users SET email_verified_at = unixepoch(), updated_at = unixepoch()
     WHERE id = ? AND tenant_id = ? AND email_verified_at IS NULL`,
  ).bind(userId, verifyUserTenant.tenant_id).run();

  // Delete token (single use)
  try { await c.env.RATE_LIMIT_KV.delete(kvKey); } catch { /* non-critical */ }
  // Remove throttle key so user can re-verify from a different token if needed
  try { await c.env.RATE_LIMIT_KV.delete(`verify_throttle:${userId}`); } catch { /* non-critical */ }

  console.log(JSON.stringify({
    level: 'info', event: 'email_verified', userId, timestamp: new Date().toISOString(),
  }));

  // N-080: auth.user.email_verified event — fetch tenantId from DB (no auth context on public route)
  const verifiedUserRow = await c.env.DB.prepare(
    'SELECT tenant_id, workspace_id FROM users WHERE id = ? LIMIT 1',
  ).bind(userId).first<{ tenant_id: string; workspace_id: string | null }>();
  if (verifiedUserRow) {
    void publishEvent(c.env, {
      eventId: token,
      eventKey: AuthEventType.UserEmailVerified,
      tenantId: verifiedUserRow.tenant_id,
      actorId: userId,
      actorType: 'user',
      workspaceId: verifiedUserRow.workspace_id ?? undefined,
      payload: {},
      source: 'api',
      severity: 'info',
      correlationId: c.get('requestId') ?? undefined,
    });
  }

  return c.json({ message: 'Email address verified successfully.' });
});

// ---------------------------------------------------------------------------
// POST /auth/totp/enrol — generate TOTP secret + QR URI (super_admin only)
// BUG-038 / ENH-034
// ---------------------------------------------------------------------------
authRoutes.post('/totp/enrol', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; role?: string };
  if (auth.role !== 'super_admin') {
    return c.json({ error: 'Forbidden', message: '2FA enrolment is only available to super admin users.' }, 403);
  }

  const secret = generateTotpSecret();
  let emailForLabel = auth.userId;
  try {
    const row = await c.env.DB.prepare(
      `SELECT email FROM users WHERE id = ? AND tenant_id = ? LIMIT 1`,
    ).bind(auth.userId, auth.tenantId).first<{ email: string }>();
    if (row) emailForLabel = row.email;
  } catch { /* non-blocking */ }

  const qrUri = `otpauth://totp/WebWaka:${encodeURIComponent(emailForLabel)}?secret=${secret}&issuer=WebWaka`;

  // Store pending secret in KV — expires in 10 min (must verify within that window).
  await c.env.RATE_LIMIT_KV.put(`totp:pending:${auth.userId}`, secret, { expirationTtl: 600 });

  return c.json({ secret, qrUri });
});

// ---------------------------------------------------------------------------
// POST /auth/totp/verify — confirm TOTP code and activate 2FA (super_admin only)
// BUG-038 / ENH-034
// ---------------------------------------------------------------------------
authRoutes.post('/totp/verify', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; role?: string };
  if (auth.role !== 'super_admin') {
    return c.json({ error: 'Forbidden', message: '2FA verification is only available to super admin users.' }, 403);
  }

  const body = await c.req.json<{ code?: string }>().catch(() => ({ code: undefined }));
  const code = body.code ?? '';

  const pendingSecret = await c.env.RATE_LIMIT_KV.get(`totp:pending:${auth.userId}`);
  if (!pendingSecret) {
    return c.json({ error: 'No pending TOTP enrolment. Call POST /auth/totp/enrol first.' }, 400);
  }

  const valid = await verifyTotp(pendingSecret, code);
  if (!valid) {
    return c.json({ error: 'invalid_totp_code', message: 'TOTP code is incorrect or expired.' }, 400);
  }

  await c.env.DB.prepare(
    `UPDATE users SET totp_secret = ?, totp_enabled = 1, totp_enrolled_at = unixepoch()
     WHERE id = ? AND tenant_id = ?`,
  ).bind(pendingSecret, auth.userId, auth.tenantId).run();

  await c.env.RATE_LIMIT_KV.delete(`totp:pending:${auth.userId}`);

  console.log(JSON.stringify({
    level: 'info', event: 'totp_enrolled', userId: auth.userId, tenantId: auth.tenantId,
  }));

  return c.json({ message: '2FA enabled successfully. Your account now requires a TOTP code at login.' });
});

// ---------------------------------------------------------------------------
// POST /auth/totp/disable — disable TOTP (super_admin + valid code required)
// BUG-038 / ENH-034
// ---------------------------------------------------------------------------
authRoutes.post('/totp/disable', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; role?: string };
  if (auth.role !== 'super_admin') {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const body = await c.req.json<{ code?: string }>().catch(() => ({ code: undefined }));
  const code = body.code ?? '';

  const userRow = await c.env.DB.prepare(
    `SELECT totp_secret, totp_enabled FROM users WHERE id = ? AND tenant_id = ? LIMIT 1`,
  ).bind(auth.userId, auth.tenantId).first<{ totp_secret: string | null; totp_enabled: number | null }>();

  if (!userRow?.totp_enabled || !userRow.totp_secret) {
    return c.json({ error: '2FA is not currently enabled on this account.' }, 400);
  }
  if (!await verifyTotp(userRow.totp_secret, code)) {
    return c.json({ error: 'invalid_totp_code', message: 'Valid TOTP code required to disable 2FA.' }, 401);
  }

  await c.env.DB.prepare(
    `UPDATE users SET totp_secret = NULL, totp_enabled = 0, totp_enrolled_at = NULL
     WHERE id = ? AND tenant_id = ?`,
  ).bind(auth.userId, auth.tenantId).run();

  console.log(JSON.stringify({
    level: 'warn', event: 'totp_disabled', userId: auth.userId, tenantId: auth.tenantId,
  }));

  return c.json({ message: '2FA has been disabled on your account.' });
});

export { authRoutes };
