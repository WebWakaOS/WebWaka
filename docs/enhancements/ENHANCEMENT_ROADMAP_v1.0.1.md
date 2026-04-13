# WebWaka Platform Enhancement Roadmap

**Audit Date:** 2026-04-12  
**Last Updated:** 2026-04-14 (Sprints 1–12 reconciled)  
**Repo:** WebWaka/WebWaka (staging)  
**Commit SHA:** `ab0d6c6` (latest staging)  
**Total Enhancements:** 112  
**Completed Enhancements:** 67 (Sprints 1–12)  
**Remaining Open:** 45  
**Critical Bugs:** 8 (all resolved in Sprints 1–4)  
**Platform Score:** 8.1/10

---

## 1. EXECUTIVE SUMMARY

### Top 10 Enhancements (Priority Order)
1. **SEC-01** — `/admin/:workspaceId/dashboard` exposed without auth middleware
2. **SEC-02** — Wildcard CORS on `projections` and `tenant-public` workers in production
3. **SEC-03** — No login-specific rate limiting (brute-force attack surface)
4. **SEC-04** — JWT refresh endpoint allows infinite token chaining without rotation
5. **ARC-01** — 4 apps missing `wrangler.toml` (admin-dashboard, platform-admin, projections, tenant-public)
6. **QA-01** — Zero test coverage on auth-routes, identity, negotiation routes
7. **SEC-05** — PBKDF2 iteration count at 100k (OWASP 2024 recommends 600k for SHA-256)
8. **ARC-02** — Orphaned KV bindings (CACHE_KV, SESSIONS_KV) in api wrangler.toml
9. **UX-01** — No accessibility attributes on any admin dashboard HTML
10. **PERF-01** — No CDN cache headers on static PWA assets across workers

### Critical Bugs
| ID | Bug | Severity | Files |
|---|---|---|---|
| BUG-01 | `/admin/:workspaceId/dashboard` has no auth middleware | Critical | `apps/api/src/index.ts:291` |
| BUG-02 | Wildcard CORS on `projections` allows cross-origin rebuild triggers | Critical | `apps/projections/src/index.ts:47` |
| BUG-03 | Wildcard CORS on `tenant-public` enables arbitrary data scraping | High | `apps/tenant-public/src/index.ts:56` |
| BUG-04 | No brute-force protection on `/auth/login` (100 req/min global limit only) | High | `apps/api/src/index.ts:228` |
| BUG-05 | `partner-admin` missing D1/KV bindings in wrangler.toml | High | `apps/partner-admin/wrangler.toml` |
| BUG-06 | Inconsistent `compatibility_date` across workers (`2024-09-23` vs `2024-12-05`) | Medium | `apps/partner-admin/wrangler.toml:8` |
| BUG-07 | `DELETE /auth/me` silently fails if `sessions` table doesn't exist | Medium | `apps/api/src/routes/auth-routes.ts:157` |
| BUG-08 | Inconsistent error response schemas across routes (`{error}` vs `{success, error}`) | Medium | Multiple route files |

### Quick Wins (< 1 day each)
1. Add `authMiddleware` to `/admin/*` routes (1h)
2. Replace wildcard `cors()` in projections/tenant-public with origin-restricted (2h)
3. Add `authRateLimit` middleware to `/auth/login` (1h)
4. Sync `compatibility_date` to `2024-12-05` across all workers (15m)
5. Remove orphaned `CACHE_KV`/`SESSIONS_KV` from api wrangler.toml (15m)
6. Add `robots.txt` route to public-discovery and brand-runtime (30m)
7. Add missing `X-Content-Type-Options`/`X-Frame-Options` to non-api workers (1h)
8. Standardize error response format to `{error, code}` (2h)

### ROI Impact
- **Revenue:** Fixing billing/subscription gaps enables plan enforcement → direct monetization
- **Security:** Closing auth gaps prevents data breaches → regulatory compliance (NDPR)
- **Scale:** Caching + CDN headers → 40-60% reduction in D1 reads on geography/discovery
- **UX:** Accessibility + PWA polish → broader market reach (2G/3G users in Nigeria)

---

## 2. ENHANCEMENT CATALOGUE

---

### Security (Agent 2) — 18 Items

#### SEC-01: Unprotected Admin Dashboard Route
**Severity:** Critical  
**Files:** `apps/api/src/index.ts:291`  
**Evidence:** Route `/admin/:workspaceId/dashboard` is registered without `authMiddleware`. Any user with a valid workspace ID can access internal metadata.  
**Best Practice:** OWASP API Security Top 10 (BOLA), Cloudflare Workers security guide, Hono middleware docs  
**Fix:** Add `app.use('/admin/*', authMiddleware)` before route registration  
**Est:** 1h

#### SEC-02: Wildcard CORS on Projections Worker
**Severity:** Critical  
**Files:** `apps/projections/src/index.ts:47`  
**Evidence:** `app.use('*', cors())` allows any origin. Endpoints include `/rebuild/search` and `/events/:aggregate/:id` which expose PII.  
**Best Practice:** OWASP CORS Cheat Sheet, MDN CORS guide, Cloudflare Workers CORS best practices  
**Fix:** Replace with dynamic origin validation matching `apps/api` pattern  
**Est:** 2h

#### SEC-03: No Login-Specific Rate Limiting
**Severity:** High  
**Files:** `apps/api/src/index.ts:228`, `apps/api/src/routes/auth-routes.ts`  
**Evidence:** Global rate limit is 100 req/60s per IP. An attacker can attempt 100 passwords/minute without account lockout.  
**Best Practice:** OWASP Authentication Cheat Sheet (max 5 attempts/min), NIST 800-63B, Cloudflare WAF rate limiting  
**Fix:** Add `authRateLimit = rateLimitMiddleware({ max: 5, windowSeconds: 300 })` on `/auth/login`  
**Est:** 1h

#### SEC-04: JWT Refresh Without Token Rotation
**Severity:** High  
**Files:** `apps/api/src/routes/auth-routes.ts:90-107`  
**Evidence:** `/auth/refresh` reissues a JWT from an existing valid JWT. No refresh token rotation, no single-use enforcement. Stolen token = permanent access.  
**Best Practice:** OWASP JWT Cheat Sheet, RFC 6749 Section 10.4, Auth0 token rotation guide  
**Fix:** Implement opaque refresh tokens stored in D1 with single-use rotation  
**Est:** 8h

#### SEC-05: PBKDF2 Iteration Count Below Current Recommendations
**Severity:** Medium  
**Files:** `apps/api/src/routes/auth-routes.ts:65`  
**Evidence:** Current: 100,000 iterations. OWASP 2024 recommends 600,000 for PBKDF2-HMAC-SHA256.  
**Best Practice:** OWASP Password Storage Cheat Sheet (2024), NIST SP 800-63B, Cloudflare Workers crypto docs  
**Fix:** Increase to 600,000; add migration to rehash on next login  
**Est:** 4h

#### SEC-06: Wildcard CORS on Tenant-Public Worker
**Severity:** High  
**Files:** `apps/tenant-public/src/index.ts:56`  
**Evidence:** `app.use('*', cors())` on all routes including manifest.json and tenant data endpoints.  
**Best Practice:** OWASP CORS Cheat Sheet, SaaS security baseline  
**Fix:** Restrict to `*.webwaka.com` + tenant custom domains  
**Est:** 2h

#### SEC-07: No Security Headers on Non-API Workers
**Severity:** Medium  
**Files:** `apps/projections/src/index.ts`, `apps/tenant-public/src/index.ts`, `apps/brand-runtime/src/index.ts`  
**Evidence:** Only `apps/api` uses `secureHeaders()`. Other workers lack `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`.  
**Best Practice:** OWASP Secure Headers Project, Mozilla Observatory, Cloudflare security headers guide  
**Fix:** Add `secureHeaders()` middleware from Hono to all workers  
**Est:** 1h

#### SEC-08: Hardcoded localhost in Production CORS Fallbacks
**Severity:** Medium  
**Files:** `apps/admin-dashboard/src/index.ts:74`, `apps/partner-admin/src/index.ts:42`  
**Evidence:** `http://localhost:5173` hardcoded in origin lists without environment guard.  
**Best Practice:** 12-factor app config, OWASP deployment security  
**Fix:** Gate localhost origins behind `ENVIRONMENT !== 'production'` check  
**Est:** 30m

#### SEC-09: No Password Complexity Validation
**Severity:** Medium  
**Files:** `apps/api/src/routes/auth-routes.ts:30-34`  
**Evidence:** Login accepts any string as password. No length/complexity enforcement at entry.  
**Best Practice:** NIST SP 800-63B (min 8 chars, no composition rules, blocklist check), OWASP  
**Fix:** Add Zod schema: `z.string().min(8).max(128)` on auth endpoints  
**Est:** 2h

