#!/usr/bin/env bash
# =============================================================================
# HandyLife Wallet — WALLET_KV Initialization Script (WF-037 / WF-018)
# =============================================================================
#
# PURPOSE:
#   Writes all required WALLET_KV keys for the HandyLife Wallet to a
#   Cloudflare KV namespace after it has been provisioned.
#
# PREREQUISITES:
#   1. wrangler installed and authenticated (wrangler login)
#   2. WALLET_KV namespace created:
#        wrangler kv namespace create WALLET_KV --env staging
#        wrangler kv namespace create WALLET_KV --env production
#   3. Returned namespace IDs filled in at apps/api/wrangler.toml
#      (replace <WALLET_KV_STAGING_ID> and <WALLET_KV_PRODUCTION_ID>)
#   4. [[kv_namespaces]] blocks uncommented in wrangler.toml
#
# USAGE:
#   bash scripts/kv-init-wallet.sh staging
#   bash scripts/kv-init-wallet.sh production
#
# SAFETY:
#   All put operations are idempotent — safe to re-run. Existing values
#   are overwritten only if this script is intentionally re-run.
#
# =============================================================================

set -euo pipefail

ENV="${1:-}"
if [[ -z "$ENV" ]]; then
  echo "Usage: $0 <staging|production>" >&2
  exit 1
fi
if [[ "$ENV" != "staging" && "$ENV" != "production" ]]; then
  echo "Error: ENV must be 'staging' or 'production'" >&2
  exit 1
fi

echo "==> Initializing WALLET_KV for environment: $ENV"

kv_put() {
  local KEY="$1"
  local VALUE="$2"
  echo "    kv put: $KEY = $VALUE"
  wrangler kv key put "$KEY" "$VALUE" \
    --binding WALLET_KV \
    --env "$ENV"
}

# =============================================================================
# 1. Tenant eligibility
# =============================================================================
echo ""
echo "--- Tenant eligibility ---"
if [[ "$ENV" == "production" ]]; then
  kv_put "wallet:eligible_tenants" '["handylife"]'
else
  kv_put "wallet:eligible_tenants" '["handylife_staging"]'
fi

# =============================================================================
# 2. Feature flags — all OFF (Phase 1 hardening)
# =============================================================================
echo ""
echo "--- Feature flags (all OFF for Phase 1) ---"
kv_put "wallet:flag:transfers_enabled"     "0"
kv_put "wallet:flag:withdrawals_enabled"   "0"
kv_put "wallet:flag:online_funding_enabled" "0"
kv_put "wallet:flag:mla_payout_enabled"    "0"

# =============================================================================
# 3. HITL threshold — ₦100,000 (10,000,000 kobo)
# =============================================================================
echo ""
echo "--- HITL threshold ---"
kv_put "wallet:hitl_threshold_kobo" "10000000"

# =============================================================================
# 4. CBN KYC tier limits (kobo)
#    T1: daily ₦50k (5,000,000), balance cap ₦300k (30,000,000)
#    T2: daily ₦200k (20,000,000), balance cap ₦2M (200,000,000)
#    T3: unlimited (-1)
# =============================================================================
echo ""
echo "--- CBN KYC tier limits ---"
kv_put "wallet:daily_limit_kobo:1"  "5000000"
kv_put "wallet:daily_limit_kobo:2"  "20000000"
kv_put "wallet:daily_limit_kobo:3"  "-1"
kv_put "wallet:balance_cap_kobo:1"  "30000000"
kv_put "wallet:balance_cap_kobo:2"  "200000000"
kv_put "wallet:balance_cap_kobo:3"  "-1"

# Minimum KYC tier required to create a wallet (1 = BVN-lite)
kv_put "wallet:kyc_tier_minimum" "1"

# =============================================================================
# 5. MLA commission rates (basis points)
#    L1 = 5.0% (500bps), L2 = 2.0% (200bps), L3 = 1.0% (100bps)
# =============================================================================
echo ""
echo "--- MLA commission rates ---"
kv_put "wallet:mla:commission_bps:1" "500"
kv_put "wallet:mla:commission_bps:2" "200"
kv_put "wallet:mla:commission_bps:3" "100"

# Minimum payout threshold: ₦500 (50,000 kobo)
kv_put "wallet:mla:min_payout_kobo" "50000"

# Settlement window before pending → payable: 24 hours (86400 seconds)
kv_put "wallet:mla:settlement_window_secs" "86400"

# =============================================================================
echo ""
echo "==> WALLET_KV initialization complete for environment: $ENV"
echo ""
echo "Next steps:"
echo "  1. Verify with: wrangler kv key list --binding WALLET_KV --env $ENV"
echo "  2. Deploy the API worker: wrangler deploy --env $ENV"
echo "  3. Run verification: curl https://api${ENV:+"-$ENV"}.webwaka.com/health"
if [[ "$ENV" == "production" ]]; then
  echo ""
  echo "  PRODUCTION CHECKLIST before going live:"
  echo "    [ ] wallet:eligible_tenants contains 'handylife'"
  echo "    [ ] All feature flags are '0' (Phase 1 — no transfers/withdrawals)"
  echo "    [ ] mla_payout_enabled is '0' (enable only after payout test on staging)"
  echo "    [ ] HITL threshold confirmed with Chief Risk Officer"
  echo "    [ ] CBN KYC limits confirmed with Chief Compliance Officer"
fi
