-- Plumbing Supplies Dealer Site Seed — Pillar 3 Template
-- Niche ID: P3-plumbing-supplies-plumbing-supplies-dealer
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
  'plumbing-supplies-plumbing-supplies-dealer',
  'plumbing-supplies',
  'Plumbing Supplies Dealer Site',
  'Quality pipes, fittings & fixtures — SON compliant, contractor pricing',
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
  ARRAY['SON Compliant Products', 'CAC Registered', 'Contractor Pricing', 'Bulk Delivery', 'WhatsApp Quote'],
  ARRAY['bank_transfer','paystack','pos','cash'],
  'active',
  '1.0.0',
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  template_status = EXCLUDED.template_status,
  version = EXCLUDED.version,
  updated_at = NOW();