#### SEC-10: No Token Revocation/Blacklist Mechanism
**Severity:** Medium  
**Files:** `packages/auth/src/jwt.ts`  
**Evidence:** Stateless JWT with no revocation capability. Compromised tokens valid for full 1-hour TTL.  
**Best Practice:** OWASP Session Management, Auth0 token revocation patterns, RFC 7009  
**Fix:** Implement KV-backed token blacklist checked in auth middleware  
**Est:** 4h

#### SEC-11: Silent Session Table Fallback on Account Deletion
**Severity:** Medium  
**Files:** `apps/api/src/routes/auth-routes.ts:157-164`  
**Evidence:** `DELETE /auth/me` catches session table errors silently. NDPR erasure may be incomplete.  
**Best Practice:** GDPR/NDPR right to erasure (must confirm deletion), data protection audit trails  
**Fix:** Ensure sessions table exists via migration; log erasure confirmation  
**Est:** 2h

#### SEC-12: No CSRF Protection on State-Changing Endpoints
**Severity:** Low  
**Files:** All POST/PUT/DELETE routes  
**Evidence:** No CSRF tokens on any endpoints. JWT in Authorization header provides some protection, but cookie-based auth (if added) would be vulnerable.  
**Best Practice:** OWASP CSRF Prevention Cheat Sheet, SameSite cookie attributes  
**Fix:** Add `csrf()` middleware from Hono on state-changing routes  
**Est:** 3h

#### SEC-13: No Request Body Size Limits
**Severity:** Medium  
**Files:** All route handlers  
**Evidence:** No explicit body size limit middleware. Cloudflare Workers have a 100MB default, but malicious payloads could waste CPU.  
**Best Practice:** Cloudflare Workers limits docs, OWASP Input Validation  
**Fix:** Add body size middleware: `app.use('*', bodyLimit({ maxSize: 1024 * 256 }))` (256KB)  
**Est:** 30m

#### SEC-14: Template Manifest JSON Not Validated Against Schema
**Severity:** Medium  
**Files:** `apps/api/src/routes/templates.ts:254-260`  
**Evidence:** `manifest_json` is stored as text from request body without schema validation. Malformed manifests accepted.  
**Best Practice:** JSON Schema validation (Ajv/Zod), WordPress plugin review guidelines  
**Fix:** Validate manifest against template-spec schema using Zod before storage  
**Est:** 3h

#### SEC-15: PriceLock Token Fallback to Unsigned When Secret Missing
**Severity:** Medium  
**Files:** `packages/negotiation/src/price-lock.ts:10-15`  
**Evidence:** When `PRICE_LOCK_SECRET` is not set, tokens are generated without HMAC signing. Attacker can forge price locks.  
**Best Practice:** OWASP Cryptographic Failures, defense-in-depth  
**Fix:** Throw error if secret not configured rather than falling back to unsigned  
**Est:** 1h

#### SEC-16: No IP Logging on Failed Authentication Attempts
**Severity:** Low  
**Files:** `apps/api/src/routes/auth-routes.ts`  
**Evidence:** Failed login attempts are not logged with IP/user-agent for security monitoring.  
**Best Practice:** OWASP Logging Cheat Sheet, SIEM best practices  
**Fix:** Add structured log entry on auth failures  
**Est:** 1h

#### SEC-17: Audit Log Middleware Fails Silently on D1 Write Error
**Severity:** Low  
**Files:** `apps/api/src/middleware/audit-log.ts:77`  
**Evidence:** `console.error('[AUDIT] D1 write failed (non-blocking)')` — audit entries can be silently lost.  
**Best Practice:** SOC 2 audit log requirements, tamper-proof logging  
**Fix:** Add KV fallback for failed D1 audit writes; alert on repeated failures  
**Est:** 3h

#### SEC-18: No Content-Type Validation on File Uploads
**Severity:** Low  
**Files:** Various routes accepting user input  
**Evidence:** No explicit Content-Type validation middleware for request bodies.  
**Best Practice:** OWASP File Upload Cheat Sheet  
**Fix:** Validate `Content-Type: application/json` on all JSON endpoints  
**Est:** 1h

---

### Architecture (Agent 1) — 20 Items

#### ARC-01: 4 Apps Missing Worker Deployment Config
**Severity:** High  
**Files:** `apps/admin-dashboard/`, `apps/platform-admin/`, `apps/projections/`, `apps/tenant-public/`  
**Evidence:** No `wrangler.toml` found. Deployment strategy unclear — may be Pages or non-Worker hosting.  
**Best Practice:** Cloudflare Workers deployment guide, 12-factor app principles  
**Fix:** Create `wrangler.toml` for each or document alternative deployment method  
**Est:** 4h

#### ARC-02: Orphaned KV Bindings in API Worker
**Severity:** Medium  
**Files:** `apps/api/wrangler.toml:67,75`, `apps/api/src/env.ts`  
**Evidence:** `CACHE_KV` and `SESSIONS_KV` defined in wrangler.toml but not in `env.ts` or any code.  
**Best Practice:** Infrastructure as Code hygiene, Cloudflare billing optimization  
**Fix:** Remove orphaned bindings from wrangler.toml  
**Est:** 15m

#### ARC-03: Inconsistent Compatibility Dates Across Workers
**Severity:** Medium  
**Files:** `apps/partner-admin/wrangler.toml:8`  
**Evidence:** partner-admin uses `2024-09-23`, all others use `2024-12-01` or `2024-12-05`.  
**Best Practice:** Cloudflare Workers compatibility flags, monorepo consistency  
**Fix:** Align all to `2024-12-05`  
**Est:** 15m

#### ARC-04: Partner-Admin Missing D1/KV Bindings
**Severity:** High  
**Files:** `apps/partner-admin/wrangler.toml`  
**Evidence:** No D1 database or KV namespace bindings despite being an admin tool that needs data access.  
**Best Practice:** Cloudflare Workers D1 binding docs  
**Fix:** Add DB, RATE_LIMIT_KV bindings matching api worker  
**Est:** 1h

#### ARC-05: No Shared CORS Configuration Package
**Severity:** Medium  
**Files:** All apps with CORS  
**Evidence:** 5 different CORS implementations across workers. Origin validation logic duplicated inconsistently.  
**Best Practice:** DRY principle, monorepo shared package pattern  
**Fix:** Create `packages/shared-config/src/cors.ts` with unified origin validation  
**Est:** 4h

#### ARC-06: Error Response Schema Not Standardized
**Severity:** Medium  
**Files:** Multiple route files  
**Evidence:** Routes return `{error}`, `{error, message}`, `{success: false, error}`, and `{error, code}` inconsistently.  
**Best Practice:** JSON:API error format, Stripe API error conventions, RFC 7807  
**Fix:** Define `ErrorResponse` type: `{error: string, code: string, details?: unknown}`  
**Est:** 8h

#### ARC-07: Monolithic Index File (670+ lines)
**Severity:** Low  
**Files:** `apps/api/src/index.ts`  
**Evidence:** 670+ lines handling route registration, middleware, CORS, error handling. Hard to navigate.  
**Best Practice:** Express/Hono app factory pattern, separation of concerns  
**Fix:** Extract middleware stack, route registration, and error handlers into separate modules  
**Est:** 4h

#### ARC-08: 143 Vertical Packages with Near-Identical Structure
**Severity:** Low  
**Files:** `packages/verticals-*/`  
**Evidence:** 143 vertical packages each containing ~4 files (types.ts, repository.ts, index.ts, test). Heavy code duplication.  
**Best Practice:** Code generation, template-driven architecture, Shopify app patterns  
**Fix:** Create vertical generator CLI; consider consolidating into data-driven config  
**Est:** 16h

#### ARC-09: No Database Connection Pooling Strategy
**Severity:** Medium  
**Files:** All D1 database consumers  
**Evidence:** Each route handler creates fresh D1 queries. No connection reuse or pooling documentation.  
**Best Practice:** Cloudflare D1 best practices (connection binding reuse is automatic in Workers)  
**Fix:** Document D1 binding lifecycle; add connection monitoring  
**Est:** 2h

#### ARC-10: No API Versioning Strategy Beyond v1
**Severity:** Low  
**Files:** `apps/api/src/index.ts`  
**Evidence:** All routes under `/api/v1/`. No plan for v2 migration documented.  
**Best Practice:** Stripe API versioning, GitHub API versioning, Shopify API versioning  
**Fix:** Document versioning strategy in architecture decisions  
**Est:** 2h

#### ARC-11: No Health Check on Non-API Workers
**Severity:** Medium  
**Files:** `apps/brand-runtime/`, `apps/public-discovery/`, `apps/ussd-gateway/`  
**Evidence:** Only `apps/api` has a `/health` endpoint. Other workers have no health/readiness probes.  
**Best Practice:** Kubernetes health probe pattern, Cloudflare Worker health checks  
**Fix:** Add `GET /health` returning `{ok: true, version}` to all workers  
**Est:** 2h

