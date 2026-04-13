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
import { webhookRoutes } from './routes/webhooks.js';
import { openapiRoutes, swaggerRoutes } from './routes/openapi.js';
import { onboardingRoutes } from './routes/onboarding.js';
import { billingRoutes } from './routes/billing.js';

export function registerRoutes(app: Hono<{ Bindings: Env }>): void {
  // -------------------------------------------------------------------------
  // Public routes (no auth)
  // -------------------------------------------------------------------------

  app.route('/health', healthRoutes);
  // TEST-001: Top-level /version alias — smoke tests expect GET /version (not /health/version)
  app.get('/version', (c) => c.json({ version: API_VERSION }));
  app.route('/openapi.json', openapiRoutes);
  app.route('/docs', swaggerRoutes); // GOV-03: Swagger UI
  app.route('/geography', geographyRoutes);
  app.route('/discovery', discoveryRoutes);

  // -------------------------------------------------------------------------
  // Auth routes — /auth/login and /auth/verify are public;
  // /auth/refresh and /auth/me require a valid JWT
  // -------------------------------------------------------------------------

  app.use('/auth/refresh', authMiddleware);
  app.use('/auth/me', authMiddleware);
  // SEC-03: Login-specific rate limiting — 10 attempts per 5 minutes per IP
  app.use('/auth/login', rateLimitMiddleware({ keyPrefix: 'auth:login', maxRequests: 10, windowSeconds: 300 }));
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

  // -------------------------------------------------------------------------
  // M6: Public tenant routes — no auth required
  // -------------------------------------------------------------------------

  app.route('/public', publicRoutes);

  // SEC-01: Admin dashboard routes now require auth to prevent data leakage.
  app.use('/admin/*', authMiddleware);
  app.use('/admin/*', auditLogMiddleware);
  app.route('/admin', adminPublicRoutes);

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

  app.use('/superagent/*', authMiddleware);
  app.use('/superagent/*', ussdExclusionMiddleware);
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
  // M9: Commerce P2 Batch 1 vertical routes — auth required (T3, P9, P10, P12, P13)
  // Verticals: auto-mechanic, bakery, beauty-salon, bookshop, catering,
  //            cleaning-service, electronics-repair, florist, food-vendor
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
  app.route('/', commerceP2Routes);

  // -------------------------------------------------------------------------
  // Commerce P2 Batch 2 (M9/M10): 12 verticals
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
  app.route('/', commerceP2Batch2Routes);

  // -------------------------------------------------------------------------
  // Commerce P3 (M10/M11/M12): 15 verticals — auth required (T3, P9, P12, P13)
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
  app.use('/api/v1/spare-parts/*', authMiddleware);
  app.use('/api/v1/tyre-shop/*', authMiddleware);
  app.use('/api/v1/used-car-dealer/*', authMiddleware);
  app.use('/api/v1/water-vendor/*', authMiddleware);
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
  app.route('/api/v1', transportExtendedRoutes);

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
  app.use('/api/v1/event-hall/*', authMiddleware);
  app.use('/api/v1/water-treatment/*', authMiddleware);
  app.use('/api/v1/community-hall/*', authMiddleware);
  app.use('/api/v1/events-centre/*', authMiddleware);
  app.use('/api/v1/advertising-agency/*', authMiddleware);
  app.use('/api/v1/newspaper-dist/*', authMiddleware);
  app.use('/api/v1/podcast-studio/*', authMiddleware);
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
  app.use('/partners/*', auditLogMiddleware);
  app.route('/partners', partnerRoutes);

  // -------------------------------------------------------------------------
  // v1.0.1: Template Registry
  // GET /templates and GET /templates/:slug are public.
  // POST /templates requires super_admin.
  // -------------------------------------------------------------------------

  app.use('/templates/installed', authMiddleware);
  app.use('/templates/*/install', authMiddleware);
  app.use('/templates/*/upgrade', authMiddleware);
  app.use('/templates/*/purchase', authMiddleware);
  app.use('/templates/*/purchase/verify', authMiddleware);
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
}
