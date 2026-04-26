-- =============================================================================
-- Pillar 3 Template Seed: land-surveyor / land-surveyor-site
-- Niche ID: P3-land-surveyor-land-surveyor-site
-- Category: professional | Family: standalone | NF Priority: high
-- Research brief: docs/templates/research/land-surveyor-land-surveyor-site-brief.md
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
  'land-surveyor-land-surveyor-site',
  'Land Surveyor Site',
  'professional',
  'land-surveyor',
  3,
  ARRAY['home','about','services','contact'],
  jsonb_build_object(
    'tagline',      'Precision You Can Trust. Land You Can Build On.',
    'description',  'SURCON-registered land surveyors providing Certificate of Occupancy surveys, estate layouts, topographical surveys, and boundary dispute resolution across Nigeria.',
    'phone',        '+234 800 000 0003',
    'email',        'survey@landsurvey.example.ng',
    'placeName',    'Lagos',
    'surconNumber', 'SURCON/RS/XXXX/YYYY',
    'offerings',    jsonb_build_array(
      jsonb_build_object('name','C-of-O Survey','description','Residential and commercial Certificate of Occupancy survey','priceKobo',15000000),
      jsonb_build_object('name','Estate Layout','description','Full subdivision plan with plot numbers and access roads','priceKobo',50000000),
      jsonb_build_object('name','Topographical Survey','description','Terrain mapping for civil engineering projects','priceKobo',null),
      jsonb_build_object('name','Beacon / Boundary Planting','description','Boundary demarcation with survey plan','priceKobo',8000000),
      jsonb_build_object('name','Boundary Dispute Report','description','Expert witness and court-acceptable survey report','priceKobo',null),
      jsonb_build_object('name','GIS & Drone Mapping','description','Large-scale aerial and GPS surveys','priceKobo',null)
    )
  ),
  jsonb_build_object(
    'surcon_registration',    true,
    'nis_membership',         true,
    'state_ministry_lands',   true,
    'cac_registration',       true,
    'professional_indemnity', true,
    'ndpr_compliant',         true
  ),
  jsonb_build_object(
    'whatsapp_cta',           true,
    'prices_in_ngn',          true,
    'paystack_payment',       true,
    'mobile_responsive_375',  true,
    'esc_all_user_strings',   true,
    'ndpr_consent_on_forms',  true,
    'surcon_trust_signal',    true
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
