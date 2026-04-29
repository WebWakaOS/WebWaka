-- Agro-Input Dealer Seed — Pillar 2 Template
-- Niche ID: P2-agro-input-agro-input-dealer
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'agro-input-agro-input-dealer', 'agro-input',
  'Agro-Input Dealer', 'NAFDAC-licensed seeds, pesticides & fertiliser — trusted agro-dealer',
  'agricultural', 2, 'NF-AGR-SVC', 'standalone',
  ARRAY['home','products','services','contact'],
  'high', true, true, true, 'NGN',
  ARRAY['NAFDAC Licensed','FMARD Compliant','PCR Certified','CAC Registered','WhatsApp Orders','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
