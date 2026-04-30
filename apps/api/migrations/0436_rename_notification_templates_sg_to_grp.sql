-- Migration 0436: Rename support_group notification template IDs
-- Phase 0 rename: tpl_sg_* → tpl_grp_*
--
-- 26 template rows from migration 0430 are renamed.
-- tpl_fr_* (fundraising) templates are NOT renamed — they use a separate namespace.
--
-- T3 invariant: tenant_id preserved (NULL = system template).
-- Rollback: 0436_rollback.sql

UPDATE notification_template SET id = 'tpl_grp_created_email_en_v1'        WHERE id = 'tpl_sg_created_email_en_v1';
UPDATE notification_template SET id = 'tpl_grp_created_inapp_en_v1'        WHERE id = 'tpl_sg_created_inapp_en_v1';
UPDATE notification_template SET id = 'tpl_grp_memjoin_inapp_en_v1'        WHERE id = 'tpl_sg_memjoin_inapp_en_v1';
UPDATE notification_template SET id = 'tpl_grp_memapprove_email_en_v1'     WHERE id = 'tpl_sg_memapprove_email_en_v1';
UPDATE notification_template SET id = 'tpl_grp_memapprove_sms_en_v1'       WHERE id = 'tpl_sg_memapprove_sms_en_v1';
UPDATE notification_template SET id = 'tpl_grp_memapprove_inapp_en_v1'     WHERE id = 'tpl_sg_memapprove_inapp_en_v1';
UPDATE notification_template SET id = 'tpl_grp_memsuspend_email_en_v1'     WHERE id = 'tpl_sg_memsuspend_email_en_v1';
UPDATE notification_template SET id = 'tpl_grp_memsuspend_sms_en_v1'       WHERE id = 'tpl_sg_memsuspend_sms_en_v1';
UPDATE notification_template SET id = 'tpl_grp_memsuspend_inapp_en_v1'     WHERE id = 'tpl_sg_memsuspend_inapp_en_v1';
UPDATE notification_template SET id = 'tpl_grp_broadcast_sms_en_v1'        WHERE id = 'tpl_sg_broadcast_sms_en_v1';
UPDATE notification_template SET id = 'tpl_grp_broadcast_inapp_en_v1'      WHERE id = 'tpl_sg_broadcast_inapp_en_v1';
UPDATE notification_template SET id = 'tpl_grp_meeting_sched_email_en_v1'  WHERE id = 'tpl_sg_meeting_sched_email_en_v1';
UPDATE notification_template SET id = 'tpl_grp_meeting_sched_sms_en_v1'    WHERE id = 'tpl_sg_meeting_sched_sms_en_v1';
UPDATE notification_template SET id = 'tpl_grp_meeting_sched_inapp_en_v1'  WHERE id = 'tpl_sg_meeting_sched_inapp_en_v1';
UPDATE notification_template SET id = 'tpl_grp_meeting_done_inapp_en_v1'   WHERE id = 'tpl_sg_meeting_done_inapp_en_v1';
UPDATE notification_template SET id = 'tpl_grp_resolution_inapp_en_v1'     WHERE id = 'tpl_sg_resolution_inapp_en_v1';
UPDATE notification_template SET id = 'tpl_grp_event_email_en_v1'          WHERE id = 'tpl_sg_event_email_en_v1';
UPDATE notification_template SET id = 'tpl_grp_event_inapp_en_v1'          WHERE id = 'tpl_sg_event_inapp_en_v1';
UPDATE notification_template SET id = 'tpl_grp_gotv_rec_inapp_en_v1'       WHERE id = 'tpl_sg_gotv_rec_inapp_en_v1';
UPDATE notification_template SET id = 'tpl_grp_gotv_vote_sms_en_v1'        WHERE id = 'tpl_sg_gotv_vote_sms_en_v1';
UPDATE notification_template SET id = 'tpl_grp_gotv_vote_inapp_en_v1'      WHERE id = 'tpl_sg_gotv_vote_inapp_en_v1';
UPDATE notification_template SET id = 'tpl_grp_petition_open_email_en_v1'  WHERE id = 'tpl_sg_petition_open_email_en_v1';
UPDATE notification_template SET id = 'tpl_grp_petition_open_inapp_en_v1'  WHERE id = 'tpl_sg_petition_open_inapp_en_v1';
UPDATE notification_template SET id = 'tpl_grp_petition_sign_inapp_en_v1'  WHERE id = 'tpl_sg_petition_sign_inapp_en_v1';
UPDATE notification_template SET id = 'tpl_grp_archived_email_en_v1'       WHERE id = 'tpl_sg_archived_email_en_v1';
UPDATE notification_template SET id = 'tpl_grp_archived_inapp_en_v1'       WHERE id = 'tpl_sg_archived_inapp_en_v1';

