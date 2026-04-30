-- Migration 0437: Rename support_group notification routing rule IDs
-- Phase 0 rename: rule_sg_* → rule_grp_* (cosmetic ID rename only)
--
-- IMPORTANT: event_key values are NOT renamed here.
--   GroupEventType string values remain 'support_group.*' for backward compat.
--   Both /support-groups and /groups routes publish the same event strings.
--   event_key rename (support_group.* → group.*) happens in Phase 2 after
--   migration 0438 drops the /support-groups shadow route.
--
-- 14 routing rule rows from migration 0431 are ID-renamed.
-- Rollback: 0437_rollback.sql

UPDATE notification_rule SET id = 'rule_grp_created'        WHERE id = 'rule_sg_created';
UPDATE notification_rule SET id = 'rule_grp_memjoin'        WHERE id = 'rule_sg_memjoin';
UPDATE notification_rule SET id = 'rule_grp_memapprove'     WHERE id = 'rule_sg_memapprove';
UPDATE notification_rule SET id = 'rule_grp_memsuspend'     WHERE id = 'rule_sg_memsuspend';
UPDATE notification_rule SET id = 'rule_grp_broadcast'      WHERE id = 'rule_sg_broadcast';
UPDATE notification_rule SET id = 'rule_grp_meeting_sched'  WHERE id = 'rule_sg_meeting_sched';
UPDATE notification_rule SET id = 'rule_grp_meeting_done'   WHERE id = 'rule_sg_meeting_done';
UPDATE notification_rule SET id = 'rule_grp_resolution'     WHERE id = 'rule_sg_resolution';
UPDATE notification_rule SET id = 'rule_grp_event'          WHERE id = 'rule_sg_event';
UPDATE notification_rule SET id = 'rule_grp_gotv_rec'       WHERE id = 'rule_sg_gotv_rec';
UPDATE notification_rule SET id = 'rule_grp_gotv_vote'      WHERE id = 'rule_sg_gotv_vote';
UPDATE notification_rule SET id = 'rule_grp_petition_open'  WHERE id = 'rule_sg_petition_open';
UPDATE notification_rule SET id = 'rule_grp_petition_sign'  WHERE id = 'rule_sg_petition_sign';
UPDATE notification_rule SET id = 'rule_grp_archived'       WHERE id = 'rule_sg_archived';
