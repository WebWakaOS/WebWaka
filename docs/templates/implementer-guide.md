# WebWaka OS — Template Implementer Guide

**Version:** 1.0.1  
**Status:** ACTIVE

---

## 1. Getting Started

This guide is for developers building templates for the WebWaka OS platform. Templates extend tenant workspaces with new functionality — dashboards, websites, workflows, and more.

---

## 2. Development Setup

### Prerequisites
- Node.js 18+
- Access to WebWaka monorepo
- Understanding of platform invariants (see [Template Spec](./template-spec.md))

### Project Structure

```
my-template/
├── src/
│   ├── index.ts           # Entry point
│   ├── components/        # UI components (dashboard/website types)
│   ├── routes/            # Route handlers
│   └── config.ts          # Default configuration
├── manifest.json          # Template manifest
├── package.json
└── README.md
```

---

## 3. Platform Invariants Checklist

Before submitting your template, verify compliance:

- [ ] **T3:** All database queries include `tenant_id` filter
- [ ] **T4:** All monetary values use integer kobo (multiply NGN by 100)
- [ ] **T5:** Feature access checks entitlements via middleware
- [ ] **P7:** AI features use SuperAgent gateway, not direct SDK calls
- [ ] **P10:** PII processing requires NDPR consent
- [ ] **P13:** Minor data (nursery, orphanage) uses L3 HITL governance

---

## 4. Configuration

Templates can define a `config_schema` in their manifest. When a tenant installs the template, they can provide configuration values that match this schema.

```json
{
  "config_schema": {
    "type": "object",
    "properties": {
      "business_hours": {
        "type": "object",
        "properties": {
          "open": { "type": "string", "default": "08:00" },
          "close": { "type": "string", "default": "22:00" }
        }
      },
      "currency": { "type": "string", "default": "NGN" },
      "tax_rate_bps": { "type": "integer", "default": 750 }
    }
  }
}
```

Access config in your template:
```typescript
const config = await getTemplateConfig(tenantId, templateSlug);
const taxRate = config.tax_rate_bps; // 750 = 7.5%
```

---

## 5. Vertical Compatibility

If your template is specific to certain verticals, declare them in `compatible_verticals`:

```json
{
  "compatible_verticals": ["restaurant", "fast-food", "catering"]
}
```

The platform will prevent installation on incompatible verticals. If `compatible_verticals` is empty or omitted, the template is available for all verticals.

---

## 6. Rollback Strategy

Templates must define how they handle uninstallation:

| Strategy | Behavior |
|---|---|
| `soft_delete` | Mark installation as rolled_back; data preserved |
| `archive` | Move data to archive tables; reversible |
| `purge` | Delete all template data (use with caution) |

Default is `soft_delete`. All rollbacks are executed via `DELETE /templates/:slug/install`.

---

## 7. Testing

1. **Unit tests:** Test your template logic in isolation
2. **Integration tests:** Test against the template validator
3. **Platform tests:** Verify invariant compliance

```bash
# Validate your manifest
npx vitest run packages/verticals/src/template-validator.test.ts

# Test with the API
curl -X POST http://localhost:8787/templates \
  -H "Authorization: Bearer $TOKEN" \
  -d @manifest.json
```

---

## 8. Common Patterns

### Dashboard Template
- Register routes in `manifest.routes`
- Use `@webwaka/frontend` for UI composition
- Fetch data through authenticated API calls

### Website Template
- Define public pages in `manifest.routes`
- Use `@webwaka/frontend` for the tenant public shell
- SEO: include `meta` configuration in manifest

### Workflow Template
- Define trigger events in manifest
- Use `@webwaka/jobs` for background processing
- Respect rate limits and idempotency
