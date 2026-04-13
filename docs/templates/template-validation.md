# WebWaka OS — Template Validation Guide

**Version:** 1.0.1  
**Status:** ACTIVE

---

## 1. Validation Pipeline

Every template undergoes a multi-stage validation pipeline before it can be approved:

### Stage 1: Schema Validation

The template manifest is validated against the JSON Schema defined in the template spec. All required fields must be present and correctly typed.

**Validated fields:**
- `slug` — lowercase alphanumeric with hyphens, 2-64 characters
- `display_name` — 2-100 characters
- `description` — 10-500 characters
- `template_type` — must be one of 6 valid types
- `version` — valid semver string (e.g., `1.0.0`)
- `platform_compat` — valid semver range (e.g., `>=1.0.1`)
- `manifest_json` — valid JSON object

### Stage 2: Invariant Compliance

The validator checks that the manifest does not violate platform invariants:

- **T4 (Kobo Integers):** Any `price_kobo` field must be a non-negative integer
- **P7 (No Direct AI):** Manifest cannot declare direct AI SDK dependencies
- **Vertical Compatibility:** Declared verticals must exist in the verticals registry

### Stage 3: Version Compatibility

The validator verifies:
- Template version follows semver conventions
- `platform_compat` range includes the current platform version
- No conflicting versions of the same template slug exist

---

## 2. Validator Package

The template validator is located at `packages/verticals/src/template-validator.ts` and exports:

```typescript
import { validateTemplateManifest, validateSlug, validateVersion } from '@webwaka/verticals';

const result = validateTemplateManifest(manifest);
if (!result.valid) {
  console.error(result.errors);
}
```

### Exported Functions

| Function | Description |
|---|---|
| `validateTemplateManifest(manifest)` | Full manifest validation |
| `validateSlug(slug)` | Validate template slug format |
| `validateVersion(version)` | Validate semver version string |
| `validateTemplateType(type)` | Check template type is valid |
| `validatePlatformCompat(compat)` | Validate platform compatibility range |

---

## 3. Test Suite

The validator includes 50 tests covering:

- Valid manifests for all 6 template types
- Slug validation (valid, invalid, edge cases)
- Version validation (semver compliance)
- Price validation (integer kobo, no floats, no negatives)
- Platform compatibility validation
- Missing required fields
- Invalid field types
- Edge cases (empty strings, very long strings, special characters)

Run tests:
```bash
npx vitest run packages/verticals/src/template-validator.test.ts
```

---

## 4. Error Codes

| Code | Description |
|---|---|
| `INVALID_SLUG` | Slug doesn't match `^[a-z0-9][a-z0-9-]*[a-z0-9]$` |
| `INVALID_VERSION` | Version doesn't match semver format |
| `INVALID_TYPE` | Template type not in allowed list |
| `MISSING_FIELD` | Required field is missing |
| `INVALID_PRICE` | Price is not a non-negative integer |
| `INVALID_MANIFEST` | Manifest JSON is not a valid object |
| `INCOMPATIBLE_VERSION` | Platform version doesn't satisfy compat range |
| `UNKNOWN_VERTICAL` | Declared vertical not in registry |
