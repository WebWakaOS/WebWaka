-- Artisanal Mining Operator Site Seed — Pillar 3 Template
-- Niche ID: P3-artisanal-mining-artisanal-mining-ops
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'artisanal-mining-artisanal-mining-ops', 'artisanal-mining',
  'Artisanal Mining Operator', 'MCO-licensed gold, tin & gemstone mining — Zamfara, Plateau, Ekiti',
  'commerce', 3, 'NF-COM-MIN', 'standalone',
  ARRAY['home','minerals','licence','contact'],
  'high', false, true, true, 'NGN',
  ARRAY['MCO Licensed','MMSD Registered','NEITI Compliant','CAC Incorporated','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','wire_transfer'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
