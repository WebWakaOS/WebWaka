#!/usr/bin/env bash
# ============================================================
# WebWaka D1 Migration Apply Script
# Generated: 2026-04-11 by WebWaka Superagent (Base44)
#
# Usage:
#   ./infra/scripts/apply-migrations.sh staging     # apply to staging DB
#   ./infra/scripts/apply-migrations.sh production  # apply to production DB
#   ./infra/scripts/apply-migrations.sh staging 7   # start from migration 0007
#   ./infra/scripts/apply-migrations.sh staging 181 # start from migration 0181 (negotiation)
#
# Prerequisites:
#   - wrangler installed & authenticated (npx wrangler login)
#   - Run from repo root: cd /path/to/WebWaka
# ============================================================

set -euo pipefail

ENV="${1:-staging}"
START_FROM="${2:-1}"

# Validate environment
if [[ "$ENV" != "staging" && "$ENV" != "production" ]]; then
  echo "❌ Usage: $0 [staging|production] [start_from_migration_number]"
  exit 1
fi

# D1 database names from wrangler.toml
if [[ "$ENV" == "staging" ]]; then
  DB_NAME="webwaka-staging"
  DB_ID="7c264f00-c36d-4014-b2fe-c43e136e86f6"
else
  DB_NAME="webwaka-production"
  DB_ID="72fa5ec8-52c2-4f41-b486-957d7b00c76f"
fi

MIGRATIONS_DIR="infra/db/migrations"
PASS=0
FAIL=0
SKIP=0
ERRORS=()

echo "========================================================"
echo " WebWaka D1 Migration Runner"
echo " Environment : $ENV"
echo " Database    : $DB_NAME ($DB_ID)"
echo " Migrations  : $MIGRATIONS_DIR"
echo " Starting at : migration $(printf '%04d' $START_FROM)"
echo "========================================================"
echo ""

# Collect and sort migration files
MIGRATION_FILES=($(ls "$MIGRATIONS_DIR"/*.sql | sort))
TOTAL=${#MIGRATION_FILES[@]}
echo "📦 Total migration files found: $TOTAL"
echo ""

for FILE in "${MIGRATION_FILES[@]}"; do
  BASENAME=$(basename "$FILE")

  # Extract numeric prefix for ordering/filtering
  NUM=$(echo "$BASENAME" | grep -oE '^[0-9]+' | sed 's/^0*//')
  NUM=${NUM:-0}

  # Skip migrations before START_FROM
  if [[ "$NUM" -lt "$START_FROM" ]]; then
    SKIP=$((SKIP + 1))
    continue
  fi

  echo "▶ Applying: $BASENAME"

  if npx wrangler d1 execute "$DB_NAME" \
      --env "$ENV" \
      --file="$FILE" \
      --remote 2>&1; then
    echo "  ✅ OK: $BASENAME"
    PASS=$((PASS + 1))
  else
    echo "  ❌ FAILED: $BASENAME"
    FAIL=$((FAIL + 1))
    ERRORS+=("$BASENAME")

    # Ask whether to continue or abort on failure
    read -p "  Continue despite failure? [y/N] " CONT
    if [[ "$CONT" != "y" && "$CONT" != "Y" ]]; then
      echo ""
      echo "🛑 Aborted by user after failure."
      break
    fi
  fi

  echo ""
done

echo "========================================================"
echo " SUMMARY"
echo "========================================================"
echo " ✅ Passed : $PASS"
echo " ❌ Failed : $FAIL"
echo " ⏭  Skipped: $SKIP"
echo ""

if [[ ${#ERRORS[@]} -gt 0 ]]; then
  echo " Failed migrations:"
  for ERR in "${ERRORS[@]}"; do
    echo "   - $ERR"
  done
  echo ""
  echo "🔧 Fix the above, then re-run with:"
  echo "   ./infra/scripts/apply-migrations.sh $ENV <failed_migration_number>"
  exit 1
else
  echo "🎉 All migrations applied successfully to [$ENV]!"
fi
