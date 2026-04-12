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
CREATE TABLE template_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('dashboard','website','vertical-blueprint','workflow','email','module')),
  version TEXT NOT NULL,
  platform_compat TEXT NOT NULL,
  compatible_verticals TEXT DEFAULT '[]',
  manifest_json TEXT NOT NULL,
  author_tenant_id TEXT,
  price_kobo INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','deprecated')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### template_installations

```sql
CREATE TABLE template_installations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  template_slug TEXT NOT NULL,
  installed_version TEXT NOT NULL,
  config_json TEXT DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled','pending_upgrade')),
  installed_at TEXT NOT NULL DEFAULT (datetime('now')),
  installed_by TEXT NOT NULL,
  UNIQUE(tenant_id, template_slug)
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
CREATED → PENDING → APPROVED → INSTALLED → [DISABLED | ACTIVE]
                  ↘ REJECTED     ↓
                                UNINSTALLED (soft delete)
```

1. **Author** submits template via `POST /templates` (super_admin only)
2. **Platform** validates manifest and marks as `pending`
3. **Reviewer** approves or rejects via admin dashboard
4. **Tenant admin** installs via `POST /templates/:slug/install`
5. **Tenant admin** can disable or rollback via `DELETE /templates/:slug/install`
