-- SQLite does not support DROP COLUMN on older versions; recreate table without the column.
-- In practice, the column can be left in place and ignored (safe no-op rollback).
-- The CHECK constraint ensures only valid values are stored.
-- Full rollback: manually recreate workspaces table if required.
-- For now: this is documented as a safe no-op rollback (column remains but unused).
SELECT 'rollback: default_payment_method column removal requires table recreation in SQLite';
