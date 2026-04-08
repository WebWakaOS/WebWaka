/**
 * Audit log middleware for WebWaka API (M7a)
 * (docs/governance/security-baseline.md, docs/governance/data-residency-ndpr.md)
 *
 * Writes structured audit entries to console (structured for CF Logpush → Datadog/Axiom).
 * Used on sensitive routes: /identity, /contact/verify, /workspaces upgrade
 *
 * Audit fields:
 *   - timestamp (ISO 8601)
 *   - user_id (from Authorization JWT header)
 *   - tenant_id
 *   - action (route + method)
 *   - outcome (success / error)
 *   - ip_address (masked: first 3 octets only for privacy)
 *
 * NOTE: Never log raw BVN, NIN, OTP codes, or JWT secrets (R7).
 */

import { createMiddleware } from 'hono/factory';
import type { Env } from '../env.js';

interface AuditEntry {
  readonly ts: string;
  readonly user_id: string | null;
  readonly action: string;
  readonly method: string;
  readonly path: string;
  readonly ip_masked: string;
  readonly duration_ms: number;
  readonly status: number;
}

/**
 * Audit log middleware. Logs request + response metadata (no body).
 * Attach to any sensitive route prefix via app.use('/identity/*', auditLogMiddleware).
 */
export const auditLogMiddleware = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const start = Date.now();

  await next();

  const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? '';
  const ipMasked = maskIPAddress(ip);

  const authHeader = c.req.header('Authorization') ?? '';
  const userId = extractUserIdFromBearer(authHeader);

  const entry: AuditEntry = {
    ts: new Date().toISOString(),
    user_id: userId,
    action: `${c.req.method} ${c.req.routePath}`,
    method: c.req.method,
    path: c.req.path,
    ip_masked: ipMasked,
    duration_ms: Date.now() - start,
    status: c.res.status,
  };

  console.log('[AUDIT]', JSON.stringify(entry));
});

function maskIPAddress(ip: string): string {
  if (!ip) return '?.?.?.?';
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.*`;
  }
  return ip.slice(0, 6) + '***';
}

function extractUserIdFromBearer(authHeader: string): string | null {
  if (!authHeader.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.slice(7);
    const payloadB64 = token.split('.')[1];
    if (!payloadB64) return null;
    const payload = JSON.parse(atob(payloadB64)) as { sub?: string };
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
