-- Rollback 0454: Starter Templates Phase 5 (T04, T07, T08, T09)

DELETE FROM template_registry
  WHERE id IN (
    'tpl_t04_advocacy_v100',
    'tpl_t07_association_v100',
    'tpl_t08_personal_assist_v100',
    'tpl_t09_biz_community_v100'
  );