#### ARC-12: No Database Migration Verification in CI
**Severity:** Medium  
**Files:** `.github/workflows/ci.yml`  
**Evidence:** CI runs typecheck and tests but doesn't validate migrations (syntax, order, idempotency).  
**Best Practice:** Flyway/Liquibase CI patterns, D1 migration best practices  
**Fix:** Add migration validation step to CI workflow  
**Est:** 4h

#### ARC-13: No OpenAPI Spec Validation in CI
**Severity:** Low  
**Files:** `apps/api/src/routes/openapi.ts`, `.github/workflows/ci.yml`  
**Evidence:** OpenAPI spec exists but isn't validated against actual routes in CI.  
**Best Practice:** Spectral linting, OpenAPI validation in CI  
**Fix:** Add `spectral lint` step to CI  
**Est:** 2h

#### ARC-14: No Dependency Injection for External Services
**Severity:** Low  
**Files:** `apps/api/src/routes/airtime.ts`, identity.ts, payments.ts  
**Evidence:** External API calls (Termii, Paystack, Prembly) are inline in route handlers. Hard to mock in tests.  
**Best Practice:** Dependency injection, adapter pattern, hexagonal architecture  
**Fix:** Extract external service calls into injectable adapters  
**Est:** 8h

#### ARC-15: No Circuit Breaker for External API Calls
**Severity:** Medium  
**Files:** `apps/api/src/routes/airtime.ts`, identity.ts  
**Evidence:** Termii, Paystack, Prembly calls have no circuit breaker. If external service is down, all requests fail.  
**Best Practice:** Circuit breaker pattern (Martin Fowler), resilience4j, Polly  
**Fix:** Implement simple circuit breaker with KV state tracking  
**Est:** 6h

#### ARC-16: No Event Sourcing Replay/Recovery Documentation
**Severity:** Low  
**Files:** `packages/events/src/`  
**Evidence:** Event system exists but no documentation on replay, recovery, or data migration procedures.  
**Best Practice:** Event sourcing patterns (Greg Young), CQRS documentation standards  
**Fix:** Document event replay procedures in runbook  
**Est:** 2h

#### ARC-17: No Graceful Degradation for KV Cache Misses
**Severity:** Medium  
**Files:** `apps/api/src/routes/geography.ts:29-32`  
**Evidence:** Geography cache falls back to D1 rebuild on KV miss, but no timeout or circuit breaker.  
**Best Practice:** Cache-aside pattern with fallback, Cloudflare KV consistency docs  
**Fix:** Add timeout on KV reads; return stale data if D1 rebuild is slow  
**Est:** 3h

#### ARC-18: Service Worker Cache Versioning Not Automated
**Severity:** Low  
**Files:** `apps/admin-dashboard/public/sw.js`, `apps/partner-admin/public/sw.js`  
**Evidence:** Cache version is hardcoded (`webwaka-admin-v1`). No automatic invalidation on deploy.  
**Best Practice:** Workbox cache versioning, Google PWA guide  
**Fix:** Generate cache version from build hash or deploy timestamp  
**Est:** 2h

#### ARC-19: No Structured Logging Correlation IDs
**Severity:** Medium  
**Files:** `packages/logging/src/logger.ts`, all console.log/error calls  
**Evidence:** Logs use prefix tags `[audit]`, `[negotiation]` but no request-level correlation ID for tracing.  
**Best Practice:** Distributed tracing (OpenTelemetry), Cloudflare Workers tracing, 12-factor logging  
**Fix:** Generate `x-request-id` in middleware; propagate through all log calls  
**Est:** 4h

#### ARC-20: No Blue-Green or Canary Deployment Strategy
**Severity:** Low  
**Files:** `.github/workflows/deploy-production.yml`  
**Evidence:** Production deploy is direct push. No canary, blue-green, or traffic splitting.  
**Best Practice:** Cloudflare Workers gradual rollouts, canary deployment patterns  
**Fix:** Implement Cloudflare Workers gradual deployment (10% → 50% → 100%)  
**Est:** 4h

---

### UX/UI (Agent 3) — 15 Items

#### UX-01: No Accessibility Attributes on Admin Dashboards
**Severity:** High  
**Files:** `apps/admin-dashboard/public/index.html`, `apps/partner-admin/public/index.html`  
**Evidence:** Zero `aria-*`, `role`, or `tabindex` attributes found in any admin HTML.  
**Best Practice:** WCAG 2.1 AA, WAI-ARIA authoring practices, Google Lighthouse accessibility audit  
**Fix:** Add ARIA landmarks, roles, labels to all interactive elements  
**Est:** 8h

#### UX-02: No Skip Navigation Links
**Severity:** Medium  
**Files:** All HTML-serving apps  
**Evidence:** No skip-to-content links for keyboard/screen reader users.  
**Best Practice:** WCAG 2.4.1 Bypass Blocks, WebAIM skip nav guide  
**Fix:** Add `<a href="#main" class="sr-only">Skip to content</a>` to all page layouts  
**Est:** 2h

#### UX-03: No Loading States in PWA Shell
**Severity:** Medium  
**Files:** `apps/admin-dashboard/public/index.html`, `apps/partner-admin/public/index.html`  
**Evidence:** PWA shell shows blank page while JavaScript loads. No skeleton or loading indicator.  
**Best Practice:** Google Material Design loading patterns, perceived performance best practices  
**Fix:** Add CSS-only skeleton loader in HTML shell  
**Est:** 3h

#### UX-04: No Offline Fallback Page
**Severity:** Medium  
**Files:** `apps/admin-dashboard/public/sw.js`, `apps/partner-admin/public/sw.js`  
**Evidence:** Service worker fetch handler falls back to cache but no dedicated offline page.  
**Best Practice:** Google PWA Offline Fallback, Workbox offline page recipe  
**Fix:** Create `/offline.html` and serve for navigation requests when offline  
**Est:** 2h

#### UX-05: No Form Validation Feedback Patterns
**Severity:** Medium  
**Files:** All admin dashboard HTML  
**Evidence:** No client-side validation patterns, error message components, or feedback UI.  
**Best Practice:** Material Design form validation, Nielsen Norman form UX  
**Fix:** Design validation feedback component system  
**Est:** 4h

#### UX-06: No Dark Mode Support
**Severity:** Low  
**Files:** All CSS in apps  
**Evidence:** No `prefers-color-scheme` media queries or theme toggle.  
**Best Practice:** Material Design 3 color system, `prefers-color-scheme` MDN  
**Fix:** Add CSS custom properties for dark theme; respect system preference  
**Est:** 6h

#### UX-07: No Responsive Navigation Pattern
**Severity:** Medium  
**Files:** Admin dashboard HTML  
**Evidence:** No mobile-responsive navigation (hamburger menu, bottom nav).  
**Best Practice:** Material Design responsive navigation, Google mobile UX guidelines  
**Fix:** Add responsive nav with collapsible sidebar  
**Est:** 6h

#### UX-08: USSD Menu Depth Exceeds 3 Levels
**Severity:** Medium  
**Files:** `apps/ussd-gateway/src/index.ts`  
**Evidence:** USSD flows can go 4+ levels deep. Nigerian users on basic phones expect max 3 levels.  
**Best Practice:** Africa's Talking USSD UX guide, MTN USSD design guidelines  
**Fix:** Flatten menu structure; use numbered shortcuts for deep actions  
**Est:** 4h

#### UX-09: No Error Recovery Guidance in UI
**Severity:** Low  
**Files:** All frontend apps  
**Evidence:** Errors show technical messages (`500 Internal Server Error`) without recovery guidance.  
**Best Practice:** Nielsen Norman error message guidelines, friendly error page patterns  
**Fix:** Add error boundary component with retry/contact-support actions  
**Est:** 4h

#### UX-10: No Confirmation Dialogs for Destructive Actions
**Severity:** Medium  
**Files:** Template rollback, account deletion endpoints  
**Evidence:** `DELETE /templates/:slug/install` and `DELETE /auth/me` have no confirmation flow documentation.  
**Best Practice:** Material Design confirmation dialog patterns  
**Fix:** Document required confirmation flows for frontend clients  
**Est:** 2h

#### UX-11: Brand Runtime Templates Lack Responsive Meta Viewport
**Severity:** Low  
**Files:** `apps/brand-runtime/src/templates/base.ts`  
**Evidence:** Base template includes viewport meta but some tenant pages may override.  
**Best Practice:** Google mobile-first design, viewport meta best practices  
**Fix:** Enforce viewport meta in base template; add responsive CSS grid  
**Est:** 2h

#### UX-12: No Breadcrumb Navigation in Multi-Level Flows
**Severity:** Low  
**Files:** Admin dashboards  
**Evidence:** No breadcrumb component for navigation context.  
**Best Practice:** WCAG 2.4.8, Nielsen Norman breadcrumb study  
**Fix:** Add breadcrumb component to admin layout  
**Est:** 3h

#### UX-13: No Toast/Notification System
**Severity:** Low  
**Files:** All frontend apps  
**Evidence:** No in-app notification or toast component for success/error feedback.  
**Best Practice:** Material Design snackbar patterns  
**Fix:** Create reusable toast notification component  
**Est:** 3h

