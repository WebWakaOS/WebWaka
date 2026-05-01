import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Suspense, lazy, type ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AIProvider } from '@/contexts/AIContext';
import { WorkspaceLayout, RequireGuest } from '@/components/layout/WorkspaceLayout';
import { FullPageSpinner } from '@/components/ui/Spinner';

// ── Route-level code splitting (fix: reduces initial bundle size for 2G/3G users) ──
// Each page is lazily loaded — only downloaded when the route is first visited.
const Login          = lazy(() => import('@/pages/Login'));
const Register       = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword  = lazy(() => import('@/pages/ResetPassword'));
const Dashboard      = lazy(() => import('@/pages/Dashboard'));
const POS            = lazy(() => import('@/pages/POS'));
const Offerings      = lazy(() => import('@/pages/Offerings'));
const VerticalView   = lazy(() => import('@/pages/VerticalView'));
const Settings       = lazy(() => import('@/pages/Settings'));
const WakaPageManager = lazy(() => import('@/pages/WakaPage'));
const VerifyEmail    = lazy(() => import('@/pages/VerifyEmail'));
const AcceptInvite   = lazy(() => import('@/pages/AcceptInvite'));
const AIPage         = lazy(() => import('@/pages/AI'));
const AdminHITL      = lazy(() => import('@/pages/AdminHITL'));
const Billing        = lazy(() => import('@/pages/Billing'));
const PlatformAdmin  = lazy(() => import('@/pages/PlatformAdmin'));
const PartnerAdmin   = lazy(() => import('@/pages/PartnerAdmin'));
const Onboarding     = lazy(() => import('@/pages/Onboarding'));

/** Role guard: allows access only if user has one of the specified roles */
function RequireRole({ roles, children }: { roles: string[]; children: ReactNode }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role ?? '')) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }} aria-hidden="true">🔒</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Access Denied</h2>
        <p style={{ color: '#6b7280', fontSize: 15 }}>You don't have permission to view this page.</p>
        <Link to="/dashboard" style={{ display: 'inline-block', marginTop: 20, color: '#0F4C81', fontWeight: 600 }}>← Back to Dashboard</Link>
      </div>
    );
  }
  return <>{children}</>;
}

function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16,
    }}>
      <div style={{ fontSize: 64 }} aria-hidden="true">🔍</div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>Page not found</h1>
      <p style={{ color: '#6b7280', fontSize: 15 }}>The page you're looking for doesn't exist.</p>
      <Link to="/dashboard" style={{
        color: '#0F4C81', fontWeight: 600, textDecoration: 'none', padding: '12px 24px',
        background: '#f0f9ff', borderRadius: 8, minHeight: 44, display: 'flex', alignItems: 'center',
      }}>
        Go to dashboard
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AIProvider>
          <a
            href="#main-content"
            style={{
              position: 'absolute', top: -100, left: 16, zIndex: 9999,
              background: '#0F4C81', color: '#fff', padding: '12px 20px', borderRadius: 8,
              textDecoration: 'none', fontWeight: 600, fontSize: 14,
              transition: 'top 0.15s ease',
            }}
            onFocus={e => { e.currentTarget.style.top = '16px'; }}
            onBlur={e => { e.currentTarget.style.top = '-100px'; }}
          >
            Skip to main content
          </a>

          {/* Suspense boundary wraps all lazy routes */}
          <Suspense fallback={<FullPageSpinner />}>
            <Routes>
              {/* Guest-only routes */}
              <Route element={<RequireGuest />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Route>

              {/* Authenticated workspace routes */}
              <Route element={<WorkspaceLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/pos" element={<POS />} />
                <Route path="/offerings" element={<Offerings />} />
                <Route path="/offerings/new" element={<Offerings />} />
                <Route path="/vertical" element={<VerticalView />} />
                <Route path="/wakapage" element={<WakaPageManager />} />
                <Route path="/ai" element={<AIPage />} />
                <Route path="/admin/hitl" element={
                  <RequireRole roles={['admin', 'super_admin']}>
                    <AdminHITL />
                  </RequireRole>
                } />
                <Route path="/billing" element={<Billing />} />
                <Route path="/settings" element={<Settings />} />
                {/* C5: Role-gated admin routes */}
                <Route path="/platform/*" element={<PlatformAdmin />} />
                <Route path="/partner/*" element={<PartnerAdmin />} />
              </Route>

              {/* Public routes */}
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/accept-invite" element={<AcceptInvite />} />
              {/* Onboarding wizard */}
              <Route path="/onboarding" element={<Onboarding />} />

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AIProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
