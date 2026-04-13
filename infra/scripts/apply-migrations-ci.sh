#!/usr/bin/env bash
# ============================================================
# WebWaka D1 Migration Apply Script — CI/Non-interactive mode
# For use in GitHub Actions or automated pipelines.
#
# Usage:
#   ENV=staging ./infra/scripts/apply-migrations-ci.sh
#   ENV=production START_FROM=181 ./infra/scripts/apply-migrations-ci.sh
# ============================================================

set -euo pipefail

ENV="${ENV:-staging}"
START_FROM="${START_FROM:-1}"
MIGRATIONS_DIR="infra/db/migrations"

if [[ "$ENV" == "staging" ]]; then
  DB_NAME="webwaka-staging"
else
  DB_NAME="webwaka-production"
fi

echo "🚀 Applying migrations to [$ENV] from migration $START_FROM..."

MIGRATION_FILES=($(ls "$MIGRATIONS_DIR"/*.sql | sort))
PASS=0
FAIL=0

for FILE in "${MIGRATION_FILES[@]}"; do
  BASENAME=$(basename "$FILE")
  NUM=$(echo "$BASENAME" | grep -oE '^[0-9]+' | sed 's/^0*//')
  NUM=${NUM:-0}

  if [[ "$NUM" -lt "$START_FROM" ]]; then
    continue
  fi

  echo "▶ $BASENAME"
  if npx wrangler d1 execute "$DB_NAME" \
      --env "$ENV" \
      --file="$FILE" \
      --remote; then
    PASS=$((PASS + 1))
  else
    echo "❌ FAILED: $BASENAME"
    FAIL=$((FAIL + 1))
    exit 1   # Fail fast in CI
  fi
done

echo "✅ Done — $PASS migrations applied to [$ENV]."
