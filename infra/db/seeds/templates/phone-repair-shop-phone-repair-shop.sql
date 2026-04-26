-- Building Materials Supplier Seed — Pillar 3 Template
-- Niche ID: P3-phone-repair-shop-phone-repair-shop
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
  'phone-repair-shop-phone-repair-shop',
  'phone-repair-shop',
  'Phone Repair & Accessories Shop',
  'Fast. Reliable. Guaranteed phone repairs with 90-day warranty',
  'commerce',
  3,
  'NF-COM-DIG',
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
