import { createMiddleware } from 'hono/factory';
import type { Env } from '../env.js';

interface AuditEntry {
  readonly ts: string;
  readonly user_id: string | null;
  readonly tenant_id: string | null;
  readonly action: string;
  readonly method: string;
  readonly path: string;
  readonly resource_type: string | null;
  readonly resource_id: string | null;
  readonly ip_masked: string;
  readonly duration_ms: number;
  readonly status: number;
}

interface AuthShape {
  userId?: string;
  tenantId?: string;
}

export const auditLogMiddleware = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const start = Date.now();

  await next();

  const ip = c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? '';
  const ipMasked = maskIPAddress(ip);

  const auth = c.get('auth') as AuthShape | undefined;
  const userId = auth?.userId ?? null;
  const tenantId = auth?.tenantId ?? null;

  const pathSegments = c.req.path.split('/').filter(Boolean);
  const resourceType = pathSegments[0] ?? null;
  const resourceId = pathSegments.length > 1 ? (pathSegments[pathSegments.length - 1] ?? null) : null;

  const entry: AuditEntry = {
    ts: new Date().toISOString(),
    user_id: userId,
    tenant_id: tenantId,
    action: `${c.req.method} ${c.req.routePath ?? c.req.path}`,
    method: c.req.method,
    path: c.req.path,
    resource_type: resourceType,
    resource_id: resourceId,
    ip_masked: ipMasked,
    duration_ms: Date.now() - start,
    status: c.res.status,
  };

  console.log('[AUDIT]', JSON.stringify(entry));

  if (tenantId) {
    const id = crypto.randomUUID();
    try {
      await c.env.DB.prepare(
        `INSERT INTO audit_logs (id, tenant_id, user_id, action, method, path, resource_type, resource_id, ip_masked, status_code, duration_ms)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(
          id,
          tenantId,
          userId,
          entry.action,
          entry.method,
          entry.path,
          entry.resource_type,
          entry.resource_id,
          entry.ip_masked,
          entry.status,
          entry.duration_ms,
        )
        .run();
    } catch (err) {
      // BUG-014 fix: Dual-write to RATE_LIMIT_KV failure queue on D1 write failure.
      // Entries are stored with 48-hour TTL under key audit_fail:<id> for re-drive
      // by the scheduled audit-log-redriver job (ENH-004 scheduler worker).
      // Key change from prior implementation: use RATE_LIMIT_KV (always bound) instead
      // of KV (may not be bound); use audit_fail: prefix for scheduler discoverability;
      // increase TTL to 172800s (48h) to outlast transient D1 degradations.
      const failedEntry = JSON.stringify({
        id,
        ts: entry.ts,
        tenantId,
        action: entry.action,
        error: err instanceof Error ? err.message : String(err),
      });
      console.error(JSON.stringify({
        level: 'error',
        event: 'audit_log_write_failed',
        entryId: id,
        tenantId,
        error: err instanceof Error ? err.message : String(err),
      }));
      try {
        const failKey = `audit_fail:${id}`;
        await c.env.RATE_LIMIT_KV.put(failKey, failedEntry, { expirationTtl: 172800 });
      } catch {
        // RATE_LIMIT_KV also unavailable — both log layers exhausted; already logged above.
      }
    }
  }
});

function maskIPAddress(ip: string): string {
  if (!ip) return '?.?.?.?';
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.*`;
  }
  return ip.slice(0, 6) + '***';
}
