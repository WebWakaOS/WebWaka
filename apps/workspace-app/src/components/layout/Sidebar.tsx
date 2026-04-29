import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',  label: 'Dashboard',  icon: '🏠' },
  { to: '/pos',        label: 'Point of Sale', icon: '🛒' },
  { to: '/offerings',  label: 'Offerings',  icon: '📦' },
  { to: '/vertical',   label: 'My Vertical', icon: '🏢' },
  { to: '/wakapage',   label: 'WakaPage',   icon: '🌐' },
  { to: '/settings',   label: 'Settings',   icon: '⚙️' },
];

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside
      role="navigation"
      aria-label="Workspace navigation"
      style={{
        width: 240,
        minHeight: '100vh',
        background: '#0F4C81',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 50,
      }}
    >
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>WebWaka</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Workspace OS</div>
      </div>

      <nav style={{ flex: 1, padding: '16px 0' }}>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 20px',
              textDecoration: 'none',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
              background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
              borderRight: isActive ? '3px solid #60a5fa' : '3px solid transparent',
              fontWeight: isActive ? 600 : 400,
              fontSize: 14,
              transition: 'all 0.15s ease',
              minHeight: 44,
            })}
          >
            <span aria-hidden="true" style={{ fontSize: 18 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.email}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {user?.role}
        </div>
        <button
          onClick={logout}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: 'rgba(255,255,255,0.8)',
            borderRadius: 6,
            padding: '8px 14px',
            fontSize: 13,
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            minHeight: 36,
          }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
