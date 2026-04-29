-- Seed: party-chapter-officer-official-site template registry entry
-- Pillar 2 — P2-party-chapter-officer-official-site (VN-POL-019, NF-POL-PTY)
-- Nigeria-First: Ward/LGA chapter officers; intra-party congress selection; two modes active|post_office.
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'party-chapter-officer-official-site',
  'Party Chapter Officer Official Site',
  'Nigeria-first official site for ward/LGA party chapter officers (Chairman, Secretary, Youth Leader, Women Leader). Party modes: active + post_office. Grassroots party mobilisation framing.',
  'website', '1.0.0', '^1.0.0', 'party-chapter-officer', 'party-chapter-officer-official-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'party-chapter-officer-official-site';
