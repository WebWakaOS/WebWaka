# WebWaka OS — Template Publishing Guide

**Version:** 1.0.1  
**Status:** ACTIVE

---

## 1. Who Can Publish

Only users with the `super_admin` role can publish templates to the registry. This is enforced at the API level in `POST /templates`.

Future plans (v1.1+) will introduce a partner publishing flow where approved partners can submit templates for review.

---

## 2. Publishing Flow

### Step 1: Prepare Manifest

Create a manifest JSON object following the [Template Spec](./template-spec.md). Ensure all required fields are present.

### Step 2: Validate Locally

Use the validator package to check your manifest before submission:

```typescript
import { validateTemplateManifest } from '@webwaka/verticals';

const result = validateTemplateManifest(myManifest);
if (!result.valid) {
  console.error('Fix these errors:', result.errors);
}
```

### Step 3: Submit via API

```bash
curl -X POST https://api.webwaka.com/templates \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "restaurant-dashboard",
    "display_name": "Restaurant Dashboard",
    "description": "Full POS, menu management, and table booking dashboard for restaurant operators.",
    "template_type": "dashboard",
    "version": "1.0.0",
    "platform_compat": ">=1.0.1",
    "compatible_verticals": ["restaurant", "fast-food"],
    "manifest_json": { ... },
    "price_kobo": 0
  }'
```

### Step 4: Review Process

After submission, the template enters `pending_review` status. A platform administrator reviews the template for:

- Manifest correctness
- Platform invariant compliance
- Security review (no unauthorized data access patterns)
- Quality standards (description, naming)

### Step 5: Approval or Deprecation

- **Approved:** Template becomes available in the marketplace
- **Deprecated:** Template is removed from the marketplace; author can submit a new version

---

## 3. Pricing

- All prices are in **integer kobo** (T4 invariant)
- `price_kobo: 0` means free
- Minimum paid price: 50000 kobo (500 NGN)
- Revenue split: 70% author / 30% platform (configurable per partner)

---

## 4. Versioning

- Each template slug has exactly one active version
- To update, submit a new version with the same slug (future: version upgrade API)
- Breaking changes require a new slug (e.g., `restaurant-dashboard-v2`)
- Previous installations are not auto-upgraded

---

## 5. Deprecation

Templates can be deprecated by setting `status: 'deprecated'`. This:
- Removes the template from marketplace listings
- Existing installations continue to work
- No new installations are allowed
- Tenants are notified to migrate
