/**
 * Billing Status Banner Component (M-3)
 *
 * Displays a warning/info banner when the workspace subscription is
 * suspended or in grace period, disabling write buttons.
 *
 * NOTE: Tailwind replaced with inline styles for workspace-app compat.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

type BillingStatus = 'active' | 'suspended' | 'grace_period' | 'unknown';

interface BillingContextValue {
  status: BillingStatus;
  isReadOnly: boolean;
  updateStatus: (status: BillingStatus) => void;
}

const BillingContext = createContext<BillingContextValue>({
  status: 'active',
  isReadOnly: false,
  updateStatus: () => {},
});

export function BillingProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<BillingStatus>('active');
  const isReadOnly = status === 'suspended';

  const updateStatus = useCallback((newStatus: BillingStatus) => {
    setStatus(newStatus);
  }, []);

  return (
    <BillingContext.Provider value={{ status, isReadOnly, updateStatus }}>
      {children}
    </BillingContext.Provider>
  );
}

export function useBilling() {
  return useContext(BillingContext);
}

interface BannerConfig {
  bg: string;
  border: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
  message: string;
}

const BANNER_CONFIGS: Record<BillingStatus, BannerConfig | null> = {
  active: null,
  suspended: {
    bg: '#fff5f5',
    border: '#fecaca',
    textColor: '#991b1b',
    badgeBg: '#fee2e2',
    badgeText: '#991b1b',
    message:
      'Your subscription is suspended. Workspace is in read-only mode. Please renew to restore full access.',
  },
  grace_period: {
    bg: '#fffbeb',
    border: '#fde68a',
    textColor: '#92400e',
    badgeBg: '#fef9c3',
    badgeText: '#92400e',
    message:
      'Your subscription payment is overdue. You are in a grace period — please renew soon to avoid service interruption.',
  },
  unknown: {
    bg: '#f9fafb',
    border: '#e5e7eb',
    textColor: '#374151',
    badgeBg: '#f3f4f6',
    badgeText: '#374151',
    message: 'Unable to verify subscription status. Some features may be limited.',
  },
};

export function BillingStatusBanner() {
  const { status, isReadOnly } = useBilling();
  const config = BANNER_CONFIGS[status];
  if (!config) return null;

  return (
    <div
      role="alert"
      style={{
        borderBottom: `1px solid ${config.border}`,
        background: config.bg,
        padding: '10px 16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg
          aria-hidden="true"
          style={{ height: 20, width: 20, flexShrink: 0, color: config.textColor }}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 500, color: config.textColor, flex: 1 }}>
          {config.message}
        </span>
        {isReadOnly && (
          <span
            style={{
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 9999,
              background: config.badgeBg,
              padding: '2px 10px',
              fontSize: 11,
              fontWeight: 600,
              color: config.badgeText,
              flexShrink: 0,
            }}
          >
            Read-Only Mode
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * HOC/wrapper that disables children when workspace is read-only
 */
export function ReadOnlyGuard({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { isReadOnly } = useBilling();

  if (isReadOnly) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div
        style={{ pointerEvents: 'none', opacity: 0.5 }}
        title="Workspace is in read-only mode"
      >
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
