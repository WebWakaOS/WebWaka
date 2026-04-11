-- Migration: 0203_partner_audit_log
-- Description: Append-only audit log for partner management actions — M11.
-- Governance: partner-and-subpartner-model.md (rule 3: sub-partner creation must be auditable),
--             security-baseline.md §6 (audit logging for destructive + financial ops)
-- Invariant: T3 (partner_id scoped), append-only (no UPDATE/DELETE)

CREATE TABLE IF NOT EXISTS partner_audit_log (
  id          TEXT NOT NULL PRIMARY KEY,
  partner_id  TEXT NOT NULL REFERENCES partners(id),
  actor_id    TEXT NOT NULL,
  action      TEXT NOT NULL
              CHECK (action IN (
                'partner_registered', 'partner_status_changed', 'sub_partner_created',
                'sub_partner_status_changed', 'entitlement_granted', 'entitlement_revoked',
                'white_label_depth_changed'
              )),
  payload     TEXT NOT NULL DEFAULT '{}',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_partner_audit_log_partner_id  ON partner_audit_log(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_audit_log_actor_id    ON partner_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_partner_audit_log_action      ON partner_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_partner_audit_log_created_at  ON partner_audit_log(created_at);
