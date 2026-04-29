-- Seed: Crèche / Day Care Centre Template
-- Niche ID: P42
-- Vertical: creche
-- Research brief: docs/templates/research/creche-early-childhood-brief.md
-- Platform invariants: T4 (kobo), P13 (child_ref_id MOST SENSITIVE — L3 HITL mandatory),
--   P2 (Nigeria First)
-- Trust badge: SUBEB registration
-- PRIVACY NOTE: child_ref_id never reaches AI layer; L3 HITL enforced at route level

INSERT OR IGNORE INTO template_registry (
  id, slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, manifest_json, status, is_free, price_kobo, created_at, updated_at
) VALUES (
  lower(hex(randomblob(16))),
  'creche-early-childhood',
  'Crèche / Day Care Centre',
  'Nigerian SUBEB-registered crèche and early childhood centre website. Displays SUBEB registration badge, programme types (creche 0–18m, toddler 18m–3yr, nursery 3–5yr), monthly fees in NGN, teacher-child ratio badge, CCTV security badge, meals-included flag, WhatsApp nursery visit booking. Purple warm theme.',
  'website',
  '1.0.0',
  '>=1.0.1',
  '["creche"]',
  '{"name":"creche-early-childhood","version":"1.0.0","platform_compat":">=1.0.1","template_type":"website","compatible_verticals":["creche"],"rollback_strategy":"soft_delete","nigeria_first":true,"ai_tier":"L3_HITL_mandatory","features":["subeb_badge","programme_types","monthly_fees_kobo","teacher_child_ratio","cctv_badge","meals_flag","safeguarding_notice","whatsapp_visit_cta"]}',
  'approved',
  1,
  0,
  unixepoch(),
  unixepoch()
);
