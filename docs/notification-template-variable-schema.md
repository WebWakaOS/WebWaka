# Notification Template Variable Schema

**Task N-005 (Phase 0)** — Canonical specification for template variables, escaping rules, and schema validation.

---

## 1. Overview

All notification templates (email, SMS, WhatsApp, push, in_app) use a typed variable system. Before rendering, the `ITemplateRenderer` MUST validate all variables against the template's `variables_schema` column (G14). Missing required variables fail loudly — no silent defaults, no empty string substitution.

Templates are stored in the `notification_template` table with a `variables_schema` column containing a JSON object matching the `TemplateVariableSchema` TypeScript interface.

---

## 2. Variable Schema Format

Each template's `variables_schema` is a JSON object:

```json
{
  "required": ["user_name", "cta_url"],
  "optional": ["support_email", "expiry_hours"],
  "properties": {
    "user_name": {
      "type": "string",
      "description": "Full name of the recipient user",
      "maxLength": 100
    },
    "cta_url": {
      "type": "url",
      "description": "Call-to-action URL (absolute, HTTPS only)"
    },
    "support_email": {
      "type": "string",
      "description": "Support email address",
      "maxLength": 254
    },
    "expiry_hours": {
      "type": "number",
      "description": "Number of hours until the link/token expires"
    }
  }
}
```

### Field Types

| Type | Description | Validation |
|---|---|---|
| `string` | Plain text | HTML-escaped on render; maxLength enforced |
| `number` | Numeric (integer or float) | Not HTML-escaped |
| `boolean` | true/false | Rendered as localized "Yes"/"No" |
| `url` | Absolute URL | Must start with `https://`; not HTML-escaped in href attributes |
| `currency_kobo` | Integer amount in kobo (1 NGN = 100 kobo) | Formatted by i18n layer (e.g., ₦1,500.00) |

---

## 3. Escaping Rules

### Email (HTML channel)

- All `string` type variables are HTML-escaped: `<`, `>`, `&`, `"`, `'` → HTML entities.
- `url` type variables are used raw in `href=` attributes but MUST be validated as HTTPS before render.
- `currency_kobo` variables are formatted by `@webwaka/i18n` using the tenant locale.
- Handlebars-style delimiters: `{{variable_name}}` for escaped output; `{{{variable_name}}}` for raw HTML (reserved for platform-controlled partials only — never for user-supplied data).

### SMS / WhatsApp (plain text channels)

- All variables are rendered as plain text with no HTML escaping.
- No URLs in variables should exceed 80 characters (use a URL shortener for long CTA URLs in SMS).
- WhatsApp templates: Meta-approved templates use positional variable substitution (`{{1}}`, `{{2}}`). The renderer maps named variables to positional slots using `meta_template_name` and `meta_template_id`.

### Push notifications

- Title: 50 character limit enforced.
- Body: 150 character limit enforced.
- HTML is not supported — all variables rendered as plain text.

### In-app notifications

- Title and body are HTML-escaped.
- `cta_url` is validated as HTTPS before use.
- In `low_data_mode=1` (G22), no image assets are fetched; `text_only_mode=1` is set on the `notification_inbox_item`.

---

## 4. Reserved Variable Names

These names are injected by the platform and MUST NOT appear in `variables_schema.required` or `variables_schema.optional`. They are available in all templates automatically:

| Variable | Source | Description |
|---|---|---|
| `tenant_name` | `workspaces.display_name` | Tenant display name |
| `platform_name` | Platform config | "WebWaka" (or whitelabeled name) |
| `platform_logo_url` | Brand context (`resolveBrandContext`) | Tenant/Partner/Platform logo |
| `primary_color` | Brand context | Tenant/Partner/Platform primary color |
| `current_year` | Runtime | e.g., "2026" |
| `unsubscribe_url` | Signed token (N-039) | One-click unsubscribe URL |
| `list_unsubscribe_header` | Signed token (N-039) | Injected into email headers only |

---

