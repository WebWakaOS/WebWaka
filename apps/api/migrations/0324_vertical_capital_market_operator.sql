-- 0324_vertical_capital_market_operator.sql
-- S07: Capital Market Operator vertical table
-- Covers: Broker/Dealer, Fund/Portfolio Manager, Trustees, Issuing House,
--         Registrar, Corporate Investment Adviser, Solicitors, Reporting
--         Accountant/Auditor, FMDQ Dealer, Inter Dealer Broker, Rating Agency,
--         Securities Exchange, Commodity Exchange, Custodian, CDS, and all SEC-
--         registered functions.
-- Subject: organization
-- T3: tenant_id NOT NULL
-- Status lifecycle: seeded → claimed → sec_verified → active

CREATE TABLE IF NOT EXISTS capital_market_operator_profiles (
  id                   TEXT    PRIMARY KEY,
  workspace_id         TEXT    NOT NULL,
  tenant_id            TEXT    NOT NULL,
  company_name         TEXT    NOT NULL,
  sec_file_number      TEXT,             -- SEC registration file number
  cac_number           TEXT,             -- CAC registration number
  operator_type        TEXT    NOT NULL, -- Primary operator type from SEC register
  address              TEXT,
  phone                TEXT,
  email                TEXT,
  registration_date    TEXT,             -- ISO date string from SEC
  status               TEXT    NOT NULL DEFAULT 'seeded'
                       CHECK (status IN ('seeded','claimed','sec_verified','active','suspended','revoked')),
  created_at           INTEGER NOT NULL,
  updated_at           INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cmo_profiles_tenant     ON capital_market_operator_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cmo_profiles_workspace  ON capital_market_operator_profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_cmo_profiles_sec_file   ON capital_market_operator_profiles(sec_file_number);
CREATE INDEX IF NOT EXISTS idx_cmo_profiles_type       ON capital_market_operator_profiles(operator_type, tenant_id);
