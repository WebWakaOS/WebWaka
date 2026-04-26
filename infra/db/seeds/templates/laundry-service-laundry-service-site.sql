-- Laundry Service Site Seed — Pillar 3 Template
-- Niche ID: P3-laundry-service-laundry-service-site
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'laundry-service-laundry-service-site', 'laundry-service',
  'Laundromat / Laundry Service', 'Professional laundry & dry-cleaning — pickup & delivery in Lagos',
  'commerce', 3, 'NF-COM-SVC', 'standalone',
  ARRAY['home','pricing','how-it-works','contact'],
  'medium', true, true, true, 'NGN',
  ARRAY['CAC Registered','NAFDAC Products','LASEPA Approved','WhatsApp Pickup','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
