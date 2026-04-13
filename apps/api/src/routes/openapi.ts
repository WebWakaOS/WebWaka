/**
 * OpenAPI Spec Endpoint — WebWaka 1.0.1
 * Sprint 2, Task 2.2
 *
 * Serves OpenAPI 3.1 specification at /openapi.json
 * Auto-generated from route definitions.
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';

const openapiRoutes = new Hono<{ Bindings: Env }>();

const spec = {
  openapi: '3.1.0',
  info: {
    title: 'WebWaka OS API',
    version: '1.0.1',
    description: 'Multi-tenant, multi-vertical SaaS platform API for Africa. Governance-driven, edge-first on Cloudflare Workers.',
    contact: { name: 'WebWaka Platform Team', email: 'platform@webwaka.com' },
    license: { name: 'Proprietary', url: 'https://webwaka.com/terms' },
  },
  servers: [
    { url: 'https://api.webwaka.com', description: 'Production' },
    { url: 'https://api-staging.webwaka.com', description: 'Staging' },
  ],
  tags: [
    { name: 'Health', description: 'Liveness and version endpoints' },
    { name: 'Auth', description: 'JWT authentication and session management' },
    { name: 'Geography', description: 'Nigerian geography hierarchy (T6)' },
    { name: 'Discovery', description: 'Public search and entity profiles' },
    { name: 'Claims', description: 'Claim-first growth lifecycle (T7)' },
    { name: 'Entities', description: 'Individuals, organizations, places' },
    { name: 'Workspaces', description: 'Tenant workspace management' },
    { name: 'Payments', description: 'Paystack payment integration' },
    { name: 'Identity', description: 'BVN/NIN/CAC/FRSC verification (M7a)' },
    { name: 'Contact', description: 'Multi-channel contact management (M7a)' },
    { name: 'Sync', description: 'Offline queue replay (M7b, P6)' },
    { name: 'POS', description: 'Point of sale and float ledger (M7b)' },
    { name: 'Community', description: 'Community channels, events, lessons (M7c)' },
    { name: 'Social', description: 'Profiles, posts, DMs, stories (M7c)' },
    { name: 'Verticals', description: 'Vertical registry and sector routes (M8+)' },
    { name: 'SuperAgent', description: 'AI integration layer (P7/P8)' },
    { name: 'Negotiation', description: 'Negotiable pricing engine' },
    { name: 'Partners', description: 'Partner and sub-partner management (M11)' },
    { name: 'Templates', description: 'Template marketplace registry (v1.0.1)' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Liveness probe',
        operationId: 'getHealth',
        responses: {
          '200': {
            description: 'Service is healthy',
            content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'ok' }, service: { type: 'string' }, environment: { type: 'string' }, timestamp: { type: 'string', format: 'date-time' } } } } },
          },
        },
      },
    },
    '/health/version': {
      get: {
        tags: ['Health'],
        summary: 'API version',
        operationId: 'getVersion',
        responses: { '200': { description: 'Current API version', content: { 'application/json': { schema: { type: 'object', properties: { version: { type: 'string', example: '1.0.1' } } } } } } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Issue JWT token',
        operationId: 'authLogin',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } }, required: ['email', 'password'] } } } },
        responses: { '200': { description: 'JWT issued' }, '401': { description: 'Invalid credentials' } },
      },
    },
    '/auth/verify': {
      post: {
        tags: ['Auth'],
        summary: 'Validate JWT and return decoded payload',
        operationId: 'authVerify',
        responses: { '200': { description: 'Token valid' }, '401': { description: 'Invalid token' } },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh JWT token',
        operationId: 'authRefresh',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'New token issued' } },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current auth context',
        operationId: 'authMe',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Auth context' } },
      },
    },
    '/geography/places/{id}': {
      get: {
        tags: ['Geography'],
        summary: 'Get place by ID',
        operationId: 'getPlace',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Place node' }, '404': { description: 'Not found' } },
      },
    },
    '/geography/places/{id}/children': {
      get: {
        tags: ['Geography'],
        summary: 'Get direct children of a place',
        operationId: 'getPlaceChildren',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Child place nodes' } },
      },
    },
    '/geography/places/{id}/ancestry': {
      get: {
        tags: ['Geography'],
        summary: 'Get ancestry breadcrumb for a place',
        operationId: 'getPlaceAncestry',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Ancestry chain' } },
      },
    },
    '/discovery/search': {
      get: {
        tags: ['Discovery'],
        summary: 'Full-text + geography search',
        operationId: 'discoverySearch',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' } },
          { name: 'place_id', in: 'query', schema: { type: 'string' } },
          { name: 'type', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { '200': { description: 'Search results' } },
      },
    },
    '/discovery/profiles/{type}/{id}': {
      get: {
        tags: ['Discovery'],
        summary: 'Get public profile',
        operationId: 'getProfile',
        parameters: [
          { name: 'type', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Public profile' }, '404': { description: 'Not found' } },
      },
    },
    '/discovery/nearby/{placeId}': {
      get: {
        tags: ['Discovery'],
        summary: 'Entities near a geography node',
        operationId: 'discoveryNearby',
        parameters: [{ name: 'placeId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Nearby entities' } },
      },
    },
    '/discovery/trending': {
      get: {
        tags: ['Discovery'],
        summary: 'Most-viewed entities this week',
        operationId: 'discoveryTrending',
        responses: { '200': { description: 'Trending entities' } },
      },
    },
    '/claim/intent': {
      post: {
        tags: ['Claims'],
        summary: 'Submit formal claim request',
        operationId: 'claimIntent',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Claim intent created' } },
      },
    },
    '/claim/advance': {
      post: {
        tags: ['Claims'],
        summary: 'Advance claim state (admin only)',
        operationId: 'claimAdvance',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Claim advanced' } },
      },
    },
    '/claim/status/{profileId}': {
      get: {
        tags: ['Claims'],
        summary: 'Get public claim status',
        operationId: 'claimStatus',
        parameters: [{ name: 'profileId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Claim status' } },
      },
    },
    '/entities/individuals': {
      get: {
        tags: ['Entities'],
        summary: 'List individuals',
        operationId: 'listIndividuals',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Individual list' } },
      },
      post: {
        tags: ['Entities'],
        summary: 'Create individual',
        operationId: 'createIndividual',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Individual created' } },
      },
    },
    '/entities/organizations': {
      get: {
        tags: ['Entities'],
        summary: 'List organizations',
        operationId: 'listOrganizations',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Organization list' } },
      },
      post: {
        tags: ['Entities'],
        summary: 'Create organization',
        operationId: 'createOrganization',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Organization created' } },
      },
    },
    '/sync/apply': {
      post: {
        tags: ['Sync'],
        summary: 'Replay offline queue (P6/P11 — server-wins conflict)',
        operationId: 'syncApply',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Sync applied' } },
      },
    },
    '/pos/terminals': {
      post: {
        tags: ['POS'],
        summary: 'Register POS terminal',
        operationId: 'registerTerminal',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Terminal registered' } },
      },
    },
    '/pos/float/balance': {
      get: {
        tags: ['POS'],
        summary: 'Get current float balance',
        operationId: 'getFloatBalance',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Balance in integer kobo (T4)' } },
      },
    },
    '/templates': {
      get: {
        tags: ['Templates'],
        summary: 'List approved templates (paginated)',
        operationId: 'listTemplates',
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['dashboard', 'website', 'vertical-blueprint', 'workflow', 'email', 'module'] } },
          { name: 'vertical', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 50 } },
        ],
        responses: { '200': { description: 'Paginated template list' } },
      },
      post: {
        tags: ['Templates'],
        summary: 'Publish template (super_admin only)',
        operationId: 'publishTemplate',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  slug: { type: 'string', pattern: '^[a-z0-9-]+$' },
                  display_name: { type: 'string', minLength: 2 },
                  description: { type: 'string', minLength: 10 },
                  template_type: { type: 'string', enum: ['dashboard', 'website', 'vertical-blueprint', 'workflow', 'email', 'module'] },
                  version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+' },
                  platform_compat: { type: 'string' },
                  compatible_verticals: { type: 'array', items: { type: 'string' } },
                  manifest_json: { type: 'object' },
                  price_kobo: { type: 'integer', minimum: 0, description: 'T4: integer kobo only' },
                },
                required: ['slug', 'display_name', 'description', 'template_type', 'version', 'platform_compat', 'manifest_json'],
              },
            },
          },
        },
        responses: { '201': { description: 'Template published (pending review)' }, '403': { description: 'Not super_admin' }, '409': { description: 'Slug already exists' }, '422': { description: 'Validation error' } },
      },
    },
    '/templates/{slug}': {
      get: {
        tags: ['Templates'],
        summary: 'Get template manifest by slug',
        operationId: 'getTemplate',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Template manifest' }, '404': { description: 'Not found' } },
      },
    },
    '/templates/installed': {
      get: {
        tags: ['Templates'],
        summary: 'List installed templates for current tenant',
        operationId: 'listInstalledTemplates',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Installed template list' } },
      },
    },
    '/templates/{slug}/install': {
      post: {
        tags: ['Templates'],
        summary: 'Install template to tenant',
        operationId: 'installTemplate',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { vertical: { type: 'string' }, config: { type: 'object' } } } } } },
        responses: { '201': { description: 'Template installed' }, '404': { description: 'Template not found or not approved' }, '409': { description: 'Already installed' }, '422': { description: 'Incompatible version or vertical' } },
      },
      delete: {
        tags: ['Templates'],
        summary: 'Rollback template installation',
        operationId: 'rollbackTemplate',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Template rolled back' }, '404': { description: 'Not installed' } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token from /auth/login. Payload includes sub (userId), tenant_id, role.',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
  },
};

openapiRoutes.get('/', (c) => {
  return c.json(spec);
});

/**
 * GET / on the /docs mount — Swagger UI
 * GOV-03: Interactive API documentation served at /docs
 * Uses Swagger UI from CDN — no npm package required for Cloudflare Workers.
 * Mounted via: app.route('/docs', swaggerRoutes)  in apps/api/src/index.ts
 */
export const swaggerRoutes = new Hono<{ Bindings: Env }>();
swaggerRoutes.get('/', (c) => {
  const specUrl = '/openapi.json';
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WebWaka OS API — Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fafafa; }
    .topbar { display: none; }
    .swagger-ui .info .title { color: #006400; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      SwaggerUIBundle({
        url: '${specUrl}',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
        layout: 'BaseLayout',
        tryItOutEnabled: true,
        filter: true,
        persistAuthorization: true,
      });
    };
  </script>
</body>
</html>`;
  return c.html(html);
});

export { openapiRoutes };
