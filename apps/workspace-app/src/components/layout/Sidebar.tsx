import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  HomeIcon, AIIcon, POSIcon, OfferingsIcon, VerticalIcon,
  WakaPageIcon, BillingIcon, SettingsIcon, ShieldIcon, HandshakeIcon,
} from '@/components/ui/Icons';
import type { ComponentType } from 'react';

interface IconProps { size?: number; color?: string; }

interface NavItem {
  to: string;
  label: string;
  Icon: ComponentType<IconProps>;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',  label: 'Dashboard',    Icon: HomeIcon },
  { to: '/ai',         label: 'AI Assistant', Icon: AIIcon },
  { to: '/pos',        label: 'Point of Sale', Icon: POSIcon },
  { to: '/offerings',  label: 'Offerings',    Icon: OfferingsIcon },
  { to: '/vertical',   label: 'My Vertical',  Icon: VerticalIcon },
  { to: '/wakapage',   label: 'WakaPage',     Icon: WakaPageIcon },
  { to: '/billing',    label: 'Billing',      Icon: BillingIcon },
  { to: '/settings',   label: 'Settings',     Icon: SettingsIcon },
  // Role-gated items
  { to: '/platform',   label: 'Platform Admin', Icon: ShieldIcon,    roles: ['super_admin'] },
  { to: '/partner',    label: 'Partner Portal', Icon: HandshakeIcon, roles: ['partner'] },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const role = user?.role ?? '';

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role),
  );

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
        overflowY: 'auto',
      }}
    >
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>WebWaka</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Workspace OS</div>
      </div>

      <nav style={{ flex: 1, padding: '16px 0' }}>
        {visibleItems.map(item => (
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
            <item.Icon size={18} color="currentColor" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.businessName ?? user?.email}
        </div>
        <button
          onClick={() => void logout()}
          style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', padding: '8px 16px', borderRadius: 6, fontSize: 13,
            cursor: 'pointer', width: '100%', fontWeight: 500, minHeight: 36,
          }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
