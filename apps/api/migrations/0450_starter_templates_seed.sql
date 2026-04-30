-- Migration 0450: 5 Starter Templates Seed (E26)
-- Phase 4 — Template System Rollout (M14 gate: 5 templates installable)
--
-- Seeds T01, T02, T03, T05, T06 as approved, platform-authored templates.
-- Each template includes:
--   module_config    — capability modules enabled by this template
--   vocabulary       — term overrides for this sector
--   default_policies — policy rules seeded into policy_rules on install (T3: tenant_id set at install)
--   default_workflows — workflow keys registered on install
--
-- Platform Invariants:
--   T3  — author_tenant_id=NULL means platform-authored (no tenant scope)
--   P9  — all kobo values are in condition_json, never top-level columns
--   AC-FUNC-03 — rollback in rollback/0450_rollback.sql
--
-- Note: INSERT OR IGNORE — safe to re-run; idempotent.

INSERT OR IGNORE INTO template_registry
  (id, slug, display_name, description, template_type, version, platform_compat,
   compatible_verticals, manifest_json, author_tenant_id, status,
   is_free, price_kobo, install_count, tags,
   module_config, vocabulary, default_policies, default_workflows,
   created_at, updated_at)
VALUES

-- ===========================================================================
-- T01 — Electoral / Political Mobilization
-- ===========================================================================
(
  'tpl_t01_electoral_v100',
  'electoral-mobilization',
  'Electoral / Political Mobilization',
  'Complete mobilization platform for electoral campaigns: GOTV tracking, ward networks, supporter management, INEC-compliant finance rules, and broadcast reach analytics.',
  'vertical-blueprint',
  '1.0.0',
  '^1.0.0',
  '[]',
  '{"name":"electoral-mobilization","version":"1.0.0","type":"dashboard","sensitivity":"HIGH","extensions":["groups-electoral","cases-constituency"],"dashboards":["member_count_by_ward","broadcast_reach_by_lga","gotv_tracking_map","campaign_finance_summary"]}',
  NULL,
  'approved',
  1,
  0,
  0,
  '["electoral","political","gotv","nigeria-first"]',
  '{"modules":["groups","value_movement","events","broadcasts","petitions","analytics","gotv"],"extensions":["groups-electoral"],"sensitivity":"HIGH","sensitiveFields":["voter_ref","supporter_phone"],"requiresSensitiveSectorRights":true}',
  '{"Group":"Support Group","Member":"Supporter","Coordinator":"Campaign Coordinator","Event":"Rally","Petition":"Call-to-Action","Contribution":"Campaign Contribution","Case":"Constituency Case"}',
  '[{"rule_key":"inec.contribution_cap.v1","category":"contribution_cap","scope":"tenant","title":"INEC Campaign Finance Cap","description":"Electoral workspaces: cumulative contributions to a single political campaign may not exceed 50 million naira per INEC regulations.","condition_json":"{\"campaignTypes\":[\"political\",\"election\"],\"maxKobo\":5000000000,\"requiresDisclosureAboveKobo\":100000000,\"cumulativePerCampaign\":true}","decision":"DENY","hitl_level":null},{"rule_key":"gotv.data_access.v1","category":"gotv_access","scope":"tenant","title":"GOTV Voter Data Access Gate","description":"voter_ref data accessible only to coordinators with sensitiveSectorRights. Strip voter_ref from AI/logs.","condition_json":"{\"requiredRoles\":[\"coordinator\",\"manager\",\"admin\"],\"requiresSensitiveSectorRights\":true,\"stripFields\":[\"voter_ref\"]}","decision":"ALLOW","hitl_level":null}]',
  '[{"key":"gotv_activation","name":"GOTV Activation Workflow","steps":["voter_mobilization","broadcast_ward","vote_confirmation"]},{"key":"supporter_onboarding","name":"Supporter Onboarding","steps":["registration","ward_assignment","coordinator_notification"]}]',
  unixepoch('now'),
  unixepoch('now')
),

