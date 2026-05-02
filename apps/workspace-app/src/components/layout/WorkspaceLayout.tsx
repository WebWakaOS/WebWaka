import { useEffect, useState } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { NotificationDrawer } from '@/components/notifications/NotificationDrawer';
import { useNotificationPoll } from '@/hooks/useNotificationPoll';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
// M-3: Billing status banner
import { BillingProvider, BillingStatusBanner, useBilling } from '@/components/BillingStatusBanner';
import { registerBillingStatusListener } from '@/lib/api';

const MOBILE_BREAKPOINT = 768;

/**
 * M-3: Inner component that wires the API interceptor to BillingContext.
 * Must be inside <BillingProvider> to access useBilling().
 */
function BillingStatusSync() {
  const { updateStatus } = useBilling();
  useEffect(() => {
    return registerBillingStatusListener(updateStatus);
  }, [updateStatus]);
  return null;
}


// A3-4: Global search bar
const SEARCH_ROUTES = [
  { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
  { label: 'AI Assistant', path: '/ai', icon: '🤖' },
  { label: 'Point of Sale', path: '/pos', icon: '🛒' },
  { label: 'Offerings', path: '/offerings', icon: '📦' },
  { label: 'Inventory', path: '/inventory', icon: '📋' },
  { label: 'Analytics', path: '/analytics', icon: '📊' },
  { label: 'Customers', path: '/customers', icon: '👥' },
  { label: 'Team & Staff', path: '/staff', icon: '👤' },
  { label: 'Notifications', path: '/notifications', icon: '🔔' },
  { label: 'WakaPage', path: '/wakapage', icon: '🌐' },
  { label: 'Billing', path: '/billing', icon: '💳' },
  { label: 'Settings', path: '/settings', icon: '⚙️' },
  { label: 'Brand Settings', path: '/brand', icon: '🎨' },
];

function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const results = query.length > 0
    ? SEARCH_ROUTES.filter(r => r.label.toLowerCase().includes(query.toLowerCase()))
    : [];

  const go = (path: string) => {
    navigate(path);
    setQuery('');
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: '6px 12px', gap: 6, minWidth: 200 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          placeholder="Search pages…"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 13, width: '100%' }}
          aria-label="Search workspace pages"
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: 14, padding: 0 }}>✕</button>
        )}
      </div>
      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
          background: '#fff', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          zIndex: 300, overflow: 'hidden',
        }}>
          {results.map(r => (
            <button key={r.path} onMouseDown={() => go(r.path)} style={{
              display: 'flex', gap: 10, alignItems: 'center',
              width: '100%', padding: '10px 14px', fontSize: 14, cursor: 'pointer',
              background: 'none', border: 'none', textAlign: 'left',
              borderBottom: '1px solid #f3f4f6', color: '#111827',
            }}>
              <span style={{ fontSize: 16 }}>{r.icon}</span>
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function WorkspaceLayout() {
  const { user, loading, initialized } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handler, { passive: true });
    return () => window.removeEventListener('resize', handler);
  }, []);

  // BUG-025: On every route change, move focus to #main-content so screen-reader
  // users hear the new page heading rather than being stranded at the link they
  // just activated.
  useEffect(() => {
    const el = document.getElementById('main-content');
    if (el) {
      el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    }
  }, [location.pathname]);

  const { unreadCount, refresh } = useNotificationPoll({ enabled: !!user });

  if (!initialized || loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return (
    // M-3: Wrap the entire layout in BillingProvider so any descendent can
    // call useBilling() or ReadOnlyGuard without additional context setup.
    <BillingProvider>
      {/* M-3: Wires the API interceptor → BillingContext */}
      <BillingStatusSync />

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {!isMobile && <Sidebar />}

        {/* Top bar: global search + notification bell (desktop only) */}
        {!isMobile && (
          <div style={{
            position: 'fixed',
            top: 0, right: 0,
            width: 'calc(100% - 240px)',
            zIndex: 200,
            background: '#0F4C81',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 20px',
            height: 52,
            boxSizing: 'border-box',
          }}>
            <GlobalSearch />
            <NotificationBell
              unreadCount={unreadCount}
              onClick={() => setDrawerOpen((o) => !o)}
              open={drawerOpen}
            />
          </div>
        )}

        {/* M6: Mobile top bar with notification bell */}
        {isMobile && (
          <div style={{
            position: 'sticky', top: 0, zIndex: 99,
            background: '#0F4C81', padding: '10px 14px',
            display: 'flex', gap: 10, alignItems: 'center',
          }}>
            <div style={{ flex: 1 }}>
              <GlobalSearch />
            </div>
            <NotificationBell
              unreadCount={unreadCount}
              onClick={() => setDrawerOpen((o) => !o)}
              open={drawerOpen}
            />
          </div>
        )}

        <div
          style={{
            flex: 1,
            marginLeft: isMobile ? 0 : 240,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
          }}
        >
          {/* BUG-010 / ENH-002 / ENH-020: Offline indicator */}
          <OfflineBanner />

          {/* M-3: Billing status banner — shown when subscription is suspended/grace_period */}
          <BillingStatusBanner />

          <main
            id="main-content"
            role="main"
            style={{
              flex: 1,
              paddingBottom: isMobile ? 72 : 0,
              background: '#f8f9fa',
              overflowX: 'hidden',
            }}
          >
            <Outlet />
          </main>
        </div>
        {isMobile && <BottomNav />}

        {/* Notification drawer */}
        <NotificationDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onCountChange={() => { void refresh(); }}
        />
      </div>
    </BillingProvider>
  );
}

export function RequireGuest() {
  const { user, loading, initialized } = useAuth();
  if (!initialized || loading) return <FullPageSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
