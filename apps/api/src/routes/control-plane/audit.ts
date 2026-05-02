/**
 * Control Plane — Governance Audit Log API
 *
 * GET /platform-admin/cp/audit  — query governance audit log (read-only)
 */

import { Hono } from 'hono';
import type { Env } from '../../env.js';
import { createControlPlane } from '@webwaka/control-plane';

const auditRoutes = new Hono<{ Bindings: Env }>();

auditRoutes.get('/', async (c) => {
  const cp = createControlPlane(c.env.DB, c.env.KV);
  const auth = c.get('auth') as { tenantId?: string } | undefined;
  const tenantId = c.req.query('tenant_id') ?? auth?.tenantId;
  const resourceType = c.req.query('resource_type');
  const action = c.req.query('action');
  const actorId = c.req.query('actor_id');
  const limit = Math.min(parseInt(c.req.query('limit') ?? '50', 10), 200);
  const offset = parseInt(c.req.query('offset') ?? '0', 10);

  const result = await cp.audit.query({ tenantId, resourceType, action, actorId, limit, offset });
  return c.json(result);
});

export { auditRoutes };
