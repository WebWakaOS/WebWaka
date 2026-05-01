/**
 * Route registration (ARC-07 router split)
 *
 * Call registerRoutes(app) once during app initialisation, after registerMiddleware.
 *
 * Phase 0.5 refactor: The monolithic router.ts has been split into domain-grouped
 * registration files under `./route-groups/`. Each file exports a single
 * `registerXxxRoutes(app)` function that handles its domain’s middleware + route
 * mounting. Order matters — public routes first, then auth, then domain routes.
 *
 * Total route groups (9):
 *   1. Public        — Health, discovery, geography, openapi, fx-rates, superagent metadata
 *   2. Auth          — Auth, identity, contact, entities, claim, sync
 *   3. Workspace     — Workspace CRUD, themes, profiles, branding, analytics, onboarding
 *   4. Financial     — POS, payments, billing, bank-transfer, wallet, b2b, airtime
 *   5. Verticals     — All vertical routes (commerce, transport, civic, health, etc.)
 *   6. Social        — Social, community, groups, fundraising, cases, workflows, polls, appeals
 *   7. AI            — SuperAgent multi-turn + tool execution
 *   8. Admin         — Admin dashboard, platform-admin endpoints, regulatory
 *   9. Notifications — Notification templates, inbox, preferences, provider webhooks
 *  10. Platform Feat — Templates, partners, webhooks, compliance, wakapages, image-pipeline, whatsapp
 */

import type { Hono } from 'hono';
import type { Env } from './env.js';
import { errorLogMiddleware } from './middleware/error-log.js';

import { registerPublicRoutes } from './route-groups/register-public-routes.js';
import { registerAuthRoutes } from './route-groups/register-auth-routes.js';
import { registerWorkspaceRoutes } from './route-groups/register-workspace-routes.js';
import { registerFinancialRoutes } from './route-groups/register-financial-routes.js';
import { registerVerticalRoutes } from './route-groups/register-vertical-routes.js';
import { registerVerticalEngineRoutes } from './route-groups/register-vertical-engine-routes.js';
import { registerSocialRoutes } from './route-groups/register-social-routes.js';
import { registerAiRoutes } from './route-groups/register-ai-routes.js';
import { registerAdminRoutes } from './route-groups/register-admin-routes.js';
import { registerNotificationRoutes } from './route-groups/register-notification-routes.js';
import { registerPlatformFeatureRoutes } from './route-groups/register-platform-feature-routes.js';
import { v2Router } from './routes/v2/index.js';

export function registerRoutes(app: Hono<{ Bindings: Env }>): void {
  // -------------------------------------------------------------------------
  // Global middleware (runs on every request)
  // -------------------------------------------------------------------------

  // P20-E: Structured error logging — global, applied before all routes.
  app.use('*', errorLogMiddleware);

  // Phase 6 / ADR-0018: API versioning — add X-API-Version: 1 to every response.
  app.use('*', async (c, next) => {
    await next();
    c.res.headers.set('X-API-Version', '1');
  });

  // -------------------------------------------------------------------------
  // Domain route groups (order matters for Hono middleware resolution)
  // -------------------------------------------------------------------------

  registerPublicRoutes(app);           // 1. Unauthenticated public routes
  registerAuthRoutes(app);             // 2. Auth, identity, entity, claim
  registerWorkspaceRoutes(app);        // 3. Workspace management
  registerFinancialRoutes(app);        // 4. POS, payments, billing, wallet
  registerVerticalRoutes(app);         // 5. All vertical-specific routes (legacy)
  registerVerticalEngineRoutes(app);   // 5b. Vertical-engine routes (NEW - Phase 1)
  registerSocialRoutes(app);           // 6. Social, community, groups
  registerAiRoutes(app);               // 7. SuperAgent / AI
  registerAdminRoutes(app);            // 8. Admin + platform-admin
  registerNotificationRoutes(app);     // 9. Notifications + provider webhooks
  registerPlatformFeatureRoutes(app);  // 10. Templates, partners, compliance, etc.

  // ADR-0018: /v2/ prefix reserved for breaking changes
  app.route('/v2', v2Router);
}
