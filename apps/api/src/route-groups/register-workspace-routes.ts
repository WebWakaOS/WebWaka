/**
 * Route Group: Workspace, Profile & Branding Routes
 * ARC-07 router split — Phase 0.5
 */
import type { Hono } from 'hono';
import type { Env } from '../env.js';
import { authMiddleware } from '../middleware/auth.js';
import { auditLogMiddleware } from '../middleware/audit-log.js';
import { billingEnforcementMiddleware } from '../middleware/billing-enforcement.js';
import { workspaceRoutes } from '../routes/workspaces.js';
import {
  workspaceUpgradeRoute,
  workspaceBillingRoute,
} from '../routes/payments.js';
import { themeRoutes } from '../routes/public.js';
import { workspaceVerticalsRoutes } from '../routes/workspace-verticals.js';
import { onboardingRoutes } from '../routes/onboarding.js';
import { profileRoutes } from '../routes/profiles.js';
import { tenantBrandingRoutes } from '../routes/tenant-branding.js';
import { workspaceAnalyticsRoutes } from '../routes/workspace-analytics.js';
// Wave 4 (M11): Pilot feedback widget endpoint
import { pilotFeedbackRoute } from '../routes/pilot-feedback-route.js';

export function registerWorkspaceRoutes(app: Hono<{ Bindings: Env }>): void {
  // -------------------------------------------------------------------------
  // Workspace routes — all require auth
  // -------------------------------------------------------------------------

  app.use('/workspaces/*', authMiddleware);
  app.use('/workspaces/*', auditLogMiddleware);
  app.use('/workspaces/*', billingEnforcementMiddleware);
  app.route('/workspaces', workspaceRoutes);
  app.route('/workspaces', workspaceUpgradeRoute);
  app.route('/workspaces', workspaceBillingRoute);

  // -------------------------------------------------------------------------
  // M8a: Workspace verticals activation — auth required
  // -------------------------------------------------------------------------

  app.use('/workspaces/*/verticals*', authMiddleware);
  app.route('/workspaces', workspaceVerticalsRoutes);

  // -------------------------------------------------------------------------
  // M6: Theme routes — auth required
  // -------------------------------------------------------------------------

  app.use('/themes/*', authMiddleware);
  app.use('/themes/*', auditLogMiddleware);
  app.route('/themes', themeRoutes);

  // -------------------------------------------------------------------------
  // PROD-01: Onboarding checklist routes — auth required
  // -------------------------------------------------------------------------

  app.use('/onboarding/*', authMiddleware);
  app.route('/onboarding', onboardingRoutes);

  // -------------------------------------------------------------------------
  // Profile management — workspace-scoped
  // -------------------------------------------------------------------------

  app.use('/profiles*', authMiddleware);
  app.route('/profiles', profileRoutes);

  // -------------------------------------------------------------------------
  // Tenant branding / white-label configuration
  // -------------------------------------------------------------------------

  app.use('/tenant/branding*', authMiddleware);
  app.use('/tenant/branding*', auditLogMiddleware);
  app.route('/tenant/branding', tenantBrandingRoutes);

  // -------------------------------------------------------------------------
  // P23: Workspace Analytics — tenant-scoped
  // -------------------------------------------------------------------------

  app.use('/analytics/workspace/*', authMiddleware);
  app.route('/analytics/workspace', workspaceAnalyticsRoutes);

  // -------------------------------------------------------------------------
  // Wave 4 (M11): Pilot feedback — auth required, any workspace user
  // POST /workspace/feedback — submit NPS, bug, feature_request, or general
  // -------------------------------------------------------------------------

  app.use('/workspace/feedback*', authMiddleware);
  app.route('/workspace/feedback', pilotFeedbackRoute());
}
