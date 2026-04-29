-- =============================================================================
-- Pillar 3 Template Seed: printing-press / printing-press-studio
-- Niche ID: P3-printing-press-printing-press-studio
-- Category: media/commerce | Family: standalone | NF Priority: high
-- Research brief: docs/templates/research/printing-press-printing-press-studio-brief.md
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
  'printing-press-printing-press-studio',
  'Printing Press & Studio',
  'media',
  'printing-press',
  3,
  ARRAY['home','about','services','contact'],
  jsonb_build_object(
    'tagline',         'Print Right. Print Fast. Print Nigerian.',
    'description',     'Professional printing studio specialising in digital printing, large-format banners, offset printing, and same-day delivery. Serving churches, campaign organisations, universities, and businesses across Nigeria.',
    'phone',           '+234 800 000 0010',
    'email',           'orders@printingstudio.example.ng',
    'placeName',       'Lagos',
    'cacRegistration', 'RC-PPPPPPPP',
    'equipment',       'HP DesignJet · Heidelberg Offset · Ricoh Digital',
    'offerings',       jsonb_build_array(
      jsonb_build_object('name','Flyers A4 (100 copies)','description','Full-colour digital printing','priceKobo',800000),
      jsonb_build_object('name','Business Cards (250)','description','Full-colour, standard 3.5×2 in','priceKobo',1500000),
      jsonb_build_object('name','Banner 4×3ft','description','PVC flex banner with grommets','priceKobo',800000),
      jsonb_build_object('name','Banner 6×4ft','description','PVC flex banner with grommets','priceKobo',1500000),
      jsonb_build_object('name','Church Programme (500)','description','A5 2-page folded church bulletin','priceKobo',4000000),
      jsonb_build_object('name','Event Backdrop 8×6ft','description','Backlit or vinyl backdrop','priceKobo',2500000),
      jsonb_build_object('name','Calendar (Desk, 100)','description','12-page desk calendar with custom branding','priceKobo',4500000),
      jsonb_build_object('name','Roll-Up Standee (85cm)','description','Double-sided pull-up banner with bag','priceKobo',2800000)
    )
  ),
  jsonb_build_object(
    'cac_registration',  true,
    'apcon_compliant',   true,
    'inec_electoral_act_2022', true,
    'copyright_compliant', true,
    'ndpr_compliant',    true
  ),
  jsonb_build_object(
    'whatsapp_cta',           true,
    'prices_in_ngn',          true,
    'paystack_payment',       true,
    'mobile_responsive_375',  true,
    'esc_all_user_strings',   true,
    'ndpr_consent_on_forms',  true,
    'artwork_data_confidential', true
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
