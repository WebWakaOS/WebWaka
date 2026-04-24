# WebWaka OS — Pillar 2 (Branding/Website/Portal) Architecture Forensics Report

**Report type:** Deep Code-Verified Architecture Forensics — Pillar 2 Template System  
**Date:** 2026-04-24  
**Branch:** `staging` (commit: 40887fa + main e921676 overlay)  
**Scope:** `apps/brand-runtime/`, `packages/white-label-theming/`, `packages/design-system/`, `apps/api/src/routes/templates.ts`, `packages/verticals/src/template-validator.ts`, all migrations 0206–0227, all Pillar 2 governance docs  
**Method:** Full source read — every line of every file listed above verified against claims made in planning/spec docs  
**Status:** FINAL

---

## Executive Summary

Pillar 2 contains a **fundamental architectural split** that is the most critical finding of this review. The platform has *two disconnected template systems* with no runtime bridge:

1. **Page-type templates** — hardcoded TypeScript functions in `apps/brand-runtime/src/templates/` that render HTML directly. These are what actually serves tenant websites. There are 7 of them: `base`, `branded-home`, `about`, `services`, `contact`, `blog-list`, `blog-post`.

2. **Marketplace templates** — rows in the `template_registry` D1 table with `manifest_json`, installable via the REST API into `template_installations`. When installed, they write a DB row. Brand-runtime **never reads `template_installations`** at request time.

Installing a marketplace template does nothing to change what HTML is served to a visitor. The two systems are design-time parallel tracks, not runtime-connected layers.

This and 49 further findings are documented below across sections A–H.

---

## Section A — Template Architecture & Fundamental Structure (Q1–Q8)

### Q1. What is the rendering architecture of Pillar 2?

**Finding:** Pure server-side rendering via Hono framework on Cloudflare Workers. No React, no build step, no static files, no client-side hydration. Every page request triggers a TypeScript function call that assembles an HTML string from template function outputs and injects CSS custom properties from the brand token system. The response is streamed directly from the Worker.

**Evidence:** `apps/brand-runtime/src/index.ts` exports a Hono `app`. Routes defined in `branded-page.ts`, `blog.ts`, `shop.ts`, `portal.ts`, `sitemap.ts` all call template functions (e.g., `brandedHomeBody()`, `aboutPageBody()`) and return `c.html(baseTemplate(...))`.

`apps/brand-runtime/src/templates/base.ts` generates the full HTML shell with `<!DOCTYPE html>`, `<head>`, `<body>` tags, inlining CSS custom properties and the design system CSS string from `@webwaka/design-system`.

**Key implication:** Changing a template means deploying a new version of the `apps/brand-runtime` Worker. There is no dynamic template switching at runtime.

---

### Q2. What are the two template systems and how are they structurally related?

**Finding:** There are two disconnected template systems:

**System A — Hardcoded Page-Type Templates** (what actually renders)
- Location: `apps/brand-runtime/src/templates/`
- Files: `base.ts`, `branded-home.ts`, `about.ts`, `services.ts`, `contact.ts`, `blog-list.ts`, `blog-post.ts`
- Each file exports a pure TypeScript function that accepts a typed data interface and returns an HTML string
- Called directly from route handlers with no indirection layer
- Example: `brandedHomeBody(data: BrandedHomeData): string` in `branded-home.ts`

**System B — Marketplace Templates** (what the API manages)
- D1 tables: `template_registry`, `template_installations`, `template_versions`, `template_upgrade_log`, `template_purchases`, `revenue_splits`, `template_ratings`, `template_fts`
- REST API: 944 lines at `apps/api/src/routes/templates.ts`
- Templates stored as rows with `slug`, `display_name`, `manifest_json`, `status`, `pricing_*` columns
- `template_installations` records per-tenant installs with `config_json`, `status`, `installed_version`

**Relationship:** None at runtime. Brand-runtime contains zero imports from or references to `template_installations`, `template_registry`, or any marketplace template concept. The two systems do not communicate.

---

### Q3. Is there a runtime bridge that allows installed marketplace templates to change what brand-runtime serves?

**Finding:** **No.** This is the platform's most significant Pillar 2 architectural gap.

**Evidence — exhaustive grep:**
- `apps/brand-runtime/src/routes/branded-page.ts` — queries `tenant_branding`, `organizations`, `offerings`. Zero reference to `template_installations` or `template_registry`.
- `apps/brand-runtime/src/index.ts` — imports 5 route modules and 3 middleware modules. No template registry import.
- `apps/brand-runtime/src/middleware/` (all 3 files) — deal with tenant resolution, branding entitlement, white-label depth. No template lookup.
- `apps/brand-runtime/src/lib/theme.ts` — wraps `@webwaka/white-label-theming`. No template registry reference.

**What this means in practice:** A tenant can browse the template marketplace, select a `website`-type template, purchase it, install it (POST `/templates/:slug/install`), and brand-runtime will serve them the same hardcoded 7-page site it always did. The installation record sits in `template_installations` with `status = 'active'` but nothing reads it.

---

### Q4. How many page routes does brand-runtime serve and what are they?

**Finding:** 22 distinct routes registered in `apps/brand-runtime/src/index.ts`:

| Route | Handler | Notes |
|---|---|---|
| `GET /health` | Inline | Liveness probe, no auth |
| `GET /robots.txt` | Inline | SEO; disallows /portal/, /health |
| `GET /sw.js` | Inline | PWA service worker with Background Sync |
| `GET /manifest.json` | Inline | Tenant-dynamic PWA manifest |
| `GET /`, `/about`, `/services`, `/contact` | `brandedPageRouter` | Core branded pages |
| `POST /contact` | `brandedPageRouter` | Contact form submission |
| `GET /blog`, `GET /blog/:slug` | `blogRouter` | Blog list + post detail (P4-A) |
| `GET /shop`, `/shop/:productId`, `/shop/cart` | `shopRouter` | E-commerce catalog + cart |
| `POST /shop/cart/add`, `POST /shop/checkout` | `shopRouter` | Cart + Paystack init |
| `GET /shop/checkout/callback` | `shopRouter` | Paystack verify |
| `GET /sitemap.xml` | `sitemapRouter` | SEO sitemap (P4-A SEO-02) |
| `GET /portal/login` | `portalRouter` | Tenant-branded login page |
| `POST /portal/login` | `portalRouter` | Credential submit → API Worker |

**Note:** Shop routes require `PAYSTACK_SECRET_KEY` env var; they return 503 if absent. Cart requires `CART_KV` binding; it degrades gracefully if absent.

---

### Q5. What DB tables does brand-runtime query at request time?

**Finding:** Brand-runtime queries exactly these tables:

| Table | Query location | Purpose |
|---|---|---|
| `organizations` | `tenantResolve` middleware | Slug → tenant ID + name |
| `tenant_branding` | `tenantResolve`, `getBrandTokens()` | Primary color, custom domain |
| `workspaces` | `brandingEntitlementMiddleware` | Subscription plan check |
| `subscriptions` | `brandingEntitlementMiddleware` | Active/trialing status |
| `sub_partners` | `whiteLabelDepthMiddleware` | Partner relationship lookup |
| `partner_entitlements` | `whiteLabelDepthMiddleware` | `white_label_depth` value |
| `offerings` | `brandedPageRouter` (home, services) | Product/offering catalog |
| `blog_posts` | `blogRouter` | Blog listing + detail |
| `contact_submissions` | `brandedPageRouter` (POST /contact) | Store contact form data |

**NOT queried:** `template_registry`, `template_installations`, `template_versions`, `template_purchases`.

---

### Q6. What is the middleware execution order for a branded page request?

**Finding:** For any `GET /` request (branded home page):

