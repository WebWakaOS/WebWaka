-- Migration 0454: Starter Templates Phase 5 — T04, T07, T08, T09 (E31)
-- M15 gate: all 9 templates operational
--
-- Seeds the 4 remaining templates:
--   T04 — Advocacy / Petition Campaign
--   T07 — Association / Cooperative
--   T08 — Personal / Community Assistance
--   T09 — Business / Member / Customer Community
--
-- Phase 4 (migration 0450) seeded T01, T02, T03, T05, T06.
-- This migration completes the full 9-template catalogue.
--
-- Platform Invariants:
--   T3  — author_tenant_id=NULL means platform-authored
--   P9  — all kobo values are in condition_json, never top-level columns
--   AC-FUNC-03 — rollback in rollback/0454_rollback.sql
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
-- T04 — Advocacy / Petition Campaign
-- PRD §9.2 T04
-- ===========================================================================
(
  'tpl_t04_advocacy_v100',
  'advocacy-petition',
  'Advocacy / Petition Campaign',
  'End-to-end petition and advocacy campaign platform: launch signature drives, manage coalition members, coordinate events (marches, forums), and track broadcast reach. Petition signature privacy respected — anonymous option available.',
  'vertical-blueprint',
  '1.0.0',
  '^1.0.0',
  '[]',
  '{"name":"advocacy-petition","version":"1.0.0","type":"dashboard","sensitivity":"MEDIUM","dashboards":["signature_count","broadcast_reach","endorsing_organizations","petition_status"]}',
  NULL,
  'approved',
  1,
  0,
  0,
  '["advocacy","petition","campaign","ngo","civic","social-change"]',
  '{"modules":["groups","petitions","value_movement","broadcasts","events","analytics"],"sensitivity":"MEDIUM","sensitiveFields":["anonymous_signature_flag","signatory_phone"]}',
  '{"Group":"Coalition","Member":"Advocate","Petition":"Demand","Coordinator":"Lead Organizer","Event":"March","Contribution":"Campaign Fund","Case":"Issue"}',
  '[{"rule_key":"advocacy.petition_privacy.v1","category":"pii_access","scope":"tenant","title":"Petition Signature Privacy","description":"Advocacy petitions support anonymous signature option. When anonymous_signature=true, signatory personal data (name, phone) must not appear in public signature counts or exports.","condition_json":"{\"allowAnonymous\":true,\"requiresConsent\":true,\"piiFields\":[\"signatory_phone\",\"signatory_name\"],\"publicFieldsWhenAnonymous\":[\"signature_count\",\"signed_at\"]}","decision":"DENY","hitl_level":null}]',
  '[{"key":"petition_campaign","name":"Petition Campaign Workflow","steps":["petition_launched","signature_drive_open","target_reached","delivery_to_target"]},{"key":"coalition_building","name":"Coalition Building Workflow","steps":["coalition_formed","member_orgs_invited","endorsement_recorded","public_launch"]}]',
  unixepoch('now'),
  unixepoch('now')
),

-- ===========================================================================
-- T07 — Association / Cooperative
-- PRD §9.2 T07
-- ===========================================================================
(
  'tpl_t07_association_v100',
  'association-cooperative',
  'Association / Cooperative',
  'Full-lifecycle member management for associations, cooperatives, and professional groups: dues collection, savings cycles, loan requests, AGM management, grievance handling, and analytics. Loan approval requires HITL level 2.',
  'vertical-blueprint',
  '1.0.0',
  '^1.0.0',
  '[]',
  '{"name":"association-cooperative","version":"1.0.0","type":"dashboard","sensitivity":"MEDIUM","extensions":["groups-cooperative"],"dashboards":["dues_collection_rate","loan_portfolio","member_growth","savings_balance"]}',
  NULL,
  'approved',
  1,
  0,
  0,
  '["cooperative","association","professional","savings","loans","agm"]',
  '{"modules":["groups","value_movement","events","cases","analytics","broadcasts"],"extensions":["groups-cooperative"],"sensitivity":"MEDIUM","sensitiveFields":["loan_amount","savings_balance","default_history"]}',
  '{"Group":"Association","Member":"Member","Dues":"Levy","Case":"Grievance","Coordinator":"Executive Secretary","Event":"AGM","Contribution":"Contribution"}',
  '[{"rule_key":"coop.loan_approval.hitl.v1","category":"payout_gate","scope":"tenant","title":"Cooperative Loan Approval HITL Gate","description":"All cooperative loan requests require HITL review before disbursement. Standard amounts: HITL level 2. Emergency loans above threshold: HITL level 2 with 24h fast-track.","condition_json":"{\"defaultHitlLevel\":2,\"requiresQuorum\":false,\"fastTrackEmergencyAboveKobo\":500000000}","decision":"REQUIRE_HITL","hitl_level":2},{"rule_key":"coop.dues_grace.v1","category":"compliance","scope":"tenant","title":"Dues Default Grace Period","description":"Cooperative members have a configurable grace period before dues default is recorded. Default: 30 days. Admin may override per workspace policy.","condition_json":"{\"defaultGracePeriodDays\":30,\"max_retention_days\":3650,\"data_categories\":[\"dues_records\"]}","decision":"ALLOW","hitl_level":null}]',
  '[{"key":"membership_lifecycle","name":"Membership Lifecycle Workflow","steps":["application","dues_onboarding","savings_cycle_start","loan_eligibility"]},{"key":"loan_request","name":"Loan Request Workflow","steps":["request_submitted","credit_check","committee_review","disbursement_approved","funds_disbursed"]},{"key":"agm_workflow","name":"AGM Workflow","steps":["notice_issued","agenda_published","quorum_confirmed","resolutions_recorded","minutes_published"]}]',
  unixepoch('now'),
  unixepoch('now')
),

