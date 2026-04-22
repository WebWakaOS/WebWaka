-- 0368_s11_supply_chain_osm.sql
-- OSM Nigeria-wide query: building=warehouse, industrial=cold_storage/warehouse, shop=agrarian. SW+SE quads. (n=5)
-- Source: OpenStreetMap Overpass API, Nigeria-wide 4-quadrant query | Retrieved: 2026-04-22
-- ODbL licensed — https://www.openstreetmap.org/copyright

INSERT OR IGNORE INTO seed_runs (id,source_id,run_label,run_state,started_at,completed_at,total_input_rows,total_inserted_rows,total_rejected_rows,notes) VALUES
  ('seed_run_s11_osm_supply_chain_ng_20260422','seed_source_osm_ng_s11_supply_chain_20260422','S11 OSM Nigeria supply_chain 2026-04-22','completed',unixepoch(),unixepoch(),5,5,0,'OSM Nigeria supply_chain SW+SE quads; NW+NE rate-limited 2026-04-22');

INSERT OR IGNORE INTO seed_sources (id,source_label,source_type,owner_organisation,access_method,canonical_url,publication_date,retrieval_date,freshness_status,license_notes,row_count,notes) VALUES
  ('seed_source_osm_ng_s11_supply_chain_20260422','OpenStreetMap Nigeria Supply Chain / Agro-Input','public_data','OpenStreetMap contributors','overpass_api','https://overpass-api.de/api/interpreter','2026-04-22','2026-04-22','snapshot','ODbL',5,'OSM Nigeria-wide query: building=warehouse, industrial=cold_storage/warehouse, shop=agrarian. SW+SE quads.');

INSERT OR IGNORE INTO seed_raw_artifacts (id,seed_run_id,source_id,artifact_type,file_path,content_hash,row_count,schema_json,extraction_script,status) VALUES
  ('seed_artifact_s11_osm_supply_chain_ng_20260422','seed_run_s11_osm_supply_chain_ng_20260422','seed_source_osm_ng_s11_supply_chain_20260422','raw','infra/db/seed/sources/s11_osm_supply_chain_*_ng_20260422.json','s11_supply_chain_multi_quad',5,'{"columns":["osm_id","name","lat","lon","man_made","tags"]}','overpass quad query + python filter','captured');

INSERT OR IGNORE INTO organizations (id,tenant_id,organization_type,legal_name,display_name,registration_number,status,verification_state,created_at,updated_at) VALUES
  ('org_s11_supply_osm_3e86bdec46c78ab7a005434b','tenant_platform_seed','enterprise','SOSUCAM','SOSUCAM',NULL,'active','seeded',unixepoch(),unixepoch()),
  ('org_s11_supply_osm_9493db4d5ef3fc64d66409fd','tenant_platform_seed','enterprise','Entrepôt Brasseries','Entrepôt Brasseries',NULL,'active','seeded',unixepoch(),unixepoch()),
  ('org_s11_supply_osm_f73b24e8c424463a6125ecc3','tenant_platform_seed','enterprise','Telcar Buying Station','Telcar Buying Station',NULL,'active','seeded',unixepoch(),unixepoch()),
  ('org_s11_supply_osm_ab36033ea1461eac6c7ab4a3','tenant_platform_seed','enterprise','PROVENDERIE','PROVENDERIE',NULL,'active','seeded',unixepoch(),unixepoch()),
  ('org_s11_supply_osm_64cbb6917d21e9b1181f3fcb','tenant_platform_seed','enterprise','Exploitation horticole','Exploitation horticole',NULL,'active','seeded',unixepoch(),unixepoch());

