/**
 * ARC-05: Shared CORS configuration for all WebWaka workers.
 *
 * Centralizes origin validation logic so every worker enforces the same policy:
 * - Production: only *.webwaka.com origins (HTTPS)
 * - Non-production: also allows localhost:5173 for dev
 * - ALLOWED_ORIGINS env var overrides defaults when set
 */

export interface CorsConfigOptions {
  environment?: string;
  allowedOriginsEnv?: string;
  allowHeaders?: string[];
  allowMethods?: string[];
  maxAge?: number;
}

export function createCorsConfig(opts: CorsConfigOptions = {}) {
  const isProd = opts.environment === 'production';
  const envOrigins = opts.allowedOriginsEnv;

  const devOrigins = isProd ? [] : ['http://localhost:5173'];
  const allowed: string[] = envOrigins
    ? envOrigins.split(',').map((o) => o.trim()).filter(Boolean)
    : devOrigins;

  return {
    origin: (origin: string): string | null => {
      if (allowed.includes(origin)) return origin;
      if (
        origin.startsWith('https://') &&
        (origin.endsWith('.webwaka.com') || origin === 'https://webwaka.com')
      ) {
        return origin;
      }
      return null;
    },
    allowHeaders: opts.allowHeaders ?? ['Authorization', 'Content-Type'],
    allowMethods: opts.allowMethods ?? ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    maxAge: opts.maxAge ?? 86400,
  };
}
