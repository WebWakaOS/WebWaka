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
import { tyreShopTyreShopServiceTemplate } from '../templates/niches/tyre-shop/tyre-shop-service.js';
import { carWashCarWashDetailingTemplate } from '../templates/niches/car-wash/car-wash-detailing.js';
import { motorcycleAccessoriesMotoAccessoriesShopTemplate } from '../templates/niches/motorcycle-accessories/moto-accessories-shop.js';
import { ironSteelIronSteelMerchantTemplate } from '../templates/niches/iron-steel/iron-steel-merchant.js';
import { paintsDistributorPaintsDistributorSiteTemplate } from '../templates/niches/paints-distributor/paints-distributor-site.js';
import { plumbingSuppliesPlumbingSuppliesDealerTemplate } from '../templates/niches/plumbing-supplies/plumbing-supplies-dealer.js';
import { foodProcessingFoodProcessingFactoryTemplate } from '../templates/niches/food-processing/food-processing-factory.js';
import { produceAggregatorProduceAggregatorSiteTemplate } from '../templates/niches/produce-aggregator/produce-aggregator-site.js';
import { cocoaExporterCocoaExportTraderTemplate } from '../templates/niches/cocoa-exporter/cocoa-export-trader.js';
import { vegetableGardenUrbanVegGardenTemplate } from '../templates/niches/vegetable-garden/urban-veg-garden.js';
import { oilGasServicesOilGasServiceProviderTemplate } from '../templates/niches/oil-gas-services/oil-gas-service-provider.js';
import { artisanalMiningArtisanalMiningOpsTemplate } from '../templates/niches/artisanal-mining/artisanal-mining-ops.js';
import { airportShuttleAirportShuttleBookingTemplate } from '../templates/niches/airport-shuttle/airport-shuttle-booking.js';
import { containerDepotContainerDepotHubTemplate } from '../templates/niches/container-depot/container-depot-hub.js';
import { cargoTruckCargoFleetOpsTemplate } from '../templates/niches/cargo-truck/cargo-fleet-ops.js';
import { funeralHomeFuneralHomeSiteTemplate } from '../templates/niches/funeral-home/funeral-home-site.js';
import { prFirmPrFirmSiteTemplate } from '../templates/niches/pr-firm/pr-firm-site.js';
import { shoemakerShoemakerAtelierTemplate } from '../templates/niches/shoemaker/shoemaker-atelier.js';
import { newspaperDistributionNewspaperDistAgencyTemplate } from '../templates/niches/newspaper-distribution/newspaper-dist-agency.js';
import { laundryServiceLaundryServiceSiteTemplate } from '../templates/niches/laundry-service/laundry-service-site.js';
import { cleaningCompanyCleaningFacilityMgmtTemplate } from '../templates/niches/cleaning-company/cleaning-facility-mgmt.js';
import { internetCafeInternetCafeBusinessCentreTemplate } from '../templates/niches/internet-cafe/internet-cafe-business-centre.js';
import { orphanageOrphanageWelfarePortalTemplate } from '../templates/niches/orphanage/orphanage-welfare-portal.js';
import { sportsClubSportsClubPortalTemplate } from '../templates/niches/sports-club/sports-club-portal.js';
import { bookClubBookClubPlatformTemplate } from '../templates/niches/book-club/book-club-platform.js';
import { pollingUnitRepPollingUnitRepSiteTemplate } from '../templates/niches/polling-unit-rep/polling-unit-rep-site.js';
import { constituencyOfficeConstituencyDevPortalTemplate } from '../templates/niches/constituency-office/constituency-dev-portal.js';
import { governmentAgencyGovtAgencyPortalTemplate } from '../templates/niches/government-agency/govt-agency-portal.js';
import { eventsCentreEventsCentreRentalTemplate } from '../templates/niches/events-centre/events-centre-rental.js';
import { nurserySchoolNurserySchoolSiteTemplate } from '../templates/niches/nursery-school/nursery-school-site.js';
import { autoMechanicGarageSiteTemplate } from '../templates/niches/auto-mechanic/garage-site.js';
import { fuelStationStationSiteTemplate } from '../templates/niches/fuel-station/station-site.js';
import { tailorAtelierSiteTemplate } from '../templates/niches/tailor/atelier-site.js';
import { eventPlannerPlanningSiteTemplate } from '../templates/niches/event-planner/planning-site.js';
import { securityCompanyGuardServiceTemplate } from '../templates/niches/security-company/guard-service.js';
import { constructionBuildingContractorTemplate } from '../templates/niches/construction/building-contractor.js';
import { propertyDeveloperEstateSiteTemplate } from '../templates/niches/property-developer/estate-site.js';
import { cleaningServiceSiteTemplate } from '../templates/niches/cleaning-service/cleaning-service-site.js';
import { printShopPrintBrandingShopTemplate } from '../templates/niches/print-shop/print-branding-shop.js';
import { electronicsRepairElectronicsRepairShopTemplate } from '../templates/niches/electronics-repair/electronics-repair-shop.js';
import { foodVendorStreetFoodSiteTemplate } from '../templates/niches/food-vendor/street-food-site.js';
import { farmFarmProducerSiteTemplate } from '../templates/niches/farm/farm-producer-site.js';
import { agroInputAgroInputDealerTemplate } from '../templates/niches/agro-input/agro-input-dealer.js';
import { coldRoomColdStorageFacilityTemplate } from '../templates/niches/cold-room/cold-storage-facility.js';
import { logisticsDeliveryDeliveryServiceTemplate } from '../templates/niches/logistics-delivery/delivery-service.js';
import { dispatchRiderDispatchRiderNetworkTemplate } from '../templates/niches/dispatch-rider/dispatch-rider-network.js';
import { courierCourierServiceSiteTemplate } from '../templates/niches/courier/courier-service-site.js';
import { clearingAgentClearingForwardingAgentTemplate } from '../templates/niches/clearing-agent/clearing-forwarding-agent.js';
import { furnitureMakerFurnitureWorkshopTemplate } from '../templates/niches/furniture-maker/furniture-workshop.js';
import { weldingFabricationWeldingFabricationShopTemplate } from '../templates/niches/welding-fabrication/welding-fabrication-shop.js';
import { generatorRepairGeneratorRepairHvacTemplate } from '../templates/niches/generator-repair/generator-repair-hvac.js';
import { bookshopBookshopStationeryTemplate } from '../templates/niches/bookshop/bookshop-stationery.js';
import { sportsAcademySportsAcademySiteTemplate } from '../templates/niches/sports-academy/sports-academy-site.js';
import { opticianOpticianEyeClinicTemplate } from '../templates/niches/optician/optician-eye-clinic.js';
import { floristFloristGardenCentreTemplate } from '../templates/niches/florist/florist-garden-centre.js';
import { gasDistributorGasDistributorLpgTemplate } from '../templates/niches/gas-distributor/gas-distributor-lpg.js';
import { waterTreatmentWaterTreatmentBoreholeTemplate } from '../templates/niches/water-treatment/water-treatment-borehole.js';
import { wasteManagementWasteManagementRecyclerTemplate } from '../templates/niches/waste-management/waste-management-recycler.js';
import { solarInstallerSolarInstallerRenewableTemplate } from '../templates/niches/solar-installer/solar-installer-renewable.js';
import { advertisingAgencyAdvertisingAgencySiteTemplate } from '../templates/niches/advertising-agency/advertising-agency-site.js';
import { roadTransportUnionRoadTransportUnionSiteTemplate } from '../templates/niches/road-transport-union/road-transport-union-site.js';
import { pharmacyChainPharmacyChainDrugstoreTemplate } from '../templates/niches/pharmacy-chain/pharmacy-chain-drugstore.js';
import { restaurantChainRestaurantChainOutletTemplate } from '../templates/niches/restaurant-chain/restaurant-chain-outlet.js';
import { accountingFirmAccountingFirmAuditTemplate } from '../templates/niches/accounting-firm/accounting-firm-audit.js';
import { wardRepWardRepCouncillorSiteTemplate } from '../templates/niches/ward-rep/ward-rep-councillor-site.js';
import { bankBranchBankBranchLocationTemplate } from '../templates/niches/bank-branch/bank-branch-location.js';
import { hospitalSecondaryCareTemplate } from '../templates/niches/hospital/secondary-care.js';
import { diagnosticLabMedicalLaboratoryTemplate } from '../templates/niches/diagnostic-lab/medical-laboratory.js';
import { physiotherapyPhysioClinicTemplate } from '../templates/niches/physiotherapy/physio-clinic.js';
import { mentalHealthCounsellingCentreTemplate } from '../templates/niches/mental-health/counselling-centre.js';
import { maternityClinicBirthingCentreTemplate } from '../templates/niches/maternity-clinic/birthing-centre.js';
import { universityHigherEducationTemplate } from '../templates/niches/university/higher-education.js';
import { examPrepCentreExamPrepTemplate } from '../templates/niches/exam-prep-centre/exam-prep.js';
import { elearningPlatformOnlineLearningTemplate } from '../templates/niches/elearning-platform/online-learning.js';
import { tutorialCentreGroupLessonsTemplate } from '../templates/niches/tutorial-centre/group-lessons.js';
import { techAcademyCodingBootcampTemplate } from '../templates/niches/tech-academy/coding-bootcamp.js';
import { microfinanceBankMfbSiteTemplate } from '../templates/niches/microfinance-bank/mfb-site.js';
import { insuranceCompanyUnderwriterSiteTemplate } from '../templates/niches/insurance-company/underwriter-site.js';
import { creditUnionSaccoSiteTemplate } from '../templates/niches/credit-union/sacco-site.js';
import { pensionFundPfaSiteTemplate } from '../templates/niches/pension-fund/pfa-site.js';
import { stockbrokerSecuritiesDealerTemplate } from '../templates/niches/stockbroker/securities-dealer.js';
import { softwareAgencySoftwareAgencySiteTemplate } from '../templates/niches/software-agency/software-agency-site.js';
import { architectureFirmArchitectureSiteTemplate } from '../templates/niches/architecture-firm/architecture-site.js';
import { recruitmentAgencyHrRecruitmentSiteTemplate } from '../templates/niches/recruitment-agency/hr-recruitment-site.js';
import { managementConsultingConsultingSiteTemplate } from '../templates/niches/management-consulting/consulting-site.js';
import { digitalMarketingAgencyDigitalAgencySiteTemplate } from '../templates/niches/digital-marketing-agency/digital-agency-site.js';
import { cacRegistrationAgentCacAgentSiteTemplate } from '../templates/niches/cac-registration-agent/cac-agent-site.js';
import { cybersecurityFirmCybersecuritySiteTemplate } from '../templates/niches/cybersecurity-firm/cybersecurity-site.js';
import { dataAnalyticsFirmDataAnalyticsSiteTemplate } from '../templates/niches/data-analytics-firm/data-analytics-site.js';
import { barLoungeBarLoungeSiteTemplate } from '../templates/niches/bar-lounge/bar-lounge-site.js';
import { resortResortSiteTemplate } from '../templates/niches/resort/resort-site.js';
import { vacationRentalShortletPortfolioTemplate } from '../templates/niches/vacation-rental/shortlet-portfolio.js';
import { foodCourtCanteenSiteTemplate } from '../templates/niches/food-court/canteen-site.js';
import { coworkingSpaceCoworkingSiteTemplate } from '../templates/niches/coworking-space/coworking-site.js';
import { propertyManagementPropertyMgmtSiteTemplate } from '../templates/niches/property-management/property-mgmt-site.js';
import { studentHostelHostelSiteTemplate } from '../templates/niches/student-hostel/hostel-site.js';
import { yogaStudioYogaStudioSiteTemplate } from '../templates/niches/yoga-studio/yoga-studio-site.js';
import { traditionalMedicineHerbalSiteTemplate } from '../templates/niches/traditional-medicine/herbal-site.js';
import { healthFoodStoreSupplementStoreTemplate } from '../templates/niches/health-food-store/supplement-store.js';
import { electronicsStoreElectronicsRetailTemplate } from '../templates/niches/electronics-store/electronics-retail.js';
import { jewelleryShopJewellerySiteTemplate } from '../templates/niches/jewellery-shop/jewellery-site.js';
import { babyShopBabyStoreSiteTemplate } from '../templates/niches/baby-shop/baby-store-site.js';
import { cosmeticsShopCosmeticsRetailTemplate } from '../templates/niches/cosmetics-shop/cosmetics-retail.js';
import { thriftStoreThriftStoreSiteTemplate } from '../templates/niches/thrift-store/thrift-store-site.js';
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
  ['tyre-shop-tyre-shop-service', tyreShopTyreShopServiceTemplate],
  ['car-wash-car-wash-detailing', carWashCarWashDetailingTemplate],
  ['motorcycle-accessories-moto-accessories-shop', motorcycleAccessoriesMotoAccessoriesShopTemplate],
  ['iron-steel-iron-steel-merchant', ironSteelIronSteelMerchantTemplate],
  ['paints-distributor-paints-distributor-site', paintsDistributorPaintsDistributorSiteTemplate],
  ['plumbing-supplies-plumbing-supplies-dealer', plumbingSuppliesPlumbingSuppliesDealerTemplate],
  ['food-processing-food-processing-factory', foodProcessingFoodProcessingFactoryTemplate],
  ['produce-aggregator-produce-aggregator-site', produceAggregatorProduceAggregatorSiteTemplate],
  ['cocoa-exporter-cocoa-export-trader', cocoaExporterCocoaExportTraderTemplate],
  ['vegetable-garden-urban-veg-garden', vegetableGardenUrbanVegGardenTemplate],
  ['oil-gas-services-oil-gas-service-provider', oilGasServicesOilGasServiceProviderTemplate],
  ['artisanal-mining-artisanal-mining-ops', artisanalMiningArtisanalMiningOpsTemplate],
  ['airport-shuttle-airport-shuttle-booking', airportShuttleAirportShuttleBookingTemplate],
  ['container-depot-container-depot-hub', containerDepotContainerDepotHubTemplate],
  ['cargo-truck-cargo-fleet-ops', cargoTruckCargoFleetOpsTemplate],
  ['funeral-home-funeral-home-site', funeralHomeFuneralHomeSiteTemplate],
  ['pr-firm-pr-firm-site', prFirmPrFirmSiteTemplate],
  ['shoemaker-shoemaker-atelier', shoemakerShoemakerAtelierTemplate],
  ['newspaper-distribution-newspaper-dist-agency', newspaperDistributionNewspaperDistAgencyTemplate],
  ['laundry-service-laundry-service-site', laundryServiceLaundryServiceSiteTemplate],
  ['cleaning-company-cleaning-facility-mgmt', cleaningCompanyCleaningFacilityMgmtTemplate],
  ['internet-cafe-internet-cafe-business-centre', internetCafeInternetCafeBusinessCentreTemplate],
  ['orphanage-orphanage-welfare-portal', orphanageOrphanageWelfarePortalTemplate],
  ['sports-club-sports-club-portal', sportsClubSportsClubPortalTemplate],
  ['book-club-book-club-platform', bookClubBookClubPlatformTemplate],
  ['polling-unit-rep-polling-unit-rep-site', pollingUnitRepPollingUnitRepSiteTemplate],
  ['constituency-office-constituency-dev-portal', constituencyOfficeConstituencyDevPortalTemplate],
  ['government-agency-govt-agency-portal', governmentAgencyGovtAgencyPortalTemplate],
  ['events-centre-events-centre-rental', eventsCentreEventsCentreRentalTemplate],
  ['nursery-school-nursery-school-site', nurserySchoolNurserySchoolSiteTemplate],
  ['auto-mechanic-garage-site', autoMechanicGarageSiteTemplate],
  ['fuel-station-station-site', fuelStationStationSiteTemplate],
  ['tailor-atelier-site', tailorAtelierSiteTemplate],
  ['event-planner-planning-site', eventPlannerPlanningSiteTemplate],
  ['security-company-guard-service', securityCompanyGuardServiceTemplate],
  ['construction-building-contractor', constructionBuildingContractorTemplate],
  ['property-developer-estate-site', propertyDeveloperEstateSiteTemplate],
  ['cleaning-service-cleaning-service-site', cleaningServiceSiteTemplate],
  ['print-shop-print-branding-shop', printShopPrintBrandingShopTemplate],
  ['electronics-repair-electronics-repair-shop', electronicsRepairElectronicsRepairShopTemplate],
  ['food-vendor-street-food-site', foodVendorStreetFoodSiteTemplate],
  ['farm-farm-producer-site', farmFarmProducerSiteTemplate],
  ['agro-input-agro-input-dealer', agroInputAgroInputDealerTemplate],
  ['cold-room-cold-storage-facility', coldRoomColdStorageFacilityTemplate],
  ['logistics-delivery-delivery-service', logisticsDeliveryDeliveryServiceTemplate],
  ['dispatch-rider-dispatch-rider-network', dispatchRiderDispatchRiderNetworkTemplate],
  ['courier-courier-service-site', courierCourierServiceSiteTemplate],
  ['clearing-agent-clearing-forwarding-agent', clearingAgentClearingForwardingAgentTemplate],
  ['furniture-maker-furniture-workshop', furnitureMakerFurnitureWorkshopTemplate],
  ['welding-fabrication-welding-fabrication-shop', weldingFabricationWeldingFabricationShopTemplate],
  ['generator-repair-generator-repair-hvac', generatorRepairGeneratorRepairHvacTemplate],
  ['bookshop-bookshop-stationery', bookshopBookshopStationeryTemplate],
  ['sports-academy-sports-academy-site', sportsAcademySportsAcademySiteTemplate],
  ['optician-optician-eye-clinic', opticianOpticianEyeClinicTemplate],
  ['florist-florist-garden-centre', floristFloristGardenCentreTemplate],
  ['gas-distributor-gas-distributor-lpg', gasDistributorGasDistributorLpgTemplate],
  ['water-treatment-water-treatment-borehole', waterTreatmentWaterTreatmentBoreholeTemplate],
  ['waste-management-waste-management-recycler', wasteManagementWasteManagementRecyclerTemplate],
  ['solar-installer-solar-installer-renewable', solarInstallerSolarInstallerRenewableTemplate],
  ['advertising-agency-advertising-agency-site', advertisingAgencyAdvertisingAgencySiteTemplate],
  ['road-transport-union-road-transport-union-site', roadTransportUnionRoadTransportUnionSiteTemplate],
  ['pharmacy-chain-pharmacy-chain-drugstore', pharmacyChainPharmacyChainDrugstoreTemplate],
  ['restaurant-chain-restaurant-chain-outlet', restaurantChainRestaurantChainOutletTemplate],
  ['accounting-firm-accounting-firm-audit', accountingFirmAccountingFirmAuditTemplate],
  ['ward-rep-ward-rep-councillor-site', wardRepWardRepCouncillorSiteTemplate],
  ['bank-branch-bank-branch-location', bankBranchBankBranchLocationTemplate],
  ['hospital-secondary-care', hospitalSecondaryCareTemplate],
  ['diagnostic-lab-medical-laboratory', diagnosticLabMedicalLaboratoryTemplate],
  ['physiotherapy-physio-clinic', physiotherapyPhysioClinicTemplate],
  ['mental-health-counselling-centre', mentalHealthCounsellingCentreTemplate],
  ['maternity-clinic-birthing-centre', maternityClinicBirthingCentreTemplate],
  ['university-higher-education', universityHigherEducationTemplate],
  ['exam-prep-centre-exam-prep', examPrepCentreExamPrepTemplate],
  ['elearning-platform-online-learning', elearningPlatformOnlineLearningTemplate],
  ['tutorial-centre-group-lessons', tutorialCentreGroupLessonsTemplate],
  ['tech-academy-coding-bootcamp', techAcademyCodingBootcampTemplate],
  ['microfinance-bank-mfb-site', microfinanceBankMfbSiteTemplate],
  ['insurance-company-underwriter-site', insuranceCompanyUnderwriterSiteTemplate],
  ['credit-union-sacco-site', creditUnionSaccoSiteTemplate],
  ['pension-fund-pfa-site', pensionFundPfaSiteTemplate],
  ['stockbroker-securities-dealer', stockbrokerSecuritiesDealerTemplate],
  ['software-agency-software-agency-site', softwareAgencySoftwareAgencySiteTemplate],
  ['architecture-firm-architecture-site', architectureFirmArchitectureSiteTemplate],
  ['recruitment-agency-hr-recruitment-site', recruitmentAgencyHrRecruitmentSiteTemplate],
  ['management-consulting-consulting-site', managementConsultingConsultingSiteTemplate],
  ['digital-marketing-agency-digital-agency-site', digitalMarketingAgencyDigitalAgencySiteTemplate],
  ['cac-registration-agent-cac-agent-site', cacRegistrationAgentCacAgentSiteTemplate],
  ['cybersecurity-firm-cybersecurity-site', cybersecurityFirmCybersecuritySiteTemplate],
  ['data-analytics-firm-data-analytics-site', dataAnalyticsFirmDataAnalyticsSiteTemplate],
  ['bar-lounge-bar-lounge-site', barLoungeBarLoungeSiteTemplate],
  ['resort-resort-site', resortResortSiteTemplate],
  ['vacation-rental-shortlet-portfolio', vacationRentalShortletPortfolioTemplate],
  ['food-court-canteen-site', foodCourtCanteenSiteTemplate],
  ['coworking-space-coworking-site', coworkingSpaceCoworkingSiteTemplate],
  ['property-management-property-mgmt-site', propertyManagementPropertyMgmtSiteTemplate],
  ['student-hostel-hostel-site', studentHostelHostelSiteTemplate],
  ['yoga-studio-yoga-studio-site', yogaStudioYogaStudioSiteTemplate],
  ['traditional-medicine-herbal-site', traditionalMedicineHerbalSiteTemplate],
  ['health-food-store-supplement-store', healthFoodStoreSupplementStoreTemplate],
  ['electronics-store-electronics-retail', electronicsStoreElectronicsRetailTemplate],
  ['jewellery-shop-jewellery-site', jewelleryShopJewellerySiteTemplate],
  ['baby-shop-baby-store-site', babyShopBabyStoreSiteTemplate],
  ['cosmetics-shop-cosmetics-retail', cosmeticsShopCosmeticsRetailTemplate],
  ['thrift-store-thrift-store-site', thriftStoreThriftStoreSiteTemplate],
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
