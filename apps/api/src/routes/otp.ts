/**
 * OTP Routes — Phone Authentication (BATCH 5)
 * POST /auth/otp/request  — Request a 6-digit OTP for a Nigerian phone number
 * POST /auth/otp/verify   — Verify OTP and issue JWT (login/register/verify/recover)
 */

import { Hono } from 'hono';
import { issueJwt } from '@webwaka/auth';
import { Role } from '@webwaka/types';
import { asId } from '@webwaka/types';
import { errorResponse, ErrorCode } from '@webwaka/shared-config';
import { getSmsApiKey } from '../lib/provider-service-factory.js';
import type { Env } from '../env.js';

const OTP_TTL_SECONDS = 600;
const OTP_MAX_ATTEMPTS = 5;
const VELOCITY_MAX = 3;
const VELOCITY_WINDOW_SEC = 900;
const SESSION_TTL = 3600;

/**
 * Normalize a Nigerian phone number to E.164 format (+234XXXXXXXXXX).
 * Returns null for invalid numbers.
 */
export function normalizePhoneToE164(phone: string): string | null {
  const cleaned = phone.replace(/[\s\-().]/g, '');
  if (/^\+234[789]\d{9}$/.test(cleaned)) return cleaned;
  if (/^0[789]\d{9}$/.test(cleaned)) return '+234' + cleaned.slice(1);
  if (/^[789]\d{9}$/.test(cleaned)) return '+234' + cleaned;
  return null;
}

async function sha256hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateOtp(): string {
  const arr = crypto.getRandomValues(new Uint8Array(4));
  return String(new DataView(arr.buffer).getUint32(0) % 1_000_000).padStart(6, '0');
}

