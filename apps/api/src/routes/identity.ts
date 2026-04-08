/**
 * Identity verification routes — /identity/* (M7a)
 * (docs/identity/bvn-nin-guide.md, docs/identity/frsc-cac-integration.md)
 *
 * Routes:
 *   POST /identity/verify-bvn   — BVN verification (T1 KYC gate)
 *   POST /identity/verify-nin   — NIN verification (T2 KYC gate)
 *   POST /identity/verify-cac   — CAC business lookup
 *   POST /identity/verify-frsc  — FRSC license lookup
 *
 * Security:
 *   - All routes require auth (applied at app level in index.ts)
 *   - Rate limit: 2/hour per user (R5) — via identityRateLimit middleware
 *   - P10: Consent record required before every lookup
 *   - R7: BVN/NIN never stored — only SHA-256(SALT + value) hash
 */

import { Hono } from 'hono';
import { verifyBVN, verifyNIN, verifyCAC, verifyFRSC, hashPII, IdentityError, type ConsentRecord } from '@webwaka/identity';
import type { Env } from '../env.js';

interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      first<T>(): Promise<T | null>;
      run(): Promise<{ success: boolean }>;
    };
  };
}

const identityRoutes = new Hono<{ Bindings: Env }>();

/**
 * POST /identity/verify-bvn
 * Body: { bvn: string, consent_id: string, phone: string }
 */
identityRoutes.post('/verify-bvn', async (c) => {
  const body = await c.req.json<{ bvn: string; consent_id: string; phone: string }>().catch(() => null);
  if (!body?.bvn || !body.consent_id || !body.phone) {
    return c.json({ error: 'bvn, consent_id, and phone are required.' }, 400);
  }

  const db = c.env.DB as unknown as D1Like;
  const consent = await db.prepare(
    `SELECT id, user_id, tenant_id, data_type, purpose, consented_at, revoked_at
     FROM consent_records WHERE id = ? AND data_type = 'BVN' LIMIT 1`,
  ).bind(body.consent_id).first<ConsentRecord>();

  try {
    const result = await verifyBVN(body.bvn, consent as ConsentRecord, body.phone, {
      PREMBLY_API_KEY: c.env.PREMBLY_API_KEY,
      PAYSTACK_SECRET_KEY: c.env.PAYSTACK_SECRET_KEY,
      LOG_PII_SALT: c.env.LOG_PII_SALT,
    });

    const bvn_hash = await hashPII(c.env.LOG_PII_SALT, body.bvn);

    await db.prepare(
      `INSERT OR IGNORE INTO kyc_records
         (workspace_id, tenant_id, user_id, record_type, provider, status, verified_at, raw_response_hash)
         VALUES (?, ?, ?, 'BVN', ?, 'verified', ?, ?)`,
    ).bind(
      'system',
      consent?.tenant_id ?? '',
      consent?.user_id ?? '',
      result.provider,
      Math.floor(Date.now() / 1000),
      bvn_hash,
    ).run();

    return c.json({ success: true, result: { verified: result.verified, full_name: result.full_name, phone_match: result.phone_match, provider: result.provider } });
  } catch (err) {
    if (err instanceof IdentityError) {
      return c.json({ error: err.code, message: err.message }, err.code === 'consent_missing' ? 403 : 422);
    }
    console.error('[identity/verify-bvn]', err instanceof Error ? err.message : err);
    return c.json({ error: 'provider_error', message: 'Identity verification temporarily unavailable.' }, 502);
  }
});

/**
 * POST /identity/verify-nin
 * Body: { nin: string, consent_id: string }
 */
