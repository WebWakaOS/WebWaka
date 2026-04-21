-- Migration: 0257_notification_templates
-- Description: Create notification_template table — versioned multi-channel templates.
--   Includes locale support (6 locales per spec), WhatsApp Meta approval status,
--   and v2 OQ-003 fields for platform-operated WABA.
--
-- Locale values must match SupportedLocale from @webwaka/i18n:
--   'en' | 'ha' | 'yo' | 'ig' | 'pcm' | 'fr'
--
-- Guardrails:
--   G14 — variables_schema column; validated before render
--   G17 (OQ-003) — whatsapp_approval_status; only 'meta_approved' permits dispatch
--   G18 — locale resolution uses @webwaka/i18n (runtime, not stored here)
--   G4  — brand context applied at render time via resolveBrandContext()
--
-- Phase 3 (N-030, N-031): TemplateRenderer reads from this table.
-- Phase 1 (N-015, N-040): Platform templates seeded in 0268_seed_platform_notification_templates.sql.

CREATE TABLE IF NOT EXISTS notification_template (
  id                       TEXT PRIMARY KEY,  -- 'tpl_notif_' + uuid
  tenant_id                TEXT,              -- NULL = platform default template
  template_family          TEXT NOT NULL,     -- e.g. 'auth.welcome'; matches notification_rule.template_family
  channel                  TEXT NOT NULL
    CHECK (channel IN ('email', 'sms', 'whatsapp', 'push', 'in_app', 'telegram', 'slack')),
  locale                   TEXT NOT NULL DEFAULT 'en'
    CHECK (locale IN ('en', 'ha', 'yo', 'ig', 'pcm', 'fr')),
  version                  INTEGER NOT NULL DEFAULT 1,
  status                   TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'deprecated')),
  whatsapp_approval_status TEXT DEFAULT 'not_required'
    CHECK (whatsapp_approval_status IN (
      'not_required', 'pending_meta_approval', 'meta_approved', 'meta_rejected'
    )),
  -- v2 OQ-003: Meta WABA template fields
  meta_template_name       TEXT,              -- Meta's internal template name
  meta_template_id         TEXT,              -- Meta's template ID for API calls
  meta_rejection_reason    TEXT,              -- Populated on meta_rejected status
  -- Template content
  subject_template         TEXT,             -- Email subject (Handlebars)
  body_template            TEXT NOT NULL,    -- Main body (Handlebars for email, plain for SMS)
  preheader_template       TEXT,             -- Email preheader (preview text)
  cta_label                TEXT,
  cta_url_template         TEXT,
  -- Variable validation (G14)
  variables_schema         TEXT NOT NULL,    -- JSON: TemplateVariableSchema
  created_by               TEXT,             -- user_id of creator (super_admin or tenant_admin)
  published_at             INTEGER,
  created_at               INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at               INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Unique: one active template per family+channel+locale+tenant combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_notif_template_active
  ON notification_template(tenant_id, template_family, channel, locale, version);

CREATE INDEX IF NOT EXISTS idx_notif_template_family
  ON notification_template(template_family, channel, locale, status);

CREATE INDEX IF NOT EXISTS idx_notif_template_wa_approval
  ON notification_template(whatsapp_approval_status)
  WHERE channel = 'whatsapp';

CREATE INDEX IF NOT EXISTS idx_notif_template_tenant
  ON notification_template(tenant_id, template_family)
  WHERE tenant_id IS NOT NULL;
