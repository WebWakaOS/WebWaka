-- Migration 0163: Optician / Eye Clinic vertical (M10)
-- T3: tenant_id NOT NULL; P9: all monetary in kobo integers
-- Clinical-adjacent: L2 for scheduling; L3 HITL for any clinical output
-- P13: patient_ref_id opaque; prescription data NEVER to AI

CREATE TABLE IF NOT EXISTS optician_profiles (
  id              TEXT    PRIMARY KEY,
  workspace_id    TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  business_name   TEXT    NOT NULL,
  osphon_reg      TEXT,   -- Optometrists & Dispensing Opticians Registration Board
  cac_rc          TEXT,
  clinic_type     TEXT    NOT NULL DEFAULT 'both', -- optician/eye_clinic/both
  status          TEXT    NOT NULL DEFAULT 'seeded',
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_optician_profiles_tenant ON optician_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_optician_profiles_workspace ON optician_profiles(workspace_id);

CREATE TABLE IF NOT EXISTS optician_appointments (
  id                TEXT    PRIMARY KEY,
  profile_id        TEXT    NOT NULL,
  tenant_id         TEXT    NOT NULL,
  patient_ref_id    TEXT    NOT NULL, -- opaque (P13)
  appointment_date  INTEGER NOT NULL,
  exam_type         TEXT    NOT NULL DEFAULT 'comprehensive', -- comprehensive/refraction/contact_lens/pediatric
  fee_kobo          INTEGER NOT NULL DEFAULT 0,
  status            TEXT    NOT NULL DEFAULT 'scheduled', -- scheduled/completed/no_show/cancelled
  created_at        INTEGER NOT NULL,
  updated_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_optician_appointments_tenant ON optician_appointments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_optician_appointments_profile ON optician_appointments(profile_id);

CREATE TABLE IF NOT EXISTS optician_prescriptions (
  id               TEXT    PRIMARY KEY,
  appointment_id   TEXT    NOT NULL,
  profile_id       TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  patient_ref_id   TEXT    NOT NULL, -- opaque (P13) — NEVER to AI
  sphere_re        INTEGER, -- ×100 to avoid float
  cylinder_re      INTEGER,
  axis_re          INTEGER, -- degrees integer
  sphere_le        INTEGER,
  cylinder_le      INTEGER,
  axis_le          INTEGER,
  add_power        INTEGER,
  pd_mm10          INTEGER, -- pupillary distance ×10
  prescription_date INTEGER NOT NULL,
  created_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_optician_prescriptions_tenant ON optician_prescriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_optician_prescriptions_patient ON optician_prescriptions(patient_ref_id);

CREATE TABLE IF NOT EXISTS optician_orders (
  id              TEXT    PRIMARY KEY,
  profile_id      TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  patient_ref_id  TEXT    NOT NULL, -- opaque (P13)
  prescription_id TEXT,
  frame_type      TEXT,   -- rimless/half_rim/full_rim/contact_lens
  lens_type       TEXT,   -- single_vision/bifocal/progressive/contact
  frame_cost_kobo INTEGER NOT NULL DEFAULT 0,
  lens_cost_kobo  INTEGER NOT NULL DEFAULT 0,
  total_kobo      INTEGER NOT NULL DEFAULT 0,
  order_date      INTEGER NOT NULL,
  ready_date      INTEGER,
  status          TEXT    NOT NULL DEFAULT 'ordered', -- ordered/lab/ready/collected
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_optician_orders_tenant ON optician_orders(tenant_id);
