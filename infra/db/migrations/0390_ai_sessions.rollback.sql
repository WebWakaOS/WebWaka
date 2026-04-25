-- Rollback: 0390_ai_sessions
-- Removes ai_session_messages and ai_sessions tables, all associated indexes,
-- and the ai-session-prune scheduled_jobs registration.
-- G23: no data recovery; this is a hard rollback.

DELETE FROM scheduled_jobs WHERE name = 'ai-session-prune';

DROP INDEX IF EXISTS idx_ai_session_messages_session;
DROP TABLE  IF EXISTS ai_session_messages;

DROP INDEX IF EXISTS idx_ai_sessions_expires;
DROP INDEX IF EXISTS idx_ai_sessions_owner;
DROP TABLE  IF EXISTS ai_sessions;
