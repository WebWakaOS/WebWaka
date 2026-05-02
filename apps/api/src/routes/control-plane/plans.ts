/**
 * Control Plane — Layer 1: Dynamic Subscription Catalog API
 *
 * GET    /platform-admin/cp/plans               — list packages
 * POST   /platform-admin/cp/plans               — create package
 * GET    /platform-admin/cp/plans/:id           — get package
 * PATCH  /platform-admin/cp/plans/:id           — update package
 * POST   /platform-admin/cp/plans/:id/activate  — activate
 * POST   /platform-admin/cp/plans/:id/deactivate — deactivate
 * POST   /platform-admin/cp/plans/:id/archive   — archive
 * GET    /platform-admin/cp/plans/:id/pricing   — get pricing
 * PUT    /platform-admin/cp/plans/:id/pricing   — set pricing
 * GET    /platform-admin/cp/billing-intervals   — list intervals
 */

import { Hono } from 'hono';
import type { Env } from '../../env.js';
import { createControlPlane } from '@webwaka/control-plane';
import type { ActorContext } from '@webwaka/control-plane';

function resolveActor(c: { get: (k: string) => unknown; env: Env; req: { header: (k: string) => string | undefined } }): ActorContext {
  const auth = c.get('auth') as { userId: string; tenantId?: string; role?: string; workspaceId?: string } | undefined;
  return {
    actorId: auth?.userId ?? 'system',
    actorRole: auth?.role ?? 'super_admin',
    actorLevel: 'super_admin',
    tenantId: auth?.tenantId,
    workspaceId: auth?.workspaceId,
    requestId: crypto.randomUUID(),
  };
}

const planRoutes = new Hono<{ Bindings: Env }>();

planRoutes.get('/', async (c) => {
  const cp = createControlPlane(c.env.DB, c.env.KV);
  const status = c.req.query('status') as 'active' | 'inactive' | 'archived' | 'draft' | undefined;
  const audience = c.req.query('target_audience');
  const limit = parseInt(c.req.query('limit') ?? '50', 10);
  const offset = parseInt(c.req.query('offset') ?? '0', 10);

  const result = await cp.plans.listPackages({ status, targetAudience: audience, limit, offset });
  return c.json(result);
});

planRoutes.post('/', async (c) => {
  const cp = createControlPlane(c.env.DB, c.env.KV);
  const actor = resolveActor(c);
  const body = await c.req.json<{ slug: string; name: string; description?: string; status?: 'active' | 'draft'; target_audience?: string; is_public?: boolean; sort_order?: number }>();

  if (!body.slug || !body.name) {
    return c.json({ error: 'slug and name are required' }, 400);
  }

  const pkg = await cp.plans.createPackage(body, actor);
  return c.json(pkg, 201);
});

planRoutes.get('/billing-intervals', async (c) => {
  const cp = createControlPlane(c.env.DB, c.env.KV);
  const intervals = await cp.plans.listBillingIntervals();
  return c.json({ results: intervals });
});

planRoutes.get('/:id', async (c) => {
  const cp = createControlPlane(c.env.DB, c.env.KV);
  const pkg = await cp.plans.getPackage(c.req.param('id'));
  if (!pkg) return c.json({ error: 'Package not found' }, 404);

  const [pricing, entitlements] = await Promise.all([
    cp.plans.getPackagePricing(pkg.id),
    cp.entitlements.getPackageEntitlements(pkg.id),
  ]);

  return c.json({ ...pkg, pricing, entitlements });
});

planRoutes.patch('/:id', async (c) => {
  const cp = createControlPlane(c.env.DB, c.env.KV);
  const actor = resolveActor(c);
  const body = await c.req.json<{ name?: string; description?: string; status?: 'active' | 'inactive' | 'archived' | 'draft'; is_public?: boolean; sort_order?: number }>();
  const updated = await cp.plans.updatePackage(c.req.param('id'), body, actor);
  return c.json(updated);
});

planRoutes.post('/:id/activate', async (c) => {
  const cp = createControlPlane(c.env.DB, c.env.KV);
  const actor = resolveActor(c);
  await cp.plans.activatePackage(c.req.param('id'), actor);
  return c.json({ success: true, message: 'Package activated' });
});

planRoutes.post('/:id/deactivate', async (c) => {
  const cp = createControlPlane(c.env.DB, c.env.KV);
  const actor = resolveActor(c);
  await cp.plans.deactivatePackage(c.req.param('id'), actor);
  return c.json({ success: true, message: 'Package deactivated' });
});

planRoutes.post('/:id/archive', async (c) => {
  const cp = createControlPlane(c.env.DB, c.env.KV);
  const actor = resolveActor(c);
  const body = await c.req.json<{ superseded_by?: string }>().catch(() => ({}));
  await cp.plans.archivePackage(c.req.param('id'), body.superseded_by ?? null, actor);
  return c.json({ success: true, message: 'Package archived' });
});

planRoutes.get('/:id/pricing', async (c) => {
  const cp = createControlPlane(c.env.DB, c.env.KV);
  const pricing = await cp.plans.getPackagePricing(c.req.param('id'));
  return c.json({ results: pricing });
});

planRoutes.put('/:id/pricing', async (c) => {
  const cp = createControlPlane(c.env.DB, c.env.KV);
  const actor = resolveActor(c);
  const body = await c.req.json<{ billing_interval_id: string; price_kobo: number; currency?: string; effective_from?: number; effective_until?: number | null; trial_days_override?: number | null; paystack_plan_code?: string | null }>();

  if (!body.billing_interval_id || body.price_kobo === undefined) {
    return c.json({ error: 'billing_interval_id and price_kobo are required' }, 400);
  }

  const pricing = await cp.plans.setPricing(c.req.param('id'), body, actor);
  return c.json(pricing);
});

export { planRoutes };
