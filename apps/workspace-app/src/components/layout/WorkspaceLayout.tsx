import { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { NotificationDrawer } from '@/components/notifications/NotificationDrawer';
import { useNotificationPoll } from '@/hooks/useNotificationPoll';

const MOBILE_BREAKPOINT = 768;

export function WorkspaceLayout() {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handler, { passive: true });
    return () => window.removeEventListener('resize', handler);
  }, []);

  const { unreadCount, refresh } = useNotificationPoll({ enabled: !!user });

  if (!initialized || loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return (
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

      <main
        id="main-content"
        role="main"
        style={{
          flex: 1,
          marginLeft: isMobile ? 0 : 240,
          paddingBottom: isMobile ? 72 : 0,
          minHeight: '100vh',
          background: '#f8f9fa',
          overflowX: 'hidden',
        }}
      >
        <Outlet />
      </main>
      {isMobile && <BottomNav />}

      {/* Notification drawer */}
      <NotificationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCountChange={() => { void refresh(); }}
      />
    </div>
  );
}

export function RequireGuest() {
  const { user, loading, initialized } = useAuth();
  if (!initialized || loading) return <FullPageSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