INSERT OR IGNORE INTO profiles (id,tenant_id,workspace_id,subject_type,subject_id,vertical_slug,primary_place_id,display_name,claim_state,visibility,created_at,updated_at) VALUES
  ('prof_s11_supply_osm_3e86bdec46c78ab7a005434b','tenant_platform_seed','workspace_platform_seed_discovery','organization','org_s11_supply_osm_3e86bdec46c78ab7a005434b','supply_chain','place_nigeria_001','SOSUCAM','seeded','public',unixepoch(),unixepoch()),
  ('prof_s11_supply_osm_9493db4d5ef3fc64d66409fd','tenant_platform_seed','workspace_platform_seed_discovery','organization','org_s11_supply_osm_9493db4d5ef3fc64d66409fd','supply_chain','place_nigeria_001','Entrepôt Brasseries','seeded','public',unixepoch(),unixepoch()),
  ('prof_s11_supply_osm_f73b24e8c424463a6125ecc3','tenant_platform_seed','workspace_platform_seed_discovery','organization','org_s11_supply_osm_f73b24e8c424463a6125ecc3','supply_chain','place_state_cross_river','Telcar Buying Station','seeded','public',unixepoch(),unixepoch()),
  ('prof_s11_supply_osm_ab36033ea1461eac6c7ab4a3','tenant_platform_seed','workspace_platform_seed_discovery','organization','org_s11_supply_osm_ab36033ea1461eac6c7ab4a3','supply_chain','place_nigeria_001','PROVENDERIE','seeded','public',unixepoch(),unixepoch()),
  ('prof_s11_supply_osm_64cbb6917d21e9b1181f3fcb','tenant_platform_seed','workspace_platform_seed_discovery','organization','org_s11_supply_osm_64cbb6917d21e9b1181f3fcb','supply_chain','place_nigeria_001','Exploitation horticole','seeded','public',unixepoch(),unixepoch());

INSERT OR IGNORE INTO search_entries (id,entity_type,entity_id,profile_id,tenant_id,display_name,keywords,primary_place_id,ancestry_path,created_at,updated_at) VALUES
  ('srch_s11_supply_osm_3e86bdec46c78ab7a005434b','organization','org_s11_supply_osm_3e86bdec46c78ab7a005434b','prof_s11_supply_osm_3e86bdec46c78ab7a005434b','tenant_platform_seed','SOSUCAM','SOSUCAM warehouse agro input supply chain nigeria','place_nigeria_001','["place_nigeria_001"]',unixepoch(),unixepoch()),
  ('srch_s11_supply_osm_9493db4d5ef3fc64d66409fd','organization','org_s11_supply_osm_9493db4d5ef3fc64d66409fd','prof_s11_supply_osm_9493db4d5ef3fc64d66409fd','tenant_platform_seed','Entrepôt Brasseries','Entrepôt Brasseries warehouse agro input supply chain nigeria','place_nigeria_001','["place_nigeria_001"]',unixepoch(),unixepoch()),
  ('srch_s11_supply_osm_f73b24e8c424463a6125ecc3','organization','org_s11_supply_osm_f73b24e8c424463a6125ecc3','prof_s11_supply_osm_f73b24e8c424463a6125ecc3','tenant_platform_seed','Telcar Buying Station','Telcar Buying Station warehouse agro input supply chain cross_river','place_state_cross_river','["place_nigeria_001","place_state_cross_river"]',unixepoch(),unixepoch()),
  ('srch_s11_supply_osm_ab36033ea1461eac6c7ab4a3','organization','org_s11_supply_osm_ab36033ea1461eac6c7ab4a3','prof_s11_supply_osm_ab36033ea1461eac6c7ab4a3','tenant_platform_seed','PROVENDERIE','PROVENDERIE warehouse agro input supply chain nigeria','place_nigeria_001','["place_nigeria_001"]',unixepoch(),unixepoch()),
  ('srch_s11_supply_osm_64cbb6917d21e9b1181f3fcb','organization','org_s11_supply_osm_64cbb6917d21e9b1181f3fcb','prof_s11_supply_osm_64cbb6917d21e9b1181f3fcb','tenant_platform_seed','Exploitation horticole','Exploitation horticole warehouse agro input supply chain nigeria','place_nigeria_001','["place_nigeria_001"]',unixepoch(),unixepoch());

