/**
 * WebWaka API — Cloudflare Worker entry point
 *
 * Built on Hono. Bindings: DB (D1), RATE_LIMIT_KV, CACHE_KV, SESSIONS_KV
 * Secrets: JWT_SECRET, INTER_SERVICE_SECRET
 */

export interface Env {
  DB: D1Database;
  RATE_LIMIT_KV: KVNamespace;
  CACHE_KV: KVNamespace;
  SESSIONS_KV: KVNamespace;
  ENVIRONMENT: string;
  LOG_LEVEL: string;
  JWT_SECRET: string;
  INTER_SERVICE_SECRET: string;
}

export default {
  fetch(request: Request, env: Env, _ctx: ExecutionContext): Response {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === "/health" || url.pathname === "/") {
      return Response.json({
        status: "ok",
        environment: env.ENVIRONMENT ?? "unknown",
        version: "0.1.0",
        timestamp: new Date().toISOString(),
      });
    }

    // 404 fallback
    return Response.json(
      { error: "Not Found", path: url.pathname },
      { status: 404 }
    );
  },
} satisfies ExportedHandler<Env>;
