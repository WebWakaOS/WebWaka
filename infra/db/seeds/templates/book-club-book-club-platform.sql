-- Book Club / Reading Circle Platform Seed — Pillar 3 Template
-- Niche ID: P3-book-club-book-club-platform
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'book-club-book-club-platform', 'book-club',
  'Book Club / Reading Circle', 'Nigerian reading community — African voices, monthly picks & events',
  'civic', 3, 'NF-CIV-LIT', 'standalone',
  ARRAY['home','current-read','events','genres','contact'],
  'medium', false, true, true, 'NGN',
  ARRAY['CAC Registered','NLA Affiliated','NDPR Compliant'],
  ARRAY['bank_transfer','paystack'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
