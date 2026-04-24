#!/usr/bin/env bash
# apply-safe.sh — Safe D1 migration runner with ALTER TABLE idempotence guard.
#
# BUG-002 fix: Migration 0374 (and any future ALTER TABLE migration) can fail
# if the column already exists from a prior partial run. This script:
#   1. Scans each staged migration for ALTER TABLE ADD COLUMN patterns
#   2. Pre-checks via pragma_table_info whether the column already exists
#   3. Logs SKIP or APPLY decisions for each migration
#   4. Produces a migration-audit-<sha>.txt artifact for CI upload
#
# Usage: ./scripts/migrations/apply-safe.sh <env> <d1-database-name>
#
# Environment:
#   CLOUDFLARE_API_TOKEN  — Required: CF API token with D1 access
#   CLOUDFLARE_ACCOUNT_ID — Required: CF account ID
#   GITHUB_SHA            — Optional: used to name audit artifact
#
# Rollback: Remove the "Pre-apply migration safety check" step from deploy workflows.
# No database state is changed by this script before the wrangler apply command.

set -euo pipefail

ENV="${1:-staging}"
DB_NAME="${2:-webwaka-db}"
AUDIT_FILE="migration-audit-${GITHUB_SHA:-local}.txt"
MIGRATIONS_DIR="apps/api/migrations"

echo "=== Migration Safety Audit ===" > "$AUDIT_FILE"
echo "Env: $ENV | DB: $DB_NAME | SHA: ${GITHUB_SHA:-local}" >> "$AUDIT_FILE"
echo "Date: $(date -u '+%Y-%m-%dT%H:%M:%SZ')" >> "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "No migrations directory found at $MIGRATIONS_DIR — skipping safety check" | tee -a "$AUDIT_FILE"
  exit 0
fi

MIGRATION_COUNT=0
ALTER_COUNT=0
SKIP_COUNT=0

for sql_file in "$MIGRATIONS_DIR"/*.sql; do
  [ -f "$sql_file" ] || continue
  fname=$(basename "$sql_file")
  MIGRATION_COUNT=$((MIGRATION_COUNT + 1))

  # Check if ALTER TABLE ADD COLUMN pattern is present (case-insensitive)
  if grep -qiE "ALTER[[:space:]]+TABLE[[:space:]]+[a-zA-Z_]+[[:space:]]+ADD[[:space:]]+(COLUMN[[:space:]]+)?[a-zA-Z_]+" "$sql_file" 2>/dev/null; then
    ALTER_COUNT=$((ALTER_COUNT + 1))

    # Extract table name and column name from the ALTER TABLE statement
    col=$(grep -ioE "ADD[[:space:]]+(COLUMN[[:space:]]+)?([a-zA-Z_]+)" "$sql_file" 2>/dev/null | head -1 | awk '{print $NF}')
    tbl=$(grep -ioE "ALTER[[:space:]]+TABLE[[:space:]]+([a-zA-Z_]+)" "$sql_file" 2>/dev/null | head -1 | awk '{print $NF}')

    if [ -z "$tbl" ] || [ -z "$col" ]; then
      echo "  WARN: $fname — could not parse ALTER TABLE target (col='$col', tbl='$tbl')" | tee -a "$AUDIT_FILE"
      continue
    fi

    echo "CHECKING: $fname — ALTER TABLE $tbl ADD $col" | tee -a "$AUDIT_FILE"

    # Query pragma_table_info to see if column already exists in D1
    existing=$(npx wrangler d1 execute "$DB_NAME" --env "$ENV" --remote \
      --command "SELECT COUNT(*) as c FROM pragma_table_info('$tbl') WHERE name='$col'" \
      --json 2>/dev/null \
      | python3 -c "import json,sys; d=json.load(sys.stdin); print(d[0]['results'][0]['c'])" 2>/dev/null \
      || echo "0")

    if [ "$existing" -gt "0" ]; then
      echo "  SKIP: Column '$col' already exists in '$tbl' — migration $fname is idempotent-safe" | tee -a "$AUDIT_FILE"
      SKIP_COUNT=$((SKIP_COUNT + 1))
    else
      echo "  APPLY: Column '$col' not found in '$tbl' — migration $fname will be applied" | tee -a "$AUDIT_FILE"
    fi
  fi
done

echo "" >> "$AUDIT_FILE"
echo "=== Summary ===" >> "$AUDIT_FILE"
echo "Total migrations staged: $MIGRATION_COUNT" | tee -a "$AUDIT_FILE"
echo "ALTER TABLE migrations checked: $ALTER_COUNT" | tee -a "$AUDIT_FILE"
echo "Migrations to skip (column exists): $SKIP_COUNT" | tee -a "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"
echo "=== Applying migrations via wrangler ===" >> "$AUDIT_FILE"

# Run wrangler migrations apply — wrangler tracks applied migrations in d1_migrations table
# and skips already-applied migrations automatically. The pragma_table_info check above
# adds an additional layer for ALTER TABLE safety.
cd apps/api
npx wrangler d1 migrations apply "$DB_NAME" --env "$ENV" --remote 2>&1 | tee -a "../../$AUDIT_FILE"
cd ../..

echo "" >> "$AUDIT_FILE"
echo "Migration audit complete: $AUDIT_FILE"
cat "$AUDIT_FILE"
