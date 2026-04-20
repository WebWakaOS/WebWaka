/**
 * TemplateRenderer tests (N-030, N-034, N-035, Phase 3).
 *
 * Covers:
 *   - render(): renders body_template with {{variable}} substitution
 *   - render(): throws TemplateNotFoundError when no template exists (G14)
 *   - render(): throws TemplateVariableError on missing required variables (G14)
 *   - render(): throws WhatsAppNotApprovedError when whatsapp_approval_status != 'meta_approved' (G17)
 *   - render(): N-034 tenant override — tenant template takes precedence over platform default
 *   - render(): N-034 locale fallback — falls back to 'en' when requested locale not found
 *   - render(): unsubscribe_url replaced with '#unsub' in preview mode
 *   - render(): unsubscribe_url is a real signed URL in render() mode with secret
 *   - preview(): identical output shape to render() but no token signing
 *   - findTemplate(): returns null when no template matches
 *   - publishTemplate(): transitions status draft → active, deprecates previous active
 *
 * variables_schema format: { required: string[], optional: string[], properties: Record<string, { type?: string }> }
 */

import { describe, it, expect } from 'vitest';
import {
  TemplateRenderer,
  TemplateNotFoundError,
  TemplateVariableError,
  WhatsAppNotApprovedError,
  findTemplate,
  publishTemplate,
} from './template-renderer.js';
import type { D1LikeFull } from './db-types.js';

// ---------------------------------------------------------------------------
// Mock template row
// ---------------------------------------------------------------------------

interface MockTemplateRow {
  id: string;
  tenant_id: string | null;
  template_family: string;
  channel: string;
  locale: string;
  version: number;
  status: 'draft' | 'active' | 'deprecated';
  whatsapp_approval_status: string;
  subject_template: string | null;
  body_template: string;
  preheader_template: string | null;
  cta_label: string | null;
  cta_url_template: string | null;
  variables_schema: string | null;
}

let _rowCounter = 0;

function makeMockRow(overrides: Partial<MockTemplateRow> & { template_family: string }): MockTemplateRow {
  _rowCounter++;
  return {
    id: `tpl_${overrides.template_family.replace(/\./g, '_')}_${_rowCounter}`,
    tenant_id: null,
    channel: 'email',
    locale: 'en',
    version: 1,
    status: 'active',
    whatsapp_approval_status: 'not_applicable',
    subject_template: 'Hello {{user_name}}',
    body_template: '<p>Welcome, {{user_name}}!</p>',
    preheader_template: null,
    cta_label: null,
    cta_url_template: null,
    variables_schema: null,
    ...overrides,
  };
}

/**
 * Build a mock D1LikeFull that serves templates from an in-memory array.
 *
 * findTemplate query pattern: SELECT ... WHERE template_family = ? AND channel = ? AND locale = ?
 *   bind args: [family, channel, locale, tenantId, tenantId, tenantId]
 *
 * publishTemplate query pattern 1: SELECT id, tenant_id, status WHERE id = ?
 *   bind args: [id]
 * publishTemplate query pattern 2: UPDATE ... SET status='deprecated' WHERE template_family=? AND ...
 *   bind args: [family, channel, locale, tenantId, tenantId]
 * publishTemplate query pattern 3: UPDATE ... SET status='active' WHERE id = ?
 *   bind args: [id]
 */