-- ===========================================================================
-- T02 — Civic / Nonprofit / Volunteer
-- ===========================================================================
(
  'tpl_t02_civic_v100',
  'civic-nonprofit',
  'Civic / Nonprofit / Volunteer',
  'Structured volunteer coordination and beneficiary casework for NGOs, community organizations, and civic groups. Includes donation tracking, program analytics, and NDPR-compliant beneficiary data handling.',
  'vertical-blueprint',
  '1.0.0',
  '^1.0.0',
  '[]',
  '{"name":"civic-nonprofit","version":"1.0.0","type":"dashboard","sensitivity":"MEDIUM","extensions":["groups-civic"],"dashboards":["volunteer_count","beneficiary_cases_resolved","donations_received","program_impact"]}',
  NULL,
  'approved',
  1,
  0,
  0,
  '["civic","ngo","nonprofit","volunteer","community"]',
  '{"modules":["groups","cases","events","value_movement","analytics","broadcasts"],"extensions":["groups-civic"],"sensitivity":"MEDIUM","sensitiveFields":["beneficiary_name","beneficiary_phone","medical_info"]}',
  '{"Group":"Chapter","Member":"Volunteer","Case":"Beneficiary Case","Contribution":"Donation","Coordinator":"Program Coordinator","Event":"Programme"}',
  '[{"rule_key":"ndpr.beneficiary_data.v1","category":"pii_access","scope":"tenant","title":"Beneficiary Data NDPR Protection","description":"Civic workspaces: beneficiary personal data (name, phone, medical info) requires explicit NDPR consent before capture. Retained max 730 days.","condition_json":"{\"requiresConsent\":true,\"dataTypes\":[\"beneficiary_name\",\"beneficiary_phone\",\"medical_info\"],\"retentionDays\":730}","decision":"DENY","hitl_level":null}]',
  '[{"key":"beneficiary_intake","name":"Beneficiary Intake Workflow","steps":["registration","case_assignment","needs_assessment","programme_allocation"]},{"key":"volunteer_onboarding","name":"Volunteer Onboarding","steps":["application","background_check","orientation","chapter_assignment"]}]',
  unixepoch('now'),
  unixepoch('now')
),

-- ===========================================================================
-- T03 — Mutual Aid Network
-- ===========================================================================
(
  'tpl_t03_mutual_aid_v100',
  'mutual-aid-network',
  'Mutual Aid Network',
  'Peer-to-peer support networks where neighbors help neighbors. Tracks aid requests, network votes, disbursements, and open requests. HITL approval gates ensure transparent fund governance.',
  'vertical-blueprint',
  '1.0.0',
  '^1.0.0',
  '[]',
  '{"name":"mutual-aid-network","version":"1.0.0","type":"dashboard","sensitivity":"MEDIUM_HIGH","dashboards":["open_aid_requests","aid_dispatched_kobo","network_members","response_time"]}',
  NULL,
  'approved',
  1,
  0,
  0,
  '["mutual-aid","community","solidarity","cooperative","peer-support"]',
  '{"modules":["groups","cases","value_movement","events","broadcasts","analytics"],"sensitivity":"MEDIUM_HIGH","sensitiveFields":["financial_need_description","household_income"]}',
  '{"Group":"Network","Member":"Neighbor","Case":"Aid Request","Contribution":"Gift","Coordinator":"Steward","Event":"Community Gathering","Petition":"Network Call"}',
  '[{"rule_key":"mutual_aid.disbursement.hitl.v1","category":"payout_gate","scope":"tenant","title":"Mutual Aid Disbursement HITL","description":"Mutual aid disbursements require coordinator approval. Amounts below threshold: HITL level 1. Above threshold: HITL level 2.","condition_json":"{\"thresholdKobo\":50000000,\"belowThresholdHitlLevel\":1,\"aboveThresholdHitlLevel\":2,\"requiresNetworkVote\":false}","decision":"REQUIRE_HITL","hitl_level":1}]',
  '[{"key":"aid_request_workflow","name":"Aid Request Workflow","steps":["request_submitted","coordinator_review","disbursement_approved","funds_disbursed"]},{"key":"network_vote","name":"Network Vote Workflow","steps":["request_posted","voting_open","vote_closed","disbursement_decision"]}]',
  unixepoch('now'),
  unixepoch('now')
),

