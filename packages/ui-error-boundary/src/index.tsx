/**
 * @webwaka/ui-error-boundary
 *
 * BUG-009 fix: Provides a shared React ErrorBoundary that catches unhandled render
 * errors across all WebWaka React apps (workspace-app, etc.). Without this, any
 * uncaught render-time exception crashes the entire React tree and displays a blank
 * white screen with no actionable user message.
 *
 * Usage — wrap your root <App /> in main.tsx:
 *   import { RootErrorBoundary } from '@webwaka/ui-error-boundary';
 *   <RootErrorBoundary><App /></RootErrorBoundary>
 *
 * Behaviour:
 *   - Catches any Error thrown by a child component during render, lifecycle, or
 *     constructor phase.
 *   - Logs the error to console.error with structured JSON for Cloudflare Logpush.
 *   - Renders a user-friendly fallback with a "Reload" button.
 *   - Does NOT swallow errors in development — the overlay still appears.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RootErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(
      JSON.stringify({
        level: 'error',
        event: 'react_render_error',
        message: error.message,
        stack: error.stack ?? null,
        componentStack: info.componentStack ?? null,
        ts: new Date().toISOString(),
      }),
    );
  }

  handleReload = (): void => {
    window.location.reload();
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div
          role="alert"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            fontFamily: 'system-ui, sans-serif',
            padding: '2rem',
            background: '#f9fafb',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem', textAlign: 'center', maxWidth: '30rem' }}>
            An unexpected error occurred. Our team has been notified. Please reload the page
            or contact support if the problem persists.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: '0.625rem 1.5rem',
              background: '#16a34a',
              color: '#fff',
              border: 'none',
              borderRadius: '0.375rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Reload page
          </button>
          {import.meta.env?.DEV && this.state.error && (
            <pre
              style={{
                marginTop: '2rem',
                padding: '1rem',
                background: '#fee2e2',
                borderRadius: '0.375rem',
                color: '#991b1b',
                fontSize: '0.75rem',
                maxWidth: '60rem',
                overflow: 'auto',
                textAlign: 'left',
              }}
            >
              {this.state.error.stack ?? this.state.error.message}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
