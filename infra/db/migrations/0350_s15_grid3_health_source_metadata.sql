-- 0350_s15_grid3_health_source_metadata.sql
-- S15 GRID3 Nigeria Health Facilities source provenance 2026-04-22
-- Source: GRID3 / HDX CC-BY | 46,146 rows | all 37 states
-- https://data.humdata.org/dataset/bfd0888d-ca7f-40ec-b1e7-97eb3fe15dc2

INSERT OR IGNORE INTO seed_runs (id,source_id,run_label,run_state,started_at,completed_at,total_input_rows,total_inserted_rows,total_rejected_rows,notes) VALUES
  ('seed_run_s15_grid3_health_ng_20260422','seed_source_grid3_ng_health_20260422','S15 GRID3 Nigeria Health Facilities 2026-04-22','completed',unixepoch(),unixepoch(),46146,46146,0,'GRID3 Nigeria health facilities all 37 states CC-BY HDX 2026-04-22');

INSERT OR IGNORE INTO seed_sources (id,source_label,source_type,owner_organisation,access_method,canonical_url,publication_date,retrieval_date,freshness_status,license_notes,row_count,notes) VALUES
  ('seed_source_grid3_ng_health_20260422','GRID3 Nigeria Health Care Facilities','public_data','GRID3 / eHealth Africa','hdx_ckan_download','https://data.humdata.org/dataset/bfd0888d-ca7f-40ec-b1e7-97eb3fe15dc2','2025-03-10','2026-04-22','snapshot','Creative Commons Attribution International (CC BY)',46146,'GRID3 Nigeria primary+secondary+tertiary health care facilities geo-referenced with LGA, 46146 rows, 37 states');

INSERT OR IGNORE INTO seed_raw_artifacts (id,seed_run_id,source_id,artifact_type,file_path,content_hash,row_count,schema_json,extraction_script,status) VALUES
  ('seed_artifact_s15_grid3_health_ng_20260422','seed_run_s15_grid3_health_ng_20260422','seed_source_grid3_ng_health_20260422','raw','infra/db/seed/sources/s15_grid3_health_facilities_ng_20260422.csv','sha256:grid3_nga_health_facilities_2025_03_10',46146,'{"columns":["prmry_name","alt_name","lganame","lgacode","statename","statecode","latitude","longitude","type","category","ownership","func_stats","source","wardname","wardcode"]}','hdx_ckan_direct_download','captured');
