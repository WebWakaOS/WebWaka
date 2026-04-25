-- Seed: school-institution-site template registry entry
-- Pillar 2 — P2-school-institution-site (VN-EDU-001, NF-EDU-SCH anchor)
-- Nigeria-First: CRITICAL priority — admissions-first layout; fee schedule in NGN;
--   Ministry of Education approval + WAEC centre badges; "Apply for Admission" WhatsApp CTA;
--   null price → "Fee on enquiry"; PTA engagement; nursery to secondary context
-- Milestone: M8e — P1-Original
--
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'school-institution-site',
  'School / Educational Institution Site',
  'A Nigeria-first website template for private schools from nursery to secondary level. Admissions-first layout with WhatsApp CTA ("Apply for Admission"), fee schedule displayed per term in NGN, Ministry of Education approval and WAEC centre accreditation badges, and "Enrolling Now" acceptance signal. Offerings represent academic programmes with fees. null priceKobo → "Fee on enquiry". PTA engagement note in contact. NF-EDU-SCH anchor: .sc- namespace, admissions-first CTA pattern, and fee-schedule semantics inform variant templates (private-school, govt-school, nursery-school).',
  'website', '1.0.0', '^1.0.0', 'school', 'school-institution-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'school-institution-site';
