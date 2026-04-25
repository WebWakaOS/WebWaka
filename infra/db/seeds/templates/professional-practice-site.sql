-- Seed: professional-practice-site template registry entry
-- Pillar 2 — P2-professional-practice-site (VN-PRO-001, NF-PRO-LIC anchor)
-- Nigeria-First: credentials-first trust layout, WhatsApp-primary consultation booking,
--   formal register, professional body vocabulary (NBA/NMA/ICAN/NIA/COREN/SURCON)
-- Milestone: M8e — P1-Original
--
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug,
  display_name,
  description,
  template_type,
  version,
  platform_compat,
  compatible_verticals,
  render_entrypoint,
  status,
  author_name,
  pricing_model,
  price_kobo,
  created_at,
  updated_at
) VALUES (
  'professional-practice-site',
  'Licensed Professional — Practice Site',
  'A Nigeria-first website template for licensed professionals: lawyers (NBA), doctors (NMA/MDCN), accountants (ICAN/ANAN), architects (NIA), engineers (COREN), and surveyors (SURCON/ESVARBON). Features credentials-first trust layout with professional body badge in the hero, WhatsApp-primary consultation booking (standard in Nigerian professional sector), formal register throughout, NGN-priced practice areas with "Fee on enquiry" fallback, and a confidentiality-respecting enquiry form. NF-PRO-LIC family anchor — foundation for land-surveyor and professional-association templates. Africa-First: credential display maps to all Commonwealth African bar and medical associations.',
  'website',
  '1.0.0',
  '^1.0.0',
  'professional',
  'professional-practice-site',
  'approved',
  'WebWaka Platform',
  'free',
  0,
  datetime('now'),
  datetime('now')
);

-- Verify
SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry
WHERE slug = 'professional-practice-site';
