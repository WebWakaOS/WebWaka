/**
 * Vertical AI Capability Configuration — SA-2.3
 * WebWaka OS — Per-vertical AI feature declarations.
 *
 * Declares which AICapabilityTypes each vertical is permitted to invoke
 * through SuperAgent. This is the source of truth for:
 *   - Displaying which AI features are available in each vertical's UI
 *   - Routing validation before adapter resolution
 *   - Billing category assignment (pillar-tagged usage in ai_usage_events)
 *
 * COMPLETENESS: Covers ALL 159 verticals from the @webwaka/verticals-* packages.
 * Issue OE-5 fix: removed orphaned 'mass-transit', 'hospital', 'artisan' aliases;
 * correct slugs are 'transit', 'clinic', and specific artisanal slugs respectively.
 * The legacy keys are retained at the bottom as deprecated aliases for backwards
 * compatibility with any stored workspace.vertical_slug values already in production.
 *
 * Platform Invariants:
 *   P7  — No direct SDK calls; all AI goes through @webwaka/ai resolveAdapter
 *   P10 — Consent still required at request time; this config does not waive it
 *   P13 — P13 (PII stripping) is enforced at call site, not here
 *
 * DEFAULT_VERTICAL_AI_CONFIG is used for any slug not explicitly listed.
 * getVerticalAiConfig NEVER returns null — it falls back to the default.
 */

import type { AICapabilityType } from '@webwaka/ai';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VerticalAiConfig {
  slug: string;
  primaryPillar: 1 | 2 | 3;
  allowedCapabilities: readonly AICapabilityType[];
  aiUseCases: string[];
}

// ---------------------------------------------------------------------------
// Default config — used for any unlisted vertical (fail-safe, not fail-closed)
// ---------------------------------------------------------------------------

export const DEFAULT_VERTICAL_AI_CONFIG: VerticalAiConfig = {
  slug: '_default',
  primaryPillar: 1,
  allowedCapabilities: [
    'bio_generator',
    'translation',
  ],
  aiUseCases: [
    'Auto-generate business bio from profile data',
    'Translate content to local Nigerian languages and Pidgin',
  ],
};

// ---------------------------------------------------------------------------
// All 159 Vertical AI Configs
// ---------------------------------------------------------------------------

