-- =============================================================================
-- Pillar 3 Template Seed: abattoir / abattoir-meat-processing
-- Niche ID: P3-abattoir-abattoir-meat-processing
-- Category: agricultural | Family: standalone | NF Priority: high
-- Research brief: docs/templates/research/abattoir-abattoir-meat-processing-brief.md
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
  'abattoir-abattoir-meat-processing',
  'Abattoir & Meat Processing',
  'agricultural',
  'abattoir',
  3,
  ARRAY['home','about','services','contact'],
  jsonb_build_object(
    'tagline',           'NAFDAC-Compliant. Halal-Certified. Delivered Fresh.',
    'description',       'Commercial abattoir and meat processor supplying NAFDAC-compliant, NVS-inspected, and Halal-certified beef, chicken, and goat meat to hotels, restaurants, caterers, and supermarkets across Nigeria.',
    'phone',             '+234 800 000 0007',
    'email',             'orders@abattoir.example.ng',
    'placeName',         'Lagos',
    'nafdacNumber',      'NAFDAC/F/XXXXXXXX',
    'halalCertification','Halal Certified (MMDN)',
    'offerings',         jsonb_build_array(
      jsonb_build_object('name','Beef (Wholesale)','description','Fresh daily. NVS inspected. Min 50kg.','priceKobo',450000),
      jsonb_build_object('name','Chicken (Dressed)','description','Daily. Min 50 birds.','priceKobo',320000),
      jsonb_build_object('name','Goat / Ram','description','Whole carcass or cuts.','priceKobo',500000),
      jsonb_build_object('name','Offal (Roundabout)','description','Tripe, liver, kidney — fresh daily.','priceKobo',180000),
      jsonb_build_object('name','Frozen Bulk (IQF)','description','NAFDAC-labelled cold chain. 20kg min.','priceKobo',null)
    )
  ),
  jsonb_build_object(
    'nafdac_registration', true,
    'nvs_inspection',      true,
    'halal_certification', true,
    'fmard_licence',       true,
    'lga_permit',          true,
    'nesrea_waste',        true,
    'cold_chain',          true,
    'ndpr_compliant',      true
  ),
  jsonb_build_object(
    'whatsapp_cta',           true,
    'prices_in_ngn_per_kg',   true,
    'paystack_payment',       true,
    'mobile_responsive_375',  true,
    'esc_all_user_strings',   true,
    'ndpr_consent_on_forms',  true,
    'nafdac_halal_trust_signals', true
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