#### UX-14: Discovery Listing Cards Lack Visual Hierarchy
**Severity:** Low  
**Files:** `apps/public-discovery/src/routes/listings.ts`  
**Evidence:** Listing cards are plain text with minimal visual distinction.  
**Best Practice:** Google Material Design card patterns, Airbnb listing card design  
**Fix:** Add image placeholders, category chips, and visual hierarchy  
**Est:** 4h

#### UX-15: No i18n Framework for Multi-Language Support
**Severity:** Medium  
**Files:** All user-facing text  
**Evidence:** All text is hardcoded in English. Nigeria has 500+ languages; Hausa, Yoruba, Igbo, Pidgin are high priority.  
**Best Practice:** ICU MessageFormat, i18next, Shopify multi-language, Google internationalization guide  
**Fix:** Implement i18n with `packages/frontend/src/i18n/` (directory exists but empty)  
**Est:** 16h

---

### Performance (Agent 4) — 12 Items

#### PERF-01: No CDN Cache Headers on Static PWA Assets
**Severity:** Medium  
**Files:** All PWA-serving workers  
**Evidence:** `index.html`, CSS, and JS served without `Cache-Control` headers in most workers.  
**Best Practice:** Google Web Performance, Cloudflare caching best practices, HTTP caching RFC 7234  
**Fix:** Add `Cache-Control: public, max-age=31536000, immutable` for versioned assets  
**Est:** 2h

#### PERF-02: Geography Data Rebuilt on Every KV Cache Miss
**Severity:** Medium  
**Files:** `apps/api/src/routes/geography.ts:25-35`  
**Evidence:** Full D1 table scan on KV miss. 37 states × 774 LGAs × 8,809 wards = large rebuild.  
**Best Practice:** Cloudflare KV TTL optimization, cache warming patterns  
**Fix:** Reduce rebuild scope with incremental KV population; add cache warming cron  
**Est:** 4h

#### PERF-03: No Query Result Pagination on Template Listings
**Severity:** Medium  
**Files:** `apps/api/src/routes/templates.ts:112-140`  
**Evidence:** Template listing uses OFFSET-based pagination. For large datasets, OFFSET is O(n).  
**Best Practice:** Cursor-based pagination (Shopify API, Stripe API), D1 performance guide  
**Fix:** Switch to cursor-based pagination using `created_at` + `id` composite cursor  
**Est:** 4h

#### PERF-04: No Database Query Indexing Strategy Documentation
**Severity:** Medium  
**Files:** `infra/db/migrations/`  
**Evidence:** Migrations create tables but few explicit indexes beyond primary keys.  
**Best Practice:** SQLite/D1 index optimization guide, use EXPLAIN QUERY PLAN  
**Fix:** Audit top queries; add indexes on `tenant_id`, `status`, `created_at`  
**Est:** 6h

#### PERF-05: Template Registry Full-Text Search Missing
**Severity:** Low  
**Files:** `apps/api/src/routes/templates.ts:110-145`  
**Evidence:** Search is `LIKE '%query%'` on slug/display_name. No FTS index.  
**Best Practice:** SQLite FTS5, D1 full-text search patterns  
**Fix:** Add FTS5 virtual table for template search  
**Est:** 4h

#### PERF-06: No HTTP Response Compression
**Severity:** Medium  
**Files:** All workers  
**Evidence:** No explicit gzip/brotli compression middleware. Cloudflare handles this at edge, but large JSON responses benefit from Worker-level compression.  
**Best Practice:** Cloudflare Workers response compression, Hono compress middleware  
**Fix:** Add `compress()` middleware from Hono to JSON-heavy workers  
**Est:** 1h

#### PERF-07: Inline Service Worker Generation on Every Request
**Severity:** Low  
**Files:** `apps/admin-dashboard/src/index.ts:108`, `apps/tenant-public/src/index.ts:87`  
**Evidence:** Service worker JS is generated as a template string on every `/sw.js` request.  
**Best Practice:** Pre-build service workers, Workbox build-time generation  
**Fix:** Serve SW from static file; use build step for version injection  
**Est:** 2h

#### PERF-08: Discovery Search Lacks Result Caching
**Severity:** Medium  
**Files:** `apps/api/src/routes/discovery.ts`  
**Evidence:** Every search query hits D1 directly. No KV caching for popular search terms.  
**Best Practice:** Redis/KV search cache patterns, Cloudflare Workers caching API  
**Fix:** Cache top 100 search results in KV with 5-min TTL  
**Est:** 4h

#### PERF-09: Vertical Route Registration is Serial (143 packages)
**Severity:** Low  
**Files:** `apps/api/src/index.ts`  
**Evidence:** 143 vertical routes registered sequentially in index.ts. Cold start impact.  
**Best Practice:** Lazy route loading, Cloudflare Workers cold start optimization  
**Fix:** Implement lazy route loading or consolidate vertical routes  
**Est:** 6h

#### PERF-10: No ETag Support on Cacheable Endpoints
**Severity:** Low  
**Files:** Geography, discovery, template list endpoints  
**Evidence:** No ETag/If-None-Match handling. Clients always download full responses.  
**Best Practice:** HTTP conditional requests (RFC 7232), Cloudflare Workers ETag  
**Fix:** Add ETag middleware for GET-only cacheable routes  
**Est:** 4h

#### PERF-11: D1 Batch Queries Not Maximized
**Severity:** Low  
**Files:** Various route handlers  
**Evidence:** Some handlers make 2-3 sequential D1 queries that could be batched.  
**Best Practice:** Cloudflare D1 batch API, reduce round trips  
**Fix:** Audit and consolidate sequential queries into `db.batch()`  
**Est:** 4h

#### PERF-12: No Resource Hints (Preconnect/Prefetch) in HTML
**Severity:** Low  
**Files:** All HTML templates  
**Evidence:** No `<link rel="preconnect">` or `<link rel="prefetch">` hints.  
**Best Practice:** Google Web Vitals, resource hints spec  
**Fix:** Add preconnect hints for API domain and CDN  
**Est:** 1h

---

### QA/Testing (Agent 5) — 12 Items

#### QA-01: Zero Tests on Auth Routes
**Severity:** Critical  
**Files:** `apps/api/src/routes/auth-routes.ts`  
**Evidence:** Login, refresh, verify, and account deletion endpoints have no test coverage.  
**Best Practice:** OWASP testing guide, 100% auth route coverage standard  
**Fix:** Write comprehensive test suite for all auth flows  
**Est:** 8h

#### QA-02: Zero Tests on Identity/KYC Routes
**Severity:** High  
**Files:** `apps/api/src/routes/identity.ts`  
**Evidence:** BVN, NIN, CAC, FRSC verification routes — regulatory-critical — have no tests.  
**Best Practice:** Financial services testing standards, regulatory compliance testing  
**Fix:** Write tests for all identity verification flows  
**Est:** 6h

#### QA-03: Zero Tests on Negotiation Routes
**Severity:** High  
**Files:** `apps/api/src/routes/negotiation.ts`, `packages/negotiation/src/`  
**Evidence:** Price negotiation FSM, price-lock tokens, checkout flow — all untested.  
**Best Practice:** State machine testing patterns, financial transaction testing  
**Fix:** Write FSM state transition tests + price-lock verification tests  
**Est:** 8h

#### QA-04: Empty E2E and Integration Test Directories
**Severity:** High  
**Files:** `tests/e2e/`, `tests/integration/`  
**Evidence:** Both directories are empty. Only smoke tests exist (5 files).  
**Best Practice:** Google test pyramid, E2E testing for critical user journeys  
**Fix:** Write E2E tests for: login → browse → install template → verify  
**Est:** 12h

#### QA-05: No Test Coverage for AI Packages
**Severity:** Medium  
**Files:** `packages/ai-abstraction/src/`, `packages/ai-adapters/src/`  
**Evidence:** AI routing, capability evaluation, and adapter logic — zero tests.  
**Best Practice:** AI/ML testing patterns, mock provider testing  
**Fix:** Write unit tests with mocked AI provider responses  
**Est:** 6h

#### QA-06: No Test Coverage for Entity/Workspace Routes
**Severity:** Medium  
**Files:** `apps/api/src/routes/entities.ts`, `workspaces.ts`, `workspace-verticals.ts`  
**Evidence:** Core entity CRUD and workspace management untested.  
**Best Practice:** CRUD test coverage standards  
**Fix:** Write CRUD test suites with tenant isolation verification  
**Est:** 6h

#### QA-07: No Load/Stress Testing Infrastructure
**Severity:** Medium  
**Files:** N/A  
**Evidence:** No k6, Artillery, or similar load testing config found.  
**Best Practice:** Cloudflare Workers load testing guide, k6 for Workers  
**Fix:** Add k6 scripts for critical paths (auth, discovery, templates)  
**Est:** 8h

