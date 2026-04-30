/**
 * Route Group: All Vertical-Specific Routes
 * ARC-07 router split — Phase 0.5
 *
 * Includes: commerce (P2/P3), transport, civic, health, edu-agri,
 * professional-creator, financial-place-media-institutional, set-J,
 * politician, pos-business, negotiation.
 */
import type { Hono } from 'hono';
import type { Env } from '../env.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireEntitlement } from '../middleware/entitlement.js';
import { auditLogMiddleware } from '../middleware/audit-log.js';
import { PlatformLayer } from '@webwaka/types';
import { politicianRoutes } from '../routes/politician.js';
import { posBusinessRoutes } from '../routes/pos-business.js';
import { transportRoutes } from '../routes/transport.js';
import { civicRoutes } from '../routes/civic.js';
import { commerceRoutes } from '../routes/commerce.js';
import { commerceP2Routes } from '../routes/verticals-commerce-p2.js';
import { commerceP2Batch2Routes } from '../routes/verticals-commerce-p2-batch2.js';
import { commerceP3Routes } from '../routes/verticals-commerce-p3.js';
import { transportExtendedRoutes } from '../routes/verticals-transport-extended.js';
import { civicExtendedRoutes } from '../routes/verticals-civic-extended.js';
import healthExtendedRoutes from '../routes/verticals-health-extended.js';
import profCreatorExtendedRoutes from '../routes/verticals-prof-creator-extended.js';
import financialPlaceMediaInstitutionalRoutes from '../routes/verticals-financial-place-media-institutional-extended.js';
import { setJExtendedRouter } from '../routes/verticals-set-j-extended.js';
import { negotiationRouter } from '../routes/negotiation.js';
import eduAgriExtendedRoutes from '../routes/verticals-edu-agri-extended.js';

export function registerVerticalRoutes(app: Hono<{ Bindings: Env }>): void {
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
  // M9: Commerce P2 Batch 1 vertical routes
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
  // Commerce P3 (M10/M11/M12): 15 verticals
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
  // -------------------------------------------------------------------------

  app.use('/api/v1/verticals/*', authMiddleware);
  app.route('/api/v1/verticals', setJExtendedRouter);

  // -------------------------------------------------------------------------
  // Negotiable Pricing — platform-wide (additive, not disruptive)
  // P9: All monetary values INTEGER kobo. Discounts INTEGER bps. No floats.
  // -------------------------------------------------------------------------

  app.use('/api/v1/negotiation/*', authMiddleware);
  app.use('/api/v1/negotiation/*', auditLogMiddleware);
  app.route('/api/v1/negotiation', negotiationRouter);
}
