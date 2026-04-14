/**
 * Email Verification Enforcement Middleware — P20/P21 (T007)
 *
 * Blocks access to sensitive routes for users who have not yet verified
 * their email address. Configurable via EMAIL_VERIFICATION_ENFORCEMENT_DATE
 * env var to support a grace period for existing accounts (Founder Decision D1).
 *
 * Enforcement behaviour:
 *   - If EMAIL_VERIFICATION_ENFORCEMENT_DATE is not set: warn-only mode (logs, no block)
 *   - If set to a date in the past: full enforcement — block unverified users
 *   - If set to a date in the future: grace period — warn but do not block
 *
 * Per-request check queries the users table for email_verified_at.
 * This adds a single fast indexed query per request on protected routes.
 *
 * Apply selectively to sensitive routes only (payments, bank transfer, identity, AI).
 * Do NOT apply globally — login, register, and verification routes must remain accessible.
 *
 * Usage:
 *   app.use('/bank-transfer/*', emailVerificationEnforcement);
 *   app.use('/identity/*', emailVerificationEnforcement);
 */

import type { MiddlewareHandler } from 'hono';
import type { Env } from '../env.js';

interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): {
      first<T>(): Promise<T | null>;
    };
  };
}

export const emailVerificationEnforcement: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const auth = c.get('auth') as { userId: string; tenantId: string } | undefined;
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorised' }, 401);
  }

  const db = c.env.DB as unknown as D1Like;

  const user = await db
    .prepare(`SELECT email_verified_at FROM users WHERE id = ? AND tenant_id = ? LIMIT 1`)
    .bind(auth.userId, auth.tenantId)
    .first<{ email_verified_at: number | null }>();

  if (user?.email_verified_at) {
    return next();
  }

  // User email is not verified — check enforcement date
  const enforcementDateRaw = (c.env as unknown as Record<string, unknown>)['EMAIL_VERIFICATION_ENFORCEMENT_DATE'] as string | undefined;
  const now = Date.now();

  if (!enforcementDateRaw) {
    console.warn(
      `[email-verification] unverified user accessing protected route — warn-only mode (no enforcement date set)`,
      { userId: auth.userId, path: c.req.path },
    );
    return next();
  }

  const enforcementDate = new Date(enforcementDateRaw).getTime();
  if (isNaN(enforcementDate)) {
    console.error(
      `[email-verification] invalid EMAIL_VERIFICATION_ENFORCEMENT_DATE: "${enforcementDateRaw}" — warn-only mode`,
    );
    return next();
  }

  if (now < enforcementDate) {
    console.warn(
      `[email-verification] unverified user accessing protected route — grace period active until ${enforcementDateRaw}`,
      { userId: auth.userId, path: c.req.path },
    );
    return next();
  }

  return c.json(
    {
      error: 'Email verification required',
      code: 'EMAIL_UNVERIFIED',
      message: 'Please verify your email address to access this feature.',
    },
    403,
  );
};
