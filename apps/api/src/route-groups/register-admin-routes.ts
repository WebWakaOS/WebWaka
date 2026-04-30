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
}
