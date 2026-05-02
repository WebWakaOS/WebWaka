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
  DB?: {
    prepare(sql: string): {
      bind(...args: unknown[]): {
        first<T>(): Promise<T | null>;
        run(): Promise<{ success: boolean }>;
        all<T>(): Promise<{ results: T[] }>;
      };
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
  JWT_SECRET?: string;
}

const app = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// Global middleware
// ---------------------------------------------------------------------------

app.use('*', secureHeaders());
// H-7: Request-ID propagation for distributed tracing
app.use('*', async (c, next) => {
  const requestId = c.req.header('X-Request-ID') || crypto.randomUUID();
  c.header('X-Request-ID', requestId);
  await next();
});

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
      --blue: #0F4C81;
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
      background: #0F4C81;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-size: 1.1rem; color: #fff;
    }
    .logo-text { font-size: 1.15rem; font-weight: 700; letter-spacing: -0.5px; }
    .logo-text span { color: #0F4C81; }
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
      color: #0F4C81;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
    }
    main { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .hero { text-align: center; padding: 3rem 1rem 2rem; }
    .hero h1 { font-size: 2.25rem; font-weight: 800; letter-spacing: -1px; margin-bottom: 0.75rem; }
    .hero h1 em { font-style: normal; color: #0F4C81; }
    .hero p { color: var(--muted); font-size: 1rem; max-width: 560px; margin: 0 auto 2rem; line-height: 1.6; }
    .status-pill {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: var(--card); border: 1px solid var(--border);
      padding: 0.5rem 1.25rem; border-radius: 8px; font-size: 0.85rem; color: var(--muted);
    }
    .dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #0F4C81;
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
    .status-active { background: rgba(59,130,246,0.1); color: #0F4C81; border: 1px solid rgba(59,130,246,0.3); }
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
      <button onclick="loadNotifications()" style="background:none;border:none;color:#0F4C81;font-size:0.8rem;cursor:pointer">Refresh</button>
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

    <!-- BUG-030: Section anchor navigation with aria-current="location" for the active section -->
    <nav aria-label="Page sections" id="section-nav" style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.5rem;padding:0.75rem 0;border-bottom:1px solid var(--border)">
      <a href="#section-capabilities" id="nav-capabilities" style="color:var(--muted);text-decoration:none;font-size:0.82rem;padding:0.3rem 0.75rem;border-radius:999px;border:1px solid transparent;transition:all 0.15s">Capabilities</a>
      <a href="#section-api"          id="nav-api"          style="color:var(--muted);text-decoration:none;font-size:0.82rem;padding:0.3rem 0.75rem;border-radius:999px;border:1px solid transparent;transition:all 0.15s">API Endpoints</a>
      <a href="#section-dashboard"    id="nav-dashboard"    style="color:var(--muted);text-decoration:none;font-size:0.82rem;padding:0.3rem 0.75rem;border-radius:999px;border:1px solid transparent;transition:all 0.15s">Live Dashboard</a>
    </nav>

    <p class="section-title" id="section-capabilities">Partner Capabilities</p>
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

    <p class="section-title" id="section-api">API Endpoints</p>
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

    <p class="section-title" id="section-dashboard">Live Dashboard</p>
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
        style="background:#0F4C81;color:#fff;border:none;padding:0.6rem 1.25rem;border-radius:6px;font-size:0.85rem;cursor:pointer;font-weight:600">
        Load
      </button>
    </div>

    <!-- E1-2: Partner Overview KPIs -->
    <div id="overviewPanel" style="display:none;margin-bottom:1.5rem">
      <p class="section-title">Partner Overview</p>
      <div id="overviewKpis" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:0.75rem;margin-bottom:1rem"></div>
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
      <div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-bottom:0.875rem;align-items:center">
        <input id="subSearch" type="search" placeholder="Search sub-partners..."
          oninput="filterSubPartners()"
          style="padding:0.5rem 0.875rem;border:1px solid var(--border);background:#0a0f1e;color:var(--text);border-radius:6px;font-size:0.8125rem;width:220px" />
        <button onclick="showCreateSubPartner()"
          style="padding:0.5rem 1rem;background:#0F4C81;color:#fff;border:none;border-radius:6px;font-size:0.8125rem;cursor:pointer;font-weight:600">
          + New Sub-Partner
        </button>
      </div>
      <div id="createSubForm" style="display:none;margin-bottom:1rem;padding:1rem;background:#0a0f1e;border:1px solid var(--border);border-radius:8px;max-width:480px">
        <p style="font-weight:600;margin-bottom:0.75rem">Create Sub-Partner</p>
        <input id="newSubTenantId" type="text" placeholder="Tenant ID"
          style="display:block;width:100%;margin-bottom:0.5rem;padding:0.5rem 0.75rem;border:1px solid var(--border);background:#111827;color:var(--text);border-radius:6px;font-size:0.8125rem" />
        <input id="newSubName" type="text" placeholder="Display name (optional)"
          style="display:block;width:100%;margin-bottom:0.75rem;padding:0.5rem 0.75rem;border:1px solid var(--border);background:#111827;color:var(--text);border-radius:6px;font-size:0.8125rem" />
        <div style="display:flex;gap:0.5rem">
          <button onclick="submitCreateSubPartner()"
            style="padding:0.5rem 1rem;background:#1a6b3a;color:#fff;border:none;border-radius:6px;font-size:0.8125rem;cursor:pointer;font-weight:600">
            Create
          </button>
          <button onclick="document.getElementById('createSubForm').style.display='none'"
            style="padding:0.5rem 1rem;background:transparent;color:var(--muted);border:1px solid var(--border);border-radius:6px;font-size:0.8125rem;cursor:pointer">
            Cancel
          </button>
        </div>
        <div id="createSubStatus" style="font-size:0.8rem;margin-top:0.5rem;min-height:1rem;color:var(--green)"></div>
      </div>
      <div id="subPartnersData" class="api-note"></div>
    </div>


    <!-- ─── E1-4: White-Label Branding Controls ─────────────────────────── -->
    <div id="brandingPanel" style="display:none;margin-top:1.5rem">
      <p class="section-title">White-Label Branding</p>
      <p style="color:var(--muted);font-size:0.875rem;margin-bottom:1rem">Customise your partner instance: logo, primary colour, and custom domain.</p>
      <form id="brandingForm" onsubmit="saveBranding(event)" style="display:flex;flex-direction:column;gap:0.875rem;max-width:480px">
        <label style="font-size:0.8125rem;font-weight:600;color:var(--text)">
          Logo URL
          <input id="brandLogoUrl" type="url" placeholder="https://cdn.example.com/logo.png"
            style="margin-top:4px;display:block;width:100%;background:#0a0f1e;border:1px solid var(--border);color:var(--text);padding:0.6rem 0.8rem;border-radius:6px;font-size:0.85rem" />
        </label>
        <label style="font-size:0.8125rem;font-weight:600;color:var(--text)">
          Primary Colour
          <div style="display:flex;gap:0.5rem;align-items:center;margin-top:4px">
            <input id="brandColorPicker" type="color" value="#0F4C81" onchange="document.getElementById('brandColorHex').value=this.value"
              style="height:38px;width:48px;border:none;background:none;cursor:pointer;padding:0" />
            <input id="brandColorHex" type="text" value="#0F4C81" placeholder="#0F4C81" maxlength="7"
              oninput="if(this.value.match(/^#[0-9a-fA-F]{6}$/))document.getElementById('brandColorPicker').value=this.value"
              style="flex:1;background:#0a0f1e;border:1px solid var(--border);color:var(--text);padding:0.6rem 0.8rem;border-radius:6px;font-size:0.85rem" />
          </div>
        </label>
        <label style="font-size:0.8125rem;font-weight:600;color:var(--text)">
          Custom Domain <span style="font-weight:400;color:var(--muted)">(optional)</span>
          <input id="brandDomain" type="text" placeholder="admin.yourcompany.com"
            style="margin-top:4px;display:block;width:100%;background:#0a0f1e;border:1px solid var(--border);color:var(--text);padding:0.6rem 0.8rem;border-radius:6px;font-size:0.85rem" />
        </label>
        <label style="font-size:0.8125rem;font-weight:600;color:var(--text)">
          Support Email <span style="font-weight:400;color:var(--muted)">(shown on sub-tenant dashboards)</span>
          <input id="brandSupportEmail" type="email" placeholder="support@yourcompany.com"
            style="margin-top:4px;display:block;width:100%;background:#0a0f1e;border:1px solid var(--border);color:var(--text);padding:0.6rem 0.8rem;border-radius:6px;font-size:0.85rem" />
        </label>
        <div style="display:flex;gap:0.75rem;margin-top:0.25rem">
          <button type="submit"
            style="background:#0F4C81;color:#fff;border:none;padding:0.6rem 1.5rem;border-radius:6px;font-size:0.875rem;cursor:pointer;font-weight:600">
            Save Branding
          </button>
          <button type="button" onclick="loadBranding()"
            style="background:transparent;color:var(--muted);border:1px solid var(--border);padding:0.6rem 1.25rem;border-radius:6px;font-size:0.875rem;cursor:pointer">
            Reload
          </button>
        </div>
        <div id="brandingStatus" style="font-size:0.8125rem;min-height:1.2rem;color:var(--green)"></div>
      </form>
    </div>

    <!-- ─── E1-7: Onboarding Wizard ───────────────────────────────────────── -->
    <div id="onboardingWizard" style="display:none;margin-top:1.5rem">
      <p class="section-title">Partner Onboarding</p>
      <p style="color:var(--muted);font-size:0.875rem;margin-bottom:1.25rem">Complete these steps to finish setting up your partner account.</p>
      <div id="onboardingSteps" style="display:flex;flex-direction:column;gap:0.75rem;max-width:520px">
        <!-- Steps injected by JS -->
      </div>
      <div style="margin-top:1rem;display:flex;gap:0.75rem">
        <button id="onboardPrevBtn" onclick="onboardNav(-1)" style="display:none;background:transparent;color:var(--muted);border:1px solid var(--border);padding:0.5rem 1.25rem;border-radius:6px;font-size:0.875rem;cursor:pointer">&larr; Back</button>
        <button id="onboardNextBtn" onclick="onboardNav(1)" style="background:#0F4C81;color:#fff;border:none;padding:0.5rem 1.5rem;border-radius:6px;font-size:0.875rem;cursor:pointer;font-weight:600">Next &rarr;</button>
      </div>
    </div>

  </main>

  <footer>
    WebWaka OS &mdash; Partner Admin &mdash; Milestone 11 &mdash; Phase 3 &mdash; 2026-04-13
  </footer>

  <script>
    // BUG-030: Section nav aria-current — IntersectionObserver marks the
    // nav link whose target section is currently closest to the top of the viewport.
    (function initSectionNav() {
      var navMap = {
        'section-capabilities': 'nav-capabilities',
        'section-api': 'nav-api',
        'section-dashboard': 'nav-dashboard'
      };
      var activeStyle = 'color:#0F4C81;border-color:#0F4C81;background:rgba(59,130,246,0.08)';
      var inactiveStyle = 'color:var(--muted);border-color:transparent;background:transparent';

      function setActive(sectionId) {
        Object.keys(navMap).forEach(function(id) {
          var link = document.getElementById(navMap[id]);
          if (!link) return;
          if (id === sectionId) {
            link.style.cssText += ';' + activeStyle;
            link.setAttribute('aria-current', 'location');
          } else {
            link.style.cssText = link.style.cssText.replace(activeStyle, '');
            link.removeAttribute('aria-current');
            link.style.color = '#6b7280';
            link.style.borderColor = 'transparent';
            link.style.background = 'transparent';
          }
        });
      }

      if (!('IntersectionObserver' in window)) { setActive('section-capabilities'); return; }

      var latestVisible = null;
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) { if (e.isIntersecting) latestVisible = e.target.id; });
        if (latestVisible) setActive(latestVisible);
      }, { rootMargin: '0px 0px -60% 0px', threshold: 0 });

      Object.keys(navMap).forEach(function(id) {
        var el = document.getElementById(id);
        if (el) observer.observe(el);
      });

      setActive('section-capabilities');
    })();

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
            (unread ? '<div style="width:6px;height:6px;border-radius:50%;background:#0F4C81;margin-top:5px;flex-shrink:0"></div>' : '<div style="width:6px;flex-shrink:0"></div>') +
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

    let _base = '', _pid = '', _jwt = '';

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

      await Promise.all([loadOverview(), loadCredits(), loadSettlements(), loadSubPartners()]);
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

    // ─── E1-2: Partner Overview Dashboard ───────────────────────────────────
    async function loadOverview() {
      var el = document.getElementById('overviewKpis');
      if (!el) return;
      el.innerHTML = '<span style="color:var(--muted);font-size:0.875rem">Loading...</span>';
      try {
        var results = await Promise.allSettled([
          fetch(_base + '/api/usage', { headers: authHeaders() }),
          fetch(_base + '/partners/' + _pid + '/sub-partners', { headers: authHeaders() }),
          fetch(_base + '/partners/' + _pid + '/credits', { headers: authHeaders() }),
        ]);
        var usage = {};
        var subD  = {};
        var credD = {};
        if (results[0].status === 'fulfilled' && results[0].value.ok) usage = await results[0].value.json();
        if (results[1].status === 'fulfilled' && results[1].value.ok) subD  = await results[1].value.json();
        if (results[2].status === 'fulfilled' && results[2].value.ok) credD = await results[2].value.json();
        var kpis = [
          { label: 'Sub-Tenants',    value: (subD.subPartners || []).length },
          { label: 'Active Groups',  value: usage.activeGroups != null ? usage.activeGroups : '-' },
          { label: 'Total Members',  value: usage.totalMembers != null ? usage.totalMembers : '-' },
          { label: 'Credit Balance', value: (credD.wallet && credD.wallet.balanceWc != null) ? credD.wallet.balanceWc + ' WC' : '-' },
        ];
        el.innerHTML = kpis.map(function(k) {
          return '<div style="background:#0a0f1e;border:1px solid var(--border);border-radius:10px;padding:1rem;text-align:center">' +
            '<div style="font-size:1.375rem;font-weight:800;color:var(--text)">' + k.value + '</div>' +
            '<div style="font-size:0.75rem;color:var(--muted);margin-top:2px">' + k.label + '</div>' +
            '</div>';
        }).join('');
      } catch (e) {
        el.innerHTML = '<span style="color:#ef4444;font-size:0.875rem">Failed to load overview</span>';
      }
    }

    // ─── E1-4: Branding Controls ─────────────────────────────────────────
    async function loadBranding() {
      if (!_base || !_pid) return;
      try {
        const r = await fetch(_base + '/partners/' + _pid + '/branding', { headers: authHeaders() });
        if (!r.ok) return;
        const d = await r.json();
        if (d.logo_url)       document.getElementById('brandLogoUrl').value       = d.logo_url;
        if (d.primary_color)  { document.getElementById('brandColorHex').value    = d.primary_color; document.getElementById('brandColorPicker').value = d.primary_color; }
        if (d.custom_domain)  document.getElementById('brandDomain').value        = d.custom_domain;
        if (d.support_email)  document.getElementById('brandSupportEmail').value  = d.support_email;
      } catch {}
    }

    async function saveBranding(e) {
      e.preventDefault();
      const statusEl = document.getElementById('brandingStatus');
      statusEl.textContent = 'Saving…';
      try {
        const body = {
          logo_url:      document.getElementById('brandLogoUrl').value.trim() || null,
          primary_color: document.getElementById('brandColorHex').value.trim() || '#0F4C81',
          custom_domain: document.getElementById('brandDomain').value.trim() || null,
          support_email: document.getElementById('brandSupportEmail').value.trim() || null,
        };
        const r = await fetch(_base + '/partners/' + _pid + '/branding', {
          method: 'PATCH', headers: { ...authHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (r.ok) { statusEl.textContent = '✓ Branding saved'; setTimeout(() => { statusEl.textContent = ''; }, 3000); }
        else { statusEl.style.color = '#ef4444'; statusEl.textContent = 'Save failed (' + r.status + ')'; }
      } catch (err) { statusEl.style.color = '#ef4444'; statusEl.textContent = 'Network error'; }
    }

    // ─── E1-7: Onboarding Wizard ─────────────────────────────────────────
    const ONBOARD_STEPS = [
      { id: 'profile',   title: 'Set Up Your Profile',    desc: 'Add your organisation name, logo URL, and support email in the Branding tab.' },
      { id: 'branding',  title: 'Customise Branding',     desc: 'Set your primary colour and optional custom domain so sub-tenants see your brand.' },
      { id: 'sub',       title: 'Invite Sub-Partners',    desc: 'Use the Sub-Partners panel to create your first white-label tenant.' },
      { id: 'credits',   title: 'Load WakaCU Credits',    desc: 'Purchase and allocate credits to sub-tenants via the Credits panel.' },
      { id: 'done',      title: 'All Done! 🎉',           desc: 'Your partner account is ready. Explore the dashboard and grow your network.' },
    ];
    let _onboardStep = 0;

    function renderOnboardingSteps() {
      const container = document.getElementById('onboardingSteps');
      container.innerHTML = ONBOARD_STEPS.map((s, i) => {
        const isActive  = i === _onboardStep;
        const isDone    = i < _onboardStep;
        return '<div style="display:flex;gap:0.875rem;align-items:flex-start;padding:0.875rem 1rem;border-radius:8px;border:1.5px solid ' +
          (isActive ? '#0F4C81' : (isDone ? '#1a6b3a33' : 'var(--border)')) +
          ';background:' + (isActive ? '#0F4C8115' : (isDone ? '#1a6b3a0a' : '#0a0f1e')) + '">' +
          '<span style="font-size:1.25rem;min-width:28px">' + (isDone ? '✅' : (isActive ? '▶️' : '⬜')) + '</span>' +
          '<div><strong style="font-size:0.9375rem;color:' + (isActive ? 'var(--text)' : 'var(--muted)') + '">' + s.title + '</strong>' +
          '<p style="font-size:0.8125rem;color:var(--muted);margin-top:2px">' + s.desc + '</p></div></div>';
      }).join('');
      document.getElementById('onboardPrevBtn').style.display = _onboardStep > 0 ? 'inline-block' : 'none';
      const nextBtn = document.getElementById('onboardNextBtn');
      if (_onboardStep >= ONBOARD_STEPS.length - 1) { nextBtn.textContent = 'Finish'; nextBtn.onclick = () => { document.getElementById('onboardingWizard').style.display = 'none'; }; }
      else { nextBtn.textContent = 'Next →'; nextBtn.onclick = () => onboardNav(1); }
    }

    function onboardNav(dir) {
      _onboardStep = Math.max(0, Math.min(ONBOARD_STEPS.length - 1, _onboardStep + dir));
      renderOnboardingSteps();
    }

    function showOnboarding() {
      _onboardStep = 0;
      renderOnboardingSteps();
      document.getElementById('onboardingWizard').style.display = 'block';
    }
  </script>
</body>
</html>`;

  return c.html(html);
});

// ---------------------------------------------------------------------------
// Phase 2 T007: Partner Admin JSON API Routes
//
// All routes require:
//   Authorization: Bearer <jwt>  — with role = partner | super_admin
//   X-Partner-Id: <partner_id>   — scopes the response to one partner
//
// GET  /api/workspaces    — workspaces for this partner
// GET  /api/usage         — usage metrics (3: activeGroups, totalMembers, totalCampaigns)
// GET  /api/sub-partners  — sub-partners under this partner
// GET  /api/credits       — WakaCU credit pool balance
// ---------------------------------------------------------------------------

type JwtPayload = { sub?: string; role?: string; tenant_id?: string };

function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function requirePartnerAuth(
  authHeader: string | undefined,
  partnerId: string | undefined,
): { ok: true; payload: JwtPayload } | { ok: false; status: 401 | 400 } {
  if (!authHeader?.startsWith('Bearer ')) return { ok: false, status: 401 };
  if (!partnerId) return { ok: false, status: 400 };
  const token = authHeader.slice(7);
  const payload = decodeJwt(token);
  if (!payload) return { ok: false, status: 401 };
  if (!['partner', 'super_admin'].includes(payload.role ?? '')) return { ok: false, status: 401 };
  return { ok: true, payload };
}

app.get('/api/workspaces', async (c) => {
  const auth = requirePartnerAuth(c.req.header('Authorization'), c.req.header('X-Partner-Id'));
  if (!auth.ok) return c.json({ error: 'unauthorized' }, auth.status);

  const partnerId = c.req.header('X-Partner-Id')!;
  const db = c.env?.DB;
  if (!db) return c.json({ workspaces: [], total: 0 });

  const { results } = await db
    .prepare('SELECT * FROM workspaces WHERE partner_id = ? ORDER BY created_at DESC LIMIT 100')
    .bind(partnerId)
    .all<Record<string, unknown>>();

  return c.json({ workspaces: results, total: results.length });
});

app.get('/api/usage', async (c) => {
  const auth = requirePartnerAuth(c.req.header('Authorization'), c.req.header('X-Partner-Id'));
  if (!auth.ok) return c.json({ error: 'unauthorized' }, auth.status);

  const partnerId = c.req.header('X-Partner-Id')!;
  const db = c.env?.DB;
  if (!db) return c.json({ activeGroups: 0, totalMembers: 0, totalCampaigns: 0 });

  const [groupsRow, membersRow, campaignsRow] = await Promise.all([
    db.prepare(
      `SELECT COUNT(*) as cnt FROM groups g
       JOIN workspaces w ON g.workspace_id = w.id
       WHERE w.partner_id = ? AND g.status = 'active'`,
    ).bind(partnerId).first<{ cnt: number }>(),

    db.prepare(
      `SELECT COUNT(*) as cnt FROM group_members gm
       JOIN workspaces w ON gm.workspace_id = w.id
       WHERE w.partner_id = ? AND gm.status = 'active'`,
    ).bind(partnerId).first<{ cnt: number }>(),

    db.prepare(
      `SELECT COUNT(*) as cnt FROM fundraising_campaigns fc
       JOIN workspaces w ON fc.workspace_id = w.id
       WHERE w.partner_id = ? AND fc.status IN ('active','published')`,
    ).bind(partnerId).first<{ cnt: number }>(),
  ]);

  return c.json({
    activeGroups: groupsRow?.cnt ?? 0,
    totalMembers: membersRow?.cnt ?? 0,
    totalCampaigns: campaignsRow?.cnt ?? 0,
    computedAt: Math.floor(Date.now() / 1000),
  });
});

app.get('/api/sub-partners', async (c) => {
  const auth = requirePartnerAuth(c.req.header('Authorization'), c.req.header('X-Partner-Id'));
  if (!auth.ok) return c.json({ error: 'unauthorized' }, auth.status);

  const partnerId = c.req.header('X-Partner-Id')!;
  const db = c.env?.DB;
  if (!db) return c.json({ subPartners: [], total: 0 });

  const { results } = await db
    .prepare(
      'SELECT id, name, status, contact_email, created_at FROM partners WHERE parent_partner_id = ? ORDER BY created_at DESC LIMIT 100',
    )
    .bind(partnerId)
    .all<Record<string, unknown>>();

  return c.json({ subPartners: results, total: results.length });
});

app.get('/api/credits', async (c) => {
  const auth = requirePartnerAuth(c.req.header('Authorization'), c.req.header('X-Partner-Id'));
  if (!auth.ok) return c.json({ error: 'unauthorized' }, auth.status);

  const partnerId = c.req.header('X-Partner-Id')!;
  const db = c.env?.DB;
  if (!db) return c.json({ balance: 0, currency: 'WC', partnerId });

  const pool = await db
    .prepare('SELECT balance, currency FROM partner_credit_pools WHERE partner_id = ?')
    .bind(partnerId)
    .first<{ balance: number; currency: string }>();

  return c.json({
    partnerId,
    balance: pool?.balance ?? 0,
    currency: pool?.currency ?? 'WC',
    computedAt: Math.floor(Date.now() / 1000),
  });
});

// ─── E1-4: Branding API ──────────────────────────────────────────────────────
// GET  /partners/:id/branding  — fetch current branding config
// PATCH /partners/:id/branding — save branding config

app.get('/partners/:id/branding', async (c) => {
  const auth = requirePartnerAuth(c.req.header('Authorization'), c.req.param('id'));
  if (!auth.ok) return c.json({ error: 'Unauthorized' }, auth.status);
  const pid = c.req.param('id');
  try {
    const row = await c.env.DB
      ?.prepare('SELECT logo_url, primary_color, custom_domain, support_email FROM partner_branding WHERE partner_id = ? LIMIT 1')
      .bind(pid)
      .first<{ logo_url: string | null; primary_color: string | null; custom_domain: string | null; support_email: string | null }>();
    return c.json(row ?? { logo_url: null, primary_color: '#0F4C81', custom_domain: null, support_email: null });
  } catch {
    return c.json({ logo_url: null, primary_color: '#0F4C81', custom_domain: null, support_email: null });
  }
});

app.patch('/partners/:id/branding', async (c) => {
  const auth = requirePartnerAuth(c.req.header('Authorization'), c.req.param('id'));
  if (!auth.ok) return c.json({ error: 'Unauthorized' }, auth.status);
  const pid = c.req.param('id');
  const body = await c.req.json<{ logo_url?: string | null; primary_color?: string; custom_domain?: string | null; support_email?: string | null }>();
  try {
    await c.env.DB
      ?.prepare(
        `INSERT INTO partner_branding (partner_id, logo_url, primary_color, custom_domain, support_email, updated_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'))
         ON CONFLICT(partner_id) DO UPDATE SET
           logo_url      = excluded.logo_url,
           primary_color = excluded.primary_color,
           custom_domain = excluded.custom_domain,
           support_email = excluded.support_email,
           updated_at    = excluded.updated_at`,
      )
      .bind(pid, body.logo_url ?? null, body.primary_color ?? '#0F4C81', body.custom_domain ?? null, body.support_email ?? null)
      .run();
    return c.json({ ok: true });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

export default app;
