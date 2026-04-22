-- 0365_s16_partner_data_framework.sql
-- S16 Field Partner Data Exchange Framework 2026-04-22
-- Tables: partner_profiles, partner_data_submissions, partner_import_logs
-- Purpose: Enable vetted field partners to submit entity data for review+import

-- ── Partner profiles ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partner_profiles (
  id                  TEXT PRIMARY KEY,
  tenant_id           TEXT NOT NULL,
  partner_name        TEXT NOT NULL,
  contact_email       TEXT NOT NULL,
  contact_phone       TEXT,
  api_key_hash        TEXT,                                  -- SHA-256 of API key
  organisation_type   TEXT NOT NULL DEFAULT 'ngo'
                      CHECK (organisation_type IN ('ngo','government','private','academic','media','community')),
  trust_level         TEXT NOT NULL DEFAULT 'provisional'
                      CHECK (trust_level IN ('provisional','verified','trusted','suspended')),
  state_coverage      TEXT NOT NULL DEFAULT '[]',           -- JSON array of state slugs
  vertical_coverage   TEXT NOT NULL DEFAULT '[]',           -- JSON array of vertical slugs
  max_submissions_per_day INTEGER NOT NULL DEFAULT 100,
  notes               TEXT,
  created_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_partner_profiles_tenant   ON partner_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_partner_profiles_trust    ON partner_profiles(trust_level);
CREATE UNIQUE INDEX IF NOT EXISTS uq_partner_profiles_email ON partner_profiles(contact_email, tenant_id);

-- ── Partner data submissions ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partner_data_submissions (
  id                  TEXT PRIMARY KEY,
  tenant_id           TEXT NOT NULL,
  partner_id          TEXT NOT NULL REFERENCES partner_profiles(id),
  submission_date     INTEGER NOT NULL DEFAULT (unixepoch()),
  vertical_slug       TEXT NOT NULL,
  data_format         TEXT NOT NULL DEFAULT 'json'
                      CHECK (data_format IN ('json','csv','geojson','xlsx')),
  raw_payload         TEXT,                                  -- raw submitted data (JSON text)
  record_count        INTEGER NOT NULL DEFAULT 0,
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','validating','accepted','rejected','partially_accepted','imported')),
  accepted_count      INTEGER NOT NULL DEFAULT 0,
  rejected_count      INTEGER NOT NULL DEFAULT 0,
  rejection_reasons   TEXT,                                  -- JSON array of error strings
  reviewer_id         TEXT,
  reviewed_at         INTEGER,
  notes               TEXT,
  created_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_partner_submissions_tenant  ON partner_data_submissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_partner_submissions_partner ON partner_data_submissions(partner_id, submission_date);
CREATE INDEX IF NOT EXISTS idx_partner_submissions_status  ON partner_data_submissions(status, tenant_id);
CREATE INDEX IF NOT EXISTS idx_partner_submissions_vert    ON partner_data_submissions(vertical_slug, tenant_id);

-- ── Partner import logs ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partner_import_logs (
  id                  TEXT PRIMARY KEY,
  tenant_id           TEXT NOT NULL,
  submission_id       TEXT NOT NULL REFERENCES partner_data_submissions(id),
  partner_id          TEXT NOT NULL REFERENCES partner_profiles(id),
  entity_type         TEXT NOT NULL CHECK (entity_type IN ('organization','individual','place','profile')),
  entity_id           TEXT,
  action              TEXT NOT NULL CHECK (action IN ('insert','update','skip','reject')),
  reason              TEXT,
  raw_record          TEXT,                                  -- JSON of the submitted record
  created_at          INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_partner_import_logs_sub    ON partner_import_logs(submission_id);
CREATE INDEX IF NOT EXISTS idx_partner_import_logs_entity ON partner_import_logs(entity_type, entity_id);

-- ── Import templates (one per vertical) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS partner_import_templates (
  id                  TEXT PRIMARY KEY,
  vertical_slug       TEXT NOT NULL,
  version             TEXT NOT NULL DEFAULT '1.0',
  schema_json         TEXT NOT NULL,                        -- JSON Schema definition
  example_json        TEXT,                                  -- example record
  required_fields     TEXT NOT NULL DEFAULT '[]',           -- JSON array of required field names
  optional_fields     TEXT NOT NULL DEFAULT '[]',           -- JSON array of optional field names
  validation_rules    TEXT NOT NULL DEFAULT '{}',           -- JSON validation rules
  notes               TEXT,
  created_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_import_templates_vert_ver ON partner_import_templates(vertical_slug, version);

-- ── Seed initial import templates for core verticals ──────────────────────
INSERT OR IGNORE INTO partner_import_templates (id,vertical_slug,version,schema_json,example_json,required_fields,optional_fields,validation_rules,notes) VALUES
  ('tmpl_s16_clinic_v1','clinic','1.0',
   '{"type":"object","properties":{"facility_name":{"type":"string","maxLength":200},"facility_type":{"type":"string","enum":["clinic","hospital","maternity","dispensary","pharmacy"]},"lga_name":{"type":"string"},"state_name":{"type":"string"},"latitude":{"type":"number","minimum":4.0,"maximum":14.0},"longitude":{"type":"number","minimum":2.5,"maximum":14.5},"ownership":{"type":"string"},"functional_status":{"type":"string","enum":["functional","not_functional","unknown"]}}}',
   '{"facility_name":"Garki General Hospital","facility_type":"hospital","lga_name":"AMAC","state_name":"Fct","latitude":9.0579,"longitude":7.4951,"ownership":"Federal Ministry of Health","functional_status":"functional"}',
   '["facility_name","facility_type","state_name"]',
   '["lga_name","latitude","longitude","ownership","functional_status","contact_phone","address","notes"]',
   '{"state_name":{"allowed_values":["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","Fct","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"]}}',
   'Health facility submission template v1.0 — primary, secondary and tertiary health care facilities'),

  ('tmpl_s16_school_v1','school','1.0',
   '{"type":"object","properties":{"school_name":{"type":"string","maxLength":200},"school_type":{"type":"string","enum":["primary","secondary","tertiary"]},"lga_name":{"type":"string"},"state_name":{"type":"string"},"latitude":{"type":"number"},"longitude":{"type":"number"},"ownership":{"type":"string","enum":["public","private","mission"]},"gender_policy":{"type":"string","enum":["mixed","boys","girls"]}}}',
   '{"school_name":"Federal Government College Enugu","school_type":"secondary","lga_name":"Enugu East","state_name":"Enugu","latitude":6.4698,"longitude":7.5539,"ownership":"public","gender_policy":"mixed"}',
   '["school_name","school_type","state_name"]',
   '["lga_name","latitude","longitude","ownership","gender_policy","nerdc_code","waec_centre_number"]',
   '{}',
   'School submission template v1.0'),

  ('tmpl_s16_bank_v1','bank','1.0',
   '{"type":"object","properties":{"branch_name":{"type":"string","maxLength":200},"bank_name":{"type":"string","maxLength":100},"cbn_license_number":{"type":"string"},"lga_name":{"type":"string"},"state_name":{"type":"string"},"latitude":{"type":"number"},"longitude":{"type":"number"},"branch_type":{"type":"string","enum":["branch","agent","atm_only"]}}}',
   '{"branch_name":"GTBank Victoria Island","bank_name":"Guaranty Trust Bank","lga_name":"Eti-Osa","state_name":"Lagos","latitude":6.4281,"longitude":3.4219,"branch_type":"branch"}',
   '["branch_name","bank_name","state_name"]',
   '["cbn_license_number","lga_name","latitude","longitude","branch_type","sort_code","swift_code"]',
   '{}',
   'Bank branch submission template v1.0'),

  ('tmpl_s16_government_v1','government','1.0',
   '{"type":"object","properties":{"office_name":{"type":"string","maxLength":200},"office_type":{"type":"string","enum":["federal","state","local_government","parastatal","judiciary","legislature"]},"lga_name":{"type":"string"},"state_name":{"type":"string"},"latitude":{"type":"number"},"longitude":{"type":"number"},"head_of_office":{"type":"string"},"contact_email":{"type":"string","format":"email"}}}',
   '{"office_name":"Borno State Government House","office_type":"state","lga_name":"Maiduguri","state_name":"Borno","latitude":11.8462,"longitude":13.1571}',
   '["office_name","office_type","state_name"]',
   '["lga_name","latitude","longitude","head_of_office","contact_email","contact_phone"]',
   '{}',
   'Government office submission template v1.0'),

  ('tmpl_s16_ngo_v1','ngo','1.0',
   '{"type":"object","properties":{"organisation_name":{"type":"string","maxLength":200},"focus_areas":{"type":"array","items":{"type":"string"}},"cac_registration":{"type":"string"},"lga_name":{"type":"string"},"state_name":{"type":"string"},"contact_email":{"type":"string","format":"email"},"website":{"type":"string","format":"uri"}}}',
   '{"organisation_name":"Mercy Corps Nigeria","focus_areas":["humanitarian","food_security"],"cac_registration":"RC123456","state_name":"Borno","contact_email":"nigeria@mercycorps.org"}',
   '["organisation_name","state_name"]',
   '["focus_areas","cac_registration","lga_name","latitude","longitude","contact_email","website"]',
   '{}',
   'NGO/CSO submission template v1.0');
