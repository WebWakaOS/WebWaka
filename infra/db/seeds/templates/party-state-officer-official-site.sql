-- Seed: party-state-officer-official-site template registry entry
-- Pillar 2 — P2-party-state-officer-official-site (VN-POL-020, NF-POL-PTY)
-- Nigeria-First: State party structure; State Chairman, Deputy Chairman, Secretary; two modes active|post_office.
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'party-state-officer-official-site',
  'Party State Officer Official Site',
  'Nigeria-first official site for state-level party officers (State Chairman, Deputy Chairman, Publicity Secretary). Party modes: active + post_office. Coordinates LGA/ward chapter network.',
  'website', '1.0.0', '^1.0.0', 'party-state-officer', 'party-state-officer-official-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'party-state-officer-official-site';
