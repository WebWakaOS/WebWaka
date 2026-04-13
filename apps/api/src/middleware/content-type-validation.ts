import { createMiddleware } from 'hono/factory';
import type { Env } from '../env.js';

const BODY_REQUIRED_METHODS = new Set(['POST', 'PUT', 'PATCH']);
const ALLOWED_CONTENT_TYPES = [
  'application/json',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
];

export const contentTypeValidationMiddleware = createMiddleware<{ Bindings: Env }>(
  async (c, next) => {
    if (!BODY_REQUIRED_METHODS.has(c.req.method)) {
      return next();
    }

    const contentType = c.req.header('Content-Type');
    if (!contentType) {
      return c.json({ error: 'Content-Type header is required for mutating requests' }, 415);
    }

    const normalised = contentType.toLowerCase().split(';')[0]?.trim() ?? '';
    if (!ALLOWED_CONTENT_TYPES.some((ct) => normalised === ct)) {
      return c.json(
        {
          error: `Unsupported Content-Type: ${normalised}`,
          allowed: ALLOWED_CONTENT_TYPES,
        },
        415,
      );
    }

    await next();
  },
);
