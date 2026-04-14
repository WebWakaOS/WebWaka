import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { WorkspaceLayout, RequireGuest } from '@/components/layout/WorkspaceLayout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import POS from '@/pages/POS';
import Offerings from '@/pages/Offerings';
import VerticalView from '@/pages/VerticalView';
import Settings from '@/pages/Settings';
import VerifyEmail from '@/pages/VerifyEmail';
import AcceptInvite from '@/pages/AcceptInvite';

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
      <div style={{ fontSize: 64 }} aria-hidden="true">🔍</div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>Page not found</h1>
      <p style={{ color: '#6b7280', fontSize: 15 }}>The page you're looking for doesn't exist.</p>
      <Link to="/dashboard" style={{ color: '#0F4C81', fontWeight: 600, textDecoration: 'none', padding: '12px 24px', background: '#f0f9ff', borderRadius: 8, minHeight: 44, display: 'flex', alignItems: 'center' }}>
        Go to dashboard
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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

        <Routes>
          <Route element={<RequireGuest />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          <Route element={<WorkspaceLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/offerings" element={<Offerings />} />
            <Route path="/offerings/new" element={<Offerings />} />
            <Route path="/vertical" element={<VerticalView />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* P20-C: Email verification — public, no auth needed */}
          <Route path="/verify-email" element={<VerifyEmail />} />
          {/* P20-A: Invite acceptance — public, no auth needed */}
          <Route path="/accept-invite" element={<AcceptInvite />} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