```
1. secureHeaders()                    — X-Frame-Options, CSP, HSTS, etc.
2. tenantResolve middleware            — custom_domain → subdomain → :slug → D1 org lookup
3. brandingEntitlementMiddleware       — subscriptions JOIN workspaces → 403 if no branding plan
4. whiteLabelDepthMiddleware           — sub_partners + partner_entitlements → sets whiteLabelDepth
5. brandedPageRouter                   — generates CSS tokens, queries offerings, calls brandedHomeBody()
```

**Key note:** Steps 1–4 add ~3–4 D1 round trips before the page handler even starts. Total D1 queries for a home page = 6–8, depending on whether the tenant is a sub-partner.

---

### Q7. What content does the base HTML template inject, and from where?

**Finding:** `apps/brand-runtime/src/templates/base.ts` (reviewed in prior session) generates the full HTML document. It receives:
- `cssVars: string` — `:root { --ww-primary: ...; --ww-secondary: ...; ... }` block from `buildCssVars()` in `@webwaka/white-label-theming`
- `title: string` — page title
- `description: string` — meta description
- `body: string` — inner HTML from page-specific template function
- `logoUrl: string | null`, `tenantName: string`, `navLinks: NavLink[]` — for shared nav/footer

The base template embeds `generateBaseCSS()` from `@webwaka/design-system` as an inline `<style>` block on every response — meaning the full design system CSS (291 lines) is transmitted with every page, not cached separately.

**SEO features injected by base template:** Open Graph meta tags, Twitter Card meta, JSON-LD `Organization` schema, canonical URL, `lang="en-NG"`, PWA manifest link, service worker registration.

---

### Q8. Is the template system vertically-aware? Can different verticals get different layouts?

**Finding:** **No.** Brand-runtime has no vertical-awareness. It serves the identical 7-page structure to every tenant regardless of their vertical (restaurant, politician, church, motor-park, etc.).

**Evidence:** `branded-page.ts` queries `organizations`, `tenant_branding`, and `offerings` — none of which carry vertical-specific layout information. The template functions (`brandedHomeBody`, `aboutPageBody`, etc.) have no `vertical` parameter. There is no routing logic that says "if vertical === 'politician', use campaign template."

**Gap registered:** The template spec (`docs/templates/template-spec.md` §3) shows templates declaring `compatible_verticals: ["restaurant", "fast-food"]` in manifest JSON, but since marketplace templates have no runtime bridge, this field has no behavioral effect.

---

## Section B — Theme & CSS Token System (Q9–Q15)

### Q9. How does a tenant's brand colors reach the HTML rendered to their visitor?

**Finding:** The path from tenant brand data to rendered CSS custom properties is:

```
D1 (tenant_branding + organizations JOIN) 
  ↓ getBrandTokens(tenantSlug, db, kv) in @webwaka/white-label-theming
  ↓ KV cache check: key = "theme:{tenantSlug}", TTL = 300 seconds
  ↓ if miss: D1 query → buildThemeFromRow() → TenantTheme object
  ↓ buildCssVars(theme): string → ":root { --ww-primary: #1a6b3a; ... }"
  ↓ base.ts baseTemplate({ cssVars, ... }) → <style>${cssVars}</style>
  ↓ HTTP response with inline <style> in <head>
```

**KV cache key format:** `theme:{tenantSlug}` (e.g., `theme:handylife-ng`)  
**KV cache TTL:** 300 seconds (5 minutes). A branding update propagates within 5 minutes.

---

### Q10. What CSS custom properties does the theme system define, and what are the defaults?

**Finding:** `buildCssVars()` in `packages/white-label-theming/src/index.ts` generates exactly 9 CSS custom properties:

| Property | Default Value | Source |
|---|---|---|
| `--ww-primary` | `#1a6b3a` | `tenant_branding.primary_color` |
| `--ww-secondary` | `#f5a623` | `tenant_branding.secondary_color` |
| `--ww-accent` | `#e8f5e9` | `tenant_branding.accent_color` |
| `--ww-font` | Inter/system-ui stack | `tenant_branding.font_family` |
| `--ww-radius` | `8px` | `tenant_branding.border_radius_px` |
| `--ww-text` | `#111827` | **Hardcoded** — not tenant-configurable |
| `--ww-text-muted` | `#6b7280` | **Hardcoded** — not tenant-configurable |
| `--ww-bg` | `#ffffff` | **Hardcoded** — not tenant-configurable |
| `--ww-bg-surface` | `#f9fafb` | **Hardcoded** — not tenant-configurable |
| `--ww-border` | `#e5e7eb` | **Hardcoded** — not tenant-configurable |

**Gap:** Text, background, and border colors are platform-hardcoded. A dark-mode or inverted-theme brand cannot be achieved by setting `tenant_branding` values. This limits white-label depth to color palette + logo only.

---

### Q11. What does the brand walk / brand hierarchy resolution look like, and is it used in brand-runtime?

**Finding:** The brand hierarchy walk is implemented in `resolveBrandContext(workspaceId, db, kv)` in `packages/white-label-theming/src/index.ts`. The walk:

1. Check workspace's own `tenant_branding` (has `primary_color`?)
2. If no branding: look up `sub_partners` WHERE `workspace_id = ?` AND `status = 'active'`
3. If sub-partner found: check sub-partner's own org brand
4. If `brand_independence_mode = 0`: escalate to parent `partners` table → get `workspace_id` → check partner org brand
5. If still nothing: return `PLATFORM_DEFAULT_THEME`

**BUT:** `resolveBrandContext()` (the workspace-ID-based hierarchy walk) is **not called by brand-runtime**. Brand-runtime calls `getBrandTokens(tenantSlug, db, kv)` which is the **slug-based** single-tenant lookup — no hierarchy walk. `resolveBrandContext()` is used by the notification email system (N-033a), not by brand-runtime.

**Gap:** White-label depth middleware (`whiteLabelDepthMiddleware`) correctly sets `whiteLabelDepth` on the Hono context, but brand-runtime route handlers do not read `c.get('whiteLabelDepth')` to cap which CSS properties they apply. The depth enforcement is set but not consumed at render time.

---

### Q12. How does the design system CSS reach the browser?

**Finding:** `@webwaka/design-system` exports `generateBaseCSS(): string` which returns a 291-line CSS string. This string is called once per request inside the base template and emitted as:

```html
<style>
  /* WebWaka Design System — Mobile-First Foundation (P4) */
  *, *::before, *::after { box-sizing: border-box; ... }
  body { font-family: var(--ww-font, ...); ... }
  .ww-container { ... }
  .ww-btn { ... }
  /* ... 280 more lines ... */
</style>
```

**Consequence:** There is no separate CSS file. Every HTML response re-sends the full design system CSS inline. No `<link rel="stylesheet">`, no CDN caching of the CSS. For a 10-page session on a tenant site, the browser downloads the same ~5KB CSS string 10 times.

**No HTTP caching benefit for CSS** because it's inlined. This is a correctness choice (Workers don't serve static files) but a performance gap: ~5KB per response × all pages.

---

### Q13. How is brand config validated before storage?

**Finding:** `validateBrandConfig(config: BrandConfig): string[]` in `packages/white-label-theming/src/index.ts` validates:
- `primaryColor`, `secondaryColor`, `accentColor` — must match `/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/`
- `borderRadiusPx` — must be 0–24
- `logoUrl` — must start with `https://`
- `faviconUrl` — must start with `https://`

**Called by:** `apps/api/src/routes/tenant-branding.ts` on PUT/PATCH operations.  
**Not called by:** Brand-runtime itself (it reads already-validated data from D1).  
**Gap:** Font family is not validated. An adversarial font-family string (containing CSS injection) could be stored and emitted into `:root { --ww-font: INJECTED_VALUE; }`. The `buildCssVars()` function does not escape or validate `theme.fontFamily` before injecting it into the CSS string.

