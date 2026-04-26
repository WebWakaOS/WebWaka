/**
 * Template resolver — marketplace-driven render dispatch for Pillar 2.
 *
 * Queries template_installations + template_registry + template_render_overrides
 * to find the active website template installed for a given tenant, then returns
 * the matching built-in WebsiteTemplateContract implementation.
 *
 * Architecture (post Emergent Pillar-2 Audit 2026-04-25):
 *   1. brand-runtime route handler calls resolveTemplate(tenantId, db, pageType?)
 *   2. This module first looks for a per-page-type override in
 *      template_render_overrides (migration 0228) — these are tenant-scoped
 *      decisions to use a different template (or platform-default) for one page.
 *   3. If no per-page override exists, it falls back to the workspace-level
 *      install in template_installations (status='active', most recent first).
 *   4. The resolved slug is matched against BUILT_IN_TEMPLATES.
 *   5. If an override slug is the reserved sentinel 'platform-default',
 *      resolveTemplate returns null so the caller renders the platform fallback.
 *
 * Phase 1 limitation: only built-in templates are supported. Third-party /
 * marketplace templates loaded from external code require sandboxed execution
 * (planned for Phase 2). The manifest render_entrypoint field is reserved for
 * this future capability.
 *
 * Platform Invariants:
 *   T2 — TypeScript strict
 *   T3 — tenant_id predicate on every DB query
 *   P1 — single resolver; no duplicated dispatch logic in individual routes
 */

import type { WebsiteTemplateContract, WebsitePageType } from '@webwaka/verticals';

// ---------------------------------------------------------------------------
// Built-in template implementations
// ---------------------------------------------------------------------------

