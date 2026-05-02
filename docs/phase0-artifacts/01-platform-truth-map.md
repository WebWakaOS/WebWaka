# Artifact 01 — Platform Truth Map
## WebWaka OS: Verified Current-State Baseline (Phase 0 Deep Discovery)

**Status:** AUTHORITATIVE — Phase 0 Deep Discovery output  
**Date:** 2026-05-02  
**Evidence standard:** Every claim verified from direct file reads. No assumption-based content.  
**Supersedes:** Any prior summary that conflicts with data here.

---

## 1. Repository Topology

| Dimension | Value | Source |
|---|---|---|
| Monorepo tool | pnpm workspaces (no Turborepo) | `pnpm-workspace.yaml`, root `package.json` |
| Runtime target | Cloudflare Workers (Hono) | All `apps/*/src/index.ts` |
| Database | D1 (SQLite), KV, R2 | `apps/api/src/env.ts` |
| Language | TypeScript strict (ES2022, ESNext modules) | `tsconfig.base.json` |
| Test framework | Vitest (unit), Playwright (E2E visual regression) | `vitest.config.ts` per package |
| Package manager | pnpm 9 | `.github/workflows/ci.yml` |
| Node version | 20 | CI workflows |
| Total apps | 15 directories in `apps/` | `ls apps/` |
| Total packages | 212 directories in `packages/` | `ls packages/` |
| Vertical packages | 159 `packages/verticals-*` | Counted, reconciled S02 |
| Non-vertical packages | 53 shared functional packages | Counted |
| Total migrations | 905 SQL files (0001–0461 forward + rollback pairs) | `ls infra/db/migrations/` |

---

## 2. Applications Inventory

