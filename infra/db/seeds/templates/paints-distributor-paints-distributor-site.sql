-- Paints & Coatings Distributor Site Seed — Pillar 3 Template
-- Niche ID: P3-paints-distributor-paints-distributor-site
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
  'paints-distributor-paints-distributor-site',
  'paints-distributor',
  'Paints & Coatings Distributor Site',
  'Authorised distributor — Dulux, Berger, Crown, Jotun. Contractor pricing.',
  'commerce',
  3,
  'NF-COM-CON',
  'variant',
  ARRAY['home','about','services','contact'],
  'medium',
  false,
  true,
  true,
  'NGN',
  ARRAY['Authorised Distributor', 'SON Compliant', 'CAC Registered', 'Colour Matching', 'Contractor Pricing'],
  ARRAY['bank_transfer','paystack','pos','cash'],
  'active',
  '1.0.0',
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  template_status = EXCLUDED.template_status,
  version = EXCLUDED.version,
  updated_at = NOW();