import { brandedHomeBody } from '../templates/branded-home.js';
import { aboutPageBody } from '../templates/about.js';
import { servicesPageBody } from '../templates/services.js';
import { contactPageBody } from '../templates/contact.js';
import { restaurantGeneralEateryTemplate } from '../templates/niches/restaurant/general-eatery.js';
import { soleTraderArtisanCatalogueTemplate } from '../templates/niches/sole-trader/artisan-catalogue.js';
import { creatorPersonalBrandTemplate } from '../templates/niches/creator/personal-brand.js';
import { professionalPracticeSiteTemplate } from '../templates/niches/professional/practice-site.js';
import { churchFaithCommunityTemplate } from '../templates/niches/church/faith-community.js';
import { clinicPrimaryCareTemplate } from '../templates/niches/clinic/primary-care.js';
import { schoolInstitutionSiteTemplate } from '../templates/niches/school/institution-site.js';
import { ngoNonprofitPortalTemplate } from '../templates/niches/ngo/nonprofit-portal.js';
import { posBusinessOperationsPortalTemplate } from '../templates/niches/pos-business/operations-portal.js';
import { politicianCampaignSiteTemplate } from '../templates/niches/politician/campaign-site.js';
import { politicalPartyPartyWebsiteTemplate } from '../templates/niches/political-party/party-website.js';
import { techHubInnovationCentreTemplate } from '../templates/niches/tech-hub/innovation-centre.js';
import { rideshareRideHailingServiceTemplate } from '../templates/niches/rideshare/ride-hailing-service.js';
import { haulageFreightLogisticsTemplate } from '../templates/niches/haulage/freight-logistics.js';
import { pharmacyDrugStoreTemplate } from '../templates/niches/pharmacy/drug-store.js';
import { beautySalonPersonalCareTemplate } from '../templates/niches/beauty-salon/personal-care.js';
import { hotelHospitalityBookingTemplate } from '../templates/niches/hotel/hospitality-booking.js';
import { realEstateAgencyPropertyListingsTemplate } from '../templates/niches/real-estate-agency/property-listings.js';
import { lawFirmLegalPracticeTemplate } from '../templates/niches/law-firm/legal-practice.js';
import { itSupportTechServiceTemplate } from '../templates/niches/it-support/tech-service.js';
import { handymanTradeServiceTemplate } from '../templates/niches/handyman/trade-service.js';
import { supermarketGroceryStoreTemplate } from '../templates/niches/supermarket/grocery-store.js';
import { bakeryConfectioneryTemplate } from '../templates/niches/bakery/confectionery.js';
import { cateringEventServiceTemplate } from '../templates/niches/catering/event-service.js';
import { eventHallVenueBookingTemplate } from '../templates/niches/event-hall/venue-booking.js';
import { fashionBrandClothingLabelTemplate } from '../templates/niches/fashion-brand/clothing-label.js';
import { photographyVisualPortfolioTemplate } from '../templates/niches/photography/visual-portfolio.js';
import { musicStudioArtistProfileTemplate } from '../templates/niches/music-studio/artist-profile.js';
import { travelAgentTourOperatorTemplate } from '../templates/niches/travel-agent/tour-operator.js';
import { savingsGroupThriftCommunityTemplate } from '../templates/niches/savings-group/thrift-community.js';
import { gymFitnessMembershipTemplate } from '../templates/niches/gym/fitness-membership.js';
import { spaWellnessCentreTemplate } from '../templates/niches/spa/wellness-centre.js';
import { taxConsultantFinancialServicesTemplate } from '../templates/niches/tax-consultant/financial-services.js';
import { drivingSchoolTrainingTemplate } from '../templates/niches/driving-school/training.js';
import { trainingInstituteVocationalTemplate } from '../templates/niches/training-institute/vocational.js';
import { tutoringPrivateLessonsTemplate } from '../templates/niches/tutoring/private-lessons.js';
import { wholesaleMarketTradingHubTemplate } from '../templates/niches/wholesale-market/trading-hub.js';
import { warehouseLogisticsHubTemplate } from '../templates/niches/warehouse/logistics-hub.js';
import { insuranceAgentBrokerSiteTemplate } from '../templates/niches/insurance-agent/broker-site.js';
import { dentalClinicSpecialistCareTemplate } from '../templates/niches/dental-clinic/specialist-care.js';
import { vetClinicVeterinaryTemplate } from '../templates/niches/vet-clinic/veterinary-care.js';
import { crecheEarlyChildhoodTemplate } from '../templates/niches/creche/early-childhood.js';
import { mobileMoneyAgentFintechTemplate } from '../templates/niches/mobile-money-agent/fintech.js';
import { bureauDeChangeFxDealerTemplate } from '../templates/niches/bureau-de-change/fx-dealer.js';
import { hirePurchaseAssetFinanceTemplate } from '../templates/niches/hire-purchase/asset-finance.js';
import { communityHallCivicSpaceTemplate } from '../templates/niches/community-hall/civic-space.js';
import { mosqueMosqueCommunityPlatformTemplate } from '../templates/niches/mosque/mosque-community-platform.js';
import { hairSalonHairSalonSiteTemplate } from '../templates/niches/hair-salon/hair-salon-site.js';
import { poultryFarmPoultryFarmSiteTemplate } from '../templates/niches/poultry-farm/poultry-farm-site.js';
import { marketAssociationMarketAssocPortalTemplate } from '../templates/niches/market-association/market-assoc-portal.js';
import { waterVendorWaterVendorSiteTemplate } from '../templates/niches/water-vendor/water-vendor-site.js';
import { phoneRepairShopPhoneRepairShopTemplate } from '../templates/niches/phone-repair-shop/phone-repair-shop.js';
import { palmOilTraderPalmOilTraderSiteTemplate } from '../templates/niches/palm-oil-trader/palm-oil-trader-site.js';
import { okadaKekeOkadaKekeCoopTemplate } from '../templates/niches/okada-keke/okada-keke-coop.js';
import { tailoringFashionTailoringAtelierTemplate } from '../templates/niches/tailoring-fashion/tailoring-atelier.js';
import { usedCarDealerUsedCarDealerSiteTemplate } from '../templates/niches/used-car-dealer/used-car-dealer-site.js';
import { buildingMaterialsBuildingMaterialsSupplierTemplate } from '../templates/niches/building-materials/building-materials-supplier.js';
import { electricalFittingsElectricalFittingsDealerTemplate } from '../templates/niches/electrical-fittings/electrical-fittings-dealer.js';
import { cassavaMillerCassavaMillerSiteTemplate } from '../templates/niches/cassava-miller/cassava-miller-site.js';
import { generatorDealerGeneratorDealerServiceTemplate } from '../templates/niches/generator-dealer/generator-dealer-service.js';
import { fishMarketFishMarketSiteTemplate } from '../templates/niches/fish-market/fish-market-site.js';
import { weddingPlannerWeddingPlannerSiteTemplate } from '../templates/niches/wedding-planner/wedding-planner-site.js';
import { privateSchoolPrivateSchoolSiteTemplate } from '../templates/niches/private-school/private-school-site.js';
import { communityHealthCommunityHealthSiteTemplate } from '../templates/niches/community-health/community-health-site.js';
import { professionalAssociationProfAssocPortalTemplate } from '../templates/niches/professional-association/prof-assoc-portal.js';
import { campaignOfficeCampaignOfficeOpsTemplate } from '../templates/niches/campaign-office/campaign-office-ops.js';
import { lgaOfficeLgaCouncilPortalTemplate } from '../templates/niches/lga-office/lga-council-portal.js';
import { communityRadioCommunityRadioSiteTemplate } from '../templates/niches/community-radio/community-radio-site.js';
import { airtimeResellerAirtimeVtuResellerTemplate } from '../templates/niches/airtime-reseller/airtime-vtu-reseller.js';
import { landSurveyorLandSurveyorSiteTemplate } from '../templates/niches/land-surveyor/land-surveyor-site.js';
import { womensAssociationWomensAssocPortalTemplate } from '../templates/niches/womens-association/womens-assoc-portal.js';
import { youthOrganizationYouthOrgPortalTemplate } from '../templates/niches/youth-organization/youth-org-portal.js';
import { ministryMissionMinistryMissionPlatformTemplate } from '../templates/niches/ministry-mission/ministry-mission-platform.js';
import { abattoirAbattoirMeatProcessingTemplate } from '../templates/niches/abattoir/abattoir-meat-processing.js';
import { ferryFerryWaterTransportTemplate } from '../templates/niches/ferry/ferry-water-transport.js';
import { boreholeDrillerBoreholeDrillingTemplate } from '../templates/niches/borehole-driller/borehole-drilling.js';
import { printingPressPrintingPressStudioTemplate } from '../templates/niches/printing-press/printing-press-studio.js';
import { restaurantRestaurantMenuSiteTemplate } from '../templates/niches/restaurant/restaurant-menu-site.js';
import { startupStartupSiteTemplate } from '../templates/niches/startup/startup-site.js';
import { recordingLabelRecordLabelSiteTemplate } from '../templates/niches/recording-label/record-label-site.js';
import { talentAgencyTalentAgencySiteTemplate } from '../templates/niches/talent-agency/talent-agency-site.js';
import { podcastStudioPodcastStudioSiteTemplate } from '../templates/niches/podcast-studio/podcast-studio-site.js';
import { motivationalSpeakerMotivationalSpeakerSiteTemplate } from '../templates/niches/motivational-speaker/motivational-speaker-site.js';
import { govtSchoolGovtSchoolPortalTemplate } from '../templates/niches/govt-school/govt-school-portal.js';
import { rehabCentreRehabCentreSiteTemplate } from '../templates/niches/rehab-centre/rehab-centre-site.js';
import { elderlyCareElderlyCareFacilityTemplate } from '../templates/niches/elderly-care/elderly-care-facility.js';
import { sparePartsSparePartsDealerTemplate } from '../templates/niches/spare-parts/spare-parts-dealer.js';
import type { WebsiteRenderContext } from '@webwaka/verticals';

