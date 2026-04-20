/**
 * N-069 — Notification bell icon with unread badge.
 *
 * Displayed in the workspace top bar (desktop) or bottom nav area (mobile).
 * Badge count capped at 99 (display "99+").
 * Click opens/closes the NotificationDrawer.
 */

import type { CSSProperties } from 'react';

interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
  open?: boolean;
}

export function NotificationBell({ unreadCount, onClick, open = false }: NotificationBellProps) {
  const badgeCount = Math.min(unreadCount, 99);
  const badgeLabel = unreadCount > 99 ? '99+' : String(badgeCount);

  return (
    <button
      aria-label={
        unreadCount === 0
          ? 'Notifications — none unread'
          : `Notifications — ${unreadCount} unread`
      }
      aria-expanded={open}
      aria-haspopup="dialog"
      onClick={onClick}
      style={styles.button}
    >
      {/* Bell SVG */}
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke={open ? '#0F4C81' : '#374151'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>

      {/* Badge */}
      {unreadCount > 0 && (
        <span
          aria-hidden="true"
          style={{
            ...styles.badge,
            minWidth: unreadCount > 9 ? 20 : 18,
          }}
        >
          {badgeLabel}
        </span>
      )}
    </button>
  );
}

const styles: Record<string, CSSProperties> = {
  button: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
    flexShrink: 0,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    height: 18,
    borderRadius: 9,
    background: '#dc2626',
    color: '#fff',
    fontSize: 10,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    lineHeight: 1,
    pointerEvents: 'none',
    boxShadow: '0 0 0 2px #fff',
  },
};
