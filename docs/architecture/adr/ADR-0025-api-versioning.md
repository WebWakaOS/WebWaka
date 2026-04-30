# ADR-0025: API Versioning Strategy

## Status

Accepted

## Context

WebWaka API currently uses `X-API-Version: 1` header globally. As the platform
evolves, we need a clear strategy for introducing breaking changes without
disrupting existing integrations (partner webhooks, mobile apps, USSD flows).

## Decision

### Versioning Approach: Header-Based with URL Prefix Fallback

1. **Primary**: `X-API-Version` request header (already implemented)
2. **Secondary**: `/v2/` URL prefix for major version bumps
3. **Sunset**: RFC 8594 `Sunset` header for deprecated endpoints

### Version Lifecycle

```
┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│  Preview  │ ──▸ │  Stable   │ ──▸ │Deprecated │ ──▸ │  Removed  │
│ (v2-beta) │     │   (v2)    │     │   (v1)    │     │   (v1)    │
└───────────┘     └───────────┘     └───────────┘     └───────────┘
     0-30d              ∞              90 days           After sunset
```

### Rules

1. **Patch/Minor changes** (no version bump required):
   - Adding new optional fields to responses
   - Adding new endpoints
   - Adding new optional query parameters
   - Relaxing validation rules

2. **Major changes** (version bump required):
   - Removing fields from responses
   - Changing field types or semantics
   - Removing endpoints
   - Changing authentication requirements
   - Restructuring response envelopes

3. **Sunset policy**:
   - Deprecated versions receive `Sunset` header 90 days before removal
   - `Sunset: Sat, 01 Nov 2025 00:00:00 GMT`
   - Deprecation announced via changelog and partner notifications
   - After sunset: return 410 Gone with migration instructions

### Implementation

```typescript
// Middleware to handle versioning
app.use('*', async (c, next) => {
  const version = c.req.header('X-API-Version') || '1';
  c.set('apiVersion', version);

  await next();

  // Add version info to response
  c.header('X-API-Version', version);

  // Add sunset header for deprecated versions
  if (version === '1' && hasSunsetDate('v1')) {
    c.header('Sunset', 'Sat, 01 Nov 2025 00:00:00 GMT');
    c.header('Deprecation', 'true');
    c.header('Link', '</v2/docs>; rel="successor-version"');
  }
});
```

## Consequences

- Partners have 90 days minimum to migrate
- No surprise breakage for existing integrations
- Clear migration path documented
- USSD flows (stateless) can be migrated separately from API consumers
