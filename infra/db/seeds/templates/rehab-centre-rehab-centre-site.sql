-- Rehabilitation / Recovery Centre Site Seed — Pillar 3 Template
-- Niche ID: P3-rehab-centre-rehab-centre-site
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug,
  vertical_slug,
  display_name,
  tagline,
  category,
  pillar,
  niche_family,
  family_role,
  pages,
  nigeria_first_priority,
  nafdac_required,
  cac_required,
  whatsapp_cta,
  currency,
  trust_signals,
  payment_methods,
  template_status,
  version,
  created_at
) VALUES (
  'rehab-centre-rehab-centre-site',
  'rehab-centre',
  'Rehabilitation / Recovery Centre Site',
  'Confidential, compassionate recovery support in Nigeria',
  'health',
  3,
  'NF-HLT-RHB',
  'standalone',
  ARRAY['home','about','services','contact'],
  'high',
  true,
  true,
  true,
  'NGN',
  ARRAY['NDLEA Licensed', 'FMOH Approved', 'MDCN Supervised', 'CAC Registered', 'NDPR Compliant', 'Confidential'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active',
  '1.0.0',
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  template_status = EXCLUDED.template_status,
  version = EXCLUDED.version,
  updated_at = NOW();