-- ===========================================================================
-- T05 — Constituency Service / Public Office
-- ===========================================================================
(
  'tpl_t05_constituency_v100',
  'constituency-service',
  'Constituency Service / Public Office',
  'Casework management for elected officials and public servants. Track constituent requests, ward-level cases, LGA analytics, and resolution timelines. High-sensitivity PII protections for constituent data.',
  'vertical-blueprint',
  '1.0.0',
  '^1.0.0',
  '[]',
  '{"name":"constituency-service","version":"1.0.0","type":"dashboard","sensitivity":"HIGH","extensions":["groups-electoral","cases-constituency"],"dashboards":["cases_by_lga_ward","resolution_time","open_cases_by_type","constituent_satisfaction"]}',
  NULL,
  'approved',
  1,
  0,
  0,
  '["constituency","public-office","casework","electoral","government"]',
  '{"modules":["cases","groups","events","broadcasts","analytics"],"extensions":["groups-electoral","cases-constituency"],"sensitivity":"HIGH","sensitiveFields":["constituent_phone","family_situation","medical_referral","financial_circumstances"]}',
  '{"Group":"Ward Network","Member":"Constituent","Case":"Constituency Case","Coordinator":"Ward Coordinator","Event":"Town Hall"}',
  '[{"rule_key":"constituency.case.pii.v1","category":"pii_access","scope":"tenant","title":"Constituency Case PII Protection","description":"Constituency cases contain high-sensitivity personal data. Handler must be workspace member. No public case data without constituent consent.","condition_json":"{\"requiresConsent\":true,\"requiresWorkspaceMember\":true,\"noPublicCaseData\":true,\"sensitivity\":\"HIGH\",\"sensitiveFields\":[\"family_situation\",\"medical_referral\",\"financial_circumstances\"]}","decision":"DENY","hitl_level":null}]',
  '[{"key":"case_intake","name":"Constituency Case Intake","steps":["case_opened","ward_coordinator_assigned","investigation","resolution","constituent_notification"]},{"key":"town_hall_workflow","name":"Town Hall Workflow","steps":["schedule_town_hall","broadcast_constituents","attend_and_log","follow_up_actions"]}]',
  unixepoch('now'),
  unixepoch('now')
),

-- ===========================================================================
-- T06 — Faith Community
-- ===========================================================================
(
  'tpl_t06_faith_v100',
  'faith-community',
  'Faith Community',
  'Full-spectrum faith community management: ministry units, tithe and offering tracking, service scheduling, sermon/study LMS, and NDPR-compliant individual giving records.',
  'vertical-blueprint',
  '1.0.0',
  '^1.0.0',
  '[]',
  '{"name":"faith-community","version":"1.0.0","type":"dashboard","sensitivity":"MEDIUM","extensions":["groups-faith"],"dashboards":["total_offerings","attendance_trends","ministry_growth","programme_calendar"]}',
  NULL,
  'approved',
  1,
  0,
  0,
  '["faith","church","mosque","religious","community","tithe","worship"]',
  '{"modules":["groups","value_movement","events","broadcasts","knowledge"],"extensions":["groups-faith"],"sensitivity":"MEDIUM","sensitiveFields":["individual_tithe_amount","giving_history"]}',
  '{"Group":"Ministry","Member":"Member","Contribution":"Tithe","Event":"Service","Coordinator":"Unit Leader","Case":"Pastoral Care Case","Petition":"Prayer Request"}',
  '[{"rule_key":"faith.tithe_records.pii.v1","category":"pii_access","scope":"tenant","title":"Tithe Records NDPR Consent","description":"Individual tithe and offering records are personal financial data under NDPR. Explicit consent required before recording individual giving amounts. Retained max 6 years for audit compliance.","condition_json":"{\"requiresConsent\":true,\"piiFields\":[\"individual_tithe_amount\",\"giving_history\",\"pledge_amount\"],\"retentionDays\":2190}","decision":"DENY","hitl_level":null}]',
  '[{"key":"member_enrolment","name":"Member Enrolment Workflow","steps":["application","unit_assignment","tithe_schedule_setup","event_attendance_tracking"]},{"key":"tithe_collection","name":"Tithe Collection Workflow","steps":["collection_opened","recording","reconciliation","report_generated"]}]',
  unixepoch('now'),
  unixepoch('now')
);
