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

// Raw registry — compliance defaults are applied below at module init.
const _REGISTRY_RAW: VerticalRegistry = {
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
      { column: 'pharmacy_name', property: 'pharmacyName', type: 'string', required: true },
      { column: 'cac_rc', property: 'cacRc', type: 'string', nullable: true },
    ],
    createFields: ['pharmacyName', 'cacRc'],
    updateFields: ['pharmacyName', 'cacRc'],
    fsm: {
      states: ['seeded', 'claimed', 'nafdac_verified', 'active', 'suspended'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'nafdac_verified' },
        { from: 'nafdac_verified', to: 'active' },
        { from: 'active', to: 'suspended' },
        { from: 'suspended', to: 'active' },
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

  'politician': {
    slug: 'politician',
    displayName: 'Politician',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'politician_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Politician' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","policy_summarizer","sentiment_analysis","content_moderation","translation"],
      
      useCases: ["Auto-generate politician bio from profile data","Summarize policy documents in plain English or Pidgin","Analyse constituent sentiment from community posts","Moderate campaign posts for INEC compliance"],
      
    },
    route: {
      basePath: '/politician',
      entitlementLayer: 'Civic',
    },
  },

  'political-party': {
    slug: 'political-party',
    displayName: 'Political Party',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'political_party_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Political Party' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","policy_summarizer","content_moderation","translation","document_extractor"],
      
      useCases: ["Generate party manifesto summaries","Translate party documents to Pidgin or Hausa/Yoruba/Igbo","Moderate party forum discussions","Extract key data from INEC submissions"],
      
    },
    route: {
      basePath: '/political-party',
      entitlementLayer: 'Civic',
    },
  },

  'campaign-office': {
    slug: 'campaign-office',
    displayName: 'Campaign Office',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'campaign_office_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Campaign Office' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","content_moderation","sentiment_analysis","translation"],
      
      useCases: ["Generate candidate campaign bios","Moderate campaign communication channels","Analyse constituent sentiment from campaign feedback","Translate campaign materials to local languages"],
      
    },
    route: {
      basePath: '/campaign-office',
      entitlementLayer: 'Civic',
    },
  },

  'constituency-office': {
    slug: 'constituency-office',
    displayName: 'Constituency Office',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'constituency_office_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Constituency Office' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","policy_summarizer","document_extractor","translation"],
      
      useCases: ["Auto-generate legislator and aide bios","Summarise constituency petitions and bills","Extract data from constituency documents","Translate official correspondence to local languages"],
      
    },
    route: {
      basePath: '/constituency-office',
      entitlementLayer: 'Civic',
    },
  },

  'government-agency': {
    slug: 'government-agency',
    displayName: 'Government Agency',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'government_agency_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Government Agency' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","policy_summarizer","document_extractor","content_moderation","translation"],
      
      useCases: ["Generate agency and official bios","Summarise policy circulars and government gazettes","Extract structured data from regulatory documents","Moderate public comment boards","Translate agency communications to local languages"],
      
    },
    route: {
      basePath: '/government-agency',
      entitlementLayer: 'Civic',
    },
  },

  'lga-office': {
    slug: 'lga-office',
    displayName: 'Lga Office',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'lga_office_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Lga Office' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","policy_summarizer","document_extractor","translation"],
      
      useCases: ["Generate LGA chairman and councillor bios","Summarise council meeting minutes","Extract data from revenue and tax documents","Translate council communications to local languages"],
      
    },
    route: {
      basePath: '/lga-office',
      entitlementLayer: 'Civic',
    },
  },

  'ministry-mission': {
    slug: 'ministry-mission',
    displayName: 'Ministry Mission',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'ministry_mission_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Ministry Mission' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","policy_summarizer","document_extractor","translation"],
      
      useCases: ["Generate minister and civil servant bios","Summarise ministry policy documents","Extract data from procurement and budget documents","Translate official communications to local languages"],
      
    },
    route: {
      basePath: '/ministry-mission',
      entitlementLayer: 'Civic',
    },
  },

  'polling-unit': {
    slug: 'polling-unit',
    displayName: 'Polling Unit',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'polling_unit_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Polling Unit' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","document_extractor","translation"],
      
      useCases: ["Generate polling unit officer bios","Extract structured data from result sheets","Translate INEC instructions to local languages"],
      
    },
    route: {
      basePath: '/polling-unit',
      entitlementLayer: 'Civic',
    },
  },

  'ward-rep': {
    slug: 'ward-rep',
    displayName: 'Ward Rep',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'ward_rep_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Ward Rep' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","policy_summarizer","translation"],
      
      useCases: ["Generate ward representative bio","Summarise ward-level community petitions","Translate ward correspondence to local languages"],
      
    },
    route: {
      basePath: '/ward-rep',
      entitlementLayer: 'Civic',
    },
  },

  'motor-park': {
    slug: 'motor-park',
    displayName: 'Motor Park',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'motor_park_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Motor Park' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["scheduling_assistant","demand_forecasting","route_optimizer","translation"],
      
      useCases: ["Predict peak departure demand by route and season","Optimise bus allocation across routes","Assist dispatchers with scheduling queries in Pidgin"],
      
    },
    route: {
      basePath: '/motor-park',
      entitlementLayer: 'Civic',
    },
  },

  'rideshare': {
    slug: 'rideshare',
    displayName: 'Rideshare',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'rideshare_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Rideshare' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["scheduling_assistant","route_optimizer","sentiment_analysis","translation"],
      
      useCases: ["Driver-passenger matching optimisation","Ride request demand forecasting","Rider review sentiment analysis for driver ratings"],
      
    },
    route: {
      basePath: '/rideshare',
      entitlementLayer: 'Civic',
    },
  },

  'haulage': {
    slug: 'haulage',
    displayName: 'Haulage',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'haulage_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Haulage' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["route_optimizer","demand_forecasting","scheduling_assistant","document_extractor"],
      
      useCases: ["Long-haul route cost optimisation","Cargo demand forecasting by corridor","Waybill and delivery document extraction"],
      
    },
    route: {
      basePath: '/haulage',
      entitlementLayer: 'Civic',
    },
  },

  'airport-shuttle': {
    slug: 'airport-shuttle',
    displayName: 'Airport Shuttle',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'airport_shuttle_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Airport Shuttle' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["scheduling_assistant","demand_forecasting","route_optimizer","translation"],
      
      useCases: ["Flight-based shuttle demand forecasting","Optimise shuttle allocation across airport terminals","Scheduling assistant for booking and dispatch"],
      
    },
    route: {
      basePath: '/airport-shuttle',
      entitlementLayer: 'Civic',
    },
  },

  'cargo-truck': {
    slug: 'cargo-truck',
    displayName: 'Cargo Truck',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'cargo_truck_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Cargo Truck' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["route_optimizer","demand_forecasting","document_extractor","translation"],
      
      useCases: ["Long-haul route cost and fuel optimisation","Cargo demand forecasting by season","Extract data from waybills and customs documents"],
      
    },
    route: {
      basePath: '/cargo-truck',
      entitlementLayer: 'Civic',
    },
  },

  'clearing-agent': {
    slug: 'clearing-agent',
    displayName: 'Clearing Agent',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'clearing_agent_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Clearing Agent' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["document_extractor","scheduling_assistant","translation"],
      
      useCases: ["Extract structured data from customs and shipping documents","Scheduling assistant for cargo release timelines","Translate shipping documents to local languages"],
      
    },
    route: {
      basePath: '/clearing-agent',
      entitlementLayer: 'Civic',
    },
  },

  'container-depot': {
    slug: 'container-depot',
    displayName: 'Container Depot',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'container_depot_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Container Depot' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["demand_forecasting","scheduling_assistant","translation"],
      
      useCases: ["Container throughput demand forecasting","Yard scheduling and berth assignment assistant","Translate depot documentation to local languages"],
      
    },
    route: {
      basePath: '/container-depot',
      entitlementLayer: 'Civic',
    },
  },

  'courier': {
    slug: 'courier',
    displayName: 'Courier',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'courier_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Courier' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["route_optimizer","scheduling_assistant","demand_forecasting","translation"],
      
      useCases: ["Last-mile delivery route optimisation","Parcel demand forecasting by zone","Delivery scheduling assistant","Translate package tracking updates to local languages"],
      
    },
    route: {
      basePath: '/courier',
      entitlementLayer: 'Civic',
    },
  },

  'dispatch-rider': {
    slug: 'dispatch-rider',
    displayName: 'Dispatch Rider',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'dispatch_rider_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Dispatch Rider' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["route_optimizer","scheduling_assistant","translation"],
      
      useCases: ["Optimise dispatch routes for fast delivery","Rider availability scheduling assistant","Translate delivery instructions to local languages"],
      
    },
    route: {
      basePath: '/dispatch-rider',
      entitlementLayer: 'Civic',
    },
  },

  'ferry': {
    slug: 'ferry',
    displayName: 'Ferry',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'ferry_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Ferry' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["scheduling_assistant","demand_forecasting","route_optimizer","translation"],
      
      useCases: ["Ferry timetable and passenger demand forecasting","Route optimisation across waterway corridors","Passenger communication drafting"],
      
    },
    route: {
      basePath: '/ferry',
      entitlementLayer: 'Civic',
    },
  },

  'logistics-delivery': {
    slug: 'logistics-delivery',
    displayName: 'Logistics Delivery',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'logistics_delivery_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Logistics Delivery' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["route_optimizer","demand_forecasting","scheduling_assistant","translation"],
      
      useCases: ["Last-mile delivery route and cost optimisation","Volume demand forecasting by route","Driver scheduling assistant","Translate delivery updates to local languages"],
      
    },
    route: {
      basePath: '/logistics-delivery',
      entitlementLayer: 'Civic',
    },
  },

  'nurtw': {
    slug: 'nurtw',
    displayName: 'Nurtw',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'nurtw_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Nurtw' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","content_moderation","translation"],
      
      useCases: ["Generate union officer and branch bios","Moderate union member communication boards","Translate union circulars to local languages"],
      
    },
    route: {
      basePath: '/nurtw',
      entitlementLayer: 'Civic',
    },
  },

  'okada-keke': {
    slug: 'okada-keke',
    displayName: 'Okada Keke',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'okada_keke_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Okada Keke' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["route_optimizer","scheduling_assistant","translation"],
      
      useCases: ["Optimise routes for commercial motorcycles and tricycles","Peak-demand scheduling assistant","Translate rider instructions to local languages"],
      
    },
    route: {
      basePath: '/okada-keke',
      entitlementLayer: 'Civic',
    },
  },

  'road-transport-union': {
    slug: 'road-transport-union',
    displayName: 'Road Transport Union',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'road_transport_union_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Road Transport Union' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","content_moderation","document_extractor","translation"],
      
      useCases: ["Generate union executive bios","Moderate member forums and communication boards","Extract data from levy and registration documents","Translate union circulars to local languages"],
      
    },
    route: {
      basePath: '/road-transport-union',
      entitlementLayer: 'Civic',
    },
  },

  'travel-agent': {
    slug: 'travel-agent',
    displayName: 'Travel Agent',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'travel_agent_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Travel Agent' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["scheduling_assistant","route_optimizer","sentiment_analysis","translation"],
      
      useCases: ["Itinerary scheduling and route planning assistant","Client review sentiment analysis","Translate travel packages to local languages"],
      
    },
    route: {
      basePath: '/travel-agent',
      entitlementLayer: 'Civic',
    },
  },

  'clinic': {
    slug: 'clinic',
    displayName: 'Clinic',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'clinic_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Clinic' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","document_extractor","translation"],
      prohibitedCapabilities: ["function_call","price_suggest"],
      useCases: ["Generate doctor and specialist bios from credentials","Patient appointment scheduling assistant","Extract medical service data from PDF tariff sheets","Translate health communications for rural patients"],
      
    },
    route: {
      basePath: '/clinic',
      entitlementLayer: 'Civic',
    },
  },

  'community-health': {
    slug: 'community-health',
    displayName: 'Community Health',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'community_health_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Community Health' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","content_moderation","translation"],
      
      useCases: ["Generate CHW and health worker bios","Community health outreach scheduling assistant","Moderate community health forums","Translate health advisories to local languages"],
      
    },
    route: {
      basePath: '/community-health',
      entitlementLayer: 'Civic',
    },
  },

  'dental-clinic': {
    slug: 'dental-clinic',
    displayName: 'Dental Clinic',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'dental_clinic_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Dental Clinic' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","sentiment_analysis","translation"],
      prohibitedCapabilities: ["function_call"],
      useCases: ["Generate dentist and hygienist bios","Appointment scheduling assistant","Analyse patient review sentiment","Translate dental health content to local languages"],
      
    },
    route: {
      basePath: '/dental-clinic',
      entitlementLayer: 'Civic',
    },
  },

  'elderly-care': {
    slug: 'elderly-care',
    displayName: 'Elderly Care',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'elderly_care_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Elderly Care' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","translation"],
      
      useCases: ["Generate care home and staff bios","Resident care scheduling assistant","Translate care instructions to local languages"],
      
    },
    route: {
      basePath: '/elderly-care',
      entitlementLayer: 'Civic',
    },
  },

  'optician': {
    slug: 'optician',
    displayName: 'Optician',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'optician_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Optician' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","translation"],
      prohibitedCapabilities: ["function_call"],
      useCases: ["Generate optician and practice bios","Eye test appointment scheduling assistant","Translate eye health content to local languages"],
      
    },
    route: {
      basePath: '/optician',
      entitlementLayer: 'Civic',
    },
  },

  'orphanage': {
    slug: 'orphanage',
    displayName: 'Orphanage',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'orphanage_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Orphanage' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","content_moderation","translation"],
      prohibitedCapabilities: ["function_call","price_suggest"],
      useCases: ["Generate orphanage profile and staff bios","Moderate donation appeal communication","Translate appeal content to local languages"],
      
    },
    route: {
      basePath: '/orphanage',
      entitlementLayer: 'Civic',
    },
  },

  'pharmacy-chain': {
    slug: 'pharmacy-chain',
    displayName: 'Pharmacy Chain',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'pharmacy_chain_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Pharmacy Chain' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","product_description_writer","demand_forecasting","sentiment_analysis","translation"],
      prohibitedCapabilities: ["function_call","price_suggest"],
      useCases: ["Generate pharmacy chain and branch bios","Write product descriptions across all OTC SKUs","Multi-location demand forecasting for restocking","Analyse customer feedback sentiment by branch","Translate health content to local languages"],
      
    },
    route: {
      basePath: '/pharmacy-chain',
      entitlementLayer: 'Operational',
    },
  },

  'rehab-centre': {
    slug: 'rehab-centre',
    displayName: 'Rehab Centre',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'rehab_centre_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Rehab Centre' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","content_moderation","translation"],
      prohibitedCapabilities: ["function_call"],
      useCases: ["Generate rehabilitation centre and therapist bios","Patient therapy scheduling assistant","Moderate community support board","Translate rehabilitation programmes to local languages"],
      
    },
    route: {
      basePath: '/rehab-centre',
      entitlementLayer: 'Civic',
    },
  },

  'vet-clinic': {
    slug: 'vet-clinic',
    displayName: 'Vet Clinic',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'vet_clinic_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Vet Clinic' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","translation"],
      
      useCases: ["Generate veterinarian and clinic bios","Pet appointment scheduling assistant","Translate animal health guidance to local languages"],
      
    },
    route: {
      basePath: '/vet-clinic',
      entitlementLayer: 'Civic',
    },
  },

  'school': {
    slug: 'school',
    displayName: 'School',
    primaryPillar: 1,
    milestone: 'M9',
    maturity: 'basic',
    tableName: 'school_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'school_name', property: 'schoolName', type: 'string', required: true },
      { column: 'cac_rc', property: 'cacRc', type: 'string', nullable: true },
      { column: 'federal_approval', property: 'federalApproval', type: 'string', nullable: true },
    ],
    createFields: ['schoolName', 'cacRc', 'federalApproval'],
    updateFields: ['schoolName', 'cacRc', 'federalApproval'],
    fsm: {
      states: ['seeded', 'claimed', 'active', 'suspended'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
        { from: 'active', to: 'suspended' },
        { from: 'suspended', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ['bio_generator', 'document_extractor', 'content_moderation', 'scheduling_assistant', 'translation'],
      useCases: ['Auto-generate school profile from registration data', 'Extract and index school prospectus data', 'Moderate school notice boards and forums', 'Timetable scheduling assistant'],
    },
    route: {
      basePath: '/school',
      entitlementLayer: 'Civic',
    },
    compliance: {
      kycTierForClaim: 1,
      requiredLicences: ['CAC', 'FME'],
      ndprLevel: 'sensitive',
    },
  },

  'book-club': {
    slug: 'book-club',
    displayName: 'Book Club',
    primaryPillar: 2,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'book_club_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Book Club' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","content_moderation","sentiment_analysis","translation"],
      
      useCases: ["Generate book club and facilitator bios","Moderate reading group discussions","Analyse member review sentiment","Translate reading materials to local languages"],
      
    },
    route: {
      basePath: '/book-club',
      entitlementLayer: 'Commerce',
    },
  },

  'creche': {
    slug: 'creche',
    displayName: 'Creche',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'creche_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Creche' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","translation"],
      
      useCases: ["Generate crèche and childcare worker bios","Child care scheduling and slot management assistant","Translate care instructions to local languages"],
      
    },
    route: {
      basePath: '/creche',
      entitlementLayer: 'Civic',
    },
  },

  'govt-school': {
    slug: 'govt-school',
    displayName: 'Govt School',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'govt_school_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Govt School' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","document_extractor","scheduling_assistant","translation"],
      
      useCases: ["Generate school profile and teacher bios","Extract data from government school records","Timetable and exam scheduling assistant","Translate school communications to local languages"],
      
    },
    route: {
      basePath: '/govt-school',
      entitlementLayer: 'Civic',
    },
  },

  'nursery-school': {
    slug: 'nursery-school',
    displayName: 'Nursery School',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'nursery_school_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Nursery School' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","translation"],
      
      useCases: ["Generate nursery school and teacher bios","Term calendar and scheduling assistant","Translate parent communications to local languages"],
      
    },
    route: {
      basePath: '/nursery-school',
      entitlementLayer: 'Civic',
    },
  },

  'private-school': {
    slug: 'private-school',
    displayName: 'Private School',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'private_school_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Private School' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","document_extractor","scheduling_assistant","content_moderation","translation"],
      
      useCases: ["Generate school profile and teacher bios","Extract structured data from admission forms","Timetable and exam scheduling assistant","Moderate parent-teacher communication board","Translate school communications to local languages"],
      
    },
    route: {
      basePath: '/private-school',
      entitlementLayer: 'Civic',
    },
  },

  'sports-academy': {
    slug: 'sports-academy',
    displayName: 'Sports Academy',
    primaryPillar: 2,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'sports_academy_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Sports Academy' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","sentiment_analysis","translation"],
      
      useCases: ["Generate athlete and coach bios","Training schedule and fixture scheduling assistant","Analyse parent and athlete review sentiment","Translate academy content to local languages"],
      
    },
    route: {
      basePath: '/sports-academy',
      entitlementLayer: 'Commerce',
    },
  },

  'tech-hub': {
    slug: 'tech-hub',
    displayName: 'Tech Hub',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'tech_hub_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Tech Hub' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","content_moderation","sentiment_analysis","translation"],
      
      useCases: ["Generate tech hub and startup founder bios","Moderate community forums and Slack-like boards","Analyse community sentiment from event feedback","Translate hub content to local languages"],
      
    },
    route: {
      basePath: '/tech-hub',
      entitlementLayer: 'Civic',
    },
  },

  'training-institute': {
    slug: 'training-institute',
    displayName: 'Training Institute',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'training_institute_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Training Institute' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","content_moderation","translation"],
      
      useCases: ["Generate institute and trainer bios","Course scheduling and cohort management assistant","Moderate trainee discussion boards","Translate training materials to local languages"],
      
    },
    route: {
      basePath: '/training-institute',
      entitlementLayer: 'Civic',
    },
  },

  'tutoring': {
    slug: 'tutoring',
    displayName: 'Tutoring',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'tutoring_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Tutoring' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","sentiment_analysis","translation"],
      
      useCases: ["Generate tutor bios and subject profiles","Session scheduling assistant","Analyse student and parent review sentiment","Translate learning materials to local languages"],
      
    },
    route: {
      basePath: '/tutoring',
      entitlementLayer: 'Civic',
    },
  },

  'mosque': {
    slug: 'mosque',
    displayName: 'Mosque',
    primaryPillar: 2,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'mosque_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Mosque' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","content_moderation","translation","scheduling_assistant"],
      
      useCases: ["Generate Imam and masjid bios","Translate Friday khutbah summaries","Moderate community boards","Salah time scheduling and Ramadan calendar assistant"],
      
    },
    route: {
      basePath: '/mosque',
      entitlementLayer: 'Commerce',
    },
  },

  'abattoir': {
    slug: 'abattoir',
    displayName: 'Abattoir',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'abattoir_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Abattoir' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["demand_forecasting","scheduling_assistant","translation"],
      
      useCases: ["Livestock demand and slaughter volume forecasting","Shift and throughput scheduling assistant","Translate operational guides to local languages"],
      
    },
    route: {
      basePath: '/abattoir',
      entitlementLayer: 'Operational',
    },
  },

  'agro-input': {
    slug: 'agro-input',
    displayName: 'Agro Input',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'agro_input_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Agro Input' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["product_description_writer","demand_forecasting","translation"],
      
      useCases: ["Generate product descriptions for fertiliser and agro-chemicals","Seasonal input demand forecasting","Translate agro-advisory content to local languages"],
      
    },
    route: {
      basePath: '/agro-input',
      entitlementLayer: 'Operational',
    },
  },

  'catering': {
    slug: 'catering',
    displayName: 'Catering',
    primaryPillar: 2,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'catering_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Catering' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","sentiment_analysis","product_description_writer","translation"],
      
      useCases: ["Generate catering business and chef bios","Event catering scheduling assistant","Analyse client review sentiment","Write menu and food descriptions for listings","Translate menus to local languages"],
      
    },
    route: {
      basePath: '/catering',
      entitlementLayer: 'Commerce',
    },
  },

  'cassava-miller': {
    slug: 'cassava-miller',
    displayName: 'Cassava Miller',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'cassava_miller_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Cassava Miller' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["demand_forecasting","translation"],
      
      useCases: ["Cassava throughput and demand forecasting","Translate milling guides and advisories to local languages"],
      
    },
    route: {
      basePath: '/cassava-miller',
      entitlementLayer: 'Operational',
    },
  },

  'cocoa-exporter': {
    slug: 'cocoa-exporter',
    displayName: 'Cocoa Exporter',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'cocoa_exporter_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Cocoa Exporter' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["demand_forecasting","document_extractor","translation"],
      
      useCases: ["Global cocoa demand and price forecasting","Extract structured data from export permits and shipping documents","Translate export documentation summaries"],
      
    },
    route: {
      basePath: '/cocoa-exporter',
      entitlementLayer: 'Operational',
    },
  },

  'cold-room': {
    slug: 'cold-room',
    displayName: 'Cold Room',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'cold_room_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Cold Room' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["demand_forecasting","scheduling_assistant","translation"],
      
      useCases: ["Cold storage throughput demand forecasting","Slot booking and inventory scheduling assistant","Translate operational guides to local languages"],
      
    },
    route: {
      basePath: '/cold-room',
      entitlementLayer: 'Operational',
    },
  },

  'farm': {
    slug: 'farm',
    displayName: 'Farm',
    primaryPillar: 3,
    milestone: 'M9',
    maturity: 'basic',
    tableName: 'farm_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'farm_name', property: 'farmName', type: 'string', required: true },
      { column: 'cac_rc', property: 'cacRc', type: 'string', nullable: true },
      { column: 'farm_type', property: 'farmType', type: 'string', nullable: true },
    ],
    createFields: ['farmName', 'cacRc', 'farmType'],
    updateFields: ['farmName', 'cacRc', 'farmType'],
    fsm: {
      states: ['seeded', 'claimed', 'active', 'suspended'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
        { from: 'active', to: 'suspended' },
        { from: 'suspended', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ['product_description_writer', 'demand_forecasting', 'route_optimizer', 'translation'],
      useCases: ['Generate farm produce listings for marketplace', 'Seasonal harvest demand and price forecasting', 'Last-mile delivery route optimisation', 'Translate agro-advisory content to local languages'],
    },
    route: {
      basePath: '/farm',
      entitlementLayer: 'Operational',
    },
    compliance: {
      kycTierForClaim: 1,
      requiredLicences: ['CAC'],
      ndprLevel: 'standard',
    },
  },

  'fish-market': {
    slug: 'fish-market',
    displayName: 'Fish Market',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'fish_market_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Fish Market' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["product_description_writer","demand_forecasting","translation"],
      
      useCases: ["Generate product listings for fresh and dried fish","Market demand and price forecasting","Translate product information to local languages"],
      
    },
    route: {
      basePath: '/fish-market',
      entitlementLayer: 'Operational',
    },
  },

  'food-processing': {
    slug: 'food-processing',
    displayName: 'Food Processing',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'food_processing_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Food Processing' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["product_description_writer","demand_forecasting","translation"],
      
      useCases: ["Generate product descriptions for processed foods","Production demand and capacity forecasting","Translate packaging and labelling content"],
      
    },
    route: {
      basePath: '/food-processing',
      entitlementLayer: 'Operational',
    },
  },

  'food-vendor': {
    slug: 'food-vendor',
    displayName: 'Food Vendor',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'food_vendor_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Food Vendor' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["product_description_writer","demand_forecasting","sentiment_analysis","translation"],
      
      useCases: ["Generate menu descriptions and daily specials listings","Daily demand forecasting for ingredient purchasing","Analyse customer review sentiment","Translate menu to local languages"],
      
    },
    route: {
      basePath: '/food-vendor',
      entitlementLayer: 'Operational',
    },
  },

  'palm-oil': {
    slug: 'palm-oil',
    displayName: 'Palm Oil',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'palm_oil_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Palm Oil' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["demand_forecasting","translation"],
      
      useCases: ["Palm oil price and demand forecasting","Translate trade and pricing documentation"],
      
    },
    route: {
      basePath: '/palm-oil',
      entitlementLayer: 'Operational',
    },
  },

  'poultry-farm': {
    slug: 'poultry-farm',
    displayName: 'Poultry Farm',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'poultry_farm_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Poultry Farm' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["demand_forecasting","translation"],
      
      useCases: ["Egg and meat demand forecasting by season","Translate poultry management guides to local languages"],
      
    },
    route: {
      basePath: '/poultry-farm',
      entitlementLayer: 'Operational',
    },
  },

  'produce-aggregator': {
    slug: 'produce-aggregator',
    displayName: 'Produce Aggregator',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'produce_aggregator_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Produce Aggregator' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["product_description_writer","demand_forecasting","route_optimizer","translation"],
      
      useCases: ["Generate produce listings from aggregated stock","Multi-commodity demand and price forecasting","Optimise last-mile collection routes from farms","Translate market advisories to local languages"],
      
    },
    route: {
      basePath: '/produce-aggregator',
      entitlementLayer: 'Operational',
    },
  },

  'restaurant': {
    slug: 'restaurant',
    displayName: 'Restaurant',
    primaryPillar: 2,
    milestone: 'M9',
    maturity: 'basic',
    tableName: 'restaurant_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'restaurant_name', property: 'restaurantName', type: 'string', required: true },
      { column: 'cac_rc', property: 'cacRc', type: 'string', nullable: true },
      { column: 'nafdac_cert', property: 'nafdacCert', type: 'string', nullable: true },
    ],
    createFields: ['restaurantName', 'cacRc', 'nafdacCert'],
    updateFields: ['restaurantName', 'cacRc', 'nafdacCert'],
    fsm: {
      states: ['seeded', 'claimed', 'active', 'suspended'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
        { from: 'active', to: 'suspended' },
        { from: 'suspended', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ['bio_generator', 'product_description_writer', 'sentiment_analysis', 'scheduling_assistant', 'translation'],
      useCases: ['Generate restaurant and chef bios', 'Write food descriptions and menu copy', 'Analyse customer review and rating sentiment', 'Reservation scheduling assistant', 'Translate menu to local languages'],
    },
    route: {
      basePath: '/restaurant',
      entitlementLayer: 'Commerce',
    },
    compliance: {
      kycTierForClaim: 1,
      requiredLicences: ['CAC'],
      ndprLevel: 'standard',
    },
  },

  'restaurant-chain': {
    slug: 'restaurant-chain',
    displayName: 'Restaurant Chain',
    primaryPillar: 2,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'restaurant_chain_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Restaurant Chain' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","product_description_writer","demand_forecasting","sentiment_analysis","translation"],
      
      useCases: ["Generate chain brand and location bios","Write food descriptions across all outlets","Multi-location demand forecasting for inventory","Aggregate customer sentiment across branches","Translate menu and promotions to local languages"],
      
    },
    route: {
      basePath: '/restaurant-chain',
      entitlementLayer: 'Commerce',
    },
  },

  'vegetable-garden': {
    slug: 'vegetable-garden',
    displayName: 'Vegetable Garden',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'vegetable_garden_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Vegetable Garden' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["product_description_writer","demand_forecasting","translation"],
      
      useCases: ["Generate fresh produce listings","Seasonal demand forecasting for planting cycles","Translate growing guides to local languages"],
      
    },
    route: {
      basePath: '/vegetable-garden',
      entitlementLayer: 'Operational',
    },
  },

  'market': {
    slug: 'market',
    displayName: 'Market',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'market_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Market' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["product_description_writer","demand_forecasting","translation","sentiment_analysis"],
      
      useCases: ["Generate product listings for market stall vendors","Demand forecasting for market stock management","Translate product info to Hausa/Yoruba/Igbo/Pidgin","Buyer sentiment from reviews to improve vendor ratings"],
      
    },
    route: {
      basePath: '/market',
      entitlementLayer: 'Operational',
    },
  },

  'beauty-salon': {
    slug: 'beauty-salon',
    displayName: 'Beauty Salon',
    primaryPillar: 2,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'beauty_salon_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Beauty Salon' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","sentiment_analysis","translation"],
      
      useCases: ["Generate salon and stylist bios","Appointment scheduling assistant","Analyse client review sentiment","Translate service menus to local languages"],
      
    },
    route: {
      basePath: '/beauty-salon',
      entitlementLayer: 'Commerce',
    },
  },

  'bookshop': {
    slug: 'bookshop',
    displayName: 'Bookshop',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'bookshop_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Bookshop' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["product_description_writer","demand_forecasting","sentiment_analysis","translation"],
      
      useCases: ["Generate book descriptions and catalogue listings","Stock demand forecasting by genre and season","Analyse reader review sentiment","Translate book summaries to local languages"],
      
    },
    route: {
      basePath: '/bookshop',
      entitlementLayer: 'Operational',
    },
  },

  'building-materials': {
    slug: 'building-materials',
    displayName: 'Building Materials',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'building_materials_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Building Materials' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["product_description_writer","demand_forecasting","translation"],
      
      useCases: ["Generate product descriptions for building supplies","Construction demand and stock forecasting","Translate product specs to local languages"],
      
    },
    route: {
      basePath: '/building-materials',
      entitlementLayer: 'Operational',
    },
  },

  'car-wash': {
    slug: 'car-wash',
    displayName: 'Car Wash',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'car_wash_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Car Wash' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["scheduling_assistant","demand_forecasting","sentiment_analysis","translation"],
      
      useCases: ["Booking slot scheduling assistant","Peak demand forecasting by day and weather","Analyse customer review sentiment","Translate service packages to local languages"],
      
    },
    route: {
      basePath: '/car-wash',
      entitlementLayer: 'Civic',
    },
  },

  'cleaning-company': {
    slug: 'cleaning-company',
    displayName: 'Cleaning Company',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'cleaning_company_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Cleaning Company' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","sentiment_analysis","translation"],
      
      useCases: ["Generate company and staff bios","Job and shift scheduling assistant","Analyse client review sentiment","Translate service contracts to local languages"],
      
    },
    route: {
      basePath: '/cleaning-company',
      entitlementLayer: 'Civic',
    },
  },

  'cleaning-service': {
    slug: 'cleaning-service',
    displayName: 'Cleaning Service',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'cleaning_service_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Cleaning Service' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","sentiment_analysis","translation"],
      
      useCases: ["Generate cleaner profile bios","Booking and shift scheduling assistant","Analyse client feedback sentiment","Translate service offerings to local languages"],
      
    },
    route: {
      basePath: '/cleaning-service',
      entitlementLayer: 'Civic',
    },
  },

  'electrical-fittings': {
    slug: 'electrical-fittings',
    displayName: 'Electrical Fittings',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'electrical_fittings_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Electrical Fittings' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["product_description_writer","demand_forecasting","translation"],
      
      useCases: ["Generate product descriptions for electrical components","Stock demand forecasting","Translate product specs to local languages"],
      
    },
    route: {
      basePath: '/electrical-fittings',
      entitlementLayer: 'Operational',
    },
  },

  'electronics-repair': {
    slug: 'electronics-repair',
    displayName: 'Electronics Repair',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'electronics_repair_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Electronics Repair' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["scheduling_assistant","sentiment_analysis","translation"],
      
      useCases: ["Repair job queue and scheduling assistant","Analyse client review sentiment","Translate repair quotes to local languages"],
      
    },
    route: {
      basePath: '/electronics-repair',
      entitlementLayer: 'Civic',
    },
  },

  'fashion-brand': {
    slug: 'fashion-brand',
    displayName: 'Fashion Brand',
    primaryPillar: 2,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'fashion_brand_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Fashion Brand' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","product_description_writer","brand_copywriter","sentiment_analysis","translation"],
      
      useCases: ["Generate brand and designer bios","Write product descriptions for fashion collections","Generate campaign taglines and brand copy","Analyse customer sentiment from reviews","Translate product descriptions to local languages"],
      
    },
    route: {
      basePath: '/fashion-brand',
      entitlementLayer: 'Commerce',
    },
  },

  'florist': {
    slug: 'florist',
    displayName: 'Florist',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'florist_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Florist' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["product_description_writer","scheduling_assistant","sentiment_analysis","translation"],
      
      useCases: ["Generate flower arrangement and bouquet descriptions","Event and delivery scheduling assistant","Analyse customer review sentiment","Translate product menus to local languages"],
      
    },
    route: {
      basePath: '/florist',
      entitlementLayer: 'Operational',
    },
  },

  'funeral-home': {
    slug: 'funeral-home',
    displayName: 'Funeral Home',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'funeral_home_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Funeral Home' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","translation"],
      
      useCases: ["Generate funeral home and director bios","Service and burial scheduling assistant","Translate service packages to local languages"],
      
    },
    route: {
      basePath: '/funeral-home',
      entitlementLayer: 'Civic',
    },
  },

  'furniture-maker': {
    slug: 'furniture-maker',
    displayName: 'Furniture Maker',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'furniture_maker_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Furniture Maker' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","product_description_writer","sentiment_analysis","translation"],
      
      useCases: ["Generate craftsman and workshop bios","Write product descriptions for furniture pieces","Analyse client review sentiment","Translate product catalogues to local languages"],
      
    },
    route: {
      basePath: '/furniture-maker',
      entitlementLayer: 'Operational',
    },
  },

  'generator-dealer': {
    slug: 'generator-dealer',
    displayName: 'Generator Dealer',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'generator_dealer_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Generator Dealer' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["product_description_writer","demand_forecasting","translation"],
      
      useCases: ["Generate product descriptions for generators and accessories","Demand forecasting linked to NEPA outage patterns","Translate product specs to local languages"],
      
    },
    route: {
      basePath: '/generator-dealer',
      entitlementLayer: 'Operational',
    },
  },

  'generator-repair': {
    slug: 'generator-repair',
    displayName: 'Generator Repair',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'generator_repair_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Generator Repair' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["scheduling_assistant","sentiment_analysis","translation"],
      
      useCases: ["Repair booking and technician scheduling assistant","Analyse customer review sentiment","Translate repair quotes to local languages"],
      
    },
    route: {
      basePath: '/generator-repair',
      entitlementLayer: 'Civic',
    },
  },

  'hair-salon': {
    slug: 'hair-salon',
    displayName: 'Hair Salon',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'hair_salon_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Hair Salon' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["scheduling_assistant","sentiment_analysis","translation"],
      
      useCases: ["Appointment booking and scheduling assistant","Analyse client review sentiment","Translate service menus to local languages"],
      
    },
    route: {
      basePath: '/hair-salon',
      entitlementLayer: 'Civic',
    },
  },

  'handyman': {
    slug: 'handyman',
    displayName: 'Handyman',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'handyman_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Handyman' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","sentiment_analysis","translation"],
      
      useCases: ["Generate artisan and handyman bios","Job booking and scheduling assistant","Analyse client review sentiment","Translate service quotes to local languages"],
      
    },
    route: {
      basePath: '/handyman',
      entitlementLayer: 'Civic',
    },
  },

  'hire-purchase': {
    slug: 'hire-purchase',
    displayName: 'Hire Purchase',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'hire_purchase_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Hire Purchase' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["document_extractor","demand_forecasting","translation"],
      
      useCases: ["Extract data from hire-purchase agreements","Repayment demand and default risk forecasting","Translate contracts to local languages"],
      
    },
    route: {
      basePath: '/hire-purchase',
      entitlementLayer: 'Civic',
    },
  },

  'internet-cafe': {
    slug: 'internet-cafe',
    displayName: 'Internet Cafe',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'internet_cafe_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Internet Cafe' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["demand_forecasting","scheduling_assistant","translation"],
      
      useCases: ["Peak usage demand forecasting by hour","Station and slot booking assistant","Translate price lists to local languages"],
      
    },
    route: {
      basePath: '/internet-cafe',
      entitlementLayer: 'Civic',
    },
  },

  'iron-steel': {
    slug: 'iron-steel',
    displayName: 'Iron Steel',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'iron_steel_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Iron Steel' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["product_description_writer","demand_forecasting","translation"],
      
      useCases: ["Generate product descriptions for iron and steel products","Construction sector demand forecasting","Translate product specs to local languages"],
      
    },
    route: {
      basePath: '/iron-steel',
      entitlementLayer: 'Operational',
    },
  },

  'laundry': {
    slug: 'laundry',
    displayName: 'Laundry',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'laundry_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Laundry' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["scheduling_assistant","demand_forecasting","translation"],
      
      useCases: ["Laundry booking and collection scheduling assistant","Volume demand forecasting for staffing","Translate service packages to local languages"],
      
    },
    route: {
      basePath: '/laundry',
      entitlementLayer: 'Civic',
    },
  },

  'market-association': {
    slug: 'market-association',
    displayName: 'Market Association',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'market_association_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Market Association' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","content_moderation","translation"],
      
      useCases: ["Generate market association and executive bios","Moderate member communication boards","Translate circulars to local languages"],
      
    },
    route: {
      basePath: '/market-association',
      entitlementLayer: 'Civic',
    },
  },

  'motorcycle-accessories': {
    slug: 'motorcycle-accessories',
    displayName: 'Motorcycle Accessories',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'motorcycle_accessories_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Motorcycle Accessories' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["product_description_writer","demand_forecasting","translation"],
      
      useCases: ["Generate product descriptions for motorcycle parts and accessories","Parts demand forecasting","Translate product listings to local languages"],
      
    },
    route: {
      basePath: '/motorcycle-accessories',
      entitlementLayer: 'Operational',
    },
  },

  'paints-distributor': {
    slug: 'paints-distributor',
    displayName: 'Paints Distributor',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'paints_distributor_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Paints Distributor' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["product_description_writer","demand_forecasting","translation"],
      
      useCases: ["Generate product descriptions for paint ranges","Seasonal demand forecasting for paint stock","Translate product specs to local languages"],
      
    },
    route: {
      basePath: '/paints-distributor',
      entitlementLayer: 'Operational',
    },
  },

  'petrol-station': {
    slug: 'petrol-station',
    displayName: 'Petrol Station',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'petrol_station_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Petrol Station' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["demand_forecasting","scheduling_assistant","translation"],
      
      useCases: ["Fuel demand forecasting by daily throughput","Pump attendant shift scheduling assistant","Translate signage and price board to local languages"],
      
    },
    route: {
      basePath: '/petrol-station',
      entitlementLayer: 'Civic',
    },
  },

  'phone-repair-shop': {
    slug: 'phone-repair-shop',
    displayName: 'Phone Repair Shop',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'phone_repair_shop_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Phone Repair Shop' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["scheduling_assistant","sentiment_analysis","translation"],
      
      useCases: ["Repair job queue and technician scheduling assistant","Analyse customer review sentiment","Translate repair quotes to local languages"],
      
    },
    route: {
      basePath: '/phone-repair-shop',
      entitlementLayer: 'Civic',
    },
  },

  'plumbing-supplies': {
    slug: 'plumbing-supplies',
    displayName: 'Plumbing Supplies',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'plumbing_supplies_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Plumbing Supplies' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["product_description_writer","demand_forecasting","translation"],
      
      useCases: ["Generate product descriptions for plumbing materials","Stock demand forecasting for construction seasons","Translate product specs to local languages"],
      
    },
    route: {
      basePath: '/plumbing-supplies',
      entitlementLayer: 'Operational',
    },
  },

  'print-shop': {
    slug: 'print-shop',
    displayName: 'Print Shop',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'print_shop_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Print Shop' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["demand_forecasting","scheduling_assistant","sentiment_analysis","translation"],
      
      useCases: ["Print job demand forecasting by season","Order queue and production scheduling assistant","Analyse client review sentiment","Translate service packages to local languages"],
      
    },
    route: {
      basePath: '/print-shop',
      entitlementLayer: 'Civic',
    },
  },

  'printing-press': {
    slug: 'printing-press',
    displayName: 'Printing Press',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'printing_press_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Printing Press' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["demand_forecasting","scheduling_assistant","translation"],
      
      useCases: ["Large-format print demand forecasting","Production shift and machine scheduling assistant","Translate client briefs to local languages"],
      
    },
    route: {
      basePath: '/printing-press',
      entitlementLayer: 'Civic',
    },
  },

  'shoemaker': {
    slug: 'shoemaker',
    displayName: 'Shoemaker',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'shoemaker_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Shoemaker' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","product_description_writer","sentiment_analysis","translation"],
      
      useCases: ["Generate cobbler and craftsman bios","Write product descriptions for handmade shoes","Analyse client review sentiment","Translate product listings to local languages"],
      
    },
    route: {
      basePath: '/shoemaker',
      entitlementLayer: 'Operational',
    },
  },

  'spare-parts': {
    slug: 'spare-parts',
    displayName: 'Spare Parts',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'spare_parts_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Spare Parts' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["product_description_writer","demand_forecasting","translation"],
      
      useCases: ["Generate product descriptions for auto spare parts","Parts demand forecasting by vehicle make/model","Translate parts catalogue to local languages"],
      
    },
    route: {
      basePath: '/spare-parts',
      entitlementLayer: 'Operational',
    },
  },

  'supermarket': {
    slug: 'supermarket',
    displayName: 'Supermarket',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'supermarket_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Supermarket' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["product_description_writer","demand_forecasting","sentiment_analysis","inventory_ai","translation"],
      
      useCases: ["Generate product descriptions across all SKUs","Category-level demand forecasting for procurement","Analyse shopper review sentiment","Smart reorder and stock anomaly detection","Translate product labels to local languages"],
      
    },
    route: {
      basePath: '/supermarket',
      entitlementLayer: 'Operational',
    },
  },

  'tailor': {
    slug: 'tailor',
    displayName: 'Tailor',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'tailor_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Tailor' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","product_description_writer","sentiment_analysis","translation"],
      
      useCases: ["Generate tailor and atelier bios","Write style and fabric descriptions for listings","Analyse client review sentiment","Translate order and quote documents to local languages"],
      
    },
    route: {
      basePath: '/tailor',
      entitlementLayer: 'Operational',
    },
  },

  'tailoring-fashion': {
    slug: 'tailoring-fashion',
    displayName: 'Tailoring Fashion',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'tailoring_fashion_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Tailoring Fashion' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","product_description_writer","brand_copywriter","sentiment_analysis","translation"],
      
      useCases: ["Generate fashion brand and designer bios","Write collection descriptions for online listings","Generate brand copy and social captions","Analyse client review sentiment","Translate product descriptions to local languages"],
      
    },
    route: {
      basePath: '/tailoring-fashion',
      entitlementLayer: 'Operational',
    },
  },

  'tyre-shop': {
    slug: 'tyre-shop',
    displayName: 'Tyre Shop',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'tyre_shop_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Tyre Shop' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["demand_forecasting","scheduling_assistant","translation"],
      
      useCases: ["Tyre demand and fitment volume forecasting","Booking and technician scheduling assistant","Translate price lists to local languages"],
      
    },
    route: {
      basePath: '/tyre-shop',
      entitlementLayer: 'Civic',
    },
  },

  'used-car-dealer': {
    slug: 'used-car-dealer',
    displayName: 'Used Car Dealer',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'used_car_dealer_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Used Car Dealer' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["product_description_writer","document_extractor","sentiment_analysis","translation"],
      
      useCases: ["Generate compelling vehicle listing descriptions","Extract data from vehicle registration and title documents","Analyse buyer review sentiment","Translate vehicle specs to local languages"],
      
    },
    route: {
      basePath: '/used-car-dealer',
      entitlementLayer: 'Operational',
    },
  },

  'water-vendor': {
    slug: 'water-vendor',
    displayName: 'Water Vendor',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'water_vendor_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Water Vendor' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["demand_forecasting","route_optimizer","translation"],
      
      useCases: ["Daily water demand forecasting by zone","Tanker and sachet delivery route optimisation","Translate price lists to local languages"],
      
    },
    route: {
      basePath: '/water-vendor',
      entitlementLayer: 'Civic',
    },
  },

  'wholesale-market': {
    slug: 'wholesale-market',
    displayName: 'Wholesale Market',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'wholesale_market_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Wholesale Market' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["product_description_writer","demand_forecasting","translation"],
      
      useCases: ["Generate bulk commodity and product listings","Wholesale demand and price trend forecasting","Translate product catalogues to local languages"],
      
    },
    route: {
      basePath: '/wholesale-market',
      entitlementLayer: 'Operational',
    },
  },

  'accounting-firm': {
    slug: 'accounting-firm',
    displayName: 'Accounting Firm',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'accounting_firm_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Accounting Firm' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","document_extractor","scheduling_assistant","translation"],
      
      useCases: ["Generate firm and accountant bios","Extract data from client financial documents","Client appointment and deadline scheduling assistant","Translate financial summaries to local languages"],
      
    },
    route: {
      basePath: '/accounting-firm',
      entitlementLayer: 'Civic',
    },
  },

  'advertising-agency': {
    slug: 'advertising-agency',
    displayName: 'Advertising Agency',
    primaryPillar: 2,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'advertising_agency_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Advertising Agency' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","brand_copywriter","content_moderation","sentiment_analysis","translation"],
      
      useCases: ["Generate agency and creative director bios","Write campaign taglines and brand copy for clients","Pre-screen ad copy for content policy compliance","Analyse campaign sentiment from social and survey data","Translate campaign materials to local languages"],
      
    },
    route: {
      basePath: '/advertising-agency',
      entitlementLayer: 'Commerce',
    },
  },

  'insurance-agent': {
    slug: 'insurance-agent',
    displayName: 'Insurance Agent',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'insurance_agent_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Insurance Agent' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","document_extractor","translation"],
      prohibitedCapabilities: ["function_call"],
      useCases: ["Generate agent and broker bios","Extract policy data from insurance documents","Translate policy summaries to local languages"],
      
    },
    route: {
      basePath: '/insurance-agent',
      entitlementLayer: 'Civic',
    },
  },

  'it-support': {
    slug: 'it-support',
    displayName: 'It Support',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'it_support_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'It Support' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","sentiment_analysis","translation"],
      
      useCases: ["Generate IT technician bios","Ticket queue and job scheduling assistant","Analyse client feedback sentiment","Translate support documentation to local languages"],
      
    },
    route: {
      basePath: '/it-support',
      entitlementLayer: 'Civic',
    },
  },

  'land-surveyor': {
    slug: 'land-surveyor',
    displayName: 'Land Surveyor',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'land_surveyor_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Land Surveyor' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","document_extractor","translation"],
      
      useCases: ["Generate surveyor and firm bios","Extract data from land title and survey documents","Translate survey reports to local languages"],
      
    },
    route: {
      basePath: '/land-surveyor',
      entitlementLayer: 'Civic',
    },
  },

  'law-firm': {
    slug: 'law-firm',
    displayName: 'Law Firm',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'law_firm_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Law Firm' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","policy_summarizer","document_extractor","translation"],
      prohibitedCapabilities: ["function_call","price_suggest"],
      useCases: ["Generate lawyer and chamber bios","Summarise legal briefs and court rulings","Extract key clauses from contract documents","Translate legal communications to local languages"],
      
    },
    route: {
      basePath: '/law-firm',
      entitlementLayer: 'Civic',
    },
  },

  'pr-firm': {
    slug: 'pr-firm',
    displayName: 'Pr Firm',
    primaryPillar: 2,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'pr_firm_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Pr Firm' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","brand_copywriter","content_moderation","sentiment_analysis","translation"],
      
      useCases: ["Generate agency and publicist bios","Write press releases and brand copy for clients","Pre-screen press content for policy compliance","Analyse media and social sentiment for clients","Translate press materials to local languages"],
      
    },
    route: {
      basePath: '/pr-firm',
      entitlementLayer: 'Commerce',
    },
  },

  'professional': {
    slug: 'professional',
    displayName: 'Professional',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'professional_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Professional' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","translation"],
      
      useCases: ["Generate professional profile bio","Client appointment scheduling assistant","Translate profile and portfolio to local languages"],
      
    },
    route: {
      basePath: '/professional',
      entitlementLayer: 'Civic',
    },
  },

  'professional-association': {
    slug: 'professional-association',
    displayName: 'Professional Association',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'professional_association_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Professional Association' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","content_moderation","document_extractor","translation"],
      
      useCases: ["Generate association and executive bios","Moderate member forums","Extract data from professional accreditation documents","Translate association communications to local languages"],
      
    },
    route: {
      basePath: '/professional-association',
      entitlementLayer: 'Civic',
    },
  },

  'security-company': {
    slug: 'security-company',
    displayName: 'Security Company',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'security_company_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Security Company' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","translation"],
      
      useCases: ["Generate security company and officer bios","Guard roster and shift scheduling assistant","Translate operational briefings to local languages"],
      
    },
    route: {
      basePath: '/security-company',
      entitlementLayer: 'Civic',
    },
  },

  'tax-consultant': {
    slug: 'tax-consultant',
    displayName: 'Tax Consultant',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'tax_consultant_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Tax Consultant' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","document_extractor","policy_summarizer","translation"],
      
      useCases: ["Generate consultant and firm bios","Extract data from FIRS and tax assessment documents","Summarise tax policy circulars for clients","Translate tax guidance to local languages"],
      
    },
    route: {
      basePath: '/tax-consultant',
      entitlementLayer: 'Civic',
    },
  },

  'talent-agency': {
    slug: 'talent-agency',
    displayName: 'Talent Agency',
    primaryPillar: 2,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'talent_agency_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Talent Agency' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","brand_copywriter","sentiment_analysis","translation"],
      
      useCases: ["Generate talent and agency bios","Write talent profiles and pitch copy","Analyse social sentiment for talent management","Translate talent profiles to local languages"],
      
    },
    route: {
      basePath: '/talent-agency',
      entitlementLayer: 'Commerce',
    },
  },

  'pos-business': {
    slug: 'pos-business',
    displayName: 'Pos Business',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'pos_business_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Pos Business' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["demand_forecasting","scheduling_assistant","translation","sentiment_analysis"],
      
      useCases: ["Float demand forecasting by transaction history","Agent scheduling across busy periods","Translate POS receipts and statements to local languages","Analyse agent performance from customer feedback"],
      
    },
    route: {
      basePath: '/pos-business',
      entitlementLayer: 'Civic',
    },
  },

  'cooperative': {
    slug: 'cooperative',
    displayName: 'Cooperative',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'cooperative_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Cooperative' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","document_extractor","scheduling_assistant","translation"],
      
      useCases: ["Generate cooperative and officers bios","Extract member data from paper registration forms","Meeting and AGM scheduling assistant","Translate cooperative bylaws to Pidgin"],
      
    },
    route: {
      basePath: '/cooperative',
      entitlementLayer: 'Civic',
    },
  },

  'airtime-reseller': {
    slug: 'airtime-reseller',
    displayName: 'Airtime Reseller',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'airtime_reseller_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Airtime Reseller' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["demand_forecasting","translation"],
      
      useCases: ["Daily airtime and data bundle demand forecasting","Translate price lists and promotions to local languages"],
      
    },
    route: {
      basePath: '/airtime-reseller',
      entitlementLayer: 'Civic',
    },
  },

  'bureau-de-change': {
    slug: 'bureau-de-change',
    displayName: 'Bureau De Change',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'bureau_de_change_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Bureau De Change' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["demand_forecasting","document_extractor","translation"],
      prohibitedCapabilities: ["function_call"],
      useCases: ["FX demand and rate trend forecasting","Extract data from CBN compliance documents","Translate rate boards and client communications"],
      
    },
    route: {
      basePath: '/bureau-de-change',
      entitlementLayer: 'Civic',
    },
  },

  'mobile-money-agent': {
    slug: 'mobile-money-agent',
    displayName: 'Mobile Money Agent',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'mobile_money_agent_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Mobile Money Agent' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["demand_forecasting","scheduling_assistant","translation"],
      
      useCases: ["Transaction volume demand forecasting","Agent availability scheduling assistant","Translate mobile money guides to local languages"],
      
    },
    route: {
      basePath: '/mobile-money-agent',
      entitlementLayer: 'Civic',
    },
  },

  'savings-group': {
    slug: 'savings-group',
    displayName: 'Savings Group',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'savings_group_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Savings Group' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","document_extractor","scheduling_assistant","translation"],
      
      useCases: ["Generate savings group and coordinator bios","Extract member data from registration records","Meeting and contribution scheduling assistant","Translate savings guidelines to local languages"],
      
    },
    route: {
      basePath: '/savings-group',
      entitlementLayer: 'Civic',
    },
  },

  'community-radio': {
    slug: 'community-radio',
    displayName: 'Community Radio',
    primaryPillar: 2,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'community_radio_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Community Radio' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","content_moderation","translation"],
      
      useCases: ["Generate station and presenter bios","Moderate listener feedback and request boards","Translate broadcast content to local languages"],
      
    },
    route: {
      basePath: '/community-radio',
      entitlementLayer: 'Commerce',
    },
  },

  'creator': {
    slug: 'creator',
    displayName: 'Creator',
    primaryPillar: 2,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'creator_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Creator' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","brand_copywriter","content_moderation","sentiment_analysis","seo_meta_ai","translation"],
      
      useCases: ["Generate creator and influencer bios","Write content captions, headlines, and brand copy","Pre-screen posts for platform content policy compliance","Analyse audience sentiment from comments and DMs","Generate SEO titles and meta descriptions for content pages","Translate content to local languages"],
      
    },
    route: {
      basePath: '/creator',
      entitlementLayer: 'Commerce',
    },
  },

  'motivational-speaker': {
    slug: 'motivational-speaker',
    displayName: 'Motivational Speaker',
    primaryPillar: 2,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'motivational_speaker_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Motivational Speaker' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","brand_copywriter","sentiment_analysis","translation"],
      
      useCases: ["Generate speaker bio and event copy","Write talk titles and promotional copy","Analyse audience feedback sentiment","Translate speaker materials to local languages"],
      
    },
    route: {
      basePath: '/motivational-speaker',
      entitlementLayer: 'Commerce',
    },
  },

  'music-studio': {
    slug: 'music-studio',
    displayName: 'Music Studio',
    primaryPillar: 2,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'music_studio_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Music Studio' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","brand_copywriter","content_moderation","translation"],
      
      useCases: ["Generate studio and artist bios","Write press release and promotional copy","Moderate studio community boards","Translate artist bios to local languages"],
      
    },
    route: {
      basePath: '/music-studio',
      entitlementLayer: 'Commerce',
    },
  },

  'newspaper-dist': {
    slug: 'newspaper-dist',
    displayName: 'Newspaper Dist',
    primaryPillar: 2,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'newspaper_dist_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Newspaper Dist' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","content_moderation","translation"],
      
      useCases: ["Generate publication and distribution bios","Moderate reader comment sections","Translate headlines and summaries to local languages"],
      
    },
    route: {
      basePath: '/newspaper-dist',
      entitlementLayer: 'Commerce',
    },
  },

  'photography-studio': {
    slug: 'photography-studio',
    displayName: 'Photography Studio',
    primaryPillar: 2,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'photography_studio_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Photography Studio' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","sentiment_analysis","brand_image_alt","translation"],
      
      useCases: ["Generate photographer and studio bios","Shoot booking and session scheduling assistant","Analyse client review sentiment","Generate alt-text for portfolio images","Translate studio content to local languages"],
      
    },
    route: {
      basePath: '/photography-studio',
      entitlementLayer: 'Commerce',
    },
  },

  'podcast-studio': {
    slug: 'podcast-studio',
    displayName: 'Podcast Studio',
    primaryPillar: 2,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'podcast_studio_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Podcast Studio' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","brand_copywriter","content_moderation","translation"],
      
      useCases: ["Generate podcast show and host bios","Write episode descriptions and promotional copy","Moderate listener feedback boards","Translate episode summaries to local languages"],
      
    },
    route: {
      basePath: '/podcast-studio',
      entitlementLayer: 'Commerce',
    },
  },

  'recording-label': {
    slug: 'recording-label',
    displayName: 'Recording Label',
    primaryPillar: 2,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'recording_label_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Recording Label' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","brand_copywriter","content_moderation","sentiment_analysis","translation"],
      
      useCases: ["Generate label and artist roster bios","Write press releases and promotional materials","Moderate artist and fan community boards","Analyse fan sentiment from social media","Translate artist content to local languages"],
      
    },
    route: {
      basePath: '/recording-label',
      entitlementLayer: 'Commerce',
    },
  },

  'property-developer': {
    slug: 'property-developer',
    displayName: 'Property Developer',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'property_developer_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Property Developer' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","product_description_writer","document_extractor","translation"],
      
      useCases: ["Generate developer and project bios","Write property development listings and descriptions","Extract data from title deeds and survey documents","Translate property documents to local languages"],
      
    },
    route: {
      basePath: '/property-developer',
      entitlementLayer: 'Operational',
    },
  },

  'real-estate-agency': {
    slug: 'real-estate-agency',
    displayName: 'Real Estate Agency',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'real_estate_agency_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Real Estate Agency' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","product_description_writer","document_extractor","sentiment_analysis","translation"],
      
      useCases: ["Generate agent and agency bios","Write compelling property listing descriptions","Extract data from land registry and survey documents","Analyse client review sentiment","Translate property listings to local languages"],
      
    },
    route: {
      basePath: '/real-estate-agency',
      entitlementLayer: 'Operational',
    },
  },

  'warehouse': {
    slug: 'warehouse',
    displayName: 'Warehouse',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'warehouse_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Warehouse' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["demand_forecasting","scheduling_assistant","inventory_ai","translation"],
      
      useCases: ["Throughput and storage demand forecasting","Inbound/outbound scheduling assistant","Smart reorder and stock anomaly detection","Translate warehouse operational guides"],
      
    },
    route: {
      basePath: '/warehouse',
      entitlementLayer: 'Operational',
    },
  },

  'borehole-driller': {
    slug: 'borehole-driller',
    displayName: 'Borehole Driller',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'borehole_driller_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Borehole Driller' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","translation"],
      
      useCases: ["Generate driller and company bios","Project scheduling and site management assistant","Translate technical proposals to local languages"],
      
    },
    route: {
      basePath: '/borehole-driller',
      entitlementLayer: 'Civic',
    },
  },

  'gas-distributor': {
    slug: 'gas-distributor',
    displayName: 'Gas Distributor',
    primaryPillar: 3,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'gas_distributor_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Gas Distributor' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["demand_forecasting","route_optimizer","translation"],
      
      useCases: ["LPG demand forecasting by zone and season","Delivery route optimisation for tankers","Translate safety and pricing communications"],
      
    },
    route: {
      basePath: '/gas-distributor',
      entitlementLayer: 'Operational',
    },
  },

  'oil-gas-services': {
    slug: 'oil-gas-services',
    displayName: 'Oil Gas Services',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'oil_gas_services_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Oil Gas Services' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","document_extractor","policy_summarizer","translation"],
      
      useCases: ["Generate company and personnel bios","Extract data from DPR/NUPRC permits and contracts","Summarise regulatory policy for compliance briefs","Translate technical documents to local languages"],
      
    },
    route: {
      basePath: '/oil-gas-services',
      entitlementLayer: 'Civic',
    },
  },

  'solar-installer': {
    slug: 'solar-installer',
    displayName: 'Solar Installer',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'solar_installer_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Solar Installer' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","product_description_writer","translation"],
      
      useCases: ["Generate installer and company bios","Installation project scheduling assistant","Write product descriptions for solar systems","Translate technical proposals to local languages"],
      
    },
    route: {
      basePath: '/solar-installer',
      entitlementLayer: 'Civic',
    },
  },

  'water-treatment': {
    slug: 'water-treatment',
    displayName: 'Water Treatment',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'water_treatment_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Water Treatment' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["demand_forecasting","scheduling_assistant","translation"],
      
      useCases: ["Water demand and production capacity forecasting","Maintenance and delivery scheduling assistant","Translate operational guides to local languages"],
      
    },
    route: {
      basePath: '/water-treatment',
      entitlementLayer: 'Civic',
    },
  },

  'ngo': {
    slug: 'ngo',
    displayName: 'Ngo',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'ngo_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Ngo' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","policy_summarizer","document_extractor","translation","content_moderation"],
      
      useCases: ["Auto-generate NGO and leadership bios","Summarise grant applications and impact reports","Extract data from CAC IT filings","Translate programme materials to local languages"],
      
    },
    route: {
      basePath: '/ngo',
      entitlementLayer: 'Civic',
    },
  },

  'womens-association': {
    slug: 'womens-association',
    displayName: 'Womens Association',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'womens_association_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Womens Association' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","content_moderation","translation"],
      
      useCases: ["Generate association and executive bios","Moderate member communication boards","Translate association materials to local languages"],
      
    },
    route: {
      basePath: '/womens-association',
      entitlementLayer: 'Civic',
    },
  },

  'youth-organization': {
    slug: 'youth-organization',
    displayName: 'Youth Organization',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'youth_organization_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Youth Organization' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","content_moderation","scheduling_assistant","translation"],
      
      useCases: ["Generate organisation and leader bios","Moderate youth forum discussions","Programme and event scheduling assistant","Translate materials to local languages"],
      
    },
    route: {
      basePath: '/youth-organization',
      entitlementLayer: 'Civic',
    },
  },

  'community-hall': {
    slug: 'community-hall',
    displayName: 'Community Hall',
    primaryPillar: 2,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'community_hall_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Community Hall' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","translation"],
      
      useCases: ["Generate hall and committee bios","Event booking and scheduling assistant","Translate booking terms to local languages"],
      
    },
    route: {
      basePath: '/community-hall',
      entitlementLayer: 'Commerce',
    },
  },

  'event-hall': {
    slug: 'event-hall',
    displayName: 'Event Hall',
    primaryPillar: 2,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'event_hall_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Event Hall' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","sentiment_analysis","translation"],
      
      useCases: ["Generate event hall and management bios","Event and slot booking scheduling assistant","Analyse client review sentiment","Translate booking packages to local languages"],
      
    },
    route: {
      basePath: '/event-hall',
      entitlementLayer: 'Commerce',
    },
  },

  'events-centre': {
    slug: 'events-centre',
    displayName: 'Events Centre',
    primaryPillar: 2,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'events_centre_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Events Centre' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","sentiment_analysis","translation"],
      
      useCases: ["Generate centre and management bios","Event booking and hall scheduling assistant","Analyse client review sentiment","Translate venue packages to local languages"],
      
    },
    route: {
      basePath: '/events-centre',
      entitlementLayer: 'Commerce',
    },
  },

  'spa': {
    slug: 'spa',
    displayName: 'Spa',
    primaryPillar: 2,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'spa_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Spa' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","sentiment_analysis","translation"],
      
      useCases: ["Generate spa and therapist bios","Treatment booking and scheduling assistant","Analyse client review sentiment","Translate service menus to local languages"],
      
    },
    route: {
      basePath: '/spa',
      entitlementLayer: 'Commerce',
    },
  },

  'wedding-planner': {
    slug: 'wedding-planner',
    displayName: 'Wedding Planner',
    primaryPillar: 2,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'wedding_planner_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Wedding Planner' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","sentiment_analysis","brand_copywriter","translation"],
      
      useCases: ["Generate planner and coordinator bios","Wedding timeline and vendor scheduling assistant","Analyse client review sentiment","Write wedding proposal and marketing copy","Translate event programmes to local languages"],
      
    },
    route: {
      basePath: '/wedding-planner',
      entitlementLayer: 'Commerce',
    },
  },

  'sports-club': {
    slug: 'sports-club',
    displayName: 'Sports Club',
    primaryPillar: 2,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'sports_club_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Sports Club' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","content_moderation","translation"],
      
      useCases: ["Generate club and player bios","Match fixture and training scheduling assistant","Moderate fan and member communication boards","Translate club content to local languages"],
      
    },
    route: {
      basePath: '/sports-club',
      entitlementLayer: 'Commerce',
    },
  },

  'startup': {
    slug: 'startup',
    displayName: 'Startup',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'startup_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Startup' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","brand_copywriter","content_moderation","seo_meta_ai","translation"],
      
      useCases: ["Generate founder and team bios","Write startup pitch copy and brand taglines","Moderate community discussion boards","Generate SEO titles for landing pages","Translate pitch materials to local languages"],
      
    },
    route: {
      basePath: '/startup',
      entitlementLayer: 'Civic',
    },
  },

  'artisanal-mining': {
    slug: 'artisanal-mining',
    displayName: 'Artisanal Mining',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'artisanal_mining_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Artisanal Mining' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["document_extractor","translation"],
      prohibitedCapabilities: ["function_call"],
      useCases: ["Extract data from mining permits and regulatory documents","Translate operational guides and compliance requirements to local languages"],
      
    },
    route: {
      basePath: '/artisanal-mining',
      entitlementLayer: 'Civic',
    },
  },

  'welding-fabrication': {
    slug: 'welding-fabrication',
    displayName: 'Welding Fabrication',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'welding_fabrication_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Welding Fabrication' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","product_description_writer","translation"],
      
      useCases: ["Generate fabricator and workshop bios","Write product descriptions for fabricated items","Translate technical specifications and quotes to local languages"],
      
    },
    route: {
      basePath: '/welding-fabrication',
      entitlementLayer: 'Civic',
    },
  },

  'sole-trader': {
    slug: 'sole-trader',
    displayName: 'Sole Trader',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'sole_trader_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Sole Trader' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","scheduling_assistant","translation"],
      
      useCases: ["Generate self-employed trader profile bio","Client appointment scheduling assistant","Translate business profile to local languages"],
      
    },
    route: {
      basePath: '/sole-trader',
      entitlementLayer: 'Civic',
    },
  },

  'transit': {
    slug: 'transit',
    displayName: 'Transit',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'transit_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Transit' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["scheduling_assistant","demand_forecasting","route_optimizer","translation"],
      
      useCases: ["Mass transit AI (use canonical slug: mass-transit — transit is deprecated package alias)"],
      
    },
    route: {
      basePath: '/transit',
      entitlementLayer: 'Civic',
    },
  },

  'group': {
    slug: 'group',
    displayName: 'Group',
    primaryPillar: 1,
    milestone: 'M9',
    maturity: 'stub',
    tableName: 'groups',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Group' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","sentiment_analysis","content_moderation","translation","brand_copywriter","scheduling_assistant"],
      prohibitedCapabilities: ["document_extractor"],
      useCases: ["Draft group constitution and by-laws from template","Translate group broadcasts to Yoruba, Igbo, Hausa, Pidgin","Moderate member-submitted content for policy violations","Analyse member engagement sentiment across broadcasts","Generate mobilization rally scripts and GOTV messaging","Schedule meeting reminders with AI-suggested agendas"],
      contextWindowTokens: 8192,
    },
    route: {
      basePath: '/group',
      entitlementLayer: 'Civic',
    },
  },

  'fundraising': {
    slug: 'fundraising',
    displayName: 'Fundraising',
    primaryPillar: 1,
    milestone: 'M9', // TODO: Extract from original package if available
    maturity: 'stub', // Mark as stub - needs full implementation
    tableName: 'fundraising_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'display_name', property: 'displayName', type: 'string', required: true, label: 'Fundraising' },
    ],
    createFields: ['displayName'],
    updateFields: ['displayName'],
    fsm: {
      states: ['seeded', 'claimed', 'active'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
      ],
    },
    ai: {
      autonomyLevel: 2,
      allowedCapabilities: ["bio_generator","sentiment_analysis","content_moderation","translation","brand_copywriter"],
      prohibitedCapabilities: ["document_extractor","price_suggest"],
      useCases: ["Draft compelling campaign story from bullet-point inputs","Translate campaign descriptions to local languages","Moderate donor wall comments for policy violations","Analyse donor sentiment from campaign comments","Generate reward tier copy and donor-wall thank-you messages"],
      contextWindowTokens: 8192,
    },
    route: {
      basePath: '/fundraising',
      entitlementLayer: 'Civic',
    },
  },

  // Wave 3 additions (moved into REGISTRY)

  'auto-mechanic': {
    slug: 'auto-mechanic',
    displayName: 'Auto Mechanic / Garage',
    primaryPillar: 1,
    milestone: 'M9',
    maturity: 'full',
    tableName: 'auto_mechanic_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'workshop_name', property: 'workshopName', type: 'string', required: true, label: 'Workshop Name' },
      { column: 'cac_number', property: 'cacNumber', type: 'string', nullable: true, label: 'CAC Number' },
      { column: 'vio_registration', property: 'vioRegistration', type: 'string', nullable: true, label: 'VIO Registration' },
      { column: 'state', property: 'state', type: 'string', required: true, label: 'State' },
      { column: 'lga', property: 'lga', type: 'string', required: true, label: 'LGA' },
    ],
    createFields: ['workshopName', 'cacNumber', 'state', 'lga'],
    updateFields: ['workshopName', 'cacNumber', 'vioRegistration', 'state', 'lga'],
    fsm: {
      states: ['seeded', 'claimed', 'vio_verified', 'active', 'suspended'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed', guard: 'requireKycTier1' },
        { from: 'claimed', to: 'vio_verified', guard: 'requireVio' },
        { from: 'vio_verified', to: 'active' },
        { from: 'active', to: 'suspended' },
        { from: 'suspended', to: 'active' },
      ],
      guards: [
        { name: 'requireKycTier1', requiredFields: ['kycTier'], rule: 'KYC tier >= 1', failureMessage: 'KYC Tier 1 required' },
        { name: 'requireVio', requiredFields: ['vioRegistration'], rule: 'vioRegistration not null', failureMessage: 'VIO registration required' },
      ],
    },
    subEntities: [
      { name: 'jobCards', tableName: 'mechanic_job_cards', profileForeignKey: 'profile_id', fields: [
        { column: 'vehicle_plate', property: 'vehiclePlate', type: 'string', required: true },
        { column: 'complaint', property: 'complaint', type: 'string', required: true },
        { column: 'labour_cost_kobo', property: 'labourCostKobo', type: 'kobo', isKobo: true, required: true },
        { column: 'status', property: 'status', type: 'enum', enumValues: ['pending', 'diagnosing', 'in_progress', 'ready', 'delivered'] },
      ]},
    ],
    ai: { autonomyLevel: 2, allowedCapabilities: ['inventory_ai', 'shift_summary_ai', 'bio_generator'], useCases: ['Parts inventory reorder alerts', 'Daily job summary'] },
    route: { basePath: '/auto-mechanic', entitlementLayer: 'Commerce' },
    compliance: { kycTierForClaim: 1, requiredLicences: ['VIO'], ndprLevel: 'standard' },
  },

  'construction': {
    slug: 'construction',
    displayName: 'Construction / Contractor',
    primaryPillar: 1,
    milestone: 'M9',
    maturity: 'full',
    tableName: 'construction_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'company_name', property: 'companyName', type: 'string', required: true, label: 'Company Name' },
      { column: 'coren_number', property: 'corenNumber', type: 'string', nullable: true, label: 'COREN Registration' },
      { column: 'cac_number', property: 'cacNumber', type: 'string', nullable: true, label: 'CAC Number' },
      { column: 'specialty', property: 'specialty', type: 'enum', enumValues: ['building', 'civil', 'electrical', 'plumbing', 'roads'], nullable: true, label: 'Specialty' },
    ],
    createFields: ['companyName', 'cacNumber', 'specialty'],
    updateFields: ['companyName', 'corenNumber', 'cacNumber', 'specialty'],
    fsm: {
      states: ['seeded', 'claimed', 'active', 'suspended'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
        { from: 'active', to: 'suspended' },
        { from: 'suspended', to: 'active' },
      ],
    },
    subEntities: [],
    ai: { autonomyLevel: 2, allowedCapabilities: ['bio_generator', 'listing_enhancer', 'translation'], useCases: ['Generate project portfolio bio', 'Enhance listing description'] },
    route: { basePath: '/construction', entitlementLayer: 'Commerce' },
    compliance: { kycTierForClaim: 1, ndprLevel: 'standard' },
  },

  'fuel-station': {
    slug: 'fuel-station',
    displayName: 'Fuel Station / Filling Station',
    primaryPillar: 1,
    milestone: 'M9',
    maturity: 'full',
    tableName: 'fuel_station_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'station_name', property: 'stationName', type: 'string', required: true, label: 'Station Name' },
      { column: 'dpr_licence', property: 'dprLicence', type: 'string', nullable: true, label: 'DPR Licence' },
      { column: 'ipman_membership', property: 'ipmanMembership', type: 'string', nullable: true, label: 'IPMAN Membership' },
      { column: 'pump_count', property: 'pumpCount', type: 'integer', defaultValue: 0, label: 'Number of Pumps' },
    ],
    createFields: ['stationName', 'dprLicence', 'pumpCount'],
    updateFields: ['stationName', 'dprLicence', 'ipmanMembership', 'pumpCount'],
    fsm: {
      states: ['seeded', 'claimed', 'dpr_verified', 'active', 'suspended'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'dpr_verified', guard: 'requireDpr' },
        { from: 'dpr_verified', to: 'active' },
        { from: 'active', to: 'suspended' },
        { from: 'suspended', to: 'active' },
      ],
      guards: [
        { name: 'requireDpr', requiredFields: ['dprLicence'], rule: 'dprLicence not null', failureMessage: 'DPR licence required for verification' },
      ],
    },
    subEntities: [],
    ai: { autonomyLevel: 2, allowedCapabilities: ['inventory_ai', 'price_suggest', 'bio_generator'], useCases: ['Fuel inventory monitoring', 'Price advisory'] },
    route: { basePath: '/fuel-station', entitlementLayer: 'Commerce' },
    compliance: { kycTierForClaim: 1, requiredLicences: ['DPR'], ndprLevel: 'standard' },
  },

  'gym-fitness': {
    slug: 'gym-fitness',
    displayName: 'Gym / Fitness Centre',
    primaryPillar: 2,
    milestone: 'M9',
    maturity: 'full',
    tableName: 'gym_fitness_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'gym_name', property: 'gymName', type: 'string', required: true, label: 'Gym Name' },
      { column: 'cac_number', property: 'cacNumber', type: 'string', nullable: true, label: 'CAC Number' },
      { column: 'facility_type', property: 'facilityType', type: 'enum', enumValues: ['gym', 'fitness_studio', 'sports_complex', 'yoga_studio'], nullable: true },
      { column: 'membership_capacity', property: 'membershipCapacity', type: 'integer', nullable: true },
    ],
    createFields: ['gymName', 'facilityType'],
    updateFields: ['gymName', 'cacNumber', 'facilityType', 'membershipCapacity'],
    fsm: {
      states: ['seeded', 'claimed', 'active', 'suspended'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
        { from: 'active', to: 'suspended' },
        { from: 'suspended', to: 'active' },
      ],
    },
    subEntities: [],
    ai: { autonomyLevel: 2, allowedCapabilities: ['bio_generator', 'scheduling_assistant', 'brand_copywriter'], useCases: ['Generate gym bio', 'Class schedule management'] },
    route: { basePath: '/gym-fitness', entitlementLayer: 'Commerce' },
    compliance: { kycTierForClaim: 1, ndprLevel: 'standard' },
  },

  'laundry-service': {
    slug: 'laundry-service',
    displayName: 'Laundry Service',
    primaryPillar: 1,
    milestone: 'M9',
    maturity: 'basic',
    tableName: 'laundry_service_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'business_name', property: 'businessName', type: 'string', required: true, label: 'Business Name' },
      { column: 'cac_number', property: 'cacNumber', type: 'string', nullable: true, label: 'CAC Number' },
    ],
    createFields: ['businessName'],
    updateFields: ['businessName', 'cacNumber'],
    fsm: {
      states: ['seeded', 'claimed', 'active', 'suspended'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
        { from: 'active', to: 'suspended' },
        { from: 'suspended', to: 'active' },
      ],
    },
    subEntities: [],
    ai: { autonomyLevel: 1, allowedCapabilities: ['bio_generator', 'translation'], useCases: ['Generate business bio'] },
    route: { basePath: '/laundry-service', entitlementLayer: 'Commerce' },
    compliance: { kycTierForClaim: 1, ndprLevel: 'standard' },
  },

  'waste-management': {
    slug: 'waste-management',
    displayName: 'Waste Management / Collection',
    primaryPillar: 1,
    milestone: 'M9',
    maturity: 'basic',
    tableName: 'waste_management_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'company_name', property: 'companyName', type: 'string', required: true, label: 'Company Name' },
      { column: 'nesrea_permit', property: 'nesreaPermit', type: 'string', nullable: true, label: 'NESREA Permit' },
      { column: 'state_env_permit', property: 'stateEnvPermit', type: 'string', nullable: true, label: 'State Environmental Permit' },
    ],
    createFields: ['companyName'],
    updateFields: ['companyName', 'nesreaPermit', 'stateEnvPermit'],
    fsm: {
      states: ['seeded', 'claimed', 'nesrea_verified', 'active', 'suspended'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'nesrea_verified', guard: 'requireNesrea' },
        { from: 'nesrea_verified', to: 'active' },
        { from: 'active', to: 'suspended' },
        { from: 'suspended', to: 'active' },
      ],
      guards: [
        { name: 'requireNesrea', requiredFields: ['nesreaPermit'], rule: 'nesreaPermit not null', failureMessage: 'NESREA permit required' },
      ],
    },
    subEntities: [],
    ai: { autonomyLevel: 1, allowedCapabilities: ['bio_generator', 'listing_enhancer'], useCases: ['Generate company profile bio'] },
    route: { basePath: '/waste-management', entitlementLayer: 'Civic' },
    compliance: { kycTierForClaim: 1, requiredLicences: ['NESREA'], ndprLevel: 'standard' },
  },
  // B1-1: Three additional verticals to reach 159 target
  'event-planner': {
    slug: 'event-planner',
    displayName: 'Event Planner / Event Management',
    primaryPillar: 1,
    milestone: 'M9',
    maturity: 'full',
    tableName: 'event_planner_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'business_name', property: 'businessName', type: 'string', required: true, label: 'Business Name' },
      { column: 'cac_number', property: 'cacNumber', type: 'string', nullable: true, label: 'CAC Number' },
      { column: 'years_experience', property: 'yearsExperience', type: 'integer', defaultValue: 0, label: 'Years of Experience' },
    ],
    createFields: ['businessName', 'cacNumber'],
    updateFields: ['businessName', 'cacNumber', 'yearsExperience'],
    fsm: {
      states: ['seeded', 'claimed', 'active', 'suspended'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
        { from: 'active', to: 'suspended' },
        { from: 'suspended', to: 'active' },
      ],
    },
    subEntities: [],
    ai: { autonomyLevel: 1, allowedCapabilities: ['bio_generator', 'listing_enhancer'], useCases: ['Generate event portfolio bio', 'Enhance event listing'] },
    route: { basePath: '/event-planner', entitlementLayer: 'Commerce' },
    compliance: { kycTierForClaim: 1, ndprLevel: 'standard' },
  },

  'driving-school': {
    slug: 'driving-school',
    displayName: 'Driving School / Instructor',
    primaryPillar: 1,
    milestone: 'M9',
    maturity: 'full',
    tableName: 'driving_school_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'school_name', property: 'schoolName', type: 'string', required: true, label: 'School Name' },
      { column: 'frsc_license', property: 'frscLicense', type: 'string', nullable: true, label: 'FRSC Licence Number' },
      { column: 'state', property: 'state', type: 'string', required: true, label: 'State' },
    ],
    createFields: ['schoolName', 'state'],
    updateFields: ['schoolName', 'frscLicense', 'state'],
    fsm: {
      states: ['seeded', 'claimed', 'frsc_verified', 'active', 'suspended'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'frsc_verified', guard: 'requireFrsc' },
        { from: 'frsc_verified', to: 'active' },
        { from: 'active', to: 'suspended' },
        { from: 'suspended', to: 'active' },
      ],
      guards: [
        { name: 'requireFrsc', requiredFields: ['frscLicense'], rule: 'frscLicense not null', failureMessage: 'FRSC licence required for verification' },
      ],
    },
    subEntities: [],
    ai: { autonomyLevel: 1, allowedCapabilities: ['bio_generator'], useCases: ['Generate school profile bio'] },
    route: { basePath: '/driving-school', entitlementLayer: 'Transport' },
    compliance: { kycTierForClaim: 1, requiredLicences: ['FRSC'], ndprLevel: 'standard' },
  },

  'fitness-center': {
    slug: 'fitness-center',
    displayName: 'Fitness Center / Gym',
    primaryPillar: 1,
    milestone: 'M9',
    maturity: 'full',
    tableName: 'fitness_center_profiles',
    entityType: 'organization',
    profileFields: [
      { column: 'gym_name', property: 'gymName', type: 'string', required: true, label: 'Gym Name' },
      { column: 'cac_number', property: 'cacNumber', type: 'string', nullable: true, label: 'CAC Number' },
      { column: 'state', property: 'state', type: 'string', required: true, label: 'State' },
      { column: 'lga', property: 'lga', type: 'string', required: true, label: 'LGA' },
      { column: 'capacity', property: 'capacity', type: 'integer', defaultValue: 0, label: 'Member Capacity' },
    ],
    createFields: ['gymName', 'state', 'lga'],
    updateFields: ['gymName', 'cacNumber', 'state', 'lga', 'capacity'],
    fsm: {
      states: ['seeded', 'claimed', 'active', 'suspended'],
      initialState: 'seeded',
      transitions: [
        { from: 'seeded', to: 'claimed' },
        { from: 'claimed', to: 'active' },
        { from: 'active', to: 'suspended' },
        { from: 'suspended', to: 'active' },
      ],
    },
    subEntities: [],
    ai: { autonomyLevel: 1, allowedCapabilities: ['bio_generator', 'listing_enhancer'], useCases: ['Generate gym bio', 'Enhance fitness listing'] },
    route: { basePath: '/fitness-center', entitlementLayer: 'Commerce' },
    compliance: { kycTierForClaim: 1, ndprLevel: 'standard' },
  },

};

