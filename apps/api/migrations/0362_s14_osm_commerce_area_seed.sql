-- 0362_s14_osm_commerce_area_seed.sql
-- S14 OSM Nigeria area-based query — commerce (n=1)
-- Source: OpenStreetMap Overpass API admin_level=4 area queries | Retrieved: 2026-04-22
-- States covered: jigawa
-- ODbL licensed — https://www.openstreetmap.org/copyright

INSERT OR IGNORE INTO seed_runs (id,source_id,run_label,run_state,started_at,completed_at,total_input_rows,total_inserted_rows,total_rejected_rows,notes) VALUES
  ('seed_run_s14_osm_commerce_ng_20260422','seed_source_osm_ng_commerce_area_20260422','S14 OSM Nigeria commerce area 2026-04-22','completed',unixepoch(),unixepoch(),1,1,0,'OSM area admin_level=4 query 2026-04-22 commerce');

INSERT OR IGNORE INTO seed_sources (id,source_label,source_type,owner_organisation,access_method,canonical_url,publication_date,retrieval_date,freshness_status,license_notes,row_count,notes) VALUES
  ('seed_source_osm_ng_commerce_area_20260422','OpenStreetMap Nigeria commerce','public_data','OpenStreetMap contributors','overpass_api','https://overpass-api.de/api/interpreter','2026-04-22','2026-04-22','snapshot','ODbL',1,'OSM admin_level=4 area query Nigeria commerce 2026-04-22');

INSERT OR IGNORE INTO seed_raw_artifacts (id,seed_run_id,source_id,artifact_type,file_path,content_hash,row_count,schema_json,extraction_script,status) VALUES
  ('seed_artifact_s14_osm_commerce_ng_20260422','seed_run_s14_osm_commerce_ng_20260422','seed_source_osm_ng_commerce_area_20260422','raw','infra/db/seed/sources/s14_osm_benue_commerce_ng_20260422.json','s14_area_multi_state',1,'{"columns":["osm_id","name","lat","lon","amenity","tags","state"]}','overpass area query + python filter','captured');

INSERT OR IGNORE INTO organizations (id,tenant_id,organization_type,legal_name,display_name,registration_number,status,verification_state,created_at,updated_at) VALUES
  ('org_s14_osm_9bed0d774dd092ca492aa5fc','tenant_platform_seed','enterprise','Mechanic Village, Dutse','Mechanic Village, Dutse',NULL,'active','seeded',unixepoch(),unixepoch());

INSERT OR IGNORE INTO profiles (id,tenant_id,workspace_id,subject_type,subject_id,vertical_slug,primary_place_id,display_name,claim_state,visibility,created_at,updated_at) VALUES
  ('prof_s14_osm_9bed0d774dd092ca492aa5fc','tenant_platform_seed','workspace_platform_seed_discovery','organization','org_s14_osm_9bed0d774dd092ca492aa5fc','auto_services','place_state_jigawa','Mechanic Village, Dutse','seeded','public',unixepoch(),unixepoch());

INSERT OR IGNORE INTO search_entries (id,entity_type,entity_id,profile_id,tenant_id,display_name,keywords,primary_place_id,ancestry_path,created_at,updated_at) VALUES
  ('srch_s14_osm_9bed0d774dd092ca492aa5fc','organization','org_s14_osm_9bed0d774dd092ca492aa5fc','prof_s14_osm_9bed0d774dd092ca492aa5fc','tenant_platform_seed','Mechanic Village, Dutse','Mechanic Village, Dutse auto_services jigawa','place_state_jigawa','["place_nigeria_001","place_state_jigawa"]',unixepoch(),unixepoch());

INSERT OR IGNORE INTO seed_identity_map (id,source_id,source_record_id,entity_type,entity_id,mapping_state,created_at) VALUES
  ('smap_s14_osm_9bed0d774dd092ca492aa5fc','seed_source_osm_ng_commerce_area_20260422','osm_node_6203768286','organization','org_s14_osm_9bed0d774dd092ca492aa5fc','stable',unixepoch());

INSERT OR IGNORE INTO seed_entity_sources (id,entity_id,entity_type,source_id,source_record_id,source_type,source_label,source_display_name,confidence_level,publication_date,retrieval_date,freshness_status,superseded_by_id,created_at) VALUES
  ('esrc_s14_osm_9bed0d774dd092ca492aa5fc','org_s14_osm_9bed0d774dd092ca492aa5fc','organization','seed_source_osm_ng_commerce_area_20260422','osm_node_6203768286','public_data','OpenStreetMap Nigeria area','Mechanic Village, Dutse','public_high_confidence','2026-04-22','2026-04-22','snapshot',NULL,unixepoch());
