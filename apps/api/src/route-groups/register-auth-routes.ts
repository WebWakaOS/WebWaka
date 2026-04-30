/**
 * Route Group: Authentication, Identity & Entity Routes
 * ARC-07 router split — Phase 0.5
 */
import type { Hono } from 'hono';
import type { Env } from '../env.js';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimitMiddleware, identityRateLimit } from '../middleware/rate-limit.js';
import { auditLogMiddleware } from '../middleware/audit-log.js';
import { billingEnforcementMiddleware } from '../middleware/billing-enforcement.js';
import { authRoutes } from '../routes/auth-routes.js';
import { entityRoutes } from '../routes/entities.js';
import { claimRoutes } from '../routes/claim.js';
import { identityRoutes } from '../routes/identity.js';
import { contactRoutes } from '../routes/contact.js';
import { syncRoutes } from '../routes/sync.js';

export function registerAuthRoutes(app: Hono<{ Bindings: Env }>): void {
  // -------------------------------------------------------------------------
  // Auth routes — /auth/login and /auth/verify are public;
  // /auth/me and other secured auth routes require a valid JWT.
  // -------------------------------------------------------------------------
  app.use('/auth/me', authMiddleware);
  app.use('/auth/profile', authMiddleware);
  app.use('/auth/logout', authMiddleware);
  app.use('/auth/change-password', authMiddleware);
  app.use('/auth/invite', authMiddleware);
  app.use('/auth/invite/*', authMiddleware);
  app.use('/auth/sessions', authMiddleware);
  app.use('/auth/sessions/*', authMiddleware);
  app.use('/auth/send-verification', authMiddleware);
  app.use('/auth/totp/*', authMiddleware);
  // BUG-05 fix: Audit log on authenticated P20 auth sub-routes
  app.use('/auth/invite', auditLogMiddleware);
  app.use('/auth/invite/*', auditLogMiddleware);
  app.use('/auth/sessions', auditLogMiddleware);
  app.use('/auth/sessions/*', auditLogMiddleware);
  app.use('/auth/send-verification', auditLogMiddleware);
  // SEC-03: Rate limiting
  app.use('/auth/login', rateLimitMiddleware({ keyPrefix: 'auth:login', maxRequests: 10, windowSeconds: 300 }));
  app.use('/auth/register', rateLimitMiddleware({ keyPrefix: 'auth:register', maxRequests: 5, windowSeconds: 900 }));
  app.use('/auth/forgot-password', rateLimitMiddleware({ keyPrefix: 'auth:forgot', maxRequests: 5, windowSeconds: 900 }));
  app.use('/auth/reset-password', rateLimitMiddleware({ keyPrefix: 'auth:reset', maxRequests: 5, windowSeconds: 900 }));
  app.use('/auth/change-password', rateLimitMiddleware({ keyPrefix: 'auth:changepw', maxRequests: 10, windowSeconds: 900 }));
  app.use('/auth/profile', rateLimitMiddleware({ keyPrefix: 'auth:profile', maxRequests: 20, windowSeconds: 900 }));
  app.use('/auth/invite', rateLimitMiddleware({ keyPrefix: 'auth:invite', maxRequests: 10, windowSeconds: 900 }));
  app.use('/auth/send-verification', rateLimitMiddleware({ keyPrefix: 'auth:sendverify', maxRequests: 5, windowSeconds: 300 }));
  app.use('/auth/accept-invite', rateLimitMiddleware({ keyPrefix: 'auth:acceptinvite', maxRequests: 10, windowSeconds: 300 }));
  app.use('/auth/verify-email', rateLimitMiddleware({ keyPrefix: 'auth:verifyemail', maxRequests: 10, windowSeconds: 300 }));
  app.route('/auth', authRoutes);

  // -------------------------------------------------------------------------
  // Authenticated entity routes
  // -------------------------------------------------------------------------

  app.use('/entities/*', authMiddleware);
  app.use('/entities/*', auditLogMiddleware);
  app.use('/entities/*', billingEnforcementMiddleware);
  app.route('/entities', entityRoutes);

  // -------------------------------------------------------------------------
  // Claim routes — /claim/status/:profileId is public; others require auth
  // -------------------------------------------------------------------------

  app.use('/claim/intent', authMiddleware);
  app.use('/claim/advance', authMiddleware);
  app.use('/claim/verify', authMiddleware);
  app.use('/claim/intent', auditLogMiddleware);
  app.use('/claim/advance', auditLogMiddleware);
  app.use('/claim/verify', auditLogMiddleware);
  app.use('/claim/intent', billingEnforcementMiddleware);
  app.use('/claim/advance', billingEnforcementMiddleware);
  app.route('/claim', claimRoutes);

  // -------------------------------------------------------------------------
  // M7a: Identity verification routes — auth + rate limit (R5) + audit log
  // -------------------------------------------------------------------------

  app.use('/identity/*', authMiddleware);
  app.use('/identity/*', auditLogMiddleware);
  app.use('/identity/verify-bvn', identityRateLimit);
  app.use('/identity/verify-nin', identityRateLimit);
  app.use('/identity/verify-cac', identityRateLimit);
  app.use('/identity/verify-frsc', identityRateLimit);
  app.route('/identity', identityRoutes);

  // -------------------------------------------------------------------------
  // M7a: Contact channel routes — auth required
  // -------------------------------------------------------------------------

  app.use('/contact/*', authMiddleware);
  app.use('/contact/verify/*', auditLogMiddleware);
  app.route('/contact', contactRoutes);

  // -------------------------------------------------------------------------
  // M7b: Offline sync endpoint — auth required (P11 — server-wins conflict)
  // -------------------------------------------------------------------------

  app.use('/sync/*', authMiddleware);
  app.route('/sync', syncRoutes);
}