-- Update notification_delivery template_id references to match renamed templates
-- (Only affects deliveries that were sent with old template IDs; no-op on fresh databases)
UPDATE notification_delivery SET template_id = 'tpl_grp_created_email_en_v1'        WHERE template_id = 'tpl_sg_created_email_en_v1';
UPDATE notification_delivery SET template_id = 'tpl_grp_created_inapp_en_v1'        WHERE template_id = 'tpl_sg_created_inapp_en_v1';
UPDATE notification_delivery SET template_id = 'tpl_grp_memjoin_inapp_en_v1'        WHERE template_id = 'tpl_sg_memjoin_inapp_en_v1';
UPDATE notification_delivery SET template_id = 'tpl_grp_memapprove_email_en_v1'     WHERE template_id = 'tpl_sg_memapprove_email_en_v1';
UPDATE notification_delivery SET template_id = 'tpl_grp_memapprove_sms_en_v1'       WHERE template_id = 'tpl_sg_memapprove_sms_en_v1';
UPDATE notification_delivery SET template_id = 'tpl_grp_memapprove_inapp_en_v1'     WHERE template_id = 'tpl_sg_memapprove_inapp_en_v1';
UPDATE notification_delivery SET template_id = 'tpl_grp_memsuspend_email_en_v1'     WHERE template_id = 'tpl_sg_memsuspend_email_en_v1';
UPDATE notification_delivery SET template_id = 'tpl_grp_memsuspend_sms_en_v1'       WHERE template_id = 'tpl_sg_memsuspend_sms_en_v1';
UPDATE notification_delivery SET template_id = 'tpl_grp_memsuspend_inapp_en_v1'     WHERE template_id = 'tpl_sg_memsuspend_inapp_en_v1';
UPDATE notification_delivery SET template_id = 'tpl_grp_broadcast_sms_en_v1'        WHERE template_id = 'tpl_sg_broadcast_sms_en_v1';
UPDATE notification_delivery SET template_id = 'tpl_grp_broadcast_inapp_en_v1'      WHERE template_id = 'tpl_sg_broadcast_inapp_en_v1';
UPDATE notification_delivery SET template_id = 'tpl_grp_meeting_sched_email_en_v1'  WHERE template_id = 'tpl_sg_meeting_sched_email_en_v1';
UPDATE notification_delivery SET template_id = 'tpl_grp_meeting_sched_sms_en_v1'    WHERE template_id = 'tpl_sg_meeting_sched_sms_en_v1';
UPDATE notification_delivery SET template_id = 'tpl_grp_meeting_sched_inapp_en_v1'  WHERE template_id = 'tpl_sg_meeting_sched_inapp_en_v1';
UPDATE notification_delivery SET template_id = 'tpl_grp_meeting_done_inapp_en_v1'   WHERE template_id = 'tpl_sg_meeting_done_inapp_en_v1';
UPDATE notification_delivery SET template_id = 'tpl_grp_resolution_inapp_en_v1'     WHERE template_id = 'tpl_sg_resolution_inapp_en_v1';
UPDATE notification_delivery SET template_id = 'tpl_grp_event_email_en_v1'          WHERE template_id = 'tpl_sg_event_email_en_v1';
UPDATE notification_delivery SET template_id = 'tpl_grp_event_inapp_en_v1'          WHERE template_id = 'tpl_sg_event_inapp_en_v1';
UPDATE notification_delivery SET template_id = 'tpl_grp_gotv_rec_inapp_en_v1'       WHERE template_id = 'tpl_sg_gotv_rec_inapp_en_v1';
UPDATE notification_delivery SET template_id = 'tpl_grp_gotv_vote_sms_en_v1'        WHERE template_id = 'tpl_sg_gotv_vote_sms_en_v1';
UPDATE notification_delivery SET template_id = 'tpl_grp_gotv_vote_inapp_en_v1'      WHERE template_id = 'tpl_sg_gotv_vote_inapp_en_v1';
UPDATE notification_delivery SET template_id = 'tpl_grp_petition_open_email_en_v1'  WHERE template_id = 'tpl_sg_petition_open_email_en_v1';
UPDATE notification_delivery SET template_id = 'tpl_grp_petition_open_inapp_en_v1'  WHERE template_id = 'tpl_sg_petition_open_inapp_en_v1';
UPDATE notification_delivery SET template_id = 'tpl_grp_petition_sign_inapp_en_v1'  WHERE template_id = 'tpl_sg_petition_sign_inapp_en_v1';
UPDATE notification_delivery SET template_id = 'tpl_grp_archived_email_en_v1'       WHERE template_id = 'tpl_sg_archived_email_en_v1';
UPDATE notification_delivery SET template_id = 'tpl_grp_archived_inapp_en_v1'       WHERE template_id = 'tpl_sg_archived_inapp_en_v1';
