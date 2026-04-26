-- =============================================================================
-- Pillar 3 Template Seed: ministry-mission / ministry-mission-platform
-- Niche ID: P3-ministry-mission-ministry-mission-platform
-- Category: civic/religious | Family: NF-CIV-REL variant | NF Priority: high
-- Research brief: docs/templates/research/ministry-mission-ministry-mission-platform-brief.md
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
  'ministry-mission-ministry-mission-platform',
  'Ministry & Mission Platform',
  'civic',
  'ministry-mission',
  3,
  ARRAY['home','about','services','contact'],
  jsonb_build_object(
    'tagline',         'Bringing the Gospel to Every Nation. Light for Nigeria, Light for the World.',
    'verse',           '"Go into all the world and preach the gospel." — Mark 16:15',
    'description',     'CAC-registered apostolic ministry dedicated to evangelism, outreach, discipleship, media ministry, and community transformation across Nigeria and beyond. CAN affiliated.',
    'phone',           '+234 800 000 0006',
    'email',           'connect@ministry.example.ng',
    'placeName',       'Lagos',
    'cacRegistration', 'IT/MMMMMMMM',
    'affiliation',     'CAN Affiliated',
    'founderName',     'General Overseer',
    'offerings',       jsonb_build_array(
      jsonb_build_object('name','Crusades & Revivals','description','Large-scale outdoor evangelism crusades across states','priceKobo',null),
      jsonb_build_object('name','Healthcare Mission','description','Free medical outreach — blood pressure, malaria, referrals','priceKobo',null),
      jsonb_build_object('name','Media Ministry','description','TV and radio broadcast of sermons and teaching','priceKobo',null),
      jsonb_build_object('name','Discipleship School','description','6-month school of ministry with certificates','priceKobo',null)
    )
  ),
  jsonb_build_object(
    'cac_part_f_trustees', true,
    'can_affiliation',     true,
    'pfn_jni',             true,
    'scuml_international', true,
    'ndpr_compliant',      true,
    'financial_transparency', true
  ),
  jsonb_build_object(
    'whatsapp_cta',           true,
    'prices_in_ngn',          true,
    'paystack_payment',       true,
    'mobile_responsive_375',  true,
    'esc_all_user_strings',   true,
    'ndpr_consent_on_forms',  true,
    'counselling_data_confidential', true
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