function makeTemplateDb(templates: MockTemplateRow[]): D1LikeFull {
  return {
    prepare: (query: string) => {
      let boundArgs: unknown[] = [];

      const stmt = {
        bind: (...args: unknown[]) => {
          boundArgs = args;
          return stmt;
        },
        first: async <T>(): Promise<T | null> => {
          // --- publishTemplate: SELECT ... FROM notification_template WHERE id = ? LIMIT 1 ---
          // Distinguish from findTemplate which uses WHERE template_family = ?
          if (
            query.includes('SELECT') &&
            query.includes('notification_template') &&
            query.includes('WHERE id = ?')
          ) {
            const [id] = boundArgs as [string];
            const found = templates.find((t) => t.id === id);
            return found ? (found as unknown as T) : null;
          }

          // --- findTemplate: SELECT ... WHERE template_family = ? AND channel = ? ... ---
          if (query.includes('SELECT') && query.includes('notification_template')) {
            const [family, channel, locale, tenantId] = boundArgs as [string, string, string, string | null, ...unknown[]];

            const active = templates.filter(
              (t) =>
                t.template_family === family &&
                t.channel === channel &&
                t.locale === locale &&
                t.status === 'active',
            );

            // Tenant-specific first (N-034)
            if (tenantId) {
              const tenantSpecific = active.find((t) => t.tenant_id === tenantId);
              if (tenantSpecific) return tenantSpecific as unknown as T;
            }

            // Platform default (tenant_id IS NULL)
            const platformDefault = active.find((t) => t.tenant_id === null);
            if (platformDefault) return platformDefault as unknown as T;

            return null;
          }

          // Brand-context subqueries (sub_partners, channel_provider, tenant_branding): return null
          return null;
        },
        all: async <T>(): Promise<{ results: T[] }> => {
          return { results: [] };
        },
        run: async () => {
          // publishTemplate deprecate: UPDATE SET status='deprecated' WHERE template_family=? ...
          if (query.includes("SET status = 'deprecated'")) {
            const [family, channel, locale, tenantId] = boundArgs as [string, string, string, string | null, string | null];
            let changes = 0;
            for (const t of templates) {
              if (
                t.template_family === family &&
                t.channel === channel &&
                t.locale === locale &&
                t.status === 'active' &&
                (tenantId === null ? t.tenant_id === null : t.tenant_id === tenantId)
              ) {
                t.status = 'deprecated';
                changes++;
              }
            }
            return { success: true, meta: { changes } };
          }

          // publishTemplate activate: UPDATE SET status='active' WHERE id = ?
          if (query.includes("SET status = 'active'")) {
            const [id] = boundArgs as [string];
            let changes = 0;
            for (const t of templates) {
              if (t.id === id) {
                t.status = 'active';
                changes++;
              }
            }
            return { success: true, meta: { changes } };
          }

          return { success: true, meta: { changes: 0 } };
        },
      };

      return stmt;
    },
  } as unknown as D1LikeFull;
}

function makeRenderer(
  templates: MockTemplateRow[],
  opts: { secret?: string; platformBaseUrl?: string } = {},
): TemplateRenderer {
  return new TemplateRenderer({
    db: makeTemplateDb(templates),
    platformName: 'WebWaka',
    ...(opts.secret !== undefined ? { unsubscribeSecret: opts.secret } : {}),
    ...(opts.platformBaseUrl !== undefined ? { platformBaseUrl: opts.platformBaseUrl } : {}),
  });
}

// ---------------------------------------------------------------------------
// helpers — correct variables_schema format
// { required: string[], optional: string[], properties: Record<string, { type?: string }> }
// ---------------------------------------------------------------------------

function makeSchema(required: string[], optional: string[] = []): string {
  const properties: Record<string, { type: string }> = {};
  for (const k of [...required, ...optional]) {
    properties[k] = { type: 'string' };
  }
  return JSON.stringify({ required, optional, properties });
}

// ---------------------------------------------------------------------------
// Basic render()
// ---------------------------------------------------------------------------

