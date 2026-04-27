# ADR-0041: WakaPage Architecture — Smart Profile / Public Page Builder

**Status:** Accepted — Phase 0 complete  
**Date:** 2026-04-27  
**Authors:** Platform Architecture (Phase 0 Director)  
**Supersedes:** None  
**Related:** ADR-0038 (Template Architecture), ADR-0039 (Entitlement Model), ADR-0040 (Analytics Strategy)

---

## Context

WakaPage is the native WebWaka smart profile and public page builder capability. The previous architecture report (`docs/strategy/webwaka-smart-profile-public-page-architecture-report.md`) defined its 18-section design. Phase 0 is the pre-implementation confirmation and foundation phase. This ADR locks the architectural decisions that Phase 0 validated and hardened.

The key question Phase 0 answers: **Can WakaPage be built on top of the current monorepo without creating new sources of truth for identity, analytics, routing, theming, or discovery?** Answer: **Yes — with the decisions below.**

---

## Decisions

### D1 — WakaPage is a native cross-pillar capability, not a standalone product

WakaPage is implemented as a shared WebWaka public-surface engine integrated across:
- **Pillar 1 (Ops)** — offerings, bookings, and POS data bind to page blocks
- **Pillar 2 (Brand)** — `apps/brand-runtime` renders the public surface; template resolver pipeline reused
- **Pillar 3 (Discovery)** — `apps/public-discovery` and `apps/tenant-public` share the identity anchor (profiles table)

WakaPage must NOT create duplicate sources of truth for: identity, analytics, offerings, themes, routing, or discovery.

### D2 — Package and module boundaries

| Domain | Package | Notes |
|--------|---------|-------|
| Block type contracts (types only) | `@webwaka/wakapage-blocks` | Phase 0 created. No renderer. |
| Profile service | `@webwaka/profiles` | Phase 0 implemented (BUG-P3-014 resolved). |
| Entitlement gating | `@webwaka/entitlements` | Extended with `wakaPagePublicPage` + `wakaPageAnalytics` booleans. |
| Page event types | `@webwaka/events` | `WakaPageEventType` added. |
| Public rendering | `apps/brand-runtime` | Phase 1: add `src/routes/wakapage.ts`. |
| CRUD API | `apps/api` | Phase 1: add `src/routes/wakapage/`. |
| Admin | `apps/platform-admin` | Phase 2: WakaPage moderation queue. |

### D3 — Source-of-truth discipline

| Concern | Source of truth | What NOT to do |
|---------|----------------|----------------|
| Identity | `profiles` table + `@webwaka/profiles` | Do not create a `wakapage_identities` table |
| Slug | `wakapage_pages.slug` (Phase 1 migration) | `profiles.slug` does NOT exist; do not add it to profiles |
| Theme/branding | `tenant_branding` + `@webwaka/white-label-theming` | Do not create per-page colour overrides table unless specifically needed |
| Offerings | `offerings` table + `@webwaka/offerings` | Do not copy offerings into block config JSON |
| Analytics | `analytics_snapshots` (M0242) via `apps/projections` | Do not build a new analytics table for WakaPage views |
| Template resolution | `template_render_overrides` + `template_installations` (existing) | Extend the resolver pipeline, do not bypass it |
| Discovery index | `search_entries` + FTS5 `search_fts` | Write page publication events into the existing search index |

### D4 — Entitlement strategy: extend PlanConfig booleans

**Decision:** Extend `PlanConfig` with two new boolean rights (implemented in Phase 0):

```typescript
wakaPagePublicPage: boolean  // starter+: activate a public WakaPage
wakaPageAnalytics: boolean   // growth+: access WakaPage analytics dashboard
```

**Why not a feature-key registry?** The existing `PlanConfig` boolean pattern is well-established, consistently applied across the codebase, and directly readable. A feature-key registry would be a new architectural primitive that requires broad adoption before being useful. The two WakaPage rights fit cleanly as boolean fields. If the platform eventually needs runtime-configurable feature flags (A/B testing, gradual rollouts), that is a separate infrastructure decision.

**Guards added:**
- `requireWakaPageAccess(ctx)` — throws if `wakaPagePublicPage = false`
- `requireWakaPageAnalytics(ctx)` — throws if `wakaPageAnalytics = false`
- `evaluateWakaPageAccess(ctx)` — non-throwing boolean
- `evaluateWakaPageAnalytics(ctx)` — non-throwing boolean

### D5 — Tenant-public vs brand-runtime boundary

**Decision:** `apps/tenant-public` is **not retired** in Phase 1. The two apps serve different scopes:

| App | Scope | WakaPage role |
|----|-------|--------------|
| `apps/tenant-public` | Tenant discovery marketplace (profiles list + single profile) | Remains unchanged for Phase 1 |
| `apps/brand-runtime` | Tenant brand surface (custom domain, full branded pages) | Phase 1: WakaPage public page rendered here |

WakaPage public pages (`/p/:slug` or custom domain `/:slug`) are served from `apps/brand-runtime`. The `apps/tenant-public` discovery marketplace continues to serve `/:tenantSlug` profile lists. They coexist without conflict.

**Phase 2 retirement consideration:** If WakaPage grows to fully replace the profile listing function in `apps/tenant-public`, a formal deprecation ADR will be written. Not in Phase 1.

### D6 — Analytics event strategy

WakaPage analytics follow the existing two-tier strategy:
1. **Event tier**: `WakaPageViewed`, `WakaPageBlockClicked`, `WakaPageLeadCaptured` events published via `@webwaka/events` to the event log
2. **Projection tier**: `apps/projections` worker aggregates events into `analytics_snapshots` (existing table, M0242)
3. **Query tier**: Workspace analytics accessed via `apps/api/src/routes/workspace-analytics.ts` which reads `analytics_snapshots`

