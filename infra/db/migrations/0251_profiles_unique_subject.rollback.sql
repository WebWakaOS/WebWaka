-- Rollback for 0251: Remove unique index on profiles(subject_type, subject_id)

DROP INDEX IF EXISTS idx_profiles_unique_subject;
