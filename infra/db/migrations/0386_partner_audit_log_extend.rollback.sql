-- Rollback: 0386_partner_audit_log_extend
-- Restore original partner_audit_log with restricted CHECK constraint.
-- Any rows with action 'credits_allocated' or 'settlement_calculated' will be lost.

PRAGMA foreign_keys = OFF;

BEGIN;

CREATE TABLE IF NOT EXISTS partner_audit_log_orig (
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

INSERT INTO partner_audit_log_orig
SELECT id, partner_id, actor_id, action, payload, created_at
FROM partner_audit_log
WHERE action IN (
  'partner_registered', 'partner_status_changed', 'sub_partner_created',
  'sub_partner_status_changed', 'entitlement_granted', 'entitlement_revoked',
  'white_label_depth_changed'
);

DROP TABLE partner_audit_log;

ALTER TABLE partner_audit_log_orig RENAME TO partner_audit_log;

CREATE INDEX IF NOT EXISTS idx_partner_audit_log_partner_id  ON partner_audit_log(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_audit_log_actor_id    ON partner_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_partner_audit_log_action      ON partner_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_partner_audit_log_created_at  ON partner_audit_log(created_at);

COMMIT;

PRAGMA foreign_keys = ON;
