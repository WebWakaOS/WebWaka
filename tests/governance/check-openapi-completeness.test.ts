/**
 * Governance check tests — check-openapi-completeness (Wave 3 C2-5)
 */
import { describe, it, expect } from 'vitest';

const HTTP_METHODS   = ['get', 'post', 'put', 'patch', 'delete'];
const EXEMPT_PREFIXES = ['/health', '/metrics', '/internal', '/__cf', '/favicon'];

function extractRoutes(source: string) {
  const routes: { method: string; path: string }[] = [];
  for (const m of HTTP_METHODS) {
    const re = new RegExp(`\\.${m}\\s*\\(\\s*['"\`]([^'"\`]+)['"\`]`, 'g');
    let match: RegExpExecArray | null;
    while ((match = re.exec(source)) !== null)
      routes.push({ method: m.toUpperCase(), path: match[1]! });
  }
  return routes;
}

function extractOpenAPIPaths(yaml: string): Set<string> {
  const paths = new Set<string>();
  const re = /^\s{2}['"]?(\/[a-zA-Z0-9/_{}.-]+)['"]?\s*:/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(yaml)) !== null) paths.add(m[1]!);
  return paths;
}

function normalise(path: string) { return path.replace(/:([a-zA-Z_]+)/g, '{$1}'); }
function isExempt(path: string) { return EXEMPT_PREFIXES.some(p => path.startsWith(p)); }

describe('Governance: check-openapi-completeness (C2-5)', () => {
  it('extracts GET routes', () => {
    expect(extractRoutes("app.get('/v1/workspace', h)")).toEqual([{ method: 'GET', path: '/v1/workspace' }]);
  });
  it('extracts multiple methods', () => {
    expect(extractRoutes("app.get('/a',h)\napp.post('/b',h)\napp.delete('/c',h)")).toHaveLength(3);
  });
  it('.use() and .route() are not extracted', () => {
    expect(extractRoutes("app.use('/v1/a',mw)\napp.route('/v1/b',sub)")).toHaveLength(0);
  });

  it('/health is exempt', () => expect(isExempt('/health')).toBe(true));
  it('/health/deep is exempt', () => expect(isExempt('/health/deep')).toBe(true));
  it('/internal/sync is exempt', () => expect(isExempt('/internal/sync')).toBe(true));
  it('/v1/workspace is NOT exempt', () => expect(isExempt('/v1/workspace')).toBe(false));

  it('parses YAML paths correctly', () => {
    const yaml = `paths:\n  /v1/workspace:\n    get:\n  /v1/pos/transactions:\n    post:\n`;
    const paths = extractOpenAPIPaths(yaml);
    expect(paths.has('/v1/workspace')).toBe(true);
    expect(paths.has('/v1/pos/transactions')).toBe(true);
    expect(paths.has('get')).toBe(false);
  });

  it('normalises :id → {id}', () => {
    expect(normalise('/v1/workspace/:id')).toBe('/v1/workspace/{id}');
  });
  it('normalises :tenantId in middle segment', () => {
    expect(normalise('/v1/tenant/:tenantId/offerings')).toBe('/v1/tenant/{tenantId}/offerings');
  });

  it('detects undocumented route', () => {
    const routes = extractRoutes("app.post('/v1/new-feature', h)");
    const openApi = new Set(['/v1/workspace']);
    const missing = routes.filter(r => !openApi.has(normalise(r.path)));
    expect(missing).toHaveLength(1);
  });

  it('passes when route is documented', () => {
    const routes = extractRoutes("app.get('/v1/workspace', h)");
    const openApi = new Set(['/v1/workspace']);
    const missing = routes.filter(r => !openApi.has(normalise(r.path)));
    expect(missing).toHaveLength(0);
  });

  it('passes :param vs {param} (Hono ↔ OpenAPI normalisation)', () => {
    const routes = extractRoutes("app.get('/v1/workspace/:id', h)");
    const openApi = new Set(['/v1/workspace/{id}']);
    const missing = routes.filter(r => !openApi.has(normalise(r.path)) && !openApi.has(r.path));
    expect(missing).toHaveLength(0);
  });
});
