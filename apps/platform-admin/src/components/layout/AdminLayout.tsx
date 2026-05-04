import { useState, useEffect, type ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  { to: '/overview', icon: '🏠', label: 'Overview' },
  { section: 'CONTROL PLANE' },
  { to: '/plans', icon: '💳', label: 'Plans & Pricing' },
  { to: '/entitlements', icon: '🔑', label: 'Entitlements' },
  { to: '/roles', icon: '🛡️', label: 'Roles & Groups' },
  { to: '/flags', icon: '🚩', label: 'Feature Flags' },
  { section: 'INFRASTRUCTURE' },
  { to: '/providers', icon: '🔌', label: 'Provider Registry' },
  { section: 'PLATFORM' },
  { to: '/tenants', icon: '🏢', label: 'Tenants' },
  { to: '/pilots', icon: '🚀', label: 'Pilot Operators' },
  { to: '/audit', icon: '📝', label: 'Audit Log' },
];

type NavItemType = { to: string; icon: string; label: string } | { section: string };

function isSection(item: NavItemType): item is { section: string } {
  return 'section' in item;
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <nav style={{
        width: sidebarOpen ? 220 : 60,
        flexShrink: 0,
        background: 'var(--dark-2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{
          padding: '1rem 1rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          minHeight: 60,
        }}>
          <div style={{
            width: 32, height: 32, background: 'var(--primary)', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '1rem', color: '#000', flexShrink: 0,
          }}>W</div>
          {sidebarOpen && (
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.2 }}>WebWaka</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>Platform Admin</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            style={{
              marginLeft: 'auto', background: 'none', color: 'var(--text-muted)',
              padding: '4px', borderRadius: 4, fontSize: '0.9rem', flexShrink: 0,
            }}
          >
            {sidebarOpen ? '◄' : '►'}
          </button>
        </div>

        {/* Nav links */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0' }}>
          {NAV_ITEMS.map((item, i) => {
            if (isSection(item)) {
              return sidebarOpen ? (
                <div key={i} style={{
                  padding: '0.6rem 1rem 0.2rem',
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-subtle)',
                  fontWeight: 600,
                  marginTop: '0.5rem',
                }}>{item.section}</div>
              ) : <div key={i} style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />;
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={!sidebarOpen ? item.label : undefined}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: sidebarOpen ? '0.55rem 1.25rem' : '0.55rem 0',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  fontSize: '0.875rem',
                  color: isActive ? '#60a5fa' : 'var(--text-muted)',
                  textDecoration: 'none',
                  borderLeft: `3px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
                  background: isActive ? 'rgba(15,76,129,0.1)' : 'transparent',
                  transition: 'all 0.15s',
                })}
              >
                <span style={{ flexShrink: 0, fontSize: '1rem' }}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* User */}
        {sidebarOpen && user && (
          <div style={{
            padding: '1rem',
            borderTop: '1px solid var(--border)',
            fontSize: '0.8rem',
          }}>
            <div style={{ color: 'var(--text)', fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            <div style={{ color: 'var(--text-muted)', marginBottom: 8 }}>super_admin</div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%', padding: '0.4rem 0.75rem', background: 'rgba(239,68,68,0.1)',
                color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 6, fontSize: '0.8rem', fontWeight: 600,
              }}
            >Sign out</button>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--dark)' }}>
        <Outlet />
      </main>
    </div>
  );
}
