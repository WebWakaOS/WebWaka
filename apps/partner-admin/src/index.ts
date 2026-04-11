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
  const allowed: string[] = envOrigins
    ? envOrigins.split(',').map((o) => o.trim()).filter(Boolean)
    : ['http://localhost:5173', 'https://admin.webwaka.com', 'https://partner.webwaka.com'];

  return cors({
    origin: (origin) => {
      if (allowed.includes(origin)) return origin;
      if (origin.startsWith('https://') && origin.endsWith('.webwaka.com')) return origin;
      return null;
    },
    allowHeaders: ['Authorization', 'Content-Type'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    maxAge: 86400,
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
    <span class="milestone-badge">Milestone 11 — Partner & White-Label</span>
  </header>

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
      <code>PATCH /partners/:id/status</code> — Update partner status (pending → active → suspended → deactivated)<br/>
      <code>GET  /partners/:id/sub-partners</code> — List sub-partners<br/>
      <code>POST /partners/:id/sub-partners</code> — Create sub-partner (requires delegation_rights entitlement)<br/>
      <code>PATCH /partners/:id/sub-partners/:subId/status</code> — Update sub-partner status<br/>
      <code>GET  /partners/:id/entitlements</code> — View entitlement grants<br/>
      <code>POST /partners/:id/entitlements</code> — Grant entitlement dimension
    </div>
  </main>

  <footer>
    WebWaka OS &mdash; Partner Admin &mdash; Milestone 11 &mdash; 2026-04-11
  </footer>
</body>
</html>`;

  return c.html(html);
});

export default app;
