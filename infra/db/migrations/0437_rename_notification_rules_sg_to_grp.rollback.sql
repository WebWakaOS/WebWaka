-- Rollback for 0437: Restore rule_grp_* → rule_sg_*

UPDATE notification_rule SET id = 'rule_sg_created'        WHERE id = 'rule_grp_created';
UPDATE notification_rule SET id = 'rule_sg_memjoin'        WHERE id = 'rule_grp_memjoin';
UPDATE notification_rule SET id = 'rule_sg_memapprove'     WHERE id = 'rule_grp_memapprove';
UPDATE notification_rule SET id = 'rule_sg_memsuspend'     WHERE id = 'rule_grp_memsuspend';
UPDATE notification_rule SET id = 'rule_sg_broadcast'      WHERE id = 'rule_grp_broadcast';
UPDATE notification_rule SET id = 'rule_sg_meeting_sched'  WHERE id = 'rule_grp_meeting_sched';
UPDATE notification_rule SET id = 'rule_sg_meeting_done'   WHERE id = 'rule_grp_meeting_done';
UPDATE notification_rule SET id = 'rule_sg_resolution'     WHERE id = 'rule_grp_resolution';
UPDATE notification_rule SET id = 'rule_sg_event'          WHERE id = 'rule_grp_event';
UPDATE notification_rule SET id = 'rule_sg_gotv_rec'       WHERE id = 'rule_grp_gotv_rec';
UPDATE notification_rule SET id = 'rule_sg_gotv_vote'      WHERE id = 'rule_grp_gotv_vote';
UPDATE notification_rule SET id = 'rule_sg_petition_open'  WHERE id = 'rule_grp_petition_open';
UPDATE notification_rule SET id = 'rule_sg_petition_sign'  WHERE id = 'rule_grp_petition_sign';
UPDATE notification_rule SET id = 'rule_sg_archived'       WHERE id = 'rule_grp_archived';
