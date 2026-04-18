/**
 * apps/brand-runtime — Pillar 2: Branding / Website / Portal Worker
 * Framework: Hono (T1 — Cloudflare-first)
 *
 * Route map:
 *   GET  /                         → tenant-branded public home page
 *   GET  /about                    → about page
 *   GET  /services                 → services catalog
 *   GET  /contact                  → contact form
 *   POST /contact                  → contact form submission
 *   GET  /blog                     → blog listing (P4-A)
 *   GET  /blog/:slug               → blog post detail (P4-A)
 *   GET  /shop                     → product/offering listing (P4-A)
 *   GET  /shop/:productId          → product detail (P4-A)
 *   GET  /shop/cart                → shopping cart (P4-A)
 *   POST /shop/cart/add            → add to cart (P4-A)
 *   POST /shop/checkout            → Paystack payment init (P4-A)
 *   GET  /shop/checkout/callback   → Paystack verify (P4-A)
 *   GET  /sitemap.xml              → tenant sitemap (P4-A SEO-02)
 *   GET  /manifest.webmanifest     → dynamic PWA manifest (P4-A)
 *   GET  /portal/login             → tenant-branded login page
 *   POST /portal/login             → credential submission → API Worker → JWT cookie
 *   GET  /health                   → liveness probe (no auth)
 *
 * Tenant resolution priority (tenantResolve middleware):
 *   1. Custom domain match (custom_domain in tenant_branding)
 *   2. brand-{slug}.webwaka.ng subdomain
 *   3. /:slug route parameter
 *
 * PV-1.1 (scaffold) + PV-1.3 (white-label-theming wired)
 * Platform Invariants: P2 (Nigeria First), T3 (tenant isolation)
 */

import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import type { Env, Variables } from './env.js';
import { brandedPageRouter } from './routes/branded-page.js';
import { portalRouter } from './routes/portal.js';
import { blogRouter } from './routes/blog.js';
import { shopRouter } from './routes/shop.js';
import { sitemapRouter } from './routes/sitemap.js';
import { brandingEntitlementMiddleware } from './middleware/branding-entitlement.js';
import { whiteLabelDepthMiddleware } from './middleware/white-label-depth.js';
import { tenantResolve } from './middleware/tenant-resolve.js';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use('*', secureHeaders());

// ─── Liveness probe (no auth, no tenant resolution) ───────────────────────
app.get('/health', (c) => c.json({ ok: true, worker: 'brand-runtime' }));

// SEO-01: robots.txt for brand-runtime (tenant-branded sites)
app.get('/robots.txt', (c) => {
  return c.text(
    'User-agent: *\nAllow: /\nDisallow: /portal/\nDisallow: /health\n',
    200,
    { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=86400' },
  );
});

// ─── PWA service worker with Background Sync (PWA-002) ───────────────────
app.get('/sw.js', (c) => {
  const sw = `const CACHE='webwaka-brand-v2';
const SHELL=['/','/manifest.json'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    fetch(e.request)
      .then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(cache=>cache.put(e.request,c));}return r;})
      .catch(()=>caches.match(e.request).then(r=>r??new Response('Offline',{status:503,statusText:'Service Unavailable'})))
  );
});

self.addEventListener('sync',e=>{
  if(e.tag==='webwaka-sync'){e.waitUntil(processSyncQueue());}
});

async function processSyncQueue(){
  try{
    const db=await new Promise((res,rej)=>{const r=indexedDB.open('WebWakaOfflineDB',2);r.onerror=()=>rej(r.error);r.onsuccess=()=>res(r.result);});
    const tx=db.transaction('syncQueue','readonly');
    const items=await new Promise((res,rej)=>{const r=tx.objectStore('syncQueue').getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error);});
    const pending=items.filter(i=>i.status==='pending'||i.status==='failed').sort((a,b)=>a.createdAt-b.createdAt);
    for(const item of pending){
      try{
        const resp=await fetch('/api/sync/apply',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(item)});
        const newStatus=resp.ok||resp.status===409?'synced':'failed';
        const utx=db.transaction('syncQueue','readwrite');const s=utx.objectStore('syncQueue');
        const g=await new Promise((res,rej)=>{const r=s.get(item.id);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});
        if(g){g.status=newStatus;g.lastAttemptAt=Date.now();s.put(g);}
      }catch{}
    }
  }catch{}
}`;
  return c.text(sw, 200, { 'Content-Type': 'application/javascript', 'Cache-Control': 'public, max-age=3600' });
});

// ─── Tenant resolution (sets tenantSlug + tenantId for all subsequent routes)
app.use('/manifest.json', tenantResolve);
app.use('/portal/*', tenantResolve);
app.use('/*', tenantResolve);

// ─── PWA manifest (tenant-dynamic, after tenant resolution) ──────────────
app.get('/manifest.json', (c) => {
  const tenantName = c.get('tenantName') ?? 'WebWaka';
  const themeColor = c.get('themeColor') ?? '#1a6b3a';

  const manifest = {
    name: tenantName,
    short_name: tenantName.slice(0, 12),
    description: `${tenantName} — Powered by WebWaka`,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: themeColor,
    lang: 'en-NG',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  };

  return c.json(manifest, 200, { 'Content-Type': 'application/manifest+json', 'Cache-Control': 'public, max-age=3600' });
});

// ─── ENT-003: Branding entitlement check (after tenant resolution) ────────
app.use('/portal/*', brandingEntitlementMiddleware);
app.use('/*', brandingEntitlementMiddleware);

// ─── ENT-004: White-label depth cap (P5 — partner depth enforcement) ──────
// Runs after tenant resolution; sets whiteLabelDepth on context.
// Downstream handlers (shop, portal) read c.get('whiteLabelDepth') to cap
// which theme fields are applied per partner entitlement grant.
app.use('/portal/*', whiteLabelDepthMiddleware);
app.use('/*', whiteLabelDepthMiddleware);

// ─── Portal routes (branded auth shell) ───────────────────────────────────
app.route('/portal', portalRouter);

// ─── P4-A: Blog, shop, sitemap routes ─────────────────────────────────────
app.route('/blog', blogRouter);
app.route('/shop', shopRouter);
app.route('/', sitemapRouter);

// ─── Branded public home ─────────────────────────────────────────────────
app.route('/', brandedPageRouter);

// ─── Unmatched ─────────────────────────────────────────────────────────────
app.notFound((c) => c.text('Not found', 404));

app.onError((err, c) => {
  console.error('[brand-runtime] unhandled error', err);
  return c.text('Internal server error', 500);
});

export default app;
