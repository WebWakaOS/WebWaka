-- No rollback possible for ALTER TABLE ADD COLUMN in SQLite.
-- Columns can be dropped in SQLite 3.35+ only.
-- To rollback: recreate workspaces without the new columns and copy data.
-- Platform operations must handle this manually if needed.
SELECT 'Rollback of 0253 must be performed manually — see migration notes' AS warning;
