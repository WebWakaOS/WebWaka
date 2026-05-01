import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  HomeIcon, AIIcon, POSIcon, OfferingsIcon, VerticalIcon,
  WakaPageIcon, SettingsIcon, ShieldIcon, HandshakeIcon,
} from '@/components/ui/Icons';
import type { ComponentType } from 'react';

interface IconProps { size?: number; color?: string; }

// Inline icons for new Wave 2 nav items
function AnalyticsIcon({ size = 18, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function InventoryIcon({ size = 18, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="5" rx="1" />
      <rect x="2" y="11" width="20" height="5" rx="1" />
      <rect x="2" y="19" width="20" height="2" rx="1" />
    </svg>
  );
}

function CustomersIcon({ size = 18, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  );
}

interface NavItem {
  to: string;
  label: string;
  Icon: ComponentType<IconProps>;
}

const BASE_ITEMS: NavItem[] = [
  { to: '/dashboard',  label: 'Home',       Icon: HomeIcon },
  { to: '/ai',         label: 'AI',         Icon: AIIcon },
  { to: '/pos',        label: 'POS',        Icon: POSIcon },
  { to: '/offerings',  label: 'Offerings',  Icon: OfferingsIcon },
  { to: '/inventory',  label: 'Inventory',  Icon: InventoryIcon },
  { to: '/analytics',  label: 'Analytics',  Icon: AnalyticsIcon },
  { to: '/customers',  label: 'Customers',  Icon: CustomersIcon },
  { to: '/vertical',   label: 'Vertical',   Icon: VerticalIcon },
  { to: '/wakapage',   label: 'WakaPage',   Icon: WakaPageIcon },
  { to: '/settings',   label: 'Settings',   Icon: SettingsIcon },
];

export function BottomNav() {
  const { user } = useAuth();
  const role = user?.role ?? '';
  const items: NavItem[] = [
    ...BASE_ITEMS,
    ...(role === 'super_admin'
      ? [{ to: '/platform', label: 'Platform', Icon: ShieldIcon }]
      : []),
    ...(role === 'partner'
      ? [{ to: '/partner', label: 'Partner', Icon: HandshakeIcon }]
      : []),
  ];

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
        overflowX: 'auto',
        scrollbarWidth: 'none',
        zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {items.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            flex: '0 0 auto',
            minWidth: 56,
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            gap: 2,
            padding: '8px 6px',
            minHeight: 56,
            textDecoration: 'none',
            color: isActive ? '#0F4C81' : '#6b7280',
            background: isActive ? '#f0f9ff' : 'transparent',
            borderTop: isActive ? '2px solid #0F4C81' : '2px solid transparent',
            transition: 'all 0.15s ease',
          })}
        >
          <item.Icon size={18} color="currentColor" />
          <span style={{ fontSize: 10, fontWeight: 600 }}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
