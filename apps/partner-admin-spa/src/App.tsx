/**
 * WebWaka Partner Admin SPA — App shell
 * E1-1: React SPA replacing the HTML-only partner-admin worker frontend.
 * E1-7: Onboarding wizard for first-login flow.
 */
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { loadSavedCredentials, setCredentials, clearCredentials, type Credentials } from './lib/api';

import Login         from './pages/Login';
import Overview      from './pages/Overview';
import Credits       from './pages/Credits';
import Settlements   from './pages/Settlements';
import SubPartners   from './pages/SubPartners';
import Branding      from './pages/Branding';
import Notifications from './pages/Notifications';
import Onboarding    from './pages/Onboarding';
import Entitlements  from './pages/Entitlements';

const ONBOARDING_KEY = 'pa_onboarding_done';

const NAV_LINKS = [
  { to: '/overview',      label: 'Overview'      },
  { to: '/credits',       label: 'Credits'       },
  { to: '/settlements',   label: 'Settlements'   },
  { to: '/sub-partners',  label: 'Sub-Partners'  },
  { to: '/branding',      label: 'Branding'      },
  { to: '/notifications', label: 'Notifications' },
  { to: '/entitlements',  label: 'Entitlements'  },
];

export default function App() {
  const [authed,       setAuthed]       = useState<boolean>(() => loadSavedCredentials() !== null);
  const [onboarded,    setOnboarded]    = useState<boolean>(() => {
    try { return localStorage.getItem(ONBOARDING_KEY) === '1'; } catch { return false; }
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!authed) navigate('/login', { replace: true });
  }, [authed, navigate]);

  function handleLogin(creds: Credentials) {
    setCredentials(creds);
    setAuthed(true);
    // Navigate to onboarding if not yet done, otherwise overview
    const done = (() => { try { return localStorage.getItem(ONBOARDING_KEY) === '1'; } catch { return false; } })();
    navigate(done ? '/overview' : '/onboarding', { replace: true });
  }

  function handleLogout() {
    clearCredentials();
    setAuthed(false);
    navigate('/login', { replace: true });
  }

  function handleOnboardingComplete() {
    try { localStorage.setItem(ONBOARDING_KEY, '1'); } catch { /* ignore */ }
    setOnboarded(true);
  }

  if (!authed) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="*"      element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Onboarding flow (full-screen, no nav)
  if (!onboarded) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding onComplete={handleOnboardingComplete} />} />
        <Route path="*"           element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header style={{
        background: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--green)', letterSpacing: '-0.5px' }}>
            WebWaka
          </span>
          <span style={{ color: 'var(--muted)', fontSize: '0.8125rem' }}>Partner Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => { try { localStorage.removeItem(ONBOARDING_KEY); } catch { /* ignore */ } setOnboarded(false); navigate('/onboarding', { replace: true }); }}
            title="Re-run onboarding wizard"
            style={{
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--muted)', borderRadius: 6, padding: '4px 10px',
              fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Setup Wizard
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--muted)', borderRadius: 6, padding: '4px 12px',
              fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ── Nav tabs ─────────────────────────────────────────────────── */}
      <nav style={{
        background: 'var(--dark)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', gap: 0, overflowX: 'auto', padding: '0 1rem',
      }}>
        {NAV_LINKS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              padding: '12px 16px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: isActive ? 'var(--green)' : 'var(--muted)',
              borderBottom: isActive ? '2px solid var(--green)' : '2px solid transparent',
              whiteSpace: 'nowrap',
              textDecoration: 'none',
              transition: 'color 0.15s',
            })}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* ── Page content ─────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: 960, width: '100%', margin: '0 auto' }}>
        <Routes>
          <Route path="/overview"      element={<Overview />}      />
          <Route path="/credits"       element={<Credits />}       />
          <Route path="/settlements"   element={<Settlements />}   />
          <Route path="/sub-partners"  element={<SubPartners />}   />
          <Route path="/branding"      element={<Branding />}      />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/onboarding"    element={<Onboarding onComplete={handleOnboardingComplete} />} />
          <Route path="/entitlements"  element={<Entitlements />} />
          <Route path="*"              element={<Navigate to="/overview" replace />} />
        </Routes>
      </main>

      <footer style={{
        borderTop: '1px solid var(--border)', padding: '1rem 1.5rem',
        color: 'var(--muted)', fontSize: '0.75rem', textAlign: 'center',
      }}>
        WebWaka Partner Admin &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