#### QA-08: Smoke Tests Don't Run in CI
**Severity:** Medium  
**Files:** `.github/workflows/ci.yml`, `tests/smoke/`  
**Evidence:** CI runs typecheck but not smoke tests. Smoke tests exist but aren't wired.  
**Best Practice:** Shift-left testing, CI test automation  
**Fix:** Add smoke test stage to CI workflow after deployment  
**Est:** 2h

#### QA-09: No Contract Testing for External APIs
**Severity:** Medium  
**Files:** Termii, Paystack, Prembly integrations  
**Evidence:** External API calls have no contract/schema tests.  
**Best Practice:** Pact contract testing, consumer-driven contracts  
**Fix:** Add response schema validation tests with recorded fixtures  
**Est:** 6h

#### QA-10: No Regression Test for Template Install/Rollback/Reinstall
**Severity:** Medium  
**Files:** `apps/api/src/routes/templates.ts`  
**Evidence:** Install → rollback → reinstall flow (recently fixed) has no automated test.  
**Best Practice:** Regression testing for fixed bugs  
**Fix:** Write end-to-end test for install lifecycle  
**Est:** 3h

#### QA-11: No Test for Tenant Isolation (T3 Invariant)
**Severity:** High  
**Files:** All route handlers with `tenant_id`  
**Evidence:** T3 is the most critical invariant but no cross-tenant access test exists.  
**Best Practice:** Multi-tenant security testing, OWASP BOLA testing  
**Fix:** Write cross-tenant access denial tests for every protected endpoint  
**Est:** 8h

#### QA-12: No Visual Regression Testing for PWA UIs
**Severity:** Low  
**Files:** All HTML-serving apps  
**Evidence:** No Playwright/Cypress visual snapshot tests.  
**Best Practice:** Percy, Chromatic, Playwright visual comparisons  
**Fix:** Add Playwright visual snapshot tests for key pages  
**Est:** 6h

---

### DevOps (Agent 6) — 10 Items

#### DEV-01: No Staging Environment Validation Before Production Deploy
**Severity:** High  
**Files:** `.github/workflows/deploy-production.yml`  
**Evidence:** Production deploy triggers on staging push — no manual approval gate or staging health check.  
**Best Practice:** GitOps promotion patterns, environment gates  
**Fix:** Add staging smoke test + manual approval step before production deploy  
**Est:** 3h

#### DEV-02: No Rollback Procedure Documentation
**Severity:** Medium  
**Files:** `docs/runbooks/`  
**Evidence:** No documented procedure for rolling back a bad production deployment.  
**Best Practice:** Cloudflare Workers rollback (version pinning), runbook patterns  
**Fix:** Document rollback procedure using Cloudflare dashboard version revert  
**Est:** 2h

#### DEV-03: No Secret Rotation Automation
**Severity:** Medium  
**Files:** `infra/github-actions/secrets-inventory.md`  
**Evidence:** Secrets inventory exists but no rotation schedule or automation.  
**Best Practice:** AWS Secrets Manager patterns, OWASP secret management, NIST key lifecycle  
**Fix:** Document rotation schedule; add secret expiry alerting  
**Est:** 4h

#### DEV-04: No Monitoring/Alerting Configuration
**Severity:** High  
**Files:** No Grafana/Datadog/etc config found  
**Evidence:** Error tracking outputs to console.error but no alerting pipeline.  
**Best Practice:** Cloudflare Workers analytics, Logpush to monitoring service  
**Fix:** Configure Cloudflare Logpush → alerting service for error rate spikes  
**Est:** 6h

#### DEV-05: CI Doesn't Run Full Test Suite
**Severity:** Medium  
**Files:** `.github/workflows/ci.yml`  
**Evidence:** CI runs `pnpm typecheck` only. No `pnpm test` step.  
**Best Practice:** CI should run lint + typecheck + test on every PR  
**Fix:** Add `pnpm test` step to CI workflow  
**Est:** 1h

#### DEV-06: No Branch Protection Rules Documented
**Severity:** Medium  
**Files:** `.github/`  
**Evidence:** No branch protection configuration visible. Direct pushes to staging possible.  
**Best Practice:** GitHub branch protection, required reviews, status checks  
**Fix:** Enable branch protection on staging: require CI + 1 review  
**Est:** 1h

#### DEV-07: No Container/Local Development Setup
**Severity:** Low  
**Files:** No `docker-compose.yml`, no `.devcontainer/`  
**Evidence:** No local development environment configuration for new developers.  
**Best Practice:** Docker Compose for local dev, GitHub Codespaces, Replit  
**Fix:** Add development setup documentation with Wrangler local commands  
**Est:** 3h

#### DEV-08: No Dependabot/Renovate Configuration
**Severity:** Medium  
**Files:** `.github/`  
**Evidence:** No dependency update automation configured.  
**Best Practice:** Dependabot for security updates, Renovate for dependency management  
**Fix:** Add `.github/dependabot.yml` for npm security updates  
**Est:** 1h

#### DEV-09: No Migration Rollback Automation
**Severity:** Medium  
**Files:** `infra/db/migrations/rollback/`  
**Evidence:** Rollback SQL scripts exist but no automation to apply them.  
**Best Practice:** Flyway/D1 rollback patterns, CI rollback pipeline  
**Fix:** Add rollback workflow triggered by manual dispatch  
**Est:** 3h

#### DEV-10: No Build Artifact Caching in CI
**Severity:** Low  
**Files:** `.github/workflows/ci.yml`  
**Evidence:** CI installs dependencies fresh on every run. No pnpm store cache.  
**Best Practice:** GitHub Actions cache, pnpm store caching  
**Fix:** Already partially done (cache: pnpm in setup-node). Verify cache hits.  
**Est:** 30m

---

### Product (Agent 7) — 10 Items

#### PROD-01: No Tenant Onboarding Flow
**Severity:** High  
**Files:** `apps/api/src/routes/workspaces.ts`  
**Evidence:** Workspace activation exists but no guided onboarding wizard or checklist.  
**Best Practice:** Shopify onboarding, Stripe Connect onboarding flow  
**Fix:** Create onboarding checklist endpoint tracking setup completion  
**Est:** 8h

#### PROD-02: No Template Marketplace Browse/Search UI
**Severity:** High  
**Files:** Template API exists but no frontend  
**Evidence:** Template registry is API-only. No marketplace UI for browsing/installing templates.  
**Best Practice:** Shopify App Store, WordPress Plugin Directory, Salesforce AppExchange  
**Fix:** Build marketplace listing page in admin-dashboard  
**Est:** 16h

#### PROD-03: No Analytics/Dashboard for Tenant Admins
**Severity:** Medium  
**Files:** `apps/admin-dashboard/`  
**Evidence:** Admin dashboard serves a basic HTML shell. No data visualization or KPI tracking.  
**Best Practice:** Stripe Dashboard, Shopify admin analytics  
**Fix:** Add key metrics: revenue, installations, active users, support tickets  
**Est:** 12h

#### PROD-04: No Webhook System for External Integrations
**Severity:** Medium  
**Files:** No webhook infrastructure found  
**Evidence:** No webhook registration, delivery, or retry mechanism for external integrations.  
**Best Practice:** Stripe webhook patterns, GitHub webhook delivery  
**Fix:** Build webhook registration + delivery queue using Cloudflare Queues  
**Est:** 12h

#### PROD-05: No Email Notification System
**Severity:** Medium  
**Files:** OTP via Termii SMS, but no email channel  
**Evidence:** No email sending capability for transactional emails (receipts, alerts, onboarding).  
**Best Practice:** SendGrid/Mailgun/Resend integration patterns  
**Fix:** Integrate email provider; create transactional email templates  
**Est:** 8h

#### PROD-06: No Multi-Currency Support
**Severity:** Low  
**Files:** All monetary values hardcoded as NGN kobo  
**Evidence:** Platform is Nigeria-first but "Africa expansion" is stated goal. No currency abstraction.  
**Best Practice:** ISO 4217 currency codes, Stripe multi-currency patterns  
**Fix:** Add currency field to monetary types; keep kobo as NGN default  
**Est:** 8h

#### PROD-07: No Template Version Upgrade Path
**Severity:** Medium  
**Files:** `apps/api/src/routes/templates.ts`  
**Evidence:** Templates have versions but no upgrade mechanism (install v1 → upgrade to v2).  
**Best Practice:** Shopify app updates, WordPress plugin auto-updates  
**Fix:** Add `POST /templates/:slug/upgrade` endpoint with migration hooks  
**Est:** 8h

#### PROD-08: No User Feedback/Rating System for Templates
**Severity:** Low  
**Files:** No rating/review infrastructure  
**Evidence:** Template marketplace has no user ratings, reviews, or feedback mechanism.  
**Best Practice:** App Store review patterns, Shopify App Store ratings  
**Fix:** Add template_reviews table + rating endpoints  
**Est:** 6h

