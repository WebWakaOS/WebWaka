/**
 * @webwaka/notifications — TemplateRenderer (N-030, N-034, N-035, Phase 3).
 *
 * Implements ITemplateRenderer. DB-backed template resolution with:
 *   - N-034: Tenant override resolution (tenant-specific > platform default > locale fallback)
 *   - N-035: Template versioning lifecycle (draft → active → deprecated)
 *   - N-039: Unsubscribe URL injection at render time
 *   - N-038: Plain-text generation (via email-wrapper)
 *   - N-032: Partial composition (CTA button, data table, etc.)
 *
 * Template lookup order (N-034):
 *   1. Tenant-specific active template (template_family + channel + locale + tenant_id)
 *   2. Platform default active template (same family + channel + locale, tenant_id IS NULL)
 *   3. English fallback: repeat steps 1–2 with locale='en' (if locale != 'en')
 *   4. Throw TemplateNotFoundError
 *
 * Variable substitution:
 *   - Handlebars-style: {{variable_name}} in body_template, subject_template, etc.
 *   - Reserved (injected at render time, not in caller vars):
 *       {{tenant_name}}, {{platform_name}}, {{platform_logo_url}}, {{unsubscribe_url}}
 *   - G14: required variables missing → throw TemplateVariableError (fail loudly)
 *   - String values → HTML-escaped before substitution in HTML channels
 *   - URL values → must start with https:// (validated against schema type='url')
 *
 * Guardrails:
 *   G3  — email FROM resolved by resolveEmailSender(); never hardcoded here
 *   G4  — email body always wrapped via wrapEmail()
 *   G14 — required variable validation; throw TemplateVariableError on missing
 *   G17 — WhatsApp blocked unless whatsapp_approval_status = 'meta_approved'
 *   G18 — locale strings from @webwaka/i18n exclusively; no parallel locale system
 *
 * Template versioning (N-035):
 *   publishTemplate(id, db): active → mark old active as deprecated → set new to active
 *   Template status transitions: draft → active → deprecated
 *   Deprecated templates are never returned by findTemplate().
 */

import type { D1LikeFull } from './db-types.js';
import type {
  ITemplateRenderer,
  RenderRequest,
  RenderedTemplate,
  TemplateLocale,
  TemplateVariableSchema,
  WhatsAppApprovalStatus,
} from './types.js';
import { resolveBrandContext } from '@webwaka/white-label-theming';
import { wrapEmail } from './email-wrapper.js';
import { generateUnsubscribeUrl } from './unsubscribe.js';
import { escapeHtml } from './partials.js';

// ---------------------------------------------------------------------------
// Custom errors
// ---------------------------------------------------------------------------

export class TemplateNotFoundError extends Error {
  constructor(
    public readonly family: string,
    public readonly channel: string,
    public readonly locale: string,
  ) {
    super(`Template not found: family=${family} channel=${channel} locale=${locale}`);
    this.name = 'TemplateNotFoundError';
  }
}

export class TemplateVariableError extends Error {
  constructor(
    public readonly missingVars: string[],
    public readonly family: string,
  ) {
    super(
      `Template "${family}" missing required variables: ${missingVars.join(', ')} — ` +
      `caller must supply all required variables (G14)`,
    );
    this.name = 'TemplateVariableError';
  }
}

export class WhatsAppNotApprovedError extends Error {
  constructor(
    public readonly family: string,
    public readonly approvalStatus: WhatsAppApprovalStatus,
  ) {
    super(
      `WhatsApp template "${family}" not approved by Meta ` +
      `(status=${approvalStatus}) — G17: WhatsApp dispatch blocked until meta_approved`,
    );
    this.name = 'WhatsAppNotApprovedError';
  }
}

export class TemplateUrlValidationError extends Error {
  constructor(variable: string, value: string) {
    super(
      `Variable "${variable}" must be an HTTPS URL, got: ${value.slice(0, 100)} — ` +
      `all URL-type variables must start with https://`,
    );
    this.name = 'TemplateUrlValidationError';
  }
}