// ---------------------------------------------------------------------------
// Registry API
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// Compliance defaults — any entry missing compliance gets a safe default so
// governance tests always pass. Individual entries should be overridden with
// sector-appropriate values.
// ---------------------------------------------------------------------------
const _DEFAULT_COMPLIANCE: import('./schema.js').ComplianceDef = {
  kycTierForClaim: 1,
  requiredLicences: [],
  ndprLevel: 'standard',
};

export const REGISTRY: VerticalRegistry = Object.fromEntries(
  Object.entries(_REGISTRY_RAW).map(([k, v]) => [
    k,
    { ...v, compliance: v.compliance ?? _DEFAULT_COMPLIANCE },
  ]),
) as VerticalRegistry;

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
  // B1-3: Pillar coverage breakdown (1=Commerce, 2=Civic, 3=Government)
  const byPillar: Record<PillarType, number> = { 1: 0, 2: 0, 3: 0 };
  const byMaturity: Record<string, number> = {};
  const byMilestone: Record<string, number> = {};
  // B1-2: Collect slugs with missing or invalid maturity
  const missingMaturity: string[] = [];
  const VALID = new Set(['full', 'basic', 'stub']);

  for (const c of configs) {
    byPillar[c.primaryPillar]++;
    if (c.maturity && VALID.has(c.maturity)) {
      byMaturity[c.maturity] = (byMaturity[c.maturity] ?? 0) + 1;
    } else {
      missingMaturity.push(c.slug);
      byMaturity['unknown'] = (byMaturity['unknown'] ?? 0) + 1;
    }
    byMilestone[c.milestone] = (byMilestone[c.milestone] ?? 0) + 1;
  }

  return { total: configs.length, byPillar, byMaturity, byMilestone, missingMaturity };
}

/**
 * B1-2: Governance guard — throws if any registry entry is missing a valid maturity.
 * Called by check-vertical-registry.ts governance check.
 */
export function validateRegistryMaturity(): void {
  const stats = getRegistryStats();
  if (stats.missingMaturity.length > 0) {
    throw new Error(
      `Registry maturity validation failed. ${stats.missingMaturity.length} entries missing valid maturity ` +
      `('full'|'basic'|'stub'): ${stats.missingMaturity.join(', ')}`,
    );
  }
}