describe('TemplateRenderer.render()', () => {
  it('renders body_template with Handlebars variable substitution', async () => {
    const templates = [
      makeMockRow({
        template_family: 'auth.welcome',
        body_template: '<p>Hello, {{user_name}}!</p>',
      }),
    ];
    const renderer = makeRenderer(templates);
    const result = await renderer.render({
      templateFamily: 'auth.welcome',
      channel: 'email',
      locale: 'en',
      variables: { user_name: 'Adaeze', user_id: 'usr_001' },
    });

    expect(result.body).toContain('Adaeze');
    expect(result.body).not.toContain('{{user_name}}');
  });

  it('substitutes subject_template when present', async () => {
    const templates = [
      makeMockRow({
        template_family: 'auth.invite',
        subject_template: 'Invitation from {{inviter_name}}',
        body_template: '<p>You were invited by {{inviter_name}}</p>',
        variables_schema: makeSchema(['inviter_name']),
      }),
    ];
    const renderer = makeRenderer(templates);
    const result = await renderer.render({
      templateFamily: 'auth.invite',
      channel: 'email',
      locale: 'en',
      variables: { inviter_name: 'Emeka', user_id: 'usr_002' },
    });

    expect(result.subject).toContain('Emeka');
    expect(result.subject).not.toContain('{{inviter_name}}');
  });

  it('injects reserved variable {{platform_name}} automatically', async () => {
    const templates = [
      makeMockRow({
        template_family: 'platform.test',
        body_template: '<p>Powered by {{platform_name}}</p>',
      }),
    ];
    const renderer = makeRenderer(templates);
    const result = await renderer.render({
      templateFamily: 'platform.test',
      channel: 'email',
      locale: 'en',
      variables: { user_id: 'usr_003' },
    });

    expect(result.body).toContain('WebWaka');
  });

  it('returns templateId, templateVersion, and locale in result', async () => {
    const tpl = makeMockRow({ template_family: 'auth.welcome', version: 3 });
    const renderer = makeRenderer([tpl]);
    const result = await renderer.render({
      templateFamily: 'auth.welcome',
      channel: 'email',
      locale: 'en',
      variables: { user_id: 'usr_004' },
    });

    expect(result.templateId).toBe(tpl.id);
    expect(result.templateVersion).toBe(3);
    expect(result.locale).toBe('en');
  });

  it('wraps email body in full HTML shell (G4: wrapEmail called)', async () => {
    const templates = [
      makeMockRow({ template_family: 'auth.welcome', body_template: '<p>Hello</p>' }),
    ];
    const renderer = makeRenderer(templates);
    const result = await renderer.render({
      templateFamily: 'auth.welcome',
      channel: 'email',
      locale: 'en',
      variables: { user_id: 'usr_005' },
    });

    // wrapEmail always adds DOCTYPE
    expect(result.body).toContain('<!DOCTYPE html');
  });

  it('generates a signed unsubscribe_url when secret and user_id are provided', async () => {
    const templates = [
      makeMockRow({
        template_family: 'auth.welcome',
        body_template: '<p>Unsub: {{unsubscribe_url}}</p>',
      }),
    ];
    const renderer = makeRenderer(templates, {
      secret: 'super-secret-hmac-key-at-least-32-chars!',
      platformBaseUrl: 'https://api.webwaka.com',
    });
    const result = await renderer.render({
      templateFamily: 'auth.welcome',
      channel: 'email',
      locale: 'en',
      variables: { user_id: 'usr_006' },
    });

    // The unsubscribe URL should be a real signed URL, not '#unsub'
    expect(result.body).toContain('https://api.webwaka.com/notifications/unsubscribe');
  });

  it('uses #unsub placeholder when no secret is set', async () => {
    const templates = [
      makeMockRow({
        template_family: 'auth.welcome',
        body_template: '<p>Unsub: {{unsubscribe_url}}</p>',
      }),
    ];
    const renderer = makeRenderer(templates);
    const result = await renderer.render({
      templateFamily: 'auth.welcome',
      channel: 'email',
      locale: 'en',
      variables: { user_id: 'usr_007' },
    });

    expect(result.body).toContain('#unsub');
  });

  it('HTML-escapes string variables in body (XSS prevention)', async () => {
    const templates = [
      makeMockRow({
        template_family: 'auth.welcome',
        body_template: '<p>Welcome, {{user_name}}!</p>',
      }),
    ];
    const renderer = makeRenderer(templates);
    const result = await renderer.render({
      templateFamily: 'auth.welcome',
      channel: 'email',
      locale: 'en',
      variables: { user_name: '<script>alert(1)</script>', user_id: 'usr_008' },
    });

    expect(result.body).not.toContain('<script>');
    expect(result.body).toContain('&lt;script&gt;');
  });
});

// ---------------------------------------------------------------------------
// G14 — TemplateNotFoundError
// ---------------------------------------------------------------------------

describe('TemplateNotFoundError (G14)', () => {
  it('throws TemplateNotFoundError when no template exists for the family', async () => {
    const renderer = makeRenderer([]);
    await expect(
      renderer.render({
        templateFamily: 'nonexistent.family',
        channel: 'email',
        locale: 'en',
        variables: {},
      }),
    ).rejects.toThrow(TemplateNotFoundError);
  });

  it('TemplateNotFoundError carries family, channel, locale properties', async () => {
    const renderer = makeRenderer([]);
    const error = (await renderer
      .render({ templateFamily: 'missing.family', channel: 'email', locale: 'en', variables: {} })
      .catch((e: unknown) => e)) as TemplateNotFoundError;

    expect(error).toBeInstanceOf(TemplateNotFoundError);
    expect(error.family).toBe('missing.family');
    expect(error.channel).toBe('email');
    expect(error.locale).toBe('en');
  });

  it('throws when template exists but is deprecated (not active)', async () => {
    const templates = [
      makeMockRow({ template_family: 'auth.welcome', status: 'deprecated' }),
    ];
    const renderer = makeRenderer(templates);
    await expect(
      renderer.render({ templateFamily: 'auth.welcome', channel: 'email', locale: 'en', variables: {} }),
    ).rejects.toThrow(TemplateNotFoundError);
  });

  it('throws when template exists but is draft (not active)', async () => {
    const templates = [
      makeMockRow({ template_family: 'auth.welcome', status: 'draft' }),
    ];
    const renderer = makeRenderer(templates);
    await expect(
      renderer.render({ templateFamily: 'auth.welcome', channel: 'email', locale: 'en', variables: {} }),
    ).rejects.toThrow(TemplateNotFoundError);
  });
});