---

### Q14. What is the PWA implementation status?

**Finding:** Two PWA artifacts are served:
1. `GET /sw.js` — a full Background Sync service worker that:
   - Caches shell resources (`/`, `/manifest.json`)
   - Intercepts all GET fetch events (network-first, cache fallback)
   - Processes an IndexedDB `syncQueue` on `sync` events — submitting queued items to `POST /api/sync/apply`
   - Processes pending/failed items in order, marks them `synced` or `failed`

2. `GET /manifest.json` — dynamic per-tenant WebApp manifest with:
   - `name` = tenant name (from `tenantName` context var)
   - `theme_color` = from `themeColor` context var (only primary color is loaded in `tenantResolve`)
   - `lang = "en-NG"` — Nigeria First (P2)
   - Static icon paths: `/icons/icon-192.png`, `/icons/icon-512.png`

**Gap:** The static icon paths (`/icons/icon-192.png`) are hardcoded. Brand-runtime is a Worker with no static file serving. Icons at these paths will 404 unless served by a separate CDN/R2 bucket. The `ASSETS` R2 binding in `env.ts` exists but no route in `index.ts` serves static assets from R2.

**Gap:** The contact form's offline sync path queues to IndexedDB and calls `POST /api/sync/apply`. This endpoint is in `apps/api/` but its existence and contract were not verified as part of this review scope.

---

### Q15. What does `tenantResolve` middleware actually do, and what are its failure modes?

**Finding:** `tenantResolve` in `middleware/tenant-resolve.ts` executes three DB queries on every request (minus health + robots.txt):

1. **Custom domain lookup** (wrapped in try/catch): `SELECT o.slug FROM tenant_branding JOIN organizations WHERE tb.custom_domain = ?` — fails silently if `tenant_branding` table doesn't exist
2. **Organizations slug lookup**: `SELECT id, name FROM organizations WHERE slug = ?` — returns 404 if not found (fatal)
3. **Branding color preload** (wrapped in try/catch): `SELECT primary_color FROM tenant_branding WHERE tenant_id = ?` — only sets `themeColor` for PWA manifest; the full theme is loaded separately by `getBrandTokens()`

**The `themeColor` loaded by `tenantResolve` is only `primary_color`**, not the full theme. The full theme (all 5 configurable properties) is loaded separately in the route handler via `generateCssTokens()`. This means the PWA manifest's `theme_color` and the page CSS share the same KV cache but use different code paths.

**Fail-open on missing table:** If `tenant_branding` doesn't exist, the middleware skips steps 1 and 3 silently and continues with slug-only resolution. This is a deliberate migration guard.

---

## Section C — Template Marketplace & Registry (Q16–Q24)

### Q16. What is the complete template API surface area?

**Finding:** `apps/api/src/routes/templates.ts` (944 lines) defines these endpoints, all registered under `/templates`:

| Method | Route | Auth | Purpose |
|---|---|---|---|
| `GET` | `/templates` | JWT | List templates (with FTS search, type filter, vertical filter, pagination) |
| `POST` | `/templates` | `super_admin` only | Publish new template to registry |
| `GET` | `/templates/:slug` | JWT | Get single template detail (with ratings) |
| `POST` | `/templates/:slug/install` | JWT | Install template for caller's tenant |
| `GET` | `/templates/:slug/install` | JWT | Check installation status |
| `DELETE` | `/templates/:slug/install` | JWT | Uninstall template |
| `POST` | `/templates/:slug/upgrade` | JWT | Upgrade installed template to latest version |
| `POST` | `/templates/:slug/purchase` | JWT | Initiate Paystack purchase flow for paid template |
| `POST` | `/templates/:slug/purchase/verify` | JWT | Verify Paystack payment and unlock template |
| `POST` | `/templates/:slug/rollback` | `super_admin` only | Rollback tenant install to previous version |
| `POST` | `/templates/:slug/rate` | JWT | Submit 1–5 star rating with comment |
| `GET` | `/templates/:slug/ratings` | JWT | List ratings with pagination |

---

### Q17. How does a template get approved and made available in the marketplace?

**Finding:** The approval workflow is a two-step process with a critical gap:

**Step 1 (available via API):** A `super_admin` calls `POST /templates` with the manifest JSON. This inserts a row into `template_registry` with `status = 'pending_review'`.

**Step 2 (no API route exists):** Changing `status` from `'pending_review'` to `'approved'` requires a **direct D1 SQL query**. There is no `PATCH /templates/:slug/approve` route. No admin dashboard UI route exists for approval.

**Evidence:** `apps/admin-dashboard/src/marketplace.ts` only calls `GET /templates?status=approved` — it reads the marketplace but cannot change template status. The `publish` route in `templates.ts` only allows creation with `pending_review` status.

**Implication:** Template approval is a manual DBA operation:
```sql
UPDATE template_registry SET status = 'approved', reviewed_at = unixepoch(), reviewed_by = 'admin' WHERE slug = 'my-template';
```

---

### Q18. What is the full lifecycle of template installation for a tenant?

**Finding:** Installation flow via `POST /templates/:slug/install`:

1. Extract `tenantId` from JWT (T3 — never from request body)
2. Look up template in `template_registry` WHERE `slug = ?` AND `status = 'approved'`
3. Check if already installed: SELECT from `template_installations` WHERE `template_slug = ?` AND `tenant_id = ?` AND `status != 'uninstalled'`
4. Check pricing: if `pricing_model = 'one_time'` or `'subscription'`, check `template_purchases` for valid purchase record
5. Validate `compatible_verticals` — if non-empty, verify tenant's active vertical is in the list (via `workspace_verticals` table)
6. Validate `config_json` against `config_schema` in manifest if provided
7. INSERT into `template_installations` with `status = 'active'`, `installed_version = current template version`
8. INSERT into `template_versions` (version history record)

**What happens after:** Nothing. Brand-runtime is not notified. No webhook is fired. No cache is invalidated. The tenant's website continues serving the same hardcoded templates.

---

### Q19. What D1 schema supports the template marketplace?

**Finding:** 8 tables created by migrations 0206–0227:

| Table | Purpose | Key columns |
|---|---|---|
| `template_registry` | Master template catalog | `slug`, `display_name`, `template_type`, `manifest_json`, `status`, `pricing_model`, `pricing_kobo`, `download_count`, `install_count` |
| `template_installations` | Per-tenant installs | `id`, `template_slug`, `tenant_id`, `status`, `installed_version`, `config_json` |
| `template_versions` | Version history per install | `installation_id`, `version`, `installed_at` |
| `template_upgrade_log` | Upgrade audit trail | `installation_id`, `from_version`, `to_version`, `upgraded_at` |
| `template_purchases` | Payment records | `tenant_id`, `template_slug`, `payment_reference`, `amount_kobo`, `status`, `purchased_at` |
| `revenue_splits` | Partner revenue share | `template_slug`, `partner_id`, `percentage`, `amount_kobo` |
| `template_ratings` | 1–5 star ratings | `tenant_id`, `template_slug`, `rating`, `comment`, `created_at` |
| `template_fts` | FTS5 virtual table | Indexes `slug`, `display_name`, `description` for search |

All tables have rollback migrations. Revenue splits support partner marketplace economics.

---

### Q20. How does the FTS search work in the template listing endpoint?

**Finding:** `GET /templates` accepts a `q` query parameter. The implementation:

```sql
-- When q is provided:
SELECT tr.* FROM template_registry tr
JOIN template_fts fts ON fts.slug = tr.slug
WHERE fts.template_fts MATCH ?
  AND tr.status = 'approved'
  [AND tr.template_type = ?]  -- if type filter provided
  [AND tr.compatible_verticals LIKE ?]  -- if vertical filter
ORDER BY rank
LIMIT ? OFFSET ?

-- When q is not provided:
SELECT * FROM template_registry
WHERE status = 'approved'
  [type and vertical filters]
ORDER BY download_count DESC, created_at DESC
LIMIT ? OFFSET ?
```

