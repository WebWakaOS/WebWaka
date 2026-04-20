/**
 * WebWaka OS — Partner Admin Worker
 *
 * Production target: Cloudflare Workers (TDR-0002).
 * Framework: Hono (TDR-0003).
 * Pillar: 1 — Operations-Management
 *
 * This app serves as the partner-level admin interface where approved partners
 * can manage their branded instances, sub-partners, and entitlement usage.
 *
 * Route map:
 *   GET  /health         — liveness probe
 *   GET  /               — partner admin dashboard
 *   GET  /dashboard      — redirect to /
 *
 * M11 — Partner & White-Label
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
export const APP_NAME = 'partner-admin' as const;

interface Env {
  ENVIRONMENT?: string;
  ALLOWED_ORIGINS?: string;
}

const app = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// Global middleware
// ---------------------------------------------------------------------------

app.use('*', secureHeaders());

app.use('*', async (c, next) => {
  const envOrigins = c.env?.ALLOWED_ORIGINS;
  const isProd = c.env?.ENVIRONMENT === 'production';
  // SEC-08: Gate localhost origins behind environment check
  const devOrigins = isProd ? [] : ['http://localhost:5173'];
  const allowed: string[] = envOrigins
    ? envOrigins.split(',').map((o) => o.trim()).filter(Boolean)
    : [...devOrigins, 'https://admin.webwaka.com', 'https://partner.webwaka.com'];

  return cors({
    origin: (origin) => {
      if (allowed.includes(origin)) return origin;
      if (origin.startsWith('https://') && origin.endsWith('.webwaka.com')) return origin;
      return null;
    },
    allowHeaders: ['Authorization', 'Content-Type'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    maxAge: 86400,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  })(c, next);
});

// ---------------------------------------------------------------------------
// Health probe — /health
// ---------------------------------------------------------------------------

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    app: 'WebWaka OS Partner Admin',
    milestone: 11,
    timestamp: new Date().toISOString(),
    environment: c.env?.ENVIRONMENT ?? 'development',
  });
});

// ---------------------------------------------------------------------------
// Redirect /dashboard → /
// ---------------------------------------------------------------------------

app.get('/dashboard', (c) => {
  return c.redirect('/', 302);
});

// ---------------------------------------------------------------------------
// Partner Admin Dashboard — /
// Serves a PWA-ready dashboard shell for authenticated partners.
// Authentication is JWT-based — the SPA/React frontend handles token management.
// ---------------------------------------------------------------------------

// PERF-01: PWA manifest served with cache headers
app.get('/manifest.json', (c) => {
  const manifest = {
    name: 'WebWaka Partner Admin',
    short_name: 'Partner',
    description: 'WebWaka partner management portal',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0f1e',
    theme_color: '#006400',
    lang: 'en-NG',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  };
  return c.json(manifest, 200, {
    'Content-Type': 'application/manifest+json',
    'Cache-Control': 'public, max-age=86400',
  });
});

// PERF-01: Service worker served with cache headers
app.get('/sw.js', (c) => {
  const sw = `const CACHE='webwaka-partner-v1';const SHELL=['/','/manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(clients.claim());});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));});`;
  return c.text(sw, 200, {
    'Content-Type': 'application/javascript',
    'Cache-Control': 'public, max-age=3600',
  });
});

// ---------------------------------------------------------------------------
// Partner Admin Dashboard — /
// ---------------------------------------------------------------------------

app.get('/', (c) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#006400" />
  <title>WebWaka OS — Partner Admin</title>
  <link rel="manifest" href="/manifest.json" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --green: #00c851;
      --dark: #0a0f1e;
      --card: #111827;
      --border: #1f2937;
      --text: #e5e7eb;
      --muted: #6b7280;
      --blue: #3b82f6;
    }
    body {
      background: var(--dark);
      color: var(--text);
      font-family: 'Segoe UI', system-ui, sans-serif;
      min-height: 100vh;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 2rem;
      border-bottom: 1px solid var(--border);
      background: #0d1526;
    }
    .logo { display: flex; align-items: center; gap: 0.75rem; }
    .logo-mark {
      width: 36px; height: 36px;
      background: var(--blue);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-size: 1.1rem; color: #fff;
    }
    .logo-text { font-size: 1.15rem; font-weight: 700; letter-spacing: -0.5px; }
    .logo-text span { color: var(--blue); }
    .badge {
      font-size: 0.7rem;
      background: #1f2937;
      border: 1px solid var(--border);
      color: var(--muted);
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
    }
    .milestone-badge {
      font-size: 0.75rem;
      background: rgba(59,130,246,0.1);
      border: 1px solid rgba(59,130,246,0.3);
      color: var(--blue);
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
    }
    main { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .hero { text-align: center; padding: 3rem 1rem 2rem; }
    .hero h1 { font-size: 2.25rem; font-weight: 800; letter-spacing: -1px; margin-bottom: 0.75rem; }
    .hero h1 em { font-style: normal; color: var(--blue); }
    .hero p { color: var(--muted); font-size: 1rem; max-width: 560px; margin: 0 auto 2rem; line-height: 1.6; }
    .status-pill {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: var(--card); border: 1px solid var(--border);
      padding: 0.5rem 1.25rem; border-radius: 8px; font-size: 0.85rem; color: var(--muted);
    }
    .dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--blue);
      animation: pulse 2s infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
    .section-title {
      font-size: 0.75rem; font-weight: 600; letter-spacing: 1px;
      text-transform: uppercase; color: var(--muted); margin: 2.5rem 0 1rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.25rem; margin-top: 1rem;
    }
    .card {
      background: var(--card); border: 1px solid var(--border);
      border-radius: 12px; padding: 1.5rem;
      transition: border-color 0.2s;
    }
    .card:hover { border-color: rgba(59,130,246,0.4); }
    .card-icon { font-size: 1.5rem; margin-bottom: 0.75rem; }
    .card h3 { font-size: 1rem; font-weight: 600; margin-bottom: 0.4rem; }
    .card p { color: var(--muted); font-size: 0.85rem; line-height: 1.5; }
    .card .status {
      margin-top: 1rem; font-size: 0.75rem; padding: 0.2rem 0.6rem;
      border-radius: 999px; display: inline-block;
    }
    .status-active { background: rgba(59,130,246,0.1); color: var(--blue); border: 1px solid rgba(59,130,246,0.3); }
    .status-pending { background: #1f2937; color: var(--muted); }
    .api-note {
      background: var(--card); border: 1px solid var(--border);
      border-radius: 8px; padding: 1.25rem; margin-top: 1.5rem;
      font-size: 0.85rem; color: var(--muted); line-height: 1.7;
    }
    .api-note code {
      background: #0a0f1e; border: 1px solid var(--border);
      padding: 0.15rem 0.4rem; border-radius: 4px;
      color: var(--green); font-size: 0.8rem;
    }
    footer {
      text-align: center; padding: 2rem; color: var(--muted);
      font-size: 0.8rem; border-top: 1px solid var(--border); margin-top: 3rem;
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">
      <div class="logo-mark">P</div>
      <div class="logo-text">WebWaka <span>OS</span></div>
      <span class="badge">Partner Admin</span>
    </div>
    <div style="display:flex;align-items:center;gap:1rem">
      <span class="milestone-badge">Milestone 11 — Partner & White-Label</span>
      <div id="notifBell" style="position:relative;cursor:pointer" onclick="toggleNotifPanel()" title="Notifications">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span id="notifCount" style="display:none;position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;border-radius:50%;width:16px;height:16px;font-size:10px;font-weight:700;align-items:center;justify-content:center;line-height:1">0</span>
      </div>
    </div>
  </header>

  <div id="notifPanel" style="display:none;position:fixed;top:60px;right:1.5rem;z-index:1000;width:360px;background:#111827;border:1px solid #1f2937;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.5)">
    <div style="display:flex;align-items:center;justify-content:space-between;padding:0.875rem 1rem;border-bottom:1px solid #1f2937">
      <span style="font-weight:600;font-size:0.9rem">Partner Notifications</span>
      <div style="display:flex;gap:0.5rem">
        <button onclick="markAllRead()" style="background:none;border:1px solid #1f2937;color:#9ca3af;font-size:0.75rem;cursor:pointer;padding:0.2rem 0.5rem;border-radius:4px">Mark all read</button>
        <button onclick="toggleNotifPanel()" style="background:none;border:none;color:#9ca3af;cursor:pointer;font-size:1.1rem;line-height:1">×</button>
      </div>
    </div>
    <div id="notifList" style="max-height:380px;overflow-y:auto;padding:0.5rem">
      <div style="color:#6b7280;font-size:0.85rem;padding:1rem;text-align:center">Loading…</div>
    </div>
    <div style="padding:0.75rem 1rem;border-top:1px solid #1f2937;text-align:center">
      <button onclick="loadNotifications()" style="background:none;border:none;color:#3b82f6;font-size:0.8rem;cursor:pointer">Refresh</button>
    </div>
  </div>

  <main>
    <div class="hero">
      <h1>Partner <em>Management Portal</em></h1>
      <p>Manage your branded instance, sub-partners, entitlements, and white-label configuration.</p>
      <div class="status-pill">
        <span class="dot"></span>
        <span>M11 complete — Partner registration, delegation, and entitlement controls live</span>
      </div>
    </div>

    <p class="section-title">Partner Capabilities</p>
    <div class="grid">
      <div class="card">
        <div class="card-icon">🏢</div>
        <h3>Partner Registration</h3>
        <p>Register and manage partner organizations. Set contact email, workspace links, and sub-partner limits.</p>
        <span class="status status-active">Live — M11</span>
      </div>
      <div class="card">
        <div class="card-icon">🔗</div>
        <h3>Sub-Partner Delegation</h3>
        <p>Create and manage sub-partners under your partner organization. Delegation is entitlement-controlled.</p>
        <span class="status status-active">Live — M11</span>
      </div>
      <div class="card">
        <div class="card-icon">🎨</div>
        <h3>White-Label Depth</h3>
        <p>Control how deeply your brand is applied across sub-partner experiences. Depth 0–2 per policy.</p>
        <span class="status status-active">Live — M11</span>
      </div>
      <div class="card">
        <div class="card-icon">🛡️</div>
        <h3>Entitlement Grants</h3>
        <p>Platform-granted entitlements: white_label_depth, delegation_rights, AI access, visibility, and more.</p>
        <span class="status status-active">Live — M11</span>
      </div>
      <div class="card">
        <div class="card-icon">📊</div>
        <h3>Partner Audit Log</h3>
        <p>Every registration, status change, sub-partner creation, and entitlement grant is logged and auditable.</p>
        <span class="status status-active">Live — M11</span>
      </div>
      <div class="card">
        <div class="card-icon">⚡</div>
        <h3>AI Integration</h3>
        <p>Partner-level AI access control (none / basic / advanced / BYOK) via entitlement grants.</p>
        <span class="status status-pending">M12 — AI Production</span>
      </div>
    </div>

    <p class="section-title">API Endpoints</p>
    <div class="api-note">
      <strong>Partner Management API</strong> — All endpoints require <code>super_admin</code> JWT role.<br/><br/>
      <code>GET  /partners</code> — List all registered partners<br/>
      <code>POST /partners</code> — Register a new partner<br/>
      <code>GET  /partners/:id</code> — Get partner detail<br/>
      <code>PATCH /partners/:id/status</code> — Update partner status<br/>
      <code>GET  /partners/:id/sub-partners</code> — List sub-partners<br/>
      <code>POST /partners/:id/sub-partners</code> — Create sub-partner<br/>
      <code>PATCH /partners/:id/sub-partners/:subId/status</code> — Update sub-partner status<br/>
      <code>GET  /partners/:id/entitlements</code> — View entitlement grants<br/>
      <code>POST /partners/:id/entitlements</code> — Grant entitlement dimension<br/>
      <code>GET  /partners/:id/credits</code> — WakaCU credit pool balance <span style="color:var(--green)">NEW P5</span><br/>
      <code>POST /partners/:id/credits/allocate</code> — Allocate credits to sub-tenant <span style="color:var(--green)">NEW P5</span><br/>
      <code>GET  /partners/:id/credits/history</code> — Allocation history <span style="color:var(--green)">NEW P5</span><br/>
      <code>POST /partners/:id/settlements/calculate</code> — Calculate revenue share <span style="color:var(--green)">NEW P5</span><br/>
      <code>GET  /partners/:id/settlements</code> — List settlements <span style="color:var(--green)">NEW P5</span>
    </div>

    <p class="section-title">Live Dashboard</p>
    <div class="api-note" style="margin-bottom:1rem">
      Enter a Partner ID and API base URL to load live data:
    </div>
    <div style="display:flex;gap:0.75rem;align-items:flex-start;flex-wrap:wrap;margin-bottom:1.5rem">
      <input id="apiBase" type="text" value="https://api.webwaka.com"
        placeholder="API base URL"
        style="background:#0a0f1e;border:1px solid var(--border);color:var(--text);padding:0.6rem 0.8rem;border-radius:6px;font-size:0.85rem;flex:1;min-width:220px" />
      <input id="partnerId" type="text" placeholder="Partner ID (e.g. prt_…)"
        style="background:#0a0f1e;border:1px solid var(--border);color:var(--text);padding:0.6rem 0.8rem;border-radius:6px;font-size:0.85rem;flex:1;min-width:200px" />
      <input id="jwtToken" type="password" placeholder="super_admin JWT"
        style="background:#0a0f1e;border:1px solid var(--border);color:var(--text);padding:0.6rem 0.8rem;border-radius:6px;font-size:0.85rem;flex:1;min-width:200px" />
      <button onclick="loadDashboard()"
        style="background:var(--blue);color:#fff;border:none;padding:0.6rem 1.25rem;border-radius:6px;font-size:0.85rem;cursor:pointer;font-weight:600">
        Load
      </button>
    </div>

    <div id="creditsPanel" style="display:none">
      <p class="section-title">WakaCU Credit Pool</p>
      <div id="creditsData" class="api-note"></div>

      <p class="section-title" style="margin-top:1.5rem">Allocate Credits</p>
      <div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-bottom:1rem">
        <input id="allocTenant" type="text" placeholder="Recipient tenant ID"
          style="background:#0a0f1e;border:1px solid var(--border);color:var(--text);padding:0.6rem 0.8rem;border-radius:6px;font-size:0.85rem;flex:1;min-width:200px" />
        <input id="allocAmount" type="number" placeholder="Amount (WC units)"
          style="background:#0a0f1e;border:1px solid var(--border);color:var(--text);padding:0.6rem 0.8rem;border-radius:6px;font-size:0.85rem;width:160px" />
        <input id="allocNote" type="text" placeholder="Note (optional)"
          style="background:#0a0f1e;border:1px solid var(--border);color:var(--text);padding:0.6rem 0.8rem;border-radius:6px;font-size:0.85rem;flex:1;min-width:180px" />
        <button onclick="allocateCredits()"
          style="background:#1a6b3a;color:#fff;border:none;padding:0.6rem 1.25rem;border-radius:6px;font-size:0.85rem;cursor:pointer;font-weight:600">
          Allocate
        </button>
      </div>
      <div id="allocResult" class="api-note" style="display:none"></div>
    </div>

    <div id="settlementsPanel" style="display:none">
      <p class="section-title">Settlements</p>
      <div id="settlementsData" class="api-note"></div>
    </div>

    <div id="subPartnersPanel" style="display:none">
      <p class="section-title">Sub-Partners</p>
      <div id="subPartnersData" class="api-note"></div>
    </div>

  </main>

  <footer>
    WebWaka OS &mdash; Partner Admin &mdash; Milestone 11 — Phase 3 &mdash; 2026-04-13
  </footer>

  <script>
    // N-091a: Notification Bell — polls GET /notifications/inbox?category=partner every 30s
    let _notifPanelOpen = false;
    let _notifPollInterval = null;

    function toggleNotifPanel() {
      _notifPanelOpen = !_notifPanelOpen;
      document.getElementById('notifPanel').style.display = _notifPanelOpen ? 'block' : 'none';
      if (_notifPanelOpen) loadNotifications();
    }

    async function loadNotifications() {
      if (!_jwt) return;
      const el = document.getElementById('notifList');
      try {
        const r = await fetch(_base + '/notifications/inbox?category=partner&limit=20', {
          headers: { 'Authorization': 'Bearer ' + _jwt }
        });
        if (!r.ok) {
          el.innerHTML = '<div style="color:#6b7280;font-size:0.85rem;padding:1rem;text-align:center">Could not load notifications.</div>';
          return;
        }
        const d = await r.json();
        const items = d.items || d.notifications || [];
        const unreadCount = items.filter(function(n) { return !n.read_at; }).length;
        updateNotifBadge(unreadCount);
        if (items.length === 0) {
          el.innerHTML = '<div style="color:#6b7280;font-size:0.85rem;padding:1.5rem;text-align:center">No partner notifications yet.</div>';
          return;
        }
        el.innerHTML = items.map(function(n) {
          const ts = n.created_at ? new Date(n.created_at * 1000).toLocaleString('en-NG') : '';
          const unread = !n.read_at;
          return '<div style="padding:0.75rem;border-bottom:1px solid #1f2937;' + (unread ? 'background:rgba(59,130,246,0.05)' : '') + '">' +
            '<div style="display:flex;gap:0.5rem">' +
            (unread ? '<div style="width:6px;height:6px;border-radius:50%;background:#3b82f6;margin-top:5px;flex-shrink:0"></div>' : '<div style="width:6px;flex-shrink:0"></div>') +
            '<div><div style="font-size:0.85rem;font-weight:' + (unread ? '600' : '400') + '">' + (n.title || n.event_key || 'Notification') + '</div>' +
            '<div style="font-size:0.75rem;color:#6b7280">' + ts + '</div></div></div></div>';
        }).join('');
      } catch(e) {
        el.innerHTML = '<div style="color:#6b7280;font-size:0.85rem;padding:1rem;text-align:center">Request failed.</div>';
      }
    }

    function updateNotifBadge(count) {
      const el = document.getElementById('notifCount');
      if (!el) return;
      if (count > 0) {
        el.style.display = 'flex';
        el.textContent = count > 99 ? '99+' : String(count);
      } else { el.style.display = 'none'; }
    }

    async function markAllRead() {
      if (!_jwt) return;
      try {
        await fetch(_base + '/notifications/inbox/read-all?category=partner', {
          method: 'POST', headers: { 'Authorization': 'Bearer ' + _jwt }
        });
        updateNotifBadge(0);
        await loadNotifications();
      } catch(e) {}
    }

    function startNotifPolling() {
      if (_notifPollInterval) clearInterval(_notifPollInterval);
      loadNotifications();
      _notifPollInterval = setInterval(loadNotifications, 30000);
    }

    let _base = '', _pid = '', _jwt = ''; = '', _pid = '', _jwt = '';

    function authHeaders() {
      return { 'Authorization': 'Bearer ' + _jwt, 'Content-Type': 'application/json' };
    }

    async function loadDashboard() {
      _base = document.getElementById('apiBase').value.replace(/\\/+$/, '');
      _pid  = document.getElementById('partnerId').value.trim();
      _jwt  = document.getElementById('jwtToken').value.trim();

      if (!_pid || !_jwt) {
        alert('Partner ID and JWT are required');
        return;
      }

      document.getElementById('creditsPanel').style.display = 'block';
      document.getElementById('settlementsPanel').style.display = 'block';
      document.getElementById('subPartnersPanel').style.display = 'block';

      await Promise.all([loadCredits(), loadSettlements(), loadSubPartners()]);
      startNotifPolling();
    }

    async function loadCredits() {
      const el = document.getElementById('creditsData');
      el.textContent = 'Loading…';
      try {
        const r = await fetch(_base + '/partners/' + _pid + '/credits', { headers: authHeaders() });
        const d = await r.json();
        if (!r.ok) { el.innerHTML = '<span style="color:#ef4444">Error: ' + (d.error || r.status) + '</span>'; return; }
        const w = d.wallet || {};
        el.innerHTML =
          '<strong>Balance:</strong> ' + (w.balanceWc ?? '—') + ' WC &nbsp;|&nbsp; ' +
          '<strong>Lifetime Purchased:</strong> ' + (w.lifetimePurchasedWc ?? '—') + ' WC &nbsp;|&nbsp; ' +
          '<strong>Total Allocated to Sub-Tenants:</strong> ' + (d.totalAllocatedWc ?? '—') + ' WC';
      } catch (e) {
        el.innerHTML = '<span style="color:#ef4444">Request failed: ' + e.message + '</span>';
      }
    }

    async function allocateCredits() {
      const tenant = document.getElementById('allocTenant').value.trim();
      const amount = parseInt(document.getElementById('allocAmount').value, 10);
      const note   = document.getElementById('allocNote').value.trim();
      const el = document.getElementById('allocResult');
      el.style.display = 'block';
      el.textContent = 'Allocating…';
      try {
        const r = await fetch(_base + '/partners/' + _pid + '/credits/allocate', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ recipientTenant: tenant, amountWc: amount, note: note || undefined }),
        });
        const d = await r.json();
        if (!r.ok) { el.innerHTML = '<span style="color:#ef4444">Error: ' + (d.error || r.status) + '</span>'; return; }
        el.innerHTML = '<span style="color:var(--green)">Allocated ' + d.amountWc + ' WC to ' + d.recipientTenant + '. Partner balance after: ' + d.partnerBalanceAfter + ' WC</span>';
        await loadCredits();
      } catch (e) {
        el.innerHTML = '<span style="color:#ef4444">Request failed: ' + e.message + '</span>';
      }
    }

    async function loadSettlements() {
      const el = document.getElementById('settlementsData');
      el.textContent = 'Loading…';
      try {
        const r = await fetch(_base + '/partners/' + _pid + '/settlements', { headers: authHeaders() });
        const d = await r.json();
        if (!r.ok) { el.innerHTML = '<span style="color:#ef4444">Error: ' + (d.error || r.status) + '</span>'; return; }
        const rows = d.settlements || [];
        if (rows.length === 0) { el.textContent = 'No settlements recorded yet.'; return; }
        el.innerHTML = rows.map(s =>
          '<div style="margin-bottom:0.75rem;padding-bottom:0.75rem;border-bottom:1px solid var(--border)">' +
          '<strong>' + s.period_start + ' → ' + s.period_end + '</strong> &nbsp; ' +
          'GMV: ₦' + (s.gross_gmv_kobo / 100).toLocaleString() + ' &nbsp;|&nbsp; ' +
          'Partner share: ₦' + (s.partner_share_kobo / 100).toLocaleString() + ' (' + (s.share_basis_points / 100).toFixed(2) + '%) &nbsp;|&nbsp; ' +
          '<span class="status status-' + (s.status === 'paid' ? 'active' : 'pending') + '">' + s.status + '</span>' +
          '</div>'
        ).join('');
      } catch (e) {
        el.innerHTML = '<span style="color:#ef4444">Request failed: ' + e.message + '</span>';
      }
    }

    async function loadSubPartners() {
      const el = document.getElementById('subPartnersData');
      el.textContent = 'Loading…';
      try {
        const r = await fetch(_base + '/partners/' + _pid + '/sub-partners', { headers: authHeaders() });
        const d = await r.json();
        if (!r.ok) { el.innerHTML = '<span style="color:#ef4444">Error: ' + (d.error || r.status) + '</span>'; return; }
        const rows = d.subPartners || [];
        if (rows.length === 0) { el.textContent = 'No sub-partners registered yet.'; return; }
        el.innerHTML = rows.map(s =>
          '<div style="margin-bottom:0.5rem">' +
          '<strong>' + s.id + '</strong> — Tenant: ' + s.tenant_id + ' — Status: ' + s.status +
          '</div>'
        ).join('');
      } catch (e) {
        el.innerHTML = '<span style="color:#ef4444">Request failed: ' + e.message + '</span>';
      }
    }
  </script>
</body>
</html>`;

  return c.html(html);
});

export default app;
