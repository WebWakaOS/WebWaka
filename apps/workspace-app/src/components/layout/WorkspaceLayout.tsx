import { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
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

        {/* Top bar notification bell (desktop only) */}
        {!isMobile && (
          <div style={{
            position: 'fixed',
            top: 12,
            right: 16,
            zIndex: 200,
          }}>
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
            background: '#0F4C81', padding: '12px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>WebWaka OS</span>
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
