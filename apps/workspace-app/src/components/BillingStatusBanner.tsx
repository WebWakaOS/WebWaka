/**
 * Billing Status Banner Component (M-3)
 *
 * Displays a warning/info banner when the workspace subscription is
 * suspended, showing "read-only mode" messaging and disabling write buttons.
 *
 * Reads X-Billing-Status from API responses via BillingContext.
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

/**
 * Banner component shown when workspace is in read-only mode
 */
export function BillingStatusBanner() {
  const { status, isReadOnly } = useBilling();

  if (status === 'active') return null;

  const bannerStyles: Record<BillingStatus, { bg: string; text: string; message: string }> = {
    suspended: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      message: 'Your subscription is suspended. Your workspace is in read-only mode. Please renew to restore full access.',
    },
    grace_period: {
      bg: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-800',
      message: 'Your subscription payment is overdue. You are in a grace period — please renew soon to avoid service interruption.',
    },
    active: { bg: '', text: '', message: '' },
    unknown: {
      bg: 'bg-gray-50 border-gray-200',
      text: 'text-gray-800',
      message: 'Unable to verify subscription status. Some features may be limited.',
    },
  };

  const style = bannerStyles[status] || bannerStyles.unknown;

  return (
    <div className={`border-b px-4 py-3 ${style.bg} ${style.text}`} role="alert">
      <div className="flex items-center gap-2">
        <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span className="text-sm font-medium">{style.message}</span>
        {isReadOnly && (
          <span className="ml-auto inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
            Read-Only Mode
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * HOC/wrapper that disables buttons when workspace is read-only
 */
export function ReadOnlyGuard({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { isReadOnly } = useBilling();

  if (isReadOnly) {
    return fallback ? <>{fallback}</> : (
      <div className="pointer-events-none opacity-50" title="Workspace is in read-only mode">
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
