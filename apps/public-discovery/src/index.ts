/**
 * apps/public-discovery — Pillar 3: Listing / Multi-Vendor Marketplace Worker
 * Framework: Hono (T1 — Cloudflare-first)
 *
 * Route map:
 *   GET  /health                              → liveness probe (no auth)
 *   GET  /discover                            → platform home — search + trending
 *   GET  /discover/in/:placeId                → geography-filtered entity listings
 *   GET  /discover/search?q=…&place=…         → full-text + location search
 *   GET  /discover/profile/:entityType/:id    → public entity profile page
 *
 * No authentication required — all routes are public.
 * T3: no tenant isolation — marketplace pages are cross-tenant by design.
 * P9: all prices are integer kobo; formatted at the template layer.
 *
 * PV-1.2 (scaffold)
 */

import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import type { Env } from './env.js';
import { listingsRouter } from './routes/listings.js';
import { profilesRouter } from './routes/profiles.js';

const app = new Hono<{ Bindings: Env }>();

app.use('*', secureHeaders());

// ─── Liveness probe ────────────────────────────────────────────────────────
app.get('/health', (c) => c.json({ ok: true, worker: 'public-discovery' }));

// SEO-01: robots.txt for public-facing discovery worker
app.get('/robots.txt', (c) => {
  return c.text(
    'User-agent: *\nAllow: /discover\nDisallow: /health\nSitemap: https://discover.webwaka.com/sitemap.xml\n',
    200,
    { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=86400' },
  );
});

// SEO-02: Dynamic sitemap XML — public organization listings only (no PII)
app.get('/sitemap.xml', async (c) => {
  const base = 'https://discover.webwaka.com';
  const now = new Date().toISOString().split('T')[0];

  const staticUrls = [
    `<url><loc>${base}/discover</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
  ];

  let orgUrls: string[] = [];
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT id, updated_at FROM organizations
       WHERE status = 'active' ORDER BY updated_at DESC LIMIT 5000`,
    ).all<{ id: string; updated_at: number }>();

    orgUrls = results.map((r) => {
      const lastmod = r.updated_at
        ? new Date(r.updated_at * 1000).toISOString().split('T')[0]
        : now;
      return `<url><loc>${base}/discover/profile/organization/${r.id}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`;
    });
  } catch {
    // D1 unavailable — return static sitemap only
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...orgUrls].join('\n')}
</urlset>`;

  return c.text(xml, 200, {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=86400',
  });
});

// ─── PWA assets (served from Worker) ──────────────────────────────────────
app.get('/manifest.json', (c) => {
  const manifest = {
    name: 'WebWaka Discover',
    short_name: 'Discover',
    description: "Nigeria's multi-vertical business directory and marketplace",
    start_url: '/discover',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1a6b3a',
    lang: 'en-NG',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  };
  return c.json(manifest, 200, { 'Content-Type': 'application/manifest+json', 'Cache-Control': 'public, max-age=3600' });
});

app.get('/sw.js', (c) => {
  const sw = `const CACHE='webwaka-discover-v2';
const SHELL=['/discover','/manifest.json'];

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
  const url=new URL(e.request.url);
  if(/\\/discover\\/profile\\//.test(url.pathname)){
    e.respondWith(
      caches.open(CACHE).then(async cache=>{
        const cached=await cache.match(e.request);
        const fetched=fetch(e.request).then(r=>{if(r.ok)cache.put(e.request,r.clone());return r;}).catch(()=>cached);
        return cached||fetched;
      })
    );
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(cache=>cache.put(e.request,c));}return r;})
      .catch(()=>caches.match(e.request))
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

// ─── Discovery routes ──────────────────────────────────────────────────────
app.route('/discover', listingsRouter);
app.route('/discover/profile', profilesRouter);

// ─── Root redirect ──────────────────────────────────────────────────────────
app.get('/', (c) => c.redirect('/discover'));

// ─── Fallback ──────────────────────────────────────────────────────────────
app.notFound((c) => c.text('Not found', 404));

app.onError((err, c) => {
  console.error('[public-discovery] unhandled error', err);
  return c.text('Internal server error', 500);
});

export default app;
