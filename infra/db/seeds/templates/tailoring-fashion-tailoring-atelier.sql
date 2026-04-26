-- Building Materials Supplier Seed — Pillar 3 Template
-- Niche ID: P3-tailoring-fashion-tailoring-atelier
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
  'tailoring-fashion-tailoring-atelier',
  'tailoring-fashion',
  'Tailor / Fashion Designer Atelier',
  'Custom Nigerian fashion — Ankara, Aso-Ebi, native wear & bridal',
  'commerce',
  3,
  'NF-COM-FSH',
  'standalone',
  ARRAY['home','about','services','contact'],
  'critical',
  false,
  true,
  true,
  'NGN',
  ARRAY['CAC Registered', 'WhatsApp CTA', 'NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active',
  '1.0.0',
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  template_status = EXCLUDED.template_status,
  version = EXCLUDED.version,
  updated_at = NOW();
