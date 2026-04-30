/**
 * Route Group: Notifications, Inbox & Provider Webhooks
 * ARC-07 router split — Phase 0.5
 */
import type { Hono } from 'hono';
import type { Env } from '../env.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/require-role.js';
import { notificationRoutes } from '../routes/notification-routes.js';
import { inboxRoutes } from '../routes/inbox-routes.js';
import { preferenceRoutes } from '../routes/preference-routes.js';
import { notificationAdminRoutes } from '../routes/notification-admin-routes.js';
import { resendBounceWebhook } from '../routes/resend-bounce-webhook.js';

export function registerNotificationRoutes(app: Hono<{ Bindings: Env }>): void {
  // -------------------------------------------------------------------------
  // Phase 3: Notification Template Management
  // -------------------------------------------------------------------------

  app.use('/notifications/*', authMiddleware);
  app.route('/notifications', notificationRoutes);

  // Phase 5 (N-065, N-066, N-067): Inbox API + Preference Management API.
  app.route('/notifications', inboxRoutes);
  app.route('/notifications', preferenceRoutes);

  // N-105+: Notification admin operations (super_admin only).
  app.use('/notifications/admin/*', requireRole('super_admin'));
  app.route('/notifications', notificationAdminRoutes);

  // N-052 (Phase 4): Resend bounce/delivery webhook (NO auth — provider callback).
  app.route('/provider-webhooks/resend', resendBounceWebhook);
}
