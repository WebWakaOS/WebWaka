/**
 * Image Pipeline routes — Phase 3 (E23)
 * Low-bandwidth image variant URL registry.
 *
 * POST   /image-variants                         — register an image for variant processing
 * GET    /image-variants/:entityType/:entityId   — get variant URLs for an entity
 * PATCH  /image-variants/:id/process             — admin marks processing complete with variant URLs
 *
 * Actual R2 image resizing is async (Cloudflare Image Resizing worker, Phase 6).
 * Until processing completes, thumbnailUrl is derived from originalUrl + ?w=100&h=100&fit=crop
 * so clients always have a usable thumbnail URL immediately (M13 gate: < 100KB thumbnails).
 *
 * T3: tenant_id from JWT on all queries.
 * AC-FUNC-03: migration 0447 has rollback in infra/db/migrations/rollback/0447_rollback.sql.
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };

interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      first<T>(): Promise<T | null>;
      run(): Promise<{ success: boolean }>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

interface ImageVariantRow {
  id: string;
  tenant_id: string;
  entity_type: string;
  entity_id: string;
  original_url: string;
  thumbnail_url: string | null;
  card_url: string | null;
  full_url: string | null;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  processed_at: number | null;
  created_at: number;
}

const ALLOWED_ENTITY_TYPES = ['group', 'campaign', 'event', 'workspace', 'individual'] as const;
type AllowedEntityType = typeof ALLOWED_ENTITY_TYPES[number];

function isAllowedEntityType(t: string): t is AllowedEntityType {
  return (ALLOWED_ENTITY_TYPES as readonly string[]).includes(t);
}

/**
 * Derive a thumbnail URL from the original URL using query-param convention.
 * Real R2 resizing (Cloudflare Image Resizing) uses the same query params in Phase 6.
 * This ensures GET /image-variants always returns a usable thumbnail URL immediately.
 */
function deriveThumbnailUrl(originalUrl: string): string {
  const url = new URL(originalUrl.startsWith('http') ? originalUrl : `https://placeholder.invalid/${originalUrl}`);
  url.searchParams.set('w', '100');
  url.searchParams.set('h', '100');
  url.searchParams.set('fit', 'crop');
  url.searchParams.set('f', 'webp');
  return url.toString();
}

function deriveCardUrl(originalUrl: string): string {
  const url = new URL(originalUrl.startsWith('http') ? originalUrl : `https://placeholder.invalid/${originalUrl}`);
  url.searchParams.set('w', '400');
  url.searchParams.set('fit', 'scale-down');
  url.searchParams.set('f', 'webp');
  return url.toString();
}

function formatVariantResponse(row: ImageVariantRow): Record<string, unknown> {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    originalUrl: row.original_url,
    thumbnailUrl: row.thumbnail_url ?? deriveThumbnailUrl(row.original_url),
    cardUrl: row.card_url ?? deriveCardUrl(row.original_url),
    fullUrl: row.full_url ?? row.original_url,
    status: row.status,
    processedAt: row.processed_at,
    createdAt: row.created_at,
  };
}

export const imagePipelineRoutes = new Hono<AppEnv>();

/**
 * POST /image-variants
 * Register an image for variant processing.
 * Returns immediately with pending status + derived thumbnail URL.
 */
