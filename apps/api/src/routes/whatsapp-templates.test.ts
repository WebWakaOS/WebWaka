/**
 * Tests for WhatsApp Business API Template Management routes — Phase 3 (E24)
 * WA01–WA08: GET list, POST create, GET by id, PATCH status (approve/reject),
 *            GET /defaults (5 platform templates), T3 tenant isolation.
 */

import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { whatsappTemplateRoutes } from './whatsapp-templates.js';
import type { AuthContext } from '@webwaka/types';

interface WATemplateRow {
  id: string;
  tenant_id: string;
  event_type: string;
  template_name: string;
  template_status: string;
  template_body: string;
  language_code: string;
  is_platform_default: number;
  submitted_at: number | null;
  approved_at: number | null;
  rejected_at: number | null;
  rejection_reason: string | null;
  fallback_to_inapp: number;
  created_at: number;
  updated_at: number;
}

const PLATFORM_DEFAULTS: WATemplateRow[] = [
  { id: 'wt_platform_001', tenant_id: '__platform__', event_type: 'group.broadcast_sent', template_name: 'webwaka_group_broadcast', template_status: 'pending', template_body: '{{1}}: {{2}}', language_code: 'en_NG', is_platform_default: 1, submitted_at: null, approved_at: null, rejected_at: null, rejection_reason: null, fallback_to_inapp: 0, created_at: 1700000000, updated_at: 1700000000 },
  { id: 'wt_platform_002', tenant_id: '__platform__', event_type: 'case.opened', template_name: 'webwaka_case_opened', template_status: 'pending', template_body: 'New case {{1}} opened in {{2}}.', language_code: 'en_NG', is_platform_default: 1, submitted_at: null, approved_at: null, rejected_at: null, rejection_reason: null, fallback_to_inapp: 0, created_at: 1700000000, updated_at: 1700000000 },
  { id: 'wt_platform_003', tenant_id: '__platform__', event_type: 'mutual_aid.approved', template_name: 'webwaka_mutual_aid_approved', template_status: 'pending', template_body: 'Mutual aid request {{1}} approved for {{2}}.', language_code: 'en_NG', is_platform_default: 1, submitted_at: null, approved_at: null, rejected_at: null, rejection_reason: null, fallback_to_inapp: 0, created_at: 1700000000, updated_at: 1700000000 },
  { id: 'wt_platform_004', tenant_id: '__platform__', event_type: 'dues.payment_recorded', template_name: 'webwaka_dues_payment', template_status: 'pending', template_body: 'Dues payment {{1}} confirmed for {{2}}.', language_code: 'en_NG', is_platform_default: 1, submitted_at: null, approved_at: null, rejected_at: null, rejection_reason: null, fallback_to_inapp: 0, created_at: 1700000000, updated_at: 1700000000 },
  { id: 'wt_platform_005', tenant_id: '__platform__', event_type: 'workflow.completed', template_name: 'webwaka_workflow_completed', template_status: 'pending', template_body: 'Workflow {{1}} completed: {{2}}.', language_code: 'en_NG', is_platform_default: 1, submitted_at: null, approved_at: null, rejected_at: null, rejection_reason: null, fallback_to_inapp: 0, created_at: 1700000000, updated_at: 1700000000 },
];

const TENANT_TEMPLATE: WATemplateRow = {
  id: 'wt_tenant_001',
  tenant_id: 'tenant_001',
  event_type: 'group.broadcast_sent',
  template_name: 'my_broadcast',
  template_status: 'pending',
  template_body: 'Hello {{1}}',
  language_code: 'en_NG',
  is_platform_default: 0,
  submitted_at: null,
  approved_at: null,
  rejected_at: null,
  rejection_reason: null,
  fallback_to_inapp: 0,
  created_at: 1700001000,
  updated_at: 1700001000,
};

