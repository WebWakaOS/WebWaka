import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RootErrorBoundary } from '@webwaka/ui-error-boundary';
import './global.css';
import App from './App';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

// BUG-009 fix: Wrap the root in RootErrorBoundary so uncaught render errors display
// a user-friendly recovery UI instead of a blank white screen. Without this, any
// component that throws during render crashes the entire React tree silently.
createRoot(rootEl).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.error('Service worker registration failed:', err);
    });
  });
}
