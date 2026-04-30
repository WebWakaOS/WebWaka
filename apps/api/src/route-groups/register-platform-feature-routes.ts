/**
 * Route Group: Platform Features (Templates, Partners, Compliance, WakaPages, etc.)
 * ARC-07 router split — Phase 0.5
 */
import type { Hono } from 'hono';
import type { Env } from '../env.js';
import { authMiddleware } from '../middleware/auth.js';
import { auditLogMiddleware } from '../middleware/audit-log.js';
import { requireRole } from '../middleware/require-role.js';
import { partnerRoutes } from '../routes/partners.js';
import { templateRoutes } from '../routes/templates.js';
import { complianceRoutes } from '../routes/compliance.js';
import { webhookRoutes } from '../routes/webhooks.js';
import { wakaPageRoutes } from '../routes/wakapage.js';
import { imagePipelineRoutes } from '../routes/image-pipeline.js';
import { whatsappTemplateRoutes } from '../routes/whatsapp-templates.js';

export function registerPlatformFeatureRoutes(app: Hono<{ Bindings: Env }>): void {
  // -------------------------------------------------------------------------
  // M11: Partner & White-Label routes — super_admin only
  // -------------------------------------------------------------------------

  app.use('/partners/*', authMiddleware);
  app.use('/partners/*', requireRole('super_admin'));
  app.use('/partners/*', auditLogMiddleware);
  app.route('/partners', partnerRoutes);

  // -------------------------------------------------------------------------
  // v1.0.1: Template Registry
  // -------------------------------------------------------------------------

  app.use('/templates/installed', authMiddleware);
  app.use('/templates/pending', authMiddleware);
  app.use('/templates/render-overrides', authMiddleware);
  app.use('/templates/render-overrides/*', authMiddleware);
  app.use('/templates/*/install', authMiddleware);
  app.use('/templates/*/upgrade', authMiddleware);
  app.use('/templates/*/purchase', authMiddleware);
  app.use('/templates/*/purchase/verify', authMiddleware);
  app.use('/templates/*/approve', authMiddleware);
  app.use('/templates/*/reject', authMiddleware);
  app.use('/templates/*/deprecate', authMiddleware);
  app.use('/templates/*/audit', authMiddleware);
  app.route('/templates', templateRoutes);

  // -------------------------------------------------------------------------
  // PROD-04: Webhook subscription routes — auth required
  // -------------------------------------------------------------------------

  app.use('/webhooks/*', authMiddleware);
  app.use('/webhooks', authMiddleware);
  app.route('/webhooks', webhookRoutes);

  // -------------------------------------------------------------------------
  // COMP-001 / ENH-039: NDPR DSAR endpoints
  // -------------------------------------------------------------------------

  app.route('/compliance', complianceRoutes);

  // -------------------------------------------------------------------------
  // WakaPage — Phase 1 (ADR-0041)
  // -------------------------------------------------------------------------

  app.use('/wakapages/*', authMiddleware);
  app.use('/wakapages/*', auditLogMiddleware);
  app.route('/wakapages', wakaPageRoutes);

  // -------------------------------------------------------------------------
  // Phase 3 (E23) — Low-Bandwidth Image Pipeline
  // -------------------------------------------------------------------------

  app.use('/image-variants', authMiddleware);
  app.use('/image-variants/*', authMiddleware);
  app.route('/image-variants', imagePipelineRoutes);

  // -------------------------------------------------------------------------
  // Phase 3 (E24) — WhatsApp Business API Template Management
  // -------------------------------------------------------------------------

  app.use('/whatsapp-templates', authMiddleware);
  app.use('/whatsapp-templates/*', authMiddleware);
  app.route('/whatsapp-templates', whatsappTemplateRoutes);
}
