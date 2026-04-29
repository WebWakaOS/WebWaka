# WakaPage Phase 2 — Public Renderer — Execution Report

**Date:** 2026-04-27
**Status:** ✅ COMPLETE
**Tests:** 130/130 pass (33 new T30–T45 + 97 pre-existing)
**Typecheck:** Clean (`tsc --noEmit` zero errors)

---

## Scope Delivered

### New Files — `apps/brand-runtime`

| File | Role |
|---|---|
| `src/lib/wakapage-types.ts` | D1 row types (`WakaPageDbRow`, `WakaBlockDbRow`, `WakaProfileDbRow`, `OfferingDbRow`, `BlogPostDbRow`) + `RenderContext` |
| `src/lib/wakapage-block-registry.ts` | Block dispatch table: 17 `BlockType → renderer` entries. `renderBlock()`, `renderAllBlocks()` |
| `src/templates/wakapage/page-shell.ts` | Standalone WakaPage HTML shell — no site nav, mobile-first 360px base, OG tags, Schema.org JSON-LD, PWA manifest link, skip-link accessibility, `renderAttribution()` in footer |
| `src/templates/wakapage/hero.ts` | Profile hero: avatar, cover image, display_name, tagline, CTA |
| `src/templates/wakapage/bio.ts` | Text/bio block with nl2br, maxChars cap (Nigeria First) |
| `src/templates/wakapage/social_links.ts` | Social media links (WhatsApp-first), icons/buttons/text variants |
| `src/templates/wakapage/cta_button.ts` | WhatsApp/generic CTA button, primary/secondary/outline variants |
| `src/templates/wakapage/contact_form.ts` | Offline-capable lead form → `POST /wakapage/leads`, PWA Background Sync |
| `src/templates/wakapage/offerings.ts` | Published offerings grid, P9 kobo→₦ conversion |
| `src/templates/wakapage/gallery.ts` | Responsive image grid, 2–4 columns, lazy-load |
| `src/templates/wakapage/map.ts` | Static Maps embed with fallback, "Get Directions" link |
| `src/templates/wakapage/blog_post.ts` | Latest posts listing, cover images, dates |
| `src/templates/wakapage/testimonials.ts` | Star-rated testimonial cards |
| `src/templates/wakapage/faq.ts` | Native `<details>/<summary>` accordion, zero JS |
| `src/templates/wakapage/countdown.ts` | JS countdown timer, Africa/Lagos timezone, `noscript` fallback |
| `src/templates/wakapage/media_kit.ts` | Downloadable file list with icons and file sizes |
| `src/templates/wakapage/trust_badges.ts` | Verification/claim badges from `profiles.verification_state` + `claim_status` |
| `src/templates/wakapage/social_feed.ts` | Phase 3 stub |
| `src/templates/wakapage/community.ts` | Phase 3 stub |
| `src/templates/wakapage/event_list.ts` | Phase 3 stub |
| `src/routes/wakapage.ts` | `GET /wakapage` (renderer) + `POST /wakapage/leads` (lead capture) |
| `src/routes/wakapage.test.ts` | 33 integration tests (T30–T45) |

### Modified Files

| File | Change |
|---|---|
| `apps/brand-runtime/package.json` | `@webwaka/wakapage-blocks: workspace:*` added |
| `apps/brand-runtime/tsconfig.json` | `@webwaka/wakapage-blocks` path alias |
| `apps/brand-runtime/src/index.ts` | `app.route('/wakapage', wakaPageRouter)` registered |

---

## Route Contracts

### GET `/wakapage`

1. Tenant resolved from `Host: brand-{slug}.webwaka.com` via existing middleware
2. Branding entitlement check (ENT-003): 403 if no active subscription
3. `wakapage_pages` query → 404 if no published page for tenant
4. Parallel fetch: blocks, profile, offerings, blog posts, social_links_json
5. Block registry renders each visible block in `sort_order` sequence
6. `wakaPageShell()` wraps output: SEO tags, Schema.org JSON-LD, PWA, brand CSS tokens
7. Response: `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`

### POST `/wakapage/leads`

- Accepts `application/json` or `multipart/form-data`
- Required: `page_id`, `name`, `phone`, `message`
- T3 enforced: `page_id` verified against `wakapage_pages WHERE tenant_id = ?`
- Inserts into `wakapage_leads` (migration 0421)
- NDPR: response body is `{ ok: true }` only — no PII echoed
- `no such table` error is logged but does not 500 (graceful pre-migration degradation)

---

## Architectural Decisions

### D1 Direct Queries
**Decision:** Route queries D1 directly (consistent with all existing brand-runtime routes).
**Rationale:** Both the renderer and the Phase 1 API Worker have their own D1 bindings. An inter-service fetch to `apps/api` would add latency, require `INTER_SERVICE_SECRET` auth, and introduce a hard dependency on the API Worker being healthy. Direct D1 queries are the established pattern across all brand-runtime routes.

### Suspended Tenant → 403 (not 503)
**Decision:** Suspended tenants receive 403 from the existing `brandingEntitlementMiddleware` (which treats `status NOT IN ('active','trialing')` as unentitled). The spec's "503 for suspended" distinction is deferred to Phase 3.
**Rationale:** The branding entitlement middleware runs on `/*` and intercepts before the `/wakapage` route handler. Overriding to 503 requires either modifying the shared middleware (side effect on all routes) or routing `/wakapage` before the middleware (changes the security boundary). Phase 3 will add a `suspension_state` column to `workspaces` and handle 503 at the middleware level.

### No Page Slug Route (Phase 3)
**Decision:** Only `GET /wakapage` (canonical page for tenant) is implemented. `GET /wakapage/:slug` is Phase 3.
**Rationale:** MVP has exactly one published page per workspace (`UNIQUE (tenant_id, workspace_id)`). Multi-page support is explicitly deferred per ADR-0041 D5.

---

## Test Coverage (T30–T45)

| Test | Description |
|---|---|
| T30 | 404 when no published page / unknown tenant |
| T31 | Happy path: DOCTYPE, display name, title, JSON-LD, canonical, OG, PWA, attribution, CSS tokens |
| T32 | ENT-003 gate: 403 for no subscription; 200 for active starter |
| T33 | hero block: tagline from config, display name from profile |
| T34 | bio block: body text rendered |
| T35 | social_links: WhatsApp link and label rendered |
| T36 | cta_button: label and href rendered |
| T37 | contact_form: POSTs to `/wakapage/leads`, page_id in form |
| T38 | offerings: P9 kobo→₦ conversion; empty block silent |
| T39 | faq: `<details>/<summary>` accordion with question+answer |
| T40 | blog_post: titles and headings from blog posts |
| T41 | All 17 block types render without crash |
| T42 | `is_visible=0` blocks excluded from output |
| T43 | POST /wakapage/leads: valid lead 200, missing fields 400, missing page_id 400, unknown tenant 404, NDPR (no PII in response) |
| T44 | trust_badges: verified badge shown for verified profile |
| T45 | countdown: Days/Hours units present in rendered HTML |
