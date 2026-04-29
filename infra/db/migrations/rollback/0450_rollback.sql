-- Rollback 0450: Remove the 5 starter template seed records
-- Safe to run even if some or all templates have been installed (does not cascade to installations).

DELETE FROM template_registry WHERE id IN (
  'tpl_t01_electoral_v100',
  'tpl_t02_civic_v100',
  'tpl_t03_mutual_aid_v100',
  'tpl_t05_constituency_v100',
  'tpl_t06_faith_v100'
);
