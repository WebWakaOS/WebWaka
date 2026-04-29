-- Iron & Steel Merchant Site Seed — Pillar 3 Template
-- Niche ID: P3-iron-steel-iron-steel-merchant
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
  'iron-steel-iron-steel-merchant',
  'iron-steel',
  'Iron & Steel / Roofing Merchant Site',
  'Quality iron rods, roofing sheets & steel — SON certified, bulk supply',
  'commerce',
  3,
  'NF-COM-CON',
  'variant',
  ARRAY['home','about','services','contact'],
  'high',
  false,
  true,
  true,
  'NGN',
  ARRAY['SON Certified Stock', 'CAC Registered', 'Bulk Delivery', 'Contractor Pricing', 'VAT Receipts'],
  ARRAY['bank_transfer','paystack','pos','cash'],
  'active',
  '1.0.0',
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  template_status = EXCLUDED.template_status,
  version = EXCLUDED.version,
  updated_at = NOW();
