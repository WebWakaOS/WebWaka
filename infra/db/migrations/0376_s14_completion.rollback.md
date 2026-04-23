# Rollback: 0376_s14_completion

## Type
Data seed migration (INSERT OR IGNORE / INSERT INTO … VALUES).

## Rollback Strategy
This migration inserts read-only reference data. To roll back:

1. Identify the `seed_run_id` or `seed_source_id` used by this migration
   (check migration file for the literal ID values).
2. Execute targeted DELETEs against the affected tables filtered by that ID.
3. Update `seed_runs.status = 'rolled_back'` and record rollback timestamp.

For geographic / OSM-derived seeds, large-volume deletes should be run in
batches of 500 rows to avoid D1 statement limits.

## Tables Affected
See `0376_s14_completion.sql` for the exact table names and IDs inserted.

## Prerequisite
Migrations applied on top of this one that reference its IDs must be rolled
back first, in reverse order.
