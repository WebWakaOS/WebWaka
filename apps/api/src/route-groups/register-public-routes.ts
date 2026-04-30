/**
 * Route Group: Public Routes (no auth required)
 * ARC-07 router split — Phase 0.5
 */
import type { Hono } from 'hono';
import type { Env } from '../env.js';
import { healthRoutes, API_VERSION } from '../routes/health.js';
import { geographyRoutes } from '../routes/geography.js';
import { discoveryRoutes } from '../routes/discovery.js';
import { publicRoutes } from '../routes/public.js';
import { openapiRoutes, swaggerRoutes } from '../routes/openapi.js';
import { developerRoutes } from '../routes/developer.js';
import { verticalsRoutes } from '../routes/verticals.js';
import { fxRatesRoutes } from '../routes/fx-rates.js';
import {
  isSensitiveVertical,
  getSensitiveSector,
  preProcessCheck,
  listCapabilities,
} from '@webwaka/superagent';

export function registerPublicRoutes(app: Hono<{ Bindings: Env }>): void {
  // -------------------------------------------------------------------------
  // Public routes (no auth)
  // -------------------------------------------------------------------------

  app.route('/health', healthRoutes);
  // TEST-001: Top-level /version alias — smoke tests expect GET /version (not /health/version)
  app.get('/version', (c) => c.json({ version: API_VERSION }));
  app.route('/openapi.json', openapiRoutes);
  app.route('/docs', swaggerRoutes); // GOV-03: Swagger UI
  app.route('/developer', developerRoutes); // Phase 6 / E33: Public API developer info
  app.route('/geography', geographyRoutes);
  app.route('/discovery', discoveryRoutes);

  // -------------------------------------------------------------------------
  // M6: Public tenant routes — no auth required
  // -------------------------------------------------------------------------

  app.route('/public', publicRoutes);

  // -------------------------------------------------------------------------
  // M8a: Verticals registry routes — public (no auth required)
  // -------------------------------------------------------------------------

  app.route('/verticals', verticalsRoutes);

  // -------------------------------------------------------------------------
  // SA-2.3 / Task #3: /superagent/capabilities is a PUBLIC metadata endpoint.
  // Returns the full capability catalogue (displayName, description, pillar, planTier)
  // for all 23 AICapabilityType values. No user data accessed; registered before
  // authMiddleware so workspace-apps and partner portals can call it without a JWT.
  // -------------------------------------------------------------------------

  app.get('/superagent/capabilities', (c) => {
    return c.json({ capabilities: listCapabilities() });
  });

  // SA-4.5: /superagent/compliance/check is a PUBLIC metadata endpoint.
  // It returns vertical sensitivity + HITL requirements with no user data access.
  app.get('/superagent/compliance/check', (c) => {
    const vertical = c.req.query('vertical');
    if (!vertical) {
      return c.json({ error: 'vertical query parameter required' }, 400);
    }
    const sensitive = isSensitiveVertical(vertical);
    const sector = getSensitiveSector(vertical);
    const complianceCheck = preProcessCheck(vertical, [], sensitive ? 3 : 1);
    return c.json({
      vertical,
      is_sensitive: sensitive,
      sector,
      requires_hitl: complianceCheck.requiresHitl,
      hitl_level: complianceCheck.hitlLevel ?? null,
      disclaimers: complianceCheck.disclaimers,
    });
  });

  // -------------------------------------------------------------------------
  // P24: FX Rates — GET routes are public; POST (upsert) requires super_admin.
  // Auth middleware NOT applied at route level — the POST handler enforces
  // super_admin role internally.
  // -------------------------------------------------------------------------

  app.route('/fx-rates', fxRatesRoutes);
}