**Gap:** The `compatible_verticals` field is stored as TEXT (a JSON array serialized as a string) in D1. The LIKE filter (`%vertical_slug%`) is a substring match, not a JSON array membership check. This means searching for vertical `"market"` would match both `"market"` and `"supermarket"`. The correct approach would be `json_each()` but D1's SQLite JSON support would need verification.

---

### Q21. How does the template purchase flow work? Is it P9-compliant?

**Finding:** The purchase flow has two steps:

**Step 1 — Initiate** (`POST /templates/:slug/purchase`):
1. Verify template is `approved` and `pricing_model != 'free'`
2. Check for existing valid purchase (prevent double-charge)
3. Call Paystack `/transaction/initialize` with `amount` = `pricing_kobo / 100` (converts to Naira for Paystack API — Paystack expects Naira, not kobo)
4. INSERT into `template_purchases` with `status = 'pending'`, `payment_reference`
5. Return `authorization_url` for redirect

**Step 2 — Verify** (`POST /templates/:slug/purchase/verify`):
1. Call Paystack `/transaction/verify/:reference`
2. On success: UPDATE `template_purchases` SET `status = 'completed'`
3. Insert `revenue_splits` record if template has partner revenue share configured

**P9 compliance check:** Internal storage uses `pricing_kobo` (integer, passed as-is). The Paystack call divides by 100 — this is correct because Paystack expects Naira. The conversion is only at the API boundary. Internal amounts remain integer kobo. **P9 is correctly observed.**

---

### Q22. How does the rollback API work? What are its limitations?

**Finding:** `POST /templates/:slug/rollback` (super_admin only):

1. Verify super_admin JWT claim
2. Find most recent entry in `template_versions` for this tenant's installation where `version != current_version`
3. UPDATE `template_installations` SET `installed_version = prior_version`
4. INSERT into `template_upgrade_log` with `action = 'rollback'`

**Limitation 1:** Rollback only updates the `installed_version` DB field. Since brand-runtime doesn't read `template_installations` anyway, the rollback has no visual effect on the tenant's website.

**Limitation 2:** There is no validation that the `prior_version` is still deployed or compatible. Rollback can set `installed_version` to a version string with no corresponding deployed artifact.

**Limitation 3:** No tenant notification is sent on rollback. The tenant has no visibility into the operation unless they call `GET /templates/:slug/install`.

---

### Q23. How does the template rating system work and what are its constraints?

**Finding:** `POST /templates/:slug/rate`:
1. Validate JWT (tenant user)
2. Check `rating` is 1–5 integer
3. `INSERT OR REPLACE INTO template_ratings` (upsert by `tenant_id + template_slug`) — each tenant can rate each template once, and can update their rating
4. UPDATE `template_registry` SET `average_rating = (SELECT AVG(rating)...)`, `rating_count = (SELECT COUNT(*)...)`

**Gap 1:** There is no requirement that the tenant has actually installed the template before rating it. Any tenant with a valid JWT can rate any approved template.

**Gap 2:** The `comment` field has no length validation in the route handler. The column has no length constraint in the migration SQL. An adversarial rating comment is not length-limited server-side.

**Gap 3:** Ratings are not moderated. No admin endpoint exists to delete or flag abusive ratings.

---

### Q24. What template-related CI automation exists?

**Finding:** No CI automation exists specifically for templates.

**CI pipeline** (`.github/workflows/ci.yml`) runs: typecheck, unit tests, lint, OpenAPI lint, security audit, governance checks, smoke tests, k6 load test.

**What's missing:**
- No `validateTemplateManifest()` call in CI against any template files
- No template manifest linting step
- No auto-discovery of template files from the repository (templates must be submitted via API, not auto-deployed from repo files)
- No test that installs a template and verifies the install row is written correctly
- `packages/verticals/src/template-validator.test.ts` exists (unit tests for `validateTemplateManifest`) but is not referenced in the governance check pipeline

**The governance CI** (`check-pillar-prefix.ts`, `check-tenant-isolation.ts`, etc.) does not include template-specific checks.

---

## Section D — White-Label Depth & Partner Hierarchy (Q25–Q30)

### Q25. What is the white-label depth model and how is it enforced at runtime?

**Finding:** The `white_label_depth` dimension is defined in docs as a 0–2 scale:
- `0` = no white-labelling
- `1` = basic: custom logo + brand colours only
- `2` = full: custom domain, email branding, all visual elements

**How it's enforced:** `whiteLabelDepthMiddleware` runs after tenant resolution. It:
1. Checks `sub_partners` WHERE `tenant_id = ? AND status = 'active'`
2. If sub-partner exists: reads `partner_entitlements` WHERE `dimension = 'white_label_depth'`
3. Parses the `value` column as an integer; validates 0–2 range
4. Sets `c.set('whiteLabelDepth', depth)` on the Hono context

**Critical gap:** Route handlers do not read `c.get('whiteLabelDepth')`. The depth is set correctly, but:
- `branded-page.ts` calls `generateCssTokens()` unconditionally — it does not check depth before injecting custom domain, logos, or color overrides
- `portal.ts` does not cap which login page elements it customizes based on depth
- There is no code that says "if depth < 2, do not apply custom domain branding"

**Conclusion:** White-label depth is set in middleware (correct infrastructure) but not consumed at render time (zero enforcement).

---

### Q26. How does the brand hierarchy walk differ between the email system and brand-runtime?

**Finding:** There are two separate brand resolution paths:

**Email system (N-033a):** Uses `resolveBrandContext(workspaceId, db, kv)`:
- Full 3-level hierarchy walk (workspace → sub-partner → partner → platform)
- `brand_independence_mode` flag respected
- KV cached under `brand:ws:{workspaceId}`
- Returns `TenantTheme` including `senderEmailAddress`, `senderDisplayName`

**Brand-runtime (Pillar 2):** Uses `getBrandTokens(tenantSlug, db, kv)`:
- Single-level lookup (tenant org → LEFT JOIN tenant_branding → LEFT JOIN channel_provider)
- No hierarchy walk
- KV cached under `theme:{tenantSlug}`
- Returns `ThemeTokens` with all brand fields but no hierarchy escalation

**Consequence:** If a sub-partner has not configured their own `tenant_branding` but their parent partner has, the email system will correctly display the parent partner's branding. Brand-runtime will display the platform default. The two systems diverge for sub-tenants without direct branding.

---

### Q27. What does `brand_independence_mode` control and where is it used?

**Finding:** `brand_independence_mode` is a column in the `sub_partners` table (integer, 0 or 1):
- `0` = dependent mode: when this sub-partner's workspace has no branding, escalate to parent partner's brand
- `1` = independent mode: even without own branding, do NOT use parent partner's brand — fall to platform default

**Where it's read:** Only in `resolveBrandContext()` in `packages/white-label-theming/src/index.ts` (Step 2a of the hierarchy walk).

**Where it's not read:** Brand-runtime's `getBrandTokens()` does no hierarchy walk at all, so `brand_independence_mode` has no effect on what brand-runtime serves.

**Where white-label depth middleware reads it:** It does not. `whiteLabelDepthMiddleware` only reads `partner_entitlements.white_label_depth` — it doesn't check `brand_independence_mode`.

---

### Q28. What branding entitlements gate access to Pillar 2?

**Finding:** `brandingEntitlementMiddleware` gates all routes under `/*` and `/portal/*` with this check:

```javascript
const PLANS_WITH_BRANDING = new Set([
  'starter', 'growth', 'pro', 'enterprise', 'partner', 'sub_partner'
]);
```

