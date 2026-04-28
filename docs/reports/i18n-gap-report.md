# i18n Gap Report — Phase 1 Audit

**Generated:** 2026-04-28  
**Auditor:** Phase 1 automated audit  
**Reference locale:** `en` (English)

---

## Summary

| Locale | Code | Keys Present | Keys in `en` | Missing | Coverage |
|--------|------|-------------|-------------|---------|----------|
| English | `en` | 168 | 168 | 0 | 100% |
| French | `fr` | 94 | 168 | 100 | 56% |
| Hausa | `ha` | 58 | 168 | 136 | 35% |
| Igbo | `ig` | 58 | 168 | 136 | 35% |
| Nigerian Pidgin | `pcm` | 58 | 168 | 136 | 35% |
| Yoruba | `yo` | 58 | 168 | 136 | 35% |

> **Platform target (PRD UX-15):** ha, ig, yo, pcm must reach 90%+ coverage before GA.  
> Current gap: **110 keys missing per Nigeria-native locale**.

---

## Missing key categories (by domain prefix)

All four Nigeria-native locales (ha, ig, yo, pcm) are missing the same 136 keys.
French (fr) is missing 100 keys. The gaps cluster in these domains:

### Actions (7 missing keys)
`action_approve`, `action_download`, `action_refresh`, `action_reject`,
`action_send`, `action_upload`, `action_view`

### AI assistant (12 missing keys)
`ai_assistant`, `ai_budget_depleted`, `ai_budget_warning`, `ai_capability_unavailable`,
`ai_consent_grant`, `ai_consent_required`, `ai_consent_revoke`, `ai_hitl_approved`,
`ai_hitl_expired`, `ai_hitl_pending`, `ai_hitl_rejected`, `ai_processing`, `ai_result_ready`

### Analytics (12 missing keys)
`analytics_customers`, `analytics_new_customers`, `analytics_no_data`, `analytics_orders`,
`analytics_payment_breakdown`, `analytics_period_day`, `analytics_period_month`,
`analytics_period_week`, `analytics_refreshing`, `analytics_revenue`,
`analytics_title`, `analytics_top_vertical`

### Auth (6 missing keys)
`auth_email_sent`, `auth_email_verified`, `auth_have_account`, `auth_no_account`,
`auth_resend_verification`, `auth_verify_email`

### B2B marketplace (missing keys in ha/ig/yo/pcm only)
`b2b_bid_accept`, `b2b_bid_amount`, `b2b_bid_notes`, `b2b_bid_now`, `b2b_bid_seller`,
`b2b_bid_submit`, `b2b_bulk_discount`, `b2b_create_listing`, `b2b_listing_moq`,
`b2b_listing_type_bulk`, `b2b_listing_type_wholesale`, `b2b_my_listings`, `b2b_no_listings`,
`b2b_order_details`, `b2b_order_now`

### Cases (0 — not yet in any locale)
The cases module (Phase 1) introduces the following required new keys for all locales:
- `case_open`, `case_assign`, `case_resolve`, `case_close`, `case_reopen`
- `case_note_add`, `case_note_internal`, `case_status_*` variants
- `case_sla_breach`, `case_priority_*` variants
- `case_category_*` variants  
- `notif_case_opened`, `notif_case_assigned`, `notif_case_resolved`,
  `notif_case_note`, `notif_case_sla_breach`

**These must be added to ALL locales (including en) in Phase 2 i18n sprint.**

### Fundraising (missing in ha/ig/yo/pcm)
`fundraising_campaign_active`, `fundraising_campaign_end_date`, `fundraising_create`,
`fundraising_donor_wall`, `fundraising_goal`, `fundraising_make_donation`, `fundraising_share`

### Groups (missing in ha/ig/yo/pcm)
`group_members`, `group_meetings`, `group_broadcasts`, `group_events`,
`group_join`, `group_leave`, `group_create`, `group_settings`

### KYC & identity (missing in ha/ig/yo/pcm)
`kyc_bvn_verify`, `kyc_nin_verify`, `kyc_pending`, `kyc_rejected`, `kyc_verified`

### USSD / offline (missing in ha/ig/yo/pcm)
`offline_banner`, `offline_sync_complete`, `offline_sync_failed`,
`ussd_cancel`, `ussd_menu_select`, `ussd_session_timeout`

### Payments / wallet (missing in ha/ig/yo/pcm)
`payment_amount`, `payment_failed`, `payment_pending`, `payment_success`,
`wallet_balance`, `wallet_fund`, `wallet_history`, `wallet_withdraw`

---

## Recommendations

1. **Immediate (Phase 2 sprint):** Assign native language reviewers for ha, ig, yo, pcm.
   Target: 90%+ coverage (≥152/168 keys) by end of Phase 2.

2. **Cases keys (blocking Phase 1 UI):** Add ~18 new case-related keys to `en` first,
   then propagate to all locales before Phase 1 UI ships.

3. **FR gap (44%):** French coverage is higher than Nigeria-native locales but still
   needs attention. Recruit a francophone Nigerian reviewer (Francophone diaspora UX).

4. **Automation:** Add a CI check that fails if any Nigeria-native locale drops
   below 80% coverage (lint:i18n task — wire into pre-push hook).

5. **Key naming:** Follow the `domain_action_qualifier` convention established in `en.ts`.
   Do not add flat/unnamespaced keys.

---

## Files audited

- `packages/i18n/src/locales/en.ts` (168 keys — reference)
- `packages/i18n/src/locales/fr.ts` (94 keys — 56% coverage)
- `packages/i18n/src/locales/ha.ts` (58 keys — 35% coverage)
- `packages/i18n/src/locales/ig.ts` (58 keys — 35% coverage)
- `packages/i18n/src/locales/pcm.ts` (58 keys — 35% coverage)
- `packages/i18n/src/locales/yo.ts` (58 keys — 35% coverage)

---

*Next audit: Phase 2 — target 90% Nigeria-native coverage.*
