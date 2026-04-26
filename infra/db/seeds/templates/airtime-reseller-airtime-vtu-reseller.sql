-- =============================================================================
-- Pillar 3 Template Seed: airtime-reseller / airtime-vtu-reseller
-- Niche ID: P3-airtime-reseller-airtime-vtu-reseller
-- Category: fintech | Family: NF-FIN-TEL standalone | NF Priority: high
-- Research brief: docs/templates/research/airtime-reseller-airtime-vtu-reseller-brief.md
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
  'airtime-reseller-airtime-vtu-reseller',
  'Airtime & VTU Reseller',
  'fintech',
  'airtime-reseller',
  3,
  ARRAY['home','about','services','contact'],
  jsonb_build_object(
    'tagline',         'Fast. Reliable. Always On.',
    'description',     'Authorised VTU reseller for MTN, Airtel, Glo, and 9mobile. Airtime, data bundles, bill payment (DSTV, PHCN, GOtv), and waybill printing — all in under 2 minutes. CAC registered.',
    'phone',           '+234 800 000 0002',
    'email',           'orders@vtureseller.example.ng',
    'placeName',       'Lagos',
    'cacRegistration', 'RC-XXXXXXXX',
    'offerings',       jsonb_build_array(
      jsonb_build_object('name','MTN 1GB (30 days)','description','MTN data bundle','priceKobo',35000),
      jsonb_build_object('name','MTN 3GB (30 days)','description','MTN data bundle','priceKobo',100000),
      jsonb_build_object('name','Airtel 1.5GB (30 days)','description','Airtel data bundle','priceKobo',50000),
      jsonb_build_object('name','Glo 2GB (30 days)','description','Glo data bundle','priceKobo',50000),
      jsonb_build_object('name','DSTV Renewal','description','Bill payment service','priceKobo',null),
      jsonb_build_object('name','PHCN Electricity Token','description','Bill payment service','priceKobo',null)
    )
  ),
  jsonb_build_object(
    'cac_registration',  true,
    'firs_tin',          true,
    'ncc_reseller',      true,
    'cbn_oversight',     true,
    'ndpr_compliant',    true
  ),
  jsonb_build_object(
    'whatsapp_cta',           true,
    'prices_in_ngn',          true,
    'paystack_payment',       true,
    'mobile_responsive_375',  true,
    'esc_all_user_strings',   true,
    'ndpr_consent_on_forms',  true,
    'nigerian_networks',      true
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
