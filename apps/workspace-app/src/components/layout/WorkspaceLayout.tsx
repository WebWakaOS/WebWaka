import { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { FullPageSpinner } from '@/components/ui/Spinner';

const MOBILE_BREAKPOINT = 768;

export function WorkspaceLayout() {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handler, { passive: true });
    return () => window.removeEventListener('resize', handler);
  }, []);

  if (!initialized || loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {!isMobile && <Sidebar />}
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
    </div>
  );
}

export function RequireGuest() {
  const { user, loading, initialized } = useAuth();
  if (!initialized || loading) return <FullPageSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
