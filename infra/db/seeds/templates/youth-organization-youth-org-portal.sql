-- =============================================================================
-- Pillar 3 Template Seed: youth-organization / youth-org-portal
-- Niche ID: P3-youth-organization-youth-org-portal
-- Category: civic | Family: standalone | NF Priority: high
-- Research brief: docs/templates/research/youth-organization-youth-org-portal-brief.md
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
  'youth-organization-youth-org-portal',
  'Youth Organisation Portal',
  'civic',
  'youth-organization',
  3,
  ARRAY['home','about','services','contact'],
  jsonb_build_object(
    'tagline',         'Youth Power. Nigeria''s Future. Not Later. Now.',
    'description',     'CAC-registered youth organisation driving civic participation, digital skills development, community service, and leadership development for young Nigerians.',
    'phone',           '+234 800 000 0005',
    'email',           'secretariat@youthorg.example.ng',
    'placeName',       'Abuja',
    'cacRegistration', 'IT/YYYYYYYY',
    'affiliation',     'FMYSD Recognised',
    'offerings',       jsonb_build_array(
      jsonb_build_object('name','Community Development Projects','description','Clean-up, tree planting, road repair','priceKobo',null),
      jsonb_build_object('name','Digital Skills Training','description','Free coding, design, e-commerce workshops','priceKobo',null),
      jsonb_build_object('name','Civic Engagement','description','Voter education, INEC drives, anti-corruption','priceKobo',null),
      jsonb_build_object('name','Scholarship Programme','description','Academic scholarships and university support','priceKobo',null)
    )
  ),
  jsonb_build_object(
    'cac_registration',  true,
    'fmysd_recognition', true,
    'nysc_affiliation',  true,
    'ndpr_compliant',    true,
    'annual_report',     true
  ),
  jsonb_build_object(
    'whatsapp_cta',           true,
    'prices_in_ngn',          true,
    'paystack_payment',       true,
    'mobile_responsive_375',  true,
    'esc_all_user_strings',   true,
    'ndpr_consent_on_forms',  true
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
