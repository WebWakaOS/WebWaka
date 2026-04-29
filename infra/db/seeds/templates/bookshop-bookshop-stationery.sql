-- Bookshop & Stationery Seed — Pillar 2 Template
-- Niche ID: P2-bookshop-bookshop-stationery
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'bookshop-bookshop-stationery', 'bookshop',
  'Bookshop & Stationery', 'Your local bookshop — textbooks, novels, stationery & school supplies',
  'commerce', 2, 'NF-COM-SVC', 'standalone',
  ARRAY['home','catalogue','contact'],
  'medium', false, true, true, 'NGN',
  ARRAY['CAC Registered','NUC Recommended Texts','UBEC Approved','WhatsApp Orders','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
