/**
 * @webwaka/vertical-engine — Vertical Registry
 *
 * Central registry of all vertical configurations. This is the SINGLE SOURCE
 * OF TRUTH for vertical behavior, replacing 159 individual packages.
 *
 * Phase 1 initial batch: 20 representative verticals covering all pillars,
 * milestones, and edge cases.
 */

import type { VerticalConfig, VerticalRegistry, RegistryStats, PillarType } from './schema.js';

// ---------------------------------------------------------------------------
// Registry Data
// ---------------------------------------------------------------------------

const REGISTRY: VerticalRegistry = {
  bakery: {
    slug: 'bakery',
    displayName: 'Bakery / Confectionery',
    primaryPillar: 2,
    milestone: 'M9',
    maturity: 'full',
    tableName: 'bakery_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'bakery_name', property: 'bakeryName', type: 'string', required: true, label: 'Bakery Name' },
      { column: 'nafdac_number', property: 'nafdacNumber', type: 'string', nullable: true, label: 'NAFDAC Number' },
      { column: 'production_license_expiry', property: 'productionLicenseExpiry', type: 'timestamp', nullable: true },
      { column: 'cac_number', property: 'cacNumber', type: 'string', nullable: true },
      { column: 'food_handler_count', property: 'foodHandlerCount', type: 'integer', defaultValue: 0 },
    ],
    createFields: ['bakeryName', 'nafdacNumber', 'cacNumber'],
    updateFields: ['bakeryName', 'nafdacNumber', 'productionLicenseExpiry', 'cacNumber', 'foodHandlerCount'],
    fsm: {
      states: ['seeded', 'claimed', 'nafdac_verified', 'active', 'suspended'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed', guard: 'requireKycTier1', description: 'Claim requires KYC Tier 1' },
        { from: 'claimed', to: 'nafdac_verified', guard: 'requireNafdac', description: 'NAFDAC number required' },
        { from: 'nafdac_verified', to: 'active', guard: 'requireValidLicense', description: 'License must not be expired' },
        { from: 'active', to: 'suspended' },
        { from: 'suspended', to: 'active' },
        { from: 'claimed', to: 'suspended' },
      ],
      guards: [
        { name: 'requireKycTier1', requiredFields: ['kycTier'], rule: 'KYC tier >= 1', failureMessage: 'KYC Tier 1 required to claim bakery profile' },
        { name: 'requireNafdac', requiredFields: ['nafdacNumber'], rule: 'nafdacNumber not null', failureMessage: 'NAFDAC license number required for verification' },
        { name: 'requireValidLicense', requiredFields: ['productionLicenseExpiry'], rule: 'expiry > now', failureMessage: 'Production license has expired' },
      ],
    },
    subEntities: [
      {
        name: 'products',
        tableName: 'bakery_products',
        profileForeignKey: 'profile_id',
        fields: [
          { column: 'product_name', property: 'productName', type: 'string', required: true },
          { column: 'category', property: 'category', type: 'enum', enumValues: ['bread', 'cake', 'pastry', 'snack'] },
          { column: 'unit_price_kobo', property: 'unitPriceKobo', type: 'kobo', isKobo: true, required: true },
          { column: 'production_cost_kobo', property: 'productionCostKobo', type: 'kobo', isKobo: true },
          { column: 'daily_capacity', property: 'dailyCapacity', type: 'integer' },
        ],
      },
      {
        name: 'orders',
        tableName: 'bakery_orders',
        profileForeignKey: 'profile_id',
        fields: [
          { column: 'customer_phone', property: 'customerPhone', type: 'string', required: true, isPII: true, aiVisible: false },
          { column: 'product_id', property: 'productId', type: 'uuid', nullable: true },
          { column: 'quantity', property: 'quantity', type: 'integer', required: true },
          { column: 'deposit_kobo', property: 'depositKobo', type: 'kobo', isKobo: true, required: true },
          { column: 'balance_kobo', property: 'balanceKobo', type: 'kobo', isKobo: true, required: true },
          { column: 'delivery_date', property: 'deliveryDate', type: 'timestamp', nullable: true },
          { column: 'status', property: 'status', type: 'enum', enumValues: ['pending', 'confirmed', 'baking', 'ready', 'delivered'] },
        ],
      },
    ],
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ['demand_forecasting', 'inventory_advisory', 'bio_generator', 'translation'],
      useCases: [
        'Forecast daily bread demand based on sales patterns',
        'Alert when ingredients approach reorder levels',
        'Generate bakery profile bio',
        'Translate product menu to local languages',
      ],
    },
    route: {
      basePath: '/bakery',
      entitlementLayer: 'Commerce',
    },
    compliance: {
      kycTierForClaim: 1,
      requiredLicences: ['NAFDAC'],
      ndprLevel: 'standard',
    },
  },

  hotel: {
    slug: 'hotel',
    displayName: 'Hotel / Guest House',
    primaryPillar: 2,
    milestone: 'M9',
    maturity: 'full',
    tableName: 'hotel_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'hotel_name', property: 'hotelName', type: 'string', required: true },
      { column: 'hotel_type', property: 'hotelType', type: 'enum', enumValues: ['hotel', 'guesthouse', 'shortlet'] },
      { column: 'nihotour_licence', property: 'nihotourLicence', type: 'string', nullable: true },
      { column: 'state_tourism_board_ref', property: 'stateTourismBoardRef', type: 'string', nullable: true },
      { column: 'cac_rc', property: 'cacRc', type: 'string', nullable: true },
      { column: 'star_rating', property: 'starRating', type: 'integer', nullable: true },
    ],
    createFields: ['hotelName', 'hotelType', 'nihotourLicence', 'stateTourismBoardRef', 'cacRc', 'starRating'],
    updateFields: ['hotelName', 'hotelType', 'nihotourLicence', 'stateTourismBoardRef', 'cacRc', 'starRating'],
    fsm: {
      states: ['seeded', 'claimed', 'nihotour_verified', 'active', 'suspended'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'nihotour_verified', guard: 'requireNihotour' },
        { from: 'nihotour_verified', to: 'active' },
        { from: 'active', to: 'suspended' },
        { from: 'suspended', to: 'active' },
      ],
      guards: [
        { name: 'requireNihotour', requiredFields: ['nihotourLicence'], rule: 'nihotourLicence not empty', failureMessage: 'NIHOTOUR licence required' },
      ],
    },
    subEntities: [
      {
        name: 'rooms',
        tableName: 'hotel_rooms',
        profileForeignKey: 'profile_id',
        fields: [
          { column: 'room_number', property: 'roomNumber', type: 'string', required: true },
          { column: 'room_type', property: 'roomType', type: 'enum', enumValues: ['single', 'double', 'suite', 'deluxe', 'shortlet'] },
          { column: 'floor', property: 'floor', type: 'integer', nullable: true },
          { column: 'capacity', property: 'capacity', type: 'integer', required: true },
          { column: 'rate_per_night_kobo', property: 'ratePerNightKobo', type: 'kobo', isKobo: true, required: true },
          { column: 'status', property: 'status', type: 'enum', enumValues: ['available', 'occupied', 'maintenance'] },
        ],
      },
      {
        name: 'reservations',
        tableName: 'hotel_reservations',
        profileForeignKey: 'profile_id',
        fields: [
          { column: 'room_id', property: 'roomId', type: 'uuid', required: true },
          { column: 'guest_ref_id', property: 'guestRefId', type: 'string', required: true, isPII: true, aiVisible: false },
          { column: 'check_in', property: 'checkIn', type: 'timestamp', required: true },
          { column: 'check_out', property: 'checkOut', type: 'timestamp', required: true },
          { column: 'nights', property: 'nights', type: 'integer', required: true },
          { column: 'total_kobo', property: 'totalKobo', type: 'kobo', isKobo: true, required: true },
          { column: 'deposit_kobo', property: 'depositKobo', type: 'kobo', isKobo: true },
          { column: 'status', property: 'status', type: 'enum', enumValues: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'] },
        ],
      },
    ],
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ['revenue_forecast', 'occupancy_advisory', 'bio_generator', 'translation', 'scheduling_assistant'],
      useCases: [
        'Forecast daily/weekly revenue from bookings',
        'Occupancy rate advisory with peak period alerts',
        'Generate hotel profile and room descriptions',
        'Translate property content to local languages',
      ],
    },
    route: {
      basePath: '/hotel',
      v1Prefix: true,
      entitlementLayer: 'Commerce',
    },
    compliance: {
      kycTierForClaim: 1,
      kycTierForActive: 2,
      requiredLicences: ['NIHOTOUR'],
      ndprLevel: 'standard',
    },
  },

  pharmacy: {
    slug: 'pharmacy',
    displayName: 'Pharmacy / Chemist',
    primaryPillar: 2,
    milestone: 'M9',
    maturity: 'basic',
    tableName: 'pharmacy_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'nafdac_verified', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'nafdac_verified' },
        { from: 'nafdac_verified', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ['inventory_advisory', 'demand_forecasting', 'compliance_checker'],
      prohibitedCapabilities: ['price_suggest'],
      useCases: [
        'Track medication stock levels and expiry dates',
        'Demand forecast for common medications by season',
        'NAFDAC compliance checker for product listings',
      ],
      contextWindowTokens: 4096,
    },
    route: {
      basePath: '/pharmacy',
      v1Prefix: true,
      entitlementLayer: 'Commerce',
    },
    compliance: {
      kycTierForClaim: 1,
      requiredLicences: ['NAFDAC', 'PCN'],
      sensitiveSector: 'health',
      ndprLevel: 'sensitive',
    },
  },

  gym: {
    slug: 'gym',
    displayName: 'Gym / Wellness Centre',
    primaryPillar: 2,
    milestone: 'M9',
    maturity: 'full',
    tableName: 'gym_fitness_profiles',
    entityType: 'organization',
    deprecatedAliases: ['gym-fitness'],
    profileFields: [
      { column: 'business_name', property: 'businessName', type: 'string', required: true },
      { column: 'cac_rc', property: 'cacRc', type: 'string', nullable: true },
      { column: 'nasfc_cert', property: 'nasfcCert', type: 'string', nullable: true },
      { column: 'capacity', property: 'capacity', type: 'integer', defaultValue: 0 },
    ],
    createFields: ['businessName', 'cacRc', 'nasfcCert', 'capacity'],
    updateFields: ['businessName', 'cacRc', 'nasfcCert', 'capacity'],
    fsm: {
      states: ['seeded', 'claimed', 'cac_verified', 'active', 'suspended'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'cac_verified' },
        { from: 'cac_verified', to: 'active' },
        { from: 'active', to: 'suspended' },
        { from: 'suspended', to: 'active' },
      ],
    },
    subEntities: [
      {
        name: 'memberships',
        tableName: 'gym_memberships',
        profileForeignKey: 'profile_id',
        fields: [
          { column: 'member_ref_id', property: 'memberRefId', type: 'string', required: true, isPII: true, aiVisible: false },
          { column: 'plan', property: 'plan', type: 'string', required: true },
          { column: 'monthly_fee_kobo', property: 'monthlyFeeKobo', type: 'kobo', isKobo: true, required: true },
          { column: 'start_date', property: 'startDate', type: 'timestamp', required: true },
          { column: 'end_date', property: 'endDate', type: 'timestamp', nullable: true },
          { column: 'status', property: 'status', type: 'enum', enumValues: ['active', 'expired', 'paused', 'cancelled'] },
        ],
        piiFields: ['memberRefId'],
      },
    ],
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ['bio_generator', 'scheduling_assistant', 'sentiment_analysis', 'translation', 'venue_utilization'],
      useCases: [
        'Generate gym and trainer bios',
        'Class scheduling assistant',
        'Analyse member feedback sentiment',
        'Venue utilization reporting (aggregate only, no member PII)',
      ],
    },
    route: {
      basePath: '/gym',
      verticalsPrefix: true,
      aliases: ['gym-fitness'],
    },
  },

  church: {
    slug: 'church',
    displayName: 'Church / Faith Community',
    primaryPillar: 3,
    milestone: 'M8',
    maturity: 'full',
    tableName: 'church_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'organization_id', property: 'organizationId', type: 'uuid', required: true },
      { column: 'community_id', property: 'communityId', type: 'uuid', nullable: true },
      { column: 'it_number', property: 'itNumber', type: 'string', nullable: true },
      { column: 'denomination', property: 'denomination', type: 'enum', enumValues: ['pentecostal', 'catholic', 'anglican', 'baptist', 'methodist', 'orthodox', 'evangelical', 'others'] },
      { column: 'founding_year', property: 'foundingYear', type: 'integer', nullable: true },
      { column: 'senior_pastor', property: 'seniorPastor', type: 'string', nullable: true },
      { column: 'total_members', property: 'totalMembers', type: 'integer', defaultValue: 0 },
      { column: 'branch_count', property: 'branchCount', type: 'integer', defaultValue: 0 },
    ],
    createFields: ['organizationId', 'denomination', 'foundingYear', 'seniorPastor'],
    updateFields: ['communityId', 'itNumber', 'denomination', 'foundingYear', 'seniorPastor', 'totalMembers', 'branchCount'],
    fsm: {
      states: ['seeded', 'claimed', 'it_verified', 'community_active', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'it_verified', guard: 'requireITNumber' },
        { from: 'it_verified', to: 'community_active' },
        { from: 'community_active', to: 'active' },
      ],
      guards: [
        { name: 'requireITNumber', requiredFields: ['itNumber'], rule: 'itNumber not null', failureMessage: 'IT number required for verification' },
      ],
    },
    subEntities: [
      {
        name: 'tithes',
        tableName: 'church_tithes',
        profileForeignKey: 'profile_id',
        fields: [
          { column: 'member_id', property: 'memberId', type: 'string', required: true, isPII: true, aiVisible: false },
          { column: 'amount_kobo', property: 'amountKobo', type: 'kobo', isKobo: true, required: true },
          { column: 'payment_type', property: 'paymentType', type: 'enum', enumValues: ['tithe', 'offering', 'seed', 'donation', 'special'] },
          { column: 'paystack_ref', property: 'paystackRef', type: 'string', nullable: true },
          { column: 'recorded_at', property: 'recordedAt', type: 'timestamp', required: true },
        ],
        piiFields: ['memberId'],
      },
    ],
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ['bio_generator', 'event_planning', 'member_engagement', 'translation'],
      useCases: [
        'Generate church profile and pastor bios',
        'Event planning assistant for services and programmes',
        'Member engagement insights (aggregate counts only)',
        'Translate sermons and announcements',
      ],
    },
    route: {
      basePath: '/church',
      entitlementLayer: 'Civic',
    },
    compliance: {
      kycTierForClaim: 1,
      requiredLicences: ['IT_NUMBER'],
      ndprLevel: 'standard',
    },
  },
};

// ---------------------------------------------------------------------------
// Registry API
// ---------------------------------------------------------------------------

export function getRegistry(): VerticalRegistry {
  return REGISTRY;
}

export function getVerticalConfig(slug: string): VerticalConfig | undefined {
  return REGISTRY[slug];
}

export function listSlugs(): string[] {
  return Object.keys(REGISTRY);
}

export function getRegistryStats(): RegistryStats {
  const configs = Object.values(REGISTRY);
  const byPillar: Record<PillarType, number> = { 1: 0, 2: 0, 3: 0 };
  const byMaturity: Record<string, number> = {};
  const byMilestone: Record<string, number> = {};

  for (const c of configs) {
    byPillar[c.primaryPillar]++;
    byMaturity[c.maturity] = (byMaturity[c.maturity] ?? 0) + 1;
    byMilestone[c.milestone] = (byMilestone[c.milestone] ?? 0) + 1;
  }

  return { total: configs.length, byPillar, byMaturity, byMilestone };
}