#### PROD-09: No Billing/Subscription Enforcement Engine
**Severity:** High  
**Files:** `packages/entitlements/src/`  
**Evidence:** Entitlement evaluation exists but no automated billing enforcement (plan expiry, overage).  
**Best Practice:** Stripe Billing, RevenueCat subscription patterns  
**Fix:** Implement plan lifecycle management with grace periods  
**Est:** 12h

#### PROD-10: No Support Ticket System
**Severity:** Low  
**Files:** No support infrastructure  
**Evidence:** No in-app support system, ticket creation, or help desk integration.  
**Best Practice:** Zendesk, Intercom integration patterns  
**Fix:** Add support ticket API with priority and SLA tracking  
**Est:** 8h

---

### SEO (Agent 8) — 5 Items

#### SEO-01: No robots.txt on Public-Facing Workers
**Severity:** Medium  
**Files:** `apps/public-discovery/`, `apps/brand-runtime/`  
**Evidence:** No `GET /robots.txt` route. Search engines may crawl admin/API routes.  
**Best Practice:** Google Search Central robots.txt guide, Cloudflare Workers SEO  
**Fix:** Add robots.txt route allowing `/discover/*` and blocking `/api/*`, `/admin/*`  
**Est:** 30m

#### SEO-02: No Sitemap Generation
**Severity:** Medium  
**Files:** `apps/public-discovery/`, `apps/brand-runtime/`  
**Evidence:** No `/sitemap.xml` endpoint for search engine crawling.  
**Best Practice:** Google Search Central sitemap guide, dynamic sitemap patterns  
**Fix:** Generate dynamic sitemap from published profiles/listings  
**Est:** 4h

#### SEO-03: Missing Structured Data on Listing Pages
**Severity:** Medium  
**Files:** `apps/public-discovery/src/routes/listings.ts`  
**Evidence:** Profile pages have JSON-LD but listing/category pages do not.  
**Best Practice:** Schema.org LocalBusiness, Google Rich Results guide  
**Fix:** Add JSON-LD for listing categories (ItemList schema)  
**Est:** 3h

#### SEO-04: No Page Speed Optimization for Discovery Pages
**Severity:** Low  
**Files:** `apps/public-discovery/src/templates/base.ts`  
**Evidence:** No critical CSS inlining, no lazy loading directives, no preload hints.  
**Best Practice:** Google Core Web Vitals, Cloudflare speed optimization  
**Fix:** Inline critical CSS; add `loading="lazy"` to images; add preload hints  
**Est:** 4h

#### SEO-05: No Open Graph Images for Social Sharing
**Severity:** Low  
**Files:** `apps/brand-runtime/src/routes/branded-page.ts:88`  
**Evidence:** OG image only set if tenant provides one. No platform default.  
**Best Practice:** Facebook/Twitter sharing guidelines, OG image best practices  
**Fix:** Add default WebWaka OG image; generate dynamic OG images for tenants  
**Est:** 4h

---

### Monetization (Agent 9) — 5 Items

#### MON-01: No Payment Gateway for Template Purchases
**Severity:** High  
**Files:** `apps/api/src/routes/templates.ts`  
**Evidence:** Template `price_kobo` field exists but no purchase flow or payment collection.  
**Best Practice:** Shopify app billing API, Stripe Connect marketplace payments  
**Fix:** Integrate Paystack payment flow for template purchases  
**Est:** 12h

#### MON-02: No Revenue Share Tracking
**Severity:** Medium  
**Files:** No revenue tracking tables  
**Evidence:** Template publishing docs mention 70/30 revenue split but no implementation.  
**Best Practice:** Stripe Connect split payments, marketplace commission patterns  
**Fix:** Add revenue_splits table + Paystack subaccount integration  
**Est:** 8h

#### MON-03: No Usage Metering for AI Features
**Severity:** Medium  
**Files:** `apps/api/src/routes/superagent.ts`  
**Evidence:** AI entitlement checks exist but no usage metering/billing for token consumption.  
**Best Practice:** OpenAI usage API, Vercel AI SDK billing  
**Fix:** Track AI token usage per tenant; enforce monthly quotas  
**Est:** 6h

#### MON-04: No Free Tier Limits Enforcement
**Severity:** Medium  
**Files:** `packages/entitlements/src/evaluate.ts`  
**Evidence:** Entitlement evaluation framework exists but free tier limits not fully enforced at API level.  
**Best Practice:** Stripe pricing tables, Vercel free tier patterns  
**Fix:** Add middleware to check usage counters against plan limits  
**Est:** 6h

#### MON-05: No Subscription Upgrade/Downgrade Flow
**Severity:** Medium  
**Files:** No subscription management endpoints  
**Evidence:** Plan types exist in entitlements but no API for plan changes.  
**Best Practice:** Stripe Customer Portal, Paddle subscription management  
**Fix:** Build plan upgrade/downgrade API with proration logic  
**Est:** 10h

---

### Governance (Agent 10) — 5 Items

#### GOV-01: 13 TODO Items in Governance Document Update Plan
**Severity:** Medium  
**Files:** `docs/governance/superagent/05-document-update-plan.md`  
**Evidence:** 13 documentation tasks marked as "🔲 TODO" — none completed.  
**Best Practice:** Documentation-driven development, ADR maintenance  
**Fix:** Complete all 13 governance document updates  
**Est:** 8h

#### GOV-02: No Developer Onboarding Documentation
**Severity:** Medium  
**Files:** No CONTRIBUTING.md or getting-started guide  
**Evidence:** No guide for new developers to set up, run, and contribute to the platform.  
**Best Practice:** GitHub CONTRIBUTING.md, Stripe developer docs  
**Fix:** Create CONTRIBUTING.md with setup, architecture overview, and PR guide  
**Est:** 4h

#### GOV-03: No API Client SDK or Documentation Portal
**Severity:** Medium  
**Files:** `apps/api/src/routes/openapi.ts` exists but no SDK  
**Evidence:** OpenAPI spec exists but no auto-generated client SDK or hosted docs.  
**Best Practice:** Swagger UI, Redoc, OpenAPI Generator for client SDKs  
**Fix:** Deploy Swagger UI at `/docs`; generate TypeScript client SDK  
**Est:** 6h

#### GOV-04: Architecture Decision Records Incomplete
**Severity:** Low  
**Files:** `docs/architecture/decisions/`  
**Evidence:** ADR directory exists but decisions are sparse and not consistently formatted.  
**Best Practice:** ADR format (Michael Nygard), Lightweight Architecture Decision Records  
**Fix:** Backfill ADRs for: D1 choice, JWT auth, multi-tenancy, AI abstraction  
**Est:** 4h

#### GOV-05: No Changelog or Release Notes Automation
**Severity:** Low  
**Files:** No CHANGELOG.md automation  
**Evidence:** Release notes in docs but no auto-generated changelog from commits.  
**Best Practice:** Conventional Commits, semantic-release, Changesets  
**Fix:** Add semantic-release or Changesets to CI  
**Est:** 4h

---

## 3. PRIORITIZED ROADMAP (12 Weeks)

### Sprint 1: Critical Bugs + Quick Wins (Week 1) ✅ DONE
| Task | Enhancement | Est | Priority | Status |
|---|---|---|---|---|
| 1.1 | SEC-01: Add auth to `/admin/*` routes | 1h | P0 | ✅ Done |
| 1.2 | SEC-02: Fix wildcard CORS on projections | 2h | P0 | ✅ Done |
| 1.3 | SEC-06: Fix wildcard CORS on tenant-public | 2h | P0 | ✅ Done |
| 1.4 | SEC-03: Add login-specific rate limiting | 1h | P0 | ✅ Done |
| 1.5 | BUG-06: Sync compatibility_date (ARC-03) | 15m | P0 | ✅ Done |
| 1.6 | ARC-02: Remove orphaned KV bindings | 15m | P0 | ✅ Done |
| 1.7 | SEC-07: Add security headers to all workers | 1h | P0 | ✅ Done |
| 1.8 | SEC-08: Gate localhost CORS behind env check | 30m | P0 | ✅ Done |
| 1.9 | SEO-01: Add robots.txt | 30m | P1 | ✅ Done |
| 1.10 | SEC-13: Add request body size limits | 30m | P1 | ✅ Done |
| **Total** | | **~9h** | | **10/10 done** |

### Sprint 2: Security Hardening (Week 2) ✅ DONE
| Task | Enhancement | Est | Status |
|---|---|---|---|
| 2.1 | SEC-04: Implement refresh token rotation | 8h | ✅ Done |
| 2.2 | SEC-05: Increase PBKDF2 iterations to 600k | 4h | ✅ Done |
| 2.3 | SEC-09: Add password complexity validation | 2h | ✅ Done |
| 2.4 | SEC-10: Implement KV-backed token blacklist | 4h | ✅ Done |
| 2.5 | SEC-15: Fail on missing PRICE_LOCK_SECRET | 1h | ✅ Done |
| 2.6 | SEC-16: Log failed auth attempts with IP | 1h | ✅ Done |
| **Total** | | **~20h** | **6/6 done** |

