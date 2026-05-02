/**
 * AIInsightWidget — Wave 3 A7-1
 * packages/design-system
 *
 * Reusable inline AI suggestion card. Renders capability output inline
 * without opening the full chat UI.
 *
 * Accessible: role="status" during loading, role="alert" on error.
 * No context/provider required — fully self-contained.
 */
import React from 'react';

export type AIWidgetVariant = 'info' | 'suggestion' | 'warning';

export interface AIInsightWidgetProps {
  capability: string;
  title: string;
  content?: string;
  loading?: boolean;
  error?: string;
  onDismiss?: () => void;
  onApply?: (content: string) => void;
  onRetry?: () => void;
  variant?: AIWidgetVariant;
  className?: string;
}

const VARIANT_STYLES: Record<AIWidgetVariant, { border: string; icon: string; badge: string }> = {
  suggestion: { border: 'border-blue-200 bg-blue-50',    icon: '✨', badge: 'bg-blue-100 text-blue-700' },
  info:       { border: 'border-indigo-200 bg-indigo-50', icon: 'ℹ️',  badge: 'bg-indigo-100 text-indigo-700' },
  warning:    { border: 'border-amber-200 bg-amber-50',   icon: '⚠️', badge: 'bg-amber-100 text-amber-700' },
};

export const AIInsightWidget: React.FC<AIInsightWidgetProps> = ({
  capability, title, content, loading = false, error,
  onDismiss, onApply, onRetry, variant = 'suggestion', className = '',
}) => {
  const styles = VARIANT_STYLES[variant];

  if (loading) {
    return (
      <div role="status" aria-live="polite" aria-busy="true"
           className={`rounded-xl border p-4 ${styles.border} ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">{styles.icon}</span>
          <span className="font-semibold text-sm text-gray-700">{title}</span>
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-mono ${styles.badge}`}>
            AI · {capability}
          </span>
        </div>
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
          <div className="h-3 bg-gray-200 rounded w-4/6" />
        </div>
        <p className="sr-only">Loading AI suggestion…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className={`rounded-xl border border-red-200 bg-red-50 p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">⚠️</span>
          <span className="font-semibold text-sm text-red-700">{title}</span>
          {onDismiss && (
            <button onClick={onDismiss} aria-label="Dismiss"
                    className="ml-auto text-red-400 hover:text-red-600 text-lg leading-none">×</button>
          )}
        </div>
        <p className="text-sm text-red-600">{error}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-2 text-xs text-red-700 underline hover:no-underline">
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-4 ${styles.border} ${className}`}
         data-capability={capability}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base" aria-hidden="true">{styles.icon}</span>
        <span className="font-semibold text-sm text-gray-800">{title}</span>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-mono ${styles.badge}`}>
          AI · {capability}
        </span>
        {onDismiss && (
          <button onClick={onDismiss} aria-label="Dismiss AI suggestion"
                  className="text-gray-400 hover:text-gray-600 text-lg leading-none ml-1">×</button>
        )}
      </div>

      {content
        ? <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{content}</p>
        : <p className="text-sm text-gray-400 italic">No suggestion available.</p>
      }

      {(onApply || onRetry) && content && (
        <div className="flex gap-2 mt-3">
          {onApply && (
            <button onClick={() => onApply(content)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 transition">
              Apply suggestion
            </button>
          )}
          {onRetry && (
            <button onClick={onRetry} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5">
              Regenerate
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AIInsightWidget;
