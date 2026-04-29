/**
 * Developer Info Routes — Phase 6 / E33 (Public API + Developer Docs)
 *
 * GET /developer          — API metadata, versioning, and docs links
 * GET /developer/openapi  — inline OpenAPI 3.1 spec (JSON)
 *
 * Both endpoints are public — no auth required.
 * ADR-0018: API versioning enforced via X-API-Version response header.
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';

const developerRoutes = new Hono<{ Bindings: Env }>();

export const API_CURRENT_VERSION = '1';
export const API_SEMVER = '1.0.1';
export const API_MIN_VERSION = '1';

const SUPPORTED_CAPABILITIES = [
  'multi-tenant-isolation',
  'jwt-authentication',
  'webhook-subscriptions',
  'geography-hierarchy',
  'entity-discovery',
  'template-marketplace',
  'policy-engine',
  'ai-superagent',
  'ndpr-compliance',
  'offline-sync',
];

const PHASE_CHANGELOG: Array<{
  phase: string;
  released: string;
  routes: string[];
}> = [
  {
    phase: 'Phase 0 — Architecture Reset',
    released: '2026-04-28',
    routes: [
      'GET /geography/*, GET /discovery/*, POST /auth/login, POST /auth/register',
      'Groups module rename (support_groups → groups)',
      'Policy Engine schema introduced (policy_rules)',
    ],
  },
  {
    phase: 'Phase 1 — Foundation',
    released: '2026-04-28',
    routes: [
      'POST /cases, PATCH /cases/:id, GET /cases (Growth+)',
      'POST /compliance/dsar/request',
      'GET /sync/delta (offline incremental sync)',
    ],
  },
  {
    phase: 'Phase 2 — Universal Modules',
    released: '2026-04-28',
    routes: [
      'POST /dues/*, POST /mutual-aid/*',
      'POST /workflows/*',
      'GET /analytics/workspace, GET /analytics/groups/:id',
    ],
  },
  {
    phase: 'Phase 3 — Offline / PWA',
    released: '2026-04-28',
    routes: [
      'POST /provider-webhooks/resend (bounce handling)',
      'GET /image-pipeline/* (R2 variants)',
      'POST /whatsapp-templates/*',
    ],
  },
  {
    phase: 'Phase 4 — Template System',
    released: '2026-04-28',
    routes: [
      'GET /templates, POST /templates/:slug/install',
      'POST /onboarding/:workspaceId/template',
      'GET /wakapage/blocks (new block types)',
    ],
  },
  {
    phase: 'Phase 5 — AI / Policy / Analytics',
    released: '2026-04-28',
    routes: [
      'POST /appeals, GET /appeals/admin, PATCH /appeals/admin/:id',
      'Policy Engine: access_control + compliance_regime domains live',
      'AI capabilities: mobilization_analytics, broadcast_scheduler, member_segmentation, petition_optimizer, case_classifier',
    ],
  },
  {
    phase: 'Phase 6 — Ecosystem / Public Launch',
    released: '2026-04-28',
    routes: [
      'GET /developer, GET /developer/openapi',
      'GET /geography/countries (multi-country: NG, GH, KE)',
      'Webhook SDK event payload types published',
      'X-API-Version response header on all routes',
    ],
  },
];

/**
 * GET /developer
 * Returns API metadata, versioning policy, capabilities, and docs links.
 */
developerRoutes.get('/', async (c) => {
  return c.json({
    api: 'WebWaka OS API',
    version: {
      current: API_SEMVER,
      api_version_header: `X-API-Version: ${API_CURRENT_VERSION}`,
      min_supported: API_MIN_VERSION,
      versioning_policy:
        'Breaking changes require a new major API version. Non-breaking additions are backwards-compatible within the same version.',
    },
    description:
      'Multi-tenant, multi-vertical SaaS platform API for Africa (Nigeria-first). ' +
      'Governance-driven, edge-first on Cloudflare Workers. ' +
      'All protected endpoints require Authorization: Bearer <jwt>.',
    platform_invariants: {
      T3: 'Every query scoped by tenant_id from JWT — never from user-supplied input',
      P9: 'All monetary values in integer kobo — never floats or strings',
      P10: 'NDPR consent checked before any personal data collection',
      P13: 'No PII in AI requests or logs — all AI paths through SuperAgent SDK',
      G23: 'audit_logs is append-only — no UPDATE or DELETE ever',
    },
    capabilities: SUPPORTED_CAPABILITIES,
    endpoints: {
      openapi_spec: '/developer/openapi',
      openapi_ui: '/docs',
      health: '/health',
      version: '/version',
    },
    authentication: {
      type: 'Bearer JWT',
      issue: 'POST /auth/login',
      refresh: 'POST /auth/refresh',
      header: 'Authorization: Bearer <token>',
    },
    rate_limits: {
      login: '10 requests per minute per IP',
      otp: '5 OTP per hour per phone',
      identity_lookup: '2 BVN/NIN lookups per user per hour',
    },
    changelog: PHASE_CHANGELOG,
    support: {
      email: 'platform@webwaka.com',
      docs: 'https://api.webwaka.com/docs',
    },
  });
});

/**
 * GET /developer/openapi
 * Redirects to the OpenAPI JSON spec.
 */
developerRoutes.get('/openapi', (c) => {
  return c.redirect('/openapi.json', 301);
});

export { developerRoutes };
