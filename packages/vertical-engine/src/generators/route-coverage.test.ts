/**
 * B5-2: Generated route coverage test
 * Verifies that generateAllRoutes() successfully mounts every slug
 * from the engine registry onto a Hono app — no slug left unmounted.
 *
 * B5-3: Entitlement layer enforcement spot-check
 * Verifies that verticals with entitlementLayer return 403 when
 * the caller lacks the required entitlement.
 */
import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { REGISTRY } from '../registry.js';
import { generateAllRoutes } from './route-generator.js';

function makePlainApp(): Hono {
  return new Hono();
}

// ── B5-2: Coverage ────────────────────────────────────────────────────────────
describe('B5-2: generateAllRoutes() coverage', () => {
  it('mounts all 159 registry verticals without errors', () => {
    const app = makePlainApp();
    const { mounted, errors } = generateAllRoutes(REGISTRY, app);
    expect(errors).toEqual([]);
    expect(mounted.length).toBe(Object.keys(REGISTRY).length);
  });

  it('every registry slug appears in mounted list', () => {
    const app = makePlainApp();
    const { mounted } = generateAllRoutes(REGISTRY, app);
    const mountedSet = new Set(mounted);
    for (const slug of Object.keys(REGISTRY)) {
      expect(mountedSet.has(slug)).toBe(true);
    }
  });

  it('mounted count equals 159', () => {
    const app = makePlainApp();
    const { mounted } = generateAllRoutes(REGISTRY, app);
    expect(mounted.length).toBe(159);
  });

  it('each mounted basePath is unique', () => {
    const app = makePlainApp();
    const { mounted } = generateAllRoutes(REGISTRY, app);
    const basePaths = mounted.map(slug => REGISTRY[slug]!.route?.basePath ?? `/${slug}`);
    const uniquePaths = new Set(basePaths);
    expect(uniquePaths.size).toBe(basePaths.length);
  });

  it('returns empty errors array on clean registry', () => {
    const app = makePlainApp();
    const { errors } = generateAllRoutes(REGISTRY, app);
    expect(errors.length).toBe(0);
  });
});

// ── B5-3: Entitlement enforcement ────────────────────────────────────────────
describe('B5-3: Entitlement layer enforcement in generated routes', () => {
  it('returns 403 when caller lacks required entitlementLayer', async () => {
    // Pick a Commerce-gated vertical
    const slug = 'restaurant';
    const config = REGISTRY[slug]!;
    const requiredLayer = config.route.entitlementLayer; // 'Commerce'
    expect(requiredLayer).toBeDefined();

    const app = new Hono();
    // Inject entitlements context (missing 'Commerce')
    app.use('*', async (c, next) => {
      c.set('entitlements' as never, new Set(['Civic']) as never);
      await next();
    });
    generateAllRoutes(REGISTRY, app);

    const basePath = config.route.basePath; // '/restaurant'
    const res = await app.request(`${basePath}/workspace/ws1`);
    // Should be 403 — lacks 'Commerce'
    expect(res.status).toBe(403);
    const body = await res.json() as { error: string; requiredEntitlement: string };
    expect(body.error).toBe('entitlement_required');
    expect(body.requiredEntitlement).toBe(requiredLayer);
  });

  it('allows request when caller has required entitlementLayer', async () => {
    const slug = 'restaurant';
    const config = REGISTRY[slug]!;

    const app = new Hono();
    app.use('*', async (c, next) => {
      // Has 'Commerce' — should pass through
      c.set('entitlements' as never, new Set(['Commerce', 'Civic']) as never);
      await next();
    });
    generateAllRoutes(REGISTRY, app);

    const basePath = config.route.basePath;
    const res = await app.request(`${basePath}/workspace/ws1`);
    // Should NOT be 403 (may be 404/500 since no DB — but entitlement check passes)
    expect(res.status).not.toBe(403);
  });

  it('allows request when no entitlements context is set (open routes)', async () => {
    const slug = 'restaurant';
    const config = REGISTRY[slug]!;

    const app = new Hono();
    // No entitlements context set at all
    generateAllRoutes(REGISTRY, app);

    const basePath = config.route.basePath;
    const res = await app.request(`${basePath}/workspace/ws1`);
    // Should pass entitlement guard (no context = open)
    expect(res.status).not.toBe(403);
  });
});
