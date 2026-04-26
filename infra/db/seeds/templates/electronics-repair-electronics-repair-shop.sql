-- Electronics Repair Shop Seed — Pillar 2 Template
-- Niche ID: P2-electronics-repair-electronics-repair-shop
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'electronics-repair-electronics-repair-shop', 'electronics-repair',
  'Electronics Repair Shop', 'Expert electronics repair — phones, TVs, appliances — certified technicians',
  'commerce', 2, 'NF-COM-SVC', 'standalone',
  ARRAY['home','services','pricing','contact'],
  'high', false, true, true, 'NGN',
  ARRAY['CAC Registered','SON Certified','NCC Consumer Protected','WhatsApp Booking','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
