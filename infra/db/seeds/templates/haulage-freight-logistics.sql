-- Seed: haulage-freight-logistics template registry entry
-- Pillar 2 — P2-haulage-freight-logistics (VN-TRP-004, NF-TRP-FRT anchor)
-- Nigeria-First: HIGH priority — FRSC fleet certification + goods-in-transit insurance + CAC;
--   "Request a Quote" WhatsApp CTA; cargo types/routes as services;
--   null → "Request a quote"; SON weight compliance; warehouse receipt on request;
--   B2B formal register; nationwide delivery note
-- Milestone: M8c — P1-Original
--
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'haulage-freight-logistics',
  'Haulage / Freight & Logistics Company Site',
  'A Nigeria-first website template for Nigerian haulage and freight logistics companies. FRSC fleet certification, goods-in-transit insurance, and CAC registration badges as primary B2B trust signals. "Request a Quote" WhatsApp CTA with cargo-details form pre-fill (origin, destination, cargo type, weight, date). Cargo types and routes as services; null priceKobo → "Request a quote" (all pricing is route/cargo-specific). SON weight compliance referenced. Warehouse receipt available on request. Nationwide door-to-door delivery note. B2B formal register: "On-time. Secure. Nationwide." NF-TRP-FRT anchor — .ha- CSS namespace. Cargo form collects origin city, destination, cargo description, and tonnage.',
  'website', '1.0.0', '^1.0.0', 'haulage', 'haulage-freight-logistics', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'haulage-freight-logistics';
