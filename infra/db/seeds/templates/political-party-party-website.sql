-- Seed: political-party-party-website template registry entry
-- Pillar 2 — P2-political-party-party-website (VN-POL-002, NF-POL-ORG anchor)
-- Nigeria-First: CRITICAL priority — INEC party registration + CAC + PCC compliance badges;
--   "Join the Party" primary CTA; manifesto as offerings; null → "Open to all Nigerians";
--   membership drive; party chairman credentialing; APC/PDP/LP/NNPP context
-- Milestone: M8b — P1-Original
--
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'political-party-party-website',
  'Political Party Organisation Website',
  'A Nigeria-first website template for Nigerian political party organisations (APC, PDP, LP, NNPP, SDP context). INEC registration certificate, CAC party registration, and PCC (party compliance certificate) badges. "Join the Party" primary CTA drives membership; "Read Our Manifesto" secondary CTA. Party manifesto / policy planks as offerings; null priceKobo → "Open to all Nigerians". State of residence field in contact form for constituency assignment. INEC compliance note in footer. NF-POL-ORG anchor: .pp- namespace, INEC badge, and "Join the Party" membership pattern inform campaign-office, lga-office, and constituency-office variants.',
  'website', '1.0.0', '^1.0.0', 'political-party', 'political-party-party-website', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'political-party-party-website';
