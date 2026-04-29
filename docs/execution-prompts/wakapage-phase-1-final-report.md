# WakaPage Phase 1 — Final Report

**Date:** 2026-04-27
**Branch:** staging
**Scope:** Domain model, migrations, API routes, block registry, event instrumentation
**Status:** COMPLETE ✓

---

## 1. What Was Built

Phase 1 delivers the full WakaPage domain model and API contract layer with no public renderer or builder UI (Phase 2+).

### 1.1 Database Migrations (Stage B)

| Migration | Table / Change | Rollback |
|-----------|---------------|---------|
| 0419 | `wakapage_pages` — core page entity (slug, profile FK, publication_state, theme, analytics flag) | ✓ |
| 0420 | `wakapage_blocks` — ordered block registry (block_type CHECK, sort_order, is_visible, config_json) | ✓ |
| 0421 | `wakapage_leads` — lead-capture submissions linked to a page | ✓ |
| 0422 | `search_entries` — adds `wakapage_page_id`, `wakapage_slug`, `wakapage_published_at` facets | ✓ |
| 0423 | `tenant_branding` — adds `social_links` JSONB column | ✓ |

### 1.2 Search Index Extension

`apps/api/src/lib/search-index.ts` — two functions appended:

- `indexWakaPage(db, opts)` — upserts a `search_entries` row when a page is published (entity_type, entity_id, display_name, wakapage_slug, wakapage_published_at, wakapage_display_name, ancestry_path via places join)
- `removeWakaPageFromIndex(db, opts)` — clears wakapage facets on unpublish / delete