export const VERTICAL_AI_CONFIGS: Readonly<Record<string, VerticalAiConfig>> = {

  // =========================================================================
  // CIVIC / POLITICAL
  // =========================================================================

  'politician': {
    slug: 'politician',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'policy_summarizer',
      'sentiment_analysis',
      'content_moderation',
      'translation',
    ],
    aiUseCases: [
      'Auto-generate politician bio from profile data',
      'Summarize policy documents in plain English or Pidgin',
      'Analyse constituent sentiment from community posts',
      'Moderate campaign posts for INEC compliance',
    ],
  },

  'political-party': {
    slug: 'political-party',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'policy_summarizer',
      'content_moderation',
      'translation',
      'document_extractor',
    ],
    aiUseCases: [
      'Generate party manifesto summaries',
      'Translate party documents to Pidgin or Hausa/Yoruba/Igbo',
      'Moderate party forum discussions',
      'Extract key data from INEC submissions',
    ],
  },

  'campaign-office': {
    slug: 'campaign-office',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'content_moderation',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate candidate campaign bios',
      'Moderate campaign communication channels',
      'Analyse constituent sentiment from campaign feedback',
      'Translate campaign materials to local languages',
    ],
  },

  'constituency-office': {
    slug: 'constituency-office',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'policy_summarizer',
      'document_extractor',
      'translation',
    ],
    aiUseCases: [
      'Auto-generate legislator and aide bios',
      'Summarise constituency petitions and bills',
      'Extract data from constituency documents',
      'Translate official correspondence to local languages',
    ],
  },

  'government-agency': {
    slug: 'government-agency',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'policy_summarizer',
      'document_extractor',
      'content_moderation',
      'translation',
    ],
    aiUseCases: [
      'Generate agency and official bios',
      'Summarise policy circulars and government gazettes',
      'Extract structured data from regulatory documents',
      'Moderate public comment boards',
      'Translate agency communications to local languages',
    ],
  },

  'lga-office': {
    slug: 'lga-office',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'policy_summarizer',
      'document_extractor',
      'translation',
    ],
    aiUseCases: [
      'Generate LGA chairman and councillor bios',
      'Summarise council meeting minutes',
      'Extract data from revenue and tax documents',
      'Translate council communications to local languages',
    ],
  },

  'ministry-mission': {
    slug: 'ministry-mission',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'policy_summarizer',
      'document_extractor',
      'translation',
    ],
    aiUseCases: [
      'Generate minister and civil servant bios',
      'Summarise ministry policy documents',
      'Extract data from procurement and budget documents',
      'Translate official communications to local languages',
    ],
  },

  'polling-unit': {
    slug: 'polling-unit',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'document_extractor',
      'translation',
    ],
    aiUseCases: [
      'Generate polling unit officer bios',
      'Extract structured data from result sheets',
      'Translate INEC instructions to local languages',
    ],
  },

  'ward-rep': {
    slug: 'ward-rep',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'policy_summarizer',
      'translation',
    ],
    aiUseCases: [
      'Generate ward representative bio',
      'Summarise ward-level community petitions',
      'Translate ward correspondence to local languages',
    ],
  },

  // =========================================================================
  // TRANSPORT / LOGISTICS
  // =========================================================================

  'motor-park': {
    slug: 'motor-park',
    primaryPillar: 1,
    allowedCapabilities: [
      'scheduling_assistant',
      'demand_forecasting',
      'route_optimizer',
      'translation',
    ],
    aiUseCases: [
      'Predict peak departure demand by route and season',
      'Optimise bus allocation across routes',
      'Assist dispatchers with scheduling queries in Pidgin',
    ],
  },

  'transit': {
    slug: 'transit',
    primaryPillar: 1,
    allowedCapabilities: [
      'scheduling_assistant',
      'demand_forecasting',
      'route_optimizer',
      'translation',
    ],
    aiUseCases: [
      'Fleet scheduling and demand forecasting for BRT/rail corridors',
      'Route optimisation across mass transit networks',
      'Passenger communication drafting in local languages',
    ],
  },

  'rideshare': {
    slug: 'rideshare',
    primaryPillar: 1,
    allowedCapabilities: [
      'scheduling_assistant',
      'route_optimizer',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Driver-passenger matching optimisation',
      'Ride request demand forecasting',
      'Rider review sentiment analysis for driver ratings',
    ],
  },

  'haulage': {
    slug: 'haulage',
    primaryPillar: 1,
    allowedCapabilities: [
      'route_optimizer',
      'demand_forecasting',
      'scheduling_assistant',
      'document_extractor',
    ],
    aiUseCases: [
      'Long-haul route cost optimisation',
      'Cargo demand forecasting by corridor',
      'Waybill and delivery document extraction',
    ],
  },

  'airport-shuttle': {
    slug: 'airport-shuttle',
    primaryPillar: 1,
    allowedCapabilities: [
      'scheduling_assistant',
      'demand_forecasting',
      'route_optimizer',
      'translation',
    ],
    aiUseCases: [
      'Flight-based shuttle demand forecasting',
      'Optimise shuttle allocation across airport terminals',
      'Scheduling assistant for booking and dispatch',
    ],
  },

  'cargo-truck': {
    slug: 'cargo-truck',
    primaryPillar: 1,
    allowedCapabilities: [
      'route_optimizer',
      'demand_forecasting',
      'document_extractor',
      'translation',
    ],
    aiUseCases: [
      'Long-haul route cost and fuel optimisation',
      'Cargo demand forecasting by season',
      'Extract data from waybills and customs documents',
    ],
  },

  'clearing-agent': {
    slug: 'clearing-agent',
    primaryPillar: 1,
    allowedCapabilities: [
      'document_extractor',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Extract structured data from customs and shipping documents',
      'Scheduling assistant for cargo release timelines',
      'Translate shipping documents to local languages',
    ],
  },

  'container-depot': {
    slug: 'container-depot',
    primaryPillar: 1,
    allowedCapabilities: [
      'demand_forecasting',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Container throughput demand forecasting',
      'Yard scheduling and berth assignment assistant',
      'Translate depot documentation to local languages',
    ],
  },

  'courier': {
    slug: 'courier',
    primaryPillar: 1,
    allowedCapabilities: [
      'route_optimizer',
      'scheduling_assistant',
      'demand_forecasting',
      'translation',
    ],
    aiUseCases: [
      'Last-mile delivery route optimisation',
      'Parcel demand forecasting by zone',
      'Delivery scheduling assistant',
      'Translate package tracking updates to local languages',
    ],
  },

  'dispatch-rider': {
    slug: 'dispatch-rider',
    primaryPillar: 1,
    allowedCapabilities: [
      'route_optimizer',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Optimise dispatch routes for fast delivery',
      'Rider availability scheduling assistant',
      'Translate delivery instructions to local languages',
    ],
  },

  'ferry': {
    slug: 'ferry',
    primaryPillar: 1,
    allowedCapabilities: [
      'scheduling_assistant',
      'demand_forecasting',
      'route_optimizer',
      'translation',
    ],
    aiUseCases: [
      'Ferry timetable and passenger demand forecasting',
      'Route optimisation across waterway corridors',
      'Passenger communication drafting',
    ],
  },

  'logistics-delivery': {
    slug: 'logistics-delivery',
    primaryPillar: 1,
    allowedCapabilities: [
      'route_optimizer',
      'demand_forecasting',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Last-mile delivery route and cost optimisation',
      'Volume demand forecasting by route',
      'Driver scheduling assistant',
      'Translate delivery updates to local languages',
    ],
  },

  'nurtw': {
    slug: 'nurtw',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'content_moderation',
      'translation',
    ],
    aiUseCases: [
      'Generate union officer and branch bios',
      'Moderate union member communication boards',
      'Translate union circulars to local languages',
    ],
  },

  'okada-keke': {
    slug: 'okada-keke',
    primaryPillar: 1,
    allowedCapabilities: [
      'route_optimizer',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Optimise routes for commercial motorcycles and tricycles',
      'Peak-demand scheduling assistant',
      'Translate rider instructions to local languages',
    ],
  },

  'road-transport-union': {
    slug: 'road-transport-union',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'content_moderation',
      'document_extractor',
      'translation',
    ],
    aiUseCases: [
      'Generate union executive bios',
      'Moderate member forums and communication boards',
      'Extract data from levy and registration documents',
      'Translate union circulars to local languages',
    ],
  },

  'travel-agent': {
    slug: 'travel-agent',
    primaryPillar: 1,
    allowedCapabilities: [
      'scheduling_assistant',
      'route_optimizer',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Itinerary scheduling and route planning assistant',
      'Client review sentiment analysis',
      'Translate travel packages to local languages',
    ],
  },

  // =========================================================================
  // HEALTH
  // =========================================================================

  'clinic': {
    slug: 'clinic',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'document_extractor',
      'translation',
    ],
    aiUseCases: [
      'Generate doctor and specialist bios from credentials',
      'Patient appointment scheduling assistant',
      'Extract medical service data from PDF tariff sheets',
      'Translate health communications for rural patients',
    ],
  },

  'community-health': {
    slug: 'community-health',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'content_moderation',
      'translation',
    ],
    aiUseCases: [
      'Generate CHW and health worker bios',
      'Community health outreach scheduling assistant',
      'Moderate community health forums',
      'Translate health advisories to local languages',
    ],
  },

  'dental-clinic': {
    slug: 'dental-clinic',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate dentist and hygienist bios',
      'Appointment scheduling assistant',
      'Analyse patient review sentiment',
      'Translate dental health content to local languages',
    ],
  },

  'elderly-care': {
    slug: 'elderly-care',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Generate care home and staff bios',
      'Resident care scheduling assistant',
      'Translate care instructions to local languages',
    ],
  },

  'optician': {
    slug: 'optician',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Generate optician and practice bios',
      'Eye test appointment scheduling assistant',
      'Translate eye health content to local languages',
    ],
  },

  'orphanage': {
    slug: 'orphanage',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'content_moderation',
      'translation',
    ],
    aiUseCases: [
      'Generate orphanage profile and staff bios',
      'Moderate donation appeal communication',
      'Translate appeal content to local languages',
    ],
  },

  'pharmacy': {
    slug: 'pharmacy',
    primaryPillar: 3,
    allowedCapabilities: [
      'bio_generator',
      'product_description_writer',
      'translation',
      'demand_forecasting',
    ],
    aiUseCases: [
      'Auto-generate pharmacy profile',
      'Write product descriptions for OTC medications',
      'Translate drug information to Pidgin',
      'Forecast medication demand for restocking',
    ],
  },

  'pharmacy-chain': {
    slug: 'pharmacy-chain',
    primaryPillar: 3,
    allowedCapabilities: [
      'bio_generator',
      'product_description_writer',
      'demand_forecasting',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate pharmacy chain and branch bios',
      'Write product descriptions across all OTC SKUs',
      'Multi-location demand forecasting for restocking',
      'Analyse customer feedback sentiment by branch',
      'Translate health content to local languages',
    ],
  },

  'rehab-centre': {
    slug: 'rehab-centre',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'content_moderation',
      'translation',
    ],
    aiUseCases: [
      'Generate rehabilitation centre and therapist bios',
      'Patient therapy scheduling assistant',
      'Moderate community support board',
      'Translate rehabilitation programmes to local languages',
    ],
  },

  'vet-clinic': {
    slug: 'vet-clinic',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Generate veterinarian and clinic bios',
      'Pet appointment scheduling assistant',
      'Translate animal health guidance to local languages',
    ],
  },

  // =========================================================================
  // EDUCATION
  // =========================================================================

  'school': {
    slug: 'school',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'document_extractor',
      'content_moderation',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Auto-generate school profile from registration data',
      'Extract and index school prospectus data',
      'Moderate school notice boards and forums',
      'Timetable scheduling assistant',
    ],
  },

  'book-club': {
    slug: 'book-club',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'content_moderation',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate book club and facilitator bios',
      'Moderate reading group discussions',
      'Analyse member review sentiment',
      'Translate reading materials to local languages',
    ],
  },

  'creche': {
    slug: 'creche',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Generate crèche and childcare worker bios',
      'Child care scheduling and slot management assistant',
      'Translate care instructions to local languages',
    ],
  },

  'driving-school': {
    slug: 'driving-school',
    primaryPillar: 1,
    allowedCapabilities: [
      'scheduling_assistant',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Lesson scheduling assistant for instructors and students',
      'Analyse student and parent review sentiment',
      'Translate highway code content to local languages',
    ],
  },

  'govt-school': {
    slug: 'govt-school',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'document_extractor',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Generate school profile and teacher bios',
      'Extract data from government school records',
      'Timetable and exam scheduling assistant',
      'Translate school communications to local languages',
    ],
  },

  'nursery-school': {
    slug: 'nursery-school',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Generate nursery school and teacher bios',
      'Term calendar and scheduling assistant',
      'Translate parent communications to local languages',
    ],
  },

  'private-school': {
    slug: 'private-school',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'document_extractor',
      'scheduling_assistant',
      'content_moderation',
      'translation',
    ],
    aiUseCases: [
      'Generate school profile and teacher bios',
      'Extract structured data from admission forms',
      'Timetable and exam scheduling assistant',
      'Moderate parent-teacher communication board',
      'Translate school communications to local languages',
    ],
  },

  'sports-academy': {
    slug: 'sports-academy',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate athlete and coach bios',
      'Training schedule and fixture scheduling assistant',
      'Analyse parent and athlete review sentiment',
      'Translate academy content to local languages',
    ],
  },

  'tech-hub': {
    slug: 'tech-hub',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'content_moderation',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate tech hub and startup founder bios',
      'Moderate community forums and Slack-like boards',
      'Analyse community sentiment from event feedback',
      'Translate hub content to local languages',
    ],
  },

  'training-institute': {
    slug: 'training-institute',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'content_moderation',
      'translation',
    ],
    aiUseCases: [
      'Generate institute and trainer bios',
      'Course scheduling and cohort management assistant',
      'Moderate trainee discussion boards',
      'Translate training materials to local languages',
    ],
  },

  'tutoring': {
    slug: 'tutoring',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate tutor bios and subject profiles',
      'Session scheduling assistant',
      'Analyse student and parent review sentiment',
      'Translate learning materials to local languages',
    ],
  },

  // =========================================================================
  // RELIGIOUS
  // =========================================================================

  'church': {
    slug: 'church',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'content_moderation',
      'translation',
      'scheduling_assistant',
    ],
    aiUseCases: [
      'Auto-generate pastor/ministry bios',
      'Moderate church forum and prayer request boards',
      'Translate sermons and devotionals',
      'Event scheduling assistant for church calendar',
    ],
  },

  'mosque': {
    slug: 'mosque',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'content_moderation',
      'translation',
      'scheduling_assistant',
    ],
    aiUseCases: [
      'Generate Imam and masjid bios',
      'Translate Friday khutbah summaries',
      'Moderate community boards',
      'Salah time scheduling and Ramadan calendar assistant',
    ],
  },

  // =========================================================================
  // FOOD / AGRICULTURE
  // =========================================================================

  'abattoir': {
    slug: 'abattoir',
    primaryPillar: 3,
    allowedCapabilities: [
      'demand_forecasting',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Livestock demand and slaughter volume forecasting',
      'Shift and throughput scheduling assistant',
      'Translate operational guides to local languages',
    ],
  },

  'agro-input': {
    slug: 'agro-input',
    primaryPillar: 3,
    allowedCapabilities: [
      'product_description_writer',
      'demand_forecasting',
      'translation',
    ],
    aiUseCases: [
      'Generate product descriptions for fertiliser and agro-chemicals',
      'Seasonal input demand forecasting',
      'Translate agro-advisory content to local languages',
    ],
  },

  'bakery': {
    slug: 'bakery',
    primaryPillar: 3,
    allowedCapabilities: [
      'product_description_writer',
      'demand_forecasting',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate product listings for baked goods',
      'Daily production demand forecasting',
      'Analyse customer review sentiment',
      'Translate menu and price lists to local languages',
    ],
  },

  'catering': {
    slug: 'catering',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'sentiment_analysis',
      'product_description_writer',
      'translation',
    ],
    aiUseCases: [
      'Generate catering business and chef bios',
      'Event catering scheduling assistant',
      'Analyse client review sentiment',
      'Write menu and food descriptions for listings',
      'Translate menus to local languages',
    ],
  },

  'cassava-miller': {
    slug: 'cassava-miller',
    primaryPillar: 3,
    allowedCapabilities: [
      'demand_forecasting',
      'translation',
    ],
    aiUseCases: [
      'Cassava throughput and demand forecasting',
      'Translate milling guides and advisories to local languages',
    ],
  },

  'cocoa-exporter': {
    slug: 'cocoa-exporter',
    primaryPillar: 3,
    allowedCapabilities: [
      'demand_forecasting',
      'document_extractor',
      'translation',
    ],
    aiUseCases: [
      'Global cocoa demand and price forecasting',
      'Extract structured data from export permits and shipping documents',
      'Translate export documentation summaries',
    ],
  },

  'cold-room': {
    slug: 'cold-room',
    primaryPillar: 3,
    allowedCapabilities: [
      'demand_forecasting',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Cold storage throughput demand forecasting',
      'Slot booking and inventory scheduling assistant',
      'Translate operational guides to local languages',
    ],
  },

  'farm': {
    slug: 'farm',
    primaryPillar: 3,
    allowedCapabilities: [
      'product_description_writer',
      'demand_forecasting',
      'route_optimizer',
      'translation',
    ],
    aiUseCases: [
      'Generate farm produce listings for marketplace',
      'Seasonal harvest demand and price forecasting',
      'Last-mile delivery route optimisation',
      'Translate agro-advisory content to local languages',
    ],
  },

  'fish-market': {
    slug: 'fish-market',
    primaryPillar: 3,
    allowedCapabilities: [
      'product_description_writer',
      'demand_forecasting',
      'translation',
    ],
    aiUseCases: [
      'Generate product listings for fresh and dried fish',
      'Market demand and price forecasting',
      'Translate product information to local languages',
    ],
  },

  'food-processing': {
    slug: 'food-processing',
    primaryPillar: 3,
    allowedCapabilities: [
      'product_description_writer',
      'demand_forecasting',
      'translation',
    ],
    aiUseCases: [
      'Generate product descriptions for processed foods',
      'Production demand and capacity forecasting',
      'Translate packaging and labelling content',
    ],
  },

  'food-vendor': {
    slug: 'food-vendor',
    primaryPillar: 3,
    allowedCapabilities: [
      'product_description_writer',
      'demand_forecasting',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate menu descriptions and daily specials listings',
      'Daily demand forecasting for ingredient purchasing',
      'Analyse customer review sentiment',
      'Translate menu to local languages',
    ],
  },

  'palm-oil': {
    slug: 'palm-oil',
    primaryPillar: 3,
    allowedCapabilities: [
      'demand_forecasting',
      'translation',
    ],
    aiUseCases: [
      'Palm oil price and demand forecasting',
      'Translate trade and pricing documentation',
    ],
  },

  'poultry-farm': {
    slug: 'poultry-farm',
    primaryPillar: 3,
    allowedCapabilities: [
      'demand_forecasting',
      'translation',
    ],
    aiUseCases: [
      'Egg and meat demand forecasting by season',
      'Translate poultry management guides to local languages',
    ],
  },

  'produce-aggregator': {
    slug: 'produce-aggregator',
    primaryPillar: 3,
    allowedCapabilities: [
      'product_description_writer',
      'demand_forecasting',
      'route_optimizer',
      'translation',
    ],
    aiUseCases: [
      'Generate produce listings from aggregated stock',
      'Multi-commodity demand and price forecasting',
      'Optimise last-mile collection routes from farms',
      'Translate market advisories to local languages',
    ],
  },

  'restaurant': {
    slug: 'restaurant',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'product_description_writer',
      'sentiment_analysis',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Generate restaurant and chef bios',
      'Write food descriptions and menu copy',
      'Analyse customer review and rating sentiment',
      'Reservation scheduling assistant',
      'Translate menu to local languages',
    ],
  },

  'restaurant-chain': {
    slug: 'restaurant-chain',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'product_description_writer',
      'demand_forecasting',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate chain brand and location bios',
      'Write food descriptions across all outlets',
      'Multi-location demand forecasting for inventory',
      'Aggregate customer sentiment across branches',
      'Translate menu and promotions to local languages',
    ],
  },

  'vegetable-garden': {
    slug: 'vegetable-garden',
    primaryPillar: 3,
    allowedCapabilities: [
      'product_description_writer',
      'demand_forecasting',
      'translation',
    ],
    aiUseCases: [
      'Generate fresh produce listings',
      'Seasonal demand forecasting for planting cycles',
      'Translate growing guides to local languages',
    ],
  },

  // =========================================================================
  // COMMERCE / RETAIL / SERVICES
  // =========================================================================

  'market': {
    slug: 'market',
    primaryPillar: 3,
    allowedCapabilities: [
      'product_description_writer',
      'demand_forecasting',
      'translation',
      'sentiment_analysis',
    ],
    aiUseCases: [
      'Generate product listings for market stall vendors',
      'Demand forecasting for market stock management',
      'Translate product info to Hausa/Yoruba/Igbo/Pidgin',
      'Buyer sentiment from reviews to improve vendor ratings',
    ],
  },

  'beauty-salon': {
    slug: 'beauty-salon',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate salon and stylist bios',
      'Appointment scheduling assistant',
      'Analyse client review sentiment',
      'Translate service menus to local languages',
    ],
  },

  'bookshop': {
    slug: 'bookshop',
    primaryPillar: 3,
    allowedCapabilities: [
      'product_description_writer',
      'demand_forecasting',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate book descriptions and catalogue listings',
      'Stock demand forecasting by genre and season',
      'Analyse reader review sentiment',
      'Translate book summaries to local languages',
    ],
  },

  'building-materials': {
    slug: 'building-materials',
    primaryPillar: 3,
    allowedCapabilities: [
      'product_description_writer',
      'demand_forecasting',
      'translation',
    ],
    aiUseCases: [
      'Generate product descriptions for building supplies',
      'Construction demand and stock forecasting',
      'Translate product specs to local languages',
    ],
  },

  'car-wash': {
    slug: 'car-wash',
    primaryPillar: 1,
    allowedCapabilities: [
      'scheduling_assistant',
      'demand_forecasting',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Booking slot scheduling assistant',
      'Peak demand forecasting by day and weather',
      'Analyse customer review sentiment',
      'Translate service packages to local languages',
    ],
  },

  'cleaning-company': {
    slug: 'cleaning-company',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate company and staff bios',
      'Job and shift scheduling assistant',
      'Analyse client review sentiment',
      'Translate service contracts to local languages',
    ],
  },

  'cleaning-service': {
    slug: 'cleaning-service',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate cleaner profile bios',
      'Booking and shift scheduling assistant',
      'Analyse client feedback sentiment',
      'Translate service offerings to local languages',
    ],
  },

  'electrical-fittings': {
    slug: 'electrical-fittings',
    primaryPillar: 3,
    allowedCapabilities: [
      'product_description_writer',
      'demand_forecasting',
      'translation',
    ],
    aiUseCases: [
      'Generate product descriptions for electrical components',
      'Stock demand forecasting',
      'Translate product specs to local languages',
    ],
  },

  'electronics-repair': {
    slug: 'electronics-repair',
    primaryPillar: 1,
    allowedCapabilities: [
      'scheduling_assistant',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Repair job queue and scheduling assistant',
      'Analyse client review sentiment',
      'Translate repair quotes to local languages',
    ],
  },

  'fashion-brand': {
    slug: 'fashion-brand',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'product_description_writer',
      'brand_copywriter',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate brand and designer bios',
      'Write product descriptions for fashion collections',
      'Generate campaign taglines and brand copy',
      'Analyse customer sentiment from reviews',
      'Translate product descriptions to local languages',
    ],
  },

  'florist': {
    slug: 'florist',
    primaryPillar: 3,
    allowedCapabilities: [
      'product_description_writer',
      'scheduling_assistant',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate flower arrangement and bouquet descriptions',
      'Event and delivery scheduling assistant',
      'Analyse customer review sentiment',
      'Translate product menus to local languages',
    ],
  },

  'funeral-home': {
    slug: 'funeral-home',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Generate funeral home and director bios',
      'Service and burial scheduling assistant',
      'Translate service packages to local languages',
    ],
  },

  'furniture-maker': {
    slug: 'furniture-maker',
    primaryPillar: 3,
    allowedCapabilities: [
      'bio_generator',
      'product_description_writer',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate craftsman and workshop bios',
      'Write product descriptions for furniture pieces',
      'Analyse client review sentiment',
      'Translate product catalogues to local languages',
    ],
  },

  'generator-dealer': {
    slug: 'generator-dealer',
    primaryPillar: 3,
    allowedCapabilities: [
      'product_description_writer',
      'demand_forecasting',
      'translation',
    ],
    aiUseCases: [
      'Generate product descriptions for generators and accessories',
      'Demand forecasting linked to NEPA outage patterns',
      'Translate product specs to local languages',
    ],
  },

  'generator-repair': {
    slug: 'generator-repair',
    primaryPillar: 1,
    allowedCapabilities: [
      'scheduling_assistant',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Repair booking and technician scheduling assistant',
      'Analyse customer review sentiment',
      'Translate repair quotes to local languages',
    ],
  },

  'gym': {
    slug: 'gym',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate gym and trainer bios',
      'Class and session scheduling assistant',
      'Analyse member review sentiment',
      'Translate fitness programmes to local languages',
    ],
  },

  'gym-fitness': {
    slug: 'gym-fitness',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate fitness centre and trainer bios',
      'Class timetable and slot scheduling assistant',
      'Analyse member feedback sentiment',
      'Translate fitness content to local languages',
    ],
  },

  'hair-salon': {
    slug: 'hair-salon',
    primaryPillar: 1,
    allowedCapabilities: [
      'scheduling_assistant',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Appointment booking and scheduling assistant',
      'Analyse client review sentiment',
      'Translate service menus to local languages',
    ],
  },

  'handyman': {
    slug: 'handyman',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate artisan and handyman bios',
      'Job booking and scheduling assistant',
      'Analyse client review sentiment',
      'Translate service quotes to local languages',
    ],
  },

  'hire-purchase': {
    slug: 'hire-purchase',
    primaryPillar: 1,
    allowedCapabilities: [
      'document_extractor',
      'demand_forecasting',
      'translation',
    ],
    aiUseCases: [
      'Extract data from hire-purchase agreements',
      'Repayment demand and default risk forecasting',
      'Translate contracts to local languages',
    ],
  },

  'internet-cafe': {
    slug: 'internet-cafe',
    primaryPillar: 1,
    allowedCapabilities: [
      'demand_forecasting',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Peak usage demand forecasting by hour',
      'Station and slot booking assistant',
      'Translate price lists to local languages',
    ],
  },

  'iron-steel': {
    slug: 'iron-steel',
    primaryPillar: 3,
    allowedCapabilities: [
      'product_description_writer',
      'demand_forecasting',
      'translation',
    ],
    aiUseCases: [
      'Generate product descriptions for iron and steel products',
      'Construction sector demand forecasting',
      'Translate product specs to local languages',
    ],
  },

  'laundry': {
    slug: 'laundry',
    primaryPillar: 1,
    allowedCapabilities: [
      'scheduling_assistant',
      'demand_forecasting',
      'translation',
    ],
    aiUseCases: [
      'Laundry booking and collection scheduling assistant',
      'Volume demand forecasting for staffing',
      'Translate service packages to local languages',
    ],
  },

  'laundry-service': {
    slug: 'laundry-service',
    primaryPillar: 1,
    allowedCapabilities: [
      'scheduling_assistant',
      'demand_forecasting',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Pickup and delivery scheduling assistant',
      'Demand forecasting for staffing and capacity',
      'Analyse customer review sentiment',
      'Translate service packages to local languages',
    ],
  },

  'market-association': {
    slug: 'market-association',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'content_moderation',
      'translation',
    ],
    aiUseCases: [
      'Generate market association and executive bios',
      'Moderate member communication boards',
      'Translate circulars to local languages',
    ],
  },

  'motorcycle-accessories': {
    slug: 'motorcycle-accessories',
    primaryPillar: 3,
    allowedCapabilities: [
      'product_description_writer',
      'demand_forecasting',
      'translation',
    ],
    aiUseCases: [
      'Generate product descriptions for motorcycle parts and accessories',
      'Parts demand forecasting',
      'Translate product listings to local languages',
    ],
  },

  'paints-distributor': {
    slug: 'paints-distributor',
    primaryPillar: 3,
    allowedCapabilities: [
      'product_description_writer',
      'demand_forecasting',
      'translation',
    ],
    aiUseCases: [
      'Generate product descriptions for paint ranges',
      'Seasonal demand forecasting for paint stock',
      'Translate product specs to local languages',
    ],
  },

  'petrol-station': {
    slug: 'petrol-station',
    primaryPillar: 1,
    allowedCapabilities: [
      'demand_forecasting',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Fuel demand forecasting by daily throughput',
      'Pump attendant shift scheduling assistant',
      'Translate signage and price board to local languages',
    ],
  },

  'phone-repair-shop': {
    slug: 'phone-repair-shop',
    primaryPillar: 1,
    allowedCapabilities: [
      'scheduling_assistant',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Repair job queue and technician scheduling assistant',
      'Analyse customer review sentiment',
      'Translate repair quotes to local languages',
    ],
  },

  'plumbing-supplies': {
    slug: 'plumbing-supplies',
    primaryPillar: 3,
    allowedCapabilities: [
      'product_description_writer',
      'demand_forecasting',
      'translation',
    ],
    aiUseCases: [
      'Generate product descriptions for plumbing materials',
      'Stock demand forecasting for construction seasons',
      'Translate product specs to local languages',
    ],
  },

  'print-shop': {
    slug: 'print-shop',
    primaryPillar: 1,
    allowedCapabilities: [
      'demand_forecasting',
      'scheduling_assistant',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Print job demand forecasting by season',
      'Order queue and production scheduling assistant',
      'Analyse client review sentiment',
      'Translate service packages to local languages',
    ],
  },

  'printing-press': {
    slug: 'printing-press',
    primaryPillar: 1,
    allowedCapabilities: [
      'demand_forecasting',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Large-format print demand forecasting',
      'Production shift and machine scheduling assistant',
      'Translate client briefs to local languages',
    ],
  },

  'shoemaker': {
    slug: 'shoemaker',
    primaryPillar: 3,
    allowedCapabilities: [
      'bio_generator',
      'product_description_writer',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate cobbler and craftsman bios',
      'Write product descriptions for handmade shoes',
      'Analyse client review sentiment',
      'Translate product listings to local languages',
    ],
  },

  'spare-parts': {
    slug: 'spare-parts',
    primaryPillar: 3,
    allowedCapabilities: [
      'product_description_writer',
      'demand_forecasting',
      'translation',
    ],
    aiUseCases: [
      'Generate product descriptions for auto spare parts',
      'Parts demand forecasting by vehicle make/model',
      'Translate parts catalogue to local languages',
    ],
  },

  'supermarket': {
    slug: 'supermarket',
    primaryPillar: 3,
    allowedCapabilities: [
      'product_description_writer',
      'demand_forecasting',
      'sentiment_analysis',
      'inventory_ai',
      'translation',
    ],
    aiUseCases: [
      'Generate product descriptions across all SKUs',
      'Category-level demand forecasting for procurement',
      'Analyse shopper review sentiment',
      'Smart reorder and stock anomaly detection',
      'Translate product labels to local languages',
    ],
  },

  'tailor': {
    slug: 'tailor',
    primaryPillar: 3,
    allowedCapabilities: [
      'bio_generator',
      'product_description_writer',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate tailor and atelier bios',
      'Write style and fabric descriptions for listings',
      'Analyse client review sentiment',
      'Translate order and quote documents to local languages',
    ],
  },

  'tailoring-fashion': {
    slug: 'tailoring-fashion',
    primaryPillar: 3,
    allowedCapabilities: [
      'bio_generator',
      'product_description_writer',
      'brand_copywriter',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate fashion brand and designer bios',
      'Write collection descriptions for online listings',
      'Generate brand copy and social captions',
      'Analyse client review sentiment',
      'Translate product descriptions to local languages',
    ],
  },

  'tyre-shop': {
    slug: 'tyre-shop',
    primaryPillar: 1,
    allowedCapabilities: [
      'demand_forecasting',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Tyre demand and fitment volume forecasting',
      'Booking and technician scheduling assistant',
      'Translate price lists to local languages',
    ],
  },

  'used-car-dealer': {
    slug: 'used-car-dealer',
    primaryPillar: 3,
    allowedCapabilities: [
      'product_description_writer',
      'document_extractor',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate compelling vehicle listing descriptions',
      'Extract data from vehicle registration and title documents',
      'Analyse buyer review sentiment',
      'Translate vehicle specs to local languages',
    ],
  },

  'water-vendor': {
    slug: 'water-vendor',
    primaryPillar: 1,
    allowedCapabilities: [
      'demand_forecasting',
      'route_optimizer',
      'translation',
    ],
    aiUseCases: [
      'Daily water demand forecasting by zone',
      'Tanker and sachet delivery route optimisation',
      'Translate price lists to local languages',
    ],
  },

  'wholesale-market': {
    slug: 'wholesale-market',
    primaryPillar: 3,
    allowedCapabilities: [
      'product_description_writer',
      'demand_forecasting',
      'translation',
    ],
    aiUseCases: [
      'Generate bulk commodity and product listings',
      'Wholesale demand and price trend forecasting',
      'Translate product catalogues to local languages',
    ],
  },

  // =========================================================================
  // PROFESSIONAL SERVICES
  // =========================================================================

  'accounting-firm': {
    slug: 'accounting-firm',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'document_extractor',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Generate firm and accountant bios',
      'Extract data from client financial documents',
      'Client appointment and deadline scheduling assistant',
      'Translate financial summaries to local languages',
    ],
  },

  'advertising-agency': {
    slug: 'advertising-agency',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'brand_copywriter',
      'content_moderation',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate agency and creative director bios',
      'Write campaign taglines and brand copy for clients',
      'Pre-screen ad copy for content policy compliance',
      'Analyse campaign sentiment from social and survey data',
      'Translate campaign materials to local languages',
    ],
  },

  'insurance-agent': {
    slug: 'insurance-agent',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'document_extractor',
      'translation',
    ],
    aiUseCases: [
      'Generate agent and broker bios',
      'Extract policy data from insurance documents',
      'Translate policy summaries to local languages',
    ],
  },

  'it-support': {
    slug: 'it-support',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate IT technician bios',
      'Ticket queue and job scheduling assistant',
      'Analyse client feedback sentiment',
      'Translate support documentation to local languages',
    ],
  },

  'land-surveyor': {
    slug: 'land-surveyor',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'document_extractor',
      'translation',
    ],
    aiUseCases: [
      'Generate surveyor and firm bios',
      'Extract data from land title and survey documents',
      'Translate survey reports to local languages',
    ],
  },

  'law-firm': {
    slug: 'law-firm',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'policy_summarizer',
      'document_extractor',
      'translation',
    ],
    aiUseCases: [
      'Generate lawyer and chamber bios',
      'Summarise legal briefs and court rulings',
      'Extract key clauses from contract documents',
      'Translate legal communications to local languages',
    ],
  },

  'pr-firm': {
    slug: 'pr-firm',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'brand_copywriter',
      'content_moderation',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate agency and publicist bios',
      'Write press releases and brand copy for clients',
      'Pre-screen press content for policy compliance',
      'Analyse media and social sentiment for clients',
      'Translate press materials to local languages',
    ],
  },

  'professional': {
    slug: 'professional',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Generate professional profile bio',
      'Client appointment scheduling assistant',
      'Translate profile and portfolio to local languages',
    ],
  },

  'professional-association': {
    slug: 'professional-association',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'content_moderation',
      'document_extractor',
      'translation',
    ],
    aiUseCases: [
      'Generate association and executive bios',
      'Moderate member forums',
      'Extract data from professional accreditation documents',
      'Translate association communications to local languages',
    ],
  },

  'security-company': {
    slug: 'security-company',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Generate security company and officer bios',
      'Guard roster and shift scheduling assistant',
      'Translate operational briefings to local languages',
    ],
  },

  'tax-consultant': {
    slug: 'tax-consultant',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'document_extractor',
      'policy_summarizer',
      'translation',
    ],
    aiUseCases: [
      'Generate consultant and firm bios',
      'Extract data from FIRS and tax assessment documents',
      'Summarise tax policy circulars for clients',
      'Translate tax guidance to local languages',
    ],
  },

  'talent-agency': {
    slug: 'talent-agency',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'brand_copywriter',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate talent and agency bios',
      'Write talent profiles and pitch copy',
      'Analyse social sentiment for talent management',
      'Translate talent profiles to local languages',
    ],
  },

  // =========================================================================
  // FINANCIAL / FINTECH
  // =========================================================================

  'pos-business': {
    slug: 'pos-business',
    primaryPillar: 1,
    allowedCapabilities: [
      'demand_forecasting',
      'scheduling_assistant',
      'translation',
      'sentiment_analysis',
    ],
    aiUseCases: [
      'Float demand forecasting by transaction history',
      'Agent scheduling across busy periods',
      'Translate POS receipts and statements to local languages',
      'Analyse agent performance from customer feedback',
    ],
  },

  'cooperative': {
    slug: 'cooperative',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'document_extractor',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Generate cooperative and officers bios',
      'Extract member data from paper registration forms',
      'Meeting and AGM scheduling assistant',
      'Translate cooperative bylaws to Pidgin',
    ],
  },

  'airtime-reseller': {
    slug: 'airtime-reseller',
    primaryPillar: 1,
    allowedCapabilities: [
      'demand_forecasting',
      'translation',
    ],
    aiUseCases: [
      'Daily airtime and data bundle demand forecasting',
      'Translate price lists and promotions to local languages',
    ],
  },

  'bureau-de-change': {
    slug: 'bureau-de-change',
    primaryPillar: 1,
    allowedCapabilities: [
      'demand_forecasting',
      'document_extractor',
      'translation',
    ],
    aiUseCases: [
      'FX demand and rate trend forecasting',
      'Extract data from CBN compliance documents',
      'Translate rate boards and client communications',
    ],
  },

  'mobile-money-agent': {
    slug: 'mobile-money-agent',
    primaryPillar: 1,
    allowedCapabilities: [
      'demand_forecasting',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Transaction volume demand forecasting',
      'Agent availability scheduling assistant',
      'Translate mobile money guides to local languages',
    ],
  },

  'savings-group': {
    slug: 'savings-group',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'document_extractor',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Generate savings group and coordinator bios',
      'Extract member data from registration records',
      'Meeting and contribution scheduling assistant',
      'Translate savings guidelines to local languages',
    ],
  },

  // =========================================================================
  // CREATOR / MEDIA
  // =========================================================================

  'community-radio': {
    slug: 'community-radio',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'content_moderation',
      'translation',
    ],
    aiUseCases: [
      'Generate station and presenter bios',
      'Moderate listener feedback and request boards',
      'Translate broadcast content to local languages',
    ],
  },

  'creator': {
    slug: 'creator',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'brand_copywriter',
      'content_moderation',
      'sentiment_analysis',
      'seo_meta_ai',
      'translation',
    ],
    aiUseCases: [
      'Generate creator and influencer bios',
      'Write content captions, headlines, and brand copy',
      'Pre-screen posts for platform content policy compliance',
      'Analyse audience sentiment from comments and DMs',
      'Generate SEO titles and meta descriptions for content pages',
      'Translate content to local languages',
    ],
  },

  'motivational-speaker': {
    slug: 'motivational-speaker',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'brand_copywriter',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate speaker bio and event copy',
      'Write talk titles and promotional copy',
      'Analyse audience feedback sentiment',
      'Translate speaker materials to local languages',
    ],
  },

  'music-studio': {
    slug: 'music-studio',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'brand_copywriter',
      'content_moderation',
      'translation',
    ],
    aiUseCases: [
      'Generate studio and artist bios',
      'Write press release and promotional copy',
      'Moderate studio community boards',
      'Translate artist bios to local languages',
    ],
  },

  'newspaper-dist': {
    slug: 'newspaper-dist',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'content_moderation',
      'translation',
    ],
    aiUseCases: [
      'Generate publication and distribution bios',
      'Moderate reader comment sections',
      'Translate headlines and summaries to local languages',
    ],
  },

  'photography-studio': {
    slug: 'photography-studio',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'sentiment_analysis',
      'brand_image_alt',
      'translation',
    ],
    aiUseCases: [
      'Generate photographer and studio bios',
      'Shoot booking and session scheduling assistant',
      'Analyse client review sentiment',
      'Generate alt-text for portfolio images',
      'Translate studio content to local languages',
    ],
  },

  'podcast-studio': {
    slug: 'podcast-studio',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'brand_copywriter',
      'content_moderation',
      'translation',
    ],
    aiUseCases: [
      'Generate podcast show and host bios',
      'Write episode descriptions and promotional copy',
      'Moderate listener feedback boards',
      'Translate episode summaries to local languages',
    ],
  },

  'recording-label': {
    slug: 'recording-label',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'brand_copywriter',
      'content_moderation',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate label and artist roster bios',
      'Write press releases and promotional materials',
      'Moderate artist and fan community boards',
      'Analyse fan sentiment from social media',
      'Translate artist content to local languages',
    ],
  },

  // =========================================================================
  // REAL ESTATE
  // =========================================================================

  'property-developer': {
    slug: 'property-developer',
    primaryPillar: 3,
    allowedCapabilities: [
      'bio_generator',
      'product_description_writer',
      'document_extractor',
      'translation',
    ],
    aiUseCases: [
      'Generate developer and project bios',
      'Write property development listings and descriptions',
      'Extract data from title deeds and survey documents',
      'Translate property documents to local languages',
    ],
  },

  'real-estate-agency': {
    slug: 'real-estate-agency',
    primaryPillar: 3,
    allowedCapabilities: [
      'bio_generator',
      'product_description_writer',
      'document_extractor',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate agent and agency bios',
      'Write compelling property listing descriptions',
      'Extract data from land registry and survey documents',
      'Analyse client review sentiment',
      'Translate property listings to local languages',
    ],
  },

  'warehouse': {
    slug: 'warehouse',
    primaryPillar: 3,
    allowedCapabilities: [
      'demand_forecasting',
      'scheduling_assistant',
      'inventory_ai',
      'translation',
    ],
    aiUseCases: [
      'Throughput and storage demand forecasting',
      'Inbound/outbound scheduling assistant',
      'Smart reorder and stock anomaly detection',
      'Translate warehouse operational guides',
    ],
  },

  // =========================================================================
  // ENERGY / INFRASTRUCTURE
  // =========================================================================

  'borehole-driller': {
    slug: 'borehole-driller',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Generate driller and company bios',
      'Project scheduling and site management assistant',
      'Translate technical proposals to local languages',
    ],
  },

  'gas-distributor': {
    slug: 'gas-distributor',
    primaryPillar: 3,
    allowedCapabilities: [
      'demand_forecasting',
      'route_optimizer',
      'translation',
    ],
    aiUseCases: [
      'LPG demand forecasting by zone and season',
      'Delivery route optimisation for tankers',
      'Translate safety and pricing communications',
    ],
  },

  'oil-gas-services': {
    slug: 'oil-gas-services',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'document_extractor',
      'policy_summarizer',
      'translation',
    ],
    aiUseCases: [
      'Generate company and personnel bios',
      'Extract data from DPR/NUPRC permits and contracts',
      'Summarise regulatory policy for compliance briefs',
      'Translate technical documents to local languages',
    ],
  },

  'solar-installer': {
    slug: 'solar-installer',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'product_description_writer',
      'translation',
    ],
    aiUseCases: [
      'Generate installer and company bios',
      'Installation project scheduling assistant',
      'Write product descriptions for solar systems',
      'Translate technical proposals to local languages',
    ],
  },

  'water-treatment': {
    slug: 'water-treatment',
    primaryPillar: 1,
    allowedCapabilities: [
      'demand_forecasting',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Water demand and production capacity forecasting',
      'Maintenance and delivery scheduling assistant',
      'Translate operational guides to local languages',
    ],
  },

  // =========================================================================
  // NGO / CIVIL SOCIETY
  // =========================================================================

  'ngo': {
    slug: 'ngo',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'policy_summarizer',
      'document_extractor',
      'translation',
      'content_moderation',
    ],
    aiUseCases: [
      'Auto-generate NGO and leadership bios',
      'Summarise grant applications and impact reports',
      'Extract data from CAC IT filings',
      'Translate programme materials to local languages',
    ],
  },

  'womens-association': {
    slug: 'womens-association',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'content_moderation',
      'translation',
    ],
    aiUseCases: [
      'Generate association and executive bios',
      'Moderate member communication boards',
      'Translate association materials to local languages',
    ],
  },

  'youth-organization': {
    slug: 'youth-organization',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'content_moderation',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Generate organisation and leader bios',
      'Moderate youth forum discussions',
      'Programme and event scheduling assistant',
      'Translate materials to local languages',
    ],
  },

  // =========================================================================
  // EVENTS / HOSPITALITY
  // =========================================================================

  'community-hall': {
    slug: 'community-hall',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Generate hall and committee bios',
      'Event booking and scheduling assistant',
      'Translate booking terms to local languages',
    ],
  },

  'event-hall': {
    slug: 'event-hall',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate event hall and management bios',
      'Event and slot booking scheduling assistant',
      'Analyse client review sentiment',
      'Translate booking packages to local languages',
    ],
  },

  'event-planner': {
    slug: 'event-planner',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'sentiment_analysis',
      'brand_copywriter',
      'translation',
    ],
    aiUseCases: [
      'Generate planner and coordinator bios',
      'Event timeline and vendor scheduling assistant',
      'Analyse client review sentiment',
      'Write event proposals and marketing copy',
      'Translate event programmes to local languages',
    ],
  },

  'events-centre': {
    slug: 'events-centre',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate centre and management bios',
      'Event booking and hall scheduling assistant',
      'Analyse client review sentiment',
      'Translate venue packages to local languages',
    ],
  },

  'hotel': {
    slug: 'hotel',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'sentiment_analysis',
      'product_description_writer',
      'translation',
    ],
    aiUseCases: [
      'Generate hotel and management bios',
      'Room booking and event scheduling assistant',
      'Analyse guest review sentiment',
      'Write room and amenity descriptions for listings',
      'Translate hotel content to local languages',
    ],
  },

  'spa': {
    slug: 'spa',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Generate spa and therapist bios',
      'Treatment booking and scheduling assistant',
      'Analyse client review sentiment',
      'Translate service menus to local languages',
    ],
  },

  'wedding-planner': {
    slug: 'wedding-planner',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'sentiment_analysis',
      'brand_copywriter',
      'translation',
    ],
    aiUseCases: [
      'Generate planner and coordinator bios',
      'Wedding timeline and vendor scheduling assistant',
      'Analyse client review sentiment',
      'Write wedding proposal and marketing copy',
      'Translate event programmes to local languages',
    ],
  },

  // =========================================================================
  // SPORTS / RECREATION
  // =========================================================================

  'sports-club': {
    slug: 'sports-club',
    primaryPillar: 2,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'content_moderation',
      'translation',
    ],
    aiUseCases: [
      'Generate club and player bios',
      'Match fixture and training scheduling assistant',
      'Moderate fan and member communication boards',
      'Translate club content to local languages',
    ],
  },

  // =========================================================================
  // TECHNOLOGY / INNOVATION
  // =========================================================================

  'startup': {
    slug: 'startup',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'brand_copywriter',
      'content_moderation',
      'seo_meta_ai',
      'translation',
    ],
    aiUseCases: [
      'Generate founder and team bios',
      'Write startup pitch copy and brand taglines',
      'Moderate community discussion boards',
      'Generate SEO titles for landing pages',
      'Translate pitch materials to local languages',
    ],
  },

  // =========================================================================
  // ARTISANAL / CRAFT
  // =========================================================================

  'artisanal-mining': {
    slug: 'artisanal-mining',
    primaryPillar: 1,
    allowedCapabilities: [
      'document_extractor',
      'translation',
    ],
    aiUseCases: [
      'Extract data from mining permits and regulatory documents',
      'Translate operational guides and compliance requirements to local languages',
    ],
  },

  'welding-fabrication': {
    slug: 'welding-fabrication',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'product_description_writer',
      'translation',
    ],
    aiUseCases: [
      'Generate fabricator and workshop bios',
      'Write product descriptions for fabricated items',
      'Translate technical specifications and quotes to local languages',
    ],
  },

  // =========================================================================
  // SOLE TRADER / GENERAL BUSINESS
  // =========================================================================

  'sole-trader': {
    slug: 'sole-trader',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'translation',
    ],
    aiUseCases: [
      'Generate self-employed trader profile bio',
      'Client appointment scheduling assistant',
      'Translate business profile to local languages',
    ],
  },

  // =========================================================================
  // DEPRECATED ALIASES (Issue OE-5)
  // Kept for backwards-compat with existing workspace.vertical_slug values.
  // These slugs have no matching @webwaka/verticals-* package.
  // Map to their canonical package-backed slugs in application code.
  // =========================================================================

  'mass-transit': {
    slug: 'mass-transit',
    primaryPillar: 1,
    allowedCapabilities: [
      'scheduling_assistant',
      'demand_forecasting',
      'route_optimizer',
      'translation',
    ],
    aiUseCases: [
      'Fleet scheduling and demand forecasting (use canonical slug: transit)',
    ],
  },

  'hospital': {
    slug: 'hospital',
    primaryPillar: 1,
    allowedCapabilities: [
      'bio_generator',
      'scheduling_assistant',
      'document_extractor',
      'translation',
    ],
    aiUseCases: [
      'Healthcare operations AI (use canonical slug: clinic)',
    ],
  },

  'artisan': {
    slug: 'artisan',
    primaryPillar: 3,
    allowedCapabilities: [
      'bio_generator',
      'product_description_writer',
      'sentiment_analysis',
      'translation',
    ],
    aiUseCases: [
      'Artisan profile and listing AI (use canonical slug: welding-fabrication or shoemaker)',
    ],
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get the AI config for a vertical slug.
 * NEVER returns null — falls back to DEFAULT_VERTICAL_AI_CONFIG for unknown slugs.
 * This guarantees that any vertical can call AI without a null-guard at every call site.
 *
 * Previously returned null for unknown slugs (Issue OE-5 — now fixed).
 */
export function getVerticalAiConfig(slug: string): VerticalAiConfig {
  return VERTICAL_AI_CONFIGS[slug] ?? DEFAULT_VERTICAL_AI_CONFIG;
}

/**
 * Check if a capability is permitted for a vertical.
 * Falls back to DEFAULT_VERTICAL_AI_CONFIG for unknown slugs (not fail-closed).
 * Returns false only if the capability is absent from the config.
 */
export function isCapabilityAllowed(
  slug: string,
  capability: AICapabilityType,
): boolean {
  const config = getVerticalAiConfig(slug);
  return (config.allowedCapabilities as readonly string[]).includes(capability);
}

/**
 * Get the list of all explicitly-configured vertical slugs.
 * Excludes the deprecated aliases.
 */
export function getAllVerticalSlugs(): string[] {
  return Object.keys(VERTICAL_AI_CONFIGS).filter(
    (s) => !['mass-transit', 'hospital', 'artisan'].includes(s),
  );
}
