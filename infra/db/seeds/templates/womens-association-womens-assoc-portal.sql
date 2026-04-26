-- =============================================================================
-- Pillar 3 Template Seed: womens-association / womens-assoc-portal
-- Niche ID: P3-womens-association-womens-assoc-portal
-- Category: civic | Family: NF-CIV-GEN standalone | NF Priority: high
-- Research brief: docs/templates/research/womens-association-womens-assoc-portal-brief.md
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
  'womens-association-womens-assoc-portal',
  "Women's Association Portal",
  'civic',
  'womens-association',
  3,
  ARRAY['home','about','services','contact'],
  jsonb_build_object(
    'tagline',         'Empowering Women. Strengthening Nigeria.',
    'description',     'CAC-registered women''s association dedicated to economic empowerment, skills development, cooperative savings, and political participation of Nigerian women. NCWS affiliated. FMWA recognised.',
    'phone',           '+234 800 000 0004',
    'email',           'secretariat@womens-assoc.example.ng',
    'placeName',       'Lagos',
    'cacRegistration', 'IT/XXXXXXXX',
    'affiliation',     'NCWS Affiliated',
    'offerings',       jsonb_build_array(
      jsonb_build_object('name','Cooperative Savings (Ajo/Esusu)','description','Weekly/monthly rotating savings for members','priceKobo',null),
      jsonb_build_object('name','Microcredit Loans','description','₦50,000–₦500,000 group-guaranteed loans','priceKobo',null),
      jsonb_build_object('name','Skills Training','description','Tailoring, soap-making, ICT, financial literacy','priceKobo',500000),
      jsonb_build_object('name','Market Advocacy','description','Levy negotiation and market trader dispute support','priceKobo',null)
    )
  ),
  jsonb_build_object(
    'cac_registration',  true,
    'ncws_affiliation',  true,
    'fmwa_recognition',  true,
    'ndpr_compliant',    true,
    'annual_accounts',   true
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