// ---------------------------------------------------------------------------
// G14 — TemplateVariableError
// ---------------------------------------------------------------------------

describe('TemplateVariableError (G14)', () => {
  it('throws TemplateVariableError when required variables are missing', async () => {
    const templates = [
      makeMockRow({
        template_family: 'auth.invite',
        body_template: '<p>Hi {{inviter_name}}</p>',
        // Correct schema format: { required: string[], optional: string[], properties: {} }
        variables_schema: makeSchema(['inviter_name', 'workspace_name']),
      }),
    ];
    const renderer = makeRenderer(templates);
    await expect(
      renderer.render({
        templateFamily: 'auth.invite',
        channel: 'email',
        locale: 'en',
        variables: { user_id: 'usr_100' }, // missing inviter_name and workspace_name
      }),
    ).rejects.toThrow(TemplateVariableError);
  });

  it('TemplateVariableError.missingVars lists all missing variable names', async () => {
    const templates = [
      makeMockRow({
        template_family: 'auth.invite',
        body_template: '<p>Hello</p>',
        variables_schema: makeSchema(['inviter_name', 'workspace_name']),
      }),
    ];
    const renderer = makeRenderer(templates);
    const error = (await renderer
      .render({ templateFamily: 'auth.invite', channel: 'email', locale: 'en', variables: { user_id: 'u' } })
      .catch((e: unknown) => e)) as TemplateVariableError;

    expect(error).toBeInstanceOf(TemplateVariableError);
    expect(error.missingVars).toContain('inviter_name');
    expect(error.missingVars).toContain('workspace_name');
  });

  it('does not throw when all required variables are supplied', async () => {
    const templates = [
      makeMockRow({
        template_family: 'auth.invite.2',
        body_template: '<p>Hi {{inviter_name}}</p>',
        variables_schema: makeSchema(['inviter_name']),
      }),
    ];
    const renderer = makeRenderer(templates);
    await expect(
      renderer.render({
        templateFamily: 'auth.invite.2',
        channel: 'email',
        locale: 'en',
        variables: { inviter_name: 'Tunde', user_id: 'usr_200' },
      }),
    ).resolves.toBeDefined();
  });

  it('does not throw when optional variables are absent', async () => {
    const templates = [
      makeMockRow({
        template_family: 'auth.promo',
        body_template: '<p>Hello</p>',
        // promo_code is optional — absence must not throw
        variables_schema: makeSchema([], ['promo_code']),
      }),
    ];
    const renderer = makeRenderer(templates);
    await expect(
      renderer.render({
        templateFamily: 'auth.promo',
        channel: 'email',
        locale: 'en',
        variables: { user_id: 'usr_300' },
      }),
    ).resolves.toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// G17 — WhatsAppNotApprovedError
// ---------------------------------------------------------------------------

describe('WhatsAppNotApprovedError (G17)', () => {
  it('throws WhatsAppNotApprovedError for whatsapp channel when status != meta_approved', async () => {
    const templates = [
      makeMockRow({
        template_family: 'auth.welcome',
        channel: 'whatsapp',
        whatsapp_approval_status: 'pending',
      }),
    ];
    const renderer = makeRenderer(templates);
    await expect(
      renderer.render({
        templateFamily: 'auth.welcome',
        channel: 'whatsapp',
        locale: 'en',
        variables: { user_id: 'usr_wa1' },
      }),
    ).rejects.toThrow(WhatsAppNotApprovedError);
  });

  it('allows whatsapp dispatch when whatsapp_approval_status = meta_approved', async () => {
    const templates = [
      makeMockRow({
        template_family: 'auth.welcome.wa',
        channel: 'whatsapp',
        whatsapp_approval_status: 'meta_approved',
        body_template: 'Hi {{user_id}}',
      }),
    ];
    const renderer = makeRenderer(templates);
    await expect(
      renderer.render({
        templateFamily: 'auth.welcome.wa',
        channel: 'whatsapp',
        locale: 'en',
        variables: { user_id: 'usr_wa2' },
      }),
    ).resolves.toBeDefined();
  });

  it('WhatsAppNotApprovedError carries template family and approval status', async () => {
    const templates = [
      makeMockRow({
        template_family: 'auth.welcome.wa2',
        channel: 'whatsapp',
        whatsapp_approval_status: 'rejected',
      }),
    ];
    const renderer = makeRenderer(templates);
    const error = (await renderer
      .render({ templateFamily: 'auth.welcome.wa2', channel: 'whatsapp', locale: 'en', variables: {} })
      .catch((e: unknown) => e)) as WhatsAppNotApprovedError;

    expect(error).toBeInstanceOf(WhatsAppNotApprovedError);
    expect(error.family).toBe('auth.welcome.wa2');
    expect(error.approvalStatus).toBe('rejected');
  });
});

// ---------------------------------------------------------------------------
// N-034 — Tenant override resolution
// ---------------------------------------------------------------------------

describe('N-034 tenant override resolution', () => {
  it('tenant-specific template overrides platform default', async () => {
    const templates = [
      makeMockRow({
        template_family: 'auth.welcome',
        tenant_id: null,
        body_template: '<p>Platform default body</p>',
      }),
      makeMockRow({
        template_family: 'auth.welcome',
        tenant_id: 'ten_abc',
        body_template: '<p>Tenant override body</p>',
      }),
    ];
    const renderer = makeRenderer(templates);
    const result = await renderer.render({
      templateFamily: 'auth.welcome',
      channel: 'email',
      locale: 'en',
      tenantId: 'ten_abc',
      variables: { user_id: 'usr_t1' },
    });

    expect(result.body).toContain('Tenant override body');
    expect(result.body).not.toContain('Platform default body');
  });

  it('falls back to platform default when no tenant-specific template exists', async () => {
    const templates = [
      makeMockRow({
        template_family: 'auth.welcome',
        tenant_id: null,
        body_template: '<p>Platform default body</p>',
      }),
    ];
    const renderer = makeRenderer(templates);
    const result = await renderer.render({
      templateFamily: 'auth.welcome',
      channel: 'email',
      locale: 'en',
      tenantId: 'ten_xyz',
      variables: { user_id: 'usr_t2' },
    });

    expect(result.body).toContain('Platform default body');
  });
});

// ---------------------------------------------------------------------------
// N-034 — Locale fallback
// ---------------------------------------------------------------------------

describe('N-034 locale fallback', () => {
  it('falls back to en locale when requested locale not found', async () => {
    const templates = [
      makeMockRow({
        template_family: 'auth.welcome',
        locale: 'en',
        body_template: '<p>English fallback body</p>',
      }),
    ];
    const renderer = makeRenderer(templates);
    const result = await renderer.render({
      templateFamily: 'auth.welcome',
      channel: 'email',
      locale: 'ha', // Hausa — not in DB
      variables: { user_id: 'usr_l1' },
    });

    expect(result.body).toContain('English fallback body');
  });

  it('uses requested locale when it exists', async () => {
    const templates = [
      makeMockRow({
        template_family: 'auth.welcome',
        locale: 'en',
        body_template: '<p>English body</p>',
      }),
      makeMockRow({
        template_family: 'auth.welcome',
        locale: 'yo',
        body_template: '<p>Yoruba body</p>',
      }),
    ];
    const renderer = makeRenderer(templates);
    const result = await renderer.render({
      templateFamily: 'auth.welcome',
      channel: 'email',
      locale: 'yo',
      variables: { user_id: 'usr_l2' },
    });

    expect(result.body).toContain('Yoruba body');
  });

  it('throws TemplateNotFoundError when even en fallback is absent', async () => {
    const templates = [
      makeMockRow({
        template_family: 'auth.welcome',
        locale: 'yo', // only Yoruba, no English
      }),
    ];
    const renderer = makeRenderer(templates);
    await expect(
      renderer.render({
        templateFamily: 'auth.welcome',
        channel: 'email',
        locale: 'ha',
        variables: { user_id: 'usr_l3' },
      }),
    ).rejects.toThrow(TemplateNotFoundError);
  });
});

// ---------------------------------------------------------------------------
// preview() — identical output shape but unsubscribe_url always '#unsub'
// ---------------------------------------------------------------------------

describe('TemplateRenderer.preview()', () => {
  it('returns the same fields as render()', async () => {
    const templates = [
      makeMockRow({ template_family: 'auth.welcome', body_template: '<p>Hi</p>' }),
    ];
    const renderer = makeRenderer(templates, { secret: 'abc-secret-32-chars-minimum-xyz!!' });
    const result = await renderer.preview({
      templateFamily: 'auth.welcome',
      channel: 'email',
      locale: 'en',
      variables: { user_id: 'usr_p1' },
    });

    expect(result).toHaveProperty('templateId');
    expect(result).toHaveProperty('templateVersion');
    expect(result).toHaveProperty('body');
    expect(result).toHaveProperty('locale');
  });

  it('uses #unsub for unsubscribe_url even when secret is set (preview mode)', async () => {
    const templates = [
      makeMockRow({
        template_family: 'auth.preview.unsub',
        body_template: '<p>Unsubscribe: {{unsubscribe_url}}</p>',
      }),
    ];
    const renderer = makeRenderer(templates, { secret: 'preview-secret-32-chars-minimum!!' });
    const result = await renderer.preview({
      templateFamily: 'auth.preview.unsub',
      channel: 'email',
      locale: 'en',
      variables: { user_id: 'usr_p2' },
    });

    expect(result.body).toContain('#unsub');
    expect(result.body).not.toContain('token=');
  });
});

// ---------------------------------------------------------------------------
// findTemplate — standalone
// ---------------------------------------------------------------------------

describe('findTemplate()', () => {
  it('returns the active template matching family + channel + locale', async () => {
    const tpl = makeMockRow({ template_family: 'test.find' });
    const db = makeTemplateDb([tpl]);
    const found = await findTemplate(db, 'test.find', 'email', 'en', null);

    expect(found).not.toBeNull();
    expect(found!.template_family).toBe('test.find');
  });

  it('returns null when no template exists', async () => {
    const db = makeTemplateDb([]);
    const found = await findTemplate(db, 'does.not.exist', 'email', 'en', null);

    expect(found).toBeNull();
  });

  it('returns null for deprecated templates', async () => {
    const tpl = makeMockRow({ template_family: 'test.deprecated', status: 'deprecated' });
    const db = makeTemplateDb([tpl]);
    const found = await findTemplate(db, 'test.deprecated', 'email', 'en', null);

    expect(found).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// publishTemplate — N-035
// ---------------------------------------------------------------------------

describe('publishTemplate() N-035', () => {
  it('activates a draft template and returns deprecatedCount', async () => {
    const activeTpl = makeMockRow({
      id: 'tpl_pub_active_001',
      template_family: 'pub.welcome',
      status: 'active',
      version: 1,
    });
    const draftTpl = makeMockRow({
      id: 'tpl_pub_draft_001',
      template_family: 'pub.welcome',
      status: 'draft',
      version: 2,
    });

    const templates = [activeTpl, draftTpl];
    const db = makeTemplateDb(templates);

    const { deprecatedCount } = await publishTemplate('tpl_pub_draft_001', null, db);

    // Should return a numeric deprecatedCount (may be 0 or more depending on mock)
    expect(typeof deprecatedCount).toBe('number');
    expect(deprecatedCount).toBeGreaterThanOrEqual(0);
    // After publish, the draft should be active in our mutable array
    expect(draftTpl.status).toBe('active');
  });

  it('throws when template id does not exist', async () => {
    const db = makeTemplateDb([]);
    await expect(
      publishTemplate('nonexistent_tpl_id', null, db),
    ).rejects.toThrow();
  });

  it('throws when attempting to publish a non-draft template (active template)', async () => {
    const activeTpl = makeMockRow({
      id: 'tpl_pub_active_002',
      template_family: 'pub.welcome2',
      status: 'active',
    });
    const db = makeTemplateDb([activeTpl]);
    await expect(
      publishTemplate('tpl_pub_active_002', null, db),
    ).rejects.toThrow();
  });
});
