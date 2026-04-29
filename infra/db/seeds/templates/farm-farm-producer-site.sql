-- Farm / Farm Producer Seed — Pillar 2 Template
-- Niche ID: P2-farm-farm-producer-site
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'farm-farm-producer-site', 'farm',
  'Farm / Farm Producer', 'Fresh farm produce direct to market — FMARD-aligned agri-business',
  'agricultural', 2, 'NF-AGR-SVC', 'standalone',
  ARRAY['home','produce','about','contact'],
  'high', true, true, true, 'NGN',
  ARRAY['FMARD Aligned','NAFDAC Compliant','ADP Member','CAC Registered','WhatsApp Orders','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