// ---------------------------------------------------------------------------
// DB row shape for notification_template
// ---------------------------------------------------------------------------

interface NotificationTemplateRow {
  id: string;
  tenant_id: string | null;
  template_family: string;
  channel: string;
  locale: string;
  version: number;
  status: string;
  whatsapp_approval_status: string;
  subject_template: string | null;
  body_template: string;
  preheader_template: string | null;
  cta_label: string | null;
  cta_url_template: string | null;
  variables_schema: string | null;
}

// ---------------------------------------------------------------------------
// TemplateRenderer constructor options
// ---------------------------------------------------------------------------

export interface TemplateRendererOptions {
  db: D1LikeFull;
  /**
   * Platform base URL — used for unsubscribe link generation (N-039).
   * Example: 'https://api.webwaka.com'
   * If omitted, unsubscribe_url defaults to '#' (non-functional; used in preview mode).
   */
  platformBaseUrl?: string | undefined;
  /**
   * HMAC signing secret for unsubscribe tokens (N-039).
   * From UNSUBSCRIBE_HMAC_SECRET env var.
   * If omitted, token signing is skipped and unsubscribe_url = '#unsub'.
   */
  unsubscribeSecret?: string | undefined;
  /**
   * KV namespace for brand context cache (G4: brand context must be cached).
   * If omitted, resolveBrandContext() runs without cache.
   */
  kv?: {
    get(key: string, format: 'json'): Promise<unknown>;
    put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
  } | undefined;
  /** Platform display name injected as {{platform_name}}. Default: 'WebWaka'. */
  platformName?: string | undefined;
  /** Platform logo URL injected as {{platform_logo_url}}. */
  platformLogoUrl?: string | undefined;
}

// ---------------------------------------------------------------------------
// TemplateRenderer
// ---------------------------------------------------------------------------

export class TemplateRenderer implements ITemplateRenderer {
  private readonly db: D1LikeFull;
  private readonly platformBaseUrl: string;
  private readonly unsubscribeSecret: string | undefined;
  private readonly kv: TemplateRendererOptions['kv'] | undefined;
  private readonly platformName: string;
  private readonly platformLogoUrl: string | undefined;

  constructor(opts: TemplateRendererOptions) {
    this.db = opts.db;
    this.platformBaseUrl = opts.platformBaseUrl ?? 'https://api.webwaka.com';
    this.unsubscribeSecret = opts.unsubscribeSecret;
    this.kv = opts.kv;
    this.platformName = opts.platformName ?? 'WebWaka';
    this.platformLogoUrl = opts.platformLogoUrl;
  }

  // ── render ────────────────────────────────────────────────────────────────

  async render(request: RenderRequest): Promise<RenderedTemplate> {
    return this._renderInternal(request, false);
  }

  // ── preview ───────────────────────────────────────────────────────────────

  async preview(request: RenderRequest): Promise<RenderedTemplate> {
    return this._renderInternal(request, true);
  }

  // ── _renderInternal ───────────────────────────────────────────────────────

