/**
 * Route Group: Vertical Engine Dynamic Routes
 *
 * DEBT-005 resolution (P1-040/041): The original design planned header-based
 * dual-path routing (X-Use-Engine: 1 → engine, otherwise → legacy). This was
 * implemented as a no-op middleware that always called next() regardless of
 * the header value — the dead function has been removed.
 *
 * Current status (Phase 1):
 *   - Engine routes ARE registered and active alongside legacy routes.
 *   - Route precedence: Hono resolves by registration order in server.ts.
 *     The engine routes are registered AFTER legacy, so legacy wins on conflict.
 *   - Traffic shifting: use load-balancer or Cloudflare Worker routing rules
 *     (not application-level header middleware) for gradual migration.
 *
 * Migration path to engine-only:
 *   1. Run parity tests (parity-all.test.ts) to prove equivalence for each vertical.
 *   2. Unregister legacy routes one vertical at a time (edit register-vertical-routes.ts).
 *   3. Monitor error rates for 2+ sprints per vertical batch.
 *   4. Once all verticals migrated, remove register-vertical-routes.ts entirely.
 *
 * ADR-0048: Vertical Engine Routing Strategy — see docs/adrs/0048-vertical-engine-routing.md
 */

import type { Hono } from 'hono';
import type { Env } from '../env.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireEntitlement } from '../middleware/entitlement.js';
import { PlatformLayer } from '@webwaka/types';
import { getRegistry, listSlugs, generateRoutes } from '@webwaka/vertical-engine';

/**
 * Map pillar to entitlement layer for guard middleware
 */
function getEntitlementLayer(pillar: 1 | 2 | 3): PlatformLayer {
  if (pillar === 1) return PlatformLayer.Civic;
  if (pillar === 2) return PlatformLayer.Commerce;
  return PlatformLayer.Operational;
}

/**
 * Map entitlementLayer string from config to PlatformLayer enum
 */
function mapEntitlementLayer(layer?: string): PlatformLayer {
  if (layer === 'Commerce') return PlatformLayer.Commerce;
  if (layer === 'Transport') return PlatformLayer.Transport;
  if (layer === 'Civic') return PlatformLayer.Civic;
  if (layer === 'Political') return PlatformLayer.Political;
  return PlatformLayer.Operational;
}

/**
 * Register all vertical-engine powered routes dynamically from registry.
 * Each vertical gets:
 *   - Auth middleware
 *   - Entitlement guard (based on primaryPillar)
 *   - Generated CRUD + FSM routes
 */
export function registerVerticalEngineRoutes(app: Hono<{ Bindings: Env }>): void {
  const registry = getRegistry();
  const slugs = listSlugs();

  console.log(`[VerticalEngine] Registering ${slugs.length} verticals from engine`);

  for (const slug of slugs) {
    const config = registry[slug];
    if (!config) continue;

    const basePath = config.route.basePath; // e.g., '/bakery'
    
    // Build full path with optional prefixes
    let fullPath = '';
    if (config.route.v1Prefix) {
      fullPath = `/v1${basePath}`;
    } else if (config.route.verticalsPrefix) {
      fullPath = `/v1/verticals${basePath}`;
    } else {
      fullPath = basePath;
    }

    // Apply auth middleware to all routes under this vertical
    app.use(`${fullPath}/*`, authMiddleware);
    app.use(`${fullPath}`, authMiddleware);

    // Apply entitlement guard based on primaryPillar
    const entitlementLayer = config.route.entitlementLayer 
      ? mapEntitlementLayer(config.route.entitlementLayer)
      : getEntitlementLayer(config.primaryPillar);
    app.use(`${fullPath}/*`, requireEntitlement(entitlementLayer));
    app.use(`${fullPath}`, requireEntitlement(entitlementLayer));

    // Generate and mount the routes
    const routes = generateRoutes(config);
    app.route(fullPath, routes);

    // Handle deprecated aliases
    if (config.deprecatedAliases) {
      for (const alias of config.deprecatedAliases) {
        const aliasPath = `/${alias}`;
        app.use(`${aliasPath}/*`, authMiddleware);
        app.use(`${aliasPath}`, authMiddleware);
        app.use(`${aliasPath}/*`, requireEntitlement(entitlementLayer));
        app.use(`${aliasPath}`, requireEntitlement(entitlementLayer));
        app.route(aliasPath, routes);
      }
    }
  }

  console.log(`[VerticalEngine] Registration complete`);
}
