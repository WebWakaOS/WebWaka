/**
 * Route Group: SuperAgent / AI Routes
 * ARC-07 router split — Phase 0.5
 */
import type { Hono } from 'hono';
import type { Env } from '../env.js';
import { authMiddleware } from '../middleware/auth.js';
import { auditLogMiddleware } from '../middleware/audit-log.js';
import { ussdExclusionMiddleware } from '../middleware/ussd-exclusion.js';
import { aiEntitlementMiddleware } from '../middleware/ai-entitlement.js';
import { superagentRoutes } from '../routes/superagent.js';

export function registerAiRoutes(app: Hono<{ Bindings: Env }>): void {
  // -------------------------------------------------------------------------
  // SA-2.x / SA-3.x: SuperAgent routes — auth required; /chat also runs
  // aiConsentGate (P10/P12)
  // ENT-002: AI entitlement check on all SuperAgent routes (before consent gate)
  // AI-004: USSD exclusion on all AI entry points (P12)
  //
  // NOTE: Public /superagent/capabilities and /superagent/compliance/check
  // are registered in register-public-routes.ts BEFORE authMiddleware.
  // -------------------------------------------------------------------------

  // P12: USSD exclusion must run BEFORE authMiddleware for ALL /superagent/* routes
  app.use('/superagent/*', ussdExclusionMiddleware);
  app.use('/superagent/*', authMiddleware);
  app.use('/superagent/*', aiEntitlementMiddleware);
  app.use('/superagent/*', auditLogMiddleware);
  app.route('/superagent', superagentRoutes);
}
