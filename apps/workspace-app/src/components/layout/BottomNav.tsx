import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  HomeIcon, AIIcon, POSIcon, OfferingsIcon, VerticalIcon,
  WakaPageIcon, SettingsIcon, ShieldIcon, HandshakeIcon,
} from '@/components/ui/Icons';
import type { ComponentType } from 'react';

interface IconProps { size?: number; color?: string; }

interface NavItem {
  to: string;
  label: string;
  Icon: ComponentType<IconProps>;
}

// Base 8 items shown to everyone (no billing in bottom nav — accessed via settings or dashboard)
const BASE_ITEMS: NavItem[] = [
  { to: '/dashboard',  label: 'Home',       Icon: HomeIcon },
  { to: '/ai',         label: 'AI',         Icon: AIIcon },
  { to: '/pos',        label: 'POS',        Icon: POSIcon },
  { to: '/offerings',  label: 'Offerings',  Icon: OfferingsIcon },
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
        /* Allow horizontal scroll on very small screens */
        overflowX: 'auto',
        /* Scrollbar hidden but scrollable */
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