function makeApp(
  overrideFirst: WATemplateRow | null = null,
  allResults: WATemplateRow[] = [],
  tenantId = 'tenant_001',
): Hono {
  const app = new Hono();

  const db = {
    prepare: vi.fn().mockImplementation((_sql: string) => ({
      bind: (..._args: unknown[]) => ({
        first: <T>() => Promise.resolve(overrideFirst as T),
        run: () => Promise.resolve({ success: true }),
        all: <T>() => Promise.resolve({ results: allResults as T[] }),
      }),
    })),
  };

  app.use('*', async (c, next) => {
    c.set('auth', {
      userId: 'usr_001',
      tenantId,
      workspaceId: 'wsp_001',
      role: 'admin',
      permissions: [],
    } as unknown as AuthContext);
    c.env = { DB: db } as never;
    await next();
  });

  app.route('/', whatsappTemplateRoutes);
  return app;
}

describe('GET /whatsapp-templates (WA01)', () => {
  it('WA01: returns template list including platform defaults', async () => {
    const app = makeApp(null, [...PLATFORM_DEFAULTS, TENANT_TEMPLATE]);
    const res = await app.request('/');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(Array.isArray(body['templates'])).toBe(true);
    const templates = body['templates'] as unknown[];
    expect(templates.length).toBeGreaterThanOrEqual(1);
  });
});

describe('POST /whatsapp-templates (WA02–WA03)', () => {
  it('WA02: creates a new template in pending status', async () => {
    const app = makeApp(null, []);
    const res = await app.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'group.broadcast_sent',
        templateName: 'my_custom_broadcast',
        templateBody: 'Hello {{1}}, your broadcast: {{2}}',
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as Record<string, unknown>;
    expect(body['templateStatus']).toBe('pending');
    expect(body['isPlatformDefault']).toBe(false);
    expect(body['fallbackToInapp']).toBe(false);
  });

  it('WA03: returns 400 when required fields are missing', async () => {
    const app = makeApp(null, []);
    const res = await app.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'group.broadcast_sent' }),
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /whatsapp-templates/defaults (WA04)', () => {
  it('WA04: returns 5 platform default templates', async () => {
    const app = makeApp(null, PLATFORM_DEFAULTS);
    const res = await app.request('/defaults');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body['count']).toBe(5);
    const defaults = body['defaults'] as Array<Record<string, unknown>>;
    const eventTypes = defaults.map(d => d['eventType']);
    expect(eventTypes).toContain('group.broadcast_sent');
    expect(eventTypes).toContain('case.opened');
    expect(eventTypes).toContain('mutual_aid.approved');
    expect(eventTypes).toContain('dues.payment_recorded');
    expect(eventTypes).toContain('workflow.completed');
  });
});

describe('GET /whatsapp-templates/:id (WA05)', () => {
  it('WA05: returns a single template by id', async () => {
    const app = makeApp(TENANT_TEMPLATE, []);
    const res = await app.request('/wt_tenant_001');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body['id']).toBe('wt_tenant_001');
    expect(body['templateStatus']).toBe('pending');
  });
});

describe('PATCH /whatsapp-templates/:id/status (WA06–WA07)', () => {
  it('WA06: approving a template sets approvedAt and keeps fallbackToInapp false', async () => {
    const app = makeApp(TENANT_TEMPLATE, []);
    const res = await app.request('/wt_tenant_001/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body['templateStatus']).toBe('approved');
    expect(typeof body['approvedAt']).toBe('number');
    expect(body['fallbackToInapp']).toBe(false);
  });

  it('WA07: rejecting a template sets fallbackToInapp=true and records rejectionReason', async () => {
    const app = makeApp(TENANT_TEMPLATE, []);
    const res = await app.request('/wt_tenant_001/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'rejected',
        rejectionReason: 'Template contains disallowed content.',
      }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body['templateStatus']).toBe('rejected');
    expect(body['fallbackToInapp']).toBe(true);
    expect(body['rejectionReason']).toBe('Template contains disallowed content.');
    expect(typeof body['rejectedAt']).toBe('number');
  });
});

describe('T3 — tenant isolation (WA08)', () => {
  it('WA08: tenant_002 cannot see tenant_001 templates by id', async () => {
    const app = makeApp(null, [], 'tenant_002');
    const res = await app.request('/wt_tenant_001');
    expect(res.status).toBe(404);
  });
});