/**
 * Reserved sentinel slug meaning: ignore the workspace install and render the
 * platform fallback functions for this page. Stored in template_render_overrides.
 */
export const PLATFORM_DEFAULT_SLUG = 'platform-default';

/**
 * 'default-website' — the platform default website template.
 */
const defaultWebsiteTemplate: WebsiteTemplateContract = {
  slug: 'default-website',
  version: '1.0.0',
  pages: ['home', 'about', 'services', 'contact'],

  renderPage(ctx: WebsiteRenderContext): string {
    switch (ctx.pageType) {
      case 'home': {
        const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;
        return brandedHomeBody({
          displayName: ctx.displayName,
          tagline: (ctx.data.tagline as string | null) ?? null,
          description: (ctx.data.description as string | null) ?? null,
          primaryColor: ctx.primaryColor,
          logoUrl: ctx.logoUrl,
          ctaLabel: 'View Our Services',
          ctaUrl: '/services',
          offerings,
        });
      }
      case 'about': {
        return aboutPageBody({
          displayName: ctx.displayName,
          description: (ctx.data.description as string | null) ?? null,
          logoUrl: ctx.logoUrl,
          primaryColor: ctx.primaryColor,
          category: (ctx.data.category as string | null) ?? null,
          placeName: (ctx.data.placeName as string | null) ?? null,
          phone: (ctx.data.phone as string | null) ?? null,
          website: (ctx.data.website as string | null) ?? null,
        });
      }
      case 'services': {
        const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;
        return servicesPageBody({
          displayName: ctx.displayName,
          offerings,
        });
      }
      case 'contact': {
        return contactPageBody({
          displayName: ctx.displayName,
          phone: (ctx.data.phone as string | null) ?? null,
          email: (ctx.data.email as string | null) ?? null,
          placeName: (ctx.data.placeName as string | null) ?? null,
          tenantId: ctx.tenantId,
        });
      }
      default:
        return `<p style="text-align:center;padding:4rem 1rem;color:var(--ww-text-muted)">Page not found.</p>`;
    }
  },
};

