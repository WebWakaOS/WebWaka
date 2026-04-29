/**
 * Route registration (ARC-07 index.ts split)
 *
 * Call registerRoutes(app) once during app initialisation, after registerMiddleware.
 * All app.use('/path', ...) and app.route('/path', ...) calls live here.
 */

import type { Hono } from 'hono';
import type { Env } from './env.js';
import { authMiddleware } from './middleware/auth.js';
import { rateLimitMiddleware, identityRateLimit } from './middleware/rate-limit.js';
import { auditLogMiddleware } from './middleware/audit-log.js';
import { billingEnforcementMiddleware } from './middleware/billing-enforcement.js';
import { ussdExclusionMiddleware } from './middleware/ussd-exclusion.js';
import { aiEntitlementMiddleware } from './middleware/ai-entitlement.js';
import { requireEntitlement } from './middleware/entitlement.js';
import { requireRole } from './middleware/require-role.js';
import { PlatformLayer } from '@webwaka/types';
import { assertDMMasterKey } from '@webwaka/social';
import { healthRoutes, API_VERSION } from './routes/health.js';
import { geographyRoutes } from './routes/geography.js';
import { entityRoutes } from './routes/entities.js';
import { authRoutes } from './routes/auth-routes.js';
import { discoveryRoutes } from './routes/discovery.js';
import { claimRoutes } from './routes/claim.js';
import { workspaceRoutes } from './routes/workspaces.js';
import {
  workspaceUpgradeRoute,
  workspaceBillingRoute,
  paymentsVerifyRoute,
  paymentsMethodRoute,
} from './routes/payments.js';
import { publicRoutes, adminPublicRoutes, themeRoutes } from './routes/public.js';
import { identityRoutes } from './routes/identity.js';
import { contactRoutes } from './routes/contact.js';
import { syncRoutes } from './routes/sync.js';
import { posRoutes } from './routes/pos.js';
import { communityRoutes } from './routes/community.js';
import { socialRoutes } from './routes/social.js';
import { airtimeRoutes } from './routes/airtime.js';
import { verticalsRoutes } from './routes/verticals.js';
import { workspaceVerticalsRoutes } from './routes/workspace-verticals.js';
import { superagentRoutes } from './routes/superagent.js';
import {
  isSensitiveVertical,
  getSensitiveSector,
  preProcessCheck,
  listCapabilities,
} from '@webwaka/superagent';
import { politicianRoutes } from './routes/politician.js';
import { posBusinessRoutes } from './routes/pos-business.js';
import { transportRoutes } from './routes/transport.js';
import { civicRoutes } from './routes/civic.js';
import { commerceRoutes } from './routes/commerce.js';
import { commerceP2Routes } from './routes/verticals-commerce-p2.js';
import { commerceP2Batch2Routes } from './routes/verticals-commerce-p2-batch2.js';
import { commerceP3Routes } from './routes/verticals-commerce-p3.js';
import { transportExtendedRoutes } from './routes/verticals-transport-extended.js';
import { civicExtendedRoutes } from './routes/verticals-civic-extended.js';
import healthExtendedRoutes from './routes/verticals-health-extended.js';
import profCreatorExtendedRoutes from './routes/verticals-prof-creator-extended.js';
import financialPlaceMediaInstitutionalRoutes from './routes/verticals-financial-place-media-institutional-extended.js';
import { setJExtendedRouter } from './routes/verticals-set-j-extended.js';
import { negotiationRouter } from './routes/negotiation.js';
import { partnerRoutes } from './routes/partners.js';
import { templateRoutes } from './routes/templates.js';
import { complianceRoutes } from './routes/compliance.js';
import {
  regulatoryVerificationRoutes,
  platformAdminSectorLicensesRoutes,
} from './routes/regulatory-verification.js';
import { webhookRoutes } from './routes/webhooks.js';
import { resendBounceWebhook } from './routes/resend-bounce-webhook.js';
import { openapiRoutes, swaggerRoutes } from './routes/openapi.js';
import { onboardingRoutes } from './routes/onboarding.js';
import { billingRoutes } from './routes/billing.js';
import { analyticsRoutes } from './routes/analytics.js';
import { supportRoutes } from './routes/support.js';
import eduAgriExtendedRoutes from './routes/verticals-edu-agri-extended.js';
import { adminMetricsRoutes } from './routes/admin-metrics.js';
import { errorLogMiddleware } from './middleware/error-log.js';
import { bankTransferRoutes } from './routes/bank-transfer.js';
import { walletRoutes, walletAdminRoutes } from './routes/hl-wallet.js';
import { workspaceAnalyticsRoutes } from './routes/workspace-analytics.js';
import { fxRatesRoutes } from './routes/fx-rates.js';
import { b2bMarketplaceRoutes } from './routes/b2b-marketplace.js';
import { emailVerificationEnforcement } from './middleware/email-verification.js';
import { notificationRoutes } from './routes/notification-routes.js';
import { inboxRoutes } from './routes/inbox-routes.js';
import { preferenceRoutes } from './routes/preference-routes.js';
import { notificationAdminRoutes } from './routes/notification-admin-routes.js';
import { platformAdminSettingsRoutes } from './routes/platform-admin-settings.js';
import { platformAdminBillingRoutes } from './routes/platform-admin-billing.js';
import { platformAdminVerticalsRoutes } from './routes/platform-admin-verticals.js';
import { tenantBrandingRoutes } from './routes/tenant-branding.js';
import { profileRoutes } from './routes/profiles.js';
import { wakaPageRoutes } from './routes/wakapage.js';
import { supportGroupRoutes } from './routes/support-groups.js';
import { groupRoutes } from './routes/groups.js';
import { casesRoutes } from './routes/cases.js';
import { fundraisingRoutes } from './routes/fundraising.js';
import { duesRoutes } from './routes/dues.js';
import { mutualAidRoutes } from './routes/mutual-aid.js';
import { workflowRoutes } from './routes/workflows.js';
import { phase2AnalyticsRoutes } from './routes/phase2-analytics.js';
import { pollsRoutes } from './routes/polls.js';
import { communityReportRoutes } from './routes/community-reports.js';
import { imagePipelineRoutes } from './routes/image-pipeline.js';
import { whatsappTemplateRoutes } from './routes/whatsapp-templates.js';
import { appealsRoutes } from './routes/appeals.js';
import { developerRoutes } from './routes/developer.js';

