-- Nursery School / Crèche Site Seed — Pillar 3 Template
-- Niche ID: P3-nursery-school-nursery-school-site
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'nursery-school-nursery-school-site', 'nursery-school',
  'Nursery / Crèche / Early Childhood Centre', 'NERDC ECCDE-aligned nursery — crèche to pre-primary. Ages 3m–5yr.',
  'education', 3, 'NF-EDU-NRS', 'variant',
  ARRAY['home','classes','facilities','admission','contact'],
  'high', false, true, true, 'NGN',
  ARRAY['NERDC ECCDE Aligned','NASB Registered','State Education Board','CAC Registered','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
