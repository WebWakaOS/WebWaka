import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, type ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/layout/AdminLayout';

const Login = lazy(() => import('@/pages/Login'));
const Overview = lazy(() => import('@/pages/Overview'));
const Plans = lazy(() => import('@/pages/Plans'));
const Flags = lazy(() => import('@/pages/Flags'));
const Entitlements = lazy(() => import('@/pages/Entitlements'));
const Roles = lazy(() => import('@/pages/Roles'));
const Pilots = lazy(() => import('@/pages/Pilots'));
const Audit = lazy(() => import('@/pages/Audit'));
const Tenants = lazy(() => import('@/pages/Tenants'));

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--dark)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem', color: '#000', margin: '0 auto 12px' }}>W</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading...</div>
      </div>
    </div>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route path="/" element={<Navigate to="/overview" replace />} />
              <Route path="/overview" element={<Overview />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/flags" element={<Flags />} />
              <Route path="/entitlements" element={<Entitlements />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/tenants" element={<Tenants />} />
              <Route path="/pilots" element={<Pilots />} />
              <Route path="/audit" element={<Audit />} />
            </Route>
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
