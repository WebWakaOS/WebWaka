/**
 * Icon primitives — SVG-based for consistent cross-platform rendering.
 * Replaces emoji icons in Sidebar, BottomNav, and other UI components.
 *
 * FIX (BUG-050 global): Emoji render inconsistently across Android/iOS/Windows.
 * All navigation and UI icons now use SVG with aria-hidden for accessibility.
 */

import type { CSSProperties } from 'react';

interface IconProps {
  size?: number;
  color?: string;
  style?: CSSProperties;
}

const defaults = (size = 20, color = 'currentColor') => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
  stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const, 'aria-hidden': true,
});

export function HomeIcon({ size, color, style }: IconProps) {
  return (
    <svg {...defaults(size, color)} style={style}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export function AIIcon({ size, color, style }: IconProps) {
  return (
    <svg {...defaults(size, color)} style={style}>
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
      <path d="M12 8v4l3 3" />
    </svg>
  );
}

export function POSIcon({ size, color, style }: IconProps) {
  return (
    <svg {...defaults(size, color)} style={style}>
      <rect x="1" y="3" width="22" height="18" rx="2" />
      <line x1="1" y1="9" x2="23" y2="9" />
      <line x1="8" y1="21" x2="8" y2="9" />
    </svg>
  );
}

export function OfferingsIcon({ size, color, style }: IconProps) {
  return (
    <svg {...defaults(size, color)} style={style}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  );
}

export function VerticalIcon({ size, color, style }: IconProps) {
  return (
    <svg {...defaults(size, color)} style={style}>
      <rect x="2" y="3" width="9" height="9" rx="1" />
      <rect x="13" y="3" width="9" height="9" rx="1" />
      <rect x="2" y="13" width="9" height="9" rx="1" />
      <rect x="13" y="13" width="9" height="9" rx="1" />
    </svg>
  );
}

export function WakaPageIcon({ size, color, style }: IconProps) {
  return (
    <svg {...defaults(size, color)} style={style}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function BillingIcon({ size, color, style }: IconProps) {
  return (
    <svg {...defaults(size, color)} style={style}>
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

export function SettingsIcon({ size, color, style }: IconProps) {
  return (
    <svg {...defaults(size, color)} style={style}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function ShieldIcon({ size, color, style }: IconProps) {
  return (
    <svg {...defaults(size, color)} style={style}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function HandshakeIcon({ size, color, style }: IconProps) {
  return (
    <svg {...defaults(size, color)} style={style}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
    </svg>
  );
}

export function DashboardIcon({ size, color, style }: IconProps) {
  return (
    <svg {...defaults(size, color)} style={style}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
