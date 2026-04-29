-- Seed: clinic-primary-care template registry entry
-- Pillar 2 — P2-clinic-primary-care (VN-HLT-001, standalone — P1 health anchor)
-- Nigeria-First: CRITICAL priority — trust-first layout with MDCN/HMO/NHIS badge strip;
--   WhatsApp-primary appointment booking; formal-warm register; offerings = medical services;
--   null price → "Fee on enquiry"; walk-ins welcome; common Nigerian conditions in copy
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
  'clinic-primary-care',
  'Primary Care Clinic / Healthcare Site',
  'A Nigeria-first website template for primary care clinics, GP practices, polyclinics, and maternity clinics. Features a trust-first design with MDCN-licensed / HMO-Accepted / NHIS-Accredited badge strip displayed prominently in the hero, WhatsApp-primary appointment booking (standard in Nigerian private clinic sector), and a warm-professional register ("Your health is our priority"). Offerings represent medical services/departments with consultation fees in NGN or "Fee on enquiry" fallback. "Walk-ins welcome" secondary channel displayed alongside appointment booking. Common Nigerian conditions referenced: malaria, hypertension, antenatal care, typhoid, diabetes. Standalone — P1 health anchor; .cl- namespace and trust-badge pattern inform NF-HLT-SPE (dental, optician, vet) and NF-PHA (pharmacy) templates. Africa-First: malaria/typhoid/hypertension patterns common across West Africa; HMO model parallels NHIF (Kenya) and NHIA (Ghana).',
  'website',
  '1.0.0',
  '^1.0.0',
  'clinic',
  'clinic-primary-care',
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
WHERE slug = 'clinic-primary-care';
