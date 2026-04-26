-- Furniture Maker / Workshop Seed — Pillar 2 Template
-- Niche ID: P2-furniture-maker-furniture-workshop
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'furniture-maker-furniture-workshop', 'furniture-maker',
  'Furniture Maker / Workshop', 'Custom handcrafted furniture — quality wood, Nigerian craftsmanship',
  'commerce', 2, 'NF-COM-SVC', 'standalone',
  ARRAY['home','products','custom','contact'],
  'medium', false, true, true, 'NGN',
  ARRAY['CAC Registered','SON Quality Standards','WhatsApp Quote','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
