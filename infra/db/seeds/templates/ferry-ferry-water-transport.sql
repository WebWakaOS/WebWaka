-- =============================================================================
-- Pillar 3 Template Seed: ferry / ferry-water-transport
-- Niche ID: P3-ferry-ferry-water-transport
-- Category: transport | Family: standalone | NF Priority: high
-- Research brief: docs/templates/research/ferry-ferry-water-transport-brief.md
-- =============================================================================

BEGIN;

INSERT INTO template_definitions (
  slug,
  display_name,
  category,
  niche_vertical,
  priority,
  pages,
  default_data,
  regulatory_signals,
  nf_compliance_flags,
  created_at
) VALUES (
  'ferry-ferry-water-transport',
  'Ferry & Water Transport',
  'transport',
  'ferry',
  3,
  ARRAY['home','about','services','contact'],
  jsonb_build_object(
    'tagline',     'Beat Lagos Traffic — Go by Water. Safe. Fast. On Time.',
    'description', 'NIWA and NIMASA licensed passenger ferry and water transport service serving major routes across Lagos Lagoon and Nigerian inland waterways. Life jackets mandatory. Safety-first.',
    'phone',       '+234 800 000 0008',
    'email',       'booking@ferryservice.example.ng',
    'placeName',   'Lagos',
    'niwaLicence', 'NIWA/WT/XXXX/YYYY',
    'offerings',   jsonb_build_array(
      jsonb_build_object('name','Marina (CMS) ↔ Badore / Ajah','description','Lagos Lagoon express | ~35 min | Departs every 30 min | 5:30am–9pm','priceKobo',250000),
      jsonb_build_object('name','Marina (CMS) ↔ Ikorodu','description','North Lagos route | ~50 min | Hourly | 6am–8pm','priceKobo',300000),
      jsonb_build_object('name','Lekki ↔ Victoria Island','description','VI connector | ~20 min | Every 45 min | 6:30am–10pm','priceKobo',180000),
      jsonb_build_object('name','Beach / Event Charter','description','Tarkwa Bay, Ilashe. Prior booking. Min 15 pax.','priceKobo',7500000),
      jsonb_build_object('name','Cargo / Pontoon Service','description','Building materials, bulk goods on request','priceKobo',null)
    )
  ),
  jsonb_build_object(
    'niwa_licence',      true,
    'nimasa_certified',  true,
    'laswa_permit',      true,
    'imo_safety',        true,
    'life_jackets',      true,
    'licensed_crew',     true,
    'ndpr_compliant',    true
  ),
  jsonb_build_object(
    'whatsapp_cta',           true,
    'prices_in_ngn',          true,
    'paystack_payment',       true,
    'mobile_responsive_375',  true,
    'esc_all_user_strings',   true,
    'ndpr_consent_on_forms',  true,
    'safety_messaging',       true,
    'emergency_contact',      true
  ),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  display_name      = EXCLUDED.display_name,
  default_data      = EXCLUDED.default_data,
  regulatory_signals = EXCLUDED.regulatory_signals,
  nf_compliance_flags = EXCLUDED.nf_compliance_flags,
  updated_at        = NOW();

COMMIT;
