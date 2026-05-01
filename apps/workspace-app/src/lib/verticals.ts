/**
 * Vertical Registry — complete list of all WebWaka OS business verticals.
 *
 * This registry is the source of truth for vertical slugs used in:
 *   - Onboarding vertical picker
 *   - VerticalView page
 *   - AI advisory capability mapping
 *   - WakaPage templates
 *
 * Total: 159 verticals (matches backend packages/verticals-* count)
 *
 * FIX: Expanded from 23 to full 159 to match platform marketing claims ("200+ verticals").
 */

export interface VerticalMeta {
  slug: string;
  label: string;
  icon: string;
  category: string;
  aiCapability?: string;
}

export const VERTICAL_REGISTRY: Record<string, VerticalMeta> = {
  // ── Agriculture & Food Production ──────────────────────────────────────────
  'abattoir':              { slug: 'abattoir',              label: 'Abattoir',                  icon: '🥩', category: 'Agriculture', aiCapability: 'SLAUGHTER_YIELD_FORECAST' },
  'agro-input':            { slug: 'agro-input',            label: 'Agro-Input Store',          icon: '🌱', category: 'Agriculture', aiCapability: 'INPUT_DEMAND_ADVISORY' },
  'cassava-miller':        { slug: 'cassava-miller',        label: 'Cassava Miller',            icon: '🌾', category: 'Agriculture', aiCapability: 'MILLING_YIELD_FORECAST' },
  'cocoa-exporter':        { slug: 'cocoa-exporter',        label: 'Cocoa Exporter',            icon: '🍫', category: 'Agriculture', aiCapability: 'COMMODITY_PRICE_ADVISORY' },
  'cold-room':             { slug: 'cold-room',             label: 'Cold Room Facility',        icon: '🧊', category: 'Agriculture', aiCapability: 'TEMPERATURE_ALERT_ADVISORY' },
  'farm':                  { slug: 'farm',                  label: 'Farm',                      icon: '🚜', category: 'Agriculture' },
  'fish-market':           { slug: 'fish-market',           label: 'Fish Market',               icon: '🐟', category: 'Agriculture', aiCapability: 'DEMAND_PLANNING_ADVISORY' },
  'food-processing':       { slug: 'food-processing',       label: 'Food Processing',           icon: '🏭', category: 'Agriculture', aiCapability: 'PRODUCTION_DEMAND_ADVISORY' },
  'palm-oil':              { slug: 'palm-oil',              label: 'Palm Oil Mill',             icon: '🌴', category: 'Agriculture', aiCapability: 'PALM_OIL_YIELD_ADVISORY' },
  'poultry-farm':          { slug: 'poultry-farm',          label: 'Poultry Farm',              icon: '🐔', category: 'Agriculture' },
  'produce-aggregator':    { slug: 'produce-aggregator',    label: 'Produce Aggregator',        icon: '🥬', category: 'Agriculture' },
  'vegetable-garden':      { slug: 'vegetable-garden',      label: 'Vegetable Garden',          icon: '🥦', category: 'Agriculture', aiCapability: 'CROP_YIELD_ADVISORY' },

  // ── Food & Hospitality ─────────────────────────────────────────────────────
  'bakery':                { slug: 'bakery',                label: 'Bakery',                    icon: '🥖', category: 'Food & Hospitality' },
  'catering':              { slug: 'catering',              label: 'Catering Service',          icon: '🍽️', category: 'Food & Hospitality' },
  'food-vendor':           { slug: 'food-vendor',           label: 'Food Vendor',               icon: '🥘', category: 'Food & Hospitality' },
  'hotel':                 { slug: 'hotel',                 label: 'Hotel',                     icon: '🏨', category: 'Food & Hospitality' },
  'restaurant':            { slug: 'restaurant',            label: 'Restaurant',                icon: '🍽️', category: 'Food & Hospitality' },
  'restaurant-chain':      { slug: 'restaurant-chain',      label: 'Restaurant Chain',          icon: '🍔', category: 'Food & Hospitality' },

  // ── Retail & Commerce ─────────────────────────────────────────────────────
  'airtime-reseller':      { slug: 'airtime-reseller',      label: 'Airtime & VTU Reseller',    icon: '📱', category: 'Retail' },
  'bookshop':              { slug: 'bookshop',              label: 'Bookshop & Stationery',     icon: '📚', category: 'Retail' },
  'building-materials':    { slug: 'building-materials',    label: 'Building Materials',        icon: '🏗️', category: 'Retail' },
  'electrical-fittings':   { slug: 'electrical-fittings',   label: 'Electrical Fittings',       icon: '💡', category: 'Retail' },
  'electronics-repair':    { slug: 'electronics-repair',    label: 'Electronics Repair',        icon: '🔌', category: 'Retail' },
  'fuel-station':          { slug: 'fuel-station',          label: 'Fuel Station',              icon: '⛽', category: 'Retail' },
  'gas-distributor':       { slug: 'gas-distributor',       label: 'Gas Distributor',           icon: '🔥', category: 'Retail' },
  'generator-dealer':      { slug: 'generator-dealer',      label: 'Generator Dealer',          icon: '⚡', category: 'Retail' },
  'hire-purchase':         { slug: 'hire-purchase',         label: 'Hire Purchase',             icon: '🛍️', category: 'Retail' },
  'internet-cafe':         { slug: 'internet-cafe',         label: 'Internet Café',             icon: '💻', category: 'Retail' },
  'iron-steel':            { slug: 'iron-steel',            label: 'Iron & Steel',              icon: '🔩', category: 'Retail' },
  'market':                { slug: 'market',                label: 'Market',                    icon: '🏪', category: 'Retail' },
  'mobile-money-agent':    { slug: 'mobile-money-agent',    label: 'Mobile Money Agent',        icon: '💰', category: 'Retail' },
  'motorcycle-accessories':{ slug: 'motorcycle-accessories',label: 'Motorcycle Accessories',    icon: '🏍️', category: 'Retail' },
  'paints-distributor':    { slug: 'paints-distributor',    label: 'Paints Distributor',        icon: '🎨', category: 'Retail' },
  'petrol-station':        { slug: 'petrol-station',        label: 'Petrol Station',            icon: '⛽', category: 'Retail' },
  'pharmacy':              { slug: 'pharmacy',              label: 'Pharmacy',                  icon: '💊', category: 'Retail' },
  'pharmacy-chain':        { slug: 'pharmacy-chain',        label: 'Pharmacy Chain',            icon: '💊', category: 'Retail' },
  'phone-repair-shop':     { slug: 'phone-repair-shop',     label: 'Phone Repair Shop',         icon: '📱', category: 'Retail' },
  'plumbing-supplies':     { slug: 'plumbing-supplies',     label: 'Plumbing Supplies',         icon: '🔧', category: 'Retail' },
  'pos-business':          { slug: 'pos-business',          label: 'POS Business',              icon: '💳', category: 'Retail' },
  'spare-parts':           { slug: 'spare-parts',           label: 'Spare Parts',               icon: '🔩', category: 'Retail' },
  'supermarket':           { slug: 'supermarket',           label: 'Supermarket',               icon: '🛒', category: 'Retail' },
  'tyre-shop':             { slug: 'tyre-shop',             label: 'Tyre Shop',                 icon: '🛞', category: 'Retail' },
  'used-car-dealer':       { slug: 'used-car-dealer',       label: 'Used Car Dealer',           icon: '🚗', category: 'Retail' },
  'wholesale-market':      { slug: 'wholesale-market',      label: 'Wholesale Market',          icon: '📦', category: 'Retail' },

  // ── Services & Trades ─────────────────────────────────────────────────────
  'auto-mechanic':         { slug: 'auto-mechanic',         label: 'Auto Workshop',             icon: '🔧', category: 'Services' },
  'beauty-salon':          { slug: 'beauty-salon',          label: 'Beauty Salon',              icon: '💅', category: 'Services' },
  'borehole-driller':      { slug: 'borehole-driller',      label: 'Borehole Driller',          icon: '💧', category: 'Services' },
  'car-wash':              { slug: 'car-wash',              label: 'Car Wash & Detailing',       icon: '🚿', category: 'Services' },
  'cleaning-company':      { slug: 'cleaning-company',      label: 'Cleaning Company',          icon: '🧹', category: 'Services' },
  'cleaning-service':      { slug: 'cleaning-service',      label: 'Cleaning Service',          icon: '🧼', category: 'Services' },
  'construction':          { slug: 'construction',          label: 'Construction',              icon: '🏗️', category: 'Services' },
  'dispatch-rider':        { slug: 'dispatch-rider',        label: 'Dispatch Rider',            icon: '🛵', category: 'Services' },
  'driving-school':        { slug: 'driving-school',        label: 'Driving School',            icon: '🚗', category: 'Services' },
  'elderly-care':          { slug: 'elderly-care',          label: 'Elderly Care',              icon: '👴', category: 'Services' },
  'electrician':           { slug: 'electrician',           label: 'Electrician',               icon: '⚡', category: 'Services' },
  'furniture-maker':       { slug: 'furniture-maker',       label: 'Furniture Maker',           icon: '🪑', category: 'Services' },
  'generator-repair':      { slug: 'generator-repair',      label: 'Generator Repair',          icon: '🔌', category: 'Services' },
  'gym':                   { slug: 'gym',                   label: 'Gym',                       icon: '🏋️', category: 'Services' },
  'gym-fitness':           { slug: 'gym-fitness',           label: 'Gym & Fitness Studio',      icon: '💪', category: 'Services' },
  'hair-salon':            { slug: 'hair-salon',            label: 'Hair Salon',                icon: '✂️', category: 'Services' },
  'handyman':              { slug: 'handyman',              label: 'Handyman',                  icon: '🔨', category: 'Services' },
  'haulage':               { slug: 'haulage',               label: 'Haulage',                   icon: '🚛', category: 'Services' },
  'it-support':            { slug: 'it-support',            label: 'IT Support',                icon: '💻', category: 'Services' },
  'land-surveyor':         { slug: 'land-surveyor',         label: 'Land Surveyor',             icon: '📐', category: 'Services' },
  'laundry':               { slug: 'laundry',               label: 'Laundry',                   icon: '👕', category: 'Services' },
  'laundry-service':       { slug: 'laundry-service',       label: 'Laundry Service',           icon: '🧺', category: 'Services' },
  'logistics-delivery':    { slug: 'logistics-delivery',    label: 'Logistics & Delivery',      icon: '📦', category: 'Services' },
  'photography-studio':    { slug: 'photography-studio',    label: 'Photography Studio',        icon: '📷', category: 'Services' },
  'print-shop':            { slug: 'print-shop',            label: 'Print Shop',                icon: '🖨️', category: 'Services' },
  'printing-press':        { slug: 'printing-press',        label: 'Printing Press',            icon: '📰', category: 'Services' },
  'security-company':      { slug: 'security-company',      label: 'Security Company',          icon: '🛡️', category: 'Services' },
  'shoemaker':             { slug: 'shoemaker',             label: 'Shoemaker',                 icon: '👟', category: 'Services' },
  'solar-installer':       { slug: 'solar-installer',       label: 'Solar Installer',           icon: '☀️', category: 'Services' },
  'spa':                   { slug: 'spa',                   label: 'Spa',                       icon: '🧘', category: 'Services' },
  'tailor':                { slug: 'tailor',                label: 'Tailor',                    icon: '🧵', category: 'Services' },
  'tailoring-fashion':     { slug: 'tailoring-fashion',     label: 'Tailoring & Fashion',       icon: '👗', category: 'Services' },
  'warehouse':             { slug: 'warehouse',             label: 'Warehouse',                 icon: '🏭', category: 'Services' },
  'waste-management':      { slug: 'waste-management',      label: 'Waste Management',          icon: '♻️', category: 'Services' },
  'water-treatment':       { slug: 'water-treatment',       label: 'Water Treatment',           icon: '💧', category: 'Services' },
  'water-vendor':          { slug: 'water-vendor',          label: 'Water Vendor',              icon: '🚰', category: 'Services' },
  'wedding-planner':       { slug: 'wedding-planner',       label: 'Wedding Planner',           icon: '💍', category: 'Services' },
  'welding-fabrication':   { slug: 'welding-fabrication',   label: 'Welding & Fabrication',     icon: '⚙️', category: 'Services' },

  // ── Health & Medical ───────────────────────────────────────────────────────
  'clinic':                { slug: 'clinic',                label: 'Clinic',                    icon: '🏥', category: 'Health' },
  'community-health':      { slug: 'community-health',      label: 'Community Health Centre',   icon: '❤️', category: 'Health' },
  'dental-clinic':         { slug: 'dental-clinic',         label: 'Dental Clinic',             icon: '🦷', category: 'Health' },
  'optician':              { slug: 'optician',              label: 'Optician',                  icon: '👓', category: 'Health' },
  'orphanage':             { slug: 'orphanage',             label: 'Orphanage',                 icon: '🏠', category: 'Health' },
  'rehab-centre':          { slug: 'rehab-centre',          label: 'Rehabilitation Centre',     icon: '🏥', category: 'Health' },
  'vet-clinic':            { slug: 'vet-clinic',            label: 'Vet Clinic',                icon: '🐾', category: 'Health' },

  // ── Education & Training ───────────────────────────────────────────────────
  'book-club':             { slug: 'book-club',             label: 'Book Club',                 icon: '📖', category: 'Education' },
  'creche':                { slug: 'creche',                label: 'Crèche',                    icon: '👶', category: 'Education', aiCapability: 'ENROLLMENT_CAPACITY_ADVISORY' },
  'govt-school':           { slug: 'govt-school',           label: 'Government School',         icon: '🏫', category: 'Education' },
  'nursery-school':        { slug: 'nursery-school',        label: 'Nursery School',            icon: '🎒', category: 'Education' },
  'private-school':        { slug: 'private-school',        label: 'Private School',            icon: '🏫', category: 'Education' },
  'school':                { slug: 'school',                label: 'School',                    icon: '📚', category: 'Education' },
  'sports-academy':        { slug: 'sports-academy',        label: 'Sports Academy',            icon: '⚽', category: 'Education' },
  'tech-hub':              { slug: 'tech-hub',              label: 'Tech Hub',                  icon: '💡', category: 'Education' },
  'training-institute':    { slug: 'training-institute',    label: 'Training Institute',        icon: '📋', category: 'Education' },
  'tutoring':              { slug: 'tutoring',              label: 'Tutoring',                  icon: '📝', category: 'Education' },

  // ── Transport & Logistics ──────────────────────────────────────────────────
  'airport-shuttle':       { slug: 'airport-shuttle',       label: 'Airport Shuttle',           icon: '✈️', category: 'Transport' },
  'cargo-truck':           { slug: 'cargo-truck',           label: 'Cargo Truck',               icon: '🚛', category: 'Transport' },
  'clearing-agent':        { slug: 'clearing-agent',        label: 'Clearing Agent',            icon: '🚢', category: 'Transport' },
  'container-depot':       { slug: 'container-depot',       label: 'Container Depot',           icon: '📦', category: 'Transport' },
  'courier':               { slug: 'courier',               label: 'Courier',                   icon: '📬', category: 'Transport' },
  'ferry':                 { slug: 'ferry',                 label: 'Ferry',                     icon: '⛴️', category: 'Transport' },
  'motor-park':            { slug: 'motor-park',            label: 'Motor Park',                icon: '🚌', category: 'Transport' },
  'nurtw':                 { slug: 'nurtw',                 label: 'Transport Union',            icon: '🚐', category: 'Transport' },
  'okada-keke':            { slug: 'okada-keke',            label: 'Okada / Keke Operator',     icon: '🛺', category: 'Transport' },
  'rideshare':             { slug: 'rideshare',             label: 'Rideshare',                 icon: '🚗', category: 'Transport' },
  'road-transport-union':  { slug: 'road-transport-union',  label: 'Road Transport Union',      icon: '🚍', category: 'Transport' },
  'transit':               { slug: 'transit',               label: 'Transit',                   icon: '🚌', category: 'Transport' },
  'travel-agent':          { slug: 'travel-agent',          label: 'Travel Agent',              icon: '✈️', category: 'Transport' },

  // ── Professional & Business Services ─────────────────────────────────────
  'accounting-firm':       { slug: 'accounting-firm',       label: 'Accounting Firm',           icon: '📊', category: 'Professional' },
  'advertising-agency':    { slug: 'advertising-agency',    label: 'Advertising Agency',        icon: '📢', category: 'Professional' },
  'insurance-agent':       { slug: 'insurance-agent',       label: 'Insurance Agent',           icon: '🛡️', category: 'Professional' },
  'law-firm':              { slug: 'law-firm',              label: 'Law Firm',                  icon: '⚖️', category: 'Professional' },
  'motivational-speaker':  { slug: 'motivational-speaker',  label: 'Motivational Speaker',      icon: '🎤', category: 'Professional' },
  'oil-gas-services':      { slug: 'oil-gas-services',      label: 'Oil & Gas Services',        icon: '🛢️', category: 'Professional' },
  'pr-firm':               { slug: 'pr-firm',               label: 'PR Firm',                   icon: '📣', category: 'Professional' },
  'professional':          { slug: 'professional',          label: 'Independent Professional',  icon: '👔', category: 'Professional' },
  'property-developer':    { slug: 'property-developer',    label: 'Property Developer',        icon: '🏗️', category: 'Professional' },
  'real-estate-agency':    { slug: 'real-estate-agency',    label: 'Real Estate Agency',        icon: '🏠', category: 'Professional' },
  'sole-trader':           { slug: 'sole-trader',           label: 'Sole Trader',               icon: '💼', category: 'Professional' },
  'startup':               { slug: 'startup',               label: 'Startup',                   icon: '🚀', category: 'Professional' },
  'talent-agency':         { slug: 'talent-agency',         label: 'Talent Agency',             icon: '🌟', category: 'Professional' },
  'tax-consultant':        { slug: 'tax-consultant',        label: 'Tax Consultant',            icon: '📋', category: 'Professional' },

  // ── Creative & Media ───────────────────────────────────────────────────────
  'creator':               { slug: 'creator',               label: 'Content Creator',           icon: '🎬', category: 'Creative' },
  'fashion-brand':         { slug: 'fashion-brand',         label: 'Fashion Brand',             icon: '👗', category: 'Creative' },
  'florist':               { slug: 'florist',               label: 'Florist',                   icon: '💐', category: 'Creative' },
  'music-studio':          { slug: 'music-studio',          label: 'Music Studio',              icon: '🎵', category: 'Creative' },
  'newspaper-dist':        { slug: 'newspaper-dist',        label: 'Newspaper Distributor',     icon: '📰', category: 'Creative' },
  'podcast-studio':        { slug: 'podcast-studio',        label: 'Podcast Studio',            icon: '🎙️', category: 'Creative' },
  'recording-label':       { slug: 'recording-label',       label: 'Recording Label',           icon: '🎶', category: 'Creative' },

  // ── Events & Hospitality ───────────────────────────────────────────────────
  'event-hall':            { slug: 'event-hall',            label: 'Event Hall',                icon: '🎪', category: 'Events' },
  'event-planner':         { slug: 'event-planner',         label: 'Event Planner',             icon: '📅', category: 'Events' },
  'events-centre':         { slug: 'events-centre',         label: 'Events Centre',             icon: '🏟️', category: 'Events' },
  'sports-club':           { slug: 'sports-club',           label: 'Sports Club',               icon: '⚽', category: 'Events' },

  // ── Finance & FinTech ─────────────────────────────────────────────────────
  'bureau-de-change':      { slug: 'bureau-de-change',      label: 'Bureau de Change',          icon: '💱', category: 'Finance' },
  'cooperative':           { slug: 'cooperative',           label: 'Cooperative',               icon: '🤝', category: 'Finance' },
  'savings-group':         { slug: 'savings-group',         label: 'Savings Group',             icon: '💰', category: 'Finance' },

  // ── Community & Civil Society ─────────────────────────────────────────────
  'artisanal-mining':      { slug: 'artisanal-mining',      label: 'Artisanal Mining',          icon: '⛏️', category: 'Community' },
  'community-hall':        { slug: 'community-hall',        label: 'Community Hall',            icon: '🏛️', category: 'Community' },
  'community-radio':       { slug: 'community-radio',       label: 'Community Radio',           icon: '📻', category: 'Community' },
  'market-association':    { slug: 'market-association',    label: 'Market Association',        icon: '🤝', category: 'Community' },
  'ngo':                   { slug: 'ngo',                   label: 'NGO',                       icon: '❤️', category: 'Community' },
  'professional-association': { slug: 'professional-association', label: 'Professional Association', icon: '🏛️', category: 'Community' },
  'womens-association':    { slug: 'womens-association',    label: "Women's Association",       icon: '👩', category: 'Community' },
  'youth-organization':    { slug: 'youth-organization',    label: 'Youth Organization',        icon: '🧑', category: 'Community' },

  // ── Religious ─────────────────────────────────────────────────────────────
  'church':                { slug: 'church',                label: 'Church',                    icon: '⛪', category: 'Religious' },
  'ministry-mission':      { slug: 'ministry-mission',      label: 'Ministry / Mission',        icon: '✝️', category: 'Religious' },
  'mosque':                { slug: 'mosque',                label: 'Mosque',                    icon: '🕌', category: 'Religious' },

  // ── Government & Civic ────────────────────────────────────────────────────
  'campaign-office':       { slug: 'campaign-office',       label: 'Campaign Office',           icon: '🏛️', category: 'Government' },
  'constituency-office':   { slug: 'constituency-office',   label: 'Constituency Office',       icon: '🏛️', category: 'Government' },
  'government-agency':     { slug: 'government-agency',     label: 'Government Agency',         icon: '🏛️', category: 'Government' },
  'lga-office':            { slug: 'lga-office',            label: 'LGA Office',                icon: '🏢', category: 'Government' },
  'political-party':       { slug: 'political-party',       label: 'Political Party',           icon: '🗳️', category: 'Government' },
  'politician':            { slug: 'politician',            label: 'Politician',                icon: '🎤', category: 'Government' },
  'polling-unit':          { slug: 'polling-unit',          label: 'Polling Unit',              icon: '🗳️', category: 'Government' },
  'ward-rep':              { slug: 'ward-rep',              label: 'Ward Representative',       icon: '🏛️', category: 'Government' },
};

export function getVerticalMeta(slug: string): VerticalMeta | undefined {
  return VERTICAL_REGISTRY[slug];
}

export function getVerticalLabel(slug: string): string {
  return VERTICAL_REGISTRY[slug]?.label ?? slug;
}

/** Return verticals grouped by category */
export function getVerticalsByCategory(): Record<string, VerticalMeta[]> {
  const grouped: Record<string, VerticalMeta[]> = {};
  for (const v of Object.values(VERTICAL_REGISTRY)) {
    if (!grouped[v.category]) grouped[v.category] = [];
    grouped[v.category].push(v);
  }
  return grouped;
}

/** Flat sorted list of all verticals */
export function getAllVerticals(): VerticalMeta[] {
  return Object.values(VERTICAL_REGISTRY).sort((a, b) => a.label.localeCompare(b.label));
}

/** Search verticals by name (case-insensitive substring match) */
export function searchVerticals(query: string): VerticalMeta[] {
  if (!query.trim()) return getAllVerticals();
  const q = query.toLowerCase();
  return getAllVerticals().filter(v =>
    v.label.toLowerCase().includes(q) ||
    v.slug.includes(q) ||
    v.category.toLowerCase().includes(q),
  );
}
