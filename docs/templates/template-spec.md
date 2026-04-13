# WebWaka OS — Template Specification

**Version:** 1.0.1  
**Status:** ACTIVE  
**Last updated:** 2026-04-12

---

## 1. Overview

A **template** is a reusable package that adds functionality to a WebWaka tenant workspace. Templates are the primary extensibility mechanism for the platform — they package UI dashboards, public websites, vertical-specific workflows, email layouts, and modular features into installable units.

Templates are distributed through the **Template Registry** (D1 table `template_registry`) and installed per-tenant via the **Template Installations** table (`template_installations`).

---

## 2. Template Types

| Type | Description | Examples |
|---|---|---|
| `dashboard` | Admin or operational dashboard UI | Restaurant POS dashboard, School admin panel |
| `website` | Public-facing tenant website | Retail storefront, Professional portfolio |
| `vertical-blueprint` | Full vertical implementation package | Complete restaurant vertical, School management system |
| `workflow` | Automated business process | Invoice reminder flow, Appointment booking flow |
| `email` | Email template layout | Welcome email, Payment receipt, Weekly digest |
| `module` | Standalone feature module | Analytics widget, Chat support plugin |

---

## 3. Manifest Structure

Every template must include a `manifest_json` object conforming to this schema:

```json
{
  "name": "restaurant-dashboard",
  "version": "1.0.0",
  "platform_compat": ">=1.0.1",
  "template_type": "dashboard",
  "entry_point": "src/index.ts",
  "routes": [
    { "path": "/menu", "component": "MenuManager" },
    { "path": "/orders", "component": "OrderQueue" },
    { "path": "/tables", "component": "TableBooking" }
  ],
  "permissions": ["read:menu", "write:orders", "read:tables"],
  "dependencies": {
    "@webwaka/pos": ">=0.1.0",
    "@webwaka/payments": ">=0.1.0"
  },
  "config_schema": {
    "type": "object",
    "properties": {
      "currency": { "type": "string", "default": "NGN" },
      "tax_rate_bps": { "type": "integer", "default": 750 }
    }
  },
  "compatible_verticals": ["restaurant", "fast-food", "catering"],
  "ai_level": "L2",
  "data_retention_days": 365,
  "rollback_strategy": "soft_delete"
}
```

### Required Fields

| Field | Type | Description |
|---|---|---|
| `name` | string | Unique template identifier (matches slug) |
| `version` | string | Semver version string |
| `platform_compat` | string | Minimum platform version (semver range) |
| `template_type` | string | One of the 6 template types |
| `entry_point` | string | Main source file path |

### Optional Fields

| Field | Type | Description |
|---|---|---|
| `routes` | array | UI routes the template registers |
| `permissions` | array | Required permission scopes |
| `dependencies` | object | Package dependencies with version ranges |
| `config_schema` | object | JSON Schema for tenant-level configuration |
| `compatible_verticals` | array | Which verticals this template works with |
| `ai_level` | string | AI governance level (L0-L3) |
| `data_retention_days` | integer | Data retention policy |
| `rollback_strategy` | string | How to handle uninstallation |

---

## 4. Database Schema

### template_registry

```sql
CREATE TABLE IF NOT EXISTS template_registry (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK(template_type IN ('dashboard','website','vertical-blueprint','workflow','email','module')),
  version TEXT NOT NULL,
  platform_compat TEXT NOT NULL,
  compatible_verticals TEXT NOT NULL DEFAULT '[]',
  manifest_json TEXT NOT NULL,
  author_tenant_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','pending_review','approved','deprecated')),
  is_free INTEGER NOT NULL DEFAULT 1,
  price_kobo INTEGER NOT NULL DEFAULT 0,
  install_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

### template_installations

```sql
CREATE TABLE IF NOT EXISTS template_installations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  template_id TEXT NOT NULL REFERENCES template_registry(id),
  template_version TEXT NOT NULL,
  installed_at INTEGER NOT NULL,
  installed_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','rolled_back','failed')),
  config_json TEXT NOT NULL DEFAULT '{}',
  UNIQUE(tenant_id, template_id)
);
```

---

## 5. Platform Invariants

All templates MUST comply with these invariants:

| Code | Rule |
|---|---|
| T3 | All database queries must include `tenant_id` |
| T4 | All monetary values in integer kobo — no floats |
| T5 | Entitlement checks before feature access |
| P7 | No direct AI SDK calls — use SuperAgent gateway |
| P10 | NDPR consent required before PII processing |
| P13 | Minor-related data requires L3 HITL governance |

---

## 6. Lifecycle

```
DRAFT → PENDING_REVIEW → APPROVED → INSTALLED (active)
                       ↘ (manual)       ↓
                        DEPRECATED    ROLLED_BACK → re-installable
```

1. **Author** submits template via `POST /templates` (super_admin only)
2. **Platform** validates manifest and marks as `pending_review`
3. **Reviewer** approves or deprecates via admin dashboard
4. **Tenant admin** installs via `POST /templates/:slug/install`
5. **Tenant admin** can rollback via `DELETE /templates/:slug/install`
6. **Re-installation** after rollback reactivates the existing record (preserves UNIQUE constraint)