-- ===========================================================================
-- T08 — Personal / Community Assistance
-- PRD §9.2 T08
-- ===========================================================================
(
  'tpl_t08_personal_assist_v100',
  'personal-assistance',
  'Personal / Community Assistance',
  'Personal fundraising and community support campaigns for individuals facing hardship. Public campaign pages, shared by family and friends, with contributions tracked and payout managed. High-sensitivity PII protection for personal circumstances.',
  'vertical-blueprint',
  '1.0.0',
  '^1.0.0',
  '[]',
  '{"name":"personal-assistance","version":"1.0.0","type":"dashboard","sensitivity":"HIGH","dashboards":["campaign_total_raised","contributor_count","payout_status","campaign_reach"]}',
  NULL,
  'approved',
  1,
  0,
  0,
  '["personal","fundraising","community","hardship","support","crowd-funding"]',
  '{"modules":["cases","value_movement","groups","broadcasts"],"sensitivity":"HIGH","sensitiveFields":["personal_circumstances","medical_details","financial_need_description","family_situation"]}',
  '{"Group":"Support Circle","Case":"Help Request","Contribution":"Support Gift","Coordinator":"Campaign Organizer","Member":"Supporter"}',
  '[{"rule_key":"personal.campaign_pii.v1","category":"pii_access","scope":"tenant","title":"Personal Campaign PII — High Sensitivity","description":"Personal assistance campaigns contain high-sensitivity PII (medical conditions, financial circumstances, family situations). Explicit NDPR consent required. Only anonymized summaries permitted in public views. Data retained max 365 days after campaign close.","condition_json":"{\"requiresConsent\":true,\"sensitivity\":\"HIGH\",\"piiFields\":[\"medical_details\",\"financial_need_description\",\"family_situation\",\"personal_circumstances\"],\"retentionDays\":365,\"publicViewAllowedFields\":[\"campaign_title\",\"campaign_story_public\",\"total_raised_kobo\",\"contributor_count\"]}","decision":"DENY","hitl_level":null},{"rule_key":"personal.payout.hitl.v1","category":"payout_gate","scope":"tenant","title":"Personal Campaign Payout HITL Gate","description":"Personal assistance campaign payouts require HITL review to prevent fraud. Standard: HITL level 2. Large payouts above 10m kobo: HITL level 3.","condition_json":"{\"defaultHitlLevel\":2,\"largePayoutKobo\":1000000000,\"largePayoutHitlLevel\":3}","decision":"REQUIRE_HITL","hitl_level":2}]',
  '[{"key":"personal_campaign","name":"Personal Campaign Workflow","steps":["campaign_created","story_published","sharing_activated","contributions_received","payout_requested","payout_approved"]},{"key":"support_circle","name":"Support Circle Workflow","steps":["circle_formed","members_invited","campaign_shared","contributions_tracked"]}]',
  unixepoch('now'),
  unixepoch('now')
),

-- ===========================================================================
-- T09 — Business / Member / Customer Community
-- PRD §9.2 T09
-- ===========================================================================
(
  'tpl_t09_biz_community_v100',
  'business-community',
  'Business / Member / Customer Community',
  'Community platform for businesses, brands, and membership organizations. Manage member onboarding, engagement activities (meetups, workshops), LMS content, commerce offerings, and membership fee collection. Requires Growth+ plan for commerce layer.',
  'vertical-blueprint',
  '1.0.0',
  '^1.0.0',
  '[]',
  '{"name":"business-community","version":"1.0.0","type":"dashboard","sensitivity":"LOW_MEDIUM","dashboards":["member_count","event_attendance","revenue_from_fees","content_engagement"]}',
  NULL,
  'approved',
  1,
  0,
  0,
  '["business","community","membership","brand","customer","commerce","lms"]',
  '{"modules":["groups","events","knowledge","value_movement","broadcasts","analytics"],"sensitivity":"LOW_MEDIUM","requiresPlan":"growth","sensitiveFields":["payment_method","membership_fee_amount"]}',
  '{"Group":"Community","Member":"Member","Coordinator":"Community Manager","Event":"Meetup","Contribution":"Membership Fee","Case":"Support Ticket"}',
  '[{"rule_key":"biz_community.commerce_plan.v1","category":"ai_gate","scope":"tenant","title":"Business Community — Commerce Layer Plan Gate","description":"The commerce and offerings module within Business Community template requires Growth plan or above. DENY access to commerce features for free/starter plan workspaces.","condition_json":"{\"min_plan\":\"growth\",\"capabilities\":[\"pos_receipt_ai\",\"price_suggest\",\"product_description_writer\"]}","decision":"DENY","hitl_level":null}]',
  '[{"key":"member_onboarding","name":"Member Onboarding Workflow","steps":["signup","profile_complete","welcome_event","first_engagement"]},{"key":"renewal","name":"Membership Renewal Workflow","steps":["renewal_notice_sent","payment_received","membership_extended","welcome_back_broadcast"]}]',
  unixepoch('now'),
  unixepoch('now')
);
