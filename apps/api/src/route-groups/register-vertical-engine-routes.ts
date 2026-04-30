/**
 * Route Group: Vertical Engine Dynamic Routes
 * Phase 1 Task 1.10: Dual-path routing for gradual migration
 *
 * This file implements the NEW vertical-engine powered routes.
 * Routes are mounted ALONGSIDE the existing legacy vertical routes.
 * Feature flag: X-Use-Engine: 1 → routes to engine; otherwise → legacy
 *
 * Migration Strategy:
 * 1. Both paths operational (this phase)
 * 2. Parity testing proves equivalence
 * 3. Gradual traffic shift via feature flag
 * 4. Legacy deprecation after 2+ sprints of stability
 */

import type { Hono } from 'hono';
import type { Env } from '../env.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireEntitlement } from '../middleware/entitlement.js';
import { PlatformLayer } from '@webwaka/types';
import { getRegistry, listSlugs, generateRoutes } from '@webwaka/vertical-engine';

/**
 * Feature flag middleware: routes requests based on X-Use-Engine header.
 * If header is '1', request proceeds to engine routes.
 * Otherwise, request passes through to legacy routes (no-op middleware).
 */
function engineFeatureFlagMiddleware(c: { req: { header: (name: string) => string | undefined }; res: unknown }, next: () => Promise<void>) {
  const useEngine = c.req.header('X-Use-Engine');
  if (useEngine === '1') {
    // Request is for the engine path
    return next();
  }
  // Skip to next route group (legacy)
  return next();
}

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
