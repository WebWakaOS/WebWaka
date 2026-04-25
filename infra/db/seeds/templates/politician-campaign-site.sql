-- Seed: politician-campaign-site template registry entry
-- Pillar 2 — P2-politician-campaign-site (VN-POL-001, NF-POL-IND anchor)
-- Nigeria-First: CRITICAL priority — INEC acknowledgement + party affiliation badges;
--   dual CTA "Get Involved" (volunteer) + "Contact the Office";
--   campaign agenda as offerings; null → "Free event"; INEC compliance note;
--   7 office types: Councillor to President
-- Milestone: M8b — P1-Original
--
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'politician-campaign-site',
  'Individual Politician Campaign Site',
  'A Nigeria-first website template for individual Nigerian politicians running for office (Councillor to President — 7 office types). INEC acknowledgement and party affiliation badge as primary trust/identity signals. Dual CTA: "Get Involved" (volunteer) and "Contact the Office". Policy areas / campaign promises as offerings; null priceKobo → "Free event — all welcome". Community-first register: "Together we will build a better [Constituency]". WhatsApp for grassroots volunteer coordination. All campaign activity referenced as INEC-compliant. NF-POL-IND anchor: .po- namespace, INEC+party badge pattern, and dual CTA inform ward-rep and polling-unit-rep variants.',
  'website', '1.0.0', '^1.0.0', 'politician', 'politician-campaign-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'politician-campaign-site';