imagePipelineRoutes.post('/', async (c) => {
  const auth = c.get('auth');
  const tenantId = auth.tenantId;
  const db = c.env.DB as unknown as D1Like;

  const body = await c.req.json<{ entityType?: string; entityId?: string; originalUrl?: string }>().catch(() => null);

  if (!body?.entityType || !body.entityId || !body.originalUrl) {
    return c.json({ error: 'entityType, entityId, and originalUrl are required.' }, 400);
  }

  if (!isAllowedEntityType(body.entityType)) {
    return c.json({
      error: `entityType must be one of: ${ALLOWED_ENTITY_TYPES.join(', ')}`,
    }, 400);
  }

  // Upsert: if a record already exists for (entity_type, entity_id, tenant_id) return it
  const existing = await db
    .prepare('SELECT * FROM image_variants WHERE entity_type = ? AND entity_id = ? AND tenant_id = ? LIMIT 1')
    .bind(body.entityType, body.entityId, tenantId)
    .first<ImageVariantRow>();

  if (existing) {
    return c.json(formatVariantResponse(existing), 200);
  }

  const id = `iv_${crypto.randomUUID()}`;
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(`
      INSERT INTO image_variants (id, tenant_id, entity_type, entity_id, original_url, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'pending', ?)
    `)
    .bind(id, tenantId, body.entityType, body.entityId, body.originalUrl, now)
    .run();

  return c.json({
    id,
    entityType: body.entityType,
    entityId: body.entityId,
    originalUrl: body.originalUrl,
    thumbnailUrl: deriveThumbnailUrl(body.originalUrl),
    cardUrl: deriveCardUrl(body.originalUrl),
    fullUrl: body.originalUrl,
    status: 'pending',
    processedAt: null,
    createdAt: now,
  }, 201);
});

/**
 * GET /image-variants/:entityType/:entityId
 * Get variant URLs for an entity. Returns 404 if not yet registered.
 * T3: only returns variants belonging to the authenticated tenant.
 */
imagePipelineRoutes.get('/:entityType/:entityId', async (c) => {
  const auth = c.get('auth');
  const tenantId = auth.tenantId;
  const db = c.env.DB as unknown as D1Like;

  const { entityType, entityId } = c.req.param();

  const row = await db
    .prepare('SELECT * FROM image_variants WHERE entity_type = ? AND entity_id = ? AND tenant_id = ? LIMIT 1')
    .bind(entityType, entityId, tenantId)
    .first<ImageVariantRow>();

  if (!row) {
    return c.json({ error: 'Image variant record not found.' }, 404);
  }

  return c.json(formatVariantResponse(row), 200);
});

/**
 * PATCH /image-variants/:id/process
 * Admin endpoint: marks processing complete and stores variant URLs.
 * In Phase 6, this is called by the Cloudflare Image Resizing worker via INTER_SERVICE_SECRET.
 * T3: tenant_id guard prevents cross-tenant mutations.
 */
imagePipelineRoutes.patch('/:id/process', async (c) => {
  const auth = c.get('auth');
  const tenantId = auth.tenantId;
  const db = c.env.DB as unknown as D1Like;

  const { id } = c.req.param();
  const body = await c.req.json<{
    thumbnailUrl?: string;
    cardUrl?: string;
    fullUrl?: string;
    status?: 'ready' | 'failed';
  }>().catch(() => null);

  if (!body) {
    return c.json({ error: 'Request body is required.' }, 400);
  }

  const existing = await db
    .prepare('SELECT * FROM image_variants WHERE id = ? AND tenant_id = ? LIMIT 1')
    .bind(id, tenantId)
    .first<ImageVariantRow>();

  if (!existing) {
    return c.json({ error: 'Image variant not found.' }, 404);
  }

  const status = body.status ?? 'ready';
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(`
      UPDATE image_variants
      SET thumbnail_url = ?, card_url = ?, full_url = ?, status = ?, processed_at = ?
      WHERE id = ? AND tenant_id = ?
    `)
    .bind(
      body.thumbnailUrl ?? existing.thumbnail_url,
      body.cardUrl ?? existing.card_url,
      body.fullUrl ?? existing.full_url,
      status,
      now,
      id,
      tenantId,
    )
    .run();

  return c.json({
    id,
    status,
    processedAt: now,
    thumbnailUrl: body.thumbnailUrl ?? existing.thumbnail_url ?? deriveThumbnailUrl(existing.original_url),
    cardUrl: body.cardUrl ?? existing.card_url ?? deriveCardUrl(existing.original_url),
    fullUrl: body.fullUrl ?? existing.full_url ?? existing.original_url,
  }, 200);
});