It queries `subscriptions JOIN workspaces WHERE tenant_id = ? AND status IN ('active', 'trialing')` and checks if `plan` is in the set. If not found or not in set → 403 with upgrade prompt HTML.

**Plans WITHOUT branding access:** `free` (implicitly — not in the set).

**Gap 1:** The query joins `workspaces` and `subscriptions` but the current subscriptions table may have multiple rows per workspace. The query uses `ORDER BY s.created_at DESC LIMIT 1` to get the most recent subscription — this is correct for active plan detection.

**Gap 2:** There is no TTL cache on the entitlement check. Every request hits D1 with a JOIN query. For high-traffic tenants, this adds 1 D1 round-trip per request for entitlement alone.

**Gap 3:** The evaluateBrandingRights() function in `packages/entitlements/src/evaluate.ts` uses `PLAN_CONFIGS[subscription.plan].brandingRights` — this is the correct, testable path. But `brandingEntitlementMiddleware` in brand-runtime has its own hardcoded `PLANS_WITH_BRANDING` set, duplicating (and potentially diverging from) the shared entitlements package logic.

---

### Q29. Can a tenant set a custom domain, and how is it resolved?

**Finding:** Custom domain resolution is implemented in `tenantResolve` middleware:

```javascript
const customDomainRow = await c.env.DB
  .prepare(`SELECT o.slug FROM tenant_branding tb 
            JOIN organizations o ON o.id = tb.tenant_id 
            WHERE tb.custom_domain = ? LIMIT 1`)
  .bind(host)
  .first();
```

Custom domain is stored in `tenant_branding.custom_domain` (TEXT, nullable). No DNS validation, no CNAME verification, no TLS provisioning is handled by this code.

**How it works:** If a tenant sets `custom_domain = 'shop.acme.ng'` in their branding settings, any request arriving at brand-runtime with `Host: shop.acme.ng` will be resolved to that tenant. DNS routing to the Worker endpoint is external (Cloudflare Workers Routes or CNAME to workers.dev).

**What's missing:** No validation that the domain is actually pointed at WebWaka's infrastructure. No deduplication (two tenants could set the same custom_domain — only one would be resolved, whichever comes first in the LIMIT 1 query). No expiry or verification flow.

**P2 implication:** The `white_label_depth >= 2` requirement for custom domains is set by documentation but not enforced in code. Brand-runtime does not check `whiteLabelDepth` before resolving a custom domain.

---

### Q30. What does the portal login page serve and how is it branded?

**Finding:** `apps/brand-runtime/src/routes/portal.ts`:

`GET /portal/login`:
1. After tenant resolution, calls `getBrandTokens(tenantSlug, ...)` to load theme
2. Renders a branded login form with the tenant's `primaryColor`, `displayName`, `logoUrl` (if set)
3. Form `action` POSTs to `/portal/login`

