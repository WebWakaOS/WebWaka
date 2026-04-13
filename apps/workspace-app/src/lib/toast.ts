type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  duration?: number;
}

function show(message: string, type: ToastType, opts: ToastOptions = {}): void {
  const duration = opts.duration ?? (type === 'error' ? 5000 : 3000);
  const existing = document.getElementById('ww-toast-container');
  const container = existing ?? (() => {
    const el = document.createElement('div');
    el.id = 'ww-toast-container';
    el.style.cssText = [
      'position:fixed', 'bottom:80px', 'left:50%', 'transform:translateX(-50%)',
      'z-index:9999', 'display:flex', 'flex-direction:column', 'gap:8px',
      'align-items:center', 'pointer-events:none', 'max-width:90vw',
    ].join(';');
    document.body.appendChild(el);
    return el;
  })();
  const colors: Record<ToastType, string> = {
    success: '#166534',
    error:   '#991b1b',
    info:    '#1e40af',
    warning: '#92400e',
  };
  const toast = document.createElement('div');
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.style.cssText = [
    `background:${colors[type]}`,
    'color:#fff',
    'padding:12px 20px',
    'border-radius:8px',
    'font-size:14px',
    'font-weight:500',
    'box-shadow:0 4px 12px rgba(0,0,0,0.15)',
    'pointer-events:auto',
    'max-width:340px',
    'text-align:center',
    'opacity:0',
    'transition:opacity 0.2s ease',
  ].join(';');
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = '1'; });
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
      if (container.children.length === 0) container.remove();
    }, 200);
  }, duration);
}

export const toast = {
  success: (msg: string, opts?: ToastOptions) => show(msg, 'success', opts),
  error: (msg: string, opts?: ToastOptions) => show(msg, 'error', opts),
  info: (msg: string, opts?: ToastOptions) => show(msg, 'info', opts),
  warning: (msg: string, opts?: ToastOptions) => show(msg, 'warning', opts),
};
