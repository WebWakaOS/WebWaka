-- Seed: ngo-nonprofit-portal template registry entry
-- Pillar 2 — P2-ngo-nonprofit-portal (VN-CIV-002, NF-CIV-WEL anchor)
-- Nigeria-First: HIGH priority — IT-Incorporated Trustees badge; dual CTA (Donate + Volunteer);
--   programmes as offerings with null → "Free to beneficiaries";
--   USAID/UN/state govt partnership logos; annual audit as trust signal; WhatsApp for volunteer coordination
-- Milestone: M8d — P1-Original
--
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'ngo-nonprofit-portal',
  'NGO / Non-Profit Donor & Volunteer Portal',
  'A Nigeria-first website template for Nigerian NGOs and non-profits. IT-Incorporated Trustees registration badge and CAC verification as primary trust signals. Donor-trust-first design with dual CTA: "Donate" and "Volunteer". Programmes/projects as offerings; null priceKobo → "Free to beneficiaries". Annual audit certificate and partnership logos (UN, USAID, DFID) as trust signals. WhatsApp for grassroots volunteer coordination. No floating WhatsApp button (formal context). NF-CIV-WEL anchor: .ng- namespace, IT-badge pattern, dual CTA, and "Free to beneficiaries" semantics inform orphanage variant.',
  'website', '1.0.0', '^1.0.0', 'ngo', 'ngo-nonprofit-portal', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'ngo-nonprofit-portal';