INSERT OR IGNORE INTO seed_identity_map (id,source_id,source_record_id,entity_type,entity_id,mapping_state,created_at) VALUES
  ('smap_s11_supply_osm_3e86bdec46c78ab7a005434b','seed_source_osm_ng_s11_supply_chain_20260422','osm_node_12728717968','organization','org_s11_supply_osm_3e86bdec46c78ab7a005434b','stable',unixepoch()),
  ('smap_s11_supply_osm_9493db4d5ef3fc64d66409fd','seed_source_osm_ng_s11_supply_chain_20260422','osm_way_395631568','organization','org_s11_supply_osm_9493db4d5ef3fc64d66409fd','stable',unixepoch()),
  ('smap_s11_supply_osm_f73b24e8c424463a6125ecc3','seed_source_osm_ng_s11_supply_chain_20260422','osm_way_445827838','organization','org_s11_supply_osm_f73b24e8c424463a6125ecc3','stable',unixepoch()),
  ('smap_s11_supply_osm_ab36033ea1461eac6c7ab4a3','seed_source_osm_ng_s11_supply_chain_20260422','osm_node_12434996792','organization','org_s11_supply_osm_ab36033ea1461eac6c7ab4a3','stable',unixepoch()),
  ('smap_s11_supply_osm_64cbb6917d21e9b1181f3fcb','seed_source_osm_ng_s11_supply_chain_20260422','osm_way_442775116','organization','org_s11_supply_osm_64cbb6917d21e9b1181f3fcb','stable',unixepoch());

INSERT OR IGNORE INTO seed_entity_sources (id,entity_id,entity_type,source_id,source_record_id,source_type,source_label,source_display_name,confidence_level,publication_date,retrieval_date,freshness_status,superseded_by_id,created_at) VALUES
  ('esrc_s11_supply_osm_3e86bdec46c78ab7a005434b','org_s11_supply_osm_3e86bdec46c78ab7a005434b','organization','seed_source_osm_ng_s11_supply_chain_20260422','osm_node_12728717968','public_data','OpenStreetMap Nigeria','SOSUCAM','public_high_confidence','2026-04-22','2026-04-22','snapshot',NULL,unixepoch()),
  ('esrc_s11_supply_osm_9493db4d5ef3fc64d66409fd','org_s11_supply_osm_9493db4d5ef3fc64d66409fd','organization','seed_source_osm_ng_s11_supply_chain_20260422','osm_way_395631568','public_data','OpenStreetMap Nigeria','Entrepôt Brasseries','public_high_confidence','2026-04-22','2026-04-22','snapshot',NULL,unixepoch()),
  ('esrc_s11_supply_osm_f73b24e8c424463a6125ecc3','org_s11_supply_osm_f73b24e8c424463a6125ecc3','organization','seed_source_osm_ng_s11_supply_chain_20260422','osm_way_445827838','public_data','OpenStreetMap Nigeria','Telcar Buying Station','public_high_confidence','2026-04-22','2026-04-22','snapshot',NULL,unixepoch()),
  ('esrc_s11_supply_osm_ab36033ea1461eac6c7ab4a3','org_s11_supply_osm_ab36033ea1461eac6c7ab4a3','organization','seed_source_osm_ng_s11_supply_chain_20260422','osm_node_12434996792','public_data','OpenStreetMap Nigeria','PROVENDERIE','public_high_confidence','2026-04-22','2026-04-22','snapshot',NULL,unixepoch()),
  ('esrc_s11_supply_osm_64cbb6917d21e9b1181f3fcb','org_s11_supply_osm_64cbb6917d21e9b1181f3fcb','organization','seed_source_osm_ng_s11_supply_chain_20260422','osm_way_442775116','public_data','OpenStreetMap Nigeria','Exploitation horticole','public_high_confidence','2026-04-22','2026-04-22','snapshot',NULL,unixepoch());