export function registerRoutes(app: Hono<{ Bindings: Env }>): void {
  // -------------------------------------------------------------------------
  // P20-E: Structured error logging — global, applied before all routes.
  // Emits a JSON log line for every 4xx/5xx response across the entire API.
  // (BUG-B fix: was incorrectly scoped to /admin/* only)
  // -------------------------------------------------------------------------
  app.use('*', errorLogMiddleware);

  // -------------------------------------------------------------------------
  // Phase 6 / ADR-0018: API versioning — add X-API-Version: 1 to every
  // response so external consumers can detect the API version at runtime.
  // -------------------------------------------------------------------------
  app.use('*', async (c, next) => {
    await next();
    c.res.headers.set('X-API-Version', '1');
  });

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
  // Auth routes — /auth/login and /auth/verify are public;
  // /auth/me and other secured auth routes require a valid JWT.
  // /auth/refresh is now handled by opaque refresh token (BUG-004) — no authMiddleware needed.
  // -------------------------------------------------------------------------
  app.use('/auth/me', authMiddleware);
  app.use('/auth/profile', authMiddleware);
  app.use('/auth/logout', authMiddleware);
  app.use('/auth/change-password', authMiddleware);
  // P20-A: Invitation management — admin-only (role check is inside the route handler)
  app.use('/auth/invite', authMiddleware);
  app.use('/auth/invite/*', authMiddleware);
  // P20-B: Session management — requires auth (revocation checked in route handlers)
  app.use('/auth/sessions', authMiddleware);
  app.use('/auth/sessions/*', authMiddleware);
  // P20-C: Send-verification requires auth; /auth/verify-email is public (token-based)
  app.use('/auth/send-verification', authMiddleware);
  // BUG-038 / ENH-034: TOTP enrolment and management — super_admin only (role check inside handlers)
  app.use('/auth/totp/*', authMiddleware);
  // BUG-05 fix: Audit log on authenticated P20 auth sub-routes
  app.use('/auth/invite', auditLogMiddleware);
  app.use('/auth/invite/*', auditLogMiddleware);
  app.use('/auth/sessions', auditLogMiddleware);
  app.use('/auth/sessions/*', auditLogMiddleware);
  app.use('/auth/send-verification', auditLogMiddleware);
  // SEC-03: Login-specific rate limiting — 10 attempts per 5 minutes per IP
  app.use('/auth/login', rateLimitMiddleware({ keyPrefix: 'auth:login', maxRequests: 10, windowSeconds: 300 }));
  // SEC-03b: Registration rate limiting — 5 signups per 15 minutes per IP
  app.use('/auth/register', rateLimitMiddleware({ keyPrefix: 'auth:register', maxRequests: 5, windowSeconds: 900 }));
  // SEC-03c: Password reset rate limiting — 5 requests per 15 minutes per IP
  app.use('/auth/forgot-password', rateLimitMiddleware({ keyPrefix: 'auth:forgot', maxRequests: 5, windowSeconds: 900 }));
  app.use('/auth/reset-password', rateLimitMiddleware({ keyPrefix: 'auth:reset', maxRequests: 5, windowSeconds: 900 }));
  // SEC-03d: Change-password rate limiting — 10 attempts per 15 minutes per user
  app.use('/auth/change-password', rateLimitMiddleware({ keyPrefix: 'auth:changepw', maxRequests: 10, windowSeconds: 900 }));
  // SEC-03e: Profile update rate limiting — 20 updates per 15 minutes per user
  app.use('/auth/profile', rateLimitMiddleware({ keyPrefix: 'auth:profile', maxRequests: 20, windowSeconds: 900 }));
  // SEC-03f: Invite rate limiting — 10 invites per 15 minutes per admin user
  app.use('/auth/invite', rateLimitMiddleware({ keyPrefix: 'auth:invite', maxRequests: 10, windowSeconds: 900 }));
  // SEC-03g: Verification email rate limiting — handled by KV throttle inside handler + global limiter
  app.use('/auth/send-verification', rateLimitMiddleware({ keyPrefix: 'auth:sendverify', maxRequests: 5, windowSeconds: 300 }));
  // BUG-04 fix: Rate-limit public token endpoints — defense-in-depth against token probing
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
  // Workspace routes — all require auth
  // -------------------------------------------------------------------------

  app.use('/workspaces/*', authMiddleware);
  app.use('/workspaces/*', auditLogMiddleware);
  app.use('/workspaces/*', billingEnforcementMiddleware);
  app.route('/workspaces', workspaceRoutes);
  app.route('/workspaces', workspaceUpgradeRoute);
  app.route('/workspaces', workspaceBillingRoute);

  // -------------------------------------------------------------------------
  // M6: Payment verification route — auth required
  // -------------------------------------------------------------------------

  app.use('/payments/*', authMiddleware);
  app.use('/payments/*', auditLogMiddleware);
  app.route('/payments', paymentsVerifyRoute);
  app.route('/payments', paymentsMethodRoute);

  // -------------------------------------------------------------------------
  // M6: Public tenant routes — no auth required
  // -------------------------------------------------------------------------

  app.route('/public', publicRoutes);

  // SEC-01: Admin dashboard routes now require auth to prevent data leakage.
  app.use('/admin/*', authMiddleware);
  app.use('/admin/*', auditLogMiddleware);
  app.route('/admin', adminPublicRoutes);
  // P20-E: Admin metrics endpoint (admin/super_admin role enforced inside handler)
  app.route('/admin', adminMetricsRoutes);

  // -------------------------------------------------------------------------
  // M6: Theme routes — auth required
  // -------------------------------------------------------------------------

  app.use('/themes/*', authMiddleware);
  app.use('/themes/*', auditLogMiddleware);
  app.route('/themes', themeRoutes);

  // -------------------------------------------------------------------------
  // M7a: Identity verification routes — auth + rate limit (R5) + audit log
  // -------------------------------------------------------------------------

  app.use('/identity/*', authMiddleware);
  app.use('/identity/*', auditLogMiddleware);
  app.use('/identity/verify-bvn', identityRateLimit);
  app.use('/identity/verify-nin', identityRateLimit);
  // BUG-RATE-02: CAC and FRSC lookups hit paid external APIs — apply the same
  // rate limit (R5 pattern) that BVN/NIN already have to prevent abuse.
  app.use('/identity/verify-cac', identityRateLimit);
  app.use('/identity/verify-frsc', identityRateLimit);
  app.route('/identity', identityRoutes);

  // -------------------------------------------------------------------------
  // M7a: Contact channel routes — auth required (R9/R10 enforced in route handler)
  // -------------------------------------------------------------------------

  app.use('/contact/*', authMiddleware);
  app.use('/contact/verify/*', auditLogMiddleware);
  app.route('/contact', contactRoutes);

  // -------------------------------------------------------------------------
  // M7b: Offline sync endpoint — auth required (P11 — server-wins conflict)
  // -------------------------------------------------------------------------

  app.use('/sync/*', authMiddleware);
  app.route('/sync', syncRoutes);

  // -------------------------------------------------------------------------
  // M7b: POS terminal + float ledger routes — auth required (P9/T3/T4)
  // -------------------------------------------------------------------------

  app.use('/pos/*', authMiddleware);
  // F-001 fix: POS float + terminal routes require Operational plan (starter+).
  // Prevents free-tier tenants from accessing agent float ledger and terminal APIs.
  app.use('/pos/*', requireEntitlement(PlatformLayer.Operational));
  app.use('/pos/*', auditLogMiddleware);
  app.route('/pos', posRoutes);

  // -------------------------------------------------------------------------
  // M7c: Community routes — join requires auth (P10 NDPR), reads are public (T3)
  // -------------------------------------------------------------------------

  app.use('/community/join', authMiddleware);
  app.use('/community/channels/*/posts', authMiddleware);
  app.use('/community/lessons/*/progress', authMiddleware);
  app.use('/community/events/*/rsvp', authMiddleware);
  app.route('/community', communityRoutes);

  // -------------------------------------------------------------------------
  // M7e: Airtime top-up routes — auth required (P2/P9/T3/T4, KYC Tier 1, rate limit)
  // -------------------------------------------------------------------------

  app.use('/airtime/*', authMiddleware);
  app.use('/airtime/*', auditLogMiddleware);
  app.route('/airtime', airtimeRoutes);

  // -------------------------------------------------------------------------
  // M8a: Verticals registry routes — public (no auth required)
  // -------------------------------------------------------------------------

  app.route('/verticals', verticalsRoutes);

  // -------------------------------------------------------------------------
  // M8a: Workspace verticals activation — auth required
  // -------------------------------------------------------------------------

  app.use('/workspaces/*/verticals*', authMiddleware);
  app.route('/workspaces', workspaceVerticalsRoutes);

  // -------------------------------------------------------------------------
  // SA-2.x / SA-3.x: SuperAgent routes — auth required; /chat also runs aiConsentGate (P10/P12)
  // ENT-002: AI entitlement check on all SuperAgent routes (before consent gate)
  // AI-004: USSD exclusion on all AI entry points (P12)
  // -------------------------------------------------------------------------

  // SA-2.3 / Task #3: /superagent/capabilities is a PUBLIC metadata endpoint.
  // Returns the full capability catalogue (displayName, description, pillar, planTier)
  // for all 23 AICapabilityType values. No user data accessed; registered before
  // authMiddleware so workspace-apps and partner portals can call it without a JWT.
  app.get('/superagent/capabilities', (c) => {
    return c.json({ capabilities: listCapabilities() });
  });

  // SA-4.5: /superagent/compliance/check is a PUBLIC metadata endpoint.
  // It returns vertical sensitivity + HITL requirements with no user data access.
  // Registered BEFORE authMiddleware so smoke tests / partner portals can call it
  // without a JWT. Hono matches the most-specific route first.
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

  // P12: USSD exclusion must run BEFORE authMiddleware for ALL /superagent/* routes
  // so USSD sessions are rejected with 503 before JWT validation is attempted.
  // Previously this was only applied specifically to /superagent/chat (pre-auth)
  // and then duplicated on /superagent/* (post-auth), meaning:
  //   - /chat: correctly blocked before auth (by the specific registration), but
  //     middleware ran twice (harmless, but wasteful).
  //   - other /superagent/* routes: USSD sessions were not blocked until AFTER
  //     authMiddleware, so an authenticated USSD request could slip past auth
  //     before being stopped — the wrong order.
  // Fix: register ussdExclusionMiddleware once, on /superagent/*, before authMiddleware.
  app.use('/superagent/*', ussdExclusionMiddleware);
  app.use('/superagent/*', authMiddleware);
  app.use('/superagent/*', aiEntitlementMiddleware);
  app.use('/superagent/*', auditLogMiddleware);
  app.route('/superagent', superagentRoutes);

  // -------------------------------------------------------------------------
  // M8b: Politician vertical routes — auth + Political entitlement required
  // -------------------------------------------------------------------------

  app.use('/politician/*', authMiddleware);
  app.use('/politician', authMiddleware);
  app.use('/politician/*', requireEntitlement(PlatformLayer.Political));
  app.use('/politician', requireEntitlement(PlatformLayer.Political));
  app.route('/politician', politicianRoutes);

  // -------------------------------------------------------------------------
  // M8b: POS Business vertical routes — auth + Commerce entitlement required
  // -------------------------------------------------------------------------

  app.use('/pos-business/*', authMiddleware);
  app.use('/pos-business', authMiddleware);
  app.use('/pos-business/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/pos-business', requireEntitlement(PlatformLayer.Commerce));
  app.route('/pos-business', posBusinessRoutes);

  // -------------------------------------------------------------------------
  // M8c: Transport vertical routes — auth required (T3, P9, P12)
  // -------------------------------------------------------------------------

  app.use('/transport/*', authMiddleware);
  app.use('/transport', authMiddleware);
  app.use('/transport/*', requireEntitlement(PlatformLayer.Transport));
  app.use('/transport', requireEntitlement(PlatformLayer.Transport));
  app.route('/transport', transportRoutes);

  // -------------------------------------------------------------------------
  // M8d: Civic vertical routes — auth required (T3, P9, P13)
  // -------------------------------------------------------------------------

  app.use('/civic/*', authMiddleware);
  app.use('/civic', authMiddleware);
  app.use('/civic/*', requireEntitlement(PlatformLayer.Civic));
  app.use('/civic', requireEntitlement(PlatformLayer.Civic));
  app.route('/civic', civicRoutes);

  // -------------------------------------------------------------------------
  // M8e: Commerce vertical routes — auth required (T3, P9, P13)
  // -------------------------------------------------------------------------

  app.use('/commerce/*', authMiddleware);
  app.use('/commerce', authMiddleware);
  app.use('/commerce/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/commerce', requireEntitlement(PlatformLayer.Commerce));
  app.route('/commerce', commerceRoutes);

  // -------------------------------------------------------------------------
  // M9: Commerce P2 Batch 1 vertical routes — auth + Commerce entitlement (T3, P9, P10, P12, P13)
  // Verticals: auto-mechanic, bakery, beauty-salon, bookshop, catering,
  //            cleaning-service, electronics-repair, florist, food-vendor
  // ENT-006: Commerce entitlement added S14 — consistent with P1 /commerce/* and /pos-business/*
  // -------------------------------------------------------------------------

  app.use('/auto-mechanic/*', authMiddleware);
  app.use('/bakery/*', authMiddleware);
  app.use('/beauty-salon/*', authMiddleware);
  app.use('/bookshop/*', authMiddleware);
  app.use('/catering/*', authMiddleware);
  app.use('/cleaning-service/*', authMiddleware);
  app.use('/electronics-repair/*', authMiddleware);
  app.use('/florist/*', authMiddleware);
  app.use('/food-vendor/*', authMiddleware);
  app.use('/auto-mechanic/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/bakery/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/beauty-salon/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/bookshop/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/catering/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/cleaning-service/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/electronics-repair/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/florist/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/food-vendor/*', requireEntitlement(PlatformLayer.Commerce));
  app.route('/', commerceP2Routes);

  // -------------------------------------------------------------------------
  // Commerce P2 Batch 2 (M9/M10): 12 verticals — auth + Commerce entitlement
  // ENT-006: Commerce entitlement added S14
  // -------------------------------------------------------------------------

  app.use('/construction/*', authMiddleware);
  app.use('/fuel-station/*', authMiddleware);
  app.use('/print-shop/*', authMiddleware);
  app.use('/property-developer/*', authMiddleware);
  app.use('/real-estate-agency/*', authMiddleware);
  app.use('/restaurant-chain/*', authMiddleware);
  app.use('/security-company/*', authMiddleware);
  app.use('/solar-installer/*', authMiddleware);
  app.use('/spa/*', authMiddleware);
  app.use('/tailor/*', authMiddleware);
  app.use('/travel-agent/*', authMiddleware);
  app.use('/welding-fabrication/*', authMiddleware);
  app.use('/construction/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/fuel-station/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/print-shop/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/property-developer/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/real-estate-agency/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/restaurant-chain/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/security-company/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/solar-installer/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/spa/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/tailor/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/travel-agent/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/welding-fabrication/*', requireEntitlement(PlatformLayer.Commerce));
  app.route('/', commerceP2Batch2Routes);

  // -------------------------------------------------------------------------
  // Commerce P3 (M10/M11/M12): 15 verticals — auth + Commerce entitlement (T3, P9, P12, P13)
  // ENT-006: Commerce entitlement added S14
  // -------------------------------------------------------------------------

  app.use('/api/v1/artisanal-mining/*', authMiddleware);
  app.use('/api/v1/borehole-driller/*', authMiddleware);
  app.use('/api/v1/building-materials/*', authMiddleware);
  app.use('/api/v1/car-wash/*', authMiddleware);
  app.use('/api/v1/cleaning-company/*', authMiddleware);
  app.use('/api/v1/electrical-fittings/*', authMiddleware);
  app.use('/api/v1/generator-dealer/*', authMiddleware);
  app.use('/api/v1/hair-salon/*', authMiddleware);
  app.use('/api/v1/petrol-station/*', authMiddleware);
  app.use('/api/v1/phone-repair-shop/*', authMiddleware);
  app.use('/api/v1/shoemaker/*', authMiddleware);
  app.use('/api/v1/sole-trader/*', authMiddleware);
  app.use('/api/v1/spare-parts/*', authMiddleware);
  app.use('/api/v1/tyre-shop/*', authMiddleware);
  app.use('/api/v1/used-car-dealer/*', authMiddleware);
  app.use('/api/v1/water-vendor/*', authMiddleware);
  app.use('/api/v1/artisanal-mining/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/api/v1/borehole-driller/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/api/v1/building-materials/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/api/v1/car-wash/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/api/v1/cleaning-company/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/api/v1/electrical-fittings/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/api/v1/generator-dealer/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/api/v1/hair-salon/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/api/v1/petrol-station/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/api/v1/phone-repair-shop/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/api/v1/shoemaker/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/api/v1/sole-trader/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/api/v1/spare-parts/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/api/v1/tyre-shop/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/api/v1/used-car-dealer/*', requireEntitlement(PlatformLayer.Commerce));
  app.use('/api/v1/water-vendor/*', requireEntitlement(PlatformLayer.Commerce));
  app.route('/api/v1', commerceP3Routes);

  // -------------------------------------------------------------------------
  // M8d/M11/M12: Civic Extended — 10 verticals
  // -------------------------------------------------------------------------

  app.use('/api/v1/mosque/*', authMiddleware);
  app.use('/api/v1/youth-organization/*', authMiddleware);
  app.use('/api/v1/womens-association/*', authMiddleware);
  app.use('/api/v1/waste-management/*', authMiddleware);
  app.use('/api/v1/book-club/*', authMiddleware);
  app.use('/api/v1/professional-association/*', authMiddleware);
  app.use('/api/v1/sports-club/*', authMiddleware);
  app.use('/api/v1/campaign-office/*', authMiddleware);
  app.use('/api/v1/constituency-office/*', authMiddleware);
  app.use('/api/v1/ward-rep/*', authMiddleware);
  app.use('/api/v1/ngo/*', authMiddleware);
  app.route('/api/v1', civicExtendedRoutes);

  // -------------------------------------------------------------------------
  // M9/M12: Transport Extended — 8 verticals
  // -------------------------------------------------------------------------

  app.use('/api/v1/clearing-agent/*', authMiddleware);
  app.use('/api/v1/courier/*', authMiddleware);
  app.use('/api/v1/dispatch-rider/*', authMiddleware);
  app.use('/api/v1/airport-shuttle/*', authMiddleware);
  app.use('/api/v1/cargo-truck/*', authMiddleware);
  app.use('/api/v1/container-depot/*', authMiddleware);
  app.use('/api/v1/ferry/*', authMiddleware);
  app.use('/api/v1/nurtw/*', authMiddleware);
  app.use('/api/v1/road-transport-union/*', authMiddleware);
  app.route('/api/v1', transportExtendedRoutes);

  // -------------------------------------------------------------------------
  // M9–M12: Education + Agricultural Extended — 14 verticals
  // L3 HITL mandatory: creche (all AI — child safeguarding)
  // P13: private-school/creche — no child PII to AI; aggregate counts only
  // cocoa-exporter — mandatory Tier 3 KYC; cold-room — integer millidegrees
  // -------------------------------------------------------------------------

  app.use('/api/v1/driving-school/*', authMiddleware);
  app.use('/api/v1/training-institute/*', authMiddleware);
  app.use('/api/v1/creche/*', authMiddleware);
  app.use('/api/v1/private-school/*', authMiddleware);
  app.use('/api/v1/agro-input/*', authMiddleware);
  app.use('/api/v1/cold-room/*', authMiddleware);
  app.use('/api/v1/abattoir/*', authMiddleware);
  app.use('/api/v1/cassava-miller/*', authMiddleware);
  app.use('/api/v1/cocoa-exporter/*', authMiddleware);
  app.use('/api/v1/fish-market/*', authMiddleware);
  app.use('/api/v1/food-processing/*', authMiddleware);
  app.use('/api/v1/palm-oil/*', authMiddleware);
  app.use('/api/v1/vegetable-garden/*', authMiddleware);
  app.use('/api/v1/produce-aggregator/*', authMiddleware);
  app.route('/api/v1', eduAgriExtendedRoutes);

  // -------------------------------------------------------------------------
  // M9–M12: Health Extended — 6 verticals
  // P13: clinical/patient/animal/resident PII never leaves vertical boundary
  // L3 HITL mandatory for rehab-centre ALL AI; L3 HITL for patient-adjacent AI
  // -------------------------------------------------------------------------

  app.use('/api/v1/dental-clinic/*', authMiddleware);
  app.use('/api/v1/sports-academy/*', authMiddleware);
  app.use('/api/v1/vet-clinic/*', authMiddleware);
  app.use('/api/v1/community-health/*', authMiddleware);
  app.use('/api/v1/elderly-care/*', authMiddleware);
  app.use('/api/v1/rehab-centre/*', authMiddleware);
  app.route('/api/v1', healthExtendedRoutes);

  // -------------------------------------------------------------------------
  // M9–M12: Professional + Creator Extended — 11 verticals
  // P13: L3 HITL mandatory for law-firm, funeral-home, tax-consultant ALL AI calls
  // -------------------------------------------------------------------------

  app.use('/api/v1/accounting-firm/*', authMiddleware);
  app.use('/api/v1/event-planner/*', authMiddleware);
  app.use('/api/v1/law-firm/*', authMiddleware);
  app.use('/api/v1/funeral-home/*', authMiddleware);
  app.use('/api/v1/pr-firm/*', authMiddleware);
  app.use('/api/v1/tax-consultant/*', authMiddleware);
  app.use('/api/v1/wedding-planner/*', authMiddleware);
  app.use('/api/v1/music-studio/*', authMiddleware);
  app.use('/api/v1/photography-studio/*', authMiddleware);
  app.use('/api/v1/recording-label/*', authMiddleware);
  app.use('/api/v1/talent-agency/*', authMiddleware);
  app.route('/api/v1', profCreatorExtendedRoutes);

  // -------------------------------------------------------------------------
  // M12/M11/M10/M9: Financial + Place + Media + Institutional Extended — 13 verticals
  // P9/T3/P12/P13 enforced; CBN daily caps; FX integer rates; scaled water integers
  // L3 HITL mandatory: government-agency (all AI), polling-unit (all AI),
  //   podcast-studio (BROADCAST_SCHEDULING only); L2 for others; L1 community-hall
  // -------------------------------------------------------------------------

  app.use('/api/v1/airtime-reseller/*', authMiddleware);
  app.use('/api/v1/bureau-de-change/*', authMiddleware);
  app.use('/api/v1/hire-purchase/*', authMiddleware);
  app.use('/api/v1/mobile-money-agent/*', authMiddleware);
  app.use('/api/v1/insurance-agent/*', authMiddleware);
  app.use('/api/v1/savings-group/*', authMiddleware);
  app.use('/api/v1/event-hall/*', authMiddleware);
  app.use('/api/v1/water-treatment/*', authMiddleware);
  app.use('/api/v1/community-hall/*', authMiddleware);
  app.use('/api/v1/events-centre/*', authMiddleware);
  app.use('/api/v1/tech-hub/*', authMiddleware);
  app.use('/api/v1/advertising-agency/*', authMiddleware);
  app.use('/api/v1/newspaper-dist/*', authMiddleware);
  app.use('/api/v1/podcast-studio/*', authMiddleware);
  app.use('/api/v1/community-radio/*', authMiddleware);
  app.use('/api/v1/government-agency/*', authMiddleware);
  app.use('/api/v1/polling-unit/*', authMiddleware);
  app.route('/api/v1', financialPlaceMediaInstitutionalRoutes);

  // -------------------------------------------------------------------------
  // Set J Extended — 27 verticals (migrations 0154–0180, M12)
  // P13 enforcement notes:
  //   orphanage       — L3 HITL ALL; child_ref_id prohibited at route layer
  //   nursery-school  — P13 highest; no child_ref_id; aggregate counts only
  //   okada-keke      — Lagos 2022 okada ban check at profile creation
  //   oil-gas-services — dual-gate FSM: ncdmb_certified → dpr_registered
  // -------------------------------------------------------------------------

  app.use('/api/v1/verticals/*', authMiddleware);
  app.route('/api/v1/verticals', setJExtendedRouter);

  // -------------------------------------------------------------------------
  // Negotiable Pricing — platform-wide (additive, not disruptive)
  // P9: All monetary values INTEGER kobo. Discounts INTEGER bps. No floats.
  // T3: tenant_id from auth context only — never from request body.
  // SECURITY: min_price_kobo is never serialised into any API response.
  // -------------------------------------------------------------------------

  app.use('/api/v1/negotiation/*', authMiddleware);
  app.use('/api/v1/negotiation/*', auditLogMiddleware);
  app.route('/api/v1/negotiation', negotiationRouter);

  // -------------------------------------------------------------------------
  // M7c: Social routes — most require auth; /social/profile/:handle is public
  // P14 — assert DM_MASTER_KEY is present at startup before routes are wired.
  // -------------------------------------------------------------------------

  app.use('/social/*', async (c, next) => {
    if (c.req.path.includes('/dm/threads')) {
      assertDMMasterKey(c.env.DM_MASTER_KEY);
    }
    await next();
  });
  app.use('/social/profile/setup', authMiddleware);
  app.use('/social/follow/*', authMiddleware);
  app.use('/social/feed', authMiddleware);
  app.use('/social/posts', authMiddleware);
  app.use('/social/posts/*/react', authMiddleware);
  app.use('/social/dm/*', authMiddleware);
  app.use('/social/stories', authMiddleware);
  app.route('/social', socialRoutes);

  // -------------------------------------------------------------------------
  // M11: Partner & White-Label routes — super_admin only
  // Governance: partner-and-subpartner-model.md Phase 1+2
  // -------------------------------------------------------------------------

  app.use('/partners/*', authMiddleware);
  app.use('/partners/*', requireRole('super_admin'));
  app.use('/partners/*', auditLogMiddleware);
  app.route('/partners', partnerRoutes);

  // -------------------------------------------------------------------------
  // v1.0.1: Template Registry
  // GET /templates and GET /templates/:slug are public.
  // POST /templates requires super_admin.
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
  // PROD-04: Webhook subscription routes — auth required (T3 enforced in handlers)
  // -------------------------------------------------------------------------

  app.use('/webhooks/*', authMiddleware);
  app.use('/webhooks', authMiddleware);
  app.route('/webhooks', webhookRoutes);

  // -------------------------------------------------------------------------
  // PROD-01: Onboarding checklist routes — auth required
  // -------------------------------------------------------------------------

  app.use('/onboarding/*', authMiddleware);
  app.route('/onboarding', onboardingRoutes);

  // -------------------------------------------------------------------------
  // PROD-09: Billing enforcement routes — auth required
  // -------------------------------------------------------------------------

  app.use('/billing/*', authMiddleware);
  app.use('/billing/*', auditLogMiddleware);
  app.route('/billing', billingRoutes);

  // -------------------------------------------------------------------------
  // P6-A: MED-011 — Platform Analytics (super_admin only)
  // requireRole enforced at router level (middleware layer) — defense-in-depth
  // alongside per-handler role checks inside the route handlers.
  // -------------------------------------------------------------------------

  app.use('/platform/analytics/*', authMiddleware);
  app.use('/platform/analytics/*', requireRole('super_admin'));
  app.route('/platform/analytics', analyticsRoutes);

  // -------------------------------------------------------------------------
  // P6-C: MED-013 — Support Ticket System
  // Tenant-scoped + super_admin cross-tenant view
  // -------------------------------------------------------------------------

  app.use('/support/*', authMiddleware);
  app.use('/support/*', auditLogMiddleware);
  app.route('/support', supportRoutes);

  // Platform-wide support view (super_admin only)
  app.use('/platform/support/*', authMiddleware);
  app.route('/platform/support', supportRoutes);

  // -------------------------------------------------------------------------
  // P21: Bank Transfer Payment — auth + email verification required (T007/T008)
  // Email verification enforcement: blocks unverified users after enforcement date.
  // Audit trail mandatory for all payment state transitions.
  // -------------------------------------------------------------------------

  app.use('/bank-transfer/*', authMiddleware);
  app.use('/bank-transfer/*', emailVerificationEnforcement);
  app.use('/bank-transfer/*', auditLogMiddleware);
  app.route('/bank-transfer', bankTransferRoutes);

  // -------------------------------------------------------------------------
  // HandyLife Wallet — user-level NGN wallet (WF-001 – WF-056)
  // T3: tenant_id from JWT — all routes internally tenant-scoped.
  // T5: assertTenantEligible() inside each handler — gated by KV allowlist.
  // P9: all amounts validated as integer kobo in handlers.
  // Super admin routes: /platform-admin/wallets/* (requireRole inside)
  // -------------------------------------------------------------------------

  app.use('/wallet/*', authMiddleware);
  app.use('/wallet/*', auditLogMiddleware);
  app.route('/wallet', walletRoutes);

  app.use('/platform-admin/wallets/*', authMiddleware);
  app.use('/platform-admin/wallets/*', requireRole('super_admin'));
  app.use('/platform-admin/wallets/*', auditLogMiddleware);
  app.route('/platform-admin/wallets', walletAdminRoutes);

  // -------------------------------------------------------------------------
  // Platform admin settings — payment bank account, platform configuration
  // Super admin only; all routes require auth + super_admin role + audit log.
  //   GET  /platform-admin/settings/payment  — read platform bank account
  //   PATCH /platform-admin/settings/payment — update platform bank account (KV)
  // -------------------------------------------------------------------------

  app.use('/platform-admin/settings/*', authMiddleware);
  app.use('/platform-admin/settings/*', requireRole('super_admin'));
  app.use('/platform-admin/settings/*', auditLogMiddleware);
  app.route('/platform-admin/settings', platformAdminSettingsRoutes);

  // -------------------------------------------------------------------------
  // Platform-admin billing — workspace plan upgrade request confirmation
  //
  //   GET  /platform-admin/billing/upgrade-requests          — list pending
  //   GET  /platform-admin/billing/upgrade-requests/:id      — single request
  //   POST /platform-admin/billing/upgrade-requests/:id/confirm — confirm payment
  //   POST /platform-admin/billing/upgrade-requests/:id/reject  — reject
  //
  // All routes: super_admin only.
  // Confirm: upgrades subscription plan, enables 'operations' layer, fires
  //          billing.payment_succeeded + workspace.activated events.
  // -------------------------------------------------------------------------

  app.use('/platform-admin/billing/*', authMiddleware);
  app.use('/platform-admin/billing/*', requireRole('super_admin'));
  app.use('/platform-admin/billing/*', auditLogMiddleware);
  app.route('/platform-admin/billing', platformAdminBillingRoutes);

  // -------------------------------------------------------------------------
  // Platform-admin vertical FSM control — M8b
  //
  //   GET  /platform-admin/verticals                              — list all (cross-workspace)
  //   GET  /platform-admin/verticals/:workspaceId                 — list for one workspace
  //   POST /platform-admin/verticals/:workspaceId/:slug/claim     — register at claimed state
  //   POST /platform-admin/verticals/:workspaceId/:slug/activate  — claimed → active
  //   POST /platform-admin/verticals/:workspaceId/:slug/suspend   — active|claimed → suspended
  //   POST /platform-admin/verticals/:workspaceId/:slug/reinstate — suspended → active
  //   POST /platform-admin/verticals/:workspaceId/:slug/deprecate — any → deprecated
  //
  // All routes: super_admin only. Every state change fires an event.
  // -------------------------------------------------------------------------

  app.use('/platform-admin/verticals/*', authMiddleware);
  app.use('/platform-admin/verticals/*', requireRole('super_admin'));
  app.use('/platform-admin/verticals/*', auditLogMiddleware);
  app.route('/platform-admin/verticals', platformAdminVerticalsRoutes);

  // -------------------------------------------------------------------------
  // Tenant branding / white-label configuration (auth required, admin role)
  //   GET  /tenant/branding              — read branding settings
  //   PATCH /tenant/branding             — create or update branding
  //   POST  /tenant/branding/domain      — register custom domain
  //   GET   /tenant/branding/domain/verify — verify DNS TXT record
  // -------------------------------------------------------------------------

  app.use('/tenant/branding*', authMiddleware);
  app.use('/tenant/branding*', auditLogMiddleware);
  app.route('/tenant/branding', tenantBrandingRoutes);

  // -------------------------------------------------------------------------
  // Profile management — workspace-scoped visibility + claim state control
  //   GET  /profiles                          — list workspace profiles
  //   PATCH /profiles/:id/visibility          — set discovery visibility
  //   PATCH /profiles/:id/claim-state         — advance to managed
  // -------------------------------------------------------------------------

  app.use('/profiles*', authMiddleware);
  app.route('/profiles', profileRoutes);

  // -------------------------------------------------------------------------
  // P23: Workspace Analytics — tenant-scoped (different from /platform/analytics)
  // auth required; routes enforce workspace ownership internally (T3)
  // -------------------------------------------------------------------------

  app.use('/analytics/workspace/*', authMiddleware);
  app.route('/analytics/workspace', workspaceAnalyticsRoutes);

  // -------------------------------------------------------------------------
  // P24: FX Rates — GET routes are public; POST (upsert) requires super_admin.
  // Auth middleware NOT applied at route level — the POST handler enforces
  // super_admin role internally. This keeps GET /fx-rates* routes public
  // for currency display without requiring authentication.
  // -------------------------------------------------------------------------

  app.route('/fx-rates', fxRatesRoutes);

  // -------------------------------------------------------------------------
  // P25: B2B Marketplace — auth + email verification required
  // Audit log on all mutation routes (bid, accept, PO, invoice, dispute)
  // Trust scores are read-only but still require auth (T3)
  // -------------------------------------------------------------------------

  app.use('/b2b/*', authMiddleware);
  app.use('/b2b/*', emailVerificationEnforcement);
  app.use('/b2b/*', auditLogMiddleware);
  app.route('/b2b', b2bMarketplaceRoutes);

  // -------------------------------------------------------------------------
  // Phase 3: Notification Template Management — N-035, N-036, N-037
  //   GET  /notifications/templates          — list accessible templates
  //   GET  /notifications/templates/:id      — get template details
  //   POST /notifications/templates/:id/preview    — render without dispatch (N-036)
  //   POST /notifications/templates/:id/test-send  — render + dispatch to caller (N-037)
  //   POST /notifications/templates/:id/publish    — activate a draft (N-035)
  //
  // Auth required (workspace_admin or super_admin — enforced per handler).
  // GET /templates is readable by any authenticated user; mutations require admin role.
  // -------------------------------------------------------------------------

  app.use('/notifications/*', authMiddleware);
  app.route('/notifications', notificationRoutes);

  // Phase 5 (N-065, N-066, N-067): Inbox API + Preference Management API.
  // Auth already applied by /notifications/* middleware above.
  // NOTE: /notifications/inbox/unread-count MUST be registered before inbox/:id
  // — Hono sub-routers handle this correctly when inboxRoutes is ordered properly.
  app.route('/notifications', inboxRoutes);
  app.route('/notifications', preferenceRoutes);

  // N-105/N-106/N-107/N-108/N-109/N-114/N-118: Notification admin operations (super_admin only).
  // Auth already applied by /notifications/* middleware above.
  app.use('/notifications/admin/*', requireRole('super_admin'));
  app.route('/notifications', notificationAdminRoutes);

  // N-052 (Phase 4): Resend bounce/delivery webhook (NO auth — provider callback).
  // Validates Svix signature using RESEND_WEBHOOK_SECRET before processing.
  // POST /provider-webhooks/resend
  app.route('/provider-webhooks/resend', resendBounceWebhook);

  // COMP-001 / ENH-039: NDPR DSAR (Data Subject Access Request) endpoints.
  // Auth enforced inside the route handler — authMiddleware applied on all routes.
  app.route('/compliance', complianceRoutes);

  // -------------------------------------------------------------------------
  // Regulatory Verification — Compliance-gated template licence submissions
  //   POST /regulatory-verification/submit  — submit licence for review
  //   GET  /regulatory-verification/status  — get all verifications for workspace
  //
  // All routes: auth required + audit log.
  // -------------------------------------------------------------------------

  app.use('/regulatory-verification/*', authMiddleware);
  app.use('/regulatory-verification/*', auditLogMiddleware);
  app.route('/regulatory-verification', regulatoryVerificationRoutes);

  // -------------------------------------------------------------------------
  // Platform-admin sector licence review
  //   GET  /platform-admin/sector-licenses           — list (filterable)
  //   GET  /platform-admin/sector-licenses/:id       — detail
  //   POST /platform-admin/sector-licenses/:id/verify  — approve
  //   POST /platform-admin/sector-licenses/:id/reject  — reject
  //   POST /platform-admin/sector-licenses/:id/expire  — expire verified
  //
  // All routes: super_admin only.
  // -------------------------------------------------------------------------

  app.use('/platform-admin/sector-licenses/*', authMiddleware);
  app.use('/platform-admin/sector-licenses/*', requireRole('super_admin'));
  app.use('/platform-admin/sector-licenses/*', auditLogMiddleware);
  app.route('/platform-admin/sector-licenses', platformAdminSectorLicensesRoutes);

  // -------------------------------------------------------------------------
  // WakaPage — Phase 1 (ADR-0041)
  //   POST   /wakapages                     — create page (admin/super_admin)
  //   GET    /wakapages/:id                 — fetch page + blocks (any authed member)
  //   PATCH  /wakapages/:id                 — update page metadata (admin/super_admin)
  //   POST   /wakapages/:id/blocks          — add block (admin/super_admin)
  //   PATCH  /wakapages/:id/blocks/:blockId — update block (admin/super_admin)
  //   DELETE /wakapages/:id/blocks/:blockId — delete block (admin/super_admin)
  //   POST   /wakapages/:id/publish         — publish page + index + emit event (admin/super_admin)
  //
  // Auth required on all routes (authMiddleware applied here).
  // Entitlement (wakaPagePublicPage boolean) checked inside route handlers.
  // -------------------------------------------------------------------------

  app.use('/wakapages/*', authMiddleware);
  app.use('/wakapages/*', auditLogMiddleware);
  app.route('/wakapages', wakaPageRoutes);

  // -------------------------------------------------------------------------
  // Support Groups — 3-in-1: Operations / Branding / Discovery
  //
  // Public (no auth — X-Tenant-Id header):
  //   GET  /support-groups/public              — discovery list
  //   GET  /support-groups/public/:idOrSlug    — public profile
  //   GET  /support-groups/:id/events/public   — public events for group
  //
  // Authenticated (JWT required) — all other paths:
  //   POST   /support-groups                       — create group
  //   GET    /support-groups                       — list workspace groups
  //   GET    /support-groups/:idOrSlug             — get group
  //   PATCH  /support-groups/:id                   — update group
  //   POST   /support-groups/:id/join              — join group
  //   GET    /support-groups/:id/members           — list members
  //   POST   /support-groups/:id/members/:m/approve
  //   PATCH  /support-groups/:id/members/:m/role
  //   POST   /support-groups/:id/meetings          — schedule meeting
  //   GET    /support-groups/:id/meetings          — list meetings
  //   POST   /support-groups/:id/broadcasts        — broadcast (entitlement-gated)
  //   GET    /support-groups/:id/broadcasts
  //   POST   /support-groups/:id/events            — create event
  //   GET    /support-groups/:id/events            — list events
  //   POST   /support-groups/:id/gotv              — GOTV (entitlement-gated, P13)
  //   POST   /support-groups/:id/gotv/:g/confirm
  //   GET    /support-groups/:id/gotv/stats
  //   POST   /support-groups/:id/petitions         — open petition
  //   POST   /support-groups/petitions/:p/sign     — sign petition
  //   GET    /support-groups/:id/analytics         — analytics (entitlement-gated)
  //
  // T3: tenant_id from JWT on auth routes; X-Tenant-Id header on public routes.
  // P13: voter_ref never returned in API responses.
  // -------------------------------------------------------------------------

  // Auth middleware — applied BEFORE route registration (Hono requirement)
  // Scoped to all paths except /public* (which use X-Tenant-Id header instead)
  app.use('/support-groups', authMiddleware);
  app.use('/support-groups', auditLogMiddleware);
  app.use('/support-groups/:id', authMiddleware);
  app.use('/support-groups/:id', auditLogMiddleware);
  app.use('/support-groups/:id/*', authMiddleware);
  app.use('/support-groups/:id/*', auditLogMiddleware);
  app.use('/support-groups/petitions/:petitionId/sign', authMiddleware);
  app.use('/support-groups/petitions/:petitionId/sign', auditLogMiddleware);

  // Route registration — public GET /support-groups/public* are unguarded above
  app.route('/support-groups', supportGroupRoutes);

  // -------------------------------------------------------------------------
  // Groups — Phase 0 rename: /groups replaces /support-groups
  // @webwaka/groups uses renamed tables (groups_* after migration 0432).
  // /support-groups remains active for backward compat until migration 0438.
  //
  // Public (no auth — X-Tenant-Id header):
  //   GET  /groups/public              — discovery list
  //   GET  /groups/public/:idOrSlug   — public group profile
  //   GET  /groups/:id/events/public  — public events for group
  //
  // Authenticated (JWT required) — all other paths:
  //   POST/GET/PATCH /groups, /groups/:id, /groups/:id/* — full CRUD
  //
  // T3: tenant_id from JWT; P10: NDPR consent on join; P13: voter_ref in
  //     /electoral/* only (not exposed here).
  // -------------------------------------------------------------------------

  app.use('/groups', authMiddleware);
  app.use('/groups', auditLogMiddleware);
  app.use('/groups/:id', authMiddleware);
  app.use('/groups/:id', auditLogMiddleware);
  app.use('/groups/:id/*', authMiddleware);
  app.use('/groups/:id/*', auditLogMiddleware);
  app.use('/groups/petitions/:petitionId/sign', authMiddleware);
  app.use('/groups/petitions/:petitionId/sign', auditLogMiddleware);

  app.route('/groups', groupRoutes);

  // -------------------------------------------------------------------------
  // Cases — Phase 1 case management (create → assign → note → resolve → close)
  //
  // POST   /cases                   — open a new case
  // GET    /cases                   — list workspace cases
  // GET    /cases/summary           — dashboard stats
  // GET    /cases/:id               — get case
  // POST   /cases/:id/assign        — assign to agent
  // POST   /cases/:id/notes         — add note
  // GET    /cases/:id/notes         — list notes
  // POST   /cases/:id/resolve       — resolve
  // POST   /cases/:id/close         — close
  // POST   /cases/:id/reopen        — reopen
  //
  // Entitlement: starter+ (assertCasesEnabled)
  // T3: tenantId from JWT on every query.
  // P10: ndprConsented required on create.
  // -------------------------------------------------------------------------

  app.use('/cases', authMiddleware);
  app.use('/cases', auditLogMiddleware);
  app.use('/cases/:id', authMiddleware);
  app.use('/cases/:id', auditLogMiddleware);
  app.use('/cases/:id/*', authMiddleware);
  app.use('/cases/:id/*', auditLogMiddleware);
  app.use('/cases/summary', authMiddleware);
  app.use('/cases/summary', auditLogMiddleware);

  app.route('/cases', casesRoutes);

  // -------------------------------------------------------------------------
  // Fundraising — shared campaign engine
  //
  // Public (no auth — X-Tenant-Id header):
  //   GET  /fundraising/public              — campaign discovery list
  //   GET  /fundraising/public/:idOrSlug    — public campaign profile
  //   GET  /fundraising/public/:id/donor-wall
  //
  // Authenticated (JWT required):
  //   POST   /fundraising/campaigns               — create campaign
  //   GET    /fundraising/campaigns               — list workspace campaigns
  //   GET    /fundraising/campaigns/:idOrSlug     — get campaign
  //   PATCH  /fundraising/campaigns/:id           — update
  //   POST   /fundraising/campaigns/:id/publish
  //   POST   /fundraising/campaigns/:id/moderate
  //   POST   /fundraising/campaigns/:id/contributions     (P9 kobo, [A1] INEC cap)
  //   POST   /fundraising/campaigns/:id/contributions/:c/confirm
  //   GET    /fundraising/campaigns/:id/contributions     (P13: donor_phone stripped)
  //   POST   /fundraising/campaigns/:id/pledges           (entitlement-gated, P13)
  //   POST   /fundraising/campaigns/:id/milestones
  //   GET    /fundraising/campaigns/:id/milestones
  //   POST   /fundraising/campaigns/:id/updates
  //   GET    /fundraising/campaigns/:id/updates
  //   POST   /fundraising/campaigns/:id/rewards           (entitlement-gated)
  //   POST   /fundraising/campaigns/:id/payout-requests   ([A2] HITL for political)
  //   GET    /fundraising/campaigns/:id/payout-requests
  //   POST   /fundraising/campaigns/:id/payout-requests/:p/approve
  //   POST   /fundraising/campaigns/:id/payout-requests/:p/reject
  //   POST   /fundraising/campaigns/:id/compliance
  //   GET    /fundraising/campaigns/:id/stats
  //
  // T3: tenant_id from JWT; P9: kobo int; P13: donor_phone/bank_account_number stripped
  // [A1] INEC cap: ₦50m per contributor for political/election campaigns
  // [A2] CBN: Paystack pass-through; HITL required for political/election payouts
  // -------------------------------------------------------------------------

  // Auth middleware — applied BEFORE route registration
  // /fundraising/public* paths are left unguarded (X-Tenant-Id based)
  app.use('/fundraising/campaigns', authMiddleware);
  app.use('/fundraising/campaigns', auditLogMiddleware);
  app.use('/fundraising/campaigns/*', authMiddleware);
  app.use('/fundraising/campaigns/*', auditLogMiddleware);

  app.route('/fundraising', fundraisingRoutes);

  // -------------------------------------------------------------------------
  // Phase 2 — Value Movement: Dues Collection (FR-VM-15)
  // POST /dues/schedules · GET /dues/schedules · GET /dues/schedules/:id
  // GET /dues/schedules/:id/status · POST /dues/schedules/:id/pay
  // POST /dues/schedules/:id/close
  // -------------------------------------------------------------------------
  app.use('/dues/*', authMiddleware);
  app.use('/dues/*', auditLogMiddleware);
  app.route('/dues', duesRoutes);

  // -------------------------------------------------------------------------
  // Phase 2 — Value Movement: Mutual Aid (FR-VM-16)
  // POST /mutual-aid · GET /mutual-aid · GET /mutual-aid/:id
  // POST /mutual-aid/:id/vote · POST /mutual-aid/:id/disburse
  // -------------------------------------------------------------------------
  app.use('/mutual-aid', authMiddleware);
  app.use('/mutual-aid', auditLogMiddleware);
  app.use('/mutual-aid/*', authMiddleware);
  app.use('/mutual-aid/*', auditLogMiddleware);
  app.route('/mutual-aid', mutualAidRoutes);

  // -------------------------------------------------------------------------
  // Phase 2 — Workflow Engine
  // GET /workflows/definitions · GET /workflows/definitions/:key
  // POST /workflows/definitions/:key/start
  // GET /workflows/instances · GET /workflows/instances/:id
  // POST /workflows/instances/:id/advance
  // -------------------------------------------------------------------------
  app.use('/workflows/*', authMiddleware);
  app.use('/workflows/*', auditLogMiddleware);
  app.route('/workflows', workflowRoutes);

  // -------------------------------------------------------------------------
  // Phase 2 — Analytics (M12 gate: 3 workspace metrics)
  // GET /analytics/v2/workspace · GET /analytics/v2/groups/:id
  // GET /analytics/v2/campaigns/:id
  // -------------------------------------------------------------------------
  app.use('/analytics/v2/*', authMiddleware);
  app.route('/analytics/v2', phase2AnalyticsRoutes);

  // -------------------------------------------------------------------------
  // Phase 2 — Group Polls/Surveys (T006)
  // POST /groups/:groupId/polls · GET /groups/:groupId/polls
  // GET /groups/:groupId/polls/:pollId
  // POST /groups/:groupId/polls/:pollId/vote
  // POST /groups/:groupId/polls/:pollId/close
  // -------------------------------------------------------------------------
  app.use('/groups/:groupId/polls', authMiddleware);
  app.use('/groups/:groupId/polls/*', authMiddleware);
  app.route('/groups', pollsRoutes);

  // -------------------------------------------------------------------------
  // Phase 2 — Community Reporting / Content Flags (T008)
  // POST /content-flags · GET /content-flags · PATCH /content-flags/:id
  // -------------------------------------------------------------------------
  app.use('/content-flags', authMiddleware);
  app.use('/content-flags', auditLogMiddleware);
  app.use('/content-flags/*', authMiddleware);
  app.use('/content-flags/*', auditLogMiddleware);
  app.route('/content-flags', communityReportRoutes);

  // -------------------------------------------------------------------------
  // Phase 3 (E23) — Low-Bandwidth Image Pipeline
  // POST /image-variants · GET /image-variants/:entityType/:entityId
  // PATCH /image-variants/:id/process
  // -------------------------------------------------------------------------
  app.use('/image-variants', authMiddleware);
  app.use('/image-variants/*', authMiddleware);
  app.route('/image-variants', imagePipelineRoutes);

  // -------------------------------------------------------------------------
  // Phase 3 (E24) — WhatsApp Business API Template Management
  // GET /whatsapp-templates · POST /whatsapp-templates
  // GET /whatsapp-templates/defaults · GET /whatsapp-templates/:id
  // PATCH /whatsapp-templates/:id/status
  // -------------------------------------------------------------------------
  app.use('/whatsapp-templates', authMiddleware);
  app.use('/whatsapp-templates/*', authMiddleware);
  app.route('/whatsapp-templates', whatsappTemplateRoutes);

  // -------------------------------------------------------------------------
  // Phase 5 (E32) — Moderation Appeal Flow
  // POST /appeals               — submit appeal (auth required, any role)
  // GET  /appeals/admin         — list pending appeals (admin/super_admin)
  // PATCH /appeals/admin/:id    — review appeal (admin/super_admin)
  // T5: admin role enforced inside handler; P13: reviewer_id not in public responses
  // -------------------------------------------------------------------------
  app.use('/appeals', authMiddleware);
  app.use('/appeals/*', authMiddleware);
  app.use('/appeals', auditLogMiddleware);
  app.use('/appeals/*', auditLogMiddleware);
  app.route('/appeals', appealsRoutes);
}
