/**
 * Route Group: Admin & Platform-Admin Routes
 * ARC-07 router split — Phase 0.5
 */
import type { Hono } from 'hono';
import type { Env } from '../env.js';
import { authMiddleware } from '../middleware/auth.js';
import { auditLogMiddleware } from '../middleware/audit-log.js';
import { requireRole } from '../middleware/require-role.js';
import { adminPublicRoutes } from '../routes/public.js';
import { adminMetricsRoutes } from '../routes/admin-metrics.js';
import { analyticsRoutes } from '../routes/analytics.js';
import { supportRoutes } from '../routes/support.js';
import { platformAdminSettingsRoutes } from '../routes/platform-admin-settings.js';
import { platformAdminBillingRoutes } from '../routes/platform-admin-billing.js';
import { platformAdminVerticalsRoutes } from '../routes/platform-admin-verticals.js';
import { walletAdminRoutes } from '../routes/hl-wallet.js';
import {
  regulatoryVerificationRoutes,
  platformAdminSectorLicensesRoutes,
} from '../routes/regulatory-verification.js';
import hitlRoutes from '../routes/hitl.js';
import trafficShiftRoutes from '../routes/traffic-shift.js';
// Wave 3 (A6-1): Admin AI usage analytics
import { adminAiUsageRoutes } from '../routes/admin-ai-usage.js';
// Wave 4 (M11): Pilot rollout admin routes
import { pilotAdminRoutes } from '../routes/platform-admin-pilots.js';
// Dynamic Configurability & Delegated Governance — Control Plane routes
import { planRoutes } from '../routes/control-plane/plans.js';
import { entitlementRoutes } from '../routes/control-plane/entitlements.js';
import { roleRoutes } from '../routes/control-plane/roles.js';
import { groupRoutes } from '../routes/control-plane/groups.js';
import { flagRoutes } from '../routes/control-plane/flags.js';
import { auditRoutes } from '../routes/control-plane/audit.js';
// BATCH 6: Provider Registry admin routes
import { providerAdminRoutes } from '../routes/admin/providers.js';

export function registerAdminRoutes(app: Hono<{ Bindings: Env }>): void {
  // -------------------------------------------------------------------------
  // SEC-01: Admin dashboard routes now require auth
  // -------------------------------------------------------------------------

  app.use('/admin/*', authMiddleware);
  app.use('/admin/*', auditLogMiddleware);
  app.route('/admin', adminPublicRoutes);
  app.route('/admin', adminMetricsRoutes);
  app.route('/admin/hitl', hitlRoutes);
  app.route('/admin/traffic-shift', trafficShiftRoutes);

  // Wave 3 (A6-1): AI usage analytics for admins/workspace-admins
  app.route('/admin/ai', adminAiUsageRoutes);

  // -------------------------------------------------------------------------
  // P6-A: MED-011 — Platform Analytics (super_admin only)
  // -------------------------------------------------------------------------

  app.use('/platform/analytics/*', authMiddleware);
  app.use('/platform/analytics/*', requireRole('super_admin'));
  app.route('/platform/analytics', analyticsRoutes);

  // -------------------------------------------------------------------------
  // P6-C: MED-013 — Support Ticket System
  // -------------------------------------------------------------------------

  app.use('/support/*', authMiddleware);
  app.use('/support/*', auditLogMiddleware);
  app.route('/support', supportRoutes);
  app.use('/platform/support/*', authMiddleware);
  app.route('/platform/support', supportRoutes);

  // -------------------------------------------------------------------------
  // Platform-admin wallet (super_admin only)
  // -------------------------------------------------------------------------

  app.use('/platform-admin/wallets/*', authMiddleware);
  app.use('/platform-admin/wallets/*', requireRole('super_admin'));
  app.use('/platform-admin/wallets/*', auditLogMiddleware);
  app.route('/platform-admin/wallets', walletAdminRoutes);

  // -------------------------------------------------------------------------
  // Platform admin settings
  // -------------------------------------------------------------------------

  app.use('/platform-admin/settings/*', authMiddleware);
  app.use('/platform-admin/settings/*', requireRole('super_admin'));
  app.use('/platform-admin/settings/*', auditLogMiddleware);
  app.route('/platform-admin/settings', platformAdminSettingsRoutes);

  // -------------------------------------------------------------------------
  // Platform-admin billing
  // -------------------------------------------------------------------------

  app.use('/platform-admin/billing/*', authMiddleware);
  app.use('/platform-admin/billing/*', requireRole('super_admin'));
  app.use('/platform-admin/billing/*', auditLogMiddleware);
  app.route('/platform-admin/billing', platformAdminBillingRoutes);

  // -------------------------------------------------------------------------
  // Platform-admin vertical FSM control — M8b
  // -------------------------------------------------------------------------

  app.use('/platform-admin/verticals/*', authMiddleware);
  app.use('/platform-admin/verticals/*', requireRole('super_admin'));
  app.use('/platform-admin/verticals/*', auditLogMiddleware);
  app.route('/platform-admin/verticals', platformAdminVerticalsRoutes);

  // -------------------------------------------------------------------------
  // Regulatory Verification
  // -------------------------------------------------------------------------

  app.use('/regulatory-verification/*', authMiddleware);
  app.use('/regulatory-verification/*', auditLogMiddleware);
  app.route('/regulatory-verification', regulatoryVerificationRoutes);

  // -------------------------------------------------------------------------
  // Platform-admin sector licence review
  // -------------------------------------------------------------------------

  app.use('/platform-admin/sector-licenses/*', authMiddleware);
  app.use('/platform-admin/sector-licenses/*', requireRole('super_admin'));
  app.use('/platform-admin/sector-licenses/*', auditLogMiddleware);
  app.route('/platform-admin/sector-licenses', platformAdminSectorLicensesRoutes);

  // -------------------------------------------------------------------------
  // Wave 4 (M11): Pilot rollout admin — operators, feature flags, feedback
  // -------------------------------------------------------------------------

  app.use('/platform-admin/pilots/*', authMiddleware);
  app.use('/platform-admin/pilots/*', requireRole('super_admin'));
  app.use('/platform-admin/pilots/*', auditLogMiddleware);
  app.route('/platform-admin/pilots', pilotAdminRoutes());

  // -------------------------------------------------------------------------
  // Dynamic Configurability & Delegated Governance — Control Plane
  // All routes require super_admin and full audit logging.
  // -------------------------------------------------------------------------

  app.use('/platform-admin/cp/*', authMiddleware);
  app.use('/platform-admin/cp/*', requireRole('super_admin'));
  app.use('/platform-admin/cp/*', auditLogMiddleware);

  // Layer 1: Dynamic subscription catalog
  app.route('/platform-admin/cp/plans', planRoutes);

  // Layer 2: Entitlement definitions + package/workspace bindings
  app.route('/platform-admin/cp/entitlements', entitlementRoutes);

  // Layer 3: Custom roles + permission definitions
  app.route('/platform-admin/cp/roles', roleRoutes);

  // Layer 3 cont: User groups + per-user permission overrides
  app.route('/platform-admin/cp/groups', groupRoutes);

  // Layer 5: Feature flags + runtime config + delegation
  app.route('/platform-admin/cp/flags', flagRoutes);

  // Cross-cutting: Governance audit log (read-only)
  app.route('/platform-admin/cp/audit', auditRoutes);

  // BATCH 6: Provider Registry — platform-managed providers + AI key pool
  app.use('/admin/providers*', authMiddleware);
  app.route('/admin/providers', providerAdminRoutes);
}
