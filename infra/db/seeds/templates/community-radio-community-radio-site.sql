-- =============================================================================
-- Pillar 3 Template Seed: community-radio / community-radio-site
-- Niche ID: P3-community-radio-community-radio-site
-- Category: media | Family: standalone | NF Priority: high
-- Research brief: docs/templates/research/community-radio-community-radio-site-brief.md
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
  'community-radio-community-radio-site',
  'Community Radio Station Site',
  'media',
  'community-radio',
  3,
  ARRAY['home','about','services','contact'],
  jsonb_build_object(
    'tagline',       'Your Voice. Your Community. Your Radio.',
    'frequency',     '91.5 FM',
    'nbcLicenceNumber', 'NBC/LC/[XXXX]/[YYYY]',
    'description',   'NBC-licensed community radio serving our local area with news, entertainment, community announcements, and programming in English and local languages. 60% local content. Community-owned.',
    'phone',         '+234 800 000 0001',
    'email',         'hello@station.example.ng',
    'placeName',     'Ibadan',
    'offerings',     jsonb_build_array(
      jsonb_build_object('name','30-Second Spot (Peak)','description','6am–9am, 12pm–2pm, 5pm–8pm slots','priceKobo',800000),
      jsonb_build_object('name','Programme Sponsorship','description','Weekly programme open/close mention','priceKobo',5000000),
      jsonb_build_object('name','Monthly Campaign Package','description','30 peak spots + jingle production','priceKobo',18000000),
      jsonb_build_object('name','Outside Broadcast','description','Live broadcast at your event','priceKobo',15000000)
    )
  ),
  jsonb_build_object(
    'nbc_licence',     true,
    'local_content_60_pct', true,
    'watershed_policy', true,
    'cac_registration', true,
    'ndpr_compliant',  true
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
