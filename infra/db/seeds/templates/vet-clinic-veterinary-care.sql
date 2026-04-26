-- Seed: Veterinary Clinic / Pet Care Template
-- Niche ID: P41
-- Vertical: vet-clinic
-- Research brief: docs/templates/research/vet-clinic-veterinary-brief.md
-- Platform invariants: T4 (kobo), P13 (animal_ref_id + owner_ref_id opaque), P2 (Nigeria First)
-- Trust badge: VCNB registration
-- SLUG MISMATCH NOTE: vertical slug 'vet' may conflict with 'vet-clinic' — await migration 0037

INSERT OR IGNORE INTO template_registry (
  id, slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, manifest_json, status, is_free, price_kobo, created_at, updated_at
) VALUES (
  lower(hex(randomblob(16))),
  'vet-clinic-veterinary-care',
  'Veterinary Clinic',
  'Nigerian VCNB-registered veterinary clinic website. Displays VCNB registration badge, clinic type (companion/livestock/both), animal species served, services with prices in NGN (consultation, vaccination, surgery, grooming, hospitalization), emergency WhatsApp CTA. Green nature theme.',
  'website',
  '1.0.0',
  '>=1.0.1',
  '["vet-clinic","vet"]',
  '{"name":"vet-clinic-veterinary-care","version":"1.0.0","platform_compat":">=1.0.1","template_type":"website","compatible_verticals":["vet-clinic","vet"],"rollback_strategy":"soft_delete","nigeria_first":true,"features":["vcnb_badge","clinic_type","animal_species","service_menu_kobo","emergency_cta","hospitalization_flag","whatsapp_booking"]}',
  'approved',
  1,
  0,
  unixepoch(),
  unixepoch()
);
