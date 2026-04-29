-- Seed: Tax Consultant / Financial Services Template
-- Niche ID: P33
-- Vertical: tax-consultant
-- Research brief: docs/templates/research/tax-consultant-financial-services-brief.md
-- Platform invariants: T4 (kobo), P13 (no client TIN or tax liability data), P2 (Nigeria First)
-- Trust badges: FIRS Tax Agent Certificate + ICAN fellowship number
-- Note: No automated tax advice — website is discovery/lead-gen only

INSERT OR IGNORE INTO template_registry (
  id, slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, manifest_json, status, is_free, price_kobo, created_at, updated_at
) VALUES (
  lower(hex(randomblob(16))),
  'tax-consultant-financial-services',
  'Tax Consultant / Financial Services',
  'Nigerian tax consulting firm website. Displays FIRS tax agent certificate badge, ICAN membership badge, services (CIT, VAT, PAYE, WHT, audit defence), years of practice, TaxPro Max certification, WhatsApp consultation booking. Professional blue theme. Lead-gen only — no tax advice rendered.',
  'website',
  '1.0.0',
  '>=1.0.1',
  '["tax-consultant"]',
  '{"name":"tax-consultant-financial-services","version":"1.0.0","platform_compat":">=1.0.1","template_type":"website","compatible_verticals":["tax-consultant"],"rollback_strategy":"soft_delete","nigeria_first":true,"features":["firs_cert_badge","ican_badge","tax_services_list","taxpro_max_badge","years_of_practice","whatsapp_consultation_cta","disclaimer_footer"]}',
  'approved',
  1,
  0,
  unixepoch(),
  unixepoch()
);