## 5. Sensitive Variable Rules (G6)

OTP codes are NEVER passed as template variables. They are formatted by the `@webwaka/otp` package into a display string (`otp_display`) before being passed to the template engine. The raw OTP value is never present in:
- `notification_template.body_template`
- `notification_event.payload`
- Any log line
- Any notification_audit_log entry

The `variables_schema.properties` for any OTP template must mark `otp_display` as:
```json
{
  "otp_display": {
    "type": "string",
    "description": "Pre-formatted OTP display string (e.g., '123 456'). Never the raw code.",
    "sensitive": true,
    "maxLength": 20
  }
}
```

The `sensitive: true` flag instructs the logging middleware to mask this variable in all log output.

---

## 6. Validation Protocol

```typescript
// Pseudocode for ITemplateRenderer validation gate (G14)
function validateVariables(schema: TemplateVariableSchema, variables: Record<string, unknown>): void {
  // 1. Check all required variables are present
  for (const key of schema.required) {
    if (!(key in variables)) {
      throw new Error(`[G14] Missing required template variable: "${key}"`);
    }
  }
  // 2. Check no unknown variables (optional warning in dev, not enforced in prod)
  const knownKeys = new Set([...schema.required, ...schema.optional]);
  for (const key of Object.keys(variables)) {
    if (!knownKeys.has(key) && !RESERVED_VARIABLE_NAMES.has(key)) {
      console.warn(`[templates] Unknown template variable: "${key}"`);
    }
  }
  // 3. Type-check each variable
  for (const [key, value] of Object.entries(variables)) {
    const def = schema.properties[key];
    if (!def) continue;
    if (def.type === 'url' && !String(value).startsWith('https://')) {
      throw new Error(`[G14] Template variable "${key}" must be an HTTPS URL`);
    }
    if (def.maxLength && String(value).length > def.maxLength) {
      throw new Error(`[G14] Template variable "${key}" exceeds maxLength=${def.maxLength}`);
    }
  }
}
```

---

## 7. Platform Template Families

Each template family corresponds to a `notification_rule.template_family` value. The following families are seeded in migration 0268:

| Family | Event(s) | Channels | Notes |
|---|---|---|---|
| `auth.welcome` | `auth.user.registered` | email, in_app | Welcome email with email verification CTA |
| `auth.email_verify` | `auth.user.email_verified` | email | Email verification link |
| `auth.password_reset` | `auth.user.password_reset_requested` | email, sms | Reset link or OTP |
| `auth.account_locked` | `auth.user.account_locked` | email, sms | Security alert; severity=critical |
| `auth.invite` | `auth.user.invited` | email | Workspace invitation |
| `billing.payment_success` | `billing.payment_succeeded` | email, in_app | Receipt |
| `billing.payment_failed` | `billing.payment_failed` | email, sms, in_app | Retry prompt; severity=warning |
| `billing.trial_ending` | `billing.trial_ending` | email, in_app | Trial ending soon |
| `bank_transfer.receipt` | `bank_transfer.completed` | email, sms, in_app | Transfer receipt (USSD bypass G21) |
| `bank_transfer.failed` | `bank_transfer.failed` | email, sms | Failure notification |
| `ai.budget_warning` | `ai.budget_warning` | email, in_app | AI spend approaching limit |
| `system.provider_down` | `system.provider_down` | slack, email | Provider alert to super_admin |

---

## 8. Attribution Rule (G17 extension — N-033, N-117)

Email templates for tenants on the `free` plan tier MUST include the WebWaka attribution footer:
```html
<p style="font-size:11px;color:#999">Powered by <a href="https://webwaka.com">WebWaka</a></p>
```

Tenants on `business` or `enterprise` plans MAY suppress attribution by setting `requiresAttribution=false` in their `TenantTheme`. The `ITemplateRenderer` checks this before rendering the legal footer partial.

---

*This document is authoritative for N-005. See `packages/notifications/src/types.ts` for the `TemplateVariableSchema` TypeScript interface.*
