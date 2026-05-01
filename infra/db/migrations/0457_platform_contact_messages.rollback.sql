-- Rollback 0457: Drop platform_contact_messages table
DROP INDEX IF EXISTS idx_pcm_created;
DROP TABLE IF EXISTS platform_contact_messages;
