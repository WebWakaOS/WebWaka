import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  HomeIcon, AIIcon, POSIcon, OfferingsIcon, VerticalIcon,
  WakaPageIcon, BillingIcon, SettingsIcon, ShieldIcon, HandshakeIcon,
} from '@/components/ui/Icons';
import type { ComponentType } from 'react';

interface IconProps { size?: number; color?: string; }

// ─── Extra icons for Wave 2 nav items ────────────────────────────────────────

function InventoryIcon({ size = 18, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="5" rx="1" />
      <rect x="2" y="11" width="20" height="5" rx="1" />
      <rect x="2" y="19" width="20" height="2" rx="1" />
      <line x1="6" y1="5.5" x2="6" y2="5.5" strokeWidth="3" />
      <line x1="6" y1="13.5" x2="6" y2="13.5" strokeWidth="3" />
    </svg>
  );
}

function AnalyticsIcon({ size = 18, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function CustomersIcon({ size = 18, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}


function BrandIcon({ size = 18, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  );
}

interface NavItem {
  to: string;
  label: string;
  Icon: ComponentType<IconProps>;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',  label: 'Dashboard',     Icon: HomeIcon },
  { to: '/ai',         label: 'AI Assistant',  Icon: AIIcon },
  { to: '/pos',        label: 'Point of Sale', Icon: POSIcon },
  { to: '/offerings',  label: 'Offerings',     Icon: OfferingsIcon },
  { to: '/inventory',  label: 'Inventory',     Icon: InventoryIcon },
  { to: '/analytics',  label: 'Analytics',     Icon: AnalyticsIcon },
  { to: '/customers',  label: 'Customers',     Icon: CustomersIcon },
  { to: '/vertical',   label: 'My Vertical',   Icon: VerticalIcon },
  { to: '/wakapage',   label: 'WakaPage',      Icon: WakaPageIcon },
  { to: '/brand',      label: 'Brand',         Icon: BrandIcon },
  { to: '/billing',    label: 'Billing',       Icon: BillingIcon },
  { to: '/settings',   label: 'Settings',      Icon: SettingsIcon },
  // Role-gated items
  { to: '/platform',  label: 'Platform Admin', Icon: ShieldIcon,    roles: ['super_admin'] },
  { to: '/partner',   label: 'Partner Portal', Icon: HandshakeIcon, roles: ['partner'] },
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
        {user?.businessName && (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.businessName}
          </div>
        )}
      </div>

      <nav style={{ flex: 1, padding: '12px 0' }}>
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 20px',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: isActive ? 600 : 400,
              background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
              borderLeft: isActive ? '3px solid #fff' : '3px solid transparent',
              transition: 'background 0.15s, color 0.15s',
            })}
          >
            <item.Icon size={17} color="currentColor" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.email}
        </div>
        <button
          onClick={() => logout()}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            padding: '8px 14px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
          }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