identityRoutes.post('/verify-nin', async (c) => {
  const body = await c.req.json<{ nin: string; consent_id: string }>().catch(() => null);
  if (!body?.nin || !body.consent_id) {
    return c.json({ error: 'nin and consent_id are required.' }, 400);
  }

  const db = c.env.DB as unknown as D1Like;
  const consent = await db.prepare(
    `SELECT id, user_id, tenant_id, data_type, purpose, consented_at, revoked_at
     FROM consent_records WHERE id = ? AND data_type = 'NIN' LIMIT 1`,
  ).bind(body.consent_id).first<ConsentRecord>();

  try {
    const result = await verifyNIN(body.nin, consent as ConsentRecord, {
      PREMBLY_API_KEY: c.env.PREMBLY_API_KEY,
    });

    const nin_hash = await hashPII(c.env.LOG_PII_SALT, body.nin);

    await db.prepare(
      `INSERT OR IGNORE INTO kyc_records
         (workspace_id, tenant_id, user_id, record_type, provider, status, verified_at, raw_response_hash)
         VALUES (?, ?, ?, 'NIN', ?, 'verified', ?, ?)`,
    ).bind(
      'system',
      consent?.tenant_id ?? '',
      consent?.user_id ?? '',
      result.provider,
      Math.floor(Date.now() / 1000),
      nin_hash,
    ).run();

    return c.json({ success: true, result: { verified: result.verified, full_name: result.full_name, gender: result.gender, dob: result.dob, provider: result.provider } });
  } catch (err) {
    if (err instanceof IdentityError) {
      return c.json({ error: err.code, message: err.message }, err.code === 'consent_missing' ? 403 : 422);
    }
    console.error('[identity/verify-nin]', err instanceof Error ? err.message : err);
    return c.json({ error: 'provider_error', message: 'Identity verification temporarily unavailable.' }, 502);
  }
});

/**
 * POST /identity/verify-cac
 * Body: { rc_number: string, consent_id: string }
 */
identityRoutes.post('/verify-cac', async (c) => {
  const body = await c.req.json<{ rc_number: string; consent_id: string }>().catch(() => null);
  if (!body?.rc_number || !body.consent_id) {
    return c.json({ error: 'rc_number and consent_id are required.' }, 400);
  }

  const db = c.env.DB as unknown as D1Like;
  const consent = await db.prepare(
    `SELECT id, user_id, tenant_id, data_type, purpose, consented_at, revoked_at
     FROM consent_records WHERE id = ? AND data_type = 'CAC' LIMIT 1`,
  ).bind(body.consent_id).first<ConsentRecord>();

  try {
    const result = await verifyCAC(body.rc_number, consent as ConsentRecord, {
      PREMBLY_API_KEY: c.env.PREMBLY_API_KEY,
    });

    return c.json({ success: true, result });
  } catch (err) {
    if (err instanceof IdentityError) {
      return c.json({ error: err.code, message: err.message }, err.code === 'consent_missing' ? 403 : 422);
    }
    console.error('[identity/verify-cac]', err instanceof Error ? err.message : err);
    return c.json({ error: 'provider_error', message: 'CAC lookup temporarily unavailable.' }, 502);
  }
});

/**
 * POST /identity/verify-frsc
 * Body: { license_number: string, consent_id: string }
 */
identityRoutes.post('/verify-frsc', async (c) => {
  const body = await c.req.json<{ license_number: string; consent_id: string }>().catch(() => null);
  if (!body?.license_number || !body.consent_id) {
    return c.json({ error: 'license_number and consent_id are required.' }, 400);
  }

  const db = c.env.DB as unknown as D1Like;
  const consent = await db.prepare(
    `SELECT id, user_id, tenant_id, data_type, purpose, consented_at, revoked_at
     FROM consent_records WHERE id = ? AND data_type = 'FRSC' LIMIT 1`,
  ).bind(body.consent_id).first<ConsentRecord>();

  try {
    const result = await verifyFRSC(body.license_number, consent as ConsentRecord, {
      PREMBLY_API_KEY: c.env.PREMBLY_API_KEY,
    });

    return c.json({ success: true, result });
  } catch (err) {
    if (err instanceof IdentityError) {
      return c.json({ error: err.code, message: err.message }, err.code === 'consent_missing' ? 403 : 422);
    }
    console.error('[identity/verify-frsc]', err instanceof Error ? err.message : err);
    return c.json({ error: 'provider_error', message: 'FRSC lookup temporarily unavailable.' }, 502);
  }
});

export { identityRoutes };