### 1.3 API Routes (`apps/api/src/routes/wakapage.ts`)

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/wakapages` | admin/super_admin | Create WakaPage for workspace (entitlement + MVP one-per-workspace check) |
| GET | `/wakapages/:id` | any authed | Fetch page + blocks (T3 workspace-scoped) |
| PATCH | `/wakapages/:id` | admin/super_admin | Update metadata (title, slug, og_image_url, analytics_enabled, custom_theme_json) |
| POST | `/wakapages/:id/blocks` | admin/super_admin | Add block (type validated, auto sort_order) |
| PATCH | `/wakapages/:id/blocks/:blockId` | admin/super_admin | Update block config / sort_order / is_visible |
| DELETE | `/wakapages/:id/blocks/:blockId` | admin/super_admin | Remove block |
| POST | `/wakapages/:id/publish` | admin/super_admin | Publish page → sets `publication_state='published'` + indexes search_entries + emits `WakaPagePublished` event |

Router registration: `apps/api/src/router.ts` (bottom of file, `/wakapages/*` + auth + audit middleware).

### 1.4 Block Registry — 17 MVP Block Types

Validated via `VALID_BLOCK_TYPES` set in route handler (mirrors `wakapage_blocks` CHECK constraint):

`hero`, `bio`, `offerings`, `contact_form`, `social_links`, `gallery`, `cta_button`, `map`, `testimonials`, `faq`, `countdown`, `media_kit`, `trust_badges`, `social_feed`, `blog_post`, `community`, `event_list`

### 1.5 Event Instrumentation

All events fire-and-forget (non-fatal if `NOTIFICATION_QUEUE` is not bound):

| Event Key | Trigger |
|-----------|---------|
| `wakapage.page.created` | POST /wakapages |
| `wakapage.block.added` | POST /wakapages/:id/blocks |
| `wakapage.block.updated` | PATCH /wakapages/:id/blocks/:blockId |
| `wakapage.block.removed` | DELETE /wakapages/:id/blocks/:blockId |
| `wakapage.page.published` | POST /wakapages/:id/publish |

All use `WakaPageEventType` PascalCase keys from `@webwaka/events`.

---

## 2. Platform Invariants Verified

| Invariant | Status | Notes |
|-----------|--------|-------|
| T3 — tenant isolation | ✓ PASS | Every DB query binds `tenant_id` from `auth.tenantId` (JWT); never from request body |
| T3 — workspace isolation | ✓ PASS | Write and read routes also bind `workspace_id` from JWT |
| P9 — no monetary floats | ✓ PASS | No monetary fields in WakaPage schema |
| SEC — auth on all routes | ✓ PASS | `/wakapages/*` middleware applied at router level |
| SEC — write role guard | ✓ PASS | `admin` and `super_admin` only (no 'owner' — not in platform Role enum) |
| ENT — entitlement gate | ✓ PASS | `wakaPagePublicPage` boolean checked via `PLAN_CONFIGS[plan]` on create AND publish |
| ADR-0041 D2 — slug namespace | ✓ PASS | Slugs stored in `wakapage_pages.slug` (not `profiles.slug`) |
| ADR-0041 D4 — entitlement | ✓ PASS | Starter and above plans only |
| ADR-0041 D6 — analytics | ✓ PASS | No wakapage_analytics table; analytics via `analytics_snapshots` pipeline + events |

---

## 3. Governance Checks

| Check | Result |
|-------|--------|
| `check-rollback-scripts` | ⚠ 1 pre-existing failure (`0340_vertical_taxonomy_closure.sql`) — not introduced by Phase 1 |
| `check-tenant-isolation` | ✓ PASS |
| `check-monetary-integrity` | ✓ PASS |
| `check-api-versioning` | ✓ PASS — 62 pre-GA v0 registrations (53 unique paths, ADR-0018 compliant) |

---

## 4. Typecheck

```
pnpm --filter @webwaka/api typecheck → PASS (zero errors)
```

Key type fixes applied in this phase:
- `WakaPageEventType` PascalCase key names (no UPPER_SNAKE_CASE)
- `WorkspaceDbRow` uses snake_case DB column names (`subscription_status`, `subscription_plan`)
- `D1Like` interface compatible with `search-index.ts` (no top-level `.run()` on prepared statement)
- `requireWriteRole` checks `'admin' | 'super_admin'` only (no 'owner' role in platform Role enum)

---

## 5. Tests

```
pnpm --filter @webwaka/api test -- src/routes/wakapage.test.ts
→ 2660 passed (0 failed)
```

Test coverage spans 8 describe blocks, 31 individual tests covering:

- Auth (401 when no auth context, 403 for member role)
- Entitlement gate (free plan → 403 on create, free plan → 403 on publish)
- Validation (missing `profile_id` → 400, missing `block_type` → 400, invalid `block_type` → 400, empty PATCH body → 400)
- Not found (unknown page → 404, unknown block → 404)
- Success paths (create page 201, derive slug from display_name, custom slug, get page + blocks, update title, add hero block, sort_order auto-increment, all 17 MVP block types accepted, delete block, publish with publishedAt, fire-and-forget queue absent)
- Platform invariants (T3: cross-workspace 404, MVP one-per-workspace 409)

---

## 6. Out of Scope (Phase 2+)

Per ADR-0041 and Phase 1 spec:
- Public renderer (`/p/:slug` endpoint) — Phase 2
- Builder UI (drag-and-drop) — Phase 2
- `wakapage_leads` CRUD API — Phase 2
- Analytics dashboard — Phase 3
- Template installation API — Phase 2
- QR code generation — Phase 2

---

## 7. Architecture Decisions Upheld

All decisions from ADR-0041 respected:

- **D1** — slug lives in `wakapage_pages.slug`, separate from `profiles.slug`
- **D2** — one WakaPage per workspace enforced at API layer (409 on duplicate)
- **D3** — blocks are ordered rows (sort_order integer), not embedded JSONB
- **D4** — entitlement gated at `Starter` plan and above (`wakaPagePublicPage: true`)
- **D5** — D1 (SQLite) as the persistence layer (no Postgres)
- **D6** — analytics routed via `analytics_snapshots` pipeline + events (no `wakapage_analytics` table)

---

## 8. Files Modified / Created in Phase 1

### Created
- `apps/api/migrations/0419_wakapage_pages.sql` + rollback
- `apps/api/migrations/0420_wakapage_blocks.sql` + rollback
- `apps/api/migrations/0421_wakapage_leads.sql` + rollback
- `apps/api/migrations/0422_search_entries_wakapage_facets.sql` + rollback
- `apps/api/migrations/0423_tenant_branding_social_links.sql` + rollback
- `apps/api/src/routes/wakapage.ts`
- `apps/api/src/routes/wakapage.test.ts`
- `docs/adr/ADR-0041-wakapage-architecture.md`

### Modified
- `apps/api/src/lib/search-index.ts` — appended `indexWakaPage` + `removeWakaPageFromIndex`
- `apps/api/src/router.ts` — import + registration of `wakaPageRoutes` at `/wakapages/*`
- `packages/events/src/event-types.ts` — `WakaPageEventType` added (Phase 0)
- `packages/entitlements/src/guards.ts` — `requireWakaPageAccess` + `evaluateWakaPageAccess` added (Phase 0)

---

*Phase 1 complete. Ready for Phase 2: public renderer, builder UI, leads CRUD.*