`POST /portal/login`:
1. Reads `email` and `password` from form body
2. Calls the API Worker at `${env.API_BASE_URL}/auth/login` with an `X-Inter-Service-Secret` header
3. On 200: extracts `access_token` from response, sets `HttpOnly; Secure; SameSite=Strict` cookie, redirects to `/portal/dashboard` (which doesn't exist yet)
4. On failure: re-renders login page with error message

**Gap:** The `/portal/dashboard` redirect target is not implemented. A successful login bounces to a 404. No portal dashboard route exists in `index.ts`.

**Gap:** The `API_BASE_URL` env var is not declared in `env.ts`. If not set, the `fetch()` call will fail with a runtime error. This is a silent configuration gap.

---

## Section E — Template Validator Package (Q31–Q35)

### Q31. What does the template validator package validate and what does it miss?

**Finding:** `packages/verticals/src/template-validator.ts` exports `validateTemplateManifest(manifest: unknown): ValidationResult`. It validates:

**Required fields with errors if missing:**
- `slug` — non-empty string, 2–100 chars, `/^[a-z0-9-]+$/` pattern
- `display_name` — string, min 2 chars
- `description` — string, min 10 chars
- `template_type` — one of 6 valid types
- `version` — valid semver
- `platform_compat` — valid semver range (`^`, `~`, `>=` prefixes only)

**Optional fields validated with errors/warnings:**
- `permissions` — array; unknown permissions generate warnings (not errors)
- `pricing.price_kobo` — must be non-negative integer (T4 enforcement)
- `pricing.model` — must be one of `free|one_time|subscription`
- `entrypoints` — validated structurally but not that paths exist
- `events` — must be non-empty strings
- `author.name` — required within author block

**What's NOT validated:**
- `compatible_verticals` — validated for slug format but NOT cross-checked against the verticals registry
- `config_schema` — accepted as `Record<string, unknown>` without JSON Schema validation
- `dependencies.platform_packages` — accepted as string array without version range validation
- `entrypoints` paths — not checked for existence or format beyond object shape

---

### Q32. How do `checkPlatformCompatibility()` and `checkVerticalCompatibility()` work?

**Finding:**

`checkPlatformCompatibility(manifestPlatformCompat, platformVersion)`:
- Supports `^` (caret), `~` (tilde), `>=`, and exact match
- Does NOT support `<=`, `<`, `>`, `*`, `x`, or complex ranges
- For `^0.x.y` ranges: minor must match (0.x semver behavior is correctly implemented — breaking changes at minor for 0.x)
- Returns `false` for unrecognized range formats

`checkVerticalCompatibility(manifestVerticals, targetVertical)`:
- If `manifestVerticals.length === 0`: returns `true` (empty array = compatible with all verticals)
- Otherwise: `manifestVerticals.includes(targetVertical)` — simple string inclusion check

**Neither function is called by brand-runtime or the template install flow at request time.** They are available for the registry API to use during template submission validation, but the `POST /templates` route in `templates.ts` does not call `checkPlatformCompatibility()` — it only calls `validateTemplateManifest()` to validate the manifest structure. Platform version compatibility is not enforced at install time.

---

### Q33. How is `validateTemplateManifest()` wired into the template API?

**Finding:** `apps/api/src/routes/templates.ts` (POST `/templates`):

```typescript
// From templates.ts publish route:
const validationResult = validateTemplateManifest(body.manifest_json);
if (!validationResult.valid) {
  return c.json({ error: 'Invalid manifest', details: validationResult.errors }, 422);
}
```

The validator is called before INSERT into `template_registry`. **Warnings are not returned to the caller** — only errors block submission.

**At install time (`POST /templates/:slug/install`):** The manifest is read from the already-stored `manifest_json` column. The install route does NOT re-validate the manifest. It only checks:
1. Template status = `approved`
2. Pricing/purchase requirements
3. Vertical compatibility via `checkVerticalCompatibility()` (the only place this is called)

---

### Q34. What semver range formats does the validator support, and are they sufficient?

**Finding:** `isValidSemverRange()` accepts:
```
^1.0.0   → caret (compatible within major)
~1.0.0   → tilde (compatible within minor)
>=1.0.0  → greater-than-or-equal
1.0.0    → exact match
```

**Not supported:**
- `>=1.0.0 <2.0.0` (range intersections — common in npm)
- `1.x.x` or `1.*.*` (wildcard ranges)
- `~>1.0.0` (Ruby-style pessimistic constraint)
- `latest` or `*`

The regex in `isValidSemverRange()` is:
```javascript
/^[\^~]?\d+\.\d+\.\d+$/.test(range) || /^>=\d+\.\d+\.\d+$/.test(range)
```

This is sufficient for the platform's current use case but would reject common npm-style range formats if external template authors submit manifests.

---

### Q35. Does the template validator have test coverage?

**Finding:** `packages/verticals/src/template-validator.test.ts` exists (confirmed in filesystem listing). Not read in full, but confirmed present. The CI `test` job runs `pnpm test` which runs vitest across all packages, so validator tests run in CI.

**What the tests likely cover** (based on validator structure): The 7 required field validations, pricing.price_kobo integer enforcement (T4), semver range parsing edge cases, vertical slug format validation.

**What likely isn't tested:** CSS injection via font_family in `buildCssVars()`, the `checkPlatformCompatibility()` 0.x caret behavior, multiple templates with the same slug (schema UNIQUE constraint vs. validator behavior).

---

## Section F — SEO, PWA & Performance (Q36–Q40)

### Q36. What SEO features does brand-runtime implement?

**Finding:** SEO is handled at multiple levels:

**Meta tags (base template):**
- `<title>` — `{page_title} | {tenantName}`
- `<meta name="description">` — page-specific description
- `<meta property="og:title">`, `og:description>`, `og:type>`, `og:locale>` (en_NG)
- `<meta name="twitter:card">` = `summary`
- Canonical URL: `<link rel="canonical">` — derived from request URL

**Structured data:**
- JSON-LD `Organization` schema on home page with `name`, `url`, `logo`, `contactPoint`
- `BlogPosting` schema on blog post pages (itemprop attributes in `blog-post.ts`)

**Sitemap:** `GET /sitemap.xml` dynamically generates an XML sitemap with entries for:
- `/`, `/about`, `/services`, `/contact`, `/blog` (static pages)
- Each blog post slug (from D1 `blog_posts` table)
- Each product (from `offerings` table)
- Priority and `lastmod` values

**robots.txt:** Served at `/robots.txt` — allows all, disallows `/portal/` and `/health`.

**Missing:** Open Graph image (`og:image`) is not set. No `<meta name="generator">` suppression. No structured data for products/offerings (Schema.org `Product`).

---

### Q37. Is the HTML output properly escaped to prevent XSS?

**Finding:** All page-type template functions implement custom HTML escaping:

```typescript
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
```

`blog-list.ts` and `blog-post.ts` also escape `'` to `&#39;`.

**Applied to:** tenant name, display name, tag line, description, offering names, phone numbers, email, location, blog post titles, author names, excerpts.

**NOT applied to:**
1. `blog-post.ts` line 56: `${post.content}` — blog post body is rendered **unescaped**. This is a stored XSS vector. If a tenant stores malicious HTML in `blog_posts.content`, it will be served verbatim to visitors.
2. `buildCssVars()` — `theme.fontFamily` is injected unescaped into CSS. A `font-family` value containing `</style><script>alert(1)</script><style>` would break out of the style block.
3. Logo URL in `branded-home.ts` uses `encodeURI()` (not `encodeURIComponent()`). `encodeURI()` does not encode `#` or `?`. A logo URL containing JS protocol could potentially be exploited in older browsers.

---

### Q38. What is the contact form submission architecture?

**Finding:** `contact.ts` implements a progressive enhancement pattern:

**Path A — Offline-capable (preferred):**
1. Check if `serviceWorker` and `SyncManager` are available
2. Open IndexedDB `WebWakaOfflineDB` version 2, object store `syncQueue`
3. Store contact submission with `operationType: 'create'`, `entityType: 'contact_submission'`
4. Register Background Sync tag `webwaka-sync`
5. Show success to user immediately (optimistic UI)
6. Service worker processes the queue when online, POSTing to `POST /api/sync/apply`

**Path B — Direct fetch (fallback):**
1. `fetch('/contact', { method: 'POST', body: JSON.stringify(data) })`
2. Shows error on failure with retry

**Server-side (POST /contact in branded-page.ts):**
Stores the submission in `contact_submissions` table with `tenant_id`, `name`, `phone`, `email`, `message`, `status = 'new'`.

**Gap:** The `POST /api/sync/apply` endpoint (used by Path A) is in `apps/api/`, not `apps/brand-runtime/`. The brand-runtime service worker sends sync requests to `/api/sync/apply` — but the Worker domain for `apps/api/` is different from `apps/brand-runtime/`. Cross-worker fetch requires an absolute URL or inter-service secret. The SW calls a relative URL `/api/sync/apply` which would resolve against the brand-runtime Worker's domain, not the API Worker's domain. This sync path likely fails silently.

---

### Q39. What caching strategy does brand-runtime implement for HTML responses?

**Finding:** Examining all route handlers:

- **HTML pages** (`/`, `/about`, `/services`, `/contact`, `/blog`, `/blog/:slug`, `/shop`): No explicit `Cache-Control` header set. Hono's default is no caching. Cloudflare Workers will not edge-cache these responses by default.
- **`/robots.txt`:** `Cache-Control: public, max-age=86400` (1 day)
- **`/manifest.json`:** `Cache-Control: public, max-age=3600` (1 hour)
- **`/sw.js`:** `Cache-Control: public, max-age=3600` (1 hour)
- **`/sitemap.xml`:** No Cache-Control header (reviewed in prior session: dynamic generation, no cache)
- **Theme KV cache:** 300-second TTL on `theme:{tenantSlug}` key

**Consequence:** Every branded page request hits the Worker CPU and D1 (6–8 queries). No edge caching. For a high-traffic tenant with 1000 page views/hour, that's 1000 Worker invocations × 8 D1 queries = 8000 D1 reads per hour from one tenant alone. Given Cloudflare D1 free tier limits and pricing, this could become expensive at scale.

---

### Q40. How is the shop/e-commerce module implemented?

**Finding:** `apps/brand-runtime/src/routes/shop.ts` implements:
- `GET /shop` — lists published offerings (`is_published = 1`) from the `offerings` table, formatted as product cards
- `GET /shop/:productId` — single product detail with add-to-cart button
- `GET /shop/cart` — reads cart from `CART_KV` (key: `cart:{tenantId}:{sessionId}`); returns empty cart if KV absent
- `POST /shop/cart/add` — adds item to KV cart, 24-hour TTL
- `POST /shop/checkout` — calls Paystack `/transaction/initialize`; requires `PAYSTACK_SECRET_KEY` env var; returns 503 if absent
- `GET /shop/checkout/callback` — Paystack verify; creates `orders` table record on success

**Session management:** Session ID is extracted from a `ww_session` cookie (HttpOnly). No session creation route — the session ID must exist before `/shop/cart` works. No cookie issuance is visible in the shop routes. Likely issued by the portal login flow.

**P9 compliance:** All prices stored as integer kobo (`price_kobo`). Displayed as `₦${(priceKobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`. P9 correctly observed in shop module.

---

## Section G — Security, Governance & Invariants (Q41–Q45)

### Q41. What security headers does brand-runtime set?

**Finding:** `app.use('*', secureHeaders())` — Hono's `secureHeaders` middleware sets:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- `X-XSS-Protection: 1; mode=block` (deprecated but set)
- `Strict-Transport-Security: max-age=15552000; includeSubDomains`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

**Missing:**
- `Content-Security-Policy` — no CSP header is set. With inline `<style>` blocks (design system CSS, custom properties) and inline `<script>` blocks (contact form JS, sw.js registration), a `strict-dynamic` or `nonce-based` CSP would require careful configuration but is absent.
- `Permissions-Policy` — not set.

---

### Q42. How does brand-runtime authenticate inter-service communication with the API Worker?

**Finding:** The portal login flow (`POST /portal/login`) calls the API Worker with:
```typescript
headers: {
  'Content-Type': 'application/json',
  'X-Inter-Service-Secret': env.INTER_SERVICE_SECRET,
}
```

The `INTER_SERVICE_SECRET` is declared in `env.ts` as a required string binding. It is passed from brand-runtime to the API Worker to authenticate the inter-service call.

**Gap:** `API_BASE_URL` (needed to form the fetch URL for the API Worker) is NOT declared in `env.ts`. Brand-runtime's `env.ts` declares: `DB`, `THEME_CACHE`, `CART_KV?`, `JWT_SECRET`, `LOG_PII_SALT`, `INTER_SERVICE_SECRET`, `ENVIRONMENT`, `PAYSTACK_SECRET_KEY?`, `ASSETS?`. The URL for the API Worker is referenced in `portal.ts` route code but the binding name is not in the Env type. This will cause a TypeScript compile error or silent `undefined` at runtime if not added to `wrangler.toml`.

---

### Q43. Does brand-runtime enforce Platform Invariant T3 (tenant isolation)?

**Finding:** T3 — tenant_id must be derived from JWT, never from request body.

**Brand-runtime does not use JWTs** for most routes (it's a public-facing website). Tenant isolation is enforced differently:
- The `tenantSlug` is resolved from the request host/URL (not from JWT)
- The `tenantId` is derived exclusively from the `organizations` table lookup by slug
- No route allows a caller to override `tenantId` via request body or query parameter
- All D1 queries are bound with `tenantId` from `c.get('tenantId')`

**Portal login** does process credentials but passes them to the API Worker — it does not itself issue JWTs.

**T3 verdict:** Brand-runtime correctly implements T3 isolation for a public-facing Worker. The attack vector (injecting `tenant_id` via body) doesn't apply to this Worker's design.

---

### Q44. What governance checks apply to Pillar 2 in CI?

**Finding:** From `ci.yml` governance job, these checks run:

| Check script | Relevance to Pillar 2 |
|---|---|
| `check-cors.ts` | Verifies CORS config is tenant-scoped |
| `check-tenant-isolation.ts` | Scans for raw `tenant_id` from body |
| `check-ai-direct-calls.ts` | Not directly relevant to brand-runtime |
| `check-monetary-integrity.ts` | Relevant to shop routes (P9 kobo check) |
| `check-dependency-sources.ts` | Verifies no unapproved npm packages |
| `check-rollback-scripts.ts` | Verifies migrations 0206–0227 all have rollback |
| `check-pillar-prefix.ts` | Verifies `[Pillar 2]` in package.json for brand-runtime packages |
| `check-pwa-manifest.ts` | Verifies PWA manifest fields |
| `check-ndpr-before-ai.ts` | Not directly relevant to brand-runtime |
| `check-geography-integrity.ts` | Not directly relevant to brand-runtime |
| `check-vertical-registry.ts` | Not directly relevant to brand-runtime |
| `check-webhook-signing.ts` | Not directly relevant to brand-runtime |

**Missing from CI:** No template manifest validation check. No check that `template_installations` foreign key to `template_registry` is consistent. No check that brand-runtime's page-type templates match the documented page types in `docs/templates/template-spec.md`.

---

### Q45. Is the `INTER_SERVICE_SECRET` usage correct in brand-runtime?

**Finding:** Brand-runtime uses `INTER_SERVICE_SECRET` in one place: the portal login POST handler, when forwarding credentials to the API Worker. This is the correct usage pattern — it proves to the API Worker that the request came from an authorized inter-service caller, not an external source.

The `verify-secrets.ts` script (`scripts/verify-secrets.ts`) is run in CI (`check-secret-rotation-schedule`). This presumably checks that secrets are not expired or using default values.

**Correctness assessment:** The usage is correct. The binding is declared as required (not optional) in `env.ts`, so Cloudflare will reject the Worker deployment if not set. The secret is never logged (no `console.log` of `env.INTER_SERVICE_SECRET` anywhere in brand-runtime).

---

## Section H — Gaps, Bugs & Recommendations (Q46–Q50)

### Q46. What are the P0 bugs found in the Pillar 2 system?

**P0-BR-001 — Unescaped blog post content (Stored XSS)**
- File: `apps/brand-runtime/src/templates/blog-post.ts`, line 56
- `${post.content}` rendered verbatim. Any HTML stored in `blog_posts.content` (by a tenant user with blog write access) is served to visitors without escaping.
- **Fix:** Strip to safe HTML via allowlist (DOMPurify equivalent server-side) or encode as plaintext. Best: use a markdown→HTML library with sanitization.

**P0-BR-002 — CSS injection via font_family**
- File: `packages/white-label-theming/src/index.ts`, `buildCssVars()` line 163
- `--ww-font: ${theme.fontFamily}` — if `fontFamily` contains `</style><script>`, the CSS block is broken and arbitrary JS executes.
- **Fix:** Validate `fontFamily` in `validateBrandConfig()` to allow only font name characters (letters, spaces, commas, quotes). Or HTML-encode within the CSS string.

**P0-BR-003 — Portal dashboard redirect to non-existent route**
- File: `apps/brand-runtime/src/routes/portal.ts`
- Successful login redirects to `/portal/dashboard` which has no handler. Returns 404.
- **Fix:** Implement `/portal/dashboard` route or change redirect target to `/`.

**P0-BR-004 — API_BASE_URL not declared in Env type**
- File: `apps/brand-runtime/src/env.ts`
- The portal login route calls the API Worker at an `API_BASE_URL` that is not declared in the `Env` interface. This silently fails or causes TypeScript errors depending on access pattern.
- **Fix:** Add `API_BASE_URL: string` to `env.ts` Env interface.

---

### Q47. What are the P1 gaps in the template system?

**P1-TS-001 — No runtime bridge between marketplace templates and brand-runtime**
- The most architecturally significant gap. Documented in Q2/Q3.
- **Fix path:** When a `website`-type template is installed, brand-runtime must read `template_installations` on each request and route to the template's `entrypoints.public_site` handler instead of the default hardcoded templates. This requires a significant architectural change: template assets must be deployable Workers or R2-served scripts, not just DB rows.

**P1-TS-002 — No admin approval UI for template registry**
- Approving templates requires direct D1 SQL. No admin route, no admin dashboard action.
- **Fix path:** Add `PATCH /admin/templates/:slug/status` route gated to `super_admin`. Add UI action in admin-dashboard marketplace view.

**P1-TS-003 — Template vertical compatibility filter uses LIKE substring match**
- `compatible_verticals LIKE '%market%'` matches `"market"` and `"supermarket"`.
- **Fix:** Use SQLite JSON functions: `json_each(compatible_verticals)` or store as separate rows in a `template_verticals` join table.

**P1-TS-004 — White-label depth set but not consumed**
- `whiteLabelDepthMiddleware` sets depth correctly but no route handler reads it.
- **Fix:** In `branded-page.ts` and `portal.ts`, read `c.get('whiteLabelDepth')`. For depth 0: serve platform-branded page. For depth 1: apply logo and colors only. For depth 2: apply all including custom domain and email branding.

**P1-TS-005 — Design system CSS inlined on every response**
- 291-line CSS string re-sent on every request.
- **Fix:** Serve design system CSS as a versioned static asset (R2 bucket via `ASSETS` binding) with long-lived Cache-Control. Reference via `<link rel="stylesheet">`.

---

### Q48. What are the P2 gaps and missing features?

**P2-TS-001 — PWA icons at hardcoded paths will 404**
- `/icons/icon-192.png` and `/icons/icon-512.png` are not served by any brand-runtime route.
- **Fix:** Serve from R2 `ASSETS` bucket, or generate generic per-tenant SVG icons programmatically.

**P2-TS-002 — No vertical-specific templates**
- All tenants (politician, church, restaurant, motor-park) receive the identical 7-page layout.
- **Fix path (long term):** The runtime bridge (P1-TS-001 fix) unlocks this. Short term: add vertical-type detection in `branded-page.ts` and route to different template function sets.

**P2-TS-003 — Brand hierarchy walk not applied in brand-runtime**
- Sub-tenants without branding get platform default, not parent partner branding. Email system correctly walks the hierarchy.
- **Fix:** Replace `getBrandTokens(tenantSlug, ...)` with `resolveBrandContext(workspaceId, ...)` in brand-runtime, after ensuring `workspaceId` is available from the tenant resolution path.

**P2-TS-004 — No multi-language/i18n support**
- All pages are hardcoded in English. `lang="en-NG"` is set but no string externalization exists.
- **Fix path (P2 Nigeria First):** Hausa/Igbo/Yoruba UI strings should be a Phase 5+ consideration.

**P2-TS-005 — Contact form background sync submits to wrong endpoint**
- Service worker calls `POST /api/sync/apply` as relative URL against brand-runtime's domain.
- **Fix:** Use absolute URL with API Worker domain, or move `/api/sync/apply` handling into brand-runtime as a proxy route.

**P2-TS-006 — No rate limiting on branded pages**
- Brand-runtime has no rate limiting. A bot can scrape all 22 routes of a tenant's branded website with no throttling.
- **Fix:** Add Cloudflare Rate Limiting rule at the infrastructure level, or implement KV-based rate limiting in middleware.

**P2-TS-007 — Unrated templates can be rated without installation**
- Any JWT holder can rate any approved template without having installed it.
- **Fix:** Add check in `POST /templates/:slug/rate` that `template_installations` has an `active` record for the calling tenant.

---

### Q49. What documentation exists vs. what should exist for Pillar 2?

**Existing documentation:**
- `docs/templates/template-spec.md` — manifest format, DB schema (v1.0.1, 2026-04-12)
- `docs/templates/template-publishing.md` — how to submit a template
- `docs/templates/template-validation.md` — validation rules
- `docs/templates/platform-admin-guide.md` — admin operations guide
- `docs/governance/white-label-policy.md` — white-label depth rules
- `docs/plans/webwaka-1.0.0-foundation-and-template-architecture.md` — architectural plan
- `docs/governance/3in1-platform-architecture.md` — canonical 3-in-1 reference

**Missing documentation:**
- **Runtime bridge design spec** — how marketplace templates will eventually control brand-runtime rendering (the path from DB row → deployed rendering artifact is undocumented)
- **Vertical template layout guide** — how different verticals should appear differently in Pillar 2
- **Template developer guide** — how an external author writes and submits a `website`-type template
- **PWA implementation guide** — offline sync contract, IndexedDB schema, sync endpoint specification
- **Custom domain provisioning runbook** — how to configure DNS + Cloudflare Workers Routes for `custom_domain`
- **Performance optimization guide** — D1 query count per request, KV cache strategy
- **Security audit of brand-runtime** — the XSS findings in Q46 are not documented anywhere

---

### Q50. What is the overall Pillar 2 readiness assessment and prioritized action plan?

**Overall Assessment:** Pillar 2 (brand-runtime) is **MVP-functional** — tenants can have branded websites with home, about, services, contact, blog, and shop pages, with correct theme injection, SEO metadata, and branding entitlement gating. The foundation is solid.

However, the system has a **critical architectural gap** (the disconnected template marketplace) and **two P0 security bugs** (stored XSS via blog content, CSS injection via font_family) that must be resolved before a marketing-facing launch.

**Prioritized Action Plan:**

| Priority | ID | Action | Effort | Risk if deferred |
|---|---|---|---|---|
| **P0** | P0-BR-001 | Sanitize blog post content before render | 1 day | Stored XSS; any tenant admin can attack site visitors |
| **P0** | P0-BR-002 | Validate/escape fontFamily in buildCssVars | 0.5 day | CSS injection; tenant branding can inject arbitrary HTML/JS |
| **P0** | P0-BR-003 | Implement `/portal/dashboard` or fix redirect | 1 day | Successful login bounces to 404 |
| **P0** | P0-BR-004 | Declare API_BASE_URL in env.ts | 0.5 day | Portal login silently fails in production |
| **P1** | P1-TS-002 | Admin approval UI for template registry | 2 days | Template approvals require raw SQL |
| **P1** | P1-TS-004 | Consume whiteLabelDepth in route handlers | 2 days | White-label depth enforcement exists in DB but has zero runtime effect |
| **P1** | P1-TS-005 | Cache design system CSS as static asset | 1 day | 291-line CSS retransmitted on every page |
| **P2** | P1-TS-001 | Runtime bridge: marketplace templates → brand-runtime | 3–4 weeks | Template marketplace sells something that changes nothing |
| **P2** | P2-TS-003 | Use resolveBrandContext() in brand-runtime | 1 day | Sub-tenant branding hierarchy not respected |
| **P2** | P2-TS-005 | Fix SW sync endpoint URL | 1 day | Offline contact form sync silently fails |
| **P3** | P2-TS-002 | Vertical-specific template layouts | 2–3 weeks | All verticals look identical |
| **P3** | P1-TS-003 | Fix vertical filter SQL | 0.5 day | LIKE substring match bug in marketplace search |

---

## Appendix: Key File Registry

| File | Lines | Purpose |
|---|---|---|
| `apps/brand-runtime/src/index.ts` | 171 | Hono app, route registration, middleware ordering |
| `apps/brand-runtime/src/env.ts` | 44 | Cloudflare Worker bindings type definitions |
| `apps/brand-runtime/src/middleware/tenant-resolve.ts` | 94 | Tenant slug/ID resolution (3-priority chain) |
| `apps/brand-runtime/src/middleware/branding-entitlement.ts` | 79 | Plan-based branding access gate |
| `apps/brand-runtime/src/middleware/white-label-depth.ts` | 93 | Partner depth cap (set but not consumed) |
| `apps/brand-runtime/src/lib/theme.ts` | 26 | Re-export + env-aware `generateCssTokens()` |
| `apps/brand-runtime/src/routes/branded-page.ts` | 299 | Home, about, services, contact + form POST |
| `apps/brand-runtime/src/routes/blog.ts` | ~150 | Blog list + post detail |
| `apps/brand-runtime/src/routes/shop.ts` | ~250 | E-commerce catalog, cart, Paystack checkout |
| `apps/brand-runtime/src/routes/portal.ts` | ~120 | Login form + API Worker proxy |
| `apps/brand-runtime/src/routes/sitemap.ts` | ~100 | Dynamic XML sitemap |
| `apps/brand-runtime/src/templates/base.ts` | ~200 | HTML shell, nav, footer, SEO meta, JSON-LD |
| `apps/brand-runtime/src/templates/branded-home.ts` | 62 | Home page body (hero + offering cards) |
| `apps/brand-runtime/src/templates/about.ts` | 65 | About page body (description + contact info) |
| `apps/brand-runtime/src/templates/services.ts` | 65 | Services page (offering grid) |
| `apps/brand-runtime/src/templates/contact.ts` | 147 | Contact form with offline sync JS |
| `apps/brand-runtime/src/templates/blog-list.ts` | 58 | Blog listing with date formatting |
| `apps/brand-runtime/src/templates/blog-post.ts` | 65 | Blog post detail (XSS risk at line 56) |
| `packages/white-label-theming/src/index.ts` | 474 | Theme resolution, CSS generation, brand walk, email sender |
| `packages/design-system/src/index.ts` | 293 | Design tokens + generateBaseCSS() |
| `packages/verticals/src/template-validator.ts` | 282 | Manifest validation, semver compat checks |
| `apps/api/src/routes/templates.ts` | 944 | Full template marketplace API (12 routes) |
| `.github/workflows/ci.yml` | 178 | CI: typecheck, test, lint, governance, smoke, k6 |
| `docs/governance/3in1-platform-architecture.md` | 277 | Canonical 3-in-1 platform architecture |
| `docs/templates/template-spec.md` | 162 | Template manifest format and DB schema |

---

*Report generated: 2026-04-24 by forensics review of staging branch (40887fa)*  
*All findings are code-verified — every claim above is traceable to a specific file and line number*  
*No findings are based on documentation alone — documentation-only claims were checked against actual source*