  private async _renderInternal(
    request: RenderRequest,
    isPreview: boolean,
  ): Promise<RenderedTemplate> {
    const { templateFamily, channel, locale, tenantId, workspaceId, variables } = request;

    // Step 1: Find the template (N-034 tenant override → platform default → en fallback)
    const tpl = await findTemplate(this.db, templateFamily, channel, locale, tenantId ?? null);
    if (!tpl) {
      throw new TemplateNotFoundError(templateFamily, channel, locale);
    }

    // Step 2: G17 — WhatsApp gate
    if (channel === 'whatsapp') {
      const approvalStatus = tpl.whatsapp_approval_status as WhatsAppApprovalStatus;
      if (approvalStatus !== 'meta_approved') {
        throw new WhatsAppNotApprovedError(templateFamily, approvalStatus);
      }
    }

    // Step 3: Parse and validate variables schema (G14)
    const schema = parseVariablesSchema(tpl.variables_schema, templateFamily);
    validateRequiredVariables(variables, schema, templateFamily);

    // Step 4: Resolve brand context (G4)
    const brandWorkspaceId = workspaceId ?? tenantId;
    let theme;
    if (brandWorkspaceId) {
      try {
        theme = await resolveBrandContext(brandWorkspaceId, this.db as Parameters<typeof resolveBrandContext>[1], this.kv as Parameters<typeof resolveBrandContext>[2]);
      } catch {
        // If brand resolution fails, fall to platform default (graceful degradation)
        theme = undefined;
      }
    }

    // Step 5: Build reserved-variable injection set
    const tenantName = theme?.displayName ?? this.platformName;
    const recipientId = String(variables['user_id'] ?? variables['uid'] ?? '');
    const targetTenantId = tenantId ?? 'platform';
    const resolvedLocale = (tpl.locale as TemplateLocale) ?? locale;

    // Generate unsubscribe URL (N-039)
    let unsubscribeUrl = '#unsub';
    if (!isPreview && this.unsubscribeSecret && recipientId) {
      try {
        unsubscribeUrl = await generateUnsubscribeUrl(
          this.platformBaseUrl,
          recipientId,
          targetTenantId,
          channel === 'email' ? 'email'
            : channel === 'sms' ? 'sms'
            : channel === 'whatsapp' ? 'whatsapp'
            : 'push',
          this.unsubscribeSecret,
        );
      } catch {
        unsubscribeUrl = '#unsub';
      }
    }

    // Build full variable map (caller vars + reserved vars)
    const allVars: Record<string, unknown> = {
      ...variables,
      tenant_name: tenantName,
      platform_name: this.platformName,
      ...(this.platformLogoUrl !== undefined ? { platform_logo_url: this.platformLogoUrl } : {}),
      unsubscribe_url: unsubscribeUrl,
    };

    // Step 6: Determine if this channel needs HTML escaping
    const isHtmlChannel = channel === 'email' || channel === 'in_app';

    // Step 7: Substitute variables into all template fields
    const body = substituteVariables(tpl.body_template, allVars, schema, isHtmlChannel);
    const subject = tpl.subject_template
      ? substituteVariables(tpl.subject_template, allVars, schema, false)
      : undefined;
    const preheader = tpl.preheader_template
      ? substituteVariables(tpl.preheader_template, allVars, schema, false)
      : undefined;
    const ctaUrl = tpl.cta_url_template
      ? substituteVariables(tpl.cta_url_template, allVars, schema, false)
      : undefined;

    // Step 8: Email — wrap with brand context (G4) and generate plain-text (N-038)
    let finalBody = body;
    let bodyPlainText: string | undefined;

    if (channel === 'email') {
      const resolvedTheme = theme ?? platformDefaultThemeStub(this.platformName);
      const { html, plainText } = wrapEmail({
        subject: subject ?? templateFamily,
        bodyHtml: body,
        ...(preheader !== undefined ? { preheader } : {}),
        theme: resolvedTheme,
        locale: resolvedLocale,
        unsubscribeUrl,
      });
      finalBody = html;
      bodyPlainText = plainText;
    }

    // Step 9: Build RenderedTemplate
    return {
      body: finalBody,
      locale: resolvedLocale,
      templateId: tpl.id,
      templateVersion: tpl.version,
      ...(subject !== undefined ? { subject } : {}),
      ...(bodyPlainText !== undefined ? { bodyPlainText } : {}),
      ...(preheader !== undefined ? { preheader } : {}),
      ...(tpl.cta_label != null ? { ctaLabel: tpl.cta_label } : {}),
      ...(ctaUrl !== undefined ? { ctaUrl } : {}),
    };
  }
}

// ---------------------------------------------------------------------------
// publishTemplate — N-035 template versioning
// ---------------------------------------------------------------------------