/**
 * Registry of all built-in WebsiteTemplateContract implementations, keyed by slug.
 * Add new built-in templates here as they are developed.
 */
const BUILT_IN_TEMPLATES: Map<string, WebsiteTemplateContract> = new Map([
  ['default-website', defaultWebsiteTemplate],
  ['restaurant-general-eatery', restaurantGeneralEateryTemplate],
  ['sole-trader-artisan-catalogue', soleTraderArtisanCatalogueTemplate],
  ['creator-personal-brand', creatorPersonalBrandTemplate],
  ['professional-practice-site', professionalPracticeSiteTemplate],
  ['church-faith-community', churchFaithCommunityTemplate],
  ['clinic-primary-care', clinicPrimaryCareTemplate],
  ['school-institution-site', schoolInstitutionSiteTemplate],
  ['ngo-nonprofit-portal', ngoNonprofitPortalTemplate],
  ['pos-business-operations-portal', posBusinessOperationsPortalTemplate],
  ['politician-campaign-site', politicianCampaignSiteTemplate],
  ['political-party-party-website', politicalPartyPartyWebsiteTemplate],
  ['tech-hub-innovation-centre', techHubInnovationCentreTemplate],
  ['rideshare-ride-hailing-service', rideshareRideHailingServiceTemplate],
  ['haulage-freight-logistics', haulageFreightLogisticsTemplate],
  ['pharmacy-drug-store', pharmacyDrugStoreTemplate],
  ['beauty-salon-personal-care', beautySalonPersonalCareTemplate],
  ['hotel-hospitality-booking', hotelHospitalityBookingTemplate],
  ['real-estate-agency-property-listings', realEstateAgencyPropertyListingsTemplate],
  ['law-firm-legal-practice', lawFirmLegalPracticeTemplate],
  ['it-support-tech-service', itSupportTechServiceTemplate],
  ['handyman-trade-service', handymanTradeServiceTemplate],
  ['supermarket-grocery-store', supermarketGroceryStoreTemplate],
  ['bakery-confectionery', bakeryConfectioneryTemplate],
  ['catering-event-service', cateringEventServiceTemplate],
  ['event-hall-venue-booking', eventHallVenueBookingTemplate],
  ['fashion-brand-clothing-label', fashionBrandClothingLabelTemplate],
  ['photography-visual-portfolio', photographyVisualPortfolioTemplate],
  ['music-studio-artist-profile', musicStudioArtistProfileTemplate],
  ['travel-agent-tour-operator', travelAgentTourOperatorTemplate],
  ['savings-group-thrift-community', savingsGroupThriftCommunityTemplate],
  ['gym-fitness-membership', gymFitnessMembershipTemplate],
  ['spa-wellness-centre', spaWellnessCentreTemplate],
  ['tax-consultant-financial-services', taxConsultantFinancialServicesTemplate],
  ['driving-school-training', drivingSchoolTrainingTemplate],
  ['training-institute-vocational', trainingInstituteVocationalTemplate],
  ['tutoring-private-lessons', tutoringPrivateLessonsTemplate],
  ['wholesale-market-trading-hub', wholesaleMarketTradingHubTemplate],
  ['warehouse-logistics-hub', warehouseLogisticsHubTemplate],
  ['insurance-agent-broker-site', insuranceAgentBrokerSiteTemplate],
  ['dental-clinic-specialist-care', dentalClinicSpecialistCareTemplate],
  ['vet-clinic-veterinary-care', vetClinicVeterinaryTemplate],
  ['creche-early-childhood', crecheEarlyChildhoodTemplate],
  ['mobile-money-agent-fintech', mobileMoneyAgentFintechTemplate],
  ['bureau-de-change-fx-dealer', bureauDeChangeFxDealerTemplate],
  ['hire-purchase-asset-finance', hirePurchaseAssetFinanceTemplate],
  ['community-hall-civic-space', communityHallCivicSpaceTemplate],
  ['mosque-mosque-community-platform', mosqueMosqueCommunityPlatformTemplate],
  ['hair-salon-hair-salon-site', hairSalonHairSalonSiteTemplate],
  ['poultry-farm-poultry-farm-site', poultryFarmPoultryFarmSiteTemplate],
  ['market-association-market-assoc-portal', marketAssociationMarketAssocPortalTemplate],
  ['water-vendor-water-vendor-site', waterVendorWaterVendorSiteTemplate],
  ['phone-repair-shop-phone-repair-shop', phoneRepairShopPhoneRepairShopTemplate],
  ['palm-oil-trader-palm-oil-trader-site', palmOilTraderPalmOilTraderSiteTemplate],
  ['okada-keke-okada-keke-coop', okadaKekeOkadaKekeCoopTemplate],
  ['tailoring-fashion-tailoring-atelier', tailoringFashionTailoringAtelierTemplate],
  ['used-car-dealer-used-car-dealer-site', usedCarDealerUsedCarDealerSiteTemplate],
  ['building-materials-building-materials-supplier', buildingMaterialsBuildingMaterialsSupplierTemplate],
  ['electrical-fittings-electrical-fittings-dealer', electricalFittingsElectricalFittingsDealerTemplate],
  ['cassava-miller-cassava-miller-site', cassavaMillerCassavaMillerSiteTemplate],
  ['generator-dealer-generator-dealer-service', generatorDealerGeneratorDealerServiceTemplate],
  ['fish-market-fish-market-site', fishMarketFishMarketSiteTemplate],
  ['wedding-planner-wedding-planner-site', weddingPlannerWeddingPlannerSiteTemplate],
  ['private-school-private-school-site', privateSchoolPrivateSchoolSiteTemplate],
  ['community-health-community-health-site', communityHealthCommunityHealthSiteTemplate],
  ['professional-association-prof-assoc-portal', professionalAssociationProfAssocPortalTemplate],
  ['campaign-office-campaign-office-ops', campaignOfficeCampaignOfficeOpsTemplate],
  ['lga-office-lga-council-portal', lgaOfficeLgaCouncilPortalTemplate],
  ['community-radio-community-radio-site', communityRadioCommunityRadioSiteTemplate],
  ['airtime-reseller-airtime-vtu-reseller', airtimeResellerAirtimeVtuResellerTemplate],
  ['land-surveyor-land-surveyor-site', landSurveyorLandSurveyorSiteTemplate],
  ['womens-association-womens-assoc-portal', womensAssociationWomensAssocPortalTemplate],
  ['youth-organization-youth-org-portal', youthOrganizationYouthOrgPortalTemplate],
  ['ministry-mission-ministry-mission-platform', ministryMissionMinistryMissionPlatformTemplate],
  ['abattoir-abattoir-meat-processing', abattoirAbattoirMeatProcessingTemplate],
  ['ferry-ferry-water-transport', ferryFerryWaterTransportTemplate],
  ['borehole-driller-borehole-drilling', boreholeDrillerBoreholeDrillingTemplate],
  ['printing-press-printing-press-studio', printingPressPrintingPressStudioTemplate],
  ['restaurant-restaurant-menu-site', restaurantRestaurantMenuSiteTemplate],
  ['startup-startup-site', startupStartupSiteTemplate],
  ['recording-label-record-label-site', recordingLabelRecordLabelSiteTemplate],
  ['talent-agency-talent-agency-site', talentAgencyTalentAgencySiteTemplate],
  ['podcast-studio-podcast-studio-site', podcastStudioPodcastStudioSiteTemplate],
  ['motivational-speaker-motivational-speaker-site', motivationalSpeakerMotivationalSpeakerSiteTemplate],
  ['govt-school-govt-school-portal', govtSchoolGovtSchoolPortalTemplate],
  ['rehab-centre-rehab-centre-site', rehabCentreRehabCentreSiteTemplate],
  ['elderly-care-elderly-care-facility', elderlyCareElderlyCareFacilityTemplate],
  ['spare-parts-spare-parts-dealer', sparePartsSparePartsDealerTemplate],
]);

