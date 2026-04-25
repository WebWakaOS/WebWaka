-- Seed: pharmacy-drug-store template registry entry
-- Pillar 2 — P2-pharmacy-drug-store (VN-HLT-002, NF-PHA anchor)
-- Nigeria-First: CRITICAL priority — PCN registration + NAFDAC compliance + licensed pharmacist badges;
--   "Order on WhatsApp" CTA; no individual drug listings (NAFDAC regulatory risk);
--   service/category cards instead; null → "Enquire for price"; home delivery available note
-- Milestone: M9 — P1-Original
--
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'pharmacy-drug-store',
  'Pharmacy / Drug Store Site',
  'A Nigeria-first website template for PCN-registered Nigerian pharmacies. PCN registration number (Pharmacists Council of Nigeria), NAFDAC compliance, and Licensed Pharmacist badges as trust signals. "Order on WhatsApp" primary CTA — pharmacy WhatsApp ordering is extremely common in Nigeria. No individual drug listings (NAFDAC regulatory risk). Services represent pharmacy categories: prescription dispensing, OTC medicines, cosmetics/personal care, diagnostic services, home delivery. null priceKobo → "Enquire for price". Drug enquiry form with "drug name or prescription details" placeholder. "Prescription required for Schedule 3 and above" regulatory note. NF-PHA anchor — .ph- namespace; pharmacy-chain variant inherits this pattern.',
  'website', '1.0.0', '^1.0.0', 'pharmacy', 'pharmacy-drug-store', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'pharmacy-drug-store';
