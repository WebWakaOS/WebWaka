# WebWaka OS — Packages Map

**Date:** 2026-05-03  
**Branch:** `staging`  
**Total packages:** 212 (37 platform + 175 vertical)

---

## Platform Shared Packages (37)

| Package | Purpose | Status | Notes |
|---------|---------|--------|-------|
| `@webwaka/auth` | JWT, PBKDF2, role hierarchy, guards | ✅ Mature | Used everywhere |
| `@webwaka/auth-tenancy` | Tenant resolution, tenant context | 🔴 **STUB** (`export {}`) | Must be fixed |
| `@webwaka/core` | Shared primitives | — | Referenced in ARCHITECTURE.md |
| `@webwaka/entities` | Canonical entity definitions | ✅ Active | |
| `@webwaka/entitlements` | Plan config, evaluation, guards | ✅ Mature | Has DB-first path via control-plane |
| `@webwaka/control-plane` | Dynamic plans/entitlements/roles/flags/delegation | ✅ Complete | Wave 3 delivered |
| `@webwaka/ai-abstraction` | Provider-neutral AI routing, BYOK | ✅ Active | Circuit breaker, retry, BYOK |
| `@webwaka/ai-adapters` | Provider fetch adapters | ✅ Active | P7: fetch only, no SDK |
| `@webwaka/superagent` | Full agent loop, HITL, consent, compliance | ✅ Mature | Sessions, tools, credit burn |
| `@webwaka/analytics` | Analytics aggregation | ✅ Active | |
| `@webwaka/cases` | Case management FSM | ✅ Active | |
| `@webwaka/claims` | Claim workflow FSM (8 states) | ✅ Mature | |
| `@webwaka/community` | Community spaces, channels, moderation | ✅ Active | |
| `@webwaka/contact` | Multi-channel contact, OTP | ✅ Active | |
| `@webwaka/design-system` | UI tokens, shared patterns | ⚠️ Stub (.gitkeep) | Needs implementation |
| `@webwaka/events` | Event publishing / domain events | ✅ Active | |
| `@webwaka/fundraising` | Fundraising campaigns | ✅ Active | |
| `@webwaka/groups` | User groups, group roles | ✅ Active | Renamed from support-groups |
| `@webwaka/groups-civic` | Civic group extensions | ✅ Active | |
| `@webwaka/groups-cooperative` | Cooperative group extensions | ✅ Active | |
| `@webwaka/groups-electoral` | Electoral group extensions | ✅ Active | |
| `@webwaka/groups-faith` | Faith community extensions | ✅ Active | |
| `@webwaka/hl-wallet` | HandyLife wallet operations | ✅ Active | Feature-flagged |
| `@webwaka/i18n` | Internationalization strings | ✅ Active | en only complete |
| `@webwaka/identity` | BVN/NIN KYC, FRSC/CAC | ✅ Active | CBN compliance |
| `@webwaka/ledger` | Float/general ledger primitives | ✅ Active | |
| `@webwaka/logging` | Structured logging | ✅ Active | |
| `@webwaka/negotiation` | Negotiable pricing FSM | ✅ Active | min_price_kobo opaque |
| `@webwaka/notifications` | Notification engine | ✅ Mature | Templates, rules, channels, digest |
| `@webwaka/offerings` | Products, services, routes | ✅ Active | |
| `@webwaka/offline-sync` | Dexie.js, SyncEngine, conflict resolution | ✅ Mature | 66 tests |
| `@webwaka/otp` | OTP generation, verification | ✅ Active | |
| `@webwaka/payments` | Paystack integration, subscription sync | ✅ Active | |
| `@webwaka/pilot` | Pilot rollout, A/B flags | ✅ Active | Bridge to FlagService |
| `@webwaka/policy-engine` | Policy evaluation engine | ✅ Active | New (migration 0434) |
| `@webwaka/search-indexing` | Search facets, FTS5 | ✅ Active | |
| `@webwaka/social` | Social profiles, posts, DMs, feed | ✅ Active | |
| `@webwaka/vertical-engine` | Configuration-driven vertical CRUD+FSM | ✅ Active | Parity tests passing |
| `@webwaka/verticals` | Shared vertical types + manifest validator | ✅ Active | |
| `@webwaka/wakapage-blocks` | WakaPage block types | ✅ Active | |
| `@webwaka/webhooks` | Webhook subscriptions, delivery | ✅ Active | |
| `@webwaka/white-label-theming` | Brand config, CSS var generation | ✅ Active | depth-cap enforced |
| `@webwaka/workspaces` | Workspace management | ✅ Active | |
| `@webwaka/workflows` | Workflow engine | ✅ Active | |
| `@webwaka/support-groups` | LEGACY — renamed to groups | ⚠️ Deprecated | Cleanup needed |

---

## Vertical Packages (175) — The Explosion

All under `packages/verticals-*`. Each represents one business type with its own:
- `src/` directory with schema types and repository
- `package.json` with `@webwaka/verticals-[name]` identifier
- Mounted in `apps/api/src/route-groups/register-vertical-routes.ts`

**Key verticals (sample):**

| Vertical | Package | Pillar | Status |
|----------|---------|--------|--------|
| POS Business | `verticals-pos-business` | P1 | ✅ Full (inventory, sales, CRM) |
| Restaurant | `verticals-restaurant` | P1+P3 | ✅ Active |
| Clinic | `verticals-clinic` | P1+P3 | ✅ Active |
| Politician | `verticals-politician` | P3 | ✅ Active |
| Farm | `verticals-farm` | P1+P3 | ✅ Active |
| Hotel | `verticals-hotel` | P1+P3 | ✅ Active |
| School (private) | `verticals-private-school` | P1+P3 | ✅ Active |
| Church | `verticals-church` | P3 | ✅ Active |
| Mosque | `verticals-mosque` | P3 | ✅ Active |
| Fuel Station | `verticals-fuel-station` | P1+P3 | ✅ Active |
| Law Firm | `verticals-law-firm` | P1 (L3 HITL) | ✅ Active |

**Vertical Engine migration status:**
- Parity testing framework: ✅ operational
- Phase 1 parity results: documented in `packages/vertical-engine/test-reports/`
- Engine adoption: In progress (parallel coexistence strategy)
- Target: Absorb verticals in batches as parity tests pass; reduce 175 packages over time

---

## Design System Status

| Package | Status |
|---------|--------|
| `@webwaka/design-system` | ⚠️ STUB — `.gitkeep` only, no tokens, no components |
| CSS variables | Used in workspace-app via `--ww-*` custom properties but not in a published package |
| Shadcn/ui components | NOT used (this is a Cloudflare Workers platform, not a standard React stack) |

**Recommendation:** The design system package needs actual tokens and shared patterns. The `--ww-*` CSS variables in workspace-app should be extracted and centralized.
