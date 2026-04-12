# WebWaka OS — Release Notes v1.0.1

**Release Date:** 2026-04-12  
**Tag:** `v1.0.1`  
**Branch:** `staging`

---

## Summary

v1.0.1 is the Foundation + Template Architecture release. It introduces the template marketplace system, production hardening features, Africa-first extensibility interfaces, and comprehensive governance documentation.

---

## What's New

### Template Marketplace (Sprint 1)
- **Template Registry:** D1 migrations 0206-0207 create `template_registry` and `template_installations` tables with rollback scripts
- **Template API:** 6 routes — list, get, publish, install, list installed, rollback
  - `GET /templates` — paginated listing with type/vertical filters
  - `GET /templates/:slug` — manifest details
  - `POST /templates` — publish (super_admin only)
  - `POST /templates/:slug/install` — install to tenant
  - `GET /templates/installed` — tenant's installed templates
  - `DELETE /templates/:slug/install` — rollback installation
- **Template Validator:** `@webwaka/verticals` package with 50 passing tests covering slug, version, type, price, platform compatibility, and manifest validation

### Production Hardening (Sprint 2)
- **Structured Error Tracking:** JSON error logs with route, method, tenantId, environment context (PII-safe)
- **OpenAPI 3.1 Specification:** Full API spec at `/openapi.json` with all routes documented
- **Admin Dashboard:** PWA-ready shell with 6 views — Overview, Verticals, Members, Claims, Entitlements, Templates
- **Partner Admin:** PWA-ready shell with 4 views — Tenants, Branding, Templates, Analytics
- **Monitoring Runbook:** Comprehensive alerting thresholds, incident runbooks, and post-incident review template

### Africa-First Interfaces (Sprint 3)
- **CountryConfig:** Extensible country configuration with currency, geography, identity, payments, regulatory, and localization sections
- **PaymentProviderConfig:** Multi-provider payment configuration with amount limits and settlement terms
- **IdentityProvider:** Provider-agnostic identity verification with rate limits and KYC tier mapping
- **RegulatoryConfig:** Data protection (NDPR), financial (CBN), and telecom (NCC) regulatory compliance
- **NIGERIA_CONFIG:** Complete Nigeria configuration as the first country implementation
- **LocalizationConfig:** Multi-language support with en-NG, Yoruba, Hausa, Igbo, and Pidgin

### Documentation (Sprint 3)
- Template Specification — manifest structure, database schema, lifecycle
- Template Validation Guide — pipeline stages, error codes, test suite
- Template Publishing Guide — submission flow, pricing, versioning, deprecation
- Template Implementer Guide — development setup, invariant checklist, common patterns
- Platform Admin Template Guide — review process, monitoring, database operations

---

## Platform Invariants Enforced

| Code | Description | Status |
|---|---|---|
| T3 | tenant_id on all queries | Enforced |
| T4 | Integer kobo, no floats | Enforced |
| T5 | Entitlement checks | Enforced |
| T6 | Geography-driven discovery | Enforced |
| P7 | No direct AI SDK calls | Enforced |
| P10 | NDPR consent required | Enforced |

---

## Migration Guide

### From v1.0.0 to v1.0.1

1. Run D1 migrations 0206 and 0207:
   ```bash
   npx wrangler d1 migrations apply webwaka-db --config apps/api/wrangler.toml
   ```

2. No breaking API changes — all new routes are additive

3. Template marketplace is opt-in — no configuration changes needed for existing tenants

---

## File Changes

### New Files
- `infra/db/migrations/0206_create_template_registry.sql`
- `infra/db/migrations/0207_create_template_installations.sql`
- `infra/db/migrations/rollback/0206_rollback.sql`
- `infra/db/migrations/rollback/0207_rollback.sql`
- `apps/api/src/routes/templates.ts`
- `apps/api/src/routes/openapi.ts`
- `packages/verticals/src/template-validator.ts`
- `packages/verticals/src/template-validator.test.ts`
- `packages/logging/src/error-tracker.ts`
- `packages/types/src/africa-first.ts`
- `apps/admin-dashboard/public/index.html`
- `apps/admin-dashboard/public/manifest.json`
- `apps/admin-dashboard/public/sw.js`
- `apps/partner-admin/public/index.html`
- `apps/partner-admin/public/manifest.json`
- `apps/partner-admin/public/sw.js`
- `docs/governance/monitoring-runbook.md`
- `docs/templates/template-spec.md`
- `docs/templates/template-validation.md`
- `docs/templates/template-publishing.md`
- `docs/templates/implementer-guide.md`
- `docs/templates/platform-admin-guide.md`
- `docs/RELEASE-v1.0.1.md`

### Modified Files
- `apps/api/src/index.ts` — structured error handler, OpenAPI mount, template routes
- `apps/api/src/routes/health.ts` — version bump to 1.0.1
- `packages/logging/src/index.ts` — error-tracker exports
- `packages/verticals/src/index.ts` — template validator exports

---

## Known Limitations

1. Template content (source code) is not stored in the registry — manifests only
2. Template auto-upgrade not yet implemented (planned for v1.1)
3. Partner template publishing not yet available (planned for v1.1)
4. Admin dashboard views show placeholder data — will connect to live API in v1.1

---

## Contributors

WebWaka Platform Team
