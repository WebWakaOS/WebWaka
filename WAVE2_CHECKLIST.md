# WebWaka Wave 2 — User Surfaces Enhancement Checklist

**Branch:** staging
**Agent:** Base44 Super Agent
**Date:** 2026-05-01
**Status:** IN PROGRESS

---

## A. FRONTEND EXPERIENCE LAYER

### A1. Marketing Site — Full React SPA upgrade
- [ ] A1-1: Convert single-file App.tsx to multi-page React app with real routes
- [ ] A1-2: Add Features page with detailed vertical showcase
- [ ] A1-3: Add full Pricing page with plan comparison table
- [ ] A1-4: Add Blog/Resources section (static seed posts)
- [ ] A1-5: Add About/Mission page
- [ ] A1-6: Improve hero section — animated counters, video/CTA split
- [ ] A1-7: Add sticky navigation with mobile hamburger menu
- [ ] A1-8: Add footer with full sitemap links
- [ ] A1-9: SEO meta tags, OG image, JSON-LD on all pages
- [ ] A1-10: PWA manifest + offline shell for marketing site

### A2. Workspace App — Missing pages
- [ ] A2-1: Inventory management page (stock levels, low-stock alerts, adjustments)
- [ ] A2-2: Staff/Team management page (invite, roles, permissions, activity log)
- [ ] A2-3: Analytics/Reports page (revenue charts, top products, export CSV)
- [ ] A2-4: Customers page (CRM-lite: customer list, purchase history, notes)
- [ ] A2-5: Notifications page (full list view, mark all read, filter by type)

### A3. Workspace App — UX gaps
- [ ] A3-1: Empty states for all list pages (Offerings, POS with no products, etc.)
- [ ] A3-2: Loading skeletons on Dashboard stat cards
- [ ] A3-3: Mobile BottomNav — add missing pages (Analytics, Customers)
- [ ] A3-4: Global search bar in Sidebar/TopBar
- [ ] A3-5: Onboarding completion redirect — after step 3 go to Dashboard with confetti

---

## B. OPERATIONS PILLAR

### B1. POS enhancements
- [ ] B1-1: Receipt PDF/print export with business branding
- [ ] B1-2: Sales history page with date range filter
- [ ] B1-3: Discount/coupon input field on checkout
- [ ] B1-4: Stock decrement confirmation on low-stock items
- [ ] B1-5: End-of-day summary modal (total sales, total orders, top product)

### B2. Inventory
- [ ] B2-1: Full Inventory page: list all products with stock levels
- [ ] B2-2: Bulk stock adjustment (receive stock, return stock)
- [ ] B2-3: Low-stock threshold settings per product
- [ ] B2-4: Inventory audit log (who changed what and when)
- [ ] B2-5: Export inventory to CSV

### B3. Operational dashboards
- [ ] B3-1: Analytics page — 7/30/90 day revenue trends (line chart)
- [ ] B3-2: Analytics page — top 10 products by revenue
- [ ] B3-3: Analytics page — customer count and repeat rate
- [ ] B3-4: Analytics page — CSV export for accountants

---

## C. BRAND PILLAR

### C1. WakaPage editor
- [ ] C1-1: Block config forms per block type (hero title/subtitle, bio text, CTA URL)
- [ ] C1-2: Block visibility toggle (show/hide without deleting)
- [ ] C1-3: Drag-to-reorder blocks (replace ▲▼ buttons on desktop)
- [ ] C1-4: Preview mode refresh auto-loads on block save
- [ ] C1-5: Publish/Unpublish flow with confirmation and status badge

### C2. Theme/Branding controls
- [ ] C2-1: Theme picker page — choose from preset color themes
- [ ] C2-2: Business logo upload + preview
- [ ] C2-3: Custom domain input field with DNS instructions
- [ ] C2-4: Social links manager (WhatsApp, Instagram, Twitter, Facebook, TikTok)
- [ ] C2-5: SEO settings form (meta title, description, keywords)

### C3. Brand-runtime public UX
- [ ] C3-1: Mobile-responsive public page template
- [ ] C3-2: Contact form submission confirmation flow
- [ ] C3-3: Offering catalogue block renders real offerings from API
- [ ] C3-4: Gallery block with lightbox

---

## D. DISCOVERY PILLAR

### D1. Public discovery app — full React SPA
- [ ] D1-1: Build `apps/public-discovery` as full React SPA (replace HTML-only worker)
- [ ] D1-2: Landing/search page with location + category filters
- [ ] D1-3: Category browsing page (grid of vertical categories)
- [ ] D1-4: Geography filter (state → LGA → ward)
- [ ] D1-5: Business listing cards with name, category, location, trust score
- [ ] D1-6: Business profile detail page (full WakaPage embed)
- [ ] D1-7: Search results page with pagination
- [ ] D1-8: Claim CTA on unclaimed profiles
- [ ] D1-9: Mobile-first responsive layout
- [ ] D1-10: SEO — server-side meta tags via Worker for each listing

---

## E. PARTNER AND PLATFORM ADMINISTRATION

### E1. Partner Admin — full React SPA
- [ ] E1-1: Replace static HTML splash with real React SPA
- [ ] E1-2: Partner overview dashboard (sub-tenant count, credit balance, revenue)
- [ ] E1-3: Sub-tenant management list with status and plan
- [ ] E1-4: White-label branding controls (logo, colors, domain)
- [ ] E1-5: Credit pool management (purchase credits, view usage history)
- [ ] E1-6: Settlement history table
- [ ] E1-7: Partner onboarding wizard (first-login flow)

### E2. Platform Admin — full control plane
- [ ] E2-1: Super-admin overview dashboard (tenant count, revenue, alerts)
- [ ] E2-2: Tenant management — list, search, suspend, activate
- [ ] E2-3: Claims review queue (already partial — expand to full UI)
- [ ] E2-4: Template marketplace approval queue
- [ ] E2-5: AI HITL queue (already partial in workspace-app — promote to platform-admin)
- [ ] E2-6: Audit log viewer with filter by actor/action/entity
- [ ] E2-7: Feature flag/rollout controls per tenant or plan
- [ ] E2-8: Platform settings (USSD shortcode, VAT rate, platform fees)
- [ ] E2-9: Support ticket queue (basic view/respond)
- [ ] E2-10: Partner management (approve/suspend partners, view sub-tenants)

---

## Implementation Order

| Batch | Items | Priority |
|-------|-------|----------|
| Batch 1 | A2-1 (Inventory), A2-3 (Analytics), B1-1 (Receipt export), B2 (Inventory page) | CRITICAL |
| Batch 2 | C1 (WakaPage block forms), C2 (Theme controls) | HIGH |
| Batch 3 | E1 (Partner Admin SPA), E2 (Platform Admin expansion) | HIGH |
| Batch 4 | D1 (Public Discovery SPA) | HIGH |
| Batch 5 | A1 (Marketing site upgrade), A3 (UX gaps) | MEDIUM |
| Batch 6 | B3 (Op dashboards), C3 (Brand runtime), B1 remaining | MEDIUM |