async function sendSmsOtp(apiKey: string, phoneE164: string, otp: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('https://api.ng.termii.com/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: phoneE164,
        from: 'WebWaka',
        sms: `Your WebWaka code is ${otp}. Valid for 10 minutes. Do not share.`,
        type: 'plain',
        channel: 'generic',
        api_key: apiKey,
      }),
    });
    return res.ok ? { ok: true } : { ok: false, error: `Termii ${res.status}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'SMS error' };
  }
}

export const otpRoutes = new Hono<{ Bindings: Env }>();

otpRoutes.post('/request', async (c) => {
  const body = await c.req.json<{
    phone: string;
    purpose: 'login' | 'register' | 'verify' | 'recover';
    tenantId?: string;
  }>().catch(() => null);

  if (!body?.phone || !body?.purpose) {
    return c.json(errorResponse(ErrorCode.BadRequest, 'phone and purpose are required.'), 400);
  }

  const validPurposes = ['login', 'register', 'verify', 'recover'] as const;
  if (!validPurposes.includes(body.purpose)) {
    return c.json(errorResponse(ErrorCode.BadRequest, 'Invalid purpose.'), 400);
  }

  const phoneE164 = normalizePhoneToE164(body.phone);
  if (!phoneE164) {
    return c.json(
      errorResponse(ErrorCode.BadRequest, 'Invalid phone number. Use a Nigerian number (e.g. +2348012345678 or 08012345678).'),
      400,
    );
  }

  // Velocity check
  const velocityKey = `otp_req:${phoneE164}:${body.purpose}`;
  const countRaw = await c.env.RATE_LIMIT_KV.get(velocityKey).catch(() => null);
  const currentCount = countRaw ? parseInt(countRaw, 10) : 0;
  if (currentCount >= VELOCITY_MAX) {
    return c.json({ message: 'If this number is valid, an OTP has been sent.', expires_in: OTP_TTL_SECONDS });
  }

  try {
    await c.env.RATE_LIMIT_KV.put(velocityKey, String(currentCount + 1), { expirationTtl: VELOCITY_WINDOW_SEC });
  } catch { /* non-blocking */ }

  const otp = generateOtp();
  const otpHash = await sha256hex(otp);
  const expiresAt = Math.floor(Date.now() / 1000) + OTP_TTL_SECONDS;

  try {
    await c.env.DB.prepare(
      `INSERT INTO phone_otps (id, phone_e164, tenant_id, user_id, purpose, otp_hash, expires_at, created_at)
       VALUES (?, ?, ?, NULL, ?, ?, ?, unixepoch())`,
    ).bind(crypto.randomUUID(), phoneE164, body.tenantId ?? null, body.purpose, otpHash, expiresAt).run();
  } catch { /* anti-enumeration: don't reveal DB errors */ }

  // Resolve SMS API key from provider registry (falls back to env var)
  const smsApiKey = await getSmsApiKey(c.env, body.tenantId ? { tenantId: body.tenantId } : {});
  if (smsApiKey) {
    const smsResult = await sendSmsOtp(smsApiKey, phoneE164, otp);
    if (!smsResult.ok) {
      console.error(JSON.stringify({ level: 'error', event: 'otp_sms_failed', error: smsResult.error }));
    }
  } else {
    // Dev mode only — NEVER log OTP in production
    console.log(JSON.stringify({ level: 'debug', event: 'otp_dev_mode', otp, phone_e164: phoneE164 }));
  }

  return c.json({ message: 'If this number is valid, an OTP has been sent.', expires_in: OTP_TTL_SECONDS });
});

otpRoutes.post('/verify', async (c) => {
  const body = await c.req.json<{
    phone: string;
    otp: string;
    purpose: 'login' | 'register' | 'verify' | 'recover';
    businessName?: string;
    tenantId?: string;
    newPassword?: string;
  }>().catch(() => null);

  if (!body?.phone || !body?.otp || !body?.purpose) {
    return c.json(errorResponse(ErrorCode.BadRequest, 'phone, otp, and purpose are required.'), 400);
  }
  if (!/^\d{6}$/.test(body.otp)) {
    return c.json(errorResponse(ErrorCode.BadRequest, 'OTP must be a 6-digit number.'), 400);
  }

  const phoneE164 = normalizePhoneToE164(body.phone);
  if (!phoneE164) {
    return c.json(errorResponse(ErrorCode.BadRequest, 'Invalid phone number.'), 400);
  }

  const otpHash = await sha256hex(body.otp);
  const now = Math.floor(Date.now() / 1000);

  const otpRow = await c.env.DB.prepare(
    `SELECT id, otp_hash, expires_at, attempt_count, tenant_id, user_id
     FROM phone_otps
     WHERE phone_e164 = ? AND purpose = ? AND verified_at IS NULL AND expires_at > ?
     ${body.tenantId ? 'AND (tenant_id = ? OR tenant_id IS NULL)' : ''}
     ORDER BY created_at DESC LIMIT 1`,
  ).bind(phoneE164, body.purpose, now, ...(body.tenantId ? [body.tenantId] : [])).first<{
    id: string; otp_hash: string; expires_at: number; attempt_count: number;
    tenant_id: string | null; user_id: string | null;
  }>();

  if (!otpRow) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'OTP is invalid or has expired.'), 401);
  }
  if (otpRow.attempt_count >= OTP_MAX_ATTEMPTS) {
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Too many failed attempts. Please request a new OTP.'), 401);
  }
  if (otpRow.otp_hash !== otpHash) {
    await c.env.DB.prepare('UPDATE phone_otps SET attempt_count = attempt_count + 1 WHERE id = ?').bind(otpRow.id).run();
    return c.json(errorResponse(ErrorCode.Unauthorized, 'Invalid OTP.'), 401);
  }

  // Mark OTP as verified (single-use)
  await c.env.DB.prepare('UPDATE phone_otps SET verified_at = unixepoch() WHERE id = ?').bind(otpRow.id).run();

  // ── Purpose: login ──────────────────────────────────────────────────────
  if (body.purpose === 'login') {
    const tenantQuery = body.tenantId ?? otpRow.tenant_id;
    const userRow = tenantQuery
      ? await c.env.DB.prepare('SELECT id, workspace_id, tenant_id, role FROM users WHERE phone_e164 = ? AND tenant_id = ? LIMIT 1')
          .bind(phoneE164, tenantQuery).first<{ id: string; workspace_id: string; tenant_id: string; role: string }>()
      : await c.env.DB.prepare('SELECT id, workspace_id, tenant_id, role FROM users WHERE phone_e164 = ? LIMIT 1')
          .bind(phoneE164).first<{ id: string; workspace_id: string; tenant_id: string; role: string }>();

    if (!userRow) {
      return c.json(errorResponse(ErrorCode.Unauthorized, 'No account found for this phone number. Please register first.'), 401);
    }

    const token = await issueJwt(
      { sub: asId(userRow.id), workspace_id: asId(userRow.workspace_id), tenant_id: asId(userRow.tenant_id), role: userRow.role as Role },
      c.env.JWT_SECRET,
    );

    try {
      await c.env.DB.prepare(
        `INSERT INTO sessions (id, user_id, tenant_id, issued_at, expires_at) VALUES (?, ?, ?, unixepoch(), unixepoch() + ?)`,
      ).bind(crypto.randomUUID(), userRow.id, userRow.tenant_id, SESSION_TTL).run();
    } catch { /* sessions table optional */ }

    return c.json({ token, expires_in: SESSION_TTL, user: { id: userRow.id, tenantId: userRow.tenant_id, workspaceId: userRow.workspace_id, role: userRow.role } });
  }

  // ── Purpose: register ───────────────────────────────────────────────────
  if (body.purpose === 'register') {
    if (!body.businessName?.trim()) {
      return c.json(errorResponse(ErrorCode.BadRequest, 'businessName is required for phone registration.'), 400);
    }
    const businessName = body.businessName.trim();
    const uid = crypto.randomUUID().replace(/-/g, '');
    const userId = `usr_${uid.slice(0, 20)}`;
    const tenantId = `tnt_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
    const workspaceId = `wsp_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;

    await c.env.DB.batch([
      c.env.DB.prepare(`INSERT OR IGNORE INTO tenants (id, name, plan, status, created_at, updated_at) VALUES (?, ?, 'free', 'active', unixepoch(), unixepoch())`)
        .bind(tenantId, businessName),
      c.env.DB.prepare(`INSERT INTO workspaces (id, tenant_id, name, owner_type, owner_id, subscription_plan, subscription_status, active_layers, created_at, updated_at) VALUES (?, ?, ?, 'organization', ?, 'free', 'active', '["discovery"]', unixepoch(), unixepoch())`)
        .bind(workspaceId, tenantId, businessName, userId),
      c.env.DB.prepare(`INSERT INTO users (id, email, phone, phone_e164, phone_verified_at, password_hash, full_name, workspace_id, tenant_id, role, identity_providers, created_at, updated_at) VALUES (?, NULL, ?, ?, unixepoch(), NULL, ?, ?, ?, 'admin', '["phone"]', unixepoch(), unixepoch())`)
        .bind(userId, phoneE164, phoneE164, businessName, workspaceId, tenantId),
    ]);

    const token = await issueJwt(
      { sub: asId(userId), workspace_id: asId(workspaceId), tenant_id: asId(tenantId), role: Role.Admin },
      c.env.JWT_SECRET,
    );

    return c.json({ token, expires_in: SESSION_TTL, user: { id: userId, tenantId, workspaceId, role: 'admin', phoneE164 } }, 201);
  }

  // ── Purpose: verify ─────────────────────────────────────────────────────
  if (body.purpose === 'verify') {
    const tenantQuery = body.tenantId ?? otpRow.tenant_id;
    if (tenantQuery) {
      await c.env.DB.prepare(
        `UPDATE users SET phone_verified_at = unixepoch(), phone_e164 = ?, updated_at = unixepoch() WHERE phone_e164 = ? AND tenant_id = ?`,
      ).bind(phoneE164, phoneE164, tenantQuery).run();
    }
    return c.json({ verified: true, phoneE164 });
  }

  // ── Purpose: recover ────────────────────────────────────────────────────
  if (body.purpose === 'recover') {
    if (!body.newPassword || body.newPassword.length < 8) {
      return c.json(errorResponse(ErrorCode.BadRequest, 'newPassword must be at least 8 characters.'), 400);
    }
    const tenantQuery = body.tenantId ?? otpRow.tenant_id;
    const userRow2 = tenantQuery
      ? await c.env.DB.prepare('SELECT id, tenant_id, workspace_id, role FROM users WHERE phone_e164 = ? AND tenant_id = ? LIMIT 1')
          .bind(phoneE164, tenantQuery).first<{ id: string; tenant_id: string; workspace_id: string; role: string }>()
      : await c.env.DB.prepare('SELECT id, tenant_id, workspace_id, role FROM users WHERE phone_e164 = ? LIMIT 1')
          .bind(phoneE164).first<{ id: string; tenant_id: string; workspace_id: string; role: string }>();

    if (!userRow2) return c.json(errorResponse(ErrorCode.NotFound, 'No account found for this phone number.'), 404);

    const encoder = new TextEncoder();
    const saltBuf = new Uint8Array(16);
    crypto.getRandomValues(saltBuf);
    const salt64 = btoa(String.fromCharCode(...saltBuf));
    const km = await crypto.subtle.importKey('raw', encoder.encode(body.newPassword), { name: 'PBKDF2' }, false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: saltBuf, iterations: 600_000, hash: 'SHA-256' }, km, 256);
    const newHash = `${salt64}:${btoa(String.fromCharCode(...new Uint8Array(bits)))}`;
    await c.env.DB.prepare(`UPDATE users SET password_hash = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`).bind(newHash, userRow2.id, userRow2.tenant_id).run();

    const token = await issueJwt(
      { sub: asId(userRow2.id), workspace_id: asId(userRow2.workspace_id), tenant_id: asId(userRow2.tenant_id), role: userRow2.role as Role },
      c.env.JWT_SECRET,
    );
    return c.json({ token, expires_in: SESSION_TTL, message: 'Password updated via phone recovery.' });
  }

  return c.json(errorResponse(ErrorCode.BadRequest, 'Invalid purpose.'), 400);
});
