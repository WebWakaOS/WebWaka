-- Restaurant Chain Seed — Pillar 2 Template
-- Niche ID: P2-restaurant-chain-restaurant-chain-outlet
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'restaurant-chain-restaurant-chain-outlet', 'restaurant-chain',
  'Restaurant Chain', 'NAFDAC-safe restaurant chain — consistent quality at every outlet',
  'hospitality', 2, 'NF-HSP-SVC', 'standalone',
  ARRAY['home','menu','locations','contact'],
  'high', true, true, true, 'NGN',
  ARRAY['NAFDAC Compliant','LHAID Certified','HACCP Compliant','CAC Registered','WhatsApp Order','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