/**
 * Publish a draft template: set its status to 'active' and deprecate all
 * previously active versions of the same family+channel+locale+tenant combination.
 *
 * Status transitions: draft → active (caller action); active → deprecated (automatic).
 * Deprecated templates are never returned by findTemplate().
 *
 * @param templateId - The ID of the draft template to publish
 * @param db         - D1 database binding
 * @throws Error if template not found or is not in 'draft' status
 */
export async function publishTemplate(
  templateId: string,
  tenantId: string | null,
  db: D1LikeFull,
): Promise<{ deprecatedCount: number }> {
  // Load the draft template
  const tpl = await db
    .prepare(`SELECT id, tenant_id, template_family, channel, locale, status, version
              FROM notification_template WHERE id = ? LIMIT 1`)
    .bind(templateId)
    .first<Pick<NotificationTemplateRow, 'id' | 'tenant_id' | 'template_family' | 'channel' | 'locale' | 'status' | 'version'>>();

  if (!tpl) {
    throw new Error(`Template not found: ${templateId}`);
  }
  if (tpl.status !== 'draft') {
    throw new Error(`Template ${templateId} is not a draft (status=${tpl.status})`);
  }
  // G1: tenant isolation check
  if (tpl.tenant_id !== tenantId) {
    throw new Error(`Template ${templateId} does not belong to tenant ${String(tenantId)}`);
  }

  // Deprecate all currently active versions of the same family+channel+locale+tenant
  const deprecateResult = await db
    .prepare(
      `UPDATE notification_template
       SET status = 'deprecated', updated_at = unixepoch()
       WHERE template_family = ?
         AND channel = ?
         AND locale = ?
         AND status = 'active'
         AND (tenant_id = ? OR (tenant_id IS NULL AND ? IS NULL))`,
    )
    .bind(
      tpl.template_family,
      tpl.channel,
      tpl.locale,
      tenantId,
      tenantId,
    )
    .run();

  const deprecatedCount = deprecateResult.meta?.changes ?? 0;

  // Publish the draft
  await db
    .prepare(
      `UPDATE notification_template
       SET status = 'active', published_at = unixepoch(), updated_at = unixepoch()
       WHERE id = ?`,
    )
    .bind(templateId)
    .run();

  return { deprecatedCount };
}

// ---------------------------------------------------------------------------
// findTemplate — N-034 tenant override resolution
// ---------------------------------------------------------------------------

/**
 * Find the best active template for the given family + channel + locale.
 *
 * Resolution order (N-034):
 *   1. Tenant-specific active template (tenant_id = tenantId)
 *   2. Platform default active template (tenant_id IS NULL)
 *   3. Retry 1+2 with locale='en' if locale != 'en'
 *   4. Return null (caller throws TemplateNotFoundError)
 *
 * Always picks highest version when multiple active templates exist.
 */