Do NOT create a `wakapage_analytics` table or a separate analytics pipeline. The existing infrastructure handles it.

### D7 — Migration sequencing principles for Phase 1

Migrations must be sequential, atomic, and rollback-safe. WakaPage Phase 1 requires:

1. `0419_wakapage_pages.sql` — core page entity table (`wakapage_pages`)
2. `0420_wakapage_blocks.sql` — block rows with config_json
3. `0421_wakapage_leads.sql` — lead capture records (NDPR: data-subject-rights route required)
4. `0422_wakapage_audience.sql` — audience/subscriber records (optional, Phase 1 stretch)

Each migration must have a `.rollback.sql` (enforced by `check-rollback-scripts` governance check).

### D8 — Caching strategy

WakaPage public pages are rendered at the edge (Cloudflare Workers) and cached with these rules:

| Page state | Cache-Control |
|-----------|--------------|
| Published, no personalisation | `public, s-maxage=300, stale-while-revalidate=600` (5 min edge TTL) |
| Draft / preview | `no-store` |
| Post-publish | Purge via `CF-Cache-Tag: wakapage:{pageId}` |
| Analytics events | Never cached (`POST /analytics/events`) |

**Rationale (Nigeria First):** 5-minute edge cache dramatically reduces latency for low-bandwidth users on mobile networks. The platform already uses this pattern for `apps/brand-runtime` branded pages.

### D9 — What Phase 1 must NOT do

- Build analytics dashboards
- Build QR campaign features
- Build discovery integration features
- Build `apps/tenant-public` profile-listing replacement
- Build audience/CRM flows (Phase 2)
- Create new sources of truth for identity, themes, or offerings

---

## Phase 0 Findings Ledger

| # | Item | Finding | Evidence | Action | Status |
|---|------|---------|---------|--------|--------|
| F01 | `@webwaka/profiles` stub (BUG-P3-014) | CONFIRMED STUB — type-only, no D1 service | `packages/profiles/src/index.ts` (pre-Phase-0) | Implemented D1-backed service in Phase 0 | RESOLVED |
| F02 | `profiles.slug` column existence | DOES NOT EXIST — no migration adds a slug column to profiles | All migration files scanned | WakaPage slugs stored in `wakapage_pages.slug` (Phase 1) | RESOLVED |
| F03 | `blog_posts` migration existence | NO MIGRATION FILE — route code had `try/catch` with 'table may not exist' | `apps/brand-runtime/src/routes/blog.ts` line 57 | Created `0417_blog_posts.sql` | RESOLVED |
| F04 | `template_render_overrides` migration number | CONFIRMED 0228 | `infra/db/migrations/0228_template_render_overrides.sql` | No action needed | VERIFIED |
| F05 | Canonical booking slot table name | CONFIRMED `ai_schedule_slots` (not `schedule_slots`) | `infra/db/migrations/0391_ai_agent_tables.sql`, `packages/superagent/src/tools/create-booking.ts` | Architecture report corrected | VERIFIED |
| F06 | `template_installations` structure | CONFIRMED: `id, tenant_id, template_id (FK), template_version, installed_at, installed_by, status, config_json, UNIQUE(tenant_id, template_id)` | `infra/db/migrations/0207_create_template_installations.sql` | No action needed | VERIFIED |
| F07 | Profiles column drift (DRIFT-P3-001) | CRITICAL: routes query `entity_type, entity_id, place_id, profile_type, claim_status, avatar_url, headline, content` — no confirmed migration | All migrations scanned; gap 0394–0413 exists | Created `0418_profiles_extended_columns.sql` | RESOLVED |
| F08 | `search_fts` vs `search_entries` | `search_fts` is FTS5 virtual table backed by `search_entries`; both must be kept in sync | `infra/db/migrations/0008_init_search_index.sql` | Architecture report corrected | VERIFIED |

---

## Consequences

**Positive:**
- BUG-P3-014 resolved: `@webwaka/profiles` is a real D1-backed service package
- Entitlement model is minimal, consistent, and gating-ready for Phase 1
- `WakaPageEventType` is in the canonical event catalogue
- MVP block type contracts are defined with strict TypeScript types
- Missing migrations (blog_posts, profiles extended columns) are now created
- All Phase 0 ambiguities are resolved with evidence

**Negative/Risks:**
- Migration 0418 (profiles extended columns) documents pre-existing drift; it is additive and safe but requires careful QA of existing profile routes after application
- `apps/tenant-public` profile queries may still have runtime errors if applied to a DB without migration 0418 — routes should be tested against a migration-applied schema before Phase 1

**Neutral:**
- `apps/tenant-public` is not retired in Phase 1 — two public surfaces coexist (discovery vs WakaPage)
- Feature-key registry is explicitly deferred to a future ADR if ever needed

---

## Alternatives Considered

### Alt A: Feature-key registry for WakaPage entitlements
Rejected. Too much new infrastructure for two boolean flags. Revisit if 10+ feature flags are needed in a single module.

### Alt B: New `apps/wakapage` dedicated Worker
Rejected. WakaPage rendering belongs in `apps/brand-runtime` (Pillar 2 brand surface). A new Worker creates redundant routing infrastructure.

### Alt C: `profiles.slug` as the WakaPage URL source
Rejected. `profiles.slug` does not exist as a database column (Phase 0 finding F02). A separate `wakapage_pages.slug` is cleaner and avoids coupling the discovery record to the public page URL.

---

*Phase 0 complete. See Phase 0 execution report for full verification details.*