// ---------------------------------------------------------------------------
// DB types
// ---------------------------------------------------------------------------

interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): {
      first<T>(): Promise<T | null>;
    };
  };
}

interface OverrideRow {
  override_template_slug: string;
}

interface ActiveInstallRow {
  template_slug: string;
  template_version: string;
  config_json: string;
}

// ---------------------------------------------------------------------------
// resolveTemplate — main entry point for brand-runtime route handlers
// ---------------------------------------------------------------------------

/**
 * Resolve the active WebsiteTemplateContract for a tenant.
 *
 * Resolution order (T3 — tenant_id predicate everywhere):
 *   1. template_render_overrides (per-page-type tenant override)
 *      • If override_template_slug = 'platform-default' → return null
 *        (caller renders platform fallback functions)
 *      • Else use that slug.
 *   2. template_installations (workspace-level active install, most recent)
 *      • Joined with template_registry where status='approved' and
 *        template_type='website'.
 *   3. No active install → return null (platform fallback).
 *
 * @param tenantId  T3: always pass the resolved tenantId, never user-supplied slug
 * @param db        D1 database binding from the Worker Env
 * @param pageType  Optional page type — when provided, per-page override is consulted
 * @returns         Active template contract, or null for default fallback
 */
export async function resolveTemplate(
  tenantId: string,
  db: D1Like,
  pageType?: WebsitePageType,
): Promise<WebsiteTemplateContract | null> {
  try {
    // Step 1 — per-page override (P0 fix: 0228 was dead code before this call).
    if (pageType) {
      try {
        const override = await db
          .prepare(
            `SELECT override_template_slug
             FROM template_render_overrides
             WHERE tenant_id = ? AND page_type = ?
             LIMIT 1`,
          )
          .bind(tenantId, pageType)
          .first<OverrideRow>();

        if (override?.override_template_slug) {
          if (override.override_template_slug === PLATFORM_DEFAULT_SLUG) {
            // Tenant explicitly wants platform fallback for this page.
            return null;
          }
          const overrideContract = BUILT_IN_TEMPLATES.get(override.override_template_slug);
          if (overrideContract) return overrideContract;
          // Unknown slug in override — log and fall through to workspace install.
          console.warn(
            `[template-resolver] Unknown override slug '${override.override_template_slug}' for tenant ${tenantId} page=${pageType} — falling through to workspace install`,
          );
        }
      } catch (err) {
        // Migration 0228 might not be applied yet on this env — non-fatal.
        const msg = err instanceof Error ? err.message : '';
        if (!msg.includes('no such table')) {
          console.warn('[template-resolver] override lookup error (non-fatal):', err);
        }
      }
    }

    // Step 2 — workspace-level active install. ORDER BY installed_at DESC so a
    // tenant who reinstalls or switches templates deterministically gets the
    // most-recent decision (closes the previously-arbitrary LIMIT 1 ordering).
    const row = await db
      .prepare(
        `SELECT tr.slug AS template_slug, ti.template_version, ti.config_json
         FROM template_installations ti
         JOIN template_registry tr ON tr.id = ti.template_id
         WHERE ti.tenant_id = ?
           AND ti.status = 'active'
           AND tr.template_type = 'website'
           AND tr.status = 'approved'
         ORDER BY ti.installed_at DESC
         LIMIT 1`,
      )
      .bind(tenantId)
      .first<ActiveInstallRow>();

    if (!row) return null;

    const contract = BUILT_IN_TEMPLATES.get(row.template_slug);
    if (!contract) {
      console.warn(
        `[template-resolver] Template slug "${row.template_slug}" installed for tenant ${tenantId} ` +
        `is not in BUILT_IN_TEMPLATES — falling back to default render. ` +
        `Add it to BUILT_IN_TEMPLATES in apps/brand-runtime/src/lib/template-resolver.ts`,
      );
      return null;
    }

    return contract;
  } catch (err) {
    console.error('[template-resolver] DB error resolving template:', err);
    return null;
  }
}

/**
 * Check whether a given page type is supported by the resolved template.
 */
export function templateSupportsPage(
  contract: WebsiteTemplateContract,
  pageType: WebsitePageType,
): boolean {
  return contract.pages.includes(pageType);
}

/**
 * Public list of slugs registered as built-in templates. Exposed so admin/
 * moderation surfaces can validate that an override slug is loadable before
 * persisting it.
 */
export function listBuiltInTemplateSlugs(): string[] {
  return Array.from(BUILT_IN_TEMPLATES.keys());
}

/** Returns a read-only view of all built-in templates. Used by QA scripts. */
export function getAllBuiltInTemplates(): ReadonlyMap<string, WebsiteTemplateContract> {
  return BUILT_IN_TEMPLATES;
}

export type { WebsiteTemplateContract, WebsiteRenderContext, WebsitePageType };