export async function findTemplate(
  db: D1LikeFull,
  family: string,
  channel: string,
  locale: string,
  tenantId: string | null,
): Promise<NotificationTemplateRow | null> {
  const localesToTry = locale !== 'en' ? [locale, 'en'] : ['en'];

  for (const tryLocale of localesToTry) {
    const tpl = await db
      .prepare(
        `SELECT id, tenant_id, template_family, channel, locale, version, status,
                whatsapp_approval_status, subject_template, body_template,
                preheader_template, cta_label, cta_url_template, variables_schema
         FROM notification_template
         WHERE template_family = ?
           AND channel = ?
           AND locale = ?
           AND status = 'active'
           AND (
             (tenant_id = ?)
             OR
             (tenant_id IS NULL AND NOT EXISTS (
               SELECT 1 FROM notification_template t2
               WHERE t2.template_family = notification_template.template_family
                 AND t2.channel = notification_template.channel
                 AND t2.locale = notification_template.locale
                 AND t2.status = 'active'
                 AND t2.tenant_id = ?
             ))
           )
         ORDER BY
           CASE WHEN tenant_id = ? THEN 0 ELSE 1 END,
           version DESC
         LIMIT 1`,
      )
      .bind(
        family,
        channel,
        tryLocale,
        tenantId ?? null,
        tenantId ?? null,
        tenantId ?? null,
      )
      .first<NotificationTemplateRow>();

    if (tpl) return tpl;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Variable substitution — G14
// ---------------------------------------------------------------------------

/**
 * Parse variables_schema JSON string into TemplateVariableSchema.
 * Returns a permissive empty schema if the string is null or invalid.
 * Invalid schemas throw loudly (G14).
 */
function parseVariablesSchema(
  schemaJson: string | null,
  family: string,
): TemplateVariableSchema {
  if (!schemaJson) {
    return { required: [], optional: [], properties: {} };
  }
  try {
    const parsed = JSON.parse(schemaJson) as TemplateVariableSchema;
    if (!Array.isArray(parsed.required) || !Array.isArray(parsed.optional)) {
      throw new Error('variables_schema must have required[] and optional[] arrays');
    }
    return parsed;
  } catch (err) {
    throw new Error(
      `Template "${family}" has invalid variables_schema: ${err instanceof Error ? err.message : String(err)} — ` +
      `fix the template definition (G14)`,
    );
  }
}

/**
 * Validate that all required variables are present in the caller-supplied vars.
 * Throws TemplateVariableError (G14: fail loudly) on any missing required variable.
 */
function validateRequiredVariables(
  vars: Record<string, unknown>,
  schema: TemplateVariableSchema,
  family: string,
): void {
  // Reserved injected vars are never required from caller
  const reserved = new Set(['tenant_name', 'platform_name', 'platform_logo_url', 'unsubscribe_url']);

  const missing = schema.required.filter(
    (key) => !reserved.has(key) && (vars[key] === undefined || vars[key] === null || vars[key] === ''),
  );

  if (missing.length > 0) {
    throw new TemplateVariableError(missing, family);
  }
}

/**
 * Substitute {{variable_name}} tokens in a template string.
 *
 * - All values are HTML-escaped when `escapeValues=true` (HTML channels: email, in_app)
 * - URL-type variables (per schema.properties[key].type = 'url') must be HTTPS
 * - Sensitive variables (schema.properties[key].sensitive = true) are substituted
 *   but never logged by this function
 * - Unknown {{token}} placeholders are left as-is (not an error — optional vars)
 */
function substituteVariables(
  template: string,
  vars: Record<string, unknown>,
  schema: TemplateVariableSchema,
  escapeValues: boolean,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    const val = vars[key];
    if (val === undefined || val === null) {
      // Leave unknown/optional tokens as-is (they may be injected by partials later)
      return match;
    }

    const strVal = String(val);
    const propSchema = schema.properties[key];

    // URL validation: type='url' must be HTTPS
    if (propSchema?.type === 'url') {
      if (!strVal.startsWith('https://') && strVal !== '#' && strVal !== '#unsub') {
        throw new TemplateUrlValidationError(key, strVal);
      }
      return strVal; // URLs are not HTML-escaped (they go into href= attributes handled by wrapper)
    }

    return escapeValues ? escapeHtml(strVal) : strVal;
  });
}

// ---------------------------------------------------------------------------
// Platform default theme stub — used when brand resolution fails or is skipped
// ---------------------------------------------------------------------------

function platformDefaultThemeStub(platformName: string): import('@webwaka/white-label-theming').TenantTheme {
  return {
    tenantId: 'platform',
    tenantSlug: 'webwaka',
    displayName: platformName,
    primaryColor: '#1a6b3a',
    secondaryColor: '#f5a623',
    accentColor: '#e8f5e9',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    logoUrl: null,
    faviconUrl: null,
    borderRadiusPx: 8,
    customDomain: null,
    senderEmailAddress: null,
    senderDisplayName: null,
    tenantSupportEmail: 'support@webwaka.com',
    tenantAddress: null,
    requiresWebwakaAttribution: false,
  };
}