### Sprint 3: Testing + Architecture Foundation (Weeks 3-4) ✅ DONE
| Task | Enhancement | Est | Status |
|---|---|---|---|
| 3.1 | QA-01: Auth routes test suite | 8h | ✅ Done |
| 3.2 | QA-11: Cross-tenant isolation tests | 8h | ✅ Done |
| 3.3 | DEV-05: Add `pnpm test` to CI | 1h | ✅ Done |
| 3.4 | ARC-01: Deployment configs for 4 apps | 4h | ✅ Done |
| 3.5 | ARC-04: D1/KV bindings for partner-admin | 1h | ✅ Done |
| 3.6 | ARC-05: Shared CORS configuration package | 4h | ✅ Done |
| 3.7 | ARC-06: Standardized error response schemas | 8h | ✅ Done |
| 3.8 | ARC-11: Health endpoints on all workers | 2h | ✅ Done |
| **Total** | | **~36h** | **8/8 done** |

### Sprint 4: Remaining High Priority (Week 5) ✅ DONE
| Task | Enhancement | Est | Status |
|---|---|---|---|
| 4.1 | SEC-14: Template manifest schema validation | 3h | ✅ Done |
| 4.2 | ARC-19: Request correlation IDs | 4h | ✅ Done |
| 4.3 | DEV-01: Staging validation gate for prod deploy | 3h | ✅ Done |
| 4.4 | ARC-12: Migration validation in CI | 4h | ✅ Done |
| **Total** | | **~14h** | **4/4 done** |

### Sprint 5: Performance Optimization (Week 6) ✅ DONE
| Task | Enhancement | Est | Status |
|---|---|---|---|
| 5.1 | PERF-01: CDN cache headers on static assets | 2h | ✅ Done |
| 5.2 | PERF-02: Geography cache warming strategy | 4h | ✅ Done |
| 5.3 | PERF-03: Cursor-based pagination for templates | 4h | ✅ Done |
| 5.4 | PERF-06: Response compression middleware | 1h | ✅ Done |
| 5.5 | PERF-08: Discovery search result caching | 4h | ✅ Done |
| 5.6 | PERF-04: Database index audit | 6h | ✅ Done |
| **Total** | | **~21h** | **6/6 done** |

### Sprint 6: DevOps Hardening (Week 7) ✅ DONE
| Task | Enhancement | Est | Status |
|---|---|---|---|
| 6.1 | DEV-01: Staging validation gate for prod deploy | 3h | ✅ Done |
| 6.2 | DEV-04: Configure monitoring/alerting | 6h | ✅ Done |
| 6.3 | DEV-06: Branch protection rules | 1h | ✅ Done |
| 6.4 | DEV-08: Add Dependabot configuration | 1h | ✅ Done |
| 6.5 | DEV-09: Migration rollback automation | 3h | ✅ Done |
| 6.6 | DEV-02: Rollback procedure documentation | 2h | ✅ Done |
| 6.7 | DEV-03: Secret rotation documentation | 4h | ✅ Done |
| 6.8 | DEV-10: CI cache optimization | 30m | ✅ Done |
| **Total** | | **~20h** | **8/8 done** |

### Sprint 7: Product Foundation (Week 8) ✅ DONE
| Task | Enhancement | Est | Status |
|---|---|---|---|
| 7.1 | PROD-01: Tenant onboarding flow | 8h | ✅ Done |
| 7.2 | PROD-07: Template version upgrade path | 8h | ✅ Done |
| 7.3 | PROD-09: Billing enforcement engine | 12h | ✅ Done |
| **Total** | | **~28h** | **3/3 done** |

### Sprint 8: UX & Accessibility (Week 9)
| Task | Enhancement | Est |
|---|---|---|
| 8.1 | UX-01: Accessibility audit + ARIA attributes | 8h |
| 8.2 | UX-02: Skip navigation links | 2h |
| 8.3 | UX-03: Loading states in PWA shell | 3h |
| 8.4 | UX-04: Offline fallback page | 2h |
| 8.5 | UX-07: Responsive navigation | 6h |
| 8.6 | UX-08: Flatten USSD menu depth | 4h |
| **Total** | | **~25h** |

### Sprint 9: Monetization Infrastructure (Week 10) ✅ DONE
| Task | Enhancement | Est | Status |
|---|---|---|---|
| 9.1 | MON-01: Template purchase payment flow | 12h | ✅ Done |
| 9.2 | MON-02: Revenue share tracking | 8h | ✅ Done |
| 9.3 | MON-03: AI usage metering | 6h | ✅ Done |
| 9.4 | MON-04: Free tier limits enforcement | 6h | ✅ Done |
| **Total** | | **~32h** | **4/4 done** |

### Sprint 10: SEO & Discovery (Week 11) ✅ DONE
| Task | Enhancement | Est | Status |
|---|---|---|---|
| 10.1 | SEO-02: Dynamic sitemap generation | 4h | ✅ Done |
| 10.2 | SEO-03: Structured data on listing pages | 3h | ✅ Done |
| 10.3 | SEO-04: Page speed optimization | 4h | ✅ Done |
| 10.4 | SEO-05: Default OG images | 4h | ✅ Done |
| 10.5 | PROD-02: Template marketplace UI | 16h | ✅ Done |
| **Total** | | **~31h** | **5/5 done** |

### Sprint 11: Governance & Documentation (Week 11-12) ✅ DONE
| Task | Enhancement | Est | Status |
|---|---|---|---|
| 11.1 | GOV-01: Complete governance doc TODOs | 8h | ✅ Done |
| 11.2 | GOV-02: Developer onboarding guide (CONTRIBUTING.md) | 4h | ✅ Done |
| 11.3 | GOV-03: API docs portal (Swagger UI at /docs) | 6h | ✅ Done |
| 11.4 | GOV-04: Backfill ADRs (16 ADRs) | 4h | ✅ Done |
| 11.5 | GOV-05: Changelog automation (Changesets) | 4h | ✅ Done |
| **Total** | | **~26h** | **5/5 done** |

### Sprint 12: Polish + Marketplace Launch (Week 12) ✅ DONE
| Task | Enhancement | Est | Status |
|---|---|---|---|
| 12.1 | QA-04: E2E test suite for critical journeys | 12h | ✅ Done |
| 12.2 | QA-05: AI package tests | 6h | ✅ Done |
| 12.3 | UX-15: i18n framework (en, Pidgin — Hausa/Yoruba/Igbo planned) | 16h | ✅ Done |
| 12.4 | PROD-04: Webhook system | 12h | ✅ Done |
| 12.5 | PROD-05: Email notification system | 8h | ✅ Done |
| 12.6 | ARC-20: Canary deployment strategy | 4h | ✅ Done |
| 12.7 | PERF-12: Resource hints (preconnect/prefetch) | 1h | ✅ Done |
| **Total** | | **~59h** | **7/7 done** |

---

## 4. IMPLEMENTATION PROCESS

### PR Template
```
- [ ] Addresses enhancement #XX (SEC/ARC/UX/PERF/QA/DEV/PROD/SEO/MON/GOV)
- [ ] Tests added/updated
- [ ] Governance checks pass (`pnpm run governance:check`)
- [ ] Platform invariants verified (T3 tenant isolation, T4 integer kobo, P7 no direct AI, P10 NDPR)
- [ ] Docs updated (if API change)
- [ ] No new console.log in production code (use structured logger)
```

### Merge Process
1. CI green (typecheck + test + governance)
2. Code review by relevant specialist
3. Founder approval on Critical/High items
4. Merge to staging → auto-deploy staging
5. Smoke test on staging
6. Promote to production (manual approval)

### Severity Definitions
- **Critical:** Security vulnerability or data breach risk. Fix within 24h.
- **High:** Feature blocker or significant risk. Fix within 1 week.
- **Medium:** Quality/performance issue. Fix within 1 sprint.
- **Low:** Nice-to-have improvement. Schedule in backlog.

---

## 5. VERIFICATION MATRIX

