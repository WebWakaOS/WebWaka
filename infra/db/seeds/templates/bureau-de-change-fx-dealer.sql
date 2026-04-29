-- Seed: Bureau de Change / FX Dealer Template
-- Niche ID: P44
-- Vertical: bureau-de-change
-- Research brief: docs/templates/research/bureau-de-change-fx-dealer-brief.md
-- Platform invariants: T4 (kobo integers for NGN; integer kobo-per-USD-cent for rates),
--   P13 (no customer BVN ref in template), P2 (Nigeria First)
-- Trust badge: CBN BDC licence number
-- CRITICAL: Do NOT display static FX rates — template enforces "WhatsApp for today's rate"
-- SLUG MISMATCH NOTE: vertical slug 'bdc' vs 'bureau-de-change' — await migration 0037

INSERT OR IGNORE INTO template_registry (
  id, slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, manifest_json, status, is_free, price_kobo, created_at, updated_at
) VALUES (
  lower(hex(randomblob(16))),
  'bureau-de-change-fx-dealer',
  'Bureau de Change / FX Dealer',
  'Nigerian CBN-licensed bureau de change website. Displays CBN BDC licence badge, currencies traded (USD, EUR, GBP, CNY), EFCC compliance notice, PTA/BTA service, student fee remittance, WhatsApp "get today''s rate" CTA. CRITICAL: No static FX rates displayed — rates change daily. Green professional theme.',
  'website',
  '1.0.0',
  '>=1.0.1',
  '["bureau-de-change","bdc"]',
  '{"name":"bureau-de-change-fx-dealer","version":"1.0.0","platform_compat":">=1.0.1","template_type":"website","compatible_verticals":["bureau-de-change","bdc"],"rollback_strategy":"soft_delete","nigeria_first":true,"no_static_rates":true,"features":["cbn_bdc_badge","currency_list","efcc_notice","pta_bta_service","student_remittance","whatsapp_rate_inquiry_cta"]}',
  'approved',
  1,
  0,
  unixepoch(),
  unixepoch()
);
