# WebWaka OS — Platform Admin Template Guide

**Version:** 1.0.1  
**Status:** ACTIVE

---

## 1. Overview

This guide is for WebWaka platform administrators who manage the template marketplace — reviewing submissions, approving or rejecting templates, monitoring installations, and handling deprecation.

---

## 2. Template Review Process

When a `super_admin` submits a template via `POST /templates`, it enters `pending` status. As a platform admin, review the template for:

### 2.1 Manifest Correctness
- All required fields present and correctly typed
- Version follows semver format
- Platform compatibility range is valid
- Template type matches the actual content

### 2.2 Platform Invariant Compliance
- **T3:** No queries bypass tenant isolation
- **T4:** Monetary values are integer kobo
- **T5:** Entitlement checks are properly wired
- **P7:** No direct AI SDK imports
- **P10:** NDPR consent patterns are followed

### 2.3 Security Review
- No unauthorized data access patterns
- No cross-tenant data leakage
- No hardcoded credentials or secrets
- Dependencies are pinned and vetted

### 2.4 Quality Standards
- Description is clear and accurate
- Slug follows naming conventions
- Version doesn't conflict with existing templates

---

## 3. Approval Workflow

### Approve
Update template status to `approved` in the admin dashboard. The template becomes available in the marketplace immediately.

### Reject
Update template status to `rejected`. Provide clear reasons so the author can fix and resubmit.

### Deprecate
Set status to `deprecated` to remove from marketplace while preserving existing installations.

---

## 4. Monitoring

### Installation Metrics
- Track installation counts per template
- Monitor uninstall/rollback rates (high rates may indicate quality issues)
- Watch for templates causing tenant errors

### API Usage
- Monitor `GET /templates` (marketplace browsing)
- Monitor `POST /templates/:slug/install` (installations)
- Monitor `DELETE /templates/:slug/install` (rollbacks)

### Alert Conditions
- Template causing >1% error rate for installing tenants
- Sudden spike in rollbacks for a specific template
- Template with incompatible `platform_compat` after platform upgrade

---

## 5. Template Marketplace API Reference

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /templates | Public | List approved templates |
| GET | /templates/:slug | Public | Get template details |
| POST | /templates | super_admin | Publish new template |
| GET | /templates/installed | Tenant auth | List tenant's installed templates |
| POST | /templates/:slug/install | Tenant auth | Install template |
| DELETE | /templates/:slug/install | Tenant auth | Rollback installation |

---

## 6. Database Operations

### Direct D1 Queries (for debugging only)

```sql
-- Count templates by status
SELECT status, COUNT(*) FROM template_registry GROUP BY status;

-- Find most-installed templates
SELECT template_slug, COUNT(*) as installs 
FROM template_installations 
WHERE status = 'active' 
GROUP BY template_slug 
ORDER BY installs DESC;

-- Check tenant installations
SELECT ti.*, tr.display_name 
FROM template_installations ti 
JOIN template_registry tr ON ti.template_slug = tr.slug 
WHERE ti.tenant_id = ?;
```