| # | Enhancement | Status | Sprint | Est Hours |
|---|---|---|---|---|
| SEC-01 | Auth on admin routes | ✅ Done | Sprint 1 | 1h |
| SEC-02 | Fix projections CORS | ✅ Done | Sprint 1 | 2h |
| SEC-03 | Login rate limiting | ✅ Done | Sprint 1 | 1h |
| SEC-04 | Refresh token rotation | ✅ Done | Sprint 2 | 8h |
| SEC-05 | PBKDF2 600k iterations | ✅ Done | Sprint 2 | 4h |
| SEC-06 | Fix tenant-public CORS | ✅ Done | Sprint 1 | 2h |
| SEC-07 | Security headers all workers | ✅ Done | Sprint 1 | 1h |
| SEC-08 | Localhost CORS env guard | ✅ Done | Sprint 1 | 30m |
| SEC-09 | Password complexity | ✅ Done | Sprint 2 | 2h |
| SEC-10 | Token blacklist | ✅ Done | Sprint 2 | 4h |
| SEC-11 | Session table for erasure | ✅ Done | Sprint 2 | 2h |
| SEC-12 | CSRF protection | ✅ Done | Sprint 13 | 3h |
| SEC-13 | Body size limits | ✅ Done | Sprint 1 | 30m |
| SEC-14 | Manifest schema validation | ✅ Done | Sprint 4 | 3h |
| SEC-15 | PriceLock secret required | ✅ Done | Sprint 2 | 1h |
| SEC-16 | Auth failure IP logging | ✅ Done | Sprint 2 | 1h |
| SEC-17 | Audit log KV fallback | ✅ Done | Sprint 13 | 3h |
| SEC-18 | Content-Type validation | ✅ Done | Sprint 13 | 1h |
| ARC-01 | Deployment configs | ✅ Done | Sprint 3 | 4h |
| ARC-02 | Remove orphaned KV | ✅ Done | Sprint 1 | 15m |
| ARC-03 | Sync compat dates | ✅ Done | Sprint 1 | 15m |
| ARC-04 | Partner-admin bindings | ✅ Done | Sprint 3 | 1h |
| ARC-05 | Shared CORS package | ✅ Done | Sprint 3 | 4h |
| ARC-06 | Error response schema | ✅ Done | Sprint 3 | 8h |
| ARC-07 | Split index.ts | ⬜ Open | — | 4h |
| ARC-08 | Vertical code generation | ⬜ Open | — | 16h |
| ARC-09 | D1 connection docs | ⬜ Open | — | 2h |
| ARC-10 | API versioning strategy | ⬜ Open | — | 2h |
| ARC-11 | Health endpoints all workers | ✅ Done | Sprint 3 | 2h |
| ARC-12 | Migration CI validation | ✅ Done | Sprint 4 | 4h |
| ARC-13 | OpenAPI CI linting | ⬜ Open | — | 2h |
| ARC-14 | DI for external services | ⬜ Open | — | 8h |
| ARC-15 | Circuit breaker pattern | ⬜ Open | — | 6h |
| ARC-16 | Event replay docs | ⬜ Open | — | 2h |
| ARC-17 | KV cache graceful degradation | ⬜ Open | — | 3h |
| ARC-18 | SW cache auto-versioning | ⬜ Open | — | 2h |
| ARC-19 | Request correlation IDs | ✅ Done | Sprint 4 | 4h |
| ARC-20 | Canary deployments | ✅ Done | Sprint 12 | 4h |
| UX-01 | Accessibility (ARIA) | ⬜ Open | — | 8h |
| UX-02 | Skip nav links | ✅ Done | Sprint 13 | 2h |
| UX-03 | PWA loading states | ✅ Done | Sprint 8 | 3h |
| UX-04 | Offline fallback page | ✅ Done | Sprint 8 | 2h |
| UX-05 | Form validation UI | ⬜ Open | — | 4h |
| UX-06 | Dark mode | ⬜ Open | — | 6h |
| UX-07 | Responsive navigation | ⬜ Open | — | 6h |
| UX-08 | USSD menu depth | ⬜ Open | — | 4h |
| UX-09 | Error recovery guidance | ⬜ Open | — | 4h |
| UX-10 | Confirmation dialogs | ⬜ Open | — | 2h |
| UX-11 | Responsive viewport | ✅ Done | Sprint 8 | 2h |
| UX-12 | Breadcrumb navigation | ⬜ Open | — | 3h |
| UX-13 | Toast notifications | ⬜ Open | — | 3h |
| UX-14 | Discovery card design | ⬜ Open | — | 4h |
| UX-15 | i18n framework | ✅ Done | Sprint 12 | 16h |
| PERF-01 | CDN cache headers | ✅ Done | Sprint 5 | 2h |
| PERF-02 | Geography cache warming | ✅ Done | Sprint 5 | 4h |
| PERF-03 | Cursor-based pagination | ✅ Done | Sprint 5 | 4h |
| PERF-04 | Database index audit | ✅ Done | Sprint 5 | 6h |
| PERF-05 | FTS for templates | ⬜ Open | — | 4h |
| PERF-06 | Response compression | ✅ Done | Sprint 5 | 1h |
| PERF-07 | Static SW generation | ⬜ Open | — | 2h |
| PERF-08 | Discovery search cache | ✅ Done | Sprint 5 | 4h |
| PERF-09 | Lazy vertical loading | ⬜ Open | — | 6h |
| PERF-10 | ETag support | ⬜ Open | — | 4h |
| PERF-11 | D1 batch optimization | ⬜ Open | — | 4h |
| PERF-12 | Resource hints | ✅ Done | Sprint 12 | 1h |
| QA-01 | Auth route tests | ✅ Done | Sprint 3 | 8h |
| QA-02 | Identity route tests | ⬜ Open | — | 6h |
| QA-03 | Negotiation tests | ⬜ Open | — | 8h |
| QA-04 | E2E test suite | ✅ Done | Sprint 12 | 12h |
| QA-05 | AI package tests | ✅ Done | Sprint 12 | 6h |
| QA-06 | Entity/workspace tests | ⬜ Open | — | 6h |
| QA-07 | Load testing infra | ⬜ Open | — | 8h |
| QA-08 | Smoke tests in CI | ✅ Done | Sprint 13 | 2h |
| QA-09 | External API contract tests | ⬜ Open | — | 6h |
| QA-10 | Template lifecycle test | ⬜ Open | — | 3h |
| QA-11 | Tenant isolation tests | ✅ Done | Sprint 3 | 8h |
| QA-12 | Visual regression tests | ⬜ Open | — | 6h |
| DEV-01 | Staging gate for prod | ✅ Done | Sprint 4/6 | 3h |
| DEV-02 | Rollback documentation | ✅ Done | Sprint 6 | 2h |
| DEV-03 | Secret rotation docs | ✅ Done | Sprint 6 | 4h |
| DEV-04 | Monitoring/alerting | ✅ Done | Sprint 6 | 6h |
| DEV-05 | Tests in CI | ✅ Done | Sprint 3 | 1h |
| DEV-06 | Branch protection | ✅ Done | Sprint 6 | 1h |
| DEV-07 | Local dev setup docs | ⬜ Open | — | 3h |
| DEV-08 | Dependabot config | ✅ Done | Pre-existing | 1h |
| DEV-09 | Rollback automation | ✅ Done | Sprint 6 | 3h |
| DEV-10 | CI cache optimization | ✅ Done | Sprint 6 | 30m |
| PROD-01 | Tenant onboarding | ✅ Done | Sprint 7 | 8h |
| PROD-02 | Marketplace UI | ✅ Done | Sprint 10 | 16h |
| PROD-03 | Admin analytics | ⬜ Open | — | 12h |
| PROD-04 | Webhook system | ✅ Done | Sprint 12 | 12h |
| PROD-05 | Email notifications | ✅ Done | Sprint 12 | 8h |
| PROD-06 | Multi-currency | ⬜ Open | — | 8h |
| PROD-07 | Template upgrades | ✅ Done | Sprint 7 | 8h |
| PROD-08 | Template ratings | ⬜ Open | — | 6h |
| PROD-09 | Billing enforcement | ✅ Done | Sprint 7 | 12h |
| PROD-10 | Support tickets | ⬜ Open | — | 8h |
| SEO-01 | robots.txt | ✅ Done | Sprint 1 | 30m |
| SEO-02 | Sitemap generation | ✅ Done | Sprint 10 | 4h |
| SEO-03 | Listing structured data | ✅ Done | Sprint 10 | 3h |
| SEO-04 | Page speed optimization | ✅ Done | Sprint 10 | 4h |
| SEO-05 | Default OG images | ✅ Done | Sprint 10 | 4h |
| MON-01 | Template payment flow | ✅ Done | Sprint 9 | 12h |
| MON-02 | Revenue share tracking | ✅ Done | Sprint 9 | 8h |
| MON-03 | AI usage metering | ✅ Done | Sprint 9 | 6h |
| MON-04 | Free tier enforcement | ✅ Done | Sprint 9 | 6h |
| MON-05 | Subscription management | ⬜ Open | — | 10h |
| GOV-01 | Governance doc TODOs | ✅ Done | Sprint 11 | 8h |
| GOV-02 | Developer onboarding | ✅ Done | Sprint 11 | 4h |
| GOV-03 | API docs portal | ✅ Done | Sprint 11 | 6h |
| GOV-04 | Backfill ADRs | ✅ Done | Sprint 11 | 4h |
| GOV-05 | Changelog automation | ✅ Done | Sprint 11 | 4h |

**Completed:** 75/112 (67%)  
**Remaining Open:** 37 items (~172 hours estimated)  
**Completed Effort:** ~283 hours across Sprints 1–13

---

*Generated by WebWaka Platform Enhancement Audit — Agent Swarm v1.0*  
*Audit methodology: Full codebase review, static analysis, configuration audit, architecture review*