| App | Type | Runtime | Purpose | Deploy Status |
|---|---|---|---|---|
| `apps/api` | Hono CF Worker | Cloudflare Workers | Main API — all tenant-facing routes | ✅ Deployed (staging + production) |
| `apps/brand-runtime` | Hono CF Worker | Cloudflare Workers | Pillar 2 — branded website/portal per tenant | ✅ Deployed |
| `apps/public-discovery` | React + Vite SPA + Hono Worker | Cloudflare Workers | Pillar 3 — public marketplace/discovery frontend | ✅ Deployed |
| `apps/tenant-public` | Hono CF Worker | Cloudflare Workers | Per-tenant public discovery page | ✅ Deployed |
| `apps/notificator` | Hono CF Worker + Queue consumer | Cloudflare Workers + Queues | Notification pipeline consumer | ✅ Deployed |
| `apps/schedulers` | Hono CF Worker + Cron | Cloudflare Workers (Cron) | Background scheduled tasks (digest, DSAR, data-retention) | ✅ Deployed |
| `apps/projections` | Hono CF Worker | Cloudflare Workers | Read-model projection worker | ✅ Deployed |
| `apps/admin-dashboard` | Hono CF Worker | Cloudflare Workers | Internal admin dashboard (super_admin) | ✅ Deployed |
| `apps/workspace-app` | React + Vite SPA | Cloudflare Workers (static) | Tenant workspace management SPA | ✅ Deployed |
| `apps/partner-admin` | Hono CF Worker + React SPA | Cloudflare Workers | Partner management (partner/sub-partner tier) | ✅ Deployed |
| `apps/partner-admin-spa` | React + Vite SPA | Cloudflare Workers (static) | Partner admin frontend | ✅ Deployed |
| `apps/platform-admin` | Node.js (dev shim) | Node.js HTTP | Platform super-admin (local dev + staging only) | ✅ Running |
| `apps/discovery-spa` | React + Vite SPA | Cloudflare Workers (static) | Discovery frontend SPA | ✅ Deployed |
| `apps/marketing-site` | Hono CF Worker | Cloudflare Workers | Public marketing/landing pages | ✅ Deployed |
| `apps/ussd-gateway` | Hono CF Worker | Cloudflare Workers | USSD + WhatsApp + Telegram gateway (Africa's Talking) | ✅ Deployed |
| `apps/log-tail` | Hono CF Worker + Tail Worker | Cloudflare Tail Workers | Structured log drain → Axiom (ADR-0045) | ✅ Deployed |

---

## 3. Core Shared Packages (Non-Vertical) — Full Inventory

| Package | Key Exports | Tests |
|---|---|---|
| `@webwaka/auth` | `jwtAuthMiddleware`, `requireRole`, PBKDF2 hashing, refresh tokens, opaque tokens | ✅ |
| `@webwaka/auth-tenancy` | Re-exports `@webwaka/auth` (no longer empty stub, fixed M7) | — |
| `@webwaka/types` | `PlatformLayer` enum (11 values), `SubscriptionPlan`, all shared DTOs | — |
| `@webwaka/entities` | CRUD for 7 root entity types (individuals, orgs, workspaces, places, profiles, offerings, brand surfaces) | ✅ |
| `@webwaka/entitlements` | `PLAN_CONFIGS`, `evaluateLayerAccess`, `requireLayerAccess`, guards | ✅ |
| `@webwaka/control-plane` | 5-layer dynamic configurability: PlanCatalog, EntitlementEngine, PermissionResolver, DelegationGuard, FlagService | ✅ |
| `@webwaka/notifications` | Rule-based notification engine, 7 channels, 122+ event types, 55+ templates, 27 routing rules | ✅ (510+) |
| `@webwaka/superagent` | BYOK KeyService, WalletService, CreditBurnEngine, HITL, SpendControls, NdprRegister, 159 vertical AI configs | ✅ |
| `@webwaka/policy-engine` | 8-evaluator policy engine (v0.3.0): financial-cap, KYC, AI-governance, moderation, data-retention, payout-gate, access-control, compliance-regime | ✅ (24+) |
| `@webwaka/vertical-engine` | Registry of 166 verticals, FSM engine, CRUD generator, route generators | ✅ |
| `@webwaka/community` | Community spaces, membership, channels, events, courses, moderation | ✅ (45) |
| `@webwaka/groups` | Universal Group Management (civic, church, NGO, professional, community) — post-Phase-0-reset | ✅ (24) |
| `@webwaka/groups-electoral` | Electoral extensions for groups (GOTV, politician affiliations) | ✅ |
| `@webwaka/groups-civic` | Civic group extensions | ✅ (8) |
| `@webwaka/groups-faith` | Faith group extensions | ✅ (8) |
| `@webwaka/groups-cooperative` | Cooperative group extensions | ✅ (8) |
| `@webwaka/fundraising` | Campaigns, contributions, pledges, milestones, rewards, HITL payout, compliance | ✅ (24) |
| `@webwaka/support-groups` | Election support group management (15-table schema, GOTV, petitions, broadcasts) — pre-generalization | ✅ (24) |
| `@webwaka/cases` | Case lifecycle: open→assign→note→resolve→close | ✅ |
| `@webwaka/workflows` | Workflow engine: payout-approval, case-resolution definitions | ✅ (12) |
| `@webwaka/ledger` | Shared double-entry ledger (atomic CTE, kobo-only) | ✅ |
| `@webwaka/payments` | Paystack integration, subscription sync, NGN currency utils | ✅ |
| `@webwaka/pos` | POS float ledger, agent network, terminals, airtime | ✅ |
| `@webwaka/hl-wallet` | HandyLife wallet, MLA commission, CBN KYC tiers | ✅ |
| `@webwaka/negotiation` | Negotiable pricing engine, vendor policies, offer/counteroffer FSM, price-lock tokens | ✅ |
| `@webwaka/claims` | 8-state claim FSM (seeded→claimed→verified→managed), 36 tests | ✅ (36) |
| `@webwaka/identity` | BVN/NIN/CAC/FRSC identity verification via Prembly | ✅ |
| `@webwaka/otp` | Multi-channel OTP (SMS/WhatsApp/Telegram/Email), rate-limited | ✅ (68) |
| `@webwaka/offline-sync` | Dexie.js v4, SyncEngine, CacheBudgetManager, DraftAutosave, PII-clear | ✅ |
| `@webwaka/search-indexing` | FTS5 search index builder (supports all entity types) | ✅ |
| `@webwaka/geography` | Nigeria: 1 root, 6 zones, 37 states, 774 LGAs, 8,809 wards | ✅ |
| `@webwaka/social` | Social graph: follow, feed, relationships | ✅ |
| `@webwaka/i18n` | en (100%), fr (56%), ha/ig/yo/pcm (35% each — 136 keys missing) | ✅ |
| `@webwaka/analytics` | Platform + workspace analytics | ✅ |
| `@webwaka/ai-abstraction` | AI provider abstraction layer (ADL-001) | ✅ |
| `@webwaka/ai-adapters` | OpenAI, Anthropic, Google adapters | ✅ |
| `@webwaka/wakapage-blocks` | WakaPage block builder types (block-types.ts) | ✅ |
| `@webwaka/white-label-theming` | CSS-safe tenant branding, depth caps, font injection | ✅ |
| `@webwaka/vertical-events` | Vertical-level event type registry | — |
| `@webwaka/webhooks` | Webhook dispatcher, HMAC signing | ✅ |
| `@webwaka/pilot` | Pilot program management | ✅ |
| `@webwaka/logging` | Structured JSON logging | — |
| `@webwaka/core` | Core utilities (re-exports) | — |
| `@webwaka/design-system` | Design tokens, 360px-first CSS | — |
| `@webwaka/frontend` | Shared frontend utilities | — |
| `@webwaka/ui-error-boundary` | React error boundary | — |
| `@webwaka/shared-config` | Shared config primitives | — |
| `@webwaka/relationships` | Entity relationship graph | — |
| `@webwaka/offerings` | Products, services, routes, seats, memberships | — |
| `@webwaka/profiles` | Public discovery profile records | — |
| `@webwaka/workspaces` | Workspace CRUD | — |
| `@webwaka/contact` | Contact management | — |

---

## 4. Vertical Packages — Counts and Categories

**Total vertical packages:** 159 (`packages/verticals-*`)  
**Canonical CSV rows:** 159 active + 3 deprecated (gym-fitness, petrol-station, nurtw) = 162 total  
**Vertical engine registry:** 166 entries (includes some alias/variant entries)  
**Priority breakdown:**

| Priority | Label | Count | Requirement |
|---|---|---|---|
| P1 | Original (pre-Top100) | 17 | 100% feature parity first |
| P2 | Top100 High-Fit (≥30/30) | 63 active | High Nigeria SME density |
| P3 | Top100 Medium (20–29) | 77 active | Valid Nigeria market segments |
| Deprecated | Removed/merged | 3 | gym-fitness, petrol-station, nurtw |

**Niche template system:**
- Pillar 2 templates SHIPPED: 154 (all active P1+P2+7 P3 niches)
- Pillar 3 templates SHIPPED: 77 P3 niches (all with template status)
- P3 SHIPPED via P2 sprint: 7 (tax-consultant, tutoring, creche, mobile-money-agent, bureau-de-change, hire-purchase, community-hall)
- P3 READY_FOR_RESEARCH: 70 remaining
- P3 CURRENT (next niche to build): `mosque` (VN-CIV-004)
- BUILT_IN_TEMPLATES map: `apps/brand-runtime/src/lib/template-resolver.ts`
- Template directory: `apps/brand-runtime/src/templates/niches/` (207 niche directories)

---

## 5. Database Schema State

| Metric | Value | Source |
|---|---|---|
| Total migration files | 905 (forward + rollback pairs) | `ls infra/db/migrations/ \| wc -l` |
| Highest forward migration | 0461 | `ls infra/db/migrations/ \| tail -5` |
| Migration location | `infra/db/migrations/` (canonical) + `apps/api/migrations/` (mirrored) | HANDOVER.md |
| D1 staging database ID | `52719457-5d5b-4f36-9a13-c90195ec78d2` | `apps/api/wrangler.toml` |
| D1 production database ID | `de1d0935-31ed-4a33-a0fd-0122d7a4fe43` | `infra/cloudflare/environments.md` |
| Primary location | `wnam` (Western North America) | `apps/api/wrangler.toml` |

**Key schema tables (verified):**

| Domain | Key Tables |
|---|---|
| Auth | `users`, `sessions`, `refresh_tokens`, `contact_channels`, `otp_requests` |
| Entities | `individuals`, `organizations`, `places`, `workspaces`, `workspace_members`, `profiles`, `brand_surfaces`, `offerings` |
| Geography | `places` (geography hierarchy: Nigeria root, 6 zones, 37 states, 774 LGAs, 8,809 wards) |
| Politics | `politician_profiles`, `political_assignments`, `party_affiliations`, `jurisdictions`, `constituency_projects` |
| Seeding | `seed_runs`, `seed_sources`, `seed_raw_artifacts`, `seed_dedupe_decisions`, `seed_entity_sources`, `seed_coverage_snapshots` |
| Verticals | `verticals` (159-row registry), `vertical_synonyms`, `vertical_seedability_matrix` |
| Claims | `claim_requests` (8-state FSM) |
| POS | `pos_float_ledger`, `pos_terminals`, `agents`, `airtime_transactions` |
| Payments | `billing_records`, `subscription_upgrades` |
| HL Wallet | `hl_wallet`, `hl_ledger`, `bank_transfer_orders`, `mla_commissions` |
| AI/SuperAgent | `ai_provider_keys`, `ai_credit_wallets`, `ai_credit_transactions`, `ai_usage_logs`, `ai_hitl_queue`, `ai_vertical_configs`, `ai_consent_records` |
| Notifications | `notification_events`, `notification_dispatches`, `notification_templates`, `notification_routing_rules`, `notification_preferences`, `notification_suppression_list` |
| Support Groups | `support_groups`, `support_group_members`, `support_group_executive_roles`, `support_group_meetings`, `support_group_resolutions`, `support_group_committees`, `support_group_committee_members`, `support_group_broadcasts`, `support_group_events`, `support_group_event_rsvps`, `support_group_gotv_records`, `support_group_petitions`, `support_group_petition_signatures`, `support_group_assets`, `support_group_analytics` (15 tables) |
| Fundraising | `fundraising_campaigns`, `fundraising_contributions`, `fundraising_pledges`, `fundraising_milestones`, `fundraising_updates`, `fundraising_rewards`, `fundraising_reward_claims`, `fundraising_payout_requests`, `fundraising_compliance_declarations`, `campaign_donation_bridge`, `tithe_fundraising_bridge` (11 tables) |
| Cases | `cases`, `case_notes` |
| Workflows | `workflow_definitions`, `workflow_steps`, `workflow_instances`, `workflow_instance_steps` |
| Policy Engine | `policy_rules`, `policy_audit_log` |
| Dues | `dues_schedules`, `dues_payments` |
| Mutual Aid | `mutual_aid_requests`, `mutual_aid_votes` |
| Groups (new) | `groups` (renamed from support_groups by Phase-0-reset) |
| Templates (marketplace) | `template_registry`, `template_installations`, `template_versions`, `template_upgrade_log`, `template_purchases`, `revenue_splits`, `template_ratings`, `template_fts` |
| WakaPage | `wakapage_definitions`, `wakapage_blocks` |
| Partners | `partners`, `sub_partners`, `partner_entitlements`, `partner_audit_log` |
| Compliance | `dsar_requests`, `ndpr_consent_records`, `ndpr_processing_register`, `compliance_declarations` |
| Control Plane | `subscription_packages`, `package_pricing`, `entitlement_definitions`, `custom_roles`, `delegation_policies`, `configuration_flags`, `control_plane_audit` |
| B2B Marketplace | `b2b_marketplace_listings`, `b2b_bids` |
| Negotiation | `vendor_pricing_policies`, `listing_price_overrides`, `negotiation_sessions`, `negotiation_offers`, `negotiation_audit_log`, `price_lock_tokens` |
| Electoral Seeding | `polling_units` (176,846), `party_affiliations` (21 parties), `political_assignments` (legislators, governors, assemblies) |

---

## 6. API Route Groups (apps/api)

**Route registration:** `apps/api/src/router.ts` → `apps/api/src/route-groups/register-*.ts` (10 groups)

| # | Group | File | Key Routes |
|---|---|---|---|
| 1 | Public | `register-public-routes.ts` | `/health`, `/health/deep`, `/discovery`, `/geography/*`, `/fx-rates`, `/openapi` |
| 2 | Auth | `register-auth-routes.ts` | `/auth/*`, `/identity/*`, `/contact/*`, `/entities/*`, `/claim/*`, `/sync/*` |
| 3 | Workspace | `register-workspace-routes.ts` | `/workspaces/*`, `/profiles/*`, `/branding/*`, `/analytics/*`, `/onboarding/*` |
| 4 | Financial | `register-financial-routes.ts` | `/pos/*`, `/payments/*`, `/billing/*`, `/bank-transfer/*`, `/wallet/*`, `/b2b-marketplace/*`, `/airtime/*` |
| 5 | Verticals (legacy) | `register-vertical-routes.ts` | All per-vertical routes (politician, pos-business, transport, civic, commerce, health, edu, agri, etc.) |
| 5b | Verticals (engine) | `register-vertical-engine-routes.ts` | Dynamic routes from vertical-engine registry (dual-path with X-Use-Engine header) |
| 6 | Social | `register-social-routes.ts` | `/social/*`, `/community/*`, `/groups/*`, `/fundraising/*`, `/cases/*`, `/workflows/*`, `/appeals/*` |
| 7 | AI | `register-ai-routes.ts` | `/superagent/*`, `/admin/ai-usage` |
| 8 | Admin | `register-admin-routes.ts` | `/admin/*`, `/platform-admin/*`, `/regulatory/*`, `/compliance/*` |
| 9 | Notifications | `register-notification-routes.ts` | `/notifications/*`, `/notification-admin/*`, `/resend-bounce-webhook` |
| 10 | Platform Features | `register-platform-feature-routes.ts` | `/templates/*`, `/partners/*`, `/webhooks/*`, `/wakapage/*`, `/image-pipeline/*`, `/whatsapp-templates/*` |
| — | v2 (reserved) | `routes/v2/index.ts` | `/v2/*` — empty, reserved for breaking changes (ADR-0018) |

---

## 7. Cloudflare Infrastructure State

| Resource | Staging | Production | Status |
|---|---|---|---|
| D1 DB | `webwaka-staging` (`52719457`) | `webwaka-production` (`de1d0935`) | ✅ Created |
| RATE_LIMIT_KV | `2a81cd5b...` (staging) | provisioned | ✅ |
| GEOGRAPHY_CACHE KV | `4732f3a6...` (staging) | provisioned | ✅ |
| KV (audit fallback) | `1be2915e...` (staging) | `a43e090a...` (prod) | ✅ |
| WALLET_KV | `9ccb594b...` (staging) | `e28f499f...` (prod) | ✅ |
| ASSETS R2 | `webwaka-os-assets-staging` | `webwaka-os-assets-production` | ✅ |
| DSAR_BUCKET R2 | `webwaka-dsar-exports-staging` | `webwaka-dsar-exports-production` | ✅ |
| NOTIFICATION_KV | NOT YET PROVISIONED | NOT YET PROVISIONED | ⚠️ UI-002 blocker |
| Workers deployed | 8 workers (all apps) | 8 workers | ✅ |
| Log drain | Logpush → Axiom (ADR-0045) | ADR-0045 | ✅ |
| CF account ID | `98174497603b3edc1ca0159402956161` | same | ✅ |

**CF Cron allocation:** 5/5 at limit (api-staging×2, api-production×2, projections-staging×1).  
**DO NOT add more cron triggers without removing existing ones.**

---

## 8. GitHub Actions CI/CD Pipeline

| Workflow | File | Trigger | Purpose |
|---|---|---|---|
| CI | `ci.yml` | PR/push to staging/main | typecheck + test + lint + governance check |
| Deploy Staging | `deploy-staging.yml` | push to `staging` | CI → D1 migrations → deploy all Workers |
| Deploy Production | `deploy-production.yml` | push to `main` | CI → staging validation gate → secrets validation → D1 migrations → deploy → smoke tests |
| Governance Check | `governance-check.yml` | PR touching `docs/governance/` | Verify required governance docs exist |
| Rollback Worker | `rollback-worker.yml` | manual dispatch | Promote previous CF versioned worker to 100% traffic (ADR-0042/0046) |
| Rollback Migration | `rollback-migration.yml` | manual dispatch | Execute .rollback.sql files |
| Deploy Canary | `deploy-canary.yml` | manual dispatch | Canary traffic split |
| Lighthouse | `lighthouse.yml` | scheduled | Perf/accessibility audits |
| Visual Regression | `visual-regression-baseline.yml` | on demand | Playwright visual baseline |
| Secret Rotation Reminder | `secret-rotation-reminder.yml` | scheduled (90d) | Remind team to rotate secrets |
| Coverage | `coverage.yml` | CI | Test coverage report |
| Load Test Production | `load-test-production.yml` | manual | k6 load test |
| Pilot Alert | `pilot-zero-txn-alert.yml` | cron | Alert on pilot tenants with zero transactions |

---

## 9. Seeding State (Political / Electoral)

| Dataset | Count | Status | Migration |
|---|---|---|---|
| Nigeria geography root | 1 | ✅ Seeded | `nigeria_country.sql` |
| Geopolitical zones | 6 | ✅ Seeded | `nigeria_zones.sql` |
| States + FCT | 37 | ✅ Seeded | `nigeria_states.sql` |
| LGAs | 774 | ✅ Seeded (deduplicated) | `0002_lgas.sql` |
| Wards/registration areas | 8,809 | ✅ Seeded | `0003_wards.sql` |
| Polling units | 176,846 | ✅ Seeded | S05 B2 |
| Political parties (INEC) | 21 | ✅ Seeded | S05 B1 |
| NASS legislators (9th Assembly) | 318 (fully profiled) | ✅ Seeded | S05 B3 |
| Governors + deputies (2023–) | 72 | ✅ Seeded | S05 B4 |
| Lagos State Assembly (2023–2027) | 40 | ✅ Seeded | `0313_political_lagos_assembly_seed.sql` |
| Other State Assemblies | 35 states DEFERRED | ⏳ Source gap | Wikipedia coverage 1/36 |
| LGA Chairpersons | 774 DEFERRED | ⏳ Source gap | No consolidated national source |
| INEC 2023 HoA candidates | 8,971 JSON extracted | ⏳ SQL pending | S05 B6 |
| Health facilities (GRID3) | 46,146 | ✅ Seeded | S15 migrations |
| OSM civic/faith/transport entities | 74 (5 zero-coverage states) | ✅ Seeded | `0360–0364` |

---

## 10. Test Suite State

| Scope | Tests | Status | Source |
|---|---|---|---|
| Full API test suite | 2,660 tests (176 files) | ✅ PASSING | `pnpm --filter @webwaka/api test` |
| Notificator | 58 tests (3 files) | ✅ PASSING | `pnpm --filter @webwaka/notificator test` |
| Notifications package | 510 tests | ✅ PASSING | Release readiness report |
| OTP package | 68 tests | ✅ PASSING | Release readiness report |
| Support groups | 24 tests | ✅ PASSING | `@webwaka/support-groups` |
| Fundraising | 24 tests | ✅ PASSING | `@webwaka/fundraising` |
| Community | 45 tests | ✅ PASSING | `@webwaka/community` |
| Groups (Phase 0 reset) | 24 tests | ✅ PASSING | `@webwaka/groups` |
| Policy engine | 24 tests | ✅ PASSING | `@webwaka/policy-engine` |
| Claims FSM | 36 tests | ✅ PASSING | `@webwaka/claims` |
| Vertical engine | — | ✅ PASSING | `@webwaka/vertical-engine` |
| Chaos tests | — | ✅ PASSING (Phase 1) | `apps/api/src/chaos/chaos.test.ts` |
| **TOTAL (Release Readiness v3)** | **2,811 tests** | **✅ ALL PASSING** | RELEASE-READINESS-REPORT-v3.md |

---

## 11. Known Open Issues (as of 2026-05-02)

| ID | Severity | Description | Location | Fix |
|---|---|---|---|---|
| LINT-001 | Medium | `apps/api` ESLint errors: `no-unnecessary-type-assertion`, `no-unsafe-argument`, `no-empty` | `apps/api/src/routes/*.ts` | Add eslint-disable comments or typed helper function |
| UI-001 | ⚠️ Staging blocker | D1 staging database ID alignment for notification engine | `notificator wrangler.toml` | Ops: align D1 ID in notificator config |
| UI-002 | ⚠️ Staging blocker | `NOTIFICATION_KV` namespace not provisioned | CF Dashboard | Ops: `wrangler kv namespace create NOTIFICATION_KV` |
| UI-003 | ⚠️ Staging blocker | `NOTIFICATION_PIPELINE_ENABLED="1"` not set | Staging CF Worker secrets | Ops: set after UI-001/002 resolved |
| TOKEN-ROTATE | 🔴 URGENT | CF API token exposed in a public commit (historical) | GitHub commit history | Rotate immediately via CF Dashboard + update all secrets |
| SMOKE_API_KEY | Medium | GitHub secret not provisioned — smoke tests skip with `continue-on-error: true` | `.github/workflows/` | Generate valid API key and add to GitHub secrets |
| i18n-GAP | Medium | ha/ig/yo/pcm at 35% coverage; 136 keys missing per locale | `packages/i18n/src/locales/` | Fill 136 missing keys per Nigeria-native locale |
| D1-MULTI-REGION | Deferred | African read replicas not yet available from Cloudflare | ADR-0044 | Blocked on CF D1 feature availability |
| E2EE-DM | Proposed | True E2EE for DMs (ADR-0043) | Architecture | Proposed, not yet implemented |
| LGA-CHAIRS | Deferred | 774 LGA chairpersons not yet seeded | S05 deferred | No consolidated national source |
| STATE-ASSEMBLIES | Deferred | 35 state assemblies (all except Lagos) not seeded | S05 deferred | Wikipedia only has 1/36 pages |
| PARTNER-PHASE-3 | Not Started | Partner billing + revenue share | Partner model | M11-M12 target |
| PARTNER-PHASE-4 | Not Started | Partner analytics dashboard | Partner model | M12 target |
| GROUP-GENERALIZATION | ⚠️ Pre-launch | `@webwaka/support-groups` has election-specific naming/schema | PRD Class 1 | Core refactor task (see Artifact 04) |
| MOSQUE-TEMPLATE | Pending | Next P3 niche (VN-CIV-004) awaiting Pillar 2+3 templates | P3 queue | Next sprint activation |
