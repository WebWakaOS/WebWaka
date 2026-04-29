-- =============================================================================
-- Pillar 3 Template Seed: borehole-driller / borehole-drilling
-- Niche ID: P3-borehole-driller-borehole-drilling
-- Category: construction | Family: standalone | NF Priority: high
-- Research brief: docs/templates/research/borehole-driller-borehole-drilling-brief.md
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
  'borehole-driller-borehole-drilling',
  'Borehole Driller Site',
  'construction',
  'borehole-driller',
  3,
  ARRAY['home','about','services','contact'],
  jsonb_build_object(
    'tagline',     'Clean Water. Every Day. COREN-Certified Borehole Engineers.',
    'description', 'COREN-registered borehole drilling engineers providing clean water solutions for estates, schools, churches, hospitals, and industries across Nigeria. Expert in deep drilling, solar borehole systems, and water treatment.',
    'phone',       '+234 800 000 0009',
    'email',       'quote@boreholeng.example.ng',
    'placeName',   'Lagos',
    'corenNumber', 'COREN/[XXXX]',
    'offerings',   jsonb_build_array(
      jsonb_build_object('name','Deep Borehole Drilling','description','50m–200m+ depth, casing, pump installation','priceKobo',150000000),
      jsonb_build_object('name','Solar Borehole System','description','Solar panels + pump + tank — off-grid water','priceKobo',250000000),
      jsonb_build_object('name','Borehole Rehabilitation','description','Repair failed or low-yield boreholes','priceKobo',35000000),
      jsonb_build_object('name','Overhead / Ground Tank','description','10,000L–100,000L elevated tank installation','priceKobo',80000000),
      jsonb_build_object('name','Water Treatment System','description','Iron filter, UV, reverse osmosis — NAFDAC/WHO','priceKobo',25000000),
      jsonb_build_object('name','Hydrogeological Survey','description','Geophysical survey to find optimal drilling point','priceKobo',15000000)
    )
  ),
  jsonb_build_object(
    'coren_registration',   true,
    'state_drilling_licence', true,
    'water_quality_cert',   true,
    'nesrea_compliance',    true,
    'professional_indemnity', true,
    'ndpr_compliant',       true
  ),
  jsonb_build_object(
    'whatsapp_cta',           true,
    'prices_in_ngn',          true,
    'paystack_payment',       true,
    'mobile_responsive_375',  true,
    'esc_all_user_strings',   true,
    'ndpr_consent_on_forms',  true,
    'coren_trust_signal',     true,
    'water_quality_test',     true
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
