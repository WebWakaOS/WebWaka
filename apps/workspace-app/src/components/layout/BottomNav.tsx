import { NavLink } from 'react-router-dom';

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',  label: 'Home',      icon: '🏠' },
  { to: '/pos',        label: 'POS',        icon: '🛒' },
  { to: '/offerings',  label: 'Offerings',  icon: '📦' },
  { to: '/vertical',   label: 'Vertical',   icon: '🏢' },
  { to: '/settings',   label: 'Settings',   icon: '⚙️' },
];

export function BottomNav() {
  return (
    <nav
      aria-label="Main navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {NAV_ITEMS.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            padding: '10px 4px',
            minHeight: 56,
            textDecoration: 'none',
            color: isActive ? '#0F4C81' : '#6b7280',
            background: isActive ? '#f0f9ff' : 'transparent',
            borderTop: isActive ? '2px solid #0F4C81' : '2px solid transparent',
            transition: 'all 0.15s ease',
          })}
        >
          <span aria-hidden="true" style={{ fontSize: 20 }}>{item.icon}</span>
          <span style={{ fontSize: 11, fontWeight: 600 }}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
